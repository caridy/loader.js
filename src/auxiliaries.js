import {
    resolvePromiseSlot,
    rejectPromiseSlot,
} from './utils.js';

import {
    SetStateToMax,
} from './abstracts.js';

export function /* 5.1.1 */ EnsureRegistered(loader, key) {
    // 1. Assert: loader has a [[Registry]] internal slot.
    HowToDoThis();
    // 2. Let pair be the entry in loader.[[Registry]] such that pair.[[key]] is equal to key.
    let pair = loader['[[Registry]]'].find((entry) => key === entry['[[key]]']);
    // 3. If pair exists, then:
    if (pair) {
        // a. Let entry be pair.[[value]].
        let entry = pair['[[value]]'];
    }
    // 4. Else:
    else {
        // a. Let entry be a new registry entry record { [[Key]]: key, [[State]]: "fetch", [[Metadata]]: undefined, [[Fetch]]: undefined, [[Translate]]: undefined, [[Instantiate]]: undefined, [[Dependencies]]: undefined, [[Module]]: undefined, [[Error]]: nothing }.
        let entry = {
            '[[Key]]': key,
            '[[State]]': "fetch",
            '[[Metadata]]': undefined,
            '[[Fetch]]': undefined,
            '[[Translate]]': undefined,
            '[[Instantiate]]': undefined,
            '[[Dependencies]]': undefined,
            '[[Module]]': undefined,
            '[[Error]]': undefined,
        };
        // b. Append { [[key]]: key, [[value]]: entry } to loader.[[Registry]].
        loader['[[Registry]]'].push({
            '[[key]]': key,
            '[[value]]': entry
        });
    }
    // 5. Return entry.
    return entry;
}

export function /* 5.1.2 */ Resolve(loader, name, referrer) {
    // 1. Let hook be GetMethod(loader, @@resolve).
    let hook = loader[Reflect.Loader.resolve];
    // 2. Return the result of promise-calling hook(name, referrer).
    return hook(name, referrer);
}

export function /* 5.1.3 */ FulfillFetch(loader, entry, payload) {
    // 1. If entry.[[Fetch]] is undefined, then set entry.[[Fetch]] to a promise resolved with payload.
    if (entry['[[Fetch]]'] === undefined) {
        entry['[[Fetch]]'] = Promise.resolve(payload);
    }
    // 2. Else fulfill entry.[[Fetch]] with payload.
    else {
        resolvePromiseSlot(entry['[[Fetch]]'], payload);
    }
    // 3. SetStateToMax(entry, "translate").
    SetStateToMax(entry, "translate");
}

export function /* 5.1.4 */ FulfillTranslate(loader, entry, source) {
    // 1. If entry.[[Translate]] is undefined, then set entry.[[Translate]] to a promise resolved with source.
    if (entry['[[Translate]]'] === undefined) {
        entry['[[Translate]]'] = Promise.resolve(source);
    }
    // 2. Else fulfill entry.[[Translate]] with source.
    else {
        resolvePromiseSlot(entry['[[Translate]]'], source);
    }
    // 3. SetStateToMax(entry, "instantiate").
    SetStateToMax(entry, "instantiate");
}

export function /* 5.1.5 */ FulfillInstantiate(loader, entry, optionalInstance, source) {
    // 1. If entry.[[Instantiate]] is undefined, then set entry.[[Instantiate]] to a new promise.
    if (entry['[[Instantiate]]'] === undefined) {
        entry['[[Instantiate]]'] = new Promise();
    }
    // 2. Return CommitInstantiated(loader, entry, optionalInstance, source).
    return CommitInstantiated(loader, entry, optionalInstance, source);
}

export function /* 5.1.6 */ CommitInstantiated(loader, entry, optionalInstance, source) {
    // 1. Let instance be Instantiation(loader, optionalInstance, source).
    let instance = Instantiation(loader, optionalInstance, source);
    // 2. ReturnIfAbrupt(instance).
    HowToDoThis();
    // 3. // TODO: edge case: what if instance is a thenable function?
    // 4. Let deps be a new empty List.
    let deps = [];
    // 5. If instance is a Module Record, then:
    if (instance is a Module Record) {
        // a. Assert: instance is a Source Text Module Record.
        HowToDoThis();
        // b. Set instance.[[RegistryEntry]] to entry.
        instance['[[RegistryEntry]]'] = entry;
        // c. For each dep in instance.[[RequestedModules]], do:
        instance['[[RequestedModules]]'].forEach((dep) => {
            // i. Append the record { [[key]]: dep, [[value]]: undefined } to deps.
            deps.push({
                '[[key]]': dep,
                '[[value]]': undefined,
            });
        });
    }
    // 6. Set entry.[[Dependencies]] to deps.
    entry['[[Dependencies]]'] = deps;
    // 7. Set entry.[[Module]] to instance.
    entry['[[Module]]'] = instance;
    // 8. SetStateToMax(entry, "link").
    SetStateToMax(entry, "link");
}

export function /* 5.1.7 */ Instantiation(loader, result, source) {
    // 1. If result is undefined, then return ParseModule(source).
    if (result === undefined) {
        return ParseModule(source);
    }
    // 2. If IsCallable(result) is false then throw a new TypeError.
    if (IsCallable(result) === false)
        throw new TypeError();
    }
    // 3. Set result.[[Realm]] to loader.[[Realm]].
    result['[[Realm]]'] = loader['[[Realm]]'];
    // 4. Return result.
    return result;
}
