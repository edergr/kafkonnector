const pkg = require('./package.json');
const server = require('./lib/server');
const { database, logger } = require('./lib/commons');
const wathcers = require('./lib/streams/watcher');
const { checkMappedFolders } = require('./lib/handle-folders/mapping');
const monitoring = require('./lib/handle-folders/monitoring');
const kafkaManager = require('./lib/streams/kafka/manager');

process.title = pkg.name;

const shutdown = async () => {
  await kafkaManager.disconnect();
  await database.close();
  await server.stop();
  process.exit(0);
};

const startProcedures = async () => {
  wathcers.watchCreatedConnectors();
  await checkMappedFolders();
  await monitoring.pendingFolders();
  await monitoring.retryFolders();
}

process.on('SIGTERM', shutdown)
  .on('SIGINT', shutdown)
  .on('SIGHUP', shutdown)
  .on('uncaughtException', (err) => {
    logger.error('uncaughtException caught the error: ', err);
    throw err;
  })
  .on('unhandledRejection', (err, promise) => {
    logger.error(`Unhandled Rejection at: Promise ${promise} reason: ${err}`);
    throw err;
  })
  .on('exit', (code) => {
    logger.info(`Node process exit with code: ${code}`);
  });

(async () => {
  try {
    await server.start();
    await database.connect();
    await kafkaManager.connect();
    await startProcedures();
  } catch (err) {
    logger.error('Initialization failed', err);
    throw err;
  }
  logger.info('Initialized successfully');
})();
