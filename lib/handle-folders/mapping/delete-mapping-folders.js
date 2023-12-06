const fs = require('fs');
const path = require('path');
const { config, logger } = require('../../commons');

const deleteMappedFolders = (name) => {
  const rootDir = config.get('ROOT_FOLDER');
  const folderPath = path.join(rootDir, name);

  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true });

    logger.info(`Mapped folder deleted for connector: ${name}`);
  }
};

module.exports = deleteMappedFolders;
