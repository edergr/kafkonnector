const remove = (fields, values, job) => {
  const indexToRemove = fields.indexOf(job.fieldTarget);
  fields.splice(indexToRemove, 1);
  values.splice(indexToRemove, 1);

  return { fields, values };
};

module.exports = remove;
