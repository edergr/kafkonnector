const fs = require('fs').promises;
const { logger } = require('../commons');

const createRetryFile = async (data, connectorName, fileName) => {
  const filePath = `/data/kafkonnector/${connectorName}/retry/r_${fileName}`;

  try {
    await fs.writeFile(filePath, data);
  } catch (err) {
    logger.error('Error creating file:', err);
  }
};

module.exports = createRetryFile;
