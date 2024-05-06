const sinon = require('sinon');
const { assert } = require('chai');
const { logger } = require('../../../../lib/commons');
const applyFilters = require('../../../../lib/data-processor/utils/apply-filters');

describe('Apply Filsters unit test', () => {
  describe('Success Cases', () => {
    it('Should apply all filters successfully', () => {
      const line = 'Abacate;Maça;Banana;Uva'
      const delimiter = ';';
      const fieldNames = 'campo1;campo2;campo3;campo4';
      const filters = {
        sequence: 'renameCampo1;removeCampo2;appendCampo3e4',
        jobs: [
          {
            name: 'renameCampo1',
            type: 'rename',
            field: 'campo1',
            target: 'campoUm'
          },
          {
            name: 'removeCampo2',
            type: 'remove',
            field: 'campo2'
          },
          {
            name: 'appendCampo3e4',
            type: 'append',
            firstField: 'campo3',
            secondField: 'campo4',
            newFieldName: 'campo3e4'
          }
        ]
      };

      const expectRestul = { newNames: 'campoUm;campo3e4', newLine: 'Abacate;BananaUva' };
      const result = applyFilters(filters, delimiter, fieldNames, line);

      assert.deepEqual(result, expectRestul);
    });

    it('Should logging error if the type does not exists', () => {
      sinon.spy(logger, 'error');

      const line = 'Abacate'
      const delimiter = ';';
      const fieldNames = 'campo1';
      const filters = {
        sequence: 'renameCampo1',
        jobs: [
          {
            name: 'renameCampo1',
            field: 'campo1',
            target: 'campoUm'
          }
        ]
      };

      applyFilters(filters, delimiter, fieldNames, line);

      sinon.assert.calledOnceWithExactly(
        logger.error,
        'Undefined type: %s',
        JSON.stringify(filters.jobs[0])
      )
    });
  });
});