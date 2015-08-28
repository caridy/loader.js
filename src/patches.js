if (typeof Reflect !== 'undefined') {
    System = Object.create(null);
}

if (typeof Reflect !== 'undefined') {
    Symbol = Object.create(null);
}

if (!Symbol.toStringTag) {
    Symbol.toStringTag = Symbol('@@toStringTag');
}
