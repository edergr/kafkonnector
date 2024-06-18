const { assert } = require('chai');
const { CompressionTypes, CompressionCodecs } = require('kafkajs');
const SnappyCodec = require('kafkajs-snappy');
require('../../../../index');

describe('Unit kafkajs config test', () => {
  it('Should define the snappy compression codec', () => {
    assert.isOk(CompressionCodecs[CompressionTypes.Snappy]);
    assert.strictEqual(CompressionCodecs[CompressionTypes.Snappy], SnappyCodec);
  });
});
