const nock = require('nock');

module.exports = {
  nockGetSchemaById(options) {
    let nockData = nock(options.url, {
      allowUnmocked: true
    });
    nockData = nockData.get(`/schemas/ids/${options.schemaId}`);
    if (options.auth) {
      nockData = nockData.basicAuth({
        user: options.auth.username,
        pass: options.auth.password
      });
    }
    if (options.error) {
      return nockData.replyWithError(options.error);
    }
    return nockData.reply(options.status, options.dataToReturn);
  },
  clean() {
    nock.cleanAll();
  }
};
