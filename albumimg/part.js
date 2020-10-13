const part = 4;
const fs = require('fs');
const partFile = JSON.parse(fs.readFileSync(`part${part}.json`));
const albumsFile = JSON.parse(fs.readFileSync('albums.json'));

fs.appendFileSync(`album${part}.json`, '[');
partFile.forEach((i) => {
  console.log(i);
  fs.appendFileSync(`album${part}.json`, `,${JSON.stringify(albumsFile[i])}`);
});
fs.appendFileSync(`album${part}.json`, ']');
