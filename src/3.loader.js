import {
    CreateRegistry,
} from "./4.registry.js";

import {
    IsValidStageValue,
    LoadModule,
} from "./5.module-status.js";

import {
    Resolve,
    EnsureRegistered,
} from "./6.loading.js";

import {
    EnsureEvaluated,
} from "./7.linking.js";

import {
    OrdinaryCreateFromConstructor
} from "./262.js";

import {
    HowToDoThis,
    transformPromise,
} from "./utils.js";

// 3.1.1. Loader()
export default function Loader() {
    // 1. If NewTarget is undefined, then throw a TypeError exception.
    HowToDoThis('LoaderConstructor', '1. If NewTarget is undefined, then throw a TypeError exception.');
    // 2. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%LoaderPrototype%", «[[Realm]], [[Registry]]»).
    let O = OrdinaryCreateFromConstructor(Loader, "%LoaderPrototype%", ['[[Realm]]', '[[Registry]]']);
    // 3. Set O’s [[Realm]] internal slot to the current Realm Registry.
    O['[[Realm]]'] = EnvECMAScriptCurrentRealm();
    // 4. Set O’s [[Registry]] internal slot to CreateRegistry().
    O['[[Registry]]'] = CreateRegistry();
    // 5. Return O.
    return O;
}

// 3.3. Properties of the Loader Prototype Object
Loader.prototype = {

    // 3.3.2. Loader.prototype.import(name[, referrer])
    import(name, referrer) {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        if (typeof loader !== 'object') throw new TypeError();
        // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
        if (!loader['[[Registry]]']) throw new TypeError();
        // 4. Return the result of transforming Resolve(loader, name, referrer) with a fulfillment handler that, when called with argument key, runs the following steps:
        return transformPromise(Resolve(loader, name, referrer)).then((key) => {
            // a. Let entry be EnsureRegistered(loader, key).
            let entry = EnsureRegistered(loader, key);
            // b. Return the result of transforming LoadModule(entry, "instantiate") with a fulfillment handler that, when called, runs the following steps:
            return transformPromise(LoadModule(entry, "instantiate")).then(() => {
                // i. Return EnsureEvaluated(entry).
                return EnsureEvaluated(entry);
            });
        });
    },

    // 3.3.3. Loader.prototype.resolve(name[, referrer])
    resolve(name, referrer) {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        if (typeof loader !== 'object') throw new TypeError();
        // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
        if (!loader['[[Registry]]']) throw new TypeError();
        // 4. Return Resolve(loader, name, referrer).
        return Resolve(loader, name, referrer);
    },

    // 3.3.4. Loader.prototype.load(name[, referrer[, stage]])
    load(name, referrer, stage) {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        if (typeof loader !== 'object') throw new TypeError();
        // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
        if (!loader['[[Registry]]']) throw new TypeError();
        try {
            // 4. If stage is undefined then let stage be "instantiate".
            if (stage === undefined) stage = "instantiate";
            // 5. Else let stageValue be ToString(stage).
            else stage = stage.toString();
        } catch (e) {
            // 6. RejectIfAbrupt(stageValue).
            Promise.reject(e);
        }
        // 7. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (IsValidStageValue(stageValue) === false) return Promise.reject(new RangeError('Invalid stage value'));
        // 8. Return the result of transforming Resolve(loader, name, referrer) with a fulfillment handler that, when called with argument key, runs the following steps:
        return transformPromise(Resolve(loader, name, referrer)).then((key) => {
            // a. Let entry be EnsureRegistered(loader, key).
            let entry = EnsureRegistered(loader, key);
            // b. Return LoadModule(entry, stageValue).
            return LoadModule(entry, stageValue);
        });
    },

    // 3.3.5. get Loader.prototype.registry
    get registry() {
        // 1. Let loader be this value.
        let loader = this;
        // 2. If Type(loader) is not Object, throw a TypeError exception.
        if (typeof loader !== 'object') throw new TypeError();
        // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
        if (!loader['[[Registry]]']) throw new TypeError();
        // 4. Return loader.[[Registry]].
        return loader['[[Registry]]'];
    },

    // 3.3.6. Loader.prototype [ @@toStringTag ]
    [ Symbol.toStringTag ]() {
        return "Object";
    }

};

// 3.3.1. Loader.prototype.constructor
Loader.prototype.constructor = Loader;

/* 2.1 Well-Known Symbols */
Loader.resolve     = Symbol("@@resolve");
Loader.fetch       = Symbol("@@fetch");
Loader.translate   = Symbol("@@translate");
Loader.instantiate = Symbol("@@instantiate");
