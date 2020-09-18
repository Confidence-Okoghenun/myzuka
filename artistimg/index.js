const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const argv = require('yargs').argv;

let errCount = 0;
let loopTimeOutId = 0;
const part = argv.part;
const stop = Number(JSON.parse(`"${fs.readFileSync('./stop.txt')}"`));
let start = stop ? stop + 1 : stop;

const asyncForEach = async (pageArr, callback) => {
  const myLoop = () => {
    loopTimeOutId = setTimeout(async () => {
      await callback(pageArr[start], start);
      start++;
      if (start <= pageArr.length - 1) {
        myLoop();
      }
    }, 15000);
  };
  myLoop();
};

const scrape = async () => {
  const pageArr = JSON.parse(fs.readFileSync(`page${part}.json`));

  await asyncForEach(pageArr, async (page) => {
    try {
      const html = await fetch(`https://myzuka.club/Artist/Page${page}`)
        .then((res) => res.text())
        .then((body) => body);

      console.log(`processing page ${page}`);
      const $ = cheerio.load(html);

      if ($('body').find('#bodyContent').length) {
        errCount = 0;
        $('table.table tbody tr')
          .map((i, elem) => {
            const link = $(elem).find('a');
            const name = link.text().trim().toLowerCase();
            const url = 'https://myzuka.club' + link.attr('href');

            return {
              url,
              name,
            };
          })
          .get()
          .reduce((promiseChain, obj) => {
            return promiseChain.then(
              () =>
                new Promise(async (resolve) => {
                  try {
                    if (obj.name) {
                      const data = `,${JSON.stringify(obj)}`;
                      fs.appendFileSync(`data${part}.json`, data);
                    }
                    resolve();
                  } catch (err) {
                    resolve();
                  }
                })
            );
          }, Promise.resolve())
          .then(async () => {
            fs.writeFileSync('stop.txt', page);
            console.log(`processed page ${page}`);
          });
      } else {
        start = 10000000000;
        clearTimeout(loopTimeOutId);
        console.log(`error in page ${page}, sleeping`);
        setTimeout(() => {
          console.log(errCount);
          if (errCount >= 3) {
            console.log('too many errors, skipping');
            start = page + 1;
            errCount = 0;
          } else {
            start = page;
          }
          scrape();
        }, 120000);
        errCount++;
      }
    } catch (error) {
      console.log({ error });
    }
  });
};

scrape();
