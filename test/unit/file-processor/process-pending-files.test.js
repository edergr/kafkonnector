const sinon = require('sinon');
const fs = require('fs');
const { logger } = require('../../../lib/commons');
const fileProcessor = require('../../../lib/file-processor');
const handleFiles = require('../../../lib/handle-files');
const dataProcessor = require('../../../lib/data-processor');

describe('Process Pending File unit tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Success Cases', () => {
    const pathPending = '/data/kafkonnector/connector1/pending';
    const pathProcessed = '/data/kafkonnector/connector1/processed';
    const fileName = 'pending1.txt';
    const filePath = `${pathPending}/${fileName}`;

    beforeEach(() => {
      fs.mkdirSync(pathPending, { recursive: true });
      fs.mkdirSync(pathProcessed, { recursive: true });
      fs.writeFile(filePath, '', () => { });
    });

    afterEach(() => {
      fs.rm(pathPending, { recursive: true }, () => { });
      fs.rm(pathProcessed, { recursive: true }, () => { });
    });

    it('Should process file and log information', async () => {
      const connectorName = 'connector1';
      const processDataStubResult = { retry: false, failData: [] };

      sandbox.stub(dataProcessor, 'processData').resolves(processDataStubResult);
      sandbox.spy(logger, 'info');

      await fileProcessor.processPendingFile(filePath, connectorName);

      sandbox.assert.calledWithMatch(
        logger.info,
        'Pending file processed and moved to'
      );
    });

    it('Should process file with retry', async () => {
      const connectorName = 'connector1';
      const processDataStubResult = { retry: true, failData: ['test'] };

      sandbox.stub(dataProcessor, 'processData').resolves(processDataStubResult);
      sandbox.spy(logger, 'info');
      sandbox.spy(handleFiles, 'createRetryFile');

      await fileProcessor.processPendingFile(filePath, connectorName);

      sandbox.assert.calledWithExactly(
        handleFiles.createRetryFile,
        processDataStubResult.failData,
        connectorName,
        fileName
      );
    });

    it('Should process a retried file', async () => {
      const connectorName = 'connector1';
      const processDataStubResult = { retry: true, failData: ['test'] };

      const retriedFileName = 'r_pending1.txt';
      const retriedFilePath = `${pathPending}/${retriedFileName}`;
      fs.writeFile(retriedFilePath, '', () => { });

      sandbox.stub(dataProcessor, 'processData').resolves(processDataStubResult);
      sandbox.spy(logger, 'info');
      sandbox.spy(handleFiles, 'createRetryFile');

      await fileProcessor.processPendingFile(retriedFilePath, connectorName);

      sandbox.assert.calledWithMatch(
        logger.info,
        'Pending file processed and moved to'
      );
    });
  });

  describe('Error Cases', () => {
    const pathPending = '/data/kafkonnector/connector1/pending';
    const pathProcessed = '/data/kafkonnector/connector1/processed';
    const fileName = 'pending1.txt';
    const filePath = `${pathPending}/${fileName}`;

    beforeEach(() => {
      fs.rm(pathProcessed, { recursive: true }, () => { });
      fs.mkdirSync(pathPending, { recursive: true });
      fs.writeFile(filePath, '', () => { });
    });

    afterEach(() => {
      fs.rm(pathPending, { recursive: true }, () => { });
    });

    it('Should handle and log error information', async () => {
      const connectorName = 'connector1';
      const processDataStubResult = { retry: false, failData: [] };

      sandbox.stub(dataProcessor, 'processData').resolves(processDataStubResult);
      sandbox.spy(logger, 'error');

      await fileProcessor.processPendingFile(filePath, connectorName);

      sandbox.assert.calledWithMatch(
        logger.error,
        'Error to process pending file: Error: ENOENT: no such file or directory'
      );
    });
  });
});