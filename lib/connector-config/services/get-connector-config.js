const configurations = require('../../commons/repository/configurations');

const getConnectorConfig = (connectorName) => configurations.findOne({ name: connectorName });

module.exports = getConnectorConfig;
