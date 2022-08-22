import SHA256 from 'crypto-js/sha256';
import hex2ascii from 'hex2ascii';

export default class Block {
  constructor(data) {
    this.hash = null;
    this.height = 0;
    this.body = Buffer.from(JSON.stringify(data)).toString('hex');
    this.time = 0;
    this.previousBlockHash = null;
  }

  validate() {
    let self = this;
    return new Promise((resolve, reject) => {
      let currentHash = self.hash;
      let recalculatedHash = SHA256(
        JSON.stringify({
          ...self,
          hash: null,
        })
      ).toString();
      const isValid = currentHash === recalculatedHash;
      resolve(isValid);
    });
  }

  async getBData() {
    let self = this;
    return new Promise((resolve, reject) => {
      if (self.height === 0) {
        reject(new Error('Cannot get data from genesis block'));
      }
      const decodedData = JSON.parse(hex2ascii(self.body));
      resolve(decodedData);
    });
  }
}
