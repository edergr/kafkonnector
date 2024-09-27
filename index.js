const pkg = require('./package.json');
const server = require('./lib/server');
const { database, logger } = require('./lib/commons');
const watchers = require('./lib/streams/watcher');
const { checkMappedFolders } = require('./lib/handle-folders/mapping');
const monitoring = require('./lib/handle-folders/monitoring');
const kafkaManager = require('./lib/streams/kafka/manager');

process.title = pkg.name;

const shutdown = async () => {
  await server.stop();
  await kafkaManager.disconnect();
  await database.close();
  process.exit(0);
};

const startProcedures = async () => {
  watchers.watchCreatedConnectors();
  await checkMappedFolders();
  await monitoring.pendingFolders();
  await monitoring.retryFolders();
};

process.on('SIGTERM', shutdown)
  .on('SIGINT', shutdown)
  .on('SIGHUP', shutdown)
  .on('uncaughtException', (err) => {
    logger.error('uncaughtException caught the error: %s', err);
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
    await database.connect();
    await kafkaManager.connect();
    await startProcedures();
    await server.start();
  } catch (err) {
    logger.error('Initialization failed', err);
    throw err;
  }
  logger.info('Initialized successfully');
})();
