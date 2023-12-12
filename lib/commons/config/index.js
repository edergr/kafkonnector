const ROOT_PATH = process.cwd();
const nconf = require('nconf');
const path = require('path');

nconf.argv()
  .env()
  .file(path.join(ROOT_PATH, 'config/config.json'))
  .defaults();

module.exports = nconf;
