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
    createPromiseSlot,
    resolvePromiseSlot,
    rejectPromiseSlot,
} from './utils.js';

/**
 * The GetStateValue abstract operation returns a Number value representing the
 * state.
 */
export function /* 5.2.1 */ RequestFetch(loader, key) {
    let entry = EnsureRegistered(loader, key);
    let stateValue = GetStateValue(entry.[[State]]);
    let linkStateValue = GetStateValue("link");
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    if (entry.[[Fetch]] !== undefined) {
        return entry.[[Fetch]];
    }
    let hook = GetMethod(loader, @@fetch);
    // TODO: metadata object
    let p0 = promiseCall(hook, key);
    let p = p0.then((payload) => {
        SetStateToMax(entry, "translate");
        return payload;
    });
    Set entry.[[Fetch]] to p;
    return p.
}

export function /* 5.2.2 */ RequestTranslate(loader, key) {
    let entry = EnsureRegistered(loader, key);
    let stateValue = GetStateValue(entry.[[State]]);
    let linkStateValue = GetStateValue("link");
    if (stateValue > linkStateValue) {
        return Promise.reject(new Error('Module entry state is greater than link.'));
    }
    if (entry.[[Translate]] !== undefined) {
        return entry.[[Translate]];
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
    entry.[[Translate]] = p;
    return p;
}

            export function /* 5.2.2 */ RequestTranslate(loader, key) {
                let entry = EnsureRegistered(loader, key);
                let stateValue = GetStateValue(entry.[[State]]);
                let linkStateValue = GetStateValue("link");
                if (stateValue > linkStateValue) {
                    return Promise.reject(new Error('Module entry state is greater than link.'));
                }
                if (entry.[[Translate]] !== undefined) {
                    return entry.[[Translate]];
                }
                entry.[[Translate]] = ;
                let hook = GetMethod(loader, @@translate);
                let p = RequestFetch(loader, key).then((payload) => {
                    // TODO: metadata
                    let p1 = promiseCall(hook, key, payload);
                    return p1.then((source) => {
                        SetStateToMax(entry, "instantiate").
                        return source;
                    });
                });
                entry.[[Translate]] = p;
                return p;
            }






export function /* 5.2.3 */ RequestInstantiate(loader, key) {
    let entry = EnsureRegistered(loader, key);
    if (entry.[[State]] === "ready"_ {
        return Promise.reject(new Error('Module entry was already instantiated.'));
    }
    if (entry.[[Instantiate]] != undefined) {
        return entry.[[Instantiate]];
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
    entry.[[Instantiate]] = p;
    return p;
}

export function /* 5.2.4 */ RequestInstantiateAll(loader, key) {
    return RequestInstantiate(loader, key).then((entry) => {
        let depLoads = [];
        entry.[[Dependencies]].forEach((pair) => {
            let p = Resolve(loader, pair.[[key]], key).then((depKey) => {
                let depEntry = EnsureRegistered(loader, depKey);
                if (depEntry.[[State]] === "ready") {
                    let dep = depEntry.[[Module]];
                    pair.[[value]] = dep;
                    return dep;
                }
                return RequestInstantiateAll(loader, depKey).then((depEntry) => {
                    let dep = depEntry.[[Module]];
                    pair.[[value]] = dep;
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
    let entry = EnsureRegistered(loader, key);
    if (entry.[[State]] === "ready") {
        return Promise.resolve(entry.[[Module]]);
    }
    return RequestInstantiateAll(loader, key).then((entry) => {
        // Assert: entry’s whole dependency graph is in "link" state.
        let status = Link(loader, entry);
        // ReturnIfAbrupt(status).
        // Assert: entry’s whole dependency graph is in "ready" state.
        return entry;
    });
}

export function /* 5.2.6 */ RequestReady(loader, key) {
    return RequestLink(loader, key).then((entry) => {
        let mod = entry.[[Module]];
        let status = ModuleEvaluation.call(mod);
        // ReturnIfAbrupt(status);
        return mod;
    });
}
