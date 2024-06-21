const { logger } = require('../../../lib/commons');
const append = require('./filters/append');
const create = require('./filters/create');
const drop = require('./filters/drop');
const remove = require('./filters/remove');
const rename = require('./filters/rename');
const set = require('./filters/set');

const formatData = {
  append: (fields, values, job) => append(fields, values, job),
  create: (fields, values, job) => create(fields, values, job),
  drop: (fields, values, job) => drop(fields, values, job, false),
  positionedDrop: (fields, values, job) => drop(fields, values, job, true),
  remove: (fields, values, job) => remove(fields, values, job),
  rename: (fields, values, job) => rename(fields, job),
  set: (fields, values, job) => set(values, job)
};

const applyFilters = (filters, delimiter, fieldNames, line) => {
  const fields = fieldNames.split(';');
  const sequence = filters.sequence.split(';');
  const values = line.split(delimiter);

  let shouldDropThisLine = false;

  sequence.forEach((step) => {
    if (shouldDropThisLine) return;

    const job = filters.jobs.find((j) => j.name === step);
    if (job?.type) {
      const result = formatData[job.type](fields, values, job);

      if (job?.type === 'drop' || job?.type === 'positionedDrop') {
        shouldDropThisLine = result;
      }
    } else {
      logger.error('Undefined type: %s', JSON.stringify(job));
    }
  });

  if (shouldDropThisLine) {
    return { drop: true };
  }

  return {
    newNames: fields.join(';'),
    newLine: values.join(';')
  };
};

module.exports = applyFilters;
