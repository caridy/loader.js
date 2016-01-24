import {
    GetMethod,
    IsCallable,
    ParseModule,
} from './262.js';

import Loader from './3.loader.js';

import ModuleStatus, {
    GetStage,
    UpgradeToStage,
} from './5.module-status.js';

import {
    promiseCall,
    transformPromise,
    assert,
} from './utils.js';

// 6. Loading Semantics

// 6.1. Auxiliary Operations

// 6.1.1. EnsureRegistered(loader, key)
export function EnsureRegistered(loader, key) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert('[[Registry]]' in loader, 'loader must have all of the internal slots of a Loader Instance (3.5).');
    // 2. Assert: Type(key) is String.
    assert(typeof key === 'string', 'Type(key) is String.');
    // 3. Let registry be loader.[[Registry]].
    let registry = loader['[[Registry]]'];

    // 4. Let pair be the entry in registry.[[RegistryMap]] such that pair.[[key]] is equal to key.
    let pair;
    for (let [k, v] of registry['[[RegistryMap]]']) {
        if (k === key) pair = {'[[key]]': k, '[[value]]': v};
    }

    // 5. If pair exists, then:
    let entry;
    if (pair) {
        // a. Let entry be pair.[[value]].
        entry = pair['[[value]]'];
    }
    // 6. Else:
    else {
        // a. Let entry be a new ModuleStatus(loader, key).
        entry = new ModuleStatus(loader, key);
    }

    // 7. Return entry.
    return entry;
}

// 6.1.2. Resolve(loader, name, referrer)
export function Resolve(loader, name, referrer) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert('[[Registry]]' in loader, 'loader must have all of the internal slots of a Loader Instance (3.5).');
    // 2. Assert: Type(name) is String.
    assert(typeof name === 'string', 'Type(name) is String.');
    // 3. Assert: Type(referrer) is String.
    // TODO: diverging from the spec because referrer can undefined
    // assert(typeof referrer === 'string', 'Type(referrer) is String.');
    // 1. Let hook be GetMethod(loader, @@resolve).
    let hook = GetMethod(loader, Loader.resolve);
    // 2. Return the result of promise-calling hook(name, referrer).
    return promiseCall(hook, name, referrer);
}

// 6.1.3. ExtractDependencies(entry, instance)
export function ExtractDependencies(entry, instance) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let deps be a new empty List.
    let deps = [];
    // 3. If instance is a Source Text Module Record, then:
    if ('[[ECMAScriptCode]]' in instance) {
        // a. For each dep in instance.[[RequestedModules]], do:
        for (let dep of instance['[[RequestedModules]]']) {
            // i. Append the record { [[RequestName]]: dep, [[ModuleStatus]]: undefined } to deps.
            deps.push({
                '[[RequestName]]': dep,
                '[[ModuleStatus]]': undefined,
            });
        }
    }
    // 4. Set entry.[[Dependencies]] to deps.
    entry['[[Dependencies]]'] = deps;
}

// 6.1.4. Instantiation(loader, optionalInstance, source)
export function Instantiation(loader, optionalInstance, source) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert('[[Registry]]' in loader, 'loader must have all of the internal slots of a Loader Instance (3.5).');
    // 2. If optionalInstance is undefined, then:
    if (optionalInstance === undefined) {
        // a. If source is not a ECMAScript source text, throw new TypeError.
        // TODO: enhance
        if (typeof source !== 'string') throw new TypeError();
        // b. Let realm be loader.[[Realm]].
        let realm = loader['[[Realm]]'];
        // c. Return ? ParseModule(source, realm, undefined).
        return ParseModule(source, realm, undefined);
    }
    // 3. If optionalInstance is a namespace exotic object, return optionalInstance.[[Module]].
    if ('[[Module]]' in optionalInstance) return optionalInstance['[[Module]]'];
    // 4. If IsCallable(optionalInstance) is false then throw a new TypeError.
    if (IsCallable(optionalInstance) === false) throw new TypeError();
    // 5. Return optionalInstance.
    return optionalInstance;
}

// 6.2. Loading Operations

// 6.2.1. RequestFetch(entry)
export function RequestFetch(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let fetchStageEntry be GetStage(entry, "fetch").
    let fetchStageEntry = GetStage(entry, "fetch");
    // 3. If fetchStageEntry is undefined, return a promise resolved with undefined.
    if (fetchStageEntry === undefined) return Promise.resolve();
    // 4. If fetchStageEntry.[[Result]] is not undefined, return fetchStageEntry.[[Result]].
    if (fetchStageEntry['[[Result]]'] !== undefined) return fetchStageEntry['[[Result]]'];
    // 5. Let hook be GetMethod(entry.[[Loader]], @@fetch).
    let hook = GetMethod(entry['[[Loader]]'], Loader.fetch);
    // 6. Let hookResult be the result of promise-calling hook(entry, entry.[[Key]]).
    let hookResult = promiseCall(hook, entry, entry['[[Key]]']);
    // 7. Let p be the result of transforming hookResult with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p = transformPromise(hookResult).then((payload) => {
        // a. Perform UpgradeToStage(entry, "translate").
        UpgradeToStage(entry, "translate");
        // b. Return payload.
        return payload;
    });
    // 8. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    transformPromise(p).catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 9. Set fetchStageEntry.[[Result]] to p.
    fetchStageEntry['[[Result]]'] = p;
    // 10. Return p.
    return p;
}

