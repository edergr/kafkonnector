const configurations = require('../commons/repository/configurations');
const applyFilters = require('./utils/apply-filters');
const objectParser = require('./utils/object-parser');

const processData = async (data, name) => {
  const connectorConfig = await configurations.findOne({ name });
  const { delimiter, fieldNames, filters, topic, retry } = connectorConfig;

  const failData = [];

  for await (const line of data) {
    let filteredLine;
    let filteredNames;

    if (filters?.jobs && filters?.jobs.length) {
      const { newNames, newLine } = applyFilters(filters, delimiter, fieldNames, line);
      filteredNames = newNames;
      filteredLine = newLine;
    };

    const parsedLine = objectParser(delimiter, filteredNames || fieldNames, filteredLine || line);
    console.log(parsedLine);
    // const writeFailed = writeKafka(parsedLine, topic);
    const writeFailed = false;

    if (writeFailed) {
      failData.push(line);
    }
  };

  return { retry, failData };
};

module.exports = processData;
