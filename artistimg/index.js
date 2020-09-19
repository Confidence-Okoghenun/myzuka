const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const part = require('yargs').argv.part;

const stop = Number(JSON.parse(`"${fs.readFileSync('./stop.txt')}"`));
let start = stop === 0 ? stop : stop + 1;

const asyncForEach = async (array, callback) => {
  for (let index = start; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

const scrape = async () => {
  const pageArr = JSON.parse(fs.readFileSync(`page${part}.json`));

  await asyncForEach(pageArr, async (page, index) => {
    try {
      const html = await fetch(`https://myzuka.club/Artist/Page${page}`)
        .then((res) => res.text())
        .then((body) => body);

      console.log(`starting page ${page}`);
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
            fs.writeFileSync('stop.txt', index);
            console.log(`processed page ${page}`);
          });
      } else {
        console.log(`error in page ${page}`);
        start = index + 1;
        scrape();
      }
    } catch (error) {
      console.log({ error });
    }
  });
};

scrape();
