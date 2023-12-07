const configurations = require('../../commons/repository/configurations');
const { processPendingFile } = require('../../file-processor');
const monitoringFolder = require('./monitoring-folder');

async function pendingFolders(connectorName) {
  let folderPath;

  if (connectorName) {
    folderPath = `/data/kafkonnector/${connectorName}/pending`;
    monitoringFolder(folderPath, connectorName, processPendingFile);
  } else {
    const connectors = await configurations.find();

    connectors.forEach((connector) => {
      folderPath = `/data/kafkonnector/${connector.name}/pending`;
      monitoringFolder(folderPath, connector.name, processPendingFile);
    });
  }
}

module.exports = pendingFolders;
