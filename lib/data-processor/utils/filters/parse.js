const parse = (fields, values, job) => {
  const fieldIndex = fields.indexOf(job.fieldTarget);

  if (job.parseType === 'int') {
    values[fieldIndex] = parseInt(values[fieldIndex], 10);
  } else if (job.parseType === 'string') {
    values[fieldIndex] = String(values[fieldIndex]);
  }

  return { fields, values };
};

module.exports = parse;