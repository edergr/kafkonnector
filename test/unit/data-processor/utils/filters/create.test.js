const assert = require('assert');
const create = require('../../../../../lib/data-processor/utils/filters/create');

describe('Create Filter unit test', () => {
  describe('Success Cases', () => {
    it('Should apply the Create Filter successfully', () => {
      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const values = ['1', '2', '3', '4'];
      const job = {
        name: 'createCampoA',
        type: 'create',
        fieldName: 'campoA',
        fieldValue: 'A'
      };

      const expectedResult = {
        fields: ['campoA', 'campo1', 'campo2', 'campo3', 'campo4'],
        values: ['A', '1', '2', '3', '4']
      }

      const result = create(fields, values, job);
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});
