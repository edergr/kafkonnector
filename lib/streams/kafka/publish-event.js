const { streamWriter } = require('./manager');

const publishEvent = async (topic, event, key, schema) => {
  let writeFailed = false;
  const eventString = JSON.stringify(event);

  try {
    await streamWriter.write(topic, eventString, key, schema);
  } catch (error) {
    writeFailed = true;
  }

  return writeFailed;
};

module.exports = publishEvent;
