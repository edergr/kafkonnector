const http = require('http');
const url = require('url');

const registryHost = 'http://localhost:8081';
module.exports = {
  postSchema: async (schemaName, schemaType, schemaData) => {
    const uri = url.parse(`${registryHost}/subjects/${schemaName}/versions`);
    const respData = [];
    const requestWrapper = () => new Promise((resolve, reject) => {
      const req = http.request({
        hostname: uri.hostname,
        path: uri.path,
        port: uri.port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        res
          .on('data', (chunk) => respData.push(...chunk))
          .on('end', () => resolve(JSON.parse(Buffer.from(respData).toString())));
      });
      req.write(JSON.stringify({
        schemaType,
        schema: JSON.stringify(schemaData)
      }));
      req.on('error', (errorData) => reject(errorData));
      req.end();
    });

    return requestWrapper();
  },

  deleteSchema: async (schemaName) => {
    const uri = url.parse(`${registryHost}/subjects/${schemaName}`);
    const respData = [];

    const requestWrapper = () => new Promise((resolve, reject) => {
      const req = http.request({
        hostname: uri.hostname,
        path: uri.path,
        port: uri.port,
        method: 'DELETE'
      }, (res) => {
        res
          .on('data', (chunk) => respData.push(...chunk))
          .on('end', () => resolve(JSON.parse(Buffer.from(respData).toString())));
      });
      req.on('error', (errorData) => reject(errorData));
      req.end();
    });

    return requestWrapper();
  }
};
