const fs = require('fs');
const { config } = require('../../commons');
const configurations = require('../../commons/repository/configurations');
const createMappedFolders = require('./create-mapping-folders');

const checkMappedFolders = async () => {
  const rootDir = config.get('ROOT_FOLDER');

  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir);
  }

  const configurationsFound = await configurations.find({});

  configurationsFound.forEach(({ name }) => {
    createMappedFolders(name);
  });
};

module.exports = checkMappedFolders;
