const sinon = require('sinon');
const { assert } = require('chai');
const { config, logger } = require('../../../../lib/commons');
const path = require('path');
const configurationsRepository = require('../../../../lib/commons/repository/configurations');
const fs = require('fs');
const { checkMappedFolders } = require('../../../../lib/handle-folders/mapping');

describe('Check Mapping Folders unit tests', () => {
  const rootDir = config.get('ROOT_FOLDER');
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    fs.rm(rootDir, { recursive: true }, () => { });
  });

  afterEach(() => {
    sandbox.restore();
    fs.rm(rootDir, { recursive: true }, () => { });
  });

  it('', async () => {
    const connectorName = ['connector1'];
    sandbox.stub(configurationsRepository, 'find').resolves(connectorName);

    const folderPath = path.join(rootDir, connectorName[0]);

    const subPaths = ['pending', 'processed', 'retry'];

    subPaths.forEach((subPath) => {
      assert.isFalse(fs.existsSync(`${folderPath}/${subPath}`))
    })

    await checkMappedFolders();

    subPaths.forEach((subPath) => {
      assert.isTrue(fs.existsSync(`${folderPath}/${subPath}`))
    });
  })
})
