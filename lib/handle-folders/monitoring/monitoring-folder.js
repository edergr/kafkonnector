const chokidar = require('chokidar');
const { config, logger } = require('../../commons');

const options = {
  persistent: true,
  usePolling: true,
  interval: parseInt(config.get("MONITOR_WATCHER_INTERVAL"), 10) || 10000,
  awaitWriteFinish: {
    stabilityThreshold: parseInt(config.get("SAFE_INTERVAL_WITHOUT_HANDLE_FILE"), 10) || 2000,
    pollInterval: parseInt(config.get("POOL_INTERVAL_WHILE_SAFE_INTERVAL_COUNT"), 10) || 1000
  }
};

const monitoringFolder = (folderPathToMonitoring, connectorName, handleFunction) => {
  const watcher = chokidar.watch(folderPathToMonitoring, options);
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
