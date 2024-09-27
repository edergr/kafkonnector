const sinon = require('sinon');
const { assert } = require('chai');
const { processData } = require('../../../lib/data-processor');
const configurationsRepository = require('../../../lib/commons/repository/configurations');
const { streamWriter } = require('../../../lib/streams/kafka/manager');

describe('Process Data unit test', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => sandbox.restore());

  describe('Success Cases', () => {
    const data = [
      'Abacate Maça    BananaUva  ',
      'MaracujaGroselhaKiwi  Manga',
      'MelanciaPera    GoiabaMamao',
    ];
    const name = 'saladaDeFruta';

    const document = {
      propertiesPosition: [0, 8, 16, 22],
      delimiter: ';',
      fieldNames: 'campo1;campo2;campo3;campo4',
      filters: {
        sequence: 'dropCampo1;renameCampo1;removeCampo2;appendCampo3e4',
        jobs: [
          {
            name: 'dropCampo1',
            type: 'drop',
            fieldTarget: 'campo1',
            comparison: {
              operator: '===',
              value: 'Melancia'
            }
          },
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
      },
      topic: 'event-streaming.track-salada-frutas'
    };

    it('Should process successfully without retry', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      const expectedResult = { retry: false, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectedResult);
    });

    it('Should process successfully without filters', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      delete document.filters;

      const expectedResult = { retry: false, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectedResult);
    });

    it('Should process successfully with retry and without kafka write errors', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      document.retry = true;

      const expectedResult = { retry: true, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectedResult);
    });

    it('Should process successfully with retry and kafka write errors', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').rejects();

      document.retry = true;
      data[1] = '';

      const expectedResult = {
        retry: true, failData: [
          "Abacate Maça    BananaUva  ",
          "MelanciaPera    GoiabaMamao"
        ]
      };

      const result = await processData(data, name);

      assert.deepEqual(result, expectedResult);
    });
  });
});