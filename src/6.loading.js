import {
    GetMethod,
    IsCallable,
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
    assert(loader['[[Registry]]']);
    // 2. Assert: Type(key) is String.
    assert(typeof key === 'string');
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
    assert(loader['[[Registry]]']);
    // 2. Assert: Type(name) is String.
    assert(typeof name === 'string');
    // 3. Assert: Type(referrer) is String.
    // BASHED: assert(typeof referrer === 'string');
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
    assert(loader['[[Registry]]'], 'loader must have all of the internal slots of a Loader Instance (3.5).');
    // 2. If result is undefined, then return ParseModule(source).
    if (result === undefined) return ParseModule(source);
    // 3. If IsCallable(result) is false then throw a new TypeError.
    // TODO: if (IsCallable(result) === false) throw new TypeError('result most be callable');
    //       it seems that result is an exotic object that is not callable
    // 4. Set result.[[Realm]] to loader.[[Realm]].
    result['[[Realm]]'] = loader['[[Realm]]'];
    // 5. Return result.
    return result;
}

// 6.2. Loading Operations

// 6.2.1. RequestFetch(entry)
export function RequestFetch(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
    // 2. Let fetchStageEntry be GetStage(entry, "fetch").
    let fetchStageEntry = GetStage(entry, "fetch");
    // 3. If fetchStageEntry is undefined, return a promise resolved with undefined.
    if (fetchStageEntry === undefined) return Promise.resolve();
    // 4. If fetchStageEntry.[[Result]] is not undefined, return fetchStageEntry.[[Result]].
    if (fetchStageEntry['[[Result]]'] !== undefined) return fetchStageEntry['[[Result]]'];
    // 5. Let hook be GetMethod(entry.[[Loader]], @@fetch).
    let hook = GetMethod(entry['[[Loader]]'], Loader.fetch);
    // 6. Let p0 be the result of promise-calling hook(entry, entry.[[Key]]).
    let p0 = promiseCall(hook, entry, entry['[[Key]]']);
    // 7. Let p1 be the result of transforming p0 with a new pass-through promise.
    let p1 = PassThroughPromise(p0);
    // 8 Let p2 be the result of transforming p1 with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p2 = p1.then((payload) => {
        // a. UpgradeToStage(entry, "translate").
        UpgradeToStage(entry, "translate");
    });
    // 9. Set fetchStageEntry.[[Result]] to p.
    fetchStageEntry['[[Result]]'] = p1;
    // 10. Return p1.
    return p1;
}

// 6.2.2. RequestTranslate(entry)
export function RequestTranslate(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
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
        // a. Let p0 be the result of promise-calling hook(entry, payload).
        let p0 = promiseCall(hook, entry, payload);
        // b. Let p1 be the result of transforming p0 with a new pass-through promise.
        let p1 = PassThroughPromise(p0);
        // c. Let p2 be the result of transforming p1 with a fulfillment handler that, when called with argument source, runs the following steps:
        let p2 = p1.then((source) => {
            // i. UpgradeToStage(entry, "instantiate").
            UpgradeToStage(entry, "instantiate");
        });
        // d. Return p1.
        return p1;
    });
    // 7. Set translateStageEntry.[[Result]] to p..
    translateStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.3. RequestInstantiate(entry)
export function RequestInstantiate(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
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
        // a. Let p0 be the result of promise-calling hook(entry, source).
        let p0 = promiseCall(hook, entry, source);
        // b. Let p1 be the result of transforming p0 with a new pass-through promise.
        let p1 = PassThroughPromise(p0);
        // c. Let p2 be the result of transforming p1 with a fulfillment handler that, when called with argument optionalInstance, runs the following steps:
        let p2 = p1.then((optionalInstance) => {
            // i. Let status be ? ExtractDependencies(entry, optionalInstance, source).
            // TODO: diverging from the spec to collect the internal slot [[Module]] of
            // the optionalInstance when possible, otherwise we get the namespace, which
            // it not what we use internally.
            ExtractDependencies(entry, optionalInstance && optionalInstance['[[Module]]'], source);
            // ii. UpgradeToStage(entry, "satisfy").
            UpgradeToStage(entry, "satisfy");
        })
// TODO: fix the shallow
.catch((err) => console.log(err.stack || err));
        // d. Return p1.
        return p1;
    });
    // 7. Set instantiateStageEntry.[[Result]] to p.
    instantiateStageEntry['[[Result]]'] = p;
    // 8. Return p.
    return p;
}

