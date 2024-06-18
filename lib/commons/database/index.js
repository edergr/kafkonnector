const logger = require('../logger');
const config = require('../config');
const Db = require('./mongodb');

const dbInstance = new Db();

module.exports = {
  async close() {
    try {
      if (dbInstance) {
        logger.info('Trying to disconnect database');
        await dbInstance.close();
      }
    } catch (error) {
      logger.error('Error on close database: %s', error.message);
      throw error;
    }
  },

  async connect(mongodbURI = config.get('MONGODB_URI'), minPoolSize = 6) {
    if (!mongodbURI) {
      const message = 'Failed to connect to database - URI not found.';
      logger.error(message);
      throw new Error(message);
    }

    try {
      await dbInstance.connect(mongodbURI, { minPoolSize });
      logger.info('Database connected');
    } catch (error) {
      logger.error('Failed to connect to database - %s', error.message);
      throw error;
    }
  },

  async dropDatabase() {
    try {
      await dbInstance.dropDatabase();
      return false;
    } catch (error) {
      logger.error('Error on dropDatabase: %s', error.message);
    }
  },

  getCollection(name) { return dbInstance.getCollection(name); },
  ObjectId(idData) { return new dbInstance.ObjectId(idData); }
};
