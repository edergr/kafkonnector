const { get, post, remove } = require('./connector-config-controller');

const connectorConfigRoutes = (router) => {
  router.get('/connectors', get);
  router.get('/connectors/:connector/configs', get);
  router.post('/connectors', post);
  router.delete('/connectors/:connector', remove);
};

module.exports = connectorConfigRoutes;
