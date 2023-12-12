const chokidar = require('chokidar');
const { logger } = require('../../commons');

const monitoringFolder = (folderPathToMonitoring, connectorName, handleFunction) => {
  const watcher = chokidar.watch(folderPathToMonitoring, { persistent: true });
  logger.info(`Folder monitored: ${folderPathToMonitoring}`);

  watcher.on('add', (filePath) => {
    logger.info(`New file detected: ${filePath}`);
    handleFunction(filePath, connectorName);
  });

  watcher.on('error', (erro) => {
    logger.error(`Monitoring error: ${erro}`);
  });

  watcher.on('close', () => {
    logger.info('Monitoring finished.');
  });
};

module.exports = monitoringFolder;
