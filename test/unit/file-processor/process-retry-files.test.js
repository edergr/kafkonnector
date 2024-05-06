const sinon = require('sinon');
const { assert } = require('chai');
const fs = require('fs').promises;
const processRetryFile = require('../../../lib/file-processor/process-retry-files');

describe.skip('processRetryFile', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('should move the retry file to the pending folder and log success message', async () => {
    const filePath = '/data/kafkonnector/connector1/retry/retry_file.txt';
    const fileName = 'retry_file.txt';
    const processedFolderPath = '/data/kafkonnector/connector1/pending';
    const processingFilePath = `${processedFolderPath}/${fileName}`;

    const renameStub = sinon.stub(fs, 'rename').resolves();

    const loggerInfoStub = sinon.stub(console, 'info');

    await processRetryFile(filePath);

    assert.isTrue(renameStub.calledOnceWithExactly(filePath, processingFilePath));
    assert.isTrue(loggerInfoStub.calledOnceWithExactly('Retry file moved to pending folder to be processed'));
  });

  it('should log an error if file processing fails', async () => {
    const filePath = '/data/kafkonnector/connector1/retry/retry_file.txt';
    const error = new Error('Failed to move file');

    sinon.stub(fs, 'rename').rejects(error);
    const loggerErrorStub = sinon.stub(console, 'error');

    await processRetryFile(filePath);

    assert.isTrue(loggerErrorStub.calledOnce);
    assert.strictEqual(loggerErrorStub.getCall(0).args[0], `Error to process retry file: ${error}`);
  });
});