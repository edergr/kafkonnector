const rename = require('./filters/rename');
const remove = require('./filters/remove');
const append = require('./filters/append');

const applyFilters = (filters, delimiter, fieldNames, line) => {
  const fields = fieldNames.split(';');
  const sequence = filters.sequence.split(';');
  const values = line.split(delimiter);

  sequence.forEach((step) => {
    const job = filters.jobs.find((j) => j.name === step);
    if (job) {
      switch (job.type) {
        case 'rename':
          rename(fields, job);
          break;
        case 'remove':
          remove(fields, values, job);
          break;
        case 'append':
          append(fields, values, job);
          break;
        default:
          break;
      }
    }
  });

  return {
    newNames: fields.join(';'),
    newLine: values.join(delimiter)
  };
};

module.exports = applyFilters;
