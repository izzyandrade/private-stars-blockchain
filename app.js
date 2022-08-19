import express from 'express';
import morgan from 'morgan';
import { urlencoded, json } from 'body-parser';
import { Blockchain } from './src/components/blockchain.js';

class ApplicationServer {
  constructor() {
    this.app = express();
    this.blockchain = new Blockchain();
    this.initExpress();
    this.initExpressMiddleWare();
    this.initControllers();
    this.start();
  }

  initExpress() {
    this.app.set('port', 8000);
  }

  initExpressMiddleWare() {
    this.app.use(morgan('dev'));
    this.app.use(urlencoded({ extended: true }));
    this.app.use(json());
  }

  initControllers() {
    require('./src/controllers/BlockchainController.js')(
      this.app,
      this.blockchain
    );
  }

  start() {
    let self = this;
    this.app.listen(this.app.get('port'), () => {
      console.log(`Server Listening for port: ${self.app.get('port')}`);
    });
  }
}

new ApplicationServer();
