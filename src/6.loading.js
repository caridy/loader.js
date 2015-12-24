import {
    GetMethod,
    IsCallable,
    GetModuleNamespace,
} from './262.js';

import {
    PassThroughPromise,
} from './2.conventions.js';

import Loader from './3.loader.js';

import ModuleStatus, {
    GetCurrentStage,
    GetStage,
    UpgradeToStage,
} from './5.module-status.js';

import {
    Link,
} from './7.linking.js';

import {
    ModuleEvaluation,
} from './8.module.js';

import {
    promiseCall,
    HowToDoThis,
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

    // 4. Let pair be the entry in loader.[[Registry]] such that pair.[[key]] is equal to key.
    let pair;
    for (var [k, v] of loader['[[Registry]]']) {
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
    return hook(name, referrer);
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
        (instance['[[RequestedModules]]'] || []).forEach((dep) => {
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
    let p = hookResult.then((payload) => {
        // a. Perform UpgradeToStage(entry, "translate").
        UpgradeToStage(entry, "translate");
        // b. Return payload.
        return payload;
    });
    // 8. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch(() => {
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
    // 5. Let hook be GetMethod(entry.[[Loader]], @@translate).
    let hook = GetMethod(entry['[[Loader]]'], Loader.translate);
    // 6. Let p be the result of transforming RequestFetch(entry) with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p = RequestFetch(entry).then((payload) => {
        // a. Let hookResult be the result of promise-calling hook(entry, payload).
        let hookResult = promiseCall(hook, entry, payload);
        // b. Return the result of transforming hookResult with a fulfillment handler that, when called with argument source, runs the following steps:
        return hookResult.then((source) => {
            // i. Perform UpgradeToStage(entry, "instantiate").
            UpgradeToStage(entry, "instantiate");
            // ii. Return source.
            return source;
        });
    });
    // 7. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 8. Set translateStageEntry.[[Result]] to p.
    translateStageEntry['[[Result]]'] = p;
    // 9. Return p.
    return p;
}

// 6.2.3. RequestInstantiate(entry)
export function RequestInstantiate(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let instantiateStageEntry be GetStage(entry, "instantiate").
    let instantiateStageEntry = GetStage(entry, "instantiate");
    // 3. If instantiateStageEntry is undefined, return a promise resolved with undefined.
    if (instantiateStageEntry === undefined) return Promise.resolve();
    // 4. If instantiateStageEntry.[[Result]] is not undefined, return instantiateStageEntry.[[Result]].
    if (instantiateStageEntry['[[Result]]'] !== undefined) return instantiateStageEntry['[[Result]]'];
    // 5. Let hook be GetMethod(entry.[[Loader]], @@instantiate).
    let hook = GetMethod(entry['[[Loader]]'], Loader.instantiate);
    // 6. Let p be the result of transforming RequestTranslate(entry) with a fulfillment handler that, when called with argument source, runs the following steps:
    let p = RequestTranslate(entry).then((source) => {
        // a. Let hookResult be the result of promise-calling hook(entry, source).
        let hookResult = promiseCall(hook, entry, source);
        // c. Return the result of transforming hookResult with a fulfillment handler that, when called with argument optionalInstance, runs the following steps:
        return hookResult.then((optionalInstance) => {
            // i. Perform ? ExtractDependencies(entry, optionalInstance, source).
            ExtractDependencies(entry, optionalInstance, source);
            // ii. Perform UpgradeToStage(entry, "satisfy").
            UpgradeToStage(entry, "satisfy");
            // iii. 1. Return optionalInstance.
            return optionalInstance;
        });
    });
    // 7. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch((e) => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 8. Set instantiateStageEntry.[[Result]] to p.
    instantiateStageEntry['[[Result]]'] = p;
    // 9. Return p.
    return p;
}

// 6.2.4. RequestSatisfy(entry)
export function RequestSatisfy(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let satisfyStageEntry be GetStage(entry, "satisfy").
    let satisfyStageEntry = GetStage(entry, "satisfy");
    // 3. If satisfyStageEntry is undefined, return a promise resolved with undefined.
    if (satisfyStageEntry === undefined) return Promise.resolve();
    // 4. If satisfyStageEntry.[[Result]] is not undefined, return satisfyStageEntry.[[Result]].
    if (satisfyStageEntry['[[Result]]'] !== undefined) return satisfyStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestInstantiate(entry) with a fulfillment handler that, when called, runs the following steps:
    let p = RequestInstantiate(entry).then((TODO_optionalInstance_instead_of_entry) => {
        // a. Let depLoads be a new empty List.
        let depLoads = [];
        // b. For each pair in entry.[[Dependencies]], do:
        entry['[[Dependencies]]'].forEach((pair) => {
            // i. Let pp be the result of transforming Resolve(loader, pair.[[Key]], key) with a fulfillment handler that, when called with value depKey, runs the following steps:
            let pp = Resolve(loader, pair['[[Key]]'], key).then((depKey) => {
                // 1. Let depEntry be EnsureRegistered(entry.[[Loader]], depKey).
                let depEntry = EnsureRegistered(entry['[[Loader]]'], depKey);
                // 2. Set pair.[[Key]] to depKey.
                pair['[[Key]]'] = depKey;
                // 3. Set pair.[[ModuleStatus]] to depEntry.
                pair['[[ModuleStatus]]'] = depEntry;
                // 4. Let currentStageEntry be GetCurrentStage(entry).
                let currentStageEntry = GetCurrentStage(entry);
                // 5. If currentStageEntry.[[Stage]] is "ready", then:
                if (currentStageEntry['[[Stage]]'] === "ready") {
                    // a. Return depEntry.[[Module]].
                    return depEntry['[[Module]]'];
                }
                // 6. Return the result of transforming RequestSatisfy(depEntry) with a fulfillment handler that, when called with value depEntry, runs the following steps:
                return RequestSatisfy(depEntry).then((depEntry) => {
                    // a. Return depEntry.[[Module]].
                    return depEntry['[[Module]]'];
                });
            });
            // ii. Append pp to depLoads.
            depLoads.push(pp);
        });
        // c. Return the result of waiting for all depLoads with a fulfillment handler that, when called, runs the following steps:
        return Promise.all(depLoads).then(() => {
            // i. UpgradeToStage(entry, "link").
            UpgradeToStage(entry, "link");
            // ii. Return undefined.
            return undefined;
        });
    });
    // 6. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 7. Set satisfyStageEntry.[[Result]] to p.
    satisfyStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.5. RequestLink(entry)
export function RequestLink(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let linkStageEntry be GetStage(entry, "link").
    let linkStageEntry = GetStage(entry, "link");
    // 3. If linkStageEntry is undefined, return a promise resolved with undefined.
    if (linkStageEntry === undefined) return Promise.resolve();
    // 4. If linkStageEntry.[[Result]] is not undefined, return linkStageEntry.[[Result]].
    if (linkStageEntry['[[Result]]'] !== undefined) return linkStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestSatisfy(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    let p = RequestSatisfy(entry).then((/*TODO: entry*/) => {
        // a. Assert: entry’s whole dependency graph is in "link" or "ready" stage.
        HowToDoThis('6.2.5. RequestLink(entry)', '5.a. Assert: entry’s whole dependency graph is in "link" or "ready" stage.');
        // b. Perform ? Link(entry).
        Link(entry);
        // c. Assert: entry’s whole dependency graph is in "ready" stage.
        HowToDoThis('6.2.5. RequestLink(entry)', '5.c. Assert: entry’s whole dependency graph is in "ready" stage.');
        // d. Perform UpgradeToStage(entry, "ready").
        UpgradeToStage(entry, "ready");
        // e. Return undefined.
        return undefined;
    });
    // 6. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 7. Set linkStageEntry.[[Result]] to p.
    linkStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.6. RequestReady(entry)
export function RequestReady(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let readyStageEntry be GetStage(entry, "ready").
    let readyStageEntry = GetStage(entry, "ready");
    // 3. Assert: readyStageEntry is not undefined. currentStageEntry.[[Result]].
    assert(readyStageEntry, 'readyStageEntry is not undefined.');
    // 4. If readyStageEntry.[[Result]] is not undefined, return readyStageEntry.[[Result]].
    if (readyStageEntry['[[Result]]'] !== undefined) return readyStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestLink(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    let p = RequestLink(entry).then((/*TODO: entry*/) => {
        // a. Let module be entry.[[Module]].
        let module = entry['[[Module]]'];
        // b. Perform ? module.ModuleEvaluation().
        ModuleEvaluation.call(module);
        // c. Return ? GetModuleNamespace(module).
        return GetModuleNamespace(module);
    });
    // 6. Let pCatch be the result of transforming p with a rejection handler that, when called, runs the following steps:
    p.catch(() => {
        // a. Set entry.[[Error]] to true.
        entry['[[Error]]'] = true;
    });
    // 7. Set readyStageEntry.[[Result]] to p.
    readyStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}
