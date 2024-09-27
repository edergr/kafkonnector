const fs = require('fs');
const { config } = require('../../commons');
const connectorService = require('../../connector-config/services');
const createMappedFolders = require('./create-mapping-folders');

const checkMappedFolders = async () => {
  const rootDir = config.get('ROOT_FOLDER');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir);
  }

  const connectorsNames = await connectorService.getConnectorsNames();

  connectorsNames.forEach((name) => {
    createMappedFolders(name);
  });
};

module.exports = checkMappedFolders;
