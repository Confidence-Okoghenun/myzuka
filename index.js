const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const url = [];
const cat = 'A';

async function asyncForEach(array, callback) {
    for (let index = 1; index <= 397; index++) {
        await callback(index);
    }
}

(async () => {
    await asyncForEach([], async num => {
        const page = await fetch(`https://myzuka.club/Letter/${cat}/Page${num}`)
            .then(res => res.text())
            .then(body => body);

        const $ = cheerio.load(page)
        $('table td a').each(function (i, elem) {
            url.push('https://myzuka.club' + $(elem).attr('href'));
        });
        console.log(num);
    });
    fs.writeFile(`./urls/${cat}.json`, JSON.stringify(url), function (err) {
        if (err) throw err;
        console.log(`Saved Cat ${cat}`);
    });
})();