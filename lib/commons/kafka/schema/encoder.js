const avsc = require('avsc');
const Ajv = require('ajv');
const ajvFormats = require('ajv-formats');

class DataEncoder {
  constructor() {
    const jsonSchemaTypeParserMap = new Map([
      ['object', (data) => Buffer.from(JSON.stringify(data))],
      ['array', (data) => Buffer.from(JSON.stringify(data))],
      ['string', (data) => Buffer.from(data)],
      ['integer', (data) => {
        const integerBuff = Buffer.alloc(4);
        integerBuff.writeInt32BE(data);
        return integerBuff;
      }],
      ['number', (data) => {
        const decimalBuff = Buffer.alloc(8);
        decimalBuff.writeDoubleBE(data);
        return decimalBuff;
      }]
    ]);
    this._encoders = new Map();
    this._ajv = new Ajv({
      allErrors: true
    });
    ajvFormats(this._ajv);
    this._encoders.set('AVRO', (schema, data) => {
      const type = avsc.Type.forSchema(schema);
      return type.toBuffer(data);
    });
    this._encoders.set('JSON', (schema, data) => {
      const valid = this._ajv.validate(schema, data);
      if (!valid) {
        throw new Error(this._ajv.errorsText());
      }
      const encoder = jsonSchemaTypeParserMap.get(schema.type);
      if (!encoder) {
        throw new Error(`Could not find encoder type: ${schema.type}`);
      }
      return encoder(data);
    });
  }

  getEncoder(type) {
    return this._encoders.get(type);
  }
}
module.exports = DataEncoder;
