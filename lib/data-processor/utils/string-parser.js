const stringParser = (position, line) => {
  let resultado = [];
  for (let i = 0; i < position.length; i++) {
    let start = position[i];
    let end = (i < position.length - 1) ? position[i + 1] : line.length;
    resultado.push(line.substring(start, end));
  }

  return resultado.join(';');
}

module.exports = stringParser;
