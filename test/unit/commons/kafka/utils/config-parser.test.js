const { assert } = require('chai');
const Chance = require('chance');
const KafkaConfigParser = require('../../../../../lib/commons/kafka/utils');

const chance = new Chance();
describe('Unit kafkaConfigParser tests ', () => {
  it('Should convert client.id to clientId', () => {
    const kafkaConfig = new KafkaConfigParser(
      {
        'client.id': 'teste'
      },
      {
        KAFKA_CONNECT: { 'client.id': 'foo' }
      }
    );
    const connectionData = kafkaConfig.getConfig('KAFKA_CONNECT');
    assert.strictEqual(connectionData.clientId, 'teste');
  });

  it('Should convert connection.timeout to clientId', () => {
    const kafkaConfig = new KafkaConfigParser(
      {
        'connection.timeout': 200
      },
      {
        KAFKA_CONNECT: { 'client.id': 'foo' }
      }
    );
    const connectionData = kafkaConfig.getConfig('KAFKA_CONNECT');
    assert.strictEqual(connectionData.connectionTimeout, 200);
  });

  it('Should convert security.protocol', () => {
    const kafkaConfig = new KafkaConfigParser(
      {
        'security.protocol': 'SASL_SSL',
        'sasl.username': 'teste',
        'sasl.password': '123'
      },
      { KAFKA_CONNECT: {} }
    );
    const connectionData = kafkaConfig.getConfig('KAFKA_CONNECT');
    assert.strictEqual(connectionData.ssl, true);
  });

  it('Should not convert with invalid security.protocol', () => {
    const kafkaConfig = new KafkaConfigParser(
      {
        'security.protocol': 'SASL_invalid',
        'sasl.username': 'teste',
        'sasl.password': '123',
        'client.id': 'foo'
      },
      { KAFKA_CONNECT: {} }
    );
    const connectionData = kafkaConfig.getConfig('KAFKA_CONNECT');
    assert.strictEqual(connectionData.clientId, 'foo');
    assert.isUndefined(connectionData.ssl);
  });

  it('Should persist the same config key if no handler was found', () => {
    const kafkaConfig = new KafkaConfigParser(
      {
        parameterWithNoHandler: true,
        'client.id': 'foo'
      },
      { KAFKA_CONNECT: {} }
    );

    const connectionData = kafkaConfig.getConfig('KAFKA_CONNECT');

    assert.isDefined(connectionData.parameterWithNoHandler);
    assert.isTrue(connectionData.parameterWithNoHandler);
  });

  describe('Handling KAFKA_CONSUMER configs', () => {
    it('Should parse consumer session timeout, heartbeat and commit configs', () => {
      const config = {
        'group.id': 'foo',
        'session.timeout.ms': chance.natural(),
        'heartbeat.interval.ms': chance.natural(),
        'auto.commit.interval.ms': chance.natural(),
        'auto.commit.threshold': chance.natural()
      };
      const kafkaConfig = new KafkaConfigParser(config, {
        KAFKA_CONSUMER: {}
      });
      const connectionData = kafkaConfig.getConfig('KAFKA_CONSUMER');
      assert.strictEqual(connectionData.groupId, 'foo');
      assert.strictEqual(connectionData.sessionTimeout, config['session.timeout.ms']);
      assert.strictEqual(connectionData.heartbeatInterval, config['heartbeat.interval.ms']);
      assert.strictEqual(connectionData.autoCommitInterval, config['auto.commit.interval.ms']);
      assert.strictEqual(connectionData.autoCommitThreshold, config['auto.commit.threshold']);
    });
  });
});
