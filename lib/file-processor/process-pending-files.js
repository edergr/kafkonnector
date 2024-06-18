const fs = require('fs');
const readline = require('readline');
const { promisify } = require('util');
const { logger } = require('../commons');
const dataProcessos = require('../data-processor');
const handleFiles = require('../handle-files');

const renameAsync = promisify(fs.rename);

const processPendingFile = async (filePath, connectorName) => {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  const fileName = filePath.split('/').pop();

  try {
    const result = await dataProcessos.processData(rl, connectorName);
    let errorToProcess = '';

    if (result.retry && result.failData && !fileName.startsWith('r_')) {
      handleFiles.createRetryFile(result.failData, connectorName, fileName);
    } else if (result.failData.length) {
      errorToProcess = 'error_';
    }

    const processedFolderPath = filePath.replace(/\/pending\/.*$/, '/processed');
    const processedFilePath = `${processedFolderPath}/${errorToProcess}${Date.now()}_${fileName}`;

    await renameAsync(filePath, processedFilePath);

    logger.info(`Pending file processed and moved to: ${processedFilePath}`);
  } catch (err) {
    logger.error(`Error to process pending file: ${err}`);
  }
};

module.exports = processPendingFile;
