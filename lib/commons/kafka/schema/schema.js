const http = require('http');
const https = require('https');
const config = require('../conf');
const DataEncoder = require('./encoder');
const DataDecoder = require('./decoder');

class SchemaHandler {
  constructor(url, auth = null) {
    const urlData = new URL(url);
    this._protocol = urlData.protocol.startsWith('https') ? https : http;
    this._pathPrefix = urlData.path || '';
    this._requestOpts = {
      host: urlData.hostname,
      port: urlData.port,
    };
    if (auth) {
      this._requestOpts.auth = `${auth.username}:${auth.password}`;
    }
    this._cache = new Map();
    this._dataEncoder = new DataEncoder();
    this._dataDecoder = new DataDecoder();
  }

  async getSchemaById(schemaId) {
    if (this._cache.has(schemaId)) {
      return Promise.resolve(this._cache.get(schemaId));
    }
    return new Promise((resolve, reject) => {
      const opts = {
        ...this._requestOpts,
        path: `${this._pathPrefix}/schemas/ids/${schemaId}`
      };
      const req = this._protocol.request(opts, (res) => {
        const respData = [];
        res
          .on('data', (chunk) => {
            respData.push(...chunk);
          })
          .on('end', () => {
            try {
              const body = JSON.parse(Buffer.from(respData).toString());
              if (res.statusCode !== 200) {
                return reject(new Error(`Error on get schema by id. Id: ${schemaId}. Code ${
                  body.error_code}. Message: ${body.message}`));
              }
              const resSchema = {
                schemaType: body.schemaType || 'AVRO',
                schema: JSON.parse(body.schema)
              };
              this._cache.set(schemaId, resSchema);
              resolve(resSchema);
            } catch (e) {
              reject(e);
            }
          })
          .on('error', reject);
      });
      req.on('error', reject);
      req.end();
    });
  }

  async _decodeBuffer(buff) {
    const magicByte = buff.slice(0, 1);
    if (Buffer.from([0]).compare(magicByte) !== 0) {
      throw new Error('Invalid magic byte');
    }
    const schemaId = buff.slice(1, 5).readInt32BE(0);
    const payloadBuff = buff.slice(5);
    const { schemaType, schema } = await this.getSchemaById(schemaId);
    const decoder = this._dataDecoder.getDecoder(schemaType);
    if (!decoder) {
      throw new Error(`SchemaType ${schemaType} not supported`);
    }
    return decoder(schema, payloadBuff);
  }

  decode(value, key) {
    const decodedKeyTask = key ? this._decodeBuffer(key) : Promise.resolve(null);
    const decodedValueTask = this._decodeBuffer(value);
    return Promise
      .all([decodedKeyTask, decodedValueTask])
      .then(([decodedKey, decodedValue]) => ({
        key: decodedKey,
        value: decodedValue
      }));
  }

  async _encodeData(data, schemaId) {
    const { schemaType, schema } = await this.getSchemaById(schemaId);
    const magicByte = Buffer.from([0]);
    const bufferSchemaId = Buffer.alloc(4);
    bufferSchemaId.writeInt32BE(schemaId, 0);
    const encoder = this._dataEncoder.getEncoder(schemaType);
    if (!encoder) {
      throw new Error(`SchemaType ${schemaType} not supported`);
    }
    const payloadBuff = encoder(schema, data);
    return Buffer.concat([magicByte, bufferSchemaId, payloadBuff]);
  }

  encode(value, valueSchemaId, key, keySchemaId) {
    const encodedKeyTask = key
      ? this._encodeData(key, keySchemaId || config.GLOBAL_KEY_ID)
      : Promise.resolve(null);
    const encodedValueTask = this._encodeData(value, valueSchemaId);
    return Promise.all([encodedKeyTask, encodedValueTask]);
  }
}

module.exports = SchemaHandler;
