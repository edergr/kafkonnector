const fs = require('fs');
const path = require('path');
const { config, logger } = require('../../commons');

const createMappedFolders = async (name) => {
  const rootDir = config.get('ROOT_FOLDER');
  const folderPath = path.join(rootDir, name);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);

    ['pending', 'processed', 'retry'].forEach((subfolder) => {
      const subfolderPath = path.join(folderPath, subfolder);
      fs.mkdirSync(subfolderPath);
    });

    logger.info(`Mapped folder created for connector: ${name}`);
  }
};

module.exports = createMappedFolders;
