const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

let start = 894;
const end = 38471;
let loopTimeOutId = 0;

const asyncForEach = async (array, callback) => {
  const myLoop = () => {
    loopTimeOutId = setTimeout(async () => {
      await callback(start);
      start++;
      if (start <= end) {
        myLoop();
      }
    }, 1000);
  };
  myLoop();
};

const scrape = async () => {
  await asyncForEach([], async num => {
    try {
      const page = await fetch(`https://myzuka.club/Albums/Page${num}`)
        .then(res => res.text())
        .then(body => body);

      //   console.log(page);
      const $ = cheerio.load(page);
      if ($('body').find('.album-list .item').length) {
        $('.album-list .item').each((i, elem) => {
          let albumYear;
          const albumGenre = [];
          const albumArt = $(elem)
            .find('img')
            .attr('src');
          const albumName = $(elem)
            .find('.title a')
            .text()
            .trim();
          const albumArtist = $(elem)
            .find('.author')
            .text()
            .trim()
            .replace('                     / \n', ' ');
          const albumUrl =
            'https://myzuka.club' +
            $(elem)
              .find('.title a')
              .attr('href');
          const albumArtistUrl =
            'https://myzuka.club' +
            $(elem)
              .find('.author a')
              .attr('href');

          $(elem)
            .find('.tags a')
            .each((i, a) => {
              const href = $(a).attr('href');
              if (href.includes('Genre')) {
                albumGenre.push(
                  $(a)
                    .text()
                    .trim()
                );
              } else {
                albumYear = $(a)
                  .text()
                  .trim();
              }
            });

          const obj = {
            albumArt,
            albumUrl,
            albumName,
            albumYear,
            albumGenre,
            albumArtist,
            albumArtistUrl
          };

          // console.log(obj)

          fs.appendFile(
            `./data/albums.json`,
            `,${JSON.stringify(obj)}`,
            err => {
              console.log(`saved ${i}`);
            }
          );
        });
        console.log(`processing page ${num}`);
      } else {
        start = end + 10;
        clearTimeout(loopTimeOutId);
        console.log(`error in page ${num}, sleeping`);
        setTimeout(() => {
          start = num;
          scrape();
        }, 120000);
        // console.log('invalid page, exiting');
        // process.exit();
      }
    } catch (err) {
      console.log('could not fetch');
    }
  });
};

scrape();
