const sinon = require('sinon');
const { assert } = require('chai');
const { streams } = require('../../../../lib/commons/kafka');

describe('Unit kafka consumer', () => {
  it('Create success instance with schemaRegistry', () => {
    const instance = new streams.Reader(
      'topic-name',
      {
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'sunda',
        'group.id': 'sunda'
      },
      { url: 'http://localhost:8081' }
    );

    assert.isDefined(instance._readerService);
    assert.isDefined(instance._readerService._schemaHandler);
    assert.isFalse(instance._readerService._ready);
  });

  it('Start consume without connect', async () => {
    const handlerSpy = sinon.spy();
    const reader = new streams.Reader('sunda', {
      'bootstrap.servers': 'localhost:9092',
      'client.id': 'sunda',
      'group.id': 'sunda'
    });

    let errorMessage;

    try {
      await reader.startConsume(handlerSpy);
    } catch (e) {
      errorMessage = e.message;
    } finally {
      assert.strictEqual(errorMessage, 'Consumer is not connected');
    }
  });

  it('Validation required topicName field', () => {
    const connectConfig = {
      'group.id': 'foo',
      'client.id': 'bar',
      'bootstrap.servers': 'server'
    };

    let instance;
    let errorMessage;

    try {
      instance = new streams.Reader(null, connectConfig);
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'topicName is required');
    }
  });

  it('Validation required kafkaConfig field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Reader('sunda', null);
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'kafkaConfig is required');
    }
  });

  it('Validation required clientId field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Reader('sunda', { 'group.id': 'sunda' });
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'client.id is required');
    }
  });

  it('Validation required groupId field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Reader('sunda', {});
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'group.id is required');
    }
  });

  it('Validation required bootstrapServers field', () => {
    const connectConfig = {
      'group.id': 'foo',
      'client.id': 'bar'
    };

    let instance;
    let errorMessage;

    try {
      instance = new streams.Reader('sunda', connectConfig);
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'bootstrap.servers is required');
    }
  });
});
