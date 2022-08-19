import SHA256 from 'crypto-js/sha256.js';
import { Block } from './block.js';
import { verify } from 'bitcoinjs-message';

export default class Blockchain {
  constructor() {
    this.chain = [];
    this.height = -1;
    this.initializeChain();
  }

  async initializeChain() {
    if (this.height === -1) {
      let block = new Block({
        data: 'Welcome to Cheesecake Blocks!',
      });
      await this._addBlock(block);
    }
  }

  getChainHeight() {
    return new Promise((resolve, reject) => {
      resolve(this.height);
    });
  }

  _addBlock(block) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      try {
        block.height = self.height + 1;
        block.time = parseInt(new Date().getTime().toString().slice(0, -3));
        block.previousBlockHash = self?.chain[self.height]?.hash;
        block.hash = SHA256(JSON.stringify(block)).toString();
        self.chain.push(block);
        self.height = self.height + 1;
        resolve(block);
      } catch (error) {
        reject(error);
      }
    });
  }

  requestMessageOwnershipVerification(address) {
    return new Promise((resolve) => {
      resolve(
        `${address}:${new Date()
          .getTime()
          .toString()
          .slice(0, -3)}:starRegistry`
      );
    });
  }

  submitStar(address, message, signature, star) {
    let self = this;
    return new Promise(async (resolve, reject) => {
      let time = parseInt(message.split(':')[1]);
      let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
      if (currentTime - time < 300) {
        if (verify(message, address, signature)) {
          let block = new Block({
            owner: address,
            star: star,
          });
          await self._addBlock(block);
          resolve(block);
        } else {
          reject('Invalid signature');
        }
      } else {
        reject('Time elapsed');
      }
    });
  }

  getBlockByHash(hash) {
    let self = this;
    return new Promise((resolve, reject) => {
      let block = self.chain.filter((p) => p.hash === hash)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  getBlockByHeight(height) {
    let self = this;
    return new Promise((resolve, reject) => {
      let block = self.chain.filter((p) => p.height === height)[0];
      if (block) {
        resolve(block);
      } else {
        resolve(null);
      }
    });
  }

  getStarsByWalletAddress(address) {
    let self = this;
    let stars = [];
    return new Promise(async (resolve, reject) => {
      for (let i = 1; i < self.chain.length; i++) {
        const decodedBody = await self.chain[i].getBData();
        if (decodedBody.owner === address) {
          stars.push(decodedBody);
        }
      }
      resolve(stars);
    });
  }

  validateChain() {
    let self = this;
    let errorLog = [];
    return new Promise(async (resolve, reject) => {
      for (let i = 0; i < self.chain.length; i++) {
        let block = self.chain[i];
        if (i === 0) {
          if (block.hash !== block.calculateHash()) {
            errorLog.push(`Invalid hash for block ${i}`);
          }
        } else {
          if (block.hash !== block.calculateHash()) {
            errorLog.push(`Invalid hash for block ${i}`);
          }
          if (block.previousBlockHash !== self?.chain[i - 1]?.hash) {
            errorLog.push(`Invalid previous hash for block ${i}`);
          }
        }
      }
      if (errorLog.length > 0) {
        reject(errorLog);
      } else {
        resolve(true);
      }
    });
  }
}
