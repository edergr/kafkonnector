const { assert } = require('chai');
const Chance = require('chance');
const { nockGetSchemaById, clean: cleanNocks } = require('../../../../test-helpers/nocks');
const SchemaHandler = require('../../../../../lib/commons/kafka/schema');
const DataDecoder = require('../../../../../lib/commons/kafka/schema/decoder');
const DataEncoder = require('../../../../../lib/commons/kafka/schema/encoder');

const hostUrl = 'https://localhost:8081';
const chance = new Chance();
describe('SchemaHandler - unit tests', () => {
  afterEach(() => cleanNocks());
  it('Should get schema using the auth data', async () => {
    const schemaRegistryData = {
      url: hostUrl,
      auth: {
        username: 'foo',
        password: 'bar'
      }
    };
    const schemaId = 1;
    const dataToReturn = {
      schemaType: 'JSON',
      schema: JSON.stringify({
        type: 'string'
      })
    };
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url, schemaRegistryData.auth);
    const result = await schemaHandler.getSchemaById(schemaId);
    assert.deepEqual(result, {
      schemaType: dataToReturn.schemaType,
      schema: JSON.parse(dataToReturn.schema)
    });
  });

  it('Should get schemas on internal cache', async () => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaId = 1;
    const dataToReturn = {
      schemaType: 'JSON',
      schema: JSON.stringify({
        type: 'string'
      })
    };
    const schemaHandler = new SchemaHandler(schemaRegistryData.url, schemaRegistryData.auth);
    const firstNock = nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    await schemaHandler.getSchemaById(schemaId);
    assert.isTrue(firstNock.isDone());
    assert.isOk(schemaHandler._cache.get(schemaId));
    const secondNock = nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const result = await schemaHandler.getSchemaById(schemaId);
    assert.isFalse(secondNock.isDone());
    assert.deepEqual(result, {
      schemaType: dataToReturn.schemaType,
      schema: JSON.parse(dataToReturn.schema)
    });
  });

  it('Should reject errors on parse response data', (done) => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaId = 1;
    const dataToReturn = 'foo';
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 500,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url);
    schemaHandler
      .getSchemaById(schemaId)
      .catch((reason) => {
        assert.instanceOf(reason, Error);
        done();
      });
  });

  it('Should throw an exception when try to encode invalid data struct', (done) => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaId = 1;
    const dataToReturn = {
      schemaType: 'JSON',
      schema: JSON.stringify({
        type: 'string'
      })
    };
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url);
    schemaHandler
      ._encodeData(chance.natural(), schemaId)
      .then(() => done(new Error('Should throw exception')))
      .catch((reason) => {
        assert.strictEqual(reason.message, 'data must be string');
        done();
      });
  });

  it('Should throw an exception when try to decode invalid data struct', (done) => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaId = 1;
    const dataToReturn = {
      schemaType: 'JSON',
      schema: JSON.stringify({
        type: 'object',
        properties: {
          num: {
            type: 'number'
          }
        }
      })
    };
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url);
    const schemaIdBuff = Buffer.alloc(4);
    schemaIdBuff.writeInt32BE(schemaId, 0);
    const message = Buffer.concat([
      Buffer.from([0]),
      schemaIdBuff,
      Buffer.from(JSON.stringify({
        num: chance.natural().toString()
      }))
    ]);
    schemaHandler
      ._decodeBuffer(message, schemaId)
      .then(() => done(new Error('Should throw exception')))
      .catch((reason) => {
        assert.strictEqual(reason.message, 'data/num must be number');
        done();
      });
  });

  it('Should throw an exception when try to encode invalid schema type', (done) => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaType = 'SUNDA';
    const schemaId = 1;
    const dataToReturn = {
      schemaType,
      schema: '{"Abc": "def"}'
    };
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url);
    schemaHandler
      ._encodeData(chance.natural(), schemaId)
      .then(() => done(new Error('Should throw exception')))
      .catch((reason) => {
        assert.strictEqual(reason.message, `SchemaType ${schemaType} not supported`);
        done();
      });
  });

  it('Should throw an exception when try to decode invalid schema type', (done) => {
    const schemaRegistryData = {
      url: hostUrl
    };
    const schemaType = 'SUNDA';
    const schemaId = 1;
    const dataToReturn = {
      schemaType,
      schema: '{"Abc": "def"}'
    };
    nockGetSchemaById({
      ...schemaRegistryData,
      schemaId,
      status: 200,
      dataToReturn
    });
    const schemaHandler = new SchemaHandler(schemaRegistryData.url);
    const schemaIdBuff = Buffer.alloc(4);
    schemaIdBuff.writeInt32BE(schemaId, 0);
    const message = Buffer.concat([
      Buffer.from([0]),
      schemaIdBuff,
      Buffer.from(JSON.stringify({
        num: chance.natural().toString()
      }))
    ]);
    schemaHandler
      ._decodeBuffer(message, schemaId)
      .then(() => done(new Error('Should throw exception')))
      .catch((reason) => {
        assert.strictEqual(reason.message, `SchemaType ${schemaType} not supported`);
        done();
      });
  });

  describe('DataDecoder buffer parser', () => {
    const integerData = chance.natural({
      max: 900
    });
    const numberData = chance.floating({
      max: 900
    });
    const integer = Buffer.alloc(4);
    integer.writeInt32BE(integerData);
    const number = Buffer.alloc(8);
    number.writeDoubleBE(numberData);
    const stringData = chance.string();
    const strBuff = Buffer.from(stringData);
    const strBuffCompatibility = Buffer.from(JSON.stringify(`compatibylity-${stringData}`));
    const arrayData = [chance.natural(), chance.string(), chance.bool()];
    const testCases = [{
      dataBuff: strBuff,
      schema: {
        type: 'string'
      },
      schemaType: 'JSON',
      expectedValue: stringData
    }, {
      dataBuff: integer,
      schema: {
        type: 'integer'
      },
      schemaType: 'JSON',
      expectedValue: integerData
    }, {
      dataBuff: number,
      schema: {
        type: 'number'
      },
      schemaType: 'JSON',
      expectedValue: numberData
    }, {
      dataBuff: strBuffCompatibility,
      schema: {
        type: 'string'
      },
      schemaType: 'JSON',
      expectedValue: `compatibylity-${stringData}`
    }, {
      dataBuff: Buffer.from(JSON.stringify(arrayData)),
      schema: {
        type: 'array'
      },
      schemaType: 'JSON',
      expectedValue: arrayData
    }];
    testCases.forEach((testCase) => {
      const {
        only,
        dataBuff,
        schema,
        schemaType,
        expectedValue
      } = testCase;
      const testFn = only ? it.only : it;
      testFn(`Should decode and validate data with schema type ${schema.type}`, () => {
        const dataDecoder = new DataDecoder();
        const result = dataDecoder.getDecoder(schemaType)(schema, dataBuff);
        assert.deepEqual(result, expectedValue);
      });
    });

    describe('Compatibility with old encoder', () => {
      it('Should handle strings that starts and ends with char "', () => {
        const str = chance.string({
          length: 12
        });
        const dataDecoder = new DataDecoder();
        const result = dataDecoder.getDecoder('JSON')({
          type: 'string'
        }, Buffer.from(`"${str}"`));
        assert.strictEqual(result, str);
      });
    });
  });

  describe('DataEncoder buffer parser', () => {
    const integer = chance.natural({
      max: 900
    });
    const decimal = chance.floating({
      max: 900
    });
    const integerBuff = Buffer.alloc(4);
    integerBuff.writeInt32BE(integer);
    const decimalBuff = Buffer.alloc(8);
    decimalBuff.writeDoubleBE(decimal);
    const str = chance.string();
    const strBuff = Buffer.from(str);
    const arrayData = [chance.natural(), chance.string(), chance.bool()];
    const dataBuff = Buffer.from(JSON.stringify(arrayData));
    const testCases = [{
      data: str,
      schema: {
        type: 'string'
      },
      schemaType: 'JSON',
      expectedValue: strBuff
    }, {
      data: integer,
      schema: {
        type: 'integer'
      },
      schemaType: 'JSON',
      expectedValue: integerBuff
    }, {
      data: decimal,
      schema: {
        type: 'number'
      },
      schemaType: 'JSON',
      expectedValue: decimalBuff
    }, {
      data: arrayData,
      schema: {
        type: 'array'
      },
      schemaType: 'JSON',
      expectedValue: dataBuff
    }];
    testCases.forEach((testCase) => {
      const {
        only,
        data,
        schema,
        schemaType,
        expectedValue
      } = testCase;
      const testFn = only ? it.only : it;
      testFn(`Should validate and encode data with schema type ${schema.type}`, () => {
        const dataEncoder = new DataEncoder();
        const result = dataEncoder.getEncoder(schemaType)(schema, data);
        assert.deepEqual(result, expectedValue);
      });
    });
  });
});
