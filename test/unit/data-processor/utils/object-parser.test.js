const { assert } = require('chai');
const objectParser = require('../../../../lib/data-processor/utils/object-parser');

describe('Object Parser unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the object parser successfully', () => {
      const line = 'Abacate;Maça;Banana;Uva;Laranja'
      const delimiter = ';';
      const fieldNames = 'campo1;campo2;campo3;campo4';

      const expectedResult = { campo1: 'Abacate', campo2: 'Maça', campo3: 'Banana', campo4: 'Uva' };
      const result = objectParser(delimiter, fieldNames, line);

      assert.deepEqual(result, expectedResult);
    });
  });
});