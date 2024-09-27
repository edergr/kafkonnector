const assert = require('assert');
const drop = require('../../../../../lib/data-processor/utils/filters/drop');

describe('Drop and PositionedDrop filters unit test', () => {
  describe('Success Cases', () => {
    const testCases = [
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '===',
            value: '1'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '!==',
            value: 'A'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '>',
            value: '0'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '<',
            value: '2'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '>=',
            value: '1'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '<=',
            value: '1'
          }
        },
        expectedResult: true
      },
      {
        description: 'Should not apply the filter Drop with operator: ',
        job: {
          name: 'dropCampo1',
          type: 'drop',
          fieldTarget: 'campo1',
          comparison: {
            operator: '!!!',
            value: '1'
          }
        },
        expectedResult: false
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

      const fields = ['campo1', 'campo2'];
      const values = ['1', '12345'];

      testItCase(`${description}${job.comparison.operator}`, () => {
        const result = drop(fields, values, job);
        assert.deepStrictEqual(result, expectedResult);
      });
    });

    it('Should apply the filter positionedDrop with operator: ===', () => {
      const job = {
        name: 'dropCampo2',
        type: 'positionedDrop',
        fieldTarget: 'campo2',
        comparison: {
          operator: '===',
          value: '3',
          digit: 2
        }
      };
      const expectedResult = true;
      const fields = ['campo1', 'campo2'];
      const values = ['1', '12345'];

      const result = drop(fields, values, job, true);
      assert.deepStrictEqual(result, expectedResult);
    });
  });
});