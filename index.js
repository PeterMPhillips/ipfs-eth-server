const Web3 = require('web3');
const IPFS = require('ipfs');
const fs = require('fs');
const network = 'rinkeby';


if(fs.existsSync('keys.json')){
  var json = JSON.parse(fs.readFileSync('./keys.json', 'utf8'));
  infura_key = json.infura;
}

const ipfs = new IPFS({
  repo: '~/.ipfs'
});
const web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://${network}.infura.io/ws/v3/${infura_key}`));
//const eventProvider = new Web3.providers.WebsocketProvider('ws://localhost:8545');

const Identity = require('./contracts/Identity');
const identityContract = new web3.eth.Contract(
  Identity.ABI,
  Identity.ADDRESS
);

ipfs.on('ready', () => {
  identityContract.getPastEvents('NewSubmission', {
    filter:{},
    fromBlock: 0,
    toBlock: 'latest'
  }, (error, events) => {
    events.forEach((event) => {
      let hash = event.returnValues.ipfs;
      console.log(hash);
      ipfs.pin.ls(hash, (err, pinset) => {
        if(err) {
          console.log('Pinning hash...');
          ipfs.pin.add(hash);
        }
        if(pinset){
          console.log('Hash already pinned');
        }
      });
    });
  });

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
          ipfs.pin.add(hash);
        }
        if(pinset){
          console.log('Hash already pinned');
        }
      })
    }
  });
});
