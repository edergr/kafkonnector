const configurations = require('../../commons/repository/configurations');
const { processRetryFile } = require('../../file-processor');
const monitoringFolder = require('./monitoring-folder');

async function retryFolders(connectorName) {
  let folderPath;

  if (connectorName) {
    folderPath = `/data/kafkonnector/${connectorName}/retry`;
    monitoringFolder(folderPath, connectorName, processRetryFile);
  } else {
    const connectors = await configurations.find();

    connectors.forEach((connector) => {
      folderPath = `/data/kafkonnector/${connector.name}/retry`;
      monitoringFolder(folderPath, connector.name, processRetryFile);
    });
  }
}

module.exports = retryFolders;
