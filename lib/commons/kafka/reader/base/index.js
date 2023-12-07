class ReaderBase {
    constructor(config, readerFactory) {
      this._readerService = readerFactory(config);
    }
  
    async connect() {
      await this._readerService.connect();
    }
  
    async disconnect() {
      await this._readerService.disconnect();
    }
  
    async startConsume(handler) {
      await this._readerService.startConsume(handler);
    }
  
    async stopConsume() {
      await this._readerService.stopConsume();
    }
  }
  
  module.exports = ReaderBase;
  