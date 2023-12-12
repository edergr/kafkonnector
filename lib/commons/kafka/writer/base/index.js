const logger = require('../../../logger');

class WriterBase {
  constructor(config, writerFactory) {
    this._writerInstance = writerFactory(config);

    this._canRetry = true;
    this._interval = null;
  }

  async connect() {
    await this._writerInstance.connect();
  }

  /**
   * Envia mensagens para o kafka.
   *
   * Suporta validaçãoes de mensagens por schemas (json-schema ou avro) cadastrados no schema-registry.
   * @param {string} topic Nome do tópico.
   * @param {(string|object)} messageValue Valor da mensagem. Pode ser um objeto ou uma string.
   * @param {(?string|object)} messageKey Chave da mensagem (opcional). Pode ser um objeto ou uma string.
   * @param {?{
   *  keyId: [number],
   *  valueId: [number]
   * }} schema Objeto contendo os ids dos schemas, cadastrados no schema-registry,
   * usados para validar o valor e a chave da mensagem.
  */
  async write(topic, messageValue, messageKey, schema) {
    try {
      return await this._writerInstance.write(topic, messageValue, messageKey, schema);
    } catch (error) {
      logger.error(
        '[KAFKA] - Could not write message: Topic: %s, value: %o, key: %o, error: %s',
        topic,
        messageValue,
        messageKey,
        error.message
      );
      if (this._saveMessage) {
        await this._saveMessage({
          topic,
          messageValue,
          messageKey,
          schema,
          retries: 0,
          errorMessage: error.message
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * Injeta as dependências e inicia o fluxo automático de retentativa de escrita de mensagens.
   *
   * Atenção: mensagens que tenham dado erros na etapa de validação por schema
   * não serão tratadas pelo fluxo de retentativa automática.
   *
   * O uso deste fluxo automático é opcional.
   * Caso a aplicação não use essa funcionalidade,
   * todos os erros de escrita continuarão lançando exceções a serem tratadas na aplicação.
   * @param {function} saveMessage Função para persistir mensagem a ser retentada. Deve retornar um Promise.
   * @param {function} getMessages Função para recuperar lotes de mensagens a serem retentadas.
   * Deve retornar uma instância de AsyncIterator.
   * @param {function} deleteMessage Função para remover mensagem que já tenha sido retentada.
   * Deve retornar uma Promise.
   * @param {number} [intervalTime=10000] Intervalo, em ms, entre os ciclos de retentativa de envio dos lotes
   * de mensagens. Caso não seja informado será usado o intervalo padrão de 10 segundos.
   */
  setFailOverMethods(saveMessage, getMessages, deleteMessage, intervalTime) {
    this._saveMessage = saveMessage;
    this._getMessages = getMessages;
    this._deleteMessage = deleteMessage;

    this._startRetryMessages(intervalTime);
  }

  async _retryMessages() {
    if (!this._canRetry || !this._writerInstance.isReady()) {
      return;
    }

    this._canRetry = false;

    const messagesToRetry = this._getMessages();

    if (!(Symbol.asyncIterator in Object(messagesToRetry))) {
      logger.error(
        '[KAFKA] - Could not retry messages. "getMessages" should return an AsyncIterator'
      );
      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    for await (const message of messagesToRetry) {
      const {
        topic,
        messageValue,
        messageKey,
        schema,
        retries
      } = message;
      let errorOnSave;
      try {
        await this._writerInstance.write(topic, messageValue, messageKey, schema);
      } catch (error) {
        if (!this._writerInstance.isReady()) {
          break;
        }
        logger.error(
          '[KAFKA] - Could not retry message: Topic: %s, value: %o, key: %o, error: %s',
          topic,
          messageValue,
          messageKey,
          error.message
        );

        errorOnSave = await this._saveMessage({
          topic,
          messageValue,
          messageKey,
          schema,
          retries: retries + 1,
          errorMessage: error.message
        }).catch((errorSaved) => {
          logger.error(
            `[KAFKA] - Could not saved message: ${errorSaved}`
          );
          return true;
        });
      }

      if (!errorOnSave) {
        await this._deleteMessage(message)
          .catch((errorDelete) => logger.error(
            `[KAFKA] - Could not delete message: ${errorDelete}`
          ));
      }
    }

    this._canRetry = true;
  }

  async disconnect() {
    this._stopRetryMessages();
    await this._writerInstance.disconnect();
  }

  _startRetryMessages(intervalTime = 10000) {
    this._interval = setInterval(this._retryMessages.bind(this), intervalTime);
  }

  _stopRetryMessages() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

module.exports = WriterBase;
