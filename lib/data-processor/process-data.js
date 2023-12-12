/* eslint-disable no-console */
const configurations = require('../commons/repository/configurations');
const applyFilters = require('./utils/apply-filters');
const objectParser = require('./utils/object-parser');
const publishEvent = require('../streams/kafka/publish-event');

const processData = async (data, name) => {
  const connectorConfig = await configurations.findOne({ name });
  const {
    delimiter,
    fieldNames,
    filters,
    topic,
    schema = null,
    retry
  } = connectorConfig;

  const failData = [];
  let lineNumber = 0;

  console.time('executionTime');
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of data) {
    // eslint-disable-next-line no-plusplus
    lineNumber++;

    if (!line.trim()) {
      // eslint-disable-next-line no-continue
      continue;
    }

    let filteredLine;
    let filteredNames;

    if (filters?.jobs && filters?.jobs.length) {
      const { newNames, newLine } = applyFilters(filters, delimiter, fieldNames, line);
      filteredNames = newNames;
      filteredLine = newLine;
    }

    const parsedLine = objectParser(delimiter, filteredNames || fieldNames, filteredLine || line);
    const writeFailed = await publishEvent(topic, parsedLine, lineNumber.toString(), schema);

    if (writeFailed) {
      failData.push(line);
    }
  }
  console.timeEnd('executionTime');
  return { retry, failData };
};

module.exports = processData;
