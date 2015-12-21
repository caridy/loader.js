import {
    assert,
} from './utils.js';

import {
    GetMethod,
} from './262.js';

import ModuleStatus from "./module-status.js";

// 6.1.1. EnsureRegistered(loader, key)
export function EnsureRegistered(loader, key) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert(loader['[[Registry]]']);
    // 2. Assert: Type(key) is String.
    assert(typeof key === 'string');
    // 3. Let registry be loader.[[Registry]].
    let registry = loader['[[Registry]]'];
    // 4. Let pair be the entry in loader.[[Registry]] such that pair.[[key]] is equal to key.
    let pair = loader['[[Registry]]'].find((entry) => key === entry['[[key]]']);
    // 5. If pair exists, then:
    if (pair) {
        // a. Let entry be pair.[[value]].
        let entry = pair['[[value]]'];
    }
    // 6. Else:
    else {
        // a. Let entry be a new ModuleStatus(loader, key).
        let entry = new ModuleStatus(loader, key);
    }
    // 7. Return entry.
    return entry;
}

// 6.1.2. Resolve(loader, name, referrer)
export function Resolve(loader, name, referrer) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert(loader['[[Registry]]']);
    // 2. Assert: Type(name) is String.
    assert(typeof name === 'string');
    // 3. Assert: Type(referrer) is String.
    assert(typeof referrer === 'string');
    // 1. Let hook be GetMethod(loader, @@resolve).
    let hook = GetMethod(loader, Reflect.Loader.resolve);
    // 2. Return the result of promise-calling hook(name, referrer).
    return hook(name, referrer);
}

// 6.1.3. ExtractDependencies(entry, optionalInstance, source)
export function ExtractDependencies(entry, optionalInstance, source) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
    // 2. Let instance be ? Instantiation(entry.[[Loader]], optionalInstance, source).
    let instance = Instantiation(entry['[[Loader]]'], optionalInstance, source);
    // 3. Let deps be a new empty List.
    let deps = [];
    // 4. If instance is a Module Record, then:
    if (instance instanceof ModuleRecord) {
        // a. Assert: instance is a Source Text Module Record.
        assert(instance instanceof SourceTextModuleRecord);
        // b. Set instance.[[ModuleStatus]] to entry.
        instance['[[ModuleStatus]]'] = entry;
        // c. For each dep in instance.[[RequestedModules]], do:
        instance['[[RequestedModules]]'].forEach((dep) => {
            // i. Append the record { [[RequestName]]: dep, [[Key]]: undefined, [[ModuleStatus]]: undefined } to deps.
            deps.push({
                '[[RequestName]]': dep,
                '[[Key]]': undefined,
                '[[ModuleStatus]]': undefined,
            });
        });
    }
    // 5. Set entry.[[Dependencies]] to deps.
    entry['[[Dependencies]]'] = deps;
    // 6. Set entry.[[Module]] to instance.
    entry['[[Module]]'] = instance;
}

// 6.1.4. Instantiation(loader, result, source)
export function Instantiation(loader, result, source) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert(loader['[[Registry]]']);
    // 2. If result is undefined, then return ParseModule(source).
    if (result === undefined) return ParseModule(source);
    // 2. If IsCallable(result) is false then throw a new TypeError.
    if (IsCallable(result) === false) throw new TypeError();
    // 3. Set result.[[Realm]] to loader.[[Realm]].
    result['[[Realm]]'] = loader['[[Realm]]'];
    // 4. Return result.
    return result;
}
