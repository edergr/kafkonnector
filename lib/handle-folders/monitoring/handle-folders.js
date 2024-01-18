const configurations = require('../../commons/repository/configurations');
const monitoringFolder = require('./monitoring-folder');

async function handleFolders(connectorName, folderType, processFunction) {
  let folderPath;

  if (connectorName) {
    folderPath = `/data/kafkonnector/${connectorName}/${folderType}`;
    monitoringFolder(folderPath, connectorName, processFunction);
  } else {
    const connectors = await configurations.find();

    connectors.forEach((connector) => {
      folderPath = `/data/kafkonnector/${connector.name}/${folderType}`;
      monitoringFolder(folderPath, connector.name, processFunction);
    });
  }
}

module.exports = handleFolders;