const sinon = require('sinon');
const { assert } = require('chai');
const { EventEmitter } = require('events');
const { config, logger } = require('../../../../lib/commons');
const Db = require('../../../../lib/commons/database/mongodb');
const db = require('../../../../lib/commons/database');

const url = `${config.get('MONGODB_URI')}-test`;
const collectionNamespace = 'test';

describe('Mongodb unit tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => sandbox.restore());

  describe('Success Cases', () => {
    it('Should return true when connecting', async () => {
      const connectSpy = sandbox.spy(Db.prototype, 'connect');

      await db.connect(url);
      sandbox.assert.calledOnce(connectSpy);
    });

    it('Should return undefined on connect when there is already an open database connection', async () => {
      const dbInstance = new Db();

      sandbox.stub(dbInstance, 'connect').returns(Promise.resolve());

      await db.connect();

      const connection = await db.connect();
      assert.isUndefined(connection);
    });

    it('Should return collection name', async () => {
      await db.connect(url);
      const collection = db.getCollection(collectionNamespace);

      assert.isDefined(collection);
      assert.strictEqual(collection.namespace, 'kafkonnector-test.test');
    });

    it('Should return an ObjectId.', async () => {
      await db.connect(url);
      const objectId = db.ObjectId();

      assert.isNotNull(objectId);
    });

    it('Should emit serverOpening event event when there is already client database connected', () => {
      const dbInstance = new Db();
      const mongoClientMock = {
        topology: Object.create(EventEmitter.prototype)
      };

      mongoClientMock.topology.isConnected = () => false;
      dbInstance.client = mongoClientMock;

      const topologyOnSpy = sinon.spy(mongoClientMock.topology, 'on');
      dbInstance.connect('', {});

      assert.isTrue(topologyOnSpy.calledOnceWith('serverOpening'));
      mongoClientMock.topology.emit('serverOpening');
    });

    it('Should call mongodb.close without error', async () => {
      const closeSpy = sandbox.spy(Db.prototype, 'close');
      await db.close();

      sandbox.assert.calledOnce(closeSpy);
    });
  });

  describe('Error Cases', () => {
    it('Should log error when trying to connect without URI', async () => {
      const loggerSpy = sandbox.spy(logger, 'error');

      try {
        await db.connect(null);
      } catch (error) {
        sandbox.assert.calledOnceWithExactly(
          loggerSpy,
          'Failed to connect to database - URI not found.'
        );
      }
    });

    it('Should call db.connect sending the error caught', async () => {
      const connectError = new Error('Connect database error');
      sandbox.stub(Db.prototype, 'connect').throws(connectError);
      const loggerSpy = sandbox.spy(logger, 'error');

      let error;
      try {
        await db.connect();
      } catch (err) {
        error = err;
      }

      assert.strictEqual(error, connectError);
      sandbox.assert.calledOnceWithExactly(
        loggerSpy,
        'Failed to connect to database - %s',
        connectError.message
      );
    });

    it('Should call db.close sending the error caught', async () => {
      const closeError = new Error('Close database error');
      sandbox.stub(Db.prototype, 'close').throws(closeError);
      const loggerSpy = sandbox.spy(logger, 'error');

      let error;
      try {
        await db.close();
      } catch (err) {
        error = err;
      }

      assert.strictEqual(error, closeError);
      sandbox.assert.calledOnceWithExactly(
        loggerSpy,
        'Error on close database: %s',
        closeError.message
      );
    });
  });
});
