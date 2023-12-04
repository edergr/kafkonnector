

const controller = (() => {
  const get = async (req, res) => {
    const { params: { connector } } = req;

    const connectorData = connector
      ? await getConnectorByName(connector)
      : await getConnectorsNames();

    res.status(200).send(connectorData);
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
