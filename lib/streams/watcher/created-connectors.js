const { logger } = require('../../commons');
const configurations = require('../../commons/repository/configurations');
const { createMappedFolders } = require('../../file-processor/mapped-folders');

const pipeline = [
  { $match: { operationType: 'insert' } },
  { $project: { name: '$fullDocument.name' } }
];

const watchCreatedConnectors = () => {
  configurations.watch(pipeline)
    .on('change', (newConfig) => {
      const { name } = newConfig;
      createMappedFolders(name);
    });

  configurations.watch(pipeline)
    .on('error', (error) => {
      logger.error(
        '[MONGODB] Error on watching for new configs on %s',
        JSON.stringify(error, ['message', 'stack'])
      );
    });
};

module.exports = watchCreatedConnectors;
