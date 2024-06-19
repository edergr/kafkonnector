const create = (fields, values, job) => {
  fields.unshift(job.fieldName);
  values.unshift(job.fieldValue);

  return { fields, values }
};


module.exports = create;
