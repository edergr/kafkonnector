const fs = require('fs').promises;
const { config, logger } = require('../commons');

const createRetryFile = async (data, connectorName, fileName) => {
  const filePath = `${config.get("ROOT_FOLDER")}/${connectorName}/retry/r_${fileName}`;

  try {
    await fs.writeFile(filePath, data);
  } catch (err) {
    logger.error('Error creating file:', err);
  }
};

module.exports = createRetryFile;
