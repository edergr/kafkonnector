const fs = require('fs');
const { config } = require('../../commons');
const getConnectorsNames = require('../../connector-config/services/get-connectors-names');
const createMappedFolders = require('./create-mapping-folders');

const checkMappedFolders = async () => {
  // TODO REMOVE
  // const rootDir = config.get('ROOT_FOLDER');

  // // if (!fs.existsSync(rootDir)) {
  // //   fs.mkdirSync(rootDir);
  // // }

  const names = await getConnectorsNames();

  names.forEach((name) => {
    createMappedFolders(name);
  });
};

module.exports = checkMappedFolders;
