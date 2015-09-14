import Registry from "./registry.js";
import {
    Resolve,
    RequestReady,
    RequestFetch,
    RequestTranslate,
    RequestLink,
    RequestInstantiateAll,
} from "./auxiliaries.js";

export default class Loader {
    constructor () /* 3.1.1 */ {
        // 1. If NewTarget is undefined, then throw a TypeError exception.
        HowToDoThis();
        // 2. Let O be OrdinaryCreateFromConstructor(NewTarget, "Reflect.Loader.prototype").
        let O be Object.create(null);
        // 3. ReturnIfAbrupt(O).
        HowToDoThis();
        // 4. Let registry to a new Registry(O).
        let registry = new Registry(O);
        // 5. Set O’s [[Registry]] internal slot to registry.
        O['[[Registry]]'] = registry;
        // 6. Return O.
        return O;
    }

    'import': (name, referrer) /* 3.3.2 */ {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        HowToDoThis();
        // 3. If loader does not have a [[Registry]] internal slot throw a TypeError exception.
        HowToDoThis();
        // 4. Return the result of transforming Resolve(loader, name, referrer) with a fulfillment handler that, when called with argument key,
        // runs the following steps:
        return Resolve(loader, name, referrer).then((key) => {
            // a. Return RequestReady(loader, key).
            return RequestReady(loader, key);
        });
    }

    resolve(name, referrer) /* 3.3.3 */ {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        HowToDoThis();
        // 3. Return Resolve(loader, name, referrer).
        return Resolve(loader, name, referrer);
    }

    load(name, referrer, stage = 'ready') /* 3.3.4 */ {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        HowToDoThis();
        // 3. If stage is undefined then let stage be "ready".
        HowToDoThis();
        // 4. Return the result of transforming Resolve(loader, name, referrer) with a fulfillment handler that, when called with argument key,
        // runs the following steps:
        return Resolve(loader, name, referrer).then((key) => {
            // a. If stage is "fetch", then:
            if (stage === "fetch") {
                // i. Return RequestFetch(loader, key).
                return RequestFetch(loader, key);
            }
            // b. If stage is "translate", then:
            if (stage === "translate") {
                // i. Return RequestTranslate(loader, key).
                return RequestTranslate(loader, key);
            }
            // c. If stage is "instantiate", then:
            if (stage === "instantiate") {
                // i. Return the result of transforming RequestInstantiateAll(loader, key) with a fulfillment handler that, when called with argument entry, runs the following steps:
                return RequestInstantiateAll(loader, key).then((entry) => {
                    // 1. If entry.[[Module]] is a Function object, return entry.[[Module]].
                    if (typeof entry['[[Module]]'] === 'function') {
                        return entry['[[Module]]'];
                    }
                    // 2. Return undefined.
                    return undefined;
                });
            }
            // d. If stage is "link", then:
            if (stage is "link") {
                // i. Return the result of transforming RequestLink(loader, key) with a fulfillment handler that returns undefined.
                return RequestLink(loader, key).then(() => undefined);
            }
            // e. If stage is "ready", then:
            if (stage is "ready") {
                // i. Return the result of transforming RequestReady(loader, key) with a fulfillment handler that, when called with argument entry, runs the following steps:
                return RequestReady(loader, key).then((entry) => {
                    // 1. Return GetModuleNamespace(entry.[[Module]]).
                    return GetModuleNamespace(entry['[[Module]]']);
                });
            }
            // f. Throw a new TypeError.
            throw new TypeError();
        });
    }

    get registry() /* 3.3.5 */ {
        // 1. Let loader be this value.
        let loader = this;
        // 2. Return loader.[[Registry]].
        return loader.__Registry;
    }


    [ Symbol.toStringTag ]() /* 3.3.6 */ {
        return "Object";
    }

}

/* 2.1 Well-Known Symbols */
Loader.resolve     = Symbol("@@resolve");
Loader.fetch       = Symbol("@@fetch");
Loader.translate   = Symbol("@@translate");
Loader.instantiate = Symbol("@@instantiate");
