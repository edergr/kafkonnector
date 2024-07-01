const remove = (fields, values, job) => {
  const targets = Array.isArray(job.fieldTarget) ? job.fieldTarget : [job.fieldTarget];

  targets.forEach(target => {
    const indexToRemove = fields.indexOf(target);
    if (indexToRemove !== -1) {
      fields.splice(indexToRemove, 1);
      values.splice(indexToRemove, 1);
    }
  });

  return { fields, values };
};

module.exports = remove;