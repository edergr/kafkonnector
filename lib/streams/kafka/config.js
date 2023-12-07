const { config } = require('../../commons');
const { name: packageName } = require('../../../package.json');

const kafkaConfig = {
  'bootstrap.servers': config.get('KAFKA_CONNECT_URL'),
  'sasl.username': config.get('KAFKA_USERNAME'),
  'sasl.password': config.get('KAFKA_PASSWORD'),
  'security.protocol': config.get('KAFKA_SECURITY_PROTOCOL'),
  'sasl.mechanisms': config.get('KAFKA_SECURITY_PROTOCOL'),
  'statistics.interval.ms': 1200000,
  'session.timeout.ms': 10000,
  'heartbeat.interval.ms': 5000,
  'client.id': packageName,
  'group.id': packageName,
  'from.beginning': false,
  connectionTimeout: 45 * 1000,
  authenticationTimeout: 45 * 1000
};


const schemaRegistryConfig = {
  url: config.get('SCHEMA_REGISTRY_URL'),
  auth: {
    username: config.get('SCHEMA_REGISTRY_KEY'),
    password: config.get('SCHEMA_REGISTRY_SECRET')
  }
};

module.exports = { kafkaConfig, schemaRegistryConfig };
