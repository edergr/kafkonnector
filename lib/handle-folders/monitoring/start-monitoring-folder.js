const chokidar = require('chokidar');
const { logger } = require('../../commons');
const configurations = require('../../commons/repository/configurations');

const monitoringFolder = (folderPathToMonitoring) => {
  const watcher = chokidar.watch(folderPathToMonitoring, { persistent: true });
  logger.info(`Folder monitored: ${folderPathToMonitoring}`);

  watcher.on('add', filePath => {
    logger.info(`Novo arquivo detectado: ${filePath}`);
  });

  watcher.on('error', erro => {
    logger.error(`Erro no monitoramento: ${erro}`);
  });

  watcher.on('close', () => {
    logger.info('Monitoramento encerrado.');
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
