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
    // 1. If Type(registry) is not Object, throw a TypeError exception.
    if (typeof registry !== 'object') {
        throw new TypeError();
    }
    // 2. Let entries be registry.[[RegistryData]].
    let entries = registry['[[RegistryData]]'];
    // 3. Let pair be the entry in entries such that pair.[[key]] is equal to key.
    let pair = entries.find((entry) => key === entry['[[key]]']);
    // 4. If pair does not exist, then return null.
    if (!pair) {
        return null;
    }
    // 5. Let entry be pair.[[value]].
    let entry = pair['[[value]]'];
    // 6. Let result be CreateObject().
    let result = Object.create(null);
    // 7. Call SimpleDefine(result, "state", entry.[[State]]).
    SimpleDefine(result, "state", entry['[[State]]']).
    // 8. Let statePromise be undefined.
    let statePromise = undefined;
    // 9. If entry.[[State]] is "fetch" and entry.[[Fetch]] is not undefined, then
    if (entry['[[State]]'] === "fetch" && entry['[[Fetch]]'] !== undefined) {
        // a. Set statePromise to the result of transforming entry.[[Fetch]] with a new pass-through promise.
        statePromise = Promise.resolve(entry['[[Fetch]]']);
    }
    // 10. Else If entry.[[State]] is "translate" and entry.[[Translate]] is not undefined, then
    else if (entry['[[State]]'] === "translate" && entry['[[Translate]]'] !== undefined) {
        // a. Set statePromise to the result of transforming entry.[[Translate]] with a new pass-through promise.
        statePromise = Promise.resolve(entry['[[Translate]]']);
    }
    // 11. Else If entry.[[State]] is "instantiate" and entry.[[Instantiate]] is not undefined, then
    else if (entry['[[State]]'] === "instantiate" && entry['[[Instantiate]]'] !== undefined) {
        // a. Set statePromise to the result of transforming entry.[[Instantiate]] with a fulfillment handler that, when called with argument entry, runs the following steps:
        statePromise = entry['[[Instantiate]]'].then((entry) => {
            // i. If entry.[[Module]] is a Function object, then return entry.[[Module]].             if (entry['[[Module]]'] is a Function object) {
                return entry['[[Module]]'];
            }
            // ii. Return undefined.
            return undefined;
        });
    }
    // 12. Call SimpleDefine(result, "statePromise", statePromise).
    SimpleDefine(result, "statePromise", statePromise);
    // 13. If entry.[[State]] is "ready" then let module be entry.[[Module]].
    if (entry['[[State]]'] === "ready") {
        let mod = entry['[[Module]]'];
    }
    // 14. Else let module be undefined.
    else {
        let mod = undefined;
    }
    // 15. Call SimpleDefine(result, "module", module).
    SimpleDefine(result, "module", mod);
    // 16. If entry.[[Error]] is nothing, then:
    if (!entry['[[Error]]']) {
        //a. Call SimpleDefine(result, "error", null).
        SimpleDefine(result, "error", null);
    }
    // 17. Else:
    else {
        // a. Let opt be CreateObject().
        let opt = Object.create(null);
        // b. Call SimpleDefine(opt, "value", entry.[[Error]]).
        SimpleDefine(opt, "value", entry['[[Error]]']);
        // c. Call SimpleDefine(result, "error", opt).
        SimpleDefine(result, "error", opt);
    }
    // 18. Return result.
    return result.
}

/*
4. Registry Objects
*/
export default class Registry () {
    constructor () /*4.1.1*/ {
        HowToDoThis(1, 2, 3, 4);
        // 1. If NewTarget is undefined, then throw a TypeError exception.
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        // 3. Let O be OrdinaryCreateFromConstructor(NewTarget, "%RegistryPrototype%", «[[RegistryData]]» ).
        // 4. ReturnIfAbrupt(O).
        // 5. Set O’s [[RegistryData]] internal slot to a new empty List.
        O['[[RegistryData]]'] = [];
        // 6. Set O’s [[Loader]] internal slot to loader.
        O['[[Loader]]'] = loader;
        // 7. Return O.
        return O;
    }

