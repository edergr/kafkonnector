const rename = (fields, job) => {
  fields[fields.indexOf(job.field)] = job.target;
};

module.exports = rename;