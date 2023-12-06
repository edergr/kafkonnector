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
    } catch (e) {
      logger.error('Error on close database: %j', e);
      throw e;
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
      return { connected: true };
    } catch (e) {
      logger.error('Failed to connect to database - %s', e.message);
      throw e;
    }
  },

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV === 'test') {
        logger.info('Trying to drop database.');
        await dbInstance.dropDatabase();
        return { dropped: true };
      }
    } catch (e) {
      logger.error('Error on drop database: %j', e);
      throw e;
    }
  },

  getCollection(name) { return dbInstance.getCollection(name); },
  ObjectId(idData) { return new dbInstance.ObjectId(idData); }
};