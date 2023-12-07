const objectParser = (delimiter, fieldNames, line) => {
  const fieldKeys = fieldNames.split(';');
  const lineValues = line.split(delimiter);

  const object = fieldKeys.reduce((obj, key, i) => {
    obj[key] = lineValues[i];
    return obj;
  }, {});

  return object;
};

module.exports = objectParser;
