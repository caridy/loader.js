import {
    resolvePromiseSlot,
    rejectPromiseSlot,
} from './utils.js';

import {
    SetStateToMax,
} from './abstracts.js';

/**
 * The GetStateValue abstract operation returns a Number value representing the
 * state.
 */
export function /* 5.1.1 */ EnsureRegistered(loader, key) {
    // Assert: loader has a [[Registry]]'] internal slot.
    let pair = loader.['[[Registry]].find((entry) => key === entry.['[[key]]);
    if (pair) {
        let entry = pair.['[[value]]'];
    } else {
        let entry = {
            [[Key]]: key,
            [[State]]: "fetch",
            [[Metadata]]: undefined,
            [[Fetch]]: undefined,
            [[Translate]]: undefined,
            [[Instantiate]]: undefined,
            [[Dependencies]]: undefined,
            [[Module]]: undefined,
            [[Error]]: undefined
        };
    }
    loader.['[[Registry]].push({ [[key]]: key, [[value]]: entry });
    return entry;
}

export function /* 5.1.2 */ Resolve(loader, name, referrer) {
    let hook = loader[Reflect.Loader.resolve];
    return hook(name, referrer);
}

export function /* 5.1.3 */ FulfillFetch(loader, entry, payload)
    if (entry.['[[Fetch]]'] === undefined) {
        entry.['[[Fetch]]'] = Promise.resolve(payload);
    } else {
        resolvePromiseSlot(entry.['[[Fetch]]'], payload);
    }
    SetStateToMax(entry, "translate").
}

export function /* 5.1.4 */ FulfillTranslate(loader, entry, source)
    if (entry.['[[Translate]]'] === undefined) {
        entry.['[[Translate]]'] = Promise.resolve(source);
    } else {
        resolvePromiseSlot(entry.['[[Translate]]'], source);
    }
    SetStateToMax(entry, "instantiate").
}

export function /* 5.1.5 */ FulfillInstantiate(loader, entry, optionalInstance, source) {
    if (entry.['[[Instantiate]]'] === undefined) {
        entry.['[[Instantiate]]'] = new Promise(); // TODO: what is this doing? when is this resolved?
    }
    return CommitInstantiated(loader, entry, optionalInstance, source).
}

export function /* 5.1.6 */ CommitInstantiated(loader, entry, optionalInstance, source)
    let instance = Instantiation(loader, optionalInstance, source);
    // ReturnIfAbrupt(instance).
    // TODO: edge case: what if instance is a thenable function?
    let deps = [];
    if (instance is a Module Record) {
        // Assert: instance is a Source Text Module Record.
        instance.['[[RegistryEntry]]'] = entry;
        instance.['[[RequestedModules]].forEach((dep) => {
            deps.push({ [[key]]: dep, [[value]]: undefined });
        });
    }
    entry.['[[Dependencies]]'] = deps;
    entry.['[[Module]]'] = instance;
    SetStateToMax(entry, "link");
}

export function /* 5.1.7 */ Instantiation(loader, result, source)
    if (result === undefined) {
        return ParseModule(source);
    }
    if (IsCallable(result) === false)
        throw new TypeError();
    }
    // result.['[[Realm]]'] = loader.['[[Realm]]'];
    return result;
}
