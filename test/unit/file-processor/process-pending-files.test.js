const sinon = require('sinon');
const fs = require('fs');
const { config, logger } = require('../../../lib/commons');
const fileProcessor = require('../../../lib/file-processor');
const handleFiles = require('../../../lib/handle-files');
const dataProcessor = require('../../../lib/data-processor');

describe.skip('Process Pending File unit tests', () => {
  let sandbox;
  const rootDir = config.get('ROOT_FOLDER');
  const fileName = 'pending1.txt';
  const filePath = `/data/kafkonnector/connector1/pending/${fileName}`;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Success Cases', () => {
    const paths = ['pending', 'processed', 'retry']

    beforeEach(() => {
      fs.rm(rootDir, { recursive: true }, () => { });

      paths.forEach((path) => {
        fs.mkdirSync(`/data/kafkonnector/connector1/${path}`, { recursive: true });
      })
      fs.writeFile(filePath, '', () => { });
    });

    afterEach(() => {
      fs.rm(rootDir, { recursive: true }, () => { });
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
      const retriedFilePath = `/data/kafkonnector/connector1/pending/${retriedFileName}`;
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
    beforeEach(() => {
      fs.rm(rootDir, { recursive: true }, () => { });
      fs.mkdirSync('/data/kafkonnector/connector1/pending', { recursive: true });
      fs.writeFile(filePath, '', () => { });
    });

    afterEach(() => {
      fs.rm(rootDir, { recursive: true }, () => { });
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