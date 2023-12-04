const { MongoClient, ObjectId } = require('mongodb');

class Db {
  constructor() {
    this.client = null;
    this.db = null;
    this.collections = new Map();
    this.ObjectId = ObjectId;
  }

  async connect(url, options = {}) {
    const self = this;
    if (this.client) {
      if (this.client.topology.isConnected()) {
        return Promise.resolve();
      }
      return new Promise((resolve) => self.client.topology.on('serverOpening', resolve));
    }
    this.client = new MongoClient(url, options);
    await this.client.connect();
    this.db = this.client.db();
  }

  async dropDatabase() {
    if (this.db) {
      const result = await this.db.dropDatabase();
      if (result) {
        await this.close();
        return result;
      }
    }
    return false;
  }

  getCollection(collectionName) {
    let collection = this.collections.get(collectionName);
    if (!collection) {
      collection = this.db.collection(collectionName);
      this.collections.set(collectionName, collection);
    }
    return collection;
  }

  async close() {
    if (this.client) {
      await this.client.close(false);
      this.client = null;
      this.db = null;
      this.collections.clear();
    }
  }
}

module.exports = Db;
