const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { healthStatusRoutes } = require('../health-status');
const { config } = require('../commons');
const pkg = require('../../package.json');

const server = (() => {
  const router = new express.Router();
  const app = express();
  const env = process.env.NODE_ENV;
  let serverProcess;

  const defineRoutes = () => {
    healthStatusRoutes(router);
  };

  const defineConfig = () => {
    app.set('port', config.get('PORT'));
    app.use(cors());
    app.use(express.json());
    app.use(helmet());
    app.use('/', router);
  };

  defineRoutes();
  defineConfig();

  const start = () => new Promise((resolve) => {
    serverProcess = app.listen(app.get('port'), () => {
      console.log('------------------------------------------------------------------');
      console.log(`${pkg.name} - Version: ${pkg.version}`);
      console.log('------------------------------------------------------------------');
      console.log(`ATTENTION, ${env} ENVIRONMENT!`);
      console.log('------------------------------------------------------------------');
      console.log(`Express server listening on port: ${serverProcess.address().port}`);
      console.log('------------------------------------------------------------------');

      return resolve(app);
    });
  });

  const stop = () => new Promise((resolve, reject) => {
    if (serverProcess) {
      serverProcess.close((err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    }
  });

  return {
    start,
    stop
  };
})();

module.exports = server;
