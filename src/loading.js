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
    let entry = EnsureRegistered(loader, key);
    let stateValue = GetStateValue(entry['[[State]]']);
    let linkStateValue = GetStateValue("link");
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    if (entry['[[Fetch]]'] !== undefined) {
        return entry['[[Fetch]]'];
    }
    let hook = GetMethod(loader, @@fetch);
    // TODO: metadata object
    let p0 = promiseCall(hook, key);
    let p = p0.then((payload) => {
        SetStateToMax(entry, "translate");
        return payload;
    });
    Set entry['[[Fetch]]'] to p;
    return p.
}

export function /* 5.2.2 */ RequestTranslate(loader, key) {
    let entry = EnsureRegistered(loader, key);
    let stateValue = GetStateValue(entry['[[State]]']);
    let linkStateValue = GetStateValue("link");
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    if (entry['[[Translate]]'] !== undefined) {
        return entry['[[Translate]]'];
    }
    let hook = GetMethod(loader, @@translate);
    let p = RequestFetch(loader, key).then((payload) => {
        // TODO: metadata
        let p1 = promiseCall(hook, key, payload);
        return p1.then((source) => {
            SetStateToMax(entry, "instantiate").
            return source;
        });
    });
    entry['[[Translate]]'] = p;
    return p;
}

            import {
                promiseCall,
                createPromiseSlot,
                resolvePromiseSlot,
                rejectPromiseSlot,
            } from './utils.js';

            export function /* 5.2.2 */ RequestTranslate(loader, key) {
                let entry = EnsureRegistered(loader, key);
                let stateValue = GetStateValue(entry['[[State]]']);
                let linkStateValue = GetStateValue("link");
                if (stateValue > linkStateValue) {
                    return Promise.reject(new Error('Module entry state is greater than link.'));
                }
                if (entry['[[Translate]]'] !== undefined) {
                    return entry['[[Translate]]'];
                }
                p = createPromiseSlot();
                let hook = GetMethod(loader, @@translate);
                RequestFetch(loader, key).then((payload) => {
                    // TODO: metadata
                    let p1 = promiseCall(hook, key, payload);
                    return p1.then((source) => {
                        SetStateToMax(entry, "instantiate").
                        return source;
                    });
                });
                entry['[[Translate]]'] = p;
                return p;
            }






export function /* 5.2.3 */ RequestInstantiate(loader, key) {
    let entry = EnsureRegistered(loader, key);
    if (entry['[[State]]'] === "ready") {
        return Promise.reject(new Error('Module entry was already instantiated.'));
    }
    if (entry['[[Instantiate]]'] != undefined) {
        return entry['[[Instantiate]]'];
    }
    let hook = GetMethod(loader, @@instantiate);
    let p = RequestTranslate(loader, key).then((source) => {
        // TODO: metadata
        let p1 = promiseCalling(hook, key, source);
        return p1.then((optionalInstance) => {
            let status = CommitInstantiated(loader, entry, optionalInstance, source);
            // ReturnIfAbrupt(status).
            return entry;
        });
    });
    entry['[[Instantiate]]'] = p;
    return p;
}

export function /* 5.2.4 */ RequestInstantiateAll(loader, key) {
    return RequestInstantiate(loader, key).then((entry) => {
        let depLoads = [];
        entry['[[Dependencies]]'].forEach((pair) => {
            let p = Resolve(loader, pair['[[key]]'], key).then((depKey) => {
                let depEntry = EnsureRegistered(loader, depKey);
                if (depEntry['[[State]]'] === "ready") {
                    let dep = depEntry['[[Module]]'];
                    pair['[[value]]'] = dep;
                    return dep;
                }
                return RequestInstantiateAll(loader, depKey).then((depEntry) => {
                    let dep = depEntry['[[Module]]'];
                    pair['[[value]]'] = dep;
                    return dep;
                });
            });
            depLoads.push(p);
        });
        let p = Promise.all(depLoads);
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
