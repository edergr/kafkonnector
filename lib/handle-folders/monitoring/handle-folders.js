const monitoringFolder = require('./monitoring-folder');
const configurations = require('../../commons/repository/configurations');

async function handleFolders(connectorName, folderType, processFunction) {
  let folderPath;

  if (connectorName) {
    folderPath = `/data/kafkonnector/${connectorName}/${folderType}`;
    monitoringFolder(folderPath, connectorName, processFunction);
  } else {
    const configurationsFound = await configurations.find({});

    configurationsFound.forEach(({ name }) => {
      folderPath = `/data/kafkonnector/${name}/${folderType}`;
      monitoringFolder(folderPath, name, processFunction);
    });
  }
}

module.exports = handleFolders;