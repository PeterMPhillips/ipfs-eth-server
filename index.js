const Web3 = require('web3');
const IPFS = require('ipfs');
const fs = require('fs');
const network = 'rinkeby';


if(fs.existsSync('keys.json')){
  var json = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));
  mnemonic = json.mnemonic;
  infura_key = json.infura;
}

const ipfs = new IPFS({
  repo: './ipfs',
  init: false,
  config: {
    Addresses: {
      Gateway: '/ip4/0.0.0.0/tcp/8080'
    }
  }
});
const web3 = new Web3();
//const eventProvider = new Web3.providers.WebsocketProvider(`ws://${network}.infura.io/v3/${infura_key}`);
const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545');
web3.setProvider(eventProvider)

const Identity = require('./contracts/Identity');
const identityContract = new web3.eth.Contract(
  Identity.ABI,
  Identity.ADDRESS
);

ipfs.on('ready', () => {
  identityContract.events.NewSubmission({
    filter: {},
    fromBlock: 0
  }, (error, event) => {
    if(error) console.log(error);
    if(event) {
      let hash = event.returnValues.ipfs;
      ipfs.pin.ls(hash, (err, pinset) => {
        if(err) {
          console.log('Pinning hash...');
          ipfs.pin.add(ipfsHash);
        }
        if(pinset){
          console.log('Hash already pinned');
        }
      })
    }
  });
});
