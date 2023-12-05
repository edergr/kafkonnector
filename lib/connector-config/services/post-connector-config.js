const configurations = require('../../commons/repository/configurations');

const postConnectorConfig = async (body) => {
  const { name } = body;

  const result = await configurations.findOne({ name })

  if (result) {
    const filter = { name };
    const update = { $set: { ...body, ...{ lastUpdate: new Date() } } };
    return await configurations.updateOne(filter, update);
  }

  return await configurations.insertOne(body);
};

module.exports = postConnectorConfig;
