const sinon = require('sinon');
const { assert } = require('chai');
const { logger } = require('../../../../lib/commons');
const objectParser = require('../../../../lib/data-processor/utils/object-parser');

describe('Object Parser unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the object parser successfully', () => {
      const line = 'Abacate;Maça;Banana;Uva'
      const delimiter = ';';
      const fieldNames = 'campo1;campo2;campo3;campo4';

      const expectRestul = { campo1: 'Abacate', campo2: 'Maça', campo3: 'Banana', campo4: 'Uva' };
      const result = objectParser(delimiter, fieldNames, line);

      assert.deepEqual(result, expectRestul);
    });
  });
});