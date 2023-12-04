const logger = require('../logger');
const config = require('../config');
const Db = require('./mongodb');

const dbInstance = new Db();

module.exports = {
  async close() {
    try {
      if (dbInstance) {
        logger.info('[MONGO] Trying to disconnect');
        await dbInstance.close();
      }
    } catch (e) {
      logger.error('[MONGO] Error on close: %j', e);
      throw e;
    }
  },

  async connect(mongodbURI = config.get('MONGODB_URI'), minPoolSize = 6) {
    if (!mongodbURI) {
      const message = '[MONGO] Failed to connect - URI not found.';
      logger.error(message);
      throw new Error(message);
    }

    try {
      await dbInstance.connect(mongodbURI, { minPoolSize });
      logger.info('[MONGO] Connected');
      return { connected: true };
    } catch (e) {
      logger.error('[MONGO] Failed to connect - %s', e.message);
      throw e;
    }
  },

  async dropDatabase() {
    try {
      if (process.env.NODE_ENV === 'test') {
        logger.info('[MONGO] Trying to drop.');
        await dbInstance.dropDatabase();
        return { dropped: true };
      }
    } catch (e) {
      logger.error('[MONGO] Error on drop: %j', e);
      throw e;
    }
  },

  getCollection(name) { return dbInstance.getCollection(name); },
  ObjectId(idData) { return new dbInstance.ObjectId(idData); }
};