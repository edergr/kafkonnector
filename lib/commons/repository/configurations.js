const logger = require('../logger');
const database = require('../database');

const handleError = (operation, filter, error) => {
  logger.error(
    `[MONGO] Error on ${operation} configurations. Filter: %s Detail: %s`,
    filter,
    JSON.stringify(error, ['message', 'stack'])
  );
};

const getCollection = () => database.getCollection('configurations');

const find = async (filter = {}, projection = {}) => {
  try {
    return await getCollection().find(filter).project(projection).toArray();
  } catch (error) {
    handleError('find', filter, error);
  }
};

const findOne = async (filter) => {
  try {
    return await getCollection().findOne(filter);
  } catch (error) {
    handleError('findOne', filter, error);
  }
};

const insertOne = async (document) => {
  try {
    return await getCollection().insertOne(document);
  } catch (error) {
    handleError('insertOne', document, error);
  }
};

const updateOne = async (filter, update) => {
  try {
    return await getCollection().updateOne(filter, update);
  } catch (error) {
    handleError('updateOne', filter, error);
  }
};

const deleteOne = async (filter) => {
  try {
    return await getCollection().deleteOne(filter);
  } catch (error) {
    handleError('deleteOne', filter, error);
  }
};

module.exports = {
  find,
  findOne,
  insertOne,
  updateOne,
  deleteOne
};
