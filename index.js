const fs = require('fs');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const page = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83]
const url = [];
const pages = [1, 2, 3];
const cat = 'A';

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

(async () => {
    await asyncForEach(pages, async num => {
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