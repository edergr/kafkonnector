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
      'Abacate;Maça;Banana;Uva',
      'Maracuja;Groselha;Kiwi;Manga',
      'Melancia;Pera;Goiaba;Mamao',
    ];
    const name = 'saladaDeFruta';

    const document = {
      delimiter: ';',
      fieldNames: 'campo1;campo2;campo3;campo4',
      filters: {
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
      },
      topic: 'event-streaming.track-salada-frutas'
    };

    it('Should process successfully without retry', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      const expectRestul = { retry: false, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectRestul);
    });

    it('Should process successfully without filters', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      delete document.filters;

      const expectRestul = { retry: false, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectRestul);
    });

    it('Should process successfully with retry and without kafka write errors', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').resolves();

      document.retry = true;

      const expectRestul = { retry: true, failData: [] };

      const result = await processData(data, name);

      assert.deepEqual(result, expectRestul);
    });

    it('Should process successfully with retry and kafka write errors', async () => {
      sandbox.stub(configurationsRepository, 'findOne').resolves(document);
      sandbox.stub(streamWriter, 'write').rejects();

      document.retry = true;
      data[1] = '';

      const expectRestul = {
        retry: true, failData: [
          'Abacate;Maça;Banana;Uva',
          'Melancia;Pera;Goiaba;Mamao',
        ]
      };

      const result = await processData(data, name);

      assert.deepEqual(result, expectRestul);
    });
  });
});