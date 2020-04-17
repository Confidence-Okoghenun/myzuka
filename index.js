const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

let start = 1;
const end = 1;
// const endIndex = 397;

async function asyncForEach(array, callback) {
  function myLoop() {
    setTimeout(async () => {
      await callback(start);
      start++;
      if (start <= end) {
        myLoop();
      }
    }, 1000);
  }
  myLoop();
}

(async () => {
  await asyncForEach([], async num => {
    try {
      const page = await fetch(`https://myzuka.club/Albums/Page38470`)
        .then(res => res.text())
        .then(body => body);

      //   console.log(page);
      const $ = cheerio.load(page);
      $('.album-list .item').each(function(i, elem) {
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
          .trim();
        const albumUrl = $(elem)
          .find('.title a')
          .attr('href');
        const albumArtistUrl = $(elem)
          .find('.author a')
          .attr('href');

        $(elem)
          .find('.tags a')
          .each(function(i, a) {
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

        fs.appendFile(`./data/albums.json`, `,${JSON.stringify(obj)}`, err => {
          console.log(`saved ${i}`);
        });
      });
      console.log(`processing page ${num}`);
    } catch (err) {
      console.log('Could not fetch');
    }
  });
})();
