const writerServiceFactory = require('../writer/service');

class WriterFactory {
  static getRequiredParams() {
    return ['client.id', 'bootstrap.servers'];
  }

  static getInstance(kafka, configParser, schemaRegistry) {
    const producerConfig = configParser.getConfig('KAFKA_PRODUCER');
    const producer = kafka.producer(producerConfig);

    return writerServiceFactory(producer, producerConfig, schemaRegistry);
  }
}

module.exports = WriterFactory;
