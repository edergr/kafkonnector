const logger = require('../../../logger');
const SchemaHandler = require('../../schema');

class KafkaWriterService {
  constructor(writerInstance, producerConfig, schemaRegistry) {
    this._ready = false;
    this._messagesPerTopic = {};
    this._queue = [];
    this._waiting = false;
    this._writerInstance = writerInstance;
    this._sentHook = null;
    this._messagesToSendCounter = 0;

    this._setProducerConfig(producerConfig);
    this._setSchemaHandler(schemaRegistry);
  }

  isReady() {
    return this._ready;
  }

  _setProducerConfig(producerConfig) {
    const { acks } = producerConfig;
    this._acks = acks;
  }

  _setSchemaHandler(schemaRegistry) {
    if (!schemaRegistry) return;

    const { url, auth } = schemaRegistry;
    this._schemaHandler = new SchemaHandler(url, auth);
  }

  async connect() {
    await this._writerInstance.connect();
    this._ready = true;
    logger.info('[KAFKA] - Producer connected');
  }

  async write(topic, messageValue, messageKey, schema) {
    if (!this._ready) throw new Error('The instance is not ready.');

    this._messagesToSendCounter += 1;
    try {
      const message = {
        key: messageKey,
        value: messageValue
      };
      const encodedMessage = await this._encodeMessage(message, schema);
      const data = await this._writerInstance.send({
        topic,
        messages: [encodedMessage],
        acks: this._acks,
      });
      this._decrementHandledMessageCounter();
      return data[0];
    } catch (e) {
      this._decrementHandledMessageCounter();
      throw e;
    }
  }

  async _encodeMessage(message, schema) {
    if (schema && this._schemaHandler) {
      return this._encodeWithSchemaHandler(message, schema);
    }

    return KafkaWriterService._encodeWithBuffer(message);
  }

  async _encodeWithSchemaHandler(message, schema) {
    const { key: messageKey, value: messageValue } = message;
    const { keyId, valueId } = schema;

    const [key, value] = await this._schemaHandler.encode(messageValue, valueId, messageKey, keyId);
    return { key, value };
  }

  static async _encodeWithBuffer(message) {
    const { key, value } = message;

    return {
      key: (key && Buffer.from(key)) || null,
      value: Buffer.from(value),
    };
  }

  _decrementHandledMessageCounter() {
    this._messagesToSendCounter -= 1;
    if (!this._messagesToSendCounter && this._sentHook) {
      this._sentHook();
      this._sentHook = null;
    }
  }

  async disconnect() {
    this._ready = false;
    if (this._messagesToSendCounter) {
      logger.info('[KAFKA] - Waiting to flush producer');
      await new Promise((resolve) => {
        this._sentHook = resolve;
      });
    }
    await this._writerInstance.disconnect();
    logger.info('[KAFKA] - Producer disconnected');
  }
}

const writerServiceFactory = (
  writerInstance, producerConfig, schemaRegistry
) => new KafkaWriterService(writerInstance, producerConfig, schemaRegistry);

module.exports = writerServiceFactory;
