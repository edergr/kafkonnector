const objectParser = (delimiter, fieldNames, line) => {
  const fieldKeys = Array.isArray(fieldNames) ? fieldNames : fieldNames.split(delimiter);
  const lineValues = Array.isArray(line) ? line : line.split(delimiter);

  const object = fieldKeys.reduce((obj, key, i) => {
    obj[key] = lineValues[i];
    return obj;
  }, {});

  return object;
};

module.exports = objectParser;