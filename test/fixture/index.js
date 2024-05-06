const Chance = require('chance');
const db = require('../../lib/commons/database');

const chance = new Chance();

const generateKafkaMessage = () => ({
  name: chance.string({ length: 50 }),
  age: chance.integer({ min: 18, max: 150 }),
  birthdate: new Date().toISOString()
});

const generateKafkaKey = () => chance.pickone(['teste', 999, { key: 'key' }]);

const fakeDocument = (_id = db.ObjectId()) => ({
  _id,
  ...generateKafkaMessage
});

module.exports = {
  generateKafkaMessage,
  generateKafkaKey,
  fakeDocument
};
