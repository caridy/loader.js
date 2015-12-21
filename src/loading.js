import {
    EnsureRegistered,
} from './auxiliaries.js';

import {
    PassThroughPromise,
    GetStateValue,
    SetStateToMax,
    GetMethod,
    ModuleEvaluation,
} from './abstracts.js';

import {
    promiseCall,
} from './utils.js';

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
    let hook = GetMethod(entry['[[Loader]]'], Reflect.Loader.fetch);
    // 6. Let p0 be the result of promise-calling hook(entry, entry.[[Key]]).
    let p0 = promiseCall(hook, entry, entry['[[Key]]']);
    // 7. Let p1 be the result of transforming p0 with a new pass-through promise.
    let p1 = PassThroughPromise(p0);
    // 8 Let p2 be the result of transforming p1 with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p2 = p1.then((payload) => {
        // a. UpgradeToStage(entry, "translate").
        UpgradeToStage(entry, "translate");
    });
    // 9. Set translateStageEntry.[[Result]] to p.
    translateStageEntry['[[Result]]'] = p;
    // 10. Return p1.
    return p;
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
    let hook = entry['[[Loader]]'][Reflect.Loader.translate];
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
    let hook = entry['[[Loader]]'][Reflect.Loader.instantiate];
    // 6. Let p be the result of transforming RequestTranslate(entry) with a fulfillment handler that, when called with argument source, runs the following steps:
    let p = RequestTranslate(entry).then((source) => {
        // a. Let p0 be the result of promise-calling hook(entry, source).
        let p0 = promiseCalling(hook, entry, source);
        // b. Let p1 be the result of transforming p0 with a new pass-through promise.
        let p1 = PassThroughPromise(p0);
        // c. Let p2 be the result of transforming p1 with a fulfillment handler that, when called with argument optionalInstance, runs the following steps:
        let p2 = p1.then((optionalInstance) => {
            // i. Let status be ? ExtractDependencies(entry, optionalInstance, source).
            ExtractDependencies(entry, optionalInstance, source);
            // ii. UpgradeToStage(entry, "satisfy").
            UpgradeToStage(entry, "satisfy");
        });
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
    let satisfyStageEntry = GetStage(entry['[[Loader]]'], "satisfy");
    // 3. If satisfyStageEntry is undefined, return a promise resolved with undefined.
    if (satisfyStageEntry === undefined) return Promise.resolve();
    // 4. If satisfyStageEntry.[[Result]] is not undefined, return satisfyStageEntry.[[Result]].
    if (satisfyStageEntry['[[Result]]'] !== undefined) return satisfyStageEntry['[[Result]]'];
    // 5. Let p be the result of transforming RequestInstantiate(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
    let p = RequestInstantiate(entry).then((entry) => {
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
        HowToDoThis();
        // b. Let status be ? Link(entry).
        let status = Link(entry);
        // c. Assert: entry’s whole dependency graph is in "ready" stage.
        HowToDoThis();
        // d. Return entry.
        return entry;
    });
    // BUG: spec missing storing the link promise
}

// 6.2.6. RequestReady(entry)
export function RequestReady(ready) {
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
