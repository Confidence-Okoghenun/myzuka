const fs = require('fs');

const part = 4;
const start = 623457;
const stop = 831278;
const albums = JSON.parse(fs.readFileSync('./albums.json'));
const fileName = `./album${part}.json`;

fs.appendFileSync(fileName, '[')

for(let i = start; i < stop; i ++) {
  fs.appendFileSync(fileName, `${JSON.stringify(albums[i])},`)
}
fs.appendFileSync(fileName, ']')
console.log('done')