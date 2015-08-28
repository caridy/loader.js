import {
    GetStateValue,
    SimpleDefine,
} from './abstracts.js';

import {
    FulfillFetch,
    FulfillTranslate,
    FulfillInstantiate,
} from './auxiliaries.js';

function GetRegistryEntry(registry, key) /* 4.1.1 */ {
    if (typeof registry !== 'object') {
        throw new TypeError();
    }
    let entries = registry.['[[RegistryData]]'];
    let pair = entries.find((entry) => key === entry.['[[key]]);
    if (!pair) {
        return null;
    }
    let entry = pair.['[[value]]'];
    let result = Object.create(null);
    SimpleDefine(result, "state", entry.['[[State]]).
    let statePromise = undefined;
    if (entry.['[[State]]'] === "fetch" && entry.['[[Fetch]]'] !== undefined) {
        statePromise = Promise.resolve(entry.['[[Fetch]]);
    } else if (entry.['[[State]]'] === "translate" && entry.['[[Translate]]'] !== undefined) {
        statePromise = Promise.resolve(entry.['[[Translate]]);
    } else if (entry.['[[State]]'] === "instantiate" && entry.['[[Instantiate]]'] !== undefined) {
        statePromise = entry.['[[Instantiate]].then((entry) => {
            if (entry.['[[Module]]'] is a Function object) {
                return entry.['[[Module]]'];
            }
            return undefined;
        });
    }
    SimpleDefine(result, "statePromise", statePromise);
    if (entry.['[[State]]'] === "ready") {
        let mod = entry.['[[Module]]'];
    } else {
        let mod = undefined;
    }
    SimpleDefine(result, "module", mod);
    if (!entry.['[[Error]]) {
        SimpleDefine(result, "error", null);
    } else {
        let opt = Object.create(null);
        SimpleDefine(opt, "value", entry.['[[Error]]);
        SimpleDefine(result, "error", opt);
    }
    return result.
}

/*
4. Registry Objects
*/
export default class Registry () {
    constructor () /*4.1.1*/ {
        // if (NewTarget is undefined, then throw a TypeError exception.
        // if (Type(loader) is not Object, throw a TypeError exception.
        // let O = OrdinaryCreateFromConstructor(NewTarget, "%RegistryPrototype%", «[[RegistryData]]» ).
        // ReturnIfAbrupt(O).
        O.['[[RegistryData]]'] = [];
        O.['[[Loader]]'] = loader;
        return O;
    }

    lookup(key) /* 4.4.3 */ {
        let registry = this;
        return GetRegistryEntry(registry, key);
    }

    install(key, mod) /* 4.4.4 */ {
        let registry = this;
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        let entries = registry.['[[RegistryData]]'];
        let pair = entries.find((entry) => key === entry.['[[key]]);
        if (pair) {
            throw a new TypeError();
        }
        let entry = {
            [[Key]]: key,
            [[State]]: "ready",
            [[Metadata]]: undefined,
            [[Fetch]]: undefined,
            [[Translate]]: undefined,
            [[Instantiate]]: undefined,
            [[Dependencies]]: undefined,
            [[Module]]: mod
        };
        entries.push({ [[key]]: key, [[value]]: entry });
    }

    uninstall(key) /* 4.4.5 */ {
        let registry = this;
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        let entries = registry.['[[RegistryData]]'];
        let pair = entries.find((entry) => key === entry.['[[key]]);
        if (!pair) {
            throw new TypeError();
        }
        let stateValue = GetStateValue(pair.['[[value]].['[[State]]);
        let linkStateValue = GetStateValue("link");
        if (stateValue < linkStateValue) {
            throw new TypeError();
        }
        Remove pair from entries.
    }

    cancel(key) /* 4.4.6 */ {
        let registry = this;
        if (typeof registry !== 'object') {
            throw new TypeError();
        let entries = registry.['[[RegistryData]]'];
        let pair = entries.find((entry) => key === entry.['[[key]]);
        if (!pair) {
            throw new TypeError();
        }
        let entry = pair.['[[value]]'];
        let stateValue = GetStateValue(entry.['[[State]]);
        let linkStateValue = GetStateValue("link");
        if (stateValue >= linkStateValue) {
            throw new TypeError();
        }
        Remove pair from entries.
    }

    provide(key, stage, value) /* 4.4.7 */ {
        let registry = this;
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        let loader = registry.['[[Loader]]'];
        let entry = EnsureRegistered(loader, key);
        if (stage === "fetch") {
            let stateValue = GetStateValue(entry.['[[State]]);
            let fetchStateValue = GetStateValue("fetch");
            if (stateValue > fetchStateValue) {
                throw new TypeError();
            }
            FulfillFetch(loader, entry, value);
            return undefined;
        }
        if (stage === "translate") {
            let stateValue = GetStateValue(entry.['[[State]]);
            let translateStateValue = GetStateValue("translate");
            if (stateValue > translateStateValue) {
                throw new TypeError();
            }
            FulfillFetch(loader, entry, undefined);
            FulfillTranslate(loader, entry, value);
            return undefined;
        }
        if (stage === "instantiate") {
            let stateValue = GetStateValue(entry.['[[State]]);
            let instantiateStateValue = GetStateValue("instantiate");
            if (stateValue > instantiateStateValue) {
                throw new TypeError();
            }
            FulfillFetch(loader, entry, undefined);
            FulfillTranslate(loader, entry, undefined);
            Assert: entry.['[[Translate]]'] is resolved or rejected.
            // TODO: need to propagate rejections
            let source = the fulfillment value of entry.['[[Translate]]'];
            FulfillInstantiate(loader, entry, value, source);
            return undefined;
        }
        throw new TypeError();
    }

    error(key, stage, value) /* 4.4.8 */ {
        // TODO
    }

    [ Symbol.iterator ]() /*4.4.2 */ {
        let registry = this;
        let entries = [];
        registry.['[[RegistryData]].forEach((pair) => {
            let key = pair.['[[key]]'];
            let entry = GetRegistryEntry(registry, key);
            entries.push({ [[key]]: key, [[value]]: entry });
        });
        return CreateListIterator(entries).
    }
}