// 6.2.4. RequestSatisfy(entry)
export function RequestSatisfy(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
    // 2. Let satisfyStageEntry be GetStage(entry.[[Loader]], "satisfy").
    let satisfyStageEntry = GetStage(entry, "satisfy");
    // 3. If satisfyStageEntry is undefined, return a promise resolved with undefined.
    if (satisfyStageEntry === undefined) return Promise.resolve();
    // 4. If satisfyStageEntry.[[Result]] is not undefined, return satisfyStageEntry.[[Result]].
    if (satisfyStageEntry['[[Result]]'] !== undefined) return satisfyStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestInstantiate(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    let p = RequestInstantiate(entry).then((TODO_optionalInstance_instead_of_entry) => {
        // a. Let depLoads be a new empty List.
        let depLoads = [];
        // b. For each pair in entry.[[Dependencies]], do:
        entry['[[Dependencies]]'].forEach((pair) => {
            // i. Let p be the result of transforming Resolve(loader, pair.[[Key]], key) with a fulfillment handler that, when called with value depKey, runs the following steps:
            let p = Resolve(loader, pair['[[Key]]'], key).then((depKey) => {
                // 1. Let depEntry be EnsureRegistered(entry.[[Loader]], depKey).
                let depEntry = EnsureRegistered(entry['[[Loader]]'], depKey);
                // 2. Let pair.[[Key]] to depKey.
                pair['[[Key]]'] = depKey;
                // 3. Let pair.[[ModuleStatus]] to depEntry.
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
            // ii. Append p to depLoads.
            depLoads.push(p);
        });
        // c. Let p be the result of waiting for all depLoads.
        let p = Promise.all(depLoads);
        // d. Return the result of transforming p with a fulfillment handler that, when called, runs the following steps:
        return p.then(() => {
            // i. UpgradeToStage(entry, "link").
            UpgradeToStage(entry, "link");
            // ii. Return entry.
            return entry;
        });
    });
    // 6. Set satisfyStageEntry.[[Result]] to p.
    satisfyStageEntry['[[Result]]'] = p;
    // 7. Return p.
    return p;
}

// 6.2.5. RequestLink(entry)
export function RequestLink(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
    // 2. Let linkStageEntry be GetStage(entry, "link").
    let linkStageEntry = GetStage(entry, "link");
    // 3. If linkStageEntry is undefined, return a promise resolved with undefined.
    if (linkStageEntry === undefined) return Promise.resolve();
    // 4. If linkStageEntry.[[Result]] is not undefined, return linkStageEntry.[[Result]].
    if (linkStageEntry['[[Result]]'] !== undefined) return linkStageEntry['[[Result]]'];
    // 5. Return the result of transforming RequestSatisfy(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    return RequestSatisfy(entry).then((entry) => {
        // a. Assert: entry’s whole dependency graph is in "link" or "ready" stage.
        HowToDoThis('6.2.5. RequestLink(entry)', '5.a. Assert: entry’s whole dependency graph is in "link" or "ready" stage.');
        // b. Let status be ? Link(entry).
        let status = Link(entry);
        // c. Assert: entry’s whole dependency graph is in "ready" stage.
        HowToDoThis('6.2.5. RequestLink(entry)', '5.c. Assert: entry’s whole dependency graph is in "ready" stage.');
        // d. Return entry.
        return entry;
    });
    // BUG: spec missing storing the link promise
}

// 6.2.6. RequestReady(entry)
export function RequestReady(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(entry['[[Pipeline]]']);
    // 2. Let currentStageEntry be GetCurrentStage(entry).
    let currentStageEntry = GetCurrentStage(entry);
    // 3. If currentStageEntry.[[Stage]] is equal "ready", return currentStageEntry.[[Result]].
    if (currentStageEntry['[[Stage]]'] === "ready") return currentStageEntry['[[Result]]'];
    // 4. Return the result of transforming RequestLink(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    return RequestLink(entry).then((entry) => {
        // a. Let module be entry.[[Module]].
        let mod = entry['[[Module]]'];
        // b. Let status be ? module.ModuleEvaluation().
        let status = ModuleEvaluation.call(mod);
        // c. Return module.
        return mod;
    });
    // BUG: spec missing storing the ready promise
}
