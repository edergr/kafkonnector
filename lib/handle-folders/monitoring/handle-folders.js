const { config } = require('../../commons');
const connectorService = require('../../connector-config/services');
const monitoringFolder = require('./monitoring-folder');

async function handleFolders(connectorName, folderType, processFunction) {
  let folderPath;

  if (connectorName) {
    folderPath = `${config.get("ROOT_FOLDER")}/${connectorName}/${folderType}`;
    monitoringFolder(folderPath, connectorName, processFunction);
  } else {
    const connectorsNames = await connectorService.getConnectorsNames();

    connectorsNames.forEach((name) => {
      folderPath = `${config.get("ROOT_FOLDER")}/${name}/${folderType}`;
      monitoringFolder(folderPath, name, processFunction);
    });
  }
}

module.exports = handleFolders;