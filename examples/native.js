require('../lib/system-node.js'); // polyfill

System.loader.import('fs').then(function (fs) {
    console.log(fs);
    console.log('value of readFile: ', fs.readFile);
}).catch(function (err) {
    console.error(err.stack || err);
});
