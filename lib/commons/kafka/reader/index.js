const ReaderBase = require('./base');
const ReaderFactory = require('../factory/reader');
const apiFactory = require('../factory/api');

class Reader extends ReaderBase {
  constructor(topicName, config, schemaRegistry) {
    super(config, apiFactory(ReaderFactory, schemaRegistry, topicName));
  }
}

module.exports = Reader;
