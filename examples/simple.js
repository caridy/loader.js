require("babel-register");

var loader = require('../src/system-node.js').default;
var liveBindings;

loader[Reflect.Loader.resolve] = function(name, referrer) {
    console.log('executing user-land @@resolve() hook');
    return new Promise(function (fulfill, reject) {
        fulfill(name + ' resolved in userland');
    });
};

loader[Reflect.Loader.fetch] = function(entry) {
    console.log('executing user-land @@fetch() hook');
    return new Promise(function (fulfill, reject) {
        fulfill('fetch fulfilled in userland');
    });
};

loader[Reflect.Loader.translate] = function(entry) {
    console.log('executing user-land @@translate() hook');
    return new Promise(function (fulfill, reject) {
        fulfill('translated fulfilled in userland');
    });
};

loader[Reflect.Loader.instantiate] = function(entry) {
    console.log('executing user-land @@instantiate() hook');
    return new Promise(function (fulfill) {
        var mod = new Reflect.Module({
            // initialized mutable (includes "uninitialized" var)
            x: { value: undefined },
            y: { value: 42 },

            // uninitialized mutable (let, class)
            z: { },

            // initialized immutable (const)
            PI: { value: Math.PI, const: true },

            // uninitialized immutable (const)
            TAU: { const: true },

            // re-export
            // readFile: { module: fs, import: "readFile" }
        }, function (mutator) {
            console.log('mutating instance of foo created in user-land');
            liveBindings = mutator;
        }, function () {
            console.log('evaluating instance of foo created in user-land');
        });
        fulfill(mod);
    });
};

loader.import('foo').then(function (mod) {
    console.log('done importing module foo from user-land');
    console.log(mod);
}).catch(function (err) {
    console.error(err.stack || err);
});
