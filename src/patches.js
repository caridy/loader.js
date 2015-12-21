if (typeof System === 'undefined') {
    global.System = Object.create(null);
}

if (typeof Reflect === 'undefined') {
    global.Reflect = Object.create(null);
}

if (typeof Symbol === 'undefined') {
    // the dummies Symbol polyfill ever
    let counter = 0;
    global.Symbol = (name) => `@@${name || 'symbol'}${++counter}`;
    Symbol.toStringTag = Symbol('@@toStringTag');
    Symbol.iterator = Symbol('@@iterator');
}
