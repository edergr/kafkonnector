const readerServiceFactory = require('../reader/service');

class ReaderFactory {
  static getRequiredParams() {
    return ['group.id', 'client.id', 'bootstrap.servers'];
  }

  static getInstance(kafka, configParser, schemaRegistry, topicName) {
    const consumerConfig = configParser.getConfig('KAFKA_CONSUMER');
    const consumer = kafka.consumer(consumerConfig);

    return readerServiceFactory(consumer, consumerConfig, schemaRegistry, topicName);
  }
}

module.exports = ReaderFactory;
