const { streams } = require('../../commons/kafka');
const { kafkaConfig, schemaRegistryConfig } = require('./config');

const streamWriter = new streams.Writer(
  kafkaConfig,
  schemaRegistryConfig
);

const connect = async () => {
  await streamWriter.connect();
};

const disconnect = async () => {
  await streamWriter.disconnect();
};

module.exports = {
  connect,
  disconnect,
  streamWriter
};
