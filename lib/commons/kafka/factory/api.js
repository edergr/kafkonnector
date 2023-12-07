const { Kafka, CompressionTypes, CompressionCodecs } = require('kafkajs');
const SnappyCodec = require('kafkajs-snappy');
const KafkaJsConfigParser = require('../utils');
const logger = require('../../logger');
const conf = require('../conf');

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

class APIFactory {
  static getInstance(factory, schemaRegistry = null, topicName = null) {
    return (config) => APIFactory._createInstance(factory, config, schemaRegistry, topicName);
  }

  static _createInstance(factory, config, schemaRegistry, topicName) {
    APIFactory.validateRequiredConfigParams(factory, config);

    const configParser = new KafkaJsConfigParser(config, conf);
    const kafkaConnectionConfig = configParser.getConfig('KAFKA_CONNECT');

    const kafka = new Kafka(kafkaConnectionConfig);

    return factory.getInstance(kafka, configParser, schemaRegistry, topicName);
  }

  static validateRequiredConfigParams(factory, kafkaConfig) {
    if (!kafkaConfig) this._logErrorAndThrow('kafkaConfig');

    const requiredParams = factory.getRequiredParams();

    requiredParams.forEach((requiredParam) => {
      const param = kafkaConfig[requiredParam];
      if (!param) this._logErrorAndThrow(requiredParam);
    });
  }

  static _logErrorAndThrow(missingParam) {
    const message = `${missingParam} is required`;
    logger.error(message);
    throw new Error(message);
  }
}

module.exports = APIFactory.getInstance;
