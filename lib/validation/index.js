const tv4 = require('tv4');
const connectorConfigSchema = require('./schemas/connector-config-schema.json');

const Validator = {};
const self = Validator;

tv4.addSchema(connectorConfigSchema);

Validator.getErrorMessages = (result) => {
  const errors = [];
  result.errors.forEach((error) => {
    errors.push(error.message);
  });
  return errors;
};

Validator.formatErrorMessage = (result) => {
  const errors = self.getErrorMessages(result);
  return `${errors.join('.\n')}.`;
};

Validator.validate = (json, schemaId) => tv4.validateMultiple(json, schemaId);

const buildMiddleware = (schema) => (req, res, next) => {
  const result = self.validate(req.body, schema);
  if (!result.valid) {
    return res.status(400).send({ error: 'Schema Validation' });
  }
  next();
};

Validator.config = buildMiddleware(connectorConfigSchema);

module.exports = Validator;
