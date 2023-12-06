const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const { logger } = require('../commons');

const renameAsync = promisify(fs.rename);

const processPendingFile = async (filePath) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const payload = [{ topic: 'kafkaTopic', messages: line }];
  }

  const fileName = filePath.split('/').pop();
  const processedFolderPath = filePath.replace(/\/pending\/.*$/, '/processed');
  const processedFilePath = `${processedFolderPath}/${Date.now()}_${fileName}`;

  try {
    await renameAsync(filePath, processedFilePath);
    logger.info(`Processed file moved to: ${processedFilePath}`);
  } catch (err) {
    logger.error(`Error moving processed file to processed folder: ${err}`);
  }
};

module.exports = processPendingFile;
