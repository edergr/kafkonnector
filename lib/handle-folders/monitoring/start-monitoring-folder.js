const chokidar = require('chokidar');
const { logger } = require('../../commons');
const configurations = require('../../commons/repository/configurations');
const { processPendingFile } = require('../../file-processor')

const monitoringFolder = (folderPathToMonitoring) => {
  const watcher = chokidar.watch(folderPathToMonitoring, { persistent: true });
  logger.info(`Folder monitored: ${folderPathToMonitoring}`);

  watcher.on('add', filePath => {
    logger.info(`New file detected: ${filePath}`);
    processPendingFile(filePath);
  });

  watcher.on('error', erro => {
    logger.error(`Monitoring error: ${erro}`);
  });

  watcher.on('close', () => {
    logger.info('Monitoring finished.');
  });
};

async function startMonitoringFolder(connectorName) {
  let folderPath;

  if (connectorName) {
    folderPath = `/data/kafkonnector/${connectorName}/pending`;
    monitoringFolder(folderPath);
  } else {
    const connectors = await configurations.find();

    connectors.forEach((connector) => {
      folderPath = `/data/kafkonnector/${connector.name}/pending`;
      monitoringFolder(folderPath);
    });
  }
}

module.exports = startMonitoringFolder;
