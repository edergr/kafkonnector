const sinon = require('sinon');
const { assert } = require('chai');
const { logger } = require('../../../lib/commons');
const fs = require('fs').promises;
const createRetryFile = require('../../../lib/handle-files/create-retry-file');

describe.skip('Create Retry File unit tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(logger, 'error');
  })

  afterEach(() => {
    sandbox.restore();
  });

  describe('Success Cases', () => {
    it('Should create a retry file with correct data, connectorName, and fileName', async () => {
      const data = 'test data';
      const connectorName = 'testConnector';
      const fileName = 'testFile.txt';
      const expectedFilePath = `/data/kafkonnector/${connectorName}/retry/r_${fileName}`;

      const writeFileStub = sandbox.stub(fs, 'writeFile').resolves();

      await createRetryFile(data, connectorName, fileName);

      assert.isTrue(writeFileStub.calledOnce);
      assert.strictEqual(writeFileStub.getCall(0).args[0], expectedFilePath);
      assert.strictEqual(writeFileStub.getCall(0).args[1], data);
    });
  });

  describe('Error Cases', () => {
    it('Should log an error if file creation fails', async () => {
      const data = 'test data';
      const connectorName = 'testConnector';
      const fileName = 'testFile.txt';
      const error = new Error('Failed to create file');

      sandbox.stub(fs, 'writeFile').rejects(error);

      await createRetryFile(data, connectorName, fileName);

      sandbox.assert.calledOnce(logger.error);
      assert.strictEqual(logger.error.getCall(0).args[0], 'Error creating file:');
      assert.strictEqual(logger.error.getCall(0).args[1], error);
    });
  });
});