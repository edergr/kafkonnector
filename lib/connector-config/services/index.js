const getConnectorConfig = require('./get-connector-config');
const getConnectorsNames = require('./get-connectors-names');
const postConnectorConfig = require('./post-connector-config');
const deleteConnectorConfig = require('./delete-connector-config');

module.exports = {
  getConnectorConfig,
  getConnectorsNames,
  deleteConnectorConfig,
  postConnectorConfig
};
