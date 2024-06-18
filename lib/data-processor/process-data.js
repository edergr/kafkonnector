const configurations = require('../commons/repository/configurations');
const applyFilters = require('./utils/apply-filters');
const objectParser = require('./utils/object-parser');
const stringParser = require('./utils/string-parser');
const publishEvent = require('../streams/kafka/publish-event');

const processData = async (data, name) => {
  const connectorConfig = await configurations.findOne({ name });
  const {
    propertiesPosition = undefined,
    delimiter,
    fieldNames,
    filters = {},
    topic,
    schema = null,
    retry = false
  } = connectorConfig;

  const failData = [];
  let lineNumber = 0;

  console.time('executionTime');
  for await (const line of data) {
    lineNumber++;

    if (!line.trim()) {
      continue;
    }

    let linePositioned = undefined;
    let filteredLine = undefined;
    let filteredNames = undefined;

    if (propertiesPosition) {
      linePositioned = stringParser(propertiesPosition, line)
    }

    if (filters?.jobs && filters?.jobs.length) {
      const result = applyFilters(filters, delimiter, fieldNames, linePositioned || line);

      filteredLine = result?.newLine;
      filteredNames = result?.newNames;
    }

    const parsedLine = objectParser(delimiter, filteredNames || fieldNames, linePositioned || filteredLine || line);
    const writeFailed = await publishEvent(topic, parsedLine, lineNumber.toString(), schema);

    if (writeFailed) {
      failData.push(line);
    }
  }
  console.timeEnd('executionTime');

  return { retry, failData };
};

module.exports = processData;
