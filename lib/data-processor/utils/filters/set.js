const set = (values, job) => {
  const newValue = values[values.length - 1].substring(job.positionStart, job.fieldLength)
  values.splice(job.positionTarget, 0, newValue)
  return { values }
};

module.exports = set;