const connectorService = require('./services')

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

  const post = (req, res) => {

    res.sendStatus(201);
  };

  const remove = (req, res) => {

    res.sendStatus(200);
  };

  return {
    get,
    post,
    remove
  };
})();

module.exports = controller;
