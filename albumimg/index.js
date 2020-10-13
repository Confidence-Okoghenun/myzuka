const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const part = require('yargs').argv.part;
const Album = require('../model/album');
const start = Number(require('yargs').argv.start);

const asyncForEach = async (array, callback) => {
  for (let index = start; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const scrape = async () => {
  const partArr = JSON.parse(fs.readFileSync(`part${part}.json`));
  const albums = JSON.parse(fs.readFileSync(`album${part}.json`));

  await asyncForEach(partArr, async (part, index) => {
    try {
      console.log(`starting index ${index}`);

      const html = await fetch(albums[part].url)
        .then((res) => res.text())
        .then((body) => body);
      const $ = cheerio.load(html);

      if ($('.main-details .side').find('img').length) {
        const cover = $('.main-details .side').find('img').attr('src');
        const album = await Album.findByIdAndUpdate(
          albums[part]._id['$oid'],
          {
            cover,
          },
          {
            new: true,
          }
        );
        console.log(`completed index ${index} == ${album.cover}`);
      } else {
        console.log(`error in index ${index}`);
      }
    } catch (error) {
      console.log({ error });
    }
  });
};

(async () => {
  console.log(`starting from index ${start} in part ${part}`);
  await mongoose.connect(
    'mongodb://admin:admin4clouddb@34.67.189.163:27017/music?authSource=admin',
    {
      useCreateIndex: true,
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  );
  scrape();
})();
