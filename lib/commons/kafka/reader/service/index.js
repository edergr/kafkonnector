const logger = require('../../../logger');
const SchemaHandler = require('../../schema');

class KafkaReaderService {
  constructor(readerInstance, consumerConfig, schemaRegistry, topicNames) {
    this._ready = false;
    this._readerInstance = readerInstance;
    this._topicNames = topicNames;
    this._validateTopicName();

    this._setFromBeginning(consumerConfig);
    this._setConsumerRunConfig(consumerConfig);
    this._setSchemaHandler(schemaRegistry);
  }

  _validateTopicName() {
    if (!this._topicNames) {
      const message = 'topicName is required';

      logger.error(message);
      throw new Error(message);
    }
  }

  _setFromBeginning(consumerConfig) {
    const { fromBeginning } = consumerConfig;
    this._fromBeginning = fromBeginning;
  }

  _setSchemaHandler(schemaRegistry) {
    if (!schemaRegistry) return;

    const { url, auth } = schemaRegistry;
    this._schemaHandler = new SchemaHandler(url, auth);
  }

  _setConsumerRunConfig(consumerConfig) {
    this._runConfig = {};
    ['autoCommitThreshold', 'autoCommitInterval'].forEach((key) => {
      if (consumerConfig[key]) {
        this._runConfig[key] = consumerConfig[key];
      }
    });
  }

  async connect() {
    await this._connectToKafka();
    await this._subscribeToTopics();
  }

  async _connectToKafka() {
    await this._readerInstance.connect();
    logger.info('[KAFKA] - Consumer connected on topic %s', this._topicNames);
  }

  async _subscribeToTopics() {
    const topics = this._topicNames.split(';');

    for (let index = 0; index < topics.length; index++) {
      const topic = topics[index];
      const fromBeginning = this._fromBeginning;

      await this._readerInstance.subscribe({ topic, fromBeginning });
      logger.info('[KAFKA] - Consumer subscribed to topic %s', topic);
    }

    this._ready = true;
  }

  startConsume(handler) {
    if (!this._ready) throw new Error('Consumer is not connected');

    return this._runConsumer(handler);
  }

  _runConsumer(handler) {
    return this._readerInstance.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const decodedMessage = await this._decodeMessage(message);
          const messageToHandler = {
            partition,
            topic,
            ...decodedMessage
          };
          await handler(messageToHandler);
        } catch (e) {
          logger.error(
            'Error on handle the message offset %s, partition %s, topic %s. Detail: %s',
            message.offset,
            partition,
            topic,
            JSON.stringify(e, ['message', 'stack'])
          );
        }
      },
      autoCommitThreshold: 1,
      ...this._runConfig,
    });
  }

  async _decodeMessage(message) {
    const { key, value } = message;
    const originalMessage = { ...message };
    let decodedMessage = {};

    if (this._schemaHandler) {
      decodedMessage = await this._schemaHandler.decode(value, key);
    } else {
      decodedMessage = KafkaReaderService._decodeUtf8Message(key, value);
    }

    return Object.assign(originalMessage, decodedMessage);
  }

  static _decodeUtf8Message(key, value) {
    return {
      key: key && key.toString('utf8'),
      value: value && value.toString('utf8'),
    };
  }

  async disconnect() {
    await this._readerInstance.disconnect();
    this._ready = false;
    logger.info('[KAFKA] - Consumer disconnected from topic %s', this._topicNames);
  }

  async stopConsume() {
    await this._readerInstance.stop();
    logger.info('[KAFKA] - Consumer stopped');
  }
}

const readerServiceFactory = (
  readerInstance, consumerConfig, schemaRegistry, topicName
) => new KafkaReaderService(
  readerInstance, consumerConfig, schemaRegistry, topicName
);
module.exports = readerServiceFactory;
