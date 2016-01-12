require('../lib/system-node.js'); // polyfill

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

var entry = new Reflect.Module.ModuleStatus(System.loader, 'baz');
entry.resolve('instantiate', mod).then(() => {

    System.loader.registry.set('baz', entry);

    System.loader.import('baz').then(function (baz) {
        console.log(baz);
        console.log('value of x: ', baz.x);
        console.log('value of y: ', baz.y);
        console.log('value of z: ', baz.z);
        console.log('value of PI: ', baz.PI);
        console.log('value of TAU: ', baz.TAU);
    }).catch(function (err) {
        console.error(err.stack || err);
    });

}).catch(function (err) {
    console.error(err.stack || err);
});
