const connectionHandlers = new Map([
  [
    'client.id',
    (data, confTargetObj) => {
      confTargetObj.clientId = data;
    }
  ],
  [
    'bootstrap.servers',
    (data, confTargetObj) => {
      confTargetObj.brokers = data.split(',');
    }
  ],
  [
    'request.timeout',
    (data, confTargetObj) => {
      confTargetObj.requestTimeout = data;
    }
  ],
  [
    'connection.timeout',
    (data, confTargetObj) => {
      confTargetObj.connectionTimeout = data;
    }
  ],
  [
    'security.protocol',
    (data, confTargetObj, confSourceObj) => {
      if (data === 'SASL_SSL') {
        confTargetObj.ssl = true;
        confTargetObj.sasl = {
          mechanism: 'plain',
          username: confSourceObj['sasl.username'],
          password: confSourceObj['sasl.password']
        };
      }
    }
  ]
]);

const producerHandlers = new Map();

const consumerHandlers = new Map([
  [
    'group.id',
    (data, confTargetObj) => {
      confTargetObj.groupId = data;
    }
  ],
  [
    'from.beginning',
    (data, confTargetObj) => {
      confTargetObj.fromBeginning = data;
    }
  ],
  [
    'auto.commit',
    (data, confTargetObj) => {
      confTargetObj.autoCommit = data;
    }
  ],
  [
    'max.bytes',
    (data, confTargetObj) => {
      confTargetObj.maxBytes = data;
    }
  ],
  [
    'session.timeout.ms',
    (data, confTargetObj) => {
      confTargetObj.sessionTimeout = data;
    }
  ],
  [
    'heartbeat.interval.ms',
    (data, confTargetObj) => {
      confTargetObj.heartbeatInterval = data;
    }
  ],
  [
    'auto.commit.interval.ms',
    (data, confTargetObj) => {
      confTargetObj.autoCommitInterval = data;
    }
  ],
  [
    'auto.commit.threshold',
    (data, confTargetObj) => {
      confTargetObj.autoCommitThreshold = data;
    }
  ]
]);

const configHandlers = {
  KAFKA_CONNECT: connectionHandlers,
  KAFKA_PRODUCER: producerHandlers,
  KAFKA_CONSUMER: consumerHandlers
};

class KafkaJsConfigParser {
  constructor(kafkaConfig, defaultConfig) {
    this._kafkaConfig = kafkaConfig;
    this._defaultConfig = defaultConfig;
  }

  getConfig(configType) {
    const configHandler = configHandlers[configType];

    const providedConfig = this.parseClientConfig(this._kafkaConfig, configHandler);
    const defaultConfig = this.parseClientConfig(this._defaultConfig[configType], configHandler);

    return { ...defaultConfig, ...providedConfig };
  }

  parseClientConfig(config, configHandler) {
    return Object.entries(config).reduce((resultingConfig, [configKey, configValue]) => {
      const handler = configHandler.get(configKey);

      if (handler) {
        handler(configValue, resultingConfig, this._kafkaConfig);
      } else {
        resultingConfig[configKey] = configValue;
      }

      return resultingConfig;
    }, {});
  }
}

module.exports = KafkaJsConfigParser;
