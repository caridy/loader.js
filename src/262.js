export function OrdinaryCreateFromConstructor (constructor, intrinsicDefaultProto, internalSlotsList) {
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    let proto = constructor.prototype;
    // 3. Return ObjectCreate(proto, internalSlotsList).
    return Object.create(proto, internalSlotsList.reduce((descriptors, internalSlot) => {
        descriptors[internalSlot] = { writable: true, configurable: false, value: undefined };
        return descriptors;
    }, {}));
}

// 7.1.12 ToString ( argument )
export function ToString(value) {
    // relying on the underlaying implementation
    return typeof value === 'string' ? value : value + '';
}

// 7.3.9 GetMethod (V, P)
export function GetMethod(v, p) {
    let func = v[p];
    if (!func) return undefined;
    if (typeof func !== 'function') throw new TypeError();
    return func;
}

// 7.2.3 IsCallable ( argument )
export function IsCallable(argument) {
    if (argument && typeof argument.call === 'function') return true;
    return false;
}

// 15.2.1.18 Runtime Semantics: GetModuleNamespace( module )
export function GetModuleNamespace(module) {
    throw new Error('TODO');
}
