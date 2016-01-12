require('../lib/system-node.js'); // polyfill

System.loader.import('./modules/foo.js').then(function (foo) {
    console.log(foo);
    console.log('value of counter: ', foo.counter);

    // cjs module can still update their exports from inside
    foo.increment();
    console.log('value of counter after calling foo.increment(): ', foo.counter);

    // cjs modules can still be mutated from outside via require()
    var fooNative = require('./modules/foo');
    fooNative.counter++;
    console.log('value of counter after incrementing the native module counter: ', foo.counter);

    // live bindings cannot be mutated from outside
    foo.counter++; // this should throw
    console.log('value of counter after the second calling foo.increment(): ', foo.counter);
}).catch(function (err) {
    console.error(err.stack || err);
});
