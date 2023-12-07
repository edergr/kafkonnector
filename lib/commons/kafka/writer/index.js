const WriterBase = require('./base');
const WriterFactory = require('../factory/writer');
const apiFactory = require('../factory/api');

class Writer extends WriterBase {
  constructor(config, schemaRegistry) {
    super(config, apiFactory(WriterFactory, schemaRegistry));
  }
}

module.exports = Writer;
