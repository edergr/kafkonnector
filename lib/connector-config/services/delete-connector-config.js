const configurations = require('../../commons/repository/configurations');

const deleteConnectorConfig = (connectorName) => configurations.deleteOne({ name: connectorName });

module.exports = deleteConnectorConfig;
