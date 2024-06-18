const { assert } = require('chai');
const append = require('../../../../../lib/data-processor/utils/filters/append');

describe('Append Filter unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the Append Filter successfully', () => {
      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const values = ['1', '2', '3', '4'];
      const job = {
        "name": "appendCampo1e2",
        "type": "append",
        "firstField": "campo1",
        "secondField": "campo2",
        "newFieldName": "campo1e2"
      };

      const expectRestul = {
        fields: ['campo1e2', 'campo3', 'campo4'],
        values: ['12', '3', '4']
      };

      const result = append(fields, values, job);

      assert.deepEqual(result, expectRestul);
    });
  });
});
