const fs = require('fs');
const start = 588718;
const stop = 784953;
const part = 4;

for (let i = start; i <= stop; i++) {
  fs.appendFileSync(`part${part}.json`, `,${i}`);
}
