const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const part = require('yargs').argv.part;
const Artist = require('../model/artist');
require('dotenv').config({ path: '../.env' });

const stop = Number(JSON.parse(`"${fs.readFileSync('./stop.txt')}"`));
let start = stop === 0 ? stop : stop + 1;

const asyncForEach = async (array, callback) => {
  for (let index = start; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const scrape = async () => {
  const dataArr = JSON.parse(fs.readFileSync(`data${part}.json`));

  await asyncForEach(dataArr, async ({ name, url }, index) => {
    try {
      const html = await fetch(url)
        .then((res) => res.text())
        .then((body) => body);

      console.log(`starting index ${index}`);
      const $ = cheerio.load(html);

      if ($('body').find('#bodyContent').length) {
        const cover = $('.main-details .side .vis').find('img').attr('src');

        const artist = await Artist.findOneAndUpdate(
          { name },
          { cover, url, name },
          {
            new: true,
            upsert: true,
          }
        );

        fs.writeFileSync('stop.txt', index);
        console.log(`processed index ${index} :: ${artist.name}`);
      } else {
        console.log(`error in index ${index}`);
        start = index + 1;
        scrape();
      }
    } catch (error) {
      console.log({ error });
    }
  });
};

(async () => {
  await mongoose.connect(process.env.dbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  scrape();
})();
