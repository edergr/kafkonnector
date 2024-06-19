const drop = (fields, values, job, positionedDrop) => {
  const { operator, value } = job.comparsion;
  const fieldIndex = fields.indexOf(job.fieldTarget);

  if (fieldIndex === -1) return false;

  let targetValue = values[fieldIndex];

  const compareValues = (targetVal, compareVal) => {
    const targetNum = parseFloat(targetVal);
    const compareNum = parseFloat(compareVal);
    if (!isNaN(targetNum) && !isNaN(compareNum)) {
      return { targetVal: targetNum, compareVal: compareNum };
    }
    return { targetVal, compareVal };
  };

  if (positionedDrop) {
    const { digit } = job.comparsion;
    targetValue = targetValue[digit];
  };

  const { targetVal, compareVal } = compareValues(targetValue, value);
  switch (operator) {
    case '===':
      return targetVal === compareVal;
    case '!==':
      return targetVal !== compareVal;
    case '>':
      return targetVal > compareVal;
    case '>=':
      return targetVal >= compareVal;
    case '<':
      return targetVal < compareVal;
    case '<=':
      return targetVal <= compareVal;
    default:
      return false;
  }
};

module.exports = drop;