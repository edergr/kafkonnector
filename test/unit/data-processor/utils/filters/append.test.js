const assert = require('assert');
const append = require('../../../../../lib/data-processor/utils/filters/append');

describe('Append and AppendWithValue filters unit test', () => {
  describe('Success Cases', () => {
    const testCases = [
      {
        description: 'Should apply the filter Append successfully',
        job: {
          name: 'appendcampo3e2',
          type: 'append',
          firstField: 'campo3',
          secondField: 'campo2',
          newFieldName: 'campo3e2'
        },
        expectedResult: {
          fields: ['campo1', 'campo3e2', 'campo4'],
          values: ['1', '32', '4']
        }
      },
      {
        description: 'Should apply the filter Append successfully',
        job: {
          name: 'appendcampo2e3',
          type: 'append',
          firstField: 'campo2',
          secondField: 'campo3',
          newFieldName: 'campo2e3'
        },
        expectedResult: {
          fields: ['campo1', 'campo2e3', 'campo4'],
          values: ['1', '23', '4']
        }
      },
      {
        description: 'Should apply the filter Append successfully',
        job: {
          name: 'appendcampo1e2',
          type: 'append',
          firstField: 'campo1',
          secondField: 'campo2',
          newFieldName: 'campo1e2'
        },
        expectedResult: {
          fields: ['campo1e2', 'campo3', 'campo4'],
          values: ['12', '3', '4']
        }
      },
      {
        description: 'Should apply the filter Append successfully',
        job: {
          name: 'appendcampo1e3',
          type: 'append',
          firstField: 'campo1',
          secondField: 'campo3',
          newFieldName: 'campo1e3'
        },
        expectedResult: {
          fields: ['campo1e3', 'campo2', 'campo4'],
          values: ['13', '2', '4']
        }
      },
      {
        description: 'Should apply the filter AppendWithValue with start position successfully',
        job: {
          name: 'appendWithValueCampo1Test123',
          type: 'appendWithValue',
          firstField: 'campo1',
          stringToAppend: 'test123',
          position: 'start',
          newFieldName: 'test123Campo1'
        },
        expectedResult: {
          fields: ['test123Campo1', 'campo2', 'campo3', 'campo4'],
          values: ['test1231', '2', '3', '4']
        }
      },
      {
        description: 'Should apply the filter AppendWithValue with end position successfully',
        job: {
          name: 'appendWithValueTest123Campo1',
          type: 'appendWithValue',
          firstField: 'campo1',
          stringToAppend: 'test123',
          position: 'end',
          newFieldName: 'campo1Test123'
        },
        expectedResult: {
          fields: ['campo1Test123', 'campo2', 'campo3', 'campo4'],
          values: ['1test123', '2', '3', '4']
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

      const fields = ['campo1', 'campo2', 'campo3', 'campo4'];
      const values = ['1', '2', '3', '4'];

      testItCase(description, () => {
        const result = append(fields, values, job);
        assert.deepStrictEqual(result, expectedResult);
      });
    });
  });
});