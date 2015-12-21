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
