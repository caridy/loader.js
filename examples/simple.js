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
            mutator.x = 24; // testing the mutator setter
            // mutator.PI = 1; // this should throw: Cannot redefine property: PI
        }, function () {
            console.log('evaluating instance of foo created in user-land');
            liveBindings.z = function () {
                return 'something';
            };
            liveBindings.TAU = 3;
            // liveBindings.TAU = 2; // this second attempt should throw: Cannot redefine property: TAU
        });
        fulfill(mod);
    });
};

loader.import('foo').then(function (mod) {
    console.log('done importing module foo from user-land');
    console.log(mod);
    console.log('value of x: ', mod.x);
    console.log('value of y: ', mod.y);
    console.log('value of z: ', mod.z);
    console.log('value of PI: ', mod.PI);
    console.log('value of TAU: ', mod.TAU);
}).catch(function (err) {
    console.error(err.stack || err);
});
