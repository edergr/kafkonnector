const { get, post, remove } = require('./connector-config-controller');
const validateSchema = require('../validation');

const connectorConfigRoutes = (router) => {
  router.get('/connectors', get);
  router.get('/connectors/:connector/configs', get);
  router.post('/connectors', validateSchema.connectorConfig, post);
  router.delete('/connectors/:connector', remove);
};

module.exports = connectorConfigRoutes;
