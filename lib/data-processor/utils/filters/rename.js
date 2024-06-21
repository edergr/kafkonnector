const rename = (fields, job) => fields[fields.indexOf(job.fieldTarget)] = job.newFieldName;

module.exports = rename;
