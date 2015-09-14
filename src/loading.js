import {
    EnsureRegistered,
} from './auxiliaries.js';

import {
    GetStateValue,
    SetStateToMax,
    GetMethod,
    ModuleEvaluation,
} from './abstracts.js';

import {
    promiseCall,
} from './utils.js';

/**
 * The GetStateValue abstract operation returns a Number value representing the
 * state.
 */
export function /* 5.2.1 */ RequestFetch(loader, key) {
    // 1. Let entry be EnsureRegistered(loader, key).
    let entry = EnsureRegistered(loader, key);
    // 2. Let stateValue be GetStateValue(entry.[[State]]).
    let stateValue = GetStateValue(entry['[[State]]']);
    // 3. Let linkStateValue be GetStateValue("link").
    let linkStateValue = GetStateValue("link");
    // 4. If stateValue is greater than linkStateValue, return a new error promise.
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    // 5. If entry.[[Fetch]] is not undefined, return entry.[[Fetch]].
    if (entry['[[Fetch]]'] !== undefined) {
        return entry['[[Fetch]]'];
    }
    // 6. Let hook be GetMethod(loader, @@fetch).
    let hook = GetMethod(loader, @@fetch);
    // 7. // TODO: metadata object
    // 8. Let p0 be the result of promise-calling hook(key).
    let p0 = promiseCall(hook, key);
    // 9. Let p be the result of transforming p0 with a fulfillment handler that, when called with argument payload, runs the following steps:
    let p = p0.then((payload) => {
        // a. SetStateToMax(entry, "translate").
        SetStateToMax(entry, "translate");
        // b. Return payload.
        return payload;
    });
    // 10. Set entry.[[Fetch]] to p.
    Set entry['[[Fetch]]'] to p;
    // 11. Return p.
    return p.
}

export function /* 5.2.2 */ RequestTranslate(loader, key) {
    // 1. Let entry be EnsureRegistered(loader, key).
    let entry = EnsureRegistered(loader, key);
    // 2. Let stateValue be GetStateValue(entry.[[State]]).
    let stateValue = GetStateValue(entry['[[State]]']);
    // 3. Let linkStateValue be GetStateValue("link").
    let linkStateValue = GetStateValue("link");
    // 4. If stateValue is greater than linkStateValue, return a new error promise.
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    // 5. If entry.[[Translate]] is not undefined, return entry.[[Translate]].
    if (entry['[[Translate]]'] !== undefined) {
        return entry['[[Translate]]'];
    }
    // 6. Let hook be GetMethod(loader, @@translate).
    let hook = GetMethod(loader, @@translate);
    // 7. Let p be the result of transforming RequestFetch(loader, key) with a fulfillment handler that, when called with argument payload,
    // runs the following steps:
    let p = RequestFetch(loader, key).then((payload) => {
        // a. // TODO: metadata
        // b. Let p1 be the result of promise-calling hook(key, payload).
        let p1 = promiseCall(hook, key, payload);
        // c. Return the result of transforming p1 with a fulfillment handler that, when called with argument source, runs the following steps:
        return p1.then((source) => {
            // i. SetStateToMax(entry, "instantiate").
            SetStateToMax(entry, "instantiate").
            // ii. Return source.
            return source;
        });
    });
    // 8. Set entry.[[Translate]] to p.
    entry['[[Translate]]'] = p;
    // 9. Return p.
    return p;
}

            // Interin Code...
            // import {
            //     promiseCall,
            //     createPromiseSlot,
            //     resolvePromiseSlot,
            //     rejectPromiseSlot,
            // } from './utils.js';
            //
            // export function /* 5.2.2 */ RequestTranslate(loader, key) {
            //     let entry = EnsureRegistered(loader, key);
            //     let stateValue = GetStateValue(entry['[[State]]']);
            //     let linkStateValue = GetStateValue("link");
            //     if (stateValue > linkStateValue) {
            //         return Promise.reject(new Error('Module entry state is greater than link.'));
            //     }
            //     if (entry['[[Translate]]'] !== undefined) {
            //         return entry['[[Translate]]'];
            //     }
            //     p = createPromiseSlot();
            //     let hook = GetMethod(loader, @@translate);
            //     RequestFetch(loader, key).then((payload) => {
            //         // TODO: metadata
            //         let p1 = promiseCall(hook, key, payload);
            //         return p1.then((source) => {
            //             SetStateToMax(entry, "instantiate").
            //             return source;
            //         });
            //     });
            //     entry['[[Translate]]'] = p;
            //     return p;
            // }