    lookup(key) /* 4.4.3 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. Return GetRegistryEntry(registry, key).
        return GetRegistryEntry(registry, key);
    }

    install(key, mod) /* 4.4.4 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        // 3. Let entries be registry.[[RegistryData]].
        let entries = registry['[[RegistryData]]'];
        // 4. Let pair be the entry in entries such that pair.[[key]] is equal to key.
        let pair = entries.find((entry) => key === entry['[[key]]']);
        // 5. If pair exists, then throw a new TypeError.
        if (pair) {
            throw a new TypeError();
        }
        // 6. Let entry be a new registry entry record { [[Key]]: key, [[State]]: "ready", [[Metadata]]: undefined, [[Fetch]]: undefined, [[Translate]]:
        // undefined, [[Instantiate]]: undefined, [[Dependencies]]: undefined, [[Module]]: module }.
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
        // 7. Append { [[key]]: key, [[value]]: entry } to entries.
        entries.push({ [[key]]: key, [[value]]: entry });
    }

    uninstall(key) /* 4.4.5 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        // 3. Let entries be registry.[[RegistryData]].
        let entries = registry['[[RegistryData]]'];
        // 4. Let pair be the entry in entries such that pair.[[key]] is equal to key.
        let pair = entries.find((entry) => key === entry['[[key]]']);
        // 5. If pair does not exist, then throw a new TypeError.
        if (!pair) {
            throw new TypeError();
        }
        // 6. Let stateValue be GetStateValue(pair.[[value]].[[State]]).
        let stateValue = GetStateValue(pair['[[value]]']['[[State]]']);
        // 7. Let linkStateValue be GetStateValue("link").
        let linkStateValue = GetStateValue("link");
        // 8. If stateValue is less than linkStateValue, then throw a new TypeError.
        if (stateValue < linkStateValue) {
            throw new TypeError();
        }
        // 9. Remove pair from entries.
        howToDoThis();
    }

    cancel(key) /* 4.4.6 */ {
        // 1. Let registry be this value.
        let registry = this;
        // ￼￼￼￼￼2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== 'object') {
            throw new TypeError();
        // 3. Let entries be registry.[[RegistryData]].
        let entries = registry['[[RegistryData]]'];
        // 4. Let pair be the entry in entries such that pair.[[key]] is equal to key.
        let pair = entries.find((entry) => key === entry['[[key]]']);
        // 5. If pair does not exist, then throw a new TypeError.
        if (!pair) {
            throw new TypeError();
        }
        // 6. Let entry be pair.[[value]].
        let entry = pair['[[value]]'];
        // 7. Let stateValue be GetStateValue(entry.[[State]]).
        let stateValue = GetStateValue(entry['[[State]]']);
        // 8. Let linkStateValue be GetStateValue("link").
        let linkStateValue = GetStateValue("link");
        // 9. If stateValue is greater than or equal to linkStateValue, throw a new TypeError.
        if (stateValue >= linkStateValue) {
            throw new TypeError();
        }
        // 10. Remove pair from entries.
        howToDoThis();
    }

    provide(key, stage, value) /* 4.4.7 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. If Type(registry) is not Object, throw a TypeError exception.
        if (typeof registry !== 'object') {
            throw new TypeError();
        }
        // 3. Let loader be registry.[[Loader]] value.
        let loader = registry['[[Loader]]'];
        // 4. Let entry be EnsureRegistered(loader, key).
        let entry = EnsureRegistered(loader, key);
        // 5. If stage is "fetch", then:
        if (stage === "fetch") {
            // a. Let stateValue be GetStateValue(entry.[[State]]).
            let stateValue = GetStateValue(entry['[[State]]']);
            // b. Let fetchStateValue be GetStateValue("fetch").
            let fetchStateValue = GetStateValue("fetch");
            // c. If stateValue is greater than fetchStateValue, throw a new TypeError.
            if (stateValue > fetchStateValue) {
                throw new TypeError();
            }
            // d. Call FulfillFetch(loader, entry, value).
            FulfillFetch(loader, entry, value);
            // e. Return undefined.
            return undefined;
        }
        // 6. If stage is "translate", then:
        if (stage === "translate") {
            // a. Let stateValue be GetStateValue(entry.[[State]]).
            let stateValue = GetStateValue(entry['[[State]]']);
            // b. Let translateStateValue be GetStateValue("translate").
            let translateStateValue = GetStateValue("translate");
            // c. If stateValue is greater than translateStateValue, throw a new TypeError.
            if (stateValue > translateStateValue) {
                throw new TypeError();
            }
            // d. Call FulfillFetch(loader, entry, undefined).
            FulfillFetch(loader, entry, undefined);
            // e. Call FulfillTranslate(loader, entry, value).
            FulfillTranslate(loader, entry, value);
            // f. Return undefined.
            return undefined;
        }
        // 7. If stage is "instantiate", then:
        if (stage === "instantiate") {
            // a. Let stateValue be GetStateValue(entry.[[State]]).
            let stateValue = GetStateValue(entry['[[State]]']);
            // b. Let instantiateStateValue be GetStateValue("instantiate").
            let instantiateStateValue = GetStateValue("instantiate");
            // c. If stateValue is greater than instantiateStateValue, throw a new TypeError.
            if (stateValue > instantiateStateValue) {
                throw new TypeError();
            }
            // d. Call FulfillFetch(loader, entry, undefined).
            FulfillFetch(loader, entry, undefined);
            // e. Call FulfillTranslate(loader, entry, undefined).
            FulfillTranslate(loader, entry, undefined);
            // f. Assert: entry.[[Translate]] is resolved or rejected.
            Assert: entry['[[Translate]]'] is resolved or rejected.
            // g. TODO: need to propagate rejections
            // h. Let source be the fulfillment value of entry.[[Translate]].
            let source = the fulfillment value of entry['[[Translate]]'];
            // i. Call FulfillInstantiate(loader, entry, value, source).
            FulfillInstantiate(loader, entry, value, source);
            // j. Return undefined.
            return undefined;
        }
        // 8. Throw a new TypeError.
        throw new TypeError();
    }

    error(key, stage, value) /* 4.4.8 */ {
        // TODO
    }

    [ Symbol.iterator ]() /*4.4.2 */ {
        // 1. Let registry be this value.
        let registry = this;
        // 2. Let entries be a new List.
        let entries = [];
        // 3. For each pair in registry.[[RegistryData]], do:
        registry['[[RegistryData]]'].forEach((pair) => {
            // a. Let key be pair.[[key]].
            let key = pair['[[key]]'];
            // b. Let entry be GetRegistryEntry(registry, key).
            let entry = GetRegistryEntry(registry, key);
            // c. Append { [[key]]: key, [[value]]: entry } to entries.
            entries.push({ [[key]]: key, [[value]]: entry });
        });
        // 4. Return CreateListIterator(entries).
        return CreateListIterator(entries).
    }
}
