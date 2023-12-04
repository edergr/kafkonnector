const logger = require('../logger');
const database = require('../database');

const configurations = (() => {
  const handleError = (operation, filter, error) => {
    logger.error(
      `[MONGO] Error on ${operation} configurations. Filter: %s Detail: %s`,
      filter,
      JSON.stringify(error, ['message', 'stack'])
    );
  };

  const find = async (filter = {}, projection = {}) => {
    try {
      return await database.getCollection('configurations').find(filter).project(projection).toArray();
    } catch (error) {
      handleError('find', filter, error);
    }
  };

  const findOne = async (filter) => {
    try {
      return await database.getCollection('configurations').findOne(filter);
    } catch (error) {
      handleError('findOne', filter, error);
    }
  };

  return {
    find,
    findOne
  };
})();

module.exports = configurations;
