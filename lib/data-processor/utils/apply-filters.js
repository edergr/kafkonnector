const { logger } = require('../../../lib/commons');
const append = require('./filters/append');
const create = require('./filters/create');
const remove = require('./filters/remove');
const rename = require('./filters/rename');

const formatData = {
  append: (fields, values, job) => append(fields, values, job),
  create: (fields, values, job) => create(fields, values, job),
  remove: (fields, values, job) => remove(fields, values, job),
  rename: (fields, values, job) => rename(fields, job),
};

const applyFilters = (filters, delimiter, fieldNames, line) => {
  const fields = fieldNames.split(';');
  const sequence = filters.sequence.split(';');
  const values = line.split(delimiter);

  sequence.forEach((step) => {
    const job = filters.jobs.find((j) => j.name === step);

    if (job?.type) {
      formatData[job.type](fields, values, job);
    } else {
      logger.error('Undefined type: %s', JSON.stringify(job));
    }
  });

  return {
    newNames: fields.join(';'),
    newLine: values.join(delimiter)
  };
};

module.exports = applyFilters;
