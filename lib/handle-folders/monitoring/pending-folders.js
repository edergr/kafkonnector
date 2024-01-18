const handleFolders = require('./handle-folders');
const { processPendingFile } = require('../../file-processor');

async function pendingFolders(connectorName) {
  await handleFolders(connectorName, 'pending', processPendingFile);
}

module.exports = pendingFolders;