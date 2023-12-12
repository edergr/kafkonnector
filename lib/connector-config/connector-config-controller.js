const connectorService = require('./services');
const { deleteMappedFolders } = require('../handle-folders/mapping');

const controller = (() => {
  const get = async (req, res) => {
    const { params: { connector } } = req;

    const connectorData = connector
      ? await connectorService.getConnectorConfig(connector)
      : await connectorService.getConnectorsNames();

    if (connectorData) {
      return res.status(200).send(connectorData);
    }

    return res.sendStatus(204);
  };

  const post = async (req, res) => {
    const { body } = req;

    await connectorService.postConnectorConfig(body);

    res.sendStatus(200);
  };

  const remove = async (req, res) => {
    const { params: { connector } } = req;

    if (!connector) return res.sendStatus(400);

    const { deletedCount } = await connectorService.deleteConnectorConfig(connector);

    if (deletedCount === 0) return res.sendStatus(404);

    deleteMappedFolders(connector);
    return res.sendStatus(200);
  };

  return {
    get,
    post,
    remove
  };
})();

module.exports = controller;
