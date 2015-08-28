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
    constructor () /*3.1.1*/ {
        // If NewTarget is undefined, then throw a TypeError exception.
        // Let O be OrdinaryCreateFromConstructor(NewTarget, "Reflect.Loader.prototype").
        // returnIfAbrupt(O).
        let O be Object.create(null);
        let registry = new Registry(O);
        /*3.4*/
        O.__Registry = registry;
        return O.
    }

    'import': (name, referrer) /* 3.3.2 */ {
        let loader = this;
        // If Type(loader) is not Object, throw a TypeError exception.
        // If loader does not have a [[Registry]]'] internal slot throw a TypeError exception.
        return Resolve(loader, name, referrer).then((key) => {
            return RequestReady(loader, key);
        });
    }

    resolve(name, referrer) /* 3.3.3 */ {
        let loader = this;
        // If Type(loader) is not Object, throw a TypeError exception.
        return Resolve(loader, name, referrer);
    }

    load(name, referrer, stage = 'ready') /* 3.3.4 */ {
        let loader = this;
        // If Type(loader) is not Object, throw a TypeError exception.
        // If stage is undefined then let stage be "ready".
        return Resolve(loader, name, referrer).then((key) => {
            if (stage === "fetch") {
                return RequestFetch(loader, key);
            }
            if (stage === "translate") {
                return RequestTranslate(loader, key);
            }
            if (stage === "instantiate") {
                return RequestInstantiateAll(loader, key).then((entry) => {
                    if (typeof entry.['[[Module]]'] === 'function') {
                        return entry.['[[Module]]'];
                    }
                    return undefined;
                });
            }
            if (stage is "link") {
                return RequestLink(loader, key).then(() => undefined);
            }
            if (stage is "ready") {
                return RequestReady(loader, key).then((entry) => {
                    return GetModuleNamespace(entry.['[[Module]]);
                });
            }
            throw new TypeError();
        });
    }

    get registry() /* 3.3.5 */ {
        let loader = this;
        return loader.__Registry;
    }


    [ Symbol.toStringTag ]() {
        return "Object";
    }

}

/* 2.1 Well-Known Symbols */
Loader.resolve     = Symbol("@@resolve");
Loader.fetch       = Symbol("@@fetch");
Loader.translate   = Symbol("@@translate");
Loader.instantiate = Symbol("@@instantiate");
