const remove = (fields, values, job) => {
  const indexToRemove = fields.indexOf(job.field);
  fields.splice(indexToRemove, 1);
  values.splice(indexToRemove, 1);
};

module.exports = remove