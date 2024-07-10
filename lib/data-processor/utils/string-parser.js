const stringParser = (position, line) => {
  let result = [];
  for (let i = 0; i < position.length; i++) {
    let start = position[i];
    let end = (i < position.length - 1) ? position[i + 1] : line.length;
    result.push(line.substring(start, end));
  }

  return result.join(';');
}

module.exports = stringParser;
