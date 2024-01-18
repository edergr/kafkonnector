const handleFolders = require('./handle-folders');
const { processRetryFile } = require('../../file-processor');

async function retryFolders(connectorName) {
  await handleFolders(connectorName, 'retry', processRetryFile);
}

module.exports = retryFolders;