export function /* 5.2.3 */ RequestInstantiate(loader, key) {
    // 1. Let entry be EnsureRegistered(loader, key).
    let entry = EnsureRegistered(loader, key);
    // 2. If entry.[[State]] is "ready", return a new error promise.
    if (entry['[[State]]'] === "ready") {
        return Promise.reject(new Error('Module entry was already instantiated.'));
    }
    // 3. If entry.[[Instantiate]] is not undefined, return entry.[[Instantiate]].
    if (entry['[[Instantiate]]'] != undefined) {
        return entry['[[Instantiate]]'];
    }
    // 4. Let hook be GetMethod(loader, @@instantiate).
    let hook = GetMethod(loader, @@instantiate);
    // 5. Let p be the result of transforming RequestTranslate(loader, key) with a fulfillment handler that, when called with argument source,
    // runs the following steps:
    let p = RequestTranslate(loader, key).then((source) => {
        // a. // TODO: metadata
        // b. Let p1 be the result of promise-calling hook(key, source).
        let p1 = promiseCalling(hook, key, source);
        // c. Return the result of transforming p1 with a fulfillment handler that, when called with argument optionalInstance, runs the
        // following steps:
        return p1.then((optionalInstance) => {
            // i. Let status be CommitInstantiated(loader, entry, optionalInstance, source).
            let status = CommitInstantiated(loader, entry, optionalInstance, source);
            // ii. ReturnIfAbrupt(status).
            HowToDoThis();
            // iii. Return entry.
            return entry;
        });
    });
    // 6. Set entry.[[Instantiate]] to p.
    entry['[[Instantiate]]'] = p;
    // 7. Return p.
    return p;
}

export function /* 5.2.4 */ RequestInstantiateAll(loader, key) {
    // 1. Return the result of transforming RequestInstantiate(loader, key) with a fulfillment handler that, when called with argument entry, runs the following steps:
    return RequestInstantiate(loader, key).then((entry) => {
        // a. Let depLoads be a new empty List.
        let depLoads = [];
        // b. For each pair in entry.[[Dependencies]], do:
        entry['[[Dependencies]]'].forEach((pair) => {
            // i. Let p be the result of transforming Resolve(loader, pair.[[key]], key) with a fulfillment handler that, when called with value depKey, runs the following steps:
            let p = Resolve(loader, pair['[[key]]'], key).then((depKey) => {
                // 1. Let depEntry be EnsureRegistered(loader, depKey).
                let depEntry = EnsureRegistered(loader, depKey);
                // 2. If depEntry.[[State]] is "ready", then:
                if (depEntry['[[State]]'] === "ready") {
                    // a. Let dep be depEntry.[[Module]].
                    let dep = depEntry['[[Module]]'];
                    // b. Set pair.[[value]] to dep.
                    pair['[[value]]'] = dep;
                    // c. Return dep.
                    return dep;
                }
                // 3. Return the result of transforming RequestInstantiateAll(loader, depKey) with a fulfillment handler that, when called with value depEntry, runs the following steps:
                return RequestInstantiateAll(loader, depKey).then((depEntry) => {
                    // a. Let dep be depEntry.[[Module]].
                    let dep = depEntry['[[Module]]'];
                    // b. Set pair.[[value]] to dep.
                    pair['[[value]]'] = dep;
                    // c. Return dep.
                    return dep;
                });
            });
            // ii. Append p to depLoads.
            depLoads.push(p);
        });
        // c. Let p be the result of waiting for all depLoads.
        let p = Promise.all(depLoads);
        // d. Return the result of transforming p with a fulfillment handler that, when called, runs the following steps:
            // i. Return entry.
        return p.then(() => entry);
    });
}

export function /* 5.2.5 */ RequestLink(loader, key) {
    // 1. Let entry be EnsureRegistered(loader, key).
    let entry = EnsureRegistered(loader, key);
    // 2. If entry.[[State]] is "ready", return a new promise fulfilled with entry.[[Module]].
    if (entry['[[State]]'] === "ready") {
        return Promise.resolve(entry['[[Module]]']);
    }
    // 3. Return the result of transforming RequestInstantiateAll(loader, key) with a fulfillment handler that, when called with argument
    // entry, runs the following steps:
    return RequestInstantiateAll(loader, key).then((entry) => {
        // a. Assert: entry’s whole dependency graph is in "link" state.
        howToDoThis();
        // b. Let status be Link(loader, entry).
        let status = Link(loader, entry);
        // c. ReturnIfAbrupt(status).
        ReturnIfAbrupt(status).
        // d. Assert: entry’s whole dependency graph is in "ready" state.
        howToDoThis();
        // e. Return entry.
        return entry;
    });
}

export function /* 5.2.6 */ RequestReady(loader, key) {
    // 1. Return the result of transforming RequestLink(loader, key) with a fulfillment handler that, when called with argument entry, runs the following steps:
    return RequestLink(loader, key).then((entry) => {
        // a. Let module be entry.[[Module]].
        let mod = entry['[[Module]]'];
        // b. Let status be the result of calling the ModuleEvaluation abstract operation of module with no arguments.
        let status = ModuleEvaluation.call(mod);
        // c. ReturnIfAbrupt(status).
        ReturnIfAbrupt(status);
        // d. Return module.
        return mod;
    });
}
