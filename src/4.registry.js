import {
    OrdinaryCreateFromConstructor,
} from './262.js';

// 4. Registry Objects

// 4.1. Abstract Operations for Registry Objects

// 4.1.1. CreateRegistry()
export function CreateRegistry() {
    // 1. Let O be ? OrdinaryCreateFromConstructor(Registry, "%RegistryPrototype%", «[[RegistryMap]]» ).
    let O = OrdinaryCreateFromConstructor(Registry, "%RegistryPrototype%", ['[[RegistryMap]]']);
    // 2. Let M be ObjectCreate(%MapIteratorPrototype%, «[[Map]], [[MapNextIndex]], [[MapIterationKind]]»).
    let M = new Map();
    // 3. Set O’s [[RegistryMap]] internal slot to M.
    O['[[RegistryMap]]'] = M;
    // 4. Return O.
    return O;
}

// 4.2. The Registry Constructor
// 4.3. Properties of the Registry Constructor
// 4.4. Properties of the Registry Prototype Object
export default class Registry {
    constructor () /* 4.2 */ {
        throw new Error('Registry Object cannot be created in user land.');
    }

    [ Symbol.iterator ]() /* 4.4.2 */ {
        return this.entries();
    }

    entries() /* 4.4.3 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Return CreateMapIterator(M, "key+value").
        return M.entries();
    }

    keys() /* 4.4.4 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Return CreateMapIterator(M, "key").
        return M.keys();
    }

    values() /* 4.4.5 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Return CreateMapIterator(M, "value").
        return M.values();
    }

    get(key) /* 4.4.6 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Let entries be the List that is the value of M’s [[MapData]] internal slot.
        let entries = M.entries();
        // 6. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
        for (var [k, v] of entries) {
            // a. If p.[[key]] is not empty and SameValueZero(p.[[key]], key) is true, return p.[[value]].
            if (k && (k === key)) return v;
        }
        // 7. Return undefined.
        return undefined;
    }

    set(key, entry) /* 4.4.7 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== "object") throw new TypeError();
        // 5. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 6. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 7. Let entries be the List that is the value of M’s [[MapData]] internal slot.
        let entries = M.entries();
        // 8. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
        for (var [k, v] of entries) {
            // a. If p.[[key]] is not empty and SameValueZero(p.[[key]], key) is true, then
            if (k && (k === key)) {
                // i. Set p.[[value]] to entry.
                M.set(key, entry);
                // ii. Return registry.
                return registry;
            }
        }
        // 9. Let p be the Record {[[key]]: key, [[value]]: entry}.
        let p = entry;
        // 10. Append p as the last element of entries.
        M.set(key, p);
        // 11. Return registry.
        return registry;
    }

    has(key) /* 4.4.8 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Let entries be the List that is the value of M’s [[MapData]] internal slot.
        let entries = M.entries();
        // 6. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
        for (var [k, v] of entries) {
            // If p.[[key]] is not empty and SameValueZero(p.[[key]], key) is true, then, return true.
            if (k && (k === key)) return true;
        }
        // 7. Return false.
        return false;
    }

    delete(key) /* 4.4.9 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== "object") throw new TypeError();
        // 3. If registry does not have all of the internal slots of a Registry Instance (4.4), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(registry, '[[RegistryMap]]')) throw new TypeError();
        // 4. Let M be registry.[[RegistryMap]].
        let M = registry['[[RegistryMap]]'];
        // 5. Let entries be the List that is the value of M’s [[MapData]] internal slot.
        let entries = M.entries();
        // 6. Repeat for each Record {[[key]], [[value]]} p that is an element of entries,
        for (var [k, v] of entries) {
            // a. If p.[[key]] is not empty and SameValueZero(p.[[key]], key) is true, then
            if (k && (k === key)) {
                // i. Set p.[[key]] to empty.
                // ii.Set p.[[value]] to empty.
                M.delete(key);
                // iii. Return true.
                return true;
            }
        }
        // 7. Return false.
        return false;
    }

}
