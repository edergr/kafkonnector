const { name } = require('../../../../package.json');

const defaultConfig = {
  KAFKA_CONNECT_TIMEOUT: 5000,
  GLOBAL_KEY_ID: 100021,
  KAFKA_CONNECT: {
    'client.id': name,
    'bootstrap.servers': ''
  },
  KAFKA_PRODUCER: {
    acks: -1,
    idempotent: true,
    maxInFlightRequests: 4
  },
  KAFKA_CONSUMER: {
    'group.id': name,
    'from.beginning': true,
    'auto.commit': false,
    'max.bytes': 1048576
  }
};

module.exports = defaultConfig;
