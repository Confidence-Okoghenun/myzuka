const fs = require('fs');
const mongoose = require('mongoose');
const download = require('download');
const part = require('yargs').argv.part;
const Artist = require('../model/artist');
const start = Number(require('yargs').argv.start);
const { Storage } = require('@google-cloud/storage');

const asyncForEach = async (array, callback) => {
  for (let index = start; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const scrape = async () => {
  const bucketName = 'cdn.osdbapi.com';
  const storage = new Storage({ keyFilename: 'key.json' });
  const baseImageURL = 'https://cdn.osdbapi.com/images/artist';
  const artist = JSON.parse(fs.readFileSync(`artist${part}.json`));

  await asyncForEach(artist, async (artist, index) => {
    try {
      const {
        cover,
        _id: { $oid: id },
      } = artist;
      const update = { cover: null };
      if (!cover || cover.includes('default')) {
        update.cover = `${baseImageURL}/default.jpg`;
      } else {
        const filename = `${id}.jpg`;
        const filePath = `./downloads/${id}.jpg`;
        const destination = `images/artist/${filename}`;

        await download(cover, './downloads', { filename });
        await storage.bucket(bucketName).upload(filePath, {
          destination,
          metadata: {
            cacheControl: 'public, max-age=31536000',
          },
        });
        fs.unlinkSync(filePath);

        update.cover = `${baseImageURL}/${filename}`;
      }
      await Artist.findByIdAndUpdate(id, update);
      console.log('processed index: ', index);
    } catch (error) {
      console.log('error: ', index);
      console.log({ error });
    }
  });
};

(async () => {
  console.log(`starting from index ${start} in part ${part}`);
  await download(process.env.keyURL, './');
  await mongoose.connect(process.env.dbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  scrape();
})();
