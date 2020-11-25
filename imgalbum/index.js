const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const download = require('download');
const part = require('yargs').argv.part;
const Album = require('../model/album');
const start = Number(require('yargs').argv.start);

const asyncForEach = async (array, callback) => {
  for (let index = start; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const scrape = async () => {
  const albums = JSON.parse(fs.readFileSync(`album${part}.json`));
  await asyncForEach(albums, async (album, index) => {
    try {
      const {
        cover,
        _id: { $oid: id },
      } = album;
      await download(cover, './downloads', { filename: id + '.jpg' });
      console.log({ cover, id });
    } catch (error) {
      console.log({ error });
    }
  });
};

(async () => {
  console.log(`starting from index ${start} in part ${part}`);
  // await mongoose.connect(process.env.dbURL,
  await mongoose.connect('mongodb://localhost:27017/myzuka', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  scrape();
})();
