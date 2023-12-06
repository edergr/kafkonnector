const fs = require('fs');
const path = require('path');
const { config } = require('../../commons');
const getConnectorsNames = require('../../connector-config/services/get-connectors-names');
const createMappedFolders = require('./create-mapped-folders');

const checkMappedFolders = async () => {
  const rootDir = config.get('ROOT_FOLDER');
  const folderPath = path.join(rootDir, 'kafkonnector');

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const names = await getConnectorsNames();
  names.forEach((name) => {
    createMappedFolders(name);
  });
};

module.exports = checkMappedFolders;
