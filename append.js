const fs = require('fs');

fs.appendFile(`./data/albums8.json`, ']', err => {
 if(err) console.log(err); 
 console.log('done');
});
