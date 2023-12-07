const avsc = require('avsc');
const Ajv = require('ajv');
const ajvFormats = require('ajv-formats');

class DataDecoderMap {
  constructor() {
    const jsonSchemaTypeParserMap = new Map([
      ['object', (payloadBuff) => JSON.parse(payloadBuff.toString())],
      ['array', (payloadBuff) => JSON.parse(payloadBuff.toString())],
      ['string', (payloadBuff) => {
        const str = payloadBuff.toString();
        if (str.length > 3 && str.startsWith('"') && str.endsWith('"')) {
          return str.substring(1, str.length - 1);
        }
        return str;
      }],
      ['integer', (payloadBuff) => payloadBuff.readInt32BE(0)],
      ['number', (payloadBuff) => payloadBuff.readDoubleBE(0)]
    ]);
    this._decoders = new Map();
    this._ajv = new Ajv({
      allErrors: true
    });
    ajvFormats(this._ajv);
    this._decoders.set('AVRO', (schema, payloadBuff) => {
      const type = avsc.Type.forSchema(schema);
      return type.fromBuffer(payloadBuff);
    });
    this._decoders.set('JSON', (schema, payloadBuff) => {
      const dataParser = jsonSchemaTypeParserMap.get(schema.type);
      if (!dataParser) {
        throw new Error(`Could not find data parser: ${schema.type}`);
      }
      const data = dataParser(payloadBuff);
      const valid = this._ajv.validate(schema, data);
      if (!valid) {
        throw new Error(this._ajv.errorsText());
      }
      return data;
    });
  }

  getDecoder(type) {
    return this._decoders.get(type);
  }
}
module.exports = DataDecoderMap;
