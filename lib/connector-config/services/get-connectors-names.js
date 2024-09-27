const configurations = require('../../commons/repository/configurations');

const getConnectorsNames = async () => {
  const results = await configurations.find({}, { projection: { name: 1, _id: 0 } });
  return results.map(item => item.name);
};

module.exports = getConnectorsNames;