const Ajv = require('ajv').default;
const connectorConfigSchema = require('./schemas/connector-config-schema.json');
const { logger } = require('../commons');

const Validator = {};
const self = Validator;
const ajv = new Ajv({ allErrors: true });

ajv.compile(connectorConfigSchema, connectorConfigSchema.$id);

Validator.getErrorMessages = (result) => result.map((error) => `${error
  .instancePath ? `${error.instancePath} - ` : ''}${error.message}`);

Validator.formatErrorMessage = (result) => {
  const errors = self.getErrorMessages(result);
  return `${errors.join('.\n')}.`;
};

Validator.validate = (json, schemaId) => {
  ajv.validate(schemaId, json);
  return ajv.errors;
};

const defaultValidation = (req, res, options, next) => {
  const errors = Validator.validate(req.body, options.schema);
  if (errors) {
    const errorDetail = Validator.formatErrorMessage(errors);
    logger.error(options.message, errorDetail);
    return res.status(400).send(errorDetail);
  }
  next();
};

Validator.connectorConfig = (req, res, next) => {
  defaultValidation(req, res, {
    message: 'Validation error connector config data: %j',
    schema: connectorConfigSchema.$id
  }, next);
};

module.exports = Validator;
