const append = (fields, values, job) => {
  const firstFieldIndex = fields.indexOf(job.firstField);

  let newValue;
  if (job.stringToAppend) {
    if (job.position === 'start') {
      newValue = job.stringToAppend + values[firstFieldIndex];
    } else {
      newValue = values[firstFieldIndex] + job.stringToAppend;
    }

    fields.splice(firstFieldIndex, 1, job.newFieldName);
    values.splice(firstFieldIndex, 1, newValue);
  } else {
    const secondFieldIndex = fields.indexOf(job.secondField);
    newValue = values[firstFieldIndex] + values[secondFieldIndex];

    fields.splice(firstFieldIndex, 1, job.newFieldName);
    values.splice(firstFieldIndex, 1, newValue);

    const updatedSecondFieldIndex = fields.indexOf(job.secondField);

    fields.splice(updatedSecondFieldIndex, 1);
    values.splice(updatedSecondFieldIndex, 1);
  }

  return { fields, values };
};

module.exports = append;