// 6.2.2. RequestTranslate(entry)
export function RequestTranslate(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let translateStageEntry be GetStage(entry, "translate").
    let translateStageEntry = GetStage(entry, "translate");
    // 3. If translateStageEntry is undefined, return a promise resolved with undefined.
    if (translateStageEntry === undefined) return Promise.resolve();
    // 4. If translateStageEntry.[[Result]] is not undefined, return translateStageEntry.[[Result]].
    if (translateStageEntry['[[Result]]'] !== undefined) return translateStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestFetch(entry) with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p = transformPromise(RequestFetch(entry)).then((payload) => {
        // a. Let hook be GetMethod(entry.[[Loader]], @@translate).
        let hook = GetMethod(entry['[[Loader]]'], Loader.translate);
        // b. Let hookResult be the result of promise-calling hook(entry, payload).
        let hookResult = promiseCall(hook, entry, payload);
        // c. Return the result of transforming hookResult with a fulfillment handler that, when called with argument source, runs the following steps:
        return transformPromise(hookResult).then((source) => {
            // i. Perform UpgradeToStage(entry, "instantiate").
            UpgradeToStage(entry, "instantiate");
            // ii. Return source.
            return source;
        });
    });
    // 6. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    transformPromise(p).catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 7. Set translateStageEntry.[[Result]] to p.
    translateStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.3. RequestInstantiate(entry)
export function RequestInstantiate(entry, instantiateSet) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let instantiateStageEntry be GetStage(entry, "instantiate").
    let instantiateStageEntry = GetStage(entry, "instantiate");
    // 3. If instantiateStageEntry is undefined, return a promise resolved with undefined.
    if (instantiateStageEntry === undefined) return Promise.resolve();
    // 4. If instantiateStageEntry.[[Result]] is not undefined, return instantiateStageEntry.[[Result]].
    if (instantiateStageEntry['[[Result]]'] !== undefined) return instantiateStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestTranslate(entry) with a fulfillment handler that, when called with argument source, runs the following steps:
    let p = transformPromise(RequestTranslate(entry)).then((source) => {
        // a. Let hook be GetMethod(entry.[[Loader]], @@instantiate).
        let hook = GetMethod(entry['[[Loader]]'], Loader.instantiate);
        // b. Let hookResult be the result of promise-calling hook(entry, source).
        let hookResult = promiseCall(hook, entry, source);
        // c. Return the result of transforming hookResult with a fulfillment handler that, when called with argument optionalInstance, runs the following steps:
        return transformPromise(hookResult).then((optionalInstance) => {
            // i. Return the result of transforming SatisfyInstance(entry, optionalInstance, source, instantiateSet) with a fulfillment handler that, when called with value instance, runs the following steps:
            return transformPromise(SatisfyInstance(entry, optionalInstance, source, instantiateSet)).then((instance) => {
                // 1. Set entry.[[Module]] to instance.
                entry['[[Module]]'] = instance;
                // 1. Return optionalInstance.
                return optionalInstance;
            });
        });
    });
    // 6. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    transformPromise(p).catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 7. Set instantiateStageEntry.[[Result]] to p.
    instantiateStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.4. SatisfyInstance(entry, optionalInstance, source, instantiateSet)
export function SatisfyInstance(entry, optionalInstance, source, instantiateSet) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. If instantiateSet is undefined, Set instantiateSet is a new empty List.
    if (instantiateSet === undefined) instantiateSet = [];
    // 3. If entry is already in instantiateSet, return undefined.
    if (instantiateSet.indexOf(entry) !== -1) return undefined;
    // 4. Append entry to instantiateSet.
    instantiateSet.push(entry);
    // 5. Let loader be entry.[[Loader]].
    let loader = entry['[[Loader]]'];
    // 6. Let instance be ? Instantiation(loader, optionalInstance, source).
    let instance = Instantiation(loader, optionalInstance, source);
    // 7. If instance is a Module Record, then:
    if ('[[Namespace]]' in instance) {
        // a. Set instance.[[ModuleStatus]] to entry.
        instance['[[ModuleStatus]]'] = entry;
    }
    // 8. Perform ? ExtractDependencies(entry, instance).
    ExtractDependencies(entry, instance);
    // 9. Let list be a new empty List.
    let list = [];
    // 10. For each pair in entry.[[Dependencies]], do:
    for (let pair of entry['[[Dependencies]]']) {
        // a. Let p be the result of transforming Resolve(loader, pair.[[RequestName]], entry.[[Key]]) with a fulfillment handler that, when called with value depKey, runs the following steps:
        let p = transformPromise(Resolve(loader, pair['[[RequestName]]'], entry['[[Key]]'])).then((depKey) => {
            // i. Let depEntry be EnsureRegistered(loader, depKey).
            let depEntry = EnsureRegistered(loader, depKey);
            // ii. If depEntry is already in instantiateSet, return undefined.
            if (instantiateSet.indexOf(depEntry) !== -1) return undefined;
            // iii. Set pair.[[ModuleStatus]] to depEntry.
            pair['[[ModuleStatus]]'] = depEntry;
            // iv. Return RequestInstantiate(depEntry, instantiateSet).
            return RequestInstantiate(depEntry, instantiateSet);
        });
        // b. Append p to list.
        list.push(p);
    }
    // 11. Return the result of waiting for all list.
    return Promise.all(list).then(() => instance);
}
