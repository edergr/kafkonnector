const configurations = require('../../commons/repository/configurations');

const removeConnectorConfig = (connectorName) => configurations.deleteOne({ name: connectorName });

module.exports = removeConnectorConfig;
