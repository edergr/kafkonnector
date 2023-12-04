const pkg = require('./package.json');
const server = require('./lib/server');

process.title = pkg.name;

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};

process.on('SIGTERM', shutdown)
  .on('SIGINT', shutdown)
  .on('SIGHUP', shutdown)
  .on('uncaughtException', (err) => {
    console.log('uncaughtException caught the error: ', err);
    throw err;
  })
  .on('unhandledRejection', (err, promise) => {
    console.log(`Unhandled Rejection at: Promise ${promise} reason: ${err}`);
    throw err;
  })
  .on('exit', (code) => {
    console.log(`Node process exit with code: ${code}`);
  });

(async () => {
  try {
    await server.start();
  } catch (err) {
    console.log('Initialization failed', err);
    throw err;
  }
  console.log('Initialized successfully');
})();
