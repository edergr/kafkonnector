const create = (fields, values, job) => ({
  fields: [...fields, job.fieldName],
  values: [...values, job.fieldValue]
});


module.exports = create;
