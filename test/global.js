const { config } = require('../lib/commons');
const db = require('../lib/commons/database');

config.set('MONGODB_URI', `${config.get('MONGODB_URI')}-test`);

before('Overwrite the database URI and start the database connection', async () => {
  await db.connect();
});

after('Remove the database used for testing', async () => {
  await db.dropDatabase();
  // await db.close();
});
