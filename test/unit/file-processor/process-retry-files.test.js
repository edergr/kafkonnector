const sinon = require('sinon');
const fs = require('fs');
const { config, logger } = require('../../../lib/commons');
const fileProcessor = require('../../../lib/file-processor');

describe.skip('Process Retry File unit tests', () => {
  const rootDir = config.get('ROOT_FOLDER');
  const pathRetry = '/data/kafkonnector/connector1/retry';
  const pathPending = '/data/kafkonnector/connector1/pending';
  const fileName = 'pending1.txt';
  const filePath = `${pathRetry}/${fileName}`;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fs.rm(rootDir, { recursive: true }, () => { });
    fs.mkdirSync(pathRetry, { recursive: true });
    fs.mkdirSync(pathPending, { recursive: true });
    fs.writeFile(filePath, '', () => { });
  });

  afterEach(() => {
    sandbox.restore();
    fs.rm(rootDir, { recursive: true }, () => { });
  });

  it('Should process file and log information', async () => {
    sandbox.spy(logger, 'info');

    await fileProcessor.processRetryFile(filePath);

    sandbox.assert.calledWithMatch(
      logger.info,
      'Retry file moved to pending folder to be processed'
    )
  });

  it('Should log an error if processing retry file fails', async () => {
    const filePath = '/data/kafkonnector/connector1/retry/retry_file.txt';
    sandbox.spy(logger, 'error');

    try {
      await fileProcessor.processRetryFile(filePath);
    } catch (error) {
      sandbox.assert.calledOnceWithExactaly(
        logger.error,
        `Error to process retry file: ${error}`
      );
    }
  });
});