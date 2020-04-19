const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const git = require('simple-git')();

// let start = 2538;
let start = 2898;
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

const gitPush = num => {
  if (Number.isInteger(num / 500)) {
    start = end + 10;
    clearTimeout(loopTimeOutId);
    console.log(`commiting ${num} to git`);

    git.add(['.'], () => {
      git.commit(`chore: Stopped at ${num}`, () => {
        git.push('origin', 'master', () => {
          console.log(`push ${num} to origin master`);
        });
      });
    });

    setTimeout(() => {
      start = num + 1;
      scrape();
    }, 60000);
  } else {
    return;
  }
};

const scrape = async () => {
  await asyncForEach([], async num => {
    try {
      const page = await fetch(`https://myzuka.club/Albums/Page${num}`)
        .then(res => res.text())
        .then(body => body);

      console.log(`processing page ${num}`);
      //   console.log(page);
      const $ = cheerio.load(page);
      if ($('body').find('.album-list .item').length) {
        $('.album-list .item')
          .map((i, elem) => {
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

            return obj;
          })
          .get()
          .reduce((promiseChain, obj) => {
            return promiseChain.then(
              () =>
                new Promise(resolve => {
                  fs.appendFile(
                    `./data/albums${
                      String(num)
                        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        .split(',')[0]
                    }.json`,
                    `,${JSON.stringify(obj)}`,
                    err => {
                      resolve();
                    }
                  );
                })
            );
          }, Promise.resolve())
          .then(() => {
            console.log(`saved page ${num}`);
            gitPush(num);
          });
      } else {
        start = end + 10;
        clearTimeout(loopTimeOutId);
        console.log(`error in page ${num}, sleeping`);
        setTimeout(() => {
          start = num;
          scrape();
        }, 120000);
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
