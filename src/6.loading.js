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
    for (var [k, v] of registry['[[RegistryMap]]']) {
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

// 6.1.3. ExtractDependencies(entry, optionalInstance, source)
export function ExtractDependencies(entry, optionalInstance, source) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let instance be ? Instantiation(entry.[[Loader]], optionalInstance, source).
    let instance = Instantiation(entry['[[Loader]]'], optionalInstance, source);
    // 3. Let deps be a new empty List.
    let deps = [];
    // 4. If instance is a Module Record, then:
    if ('[[Namespace]]' in instance) {
        // a. Assert: instance is a Source Text Module Record.
        // TODO: diverging from spec because not only source text module records
        // can have dependencies.
        // assert('[[ECMAScriptCode]]' in instance, 'instance is a Source Text Module Record.');
        // b. Set instance.[[ModuleStatus]] to entry.
        instance['[[ModuleStatus]]'] = entry;
        // c. For each dep in instance.[[RequestedModules]], do:
        // TODO: divering to allow dynamic modules to request dependencies as well
        for (let dep of instance['[[RequestedModules]]']) {
            // i. Append the record { [[RequestName]]: dep, [[ModuleStatus]]: undefined } to deps.
            deps.push({
                '[[RequestName]]': dep,
                '[[ModuleStatus]]': undefined,
            });
        }
    }
    // 5. Set entry.[[Dependencies]] to deps.
    entry['[[Dependencies]]'] = deps;
    // 6. Set entry.[[Module]] to instance.
    entry['[[Module]]'] = instance;
}

// 6.1.4. Instantiation(loader, result, source)
export function Instantiation(loader, result, source) {
    // 1. Assert: loader must have all of the internal slots of a Loader Instance (3.5).
    assert('[[Registry]]' in loader, 'loader must have all of the internal slots of a Loader Instance (3.5).');
    // 2. If result is undefined, return ParseModule(source).
    // TODO: Divering from the spec to support all kind of optionalInstance
    if (result === undefined) {
        result = ParseModule(source);
    }
    else if ('[[Module]]' in result) {
        result = result['[[Module]]'];
    }
    else if (!IsCallable(result)) {
        throw new TypeError();
    }
    // 3. If IsCallable(result) is false then throw a new TypeError.
    // TODO: if (IsCallable(result) === false) throw new TypeError('result most be callable');
    //       it seems that result is an exotic object that is not callable
    // 4. Set result.[[Realm]] to loader.[[Realm]].
    // TODO: diverging from the spec, there might not be an issue with Realm after all
    // result['[[Realm]]'] = loader['[[Realm]]'];
    // 5. Return result.
    return result;
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
export function RequestInstantiate(entry, buckle) {
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
            // i. Perform ? ExtractDependencies(entry, optionalInstance, source).
            ExtractDependencies(entry, optionalInstance, source);
            // ii. Return the result of transforming RequestSatisfy(entry, buckle) with a fulfillment handler that, when called, runs the following steps:
            return transformPromise(RequestSatisfy(entry, buckle)).then(() => {
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

// 6.2.4. RequestSatisfy(entry, buckle)
export function RequestSatisfy(entry, buckle) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. If buckle is undefined, Set buckle is a new empty List.
    if (buckle === undefined) buckle = [];
    // 3. If entry is already in buckle, return undefined.
    if (buckle.indexOf(entry) !== -1) return undefined;
    // 4. Append entry to buckle.
    buckle.push(entry);
    // 5. Let list be a new empty List.
    let list = [];
    // 6. Let loader be entry.[[Loader]].
    let loader = entry['[[Loader]]'];
    // 7. For each pair in entry.[[Dependencies]], do:
    for (let pair of entry['[[Dependencies]]']) {
        // a. Let p be the result of transforming Resolve(loader, pair.[[RequestName]], entry.[[Key]]) with a fulfillment handler that, when called with value depKey, runs the following steps:
        let p = transformPromise(Resolve(loader, pair['[[RequestName]]'], entry['[[Key]]'])).then((depKey) => {
            // i. Let depEntry be EnsureRegistered(loader, depKey).
            let depEntry = EnsureRegistered(loader, depKey);
            // ii. If depEntry is already in buckle, return undefined.
            if (buckle.indexOf(depEntry) !== -1) return undefined;
            // iii. Append depEntry to buckle.
            buckle.push(depEntry);
            // iv. Set pair.[[ModuleStatus]] to depEntry.
            pair['[[ModuleStatus]]'] = depEntry;
            // v. Return RequestInstantiate(depEntry, buckle).
            return RequestInstantiate(depEntry, buckle);
        });
        // b. Append p to list.
        list.push(p);
    }
    // 8. Return the result of waiting for all list.
    return Promise.all(list);
}
