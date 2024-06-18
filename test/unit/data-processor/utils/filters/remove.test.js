const { assert } = require('chai');
const remove = require('../../../../../lib/data-processor/utils/filters/remove');

describe('Remove Filter unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the Remove Filter successfully', () => {
      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const values = ['1', '2', '3', '4'];
      const job = {
        "name": "removeCampo3",
        "type": "remove",
        "field": "campo3"
      };

      const expectRestul = {
        fields: ['campo1', 'campo2', 'campo4'],
        values: ['1', '2', '4']
      };

      const result = remove(fields, values, job);
      assert.deepEqual(result, expectRestul);
    });
  });
});
