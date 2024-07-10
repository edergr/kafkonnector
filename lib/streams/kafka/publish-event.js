const { streamWriter } = require('./manager');

const publishEvent = async (topic, event, schemaId) => {
  let writeFailed = false;

  let schema = null;
  if (schemaId) {
    schema = { valueId: schemaId };
  };

  try {
    await streamWriter.write(topic, event, null, schema);
  } catch (error) {
    writeFailed = true;
  }

  return writeFailed;
};

module.exports = publishEvent;
