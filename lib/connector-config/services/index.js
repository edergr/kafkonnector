const getConnectorConfig = require('./get-connector-config');
const getConnectorsNames = require('./get-connectors-names');
const postConnectorConfig = require('./post-connector-config');
const removeConnectorConfig = require('./remove-connector-config');

module.exports = {
  getConnectorConfig,
  getConnectorsNames,
  removeConnectorConfig,
  postConnectorConfig
};
