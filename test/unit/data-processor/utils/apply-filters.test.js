const sinon = require('sinon');
const assert = require('assert');
const { logger } = require('../../../../lib/commons');
const applyFilters = require('../../../../lib/data-processor/utils/apply-filters');

describe('Apply Filsters unit test', () => {
  describe('Success Cases', () => {
    let sandbox;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.spy(logger, 'error');
    });

    afterEach(() => sandbox.restore());

    it('Should apply all filters successfully', () => {
      const lines = [
        '1;19;98133;0000;9999;411;411;03  ; 000;SP;    ;    ;00019;M;N;20051126;20040401;        ',
        '1;11; 2014;1883;1956;011;011;0303;1000;SP;SPO ;011 ;11000;F;N;20051126;19980425;        ',
        '1;31;98836;5828;5828;430;430;01  ; 000;MG;    ;    ;00031;M;N;20230331;20230331;20240101',
      ];
      const delimiter = ';';
      const fieldNames = 'type;ddd;prefix;initialPrefix;finalPrefix;eot;receptorEot;region;sector;uf;localArea;tariffArea;locationId;prefixType;ported;createdDate;initialDate;finalDate';
      const filters = {
        sequence: 'dropFinalDate;dropFixedNumber;removeProperties;renameInitialPrefix;renameFinalPrefix;renameEot;createCountryCode;appendWithValueFinalDate;parseIntDdd',
        jobs: [
          {
            name: 'dropFinalDate',
            type: 'drop',
            fieldTarget: 'finalDate',
            comparison: {
              operator: '!==',
              value: '        '
            }
          },
          {
            name: 'dropFixedNumber',
            type: 'positionedDrop',
            fieldTarget: 'prefix',
            comparison: {
              operator: '===',
              value: ' ',
              digit: 0
            }
          },
          {
            name: 'removeProperties',
            type: 'remove',
            fieldTarget: ['type', 'receptorEot', 'region', 'sector', 'locationId', 'prefixType', 'createdDate']
          },
          {
            name: 'renameInitialPrefix',
            type: 'rename',
            fieldTarget: 'initialPrefix',
            newFieldName: 'rangeStart'
          },
          {
            name: 'renameFinalPrefix',
            type: 'rename',
            fieldTarget: 'finalPrefix',
            newFieldName: 'rangeEnd'
          },
          {
            name: 'renameEot',
            type: 'rename',
            fieldTarget: 'eot',
            newFieldName: 'carrierCode'
          },
          {
            name: 'createCountryCode',
            type: 'create',
            fieldName: 'countryCode',
            fieldValue: '055'
          },
          {
            name: 'appendWithValueFinalDate',
            type: 'appendWithValue',
            firstField: 'finalDate',
            stringToAppend: '123',
            position: 'end',
            newFieldName: 'finalDate'
          },
          {
            name: 'parseIntDdd',
            type: 'parse',
            parseType: 'int',
            fieldTarget: 'ddd',
          }
        ]
      };

      const expectedResult = [
        {
          newNames: [
            'countryCode', 'ddd',
            'prefix', 'rangeStart',
            'rangeEnd', 'carrierCode',
            'uf', 'localArea',
            'tariffArea', 'ported',
            'initialDate', 'finalDate'
          ],
          newLine: [
            '055', 19,
            '98133', '0000',
            '9999', '411',
            'SP', '    ',
            '    ', 'N',
            '20040401', '        123'
          ]
        },
        { drop: true },
        { drop: true }
      ];

      lines.forEach((line, index) => {
        const result = applyFilters(filters, delimiter, fieldNames, line);

        assert.deepStrictEqual(result, expectedResult[index]);
      })
    });

    it('Should logging error if the type does not exists', () => {
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

      sandbox.assert.calledOnceWithExactly(
        logger.error,
        'Undefined type: %s',
        JSON.stringify(filters.jobs[0])
      );
    });
  });
});