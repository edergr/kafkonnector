const { assert } = require('chai');
const sinon = require('sinon');
const Chance = require('chance');
const { logger } = require('../../../../lib/commons');
const { streams } = require('../../../../lib/commons/kafka');

const chance = new Chance();

describe('Unit kafka writer', () => {
  it('Create success instance with avroSerializer', () => {
    const instance = new streams.Writer(
      {
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'sunda'
      },
      { url: 'localhost:0000' }
    );

    assert.isObject(instance._writerInstance, '_writerInstance not found!');
    assert.isDefined(
      instance._writerInstance._schemaHandler,
      '_schemaHandler is not defined!'
    );
  });

  it('Using write without connect', async () => {
    const instance = new streams.Writer(
      {
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'sunda'
      },
      { url: 'localhost:0000' }
    );

    let errorMessage;

    try {
      await instance.write('test', '', '', '');
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.strictEqual(errorMessage, 'The instance is not ready.');
    }
  });

  it('Validation required kafkaConfig field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Writer();
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'kafkaConfig is required');
    }
  });

  it('Validation required clientId field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Writer({});
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'client.id is required');
    }
  });

  it('Validation required bootstrapServers field', () => {
    let instance;
    let errorMessage;

    try {
      instance = new streams.Writer({ 'client.id': 'foo' });
    } catch (err) {
      errorMessage = err.message;
    } finally {
      assert.isUndefined(instance);
      assert.strictEqual(errorMessage, 'bootstrap.servers is required');
    }
  });

  describe('Handling errors on write message', () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => sandbox.restore());

    it('Should handle retriable errors and call the injected method to save the message', async () => {
      const instance = new streams.Writer({
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'sunda'
      });
      sandbox
        .stub(instance._writerInstance._writerInstance, 'connect')
        .resolves({});
      sandbox
        .stub(instance._writerInstance._writerInstance, 'send')
        .rejects(new Error('error to test'));

      const loggerSpyError = sandbox.spy(logger, 'error');
      const spy = sandbox.spy();
      instance.setFailOverMethods(spy);
      instance._stopRetryMessages();
      await instance.connect();
      await instance.write('foo', 'baar', null, undefined);
      sinon.assert.calledOnce(spy);
      sinon.assert.calledWith(
        loggerSpyError,
        '[KAFKA] - Could not write message: Topic: %s, value: %o, key: %o, error: %s'
      );
    });

    it('Should throw the error if the method to save messages to retry is not defined', async () => {
      const instance = new streams.Writer({
        'bootstrap.servers': 'localhost:9092',
        'client.id': 'sunda'
      });
      const errorResult = new Error('error to test');
      sandbox
        .stub(instance._writerInstance._writerInstance, 'connect')
        .resolves({});
      sandbox
        .stub(instance._writerInstance._writerInstance, 'send')
        .rejects(errorResult);

      await instance.connect();
      const result = await instance
        .write('foo', 'baar', null, undefined)
        .catch((reason) => reason);
      assert.deepEqual(result, errorResult);
    });
  });

  describe('Retry messages', () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => sandbox.restore());

    const instance = new streams.Writer({
      'bootstrap.servers': 'localhost:9092',
      'client.id': 'client_id'
    });

    const buildMessage = (topic, messageValue, messageKey, schema, retries, errorMessage = null) => ({
      topic,
      messageValue,
      messageKey,
      schema,
      retries,
      errorMessage
    });


    const buildGetMessagesMethod = (messageList) => async function* () {
      // eslint-disable-next-line no-restricted-syntax
      for (const message of messageList) {
        if (message) {
          yield await Promise.resolve(message);
        }
      }
    };

    it('Should get the records to be retried and try to write them to the kafka', async () => {
      sandbox
        .stub(instance._writerInstance, 'connect')
        .resolves({});
      const sendStub = sandbox
        .stub(instance._writerInstance, 'write')
        .resolves();

      sandbox
        .stub(instance._writerInstance, 'isReady')
        .returns(true);

      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();

      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await instance._retryMessages();
      sinon.assert.calledTwice(sendStub);
      sinon.assert.calledWith(
        sendStub,
        messageOne.topic,
        messageOne.messageValue,
        messageOne.messageKey,
        messageOne.schema
      );
      sinon.assert.calledWith(
        sendStub,
        messageTwo.topic,
        messageTwo.messageValue,
        messageTwo.messageKey,
        messageTwo.schema
      );
      sinon.assert.calledTwice(deleteMessageSpy);
      sinon.assert.calledWith(deleteMessageSpy, messageOne);
      sinon.assert.calledWith(deleteMessageSpy, messageTwo);
    });

    it('Should not run the retryMessages method again if one is already running', async () => {
      sandbox
        .stub(instance._writerInstance, 'connect')
        .resolves({});
      const sendStub = sandbox
        .stub(instance._writerInstance, 'write')
        .resolves();
      sandbox
        .stub(instance._writerInstance, 'isReady')
        .returns(true);

      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();

      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await Promise.all([instance._retryMessages(), instance._retryMessages()]);
      sinon.assert.calledTwice(sendStub);
      sinon.assert.calledWith(
        sendStub,
        messageOne.topic,
        messageOne.messageValue,
        messageOne.messageKey,
        messageOne.schema
      );
      sinon.assert.calledWith(
        sendStub,
        messageTwo.topic,
        messageTwo.messageValue,
        messageTwo.messageKey,
        messageTwo.schema
      );
      sinon.assert.calledTwice(deleteMessageSpy);
      sinon.assert.calledWith(deleteMessageSpy, messageOne);
      sinon.assert.calledWith(deleteMessageSpy, messageTwo);
    });

    it(`Should execute the retryMessages method again if 
       execution of the previous method has already been completed`, async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});
      const sendStub = sandbox.stub(instance._writerInstance, 'write').resolves();
      sandbox.stub(instance._writerInstance, 'isReady').returns(true);
      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();
      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };
      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);
      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);
      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      assert.isTrue(instance._canRetry);
      await instance._retryMessages();
      assert.isTrue(instance._canRetry);
      await instance._retryMessages();
      sinon.assert.callCount(sendStub, 4);
      sinon.assert.callCount(deleteMessageSpy, 4);
    });

    it('Should save a new item and increment the retries (counter) if the retry fails', async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});

      const writeErrorMessage = 'custom error on write function';
      const sendStub = sandbox.stub(instance._writerInstance, 'write').rejects(new Error(writeErrorMessage));
      sandbox.stub(instance._writerInstance, 'isReady').returns(true);

      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();
      const loggerSpyError = sandbox.spy(logger, 'error');

      const insertFn = (messageData) => {
        insertMessageSpy(messageData);
        return Promise.resolve();
      };
      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0, writeErrorMessage);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0, writeErrorMessage);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertFn, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await instance._retryMessages();
      sinon.assert.calledTwice(sendStub);
      sinon.assert.calledTwice(deleteMessageSpy);
      sinon.assert.calledTwice(insertMessageSpy);
      sinon.assert.calledWith(insertMessageSpy, { ...messageOne, retries: 1 });
      sinon.assert.calledWith(insertMessageSpy, { ...messageTwo, retries: 1 });
      sinon.assert.calledWith(
        loggerSpyError,
        '[KAFKA] - Could not retry message: Topic: %s, value: %o, key: %o, error: %s'
      );
    });

    it('Should not call "deleteMessage" if it gets an error to save the new record', async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});
      const sendStub = sandbox.stub(instance._writerInstance, 'write')
        .rejects(new Error('custom error to test'));
      sandbox.stub(instance._writerInstance, 'isReady').returns(true);


      const errorOnInsert = 'custom error on insert function';
      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();

      const insertFn = (messageData) => {
        insertMessageSpy(messageData);
        return Promise.reject(new Error(errorOnInsert));
      };
      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0, errorOnInsert);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0, errorOnInsert);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertFn, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await instance._retryMessages();
      sinon.assert.calledTwice(sendStub);
      sinon.assert.notCalled(deleteMessageSpy);
    });

    it('Should not retry messages if the instance is not ready', async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});
      const sendStub = sandbox.stub(instance._writerInstance, 'write').resolves();
      sandbox.stub(instance._writerInstance, 'isReady').returns(false);

      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();

      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await instance._retryMessages();
      sinon.assert.notCalled(sendStub);
      sinon.assert.notCalled(deleteMessageSpy);
    });

    it('Should run the retryMessages method in a time interval', async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});
      const sendStub = sandbox.stub(instance._writerInstance, 'write').resolves();

      sandbox.stub(instance._writerInstance, 'isReady').returns(true);

      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();

      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };

      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);

      const getMessages = buildGetMessagesMethod([messageOne, messageTwo]);

      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn, 10);
      await instance.connect();

      await new Promise((res) => setTimeout(res, 25));
      instance._stopRetryMessages();

      sinon.assert.callCount(sendStub, 4);
      sinon.assert.calledWith(
        sendStub,
        messageOne.topic,
        messageOne.messageValue,
        messageOne.messageKey,
        messageOne.schema
      );
      sinon.assert.calledWith(
        sendStub,
        messageTwo.topic,
        messageTwo.messageValue,
        messageTwo.messageKey,
        messageTwo.schema
      );
      sinon.assert.callCount(deleteMessageSpy, 4);
      sinon.assert.calledWith(deleteMessageSpy, messageOne);
      sinon.assert.calledWith(deleteMessageSpy, messageTwo);
    });

    it('Should stop the retry flow if the writer service disconnects', async () => {
      sandbox.stub(instance._writerInstance, 'connect').resolves({});
      const sendStub = sandbox.stub(instance._writerInstance, 'write')
        .onFirstCall()
        .resolves()
        .onSecondCall()
        .rejects(new Error('custom erro 2 test'));
      sandbox.stub(instance._writerInstance, 'isReady')
        .onFirstCall()
        .returns(true)
        .onSecondCall()
        .returns(false);
      const insertMessageSpy = sandbox.spy();
      const deleteMessageSpy = sandbox.spy();
      const deleteFn = (messageData) => {
        deleteMessageSpy(messageData);
        return Promise.resolve();
      };
      const messageOne = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageTwo = buildMessage(chance.word(), chance.word(), null, null, 0);
      const messageThree = buildMessage(chance.word(), chance.word(), null, null, 0);
      const getMessages = buildGetMessagesMethod([messageOne, messageTwo, messageThree]);
      instance.setFailOverMethods(insertMessageSpy, getMessages, deleteFn);
      instance._stopRetryMessages();
      await instance.connect();
      await instance._retryMessages();
      sinon.assert.calledTwice(sendStub);
      sinon.assert.calledWith(
        sendStub,
        messageOne.topic,
        messageOne.messageValue,
        messageOne.messageKey,
        messageOne.schema
      );
      sinon.assert.calledWith(
        sendStub,
        messageTwo.topic,
        messageTwo.messageValue,
        messageTwo.messageKey,
        messageTwo.schema
      );
      sinon.assert.calledOnce(deleteMessageSpy);
      sinon.assert.calledWith(deleteMessageSpy, messageOne);
    });
  });
});
