const append = (fields, values, job) => {
  const firstFieldIndex = fields.indexOf(job.firstField);
  const secondFieldIndex = fields.indexOf(job.secondField);
  fields.splice(firstFieldIndex, 2, job.newFieldName);
  values[firstFieldIndex] += values[secondFieldIndex];
  values.splice(secondFieldIndex, 1);
};

module.exports = append;