require('../lib/system-node.js'); // polyfill

System.loader.import('./modules/es6-proxy-of-foo.js').then(function (foo) {
    console.log(foo);
    console.log('value of counter: ', foo.value);

    // cjs module can still update their exports from inside
    foo.add();
    console.log('value of counter after calling foo.increment(): ', foo.value);

    // cjs modules can still be mutated from outside via require()
    var fooNative = require('./modules/foo');
    fooNative.counter++;
    console.log('value of counter after incrementing the native module counter: ', foo.value);

    console.log(foo.a);
    foo.foo();
    console.log(1);
    foo.default();
    console.log(3);

    // live bindings cannot be mutated from outside
    foo.value++; // this should throw
    console.log('value of counter after the second calling foo.increment(): ', foo.value);
}).catch(function (err) {
    console.error(err.stack || err);
});
