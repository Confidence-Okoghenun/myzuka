const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// let start = 1008;
let start = 1400;
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
    }, 15000);
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
          const albumArtist = [];
          const albumArt = $(elem)
            .find('img')
            .attr('src');
          const albumName = $(elem)
            .find('.title a')
            .text()
            .trim();
          const albumUrl =
            'https://myzuka.club' +
            $(elem)
              .find('.title a')
              .attr('href');

          $(elem)
            .find('.author a')
            .each((i, a) => {
              albumArtist.push({
                name: $(a)
                  .text()
                  .trim(),
                url: 'https://myzuka.club' + $(a).attr('href')
              });
            });

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
            albumArtist
          };

          fs.appendFile(
            `./data/albums${
              String(num)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                .split(',')[0]
            }.json`,
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

// NOTES
// There was a bug from 1 to 1399 concerning albums having multiple artist the affected files
// are albums.json and albums1.json
