const fs = require('fs');
const { promisify } = require('util');
const { logger } = require('../commons');

const renameAsync = promisify(fs.rename);

const processRetryFile = async (filePath) => {
  const fileName = filePath.split('/').pop();
  const processedFolderPath = filePath.replace(/\/retry\/.*$/, '/pending');
  const processingFilePath = `${processedFolderPath}/${fileName}`;

  try {
    await renameAsync(filePath, processingFilePath);

    logger.info('Retry file moved to pending folder to be processed');
  } catch (err) {
    logger.error(`Error to process retry file: ${err}`);
  }
};

module.exports = processRetryFile;
