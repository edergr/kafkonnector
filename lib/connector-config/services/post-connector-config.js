const configurations = require('../../commons/repository/configurations');

const postConnectorConfig = async (body) => {
  const { name } = body;

  const filter = { name };
  const update = { $set: { ...body, lastUpdate: new Date() } };
  const options = { upsert: true };

  return configurations.updateOne(filter, update, options);
};

module.exports = postConnectorConfig;