const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const Song = require('../model/song');
const Album = require('../model/album');
const Genre = require('../model/genre');
const Artist = require('../model/artist');
const controller = require('./controller');

const part = require('yargs').argv.part || 1;
const start = require('yargs').argv.start || 0;

const scrape = async () => {
  const artists = JSON.parse(fs.readFileSync(`./artist${part}.json`));

  const ForEach = async (array, callback) => {
    for (let index = start; index < array.length; index++) {
      if (array[index].url) {
        await callback(array[index], index, array);
      }
    }
  };

  await ForEach(artists, async ({ url }, index) => {
    try {
      const html = await fetch(`${url}/Albums`)
        .then((res) => res.text())
        .then((body) => body);

      const $ = cheerio.load(html);

      if ($('body').find('#bodyContent').length) {
        $('#result #divAlbumsList .item[data-type="2"]')
          .map((i, elem) => {
            let year;
            const genre = [];
            const cover = $(elem).find('img').attr('src');
            const name = $(elem).find('.title a').text().trim();
            const url =
              'https://myzuka.club' + $(elem).find('.title a').attr('href');

            $(elem)
              .find('.tags a')
              .each((i, a) => {
                const href = $(a).attr('href');
                if (href.includes('Genre')) {
                  genre.push($(a).text().trim());
                } else {
                  year = $(a).text().trim();
                }
              });

            return {
              url,
              name,
              year,
              genre,
              cover,
            };
          })
          .get()
          .reduce((promiseChain, _album) => {
            return promiseChain.then(
              () =>
                new Promise(async (resolve) => {
                  try {
                    const page = await fetch(_album.url)
                      .then((res) => res.text())
                      .then((body) => body);

                    const $ = cheerio.load(page);
                    if ($('body').find('#bodyContent').length) {
                      const _artists = $('body')
                        .find('a[itemprop="byArtist"]')
                        .map((i, a) => ({
                          url: 'https://myzuka.club' + $(a).attr('href'),
                          name: $(a).text().trim(),
                        }))
                        .get();

                      const _songs = $('.player-inline')
                        .map((i, elem) => {
                          const playId = $(elem).find('div.play').attr('id');

                          const name = $(elem)
                            .find('span.ico')
                            .attr('data-title')
                            .split(' - ')[1];

                          const duration = $(elem)
                            .find('.options .data')
                            .text()
                            .split('|')[0]
                            .trim();

                          const isLost = $(elem)
                            .find('.details .label-danger')
                            .text()
                            ? true
                            : false;

                          const song = {
                            name,
                            playId,
                            duration,
                          };

                          if (isLost) {
                            return {};
                          } else {
                            return song;
                          }
                        })
                        .get();

                      const artist = await Promise.all(
                        _artists.map(async (artist) => {
                          const { _id } = await controller.findOrCreate(
                            Artist,
                            {
                              ...artist,
                            }
                          );
                          return _id;
                        })
                      );

                      const genre = await Promise.all(
                        _album.genre.map(async (item) => {
                          const { _id } = await controller.findOrCreate(Genre, {
                            name: item,
                          });
                          return _id;
                        })
                      );

                      const album = await controller.findOrCreate(Album, {
                        ..._album,
                        genre,
                        artist,
                      });

                      await Promise.all(
                        _songs.map(async (song) => {
                          const { _id } = await controller.findOrCreate(Song, {
                            ...song,
                            album,
                          });
                          return _id;
                        })
                      );

                      console.log(`processed ${index}`);
                    } else {
                      console.log(`error at ${index}`);
                    }

                    resolve();
                  } catch (err) {
                    resolve();
                  }
                })
            );
          }, Promise.resolve())
          .then(async () => {});
      } else {
        console.log(`error at ${index}`);
      }
    } catch (error) {
      console.log({ error });
    }
  });
};

(async () => {
  console.log(`starting from index ${start} in part ${part}`);
  await mongoose.connect(process.env.dbURL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  scrape();
})();
