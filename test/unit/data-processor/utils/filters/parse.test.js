const assert = require('assert');
const parse = require('../../../../../lib/data-processor/utils/filters/parse');

describe('Parse filter unit test', () => {
  describe('Success Cases', () => {
    const testCases = [
      {
        description: 'Should apply the filter Parse successfully to int',
        job: {
          name: 'parseIntCampo1',
          type: 'parse',
          parseType: 'int',
          fieldTarget: 'campo1',
        },
        expectedResult: {
          fields: ['campo1', 'campo2', 'campo3'],
          values: [1, '2', '3']
        }
      },
      {
        description: 'Should apply the filter Parse successfully to string',
        job: {
          name: 'parseStringCampo1',
          type: 'parse',
          parseType: 'string',
          fieldTarget: 'campo1',
        },
        expectedResult: {
          fields: ['campo1', 'campo2', 'campo3'],
          values: ['1', '2', '3']
        }
      }
    ];

    testCases.forEach((successCase) => {
      const {
        only,
        description,
        job,
        expectedResult,
      } = successCase;
      const testItCase = only ? it.only : it;

      const fields = ['campo1', 'campo2', 'campo3'];
      const values = ['1', '2', '3'];

      testItCase(description, () => {
        const result = parse(fields, values, job);
        assert.deepStrictEqual(result, expectedResult);
      });
    });
  });
});