const { logger } = require('../../commons');
const configurations = require('../../commons/repository/configurations');
const { createMappedFolders } = require('../../handle-folders/mapping');
const monitoring = require('../../handle-folders/monitoring');

const pipeline = [
  { $match: { operationType: 'insert' } },
  { $project: { name: '$fullDocument.name' } }
];

const watchCreatedConnectors = () => {
  configurations.watch(pipeline)
    .on('change', async (newConfig) => {
      const { name } = newConfig;
      await createMappedFolders(name);
      await monitoring.pendingFolders(name);
      await monitoring.retryFolders(name);
    });

  configurations.watch(pipeline)
    .on('error', (error) => {
      logger.error(
        'Error on watching database for new configs on %s',
        JSON.stringify(error, ['message', 'stack'])
      );
    });
};

module.exports = watchCreatedConnectors;
