const { get } = require('./health-status-controller');

const healthStatusRoutes = (router) => {
  router.get('/health-status', get);
};

module.exports = healthStatusRoutes;
