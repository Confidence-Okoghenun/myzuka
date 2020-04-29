const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const controller = require('./controller');
require('dotenv').config({ path: '../.env' });
const Song = require('./model/internetSong');
const Album = require('./model/internetAlbum');
const Artist = require('./model/internetArtist');
const Genre = require('./model/internetGenre');

let start = 0;
let loopTimeOutId = 0;

const asyncForEach = async (albumsArr, callback) => {
  const myLoop = () => {
    loopTimeOutId = setTimeout(async () => {
      await callback(albumsArr[start], start);
      start++;
      if (start <= albumsArr.length - 1) {
        myLoop();
      }
    }, 15000);
  };
  myLoop();
};

const scrape = async (albumsArr) => {
  await asyncForEach(albumsArr, async (album, index) => {
    try {
      const artist = await Promise.all(
        album.albumArtist.map(async (artist) => {
          const { _id } = await controller.findOrCreate(Artist, {
            name: artist.name
          });
          return _id;
        })
      );

      const genre = await Promise.all(
        album.albumGenre.map(async (item) => {
          const { _id } = await controller.findOrCreate(Genre, {
            name: item
          });
          return _id;
        })
      );

      const _album = await controller.create(Album, {
        genre,
        artist,
        url: album.albumUrl,
        cover: album.albumArt,
        name: album.albumName,
        year: album.albumYear
      });

      const page = await fetch(album.albumUrl)
        .then((res) => res.text())
        .then((body) => body);

      console.log(`processing album ${index}`);
      // console.log(page);
      const $ = cheerio.load(page);
      if ($('body').find('#bodyContent').length) {
        $('.player-inline')
          .map((i, elem) => {
            // const url =
            //   'https://myzuka.club' + $(elem).find('span.ico').attr('data-url');

            const name = $(elem)
              .find('span.ico')
              .attr('data-title')
              .split(' - ')[1];

            const duration = $(elem)
              .find('.options .data')
              .text()
              .split('|')[0]
              .trim();
            const isLost = $(elem).find('.details .label-danger').text()
              ? true
              : false;

            const song = {
              name,
              duration
            };

            if (isLost) {
              return {};
            } else {
              return song;
            }
          })
          .get()
          .reduce((promiseChain, song) => {
            return promiseChain.then(
              () =>
                new Promise(async (resolve) => {
                  try {
                    const doc = await controller.create(Song, {
                      ...song,
                      album: _album._id
                    });
                    resolve();
                  } catch (err) {
                    // song not saved
                    resolve();
                  }
                })
            );
          }, Promise.resolve())
          .then(async () => {
            fs.writeFile('stop.txt', index, (err) => {
              if (err) console.log(err);
              console.log(`saved album ${index}`);
            });
          });
      } else {
        start = 10000000000;
        clearTimeout(loopTimeOutId);
        console.log(`error in album ${index}, sleeping`);
        setTimeout(() => {
          start = index;
          scrape();
        }, 120000);
      }
    } catch (err) {
      console.log('could not fetch');
    }
  });
};

const init = async () => {
  await mongoose.connect(process.env.dbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  fs.readFile('../data/albums2.json', (err, data) => {
    if (err) console.log(err);
    const albums = JSON.parse(data);
    scrape(albums);
  });
};
init();
