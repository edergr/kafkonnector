const logger = require('../logger');
const database = require('../database');

const handleError = (operation, error) => {
  logger.error(
    `Database error: ${operation} configurations. Detail: %s`,
    error.message
  );
};

const getCollection = () => database.getCollection('configurations');

const find = async (filter) => {
  try {
    return await getCollection().find(filter).toArray();
  } catch (error) {
    handleError('find', error);
  }
};

const findOne = async (filter) => {
  try {
    return await getCollection().findOne(filter);
  } catch (error) {
    handleError('findOne', error);
  }
};

const insertOne = async (document) => {
  try {
    return await getCollection().insertOne(document);
  } catch (error) {
    handleError('insertOne', error);
  }
};

const updateOne = async (filter, update) => {
  try {
    return await getCollection().updateOne(filter, update);
  } catch (error) {
    handleError('updateOne', error);
  }
};

const deleteOne = async (filter) => {
  try {
    return await getCollection().deleteOne(filter);
  } catch (error) {
    handleError('deleteOne', error);
  }
};

const watch = (pipeline) => {
  try {
    return getCollection().watch(pipeline, { batchSize: 10 });
  } catch (error) {
    handleError('watch', error);
  }
};

module.exports = {
  find,
  findOne,
  insertOne,
  updateOne,
  deleteOne,
  watch
};
