const { assert } = require('chai');
const rename = require('../../../../../lib/data-processor/utils/filters/rename');

describe('Rename Filter unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the Rename Filter successfully', () => {
      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const job = {
        "name": "renameCampo1",
        "type": "rename",
        "field" : "campo1", 
        "target" : "campo1Renomeado"
      };

      const expectRestul = 'campo1Renomeado';

      const result = rename(fields, job);
      assert.deepEqual(result, expectRestul);
    });
  });
});
