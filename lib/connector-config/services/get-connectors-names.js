const configurations = require('../../commons/repository/configurations');

const getConnectorsNames = async () => {
  const result = await configurations.find({}, { name: 1, _id: 0 });
  return result.map((item) => item.name);
};

module.exports = getConnectorsNames;
