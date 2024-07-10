const sinon = require('sinon');
const assert = require('assert');
const { logger } = require('../../../../lib/commons');
const configurationsRepository = require('../../../../lib/commons/repository/configurations')
const db = require('../../../../lib/commons/database');
const { fakeDocument } = require('../../../fixture');

describe('Repository unit tests', () => {
  describe('Success Cases', () => {
    let id;
    let document;

    beforeEach(async () => {
      id = db.ObjectId();
      document = fakeDocument(id);

      await db.getCollection('configurations').insertOne(document);
    });

    it('Should execute findOne and return the expect result', async () => {
      const result = await configurationsRepository.findOne({ _id: id });

      assert.deepStrictEqual(result, document);
    });

    it('Should execute find and return the expect result', async () => {
      const result = await configurationsRepository.find({ _id: id });

      assert.deepStrictEqual(result[0], document);
    });

    it('Should execute insertOne and return the expect result', async () => {
      const newDocument = fakeDocument();

      const { insertedId } = await configurationsRepository.insertOne(newDocument);
      assert.notDeepStrictEqual(insertedId, null);
    });

    it('Should execute updateOne and return the expect result', async () => {
      const update = {
        $set: {
          test: 'updated'
        }
      };

      const { modifiedCount } = await configurationsRepository.updateOne({ _id: id }, update);
      assert.deepStrictEqual(modifiedCount, 1);
    });

    it('Should execute deleteOne and return the expect result', async () => {
      const { deletedCount } = await configurationsRepository.deleteOne({ _id: id });
      assert.deepStrictEqual(deletedCount, 1);
    });
  });

  describe('Error Cases', () => {
    let sandbox;

    const error = new Error('Unknown Error');

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.spy(logger, 'error');
    });

    afterEach(() => sandbox.restore());

    const testCases = [
      {
        operation: 'find',
        func: configurationsRepository.find,
        filter: { _id: 'id' },
      },
      {
        operation: 'findOne',
        func: configurationsRepository.findOne,
        filter: { _id: 'id' }
      },
      {
        operation: 'insertOne',
        func: configurationsRepository.insertOne,
        document: { document: 'document' }
      },
      {
        operation: 'updateOne',
        func: configurationsRepository.updateOne,
        filter: { _id: 'id' },
        update:  { $set: { update: 'upd' } }
      },
      {
        operation: 'deleteOne',
        func: configurationsRepository.deleteOne,
        filter: { _id: 'id' }
      },
      {
        operation: 'watch',
        func: configurationsRepository.watch,
        pipeline: [{ $match: { operationType: 'insert' } }]
      },
    ];

    testCases.map(({
      only,
      operation,
      func,
      filter,
      document,
      update,
      pipeline
    }) => {
      const testItCase = only ? it.only : it;

      return testItCase(`Should handle and log erro on ${operation}`, async () => {
        sandbox.stub(db.getCollection('configurations'), operation).throws(error);

        try {
          await func(filter || document || pipeline, update);
        } catch (err) {
          sandbox.assert.calledOnceWithExactly(
            logger.error,
            `Database error: ${operation} configurations. Detail: %s`,
            err.message
          );
        }
      });
    });
  });
});