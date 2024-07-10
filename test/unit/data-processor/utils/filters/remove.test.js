const assert = require('assert');
const remove = require('../../../../../lib/data-processor/utils/filters/remove');

describe('Remove filter unit test', () => {
  describe('Success Cases', () => {
    const testCases = [
      {
        description: 'Should apply the Remove filter for only one field successfully',
        job: {
          name: 'removeCampo1',
          type: 'remove',
          fieldTarget: 'campo1'
        },
        expectedResult: {
          fields: ['campo2', 'campo3', 'campo4'],
          values: ['2', '3', '4']
        }
      },
      {
        description: 'Should apply the Remove filter for an array successfully',
        job: {
          name: 'removeCampo1Campo2Campo3',
          type: 'remove',
          fieldTarget: ['campo1', 'campo2', 'campo3']
        },
        expectedResult: {
          fields: ['campo4'],
          values: ['4']
        }
      },
    ];

    testCases.forEach((successCase) => {
      const {
        only,
        description,
        job,
        expectedResult,
      } = successCase;
      const testItCase = only ? it.only : it;

      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const values = ['1', '2', '3', '4'];

      testItCase(description, () => {
        const result = remove(fields, values, job);
        assert.deepStrictEqual(result, expectedResult);
      });
    });
  });
});
