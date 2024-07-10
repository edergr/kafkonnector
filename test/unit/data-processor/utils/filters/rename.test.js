const assert = require('assert');
const rename = require('../../../../../lib/data-processor/utils/filters/rename');

describe('Rename Filter unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the Rename Filter successfully', () => {
      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const job = {
        name: 'renameCampo1',
        type: 'rename',
        fieldTarget : 'campo1', 
        newFieldName : 'campo1Renomeado'
      };

      const expectedResult = 'campo1Renomeado';

      const result = rename(fields, job);
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});
