import {
    GetCurrentStage,
    IsValidStageValue,
    GetStage,
    LoadModule,
    UpgradeToStage,
} from "./abstracts.js";

// 5. ModuleStatus Objects

// 5.2.1. ModuleStatus(loader, key[, module])
function ModuleStatusConstructor(loader, key, module) {
    // 1. If NewTarget is undefined, then throw a TypeError exception.
    HowToDoThis();
    // 2. If Type(loader) is not Object, throw a TypeError exception.
    if (typeof loader !== "object") throw new TypeError();
    // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
    if (!Object.getOwnPropertyDescriptor(loader, '[[Registry]]')) throw new TypeError();
    // 4. Let keyString be ? ToString(key).
    let keyString = ToString(key);
    // 5. If Type(module) is not Object, throw a TypeError exception.
    if (typeof module !== "object") throw new TypeError();
    // 6. If module does not have all of the internal slots of a Module Instance (8.5), throw a TypeError exception.
    if (!Object.getOwnPropertyDescriptor(module, '[[Namespace]]')) throw new TypeError();
    // 7. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%ModuleStatusPrototype%", «[[Loader]], [[Pipeline]], [[Key]], [[Module]], [[Metadata]], [[Dependencies]], [[Error]]» ).
    let O = OrdinaryCreateFromConstructor(ModuleStatus, "%ModuleStatusPrototype%", ['[[Loader]]', '[[Pipeline]]', '[[Key]]', '[[Module]]', '[[Metadata]]', '[[Dependencies]]', '[[Error]]']);
    // 8. Let pipeline be a new List.
    let pipeline = [];
    // 9. If module exists, then
    if (module) {
        // a. Let result be a promise resolved with module.
        let result = Promise.resolve(module);
        // b. Add new stage entry record { [[Stage]]: "ready", [[Result]]: result } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "ready", '[[Result]]': result });
    }
    // 10. Else,
    else {
        // a. Add new stage entry record { [[Stage]]: "fetch", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "fetch", '[[Result]]': undefined });
        // b. Add new stage entry record { [[Stage]]: "translate", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "translate", '[[Result]]': undefined });
        // c. Add new stage entry record { [[Stage]]: "instantiate", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "instantiate", '[[Result]]': undefined });
        // d. Add new stage entry record { [[Stage]]: "satisfy", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "satisfy", '[[Result]]': undefined });
        // e. Add new stage entry record { [[Stage]]: "link", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "link", '[[Result]]': undefined });
        // f. Add new stage entry record { [[Stage]]: "ready", [[Result]]: undefined } as a new element of the list pipeline.
        pipeline.push({ '[[Stage]]': "ready", '[[Result]]': undefined });
    }
    // 11. Set O’s [[Loader]] internal slot to loader.
    O['[[Loader]]'] = loader;
    // 12. Set O’s [[Pipeline]] internal slot to pipeline.
    O['[[Pipeline]]'] = pipeline;
    // 13. Set O’s [[Key]] internal slot to keyString.
    O['[[Key]]'] = keyString;
    // 14. Set O’s [[Module]] internal slot to module.
    O['[[Module]]'] = module;
    // 15. Set O’s [[Metadata]] internal slot to undefined.
    O['[[Metadata]]'] = undefined;
    // 16. Set O’s [[Dependencies]] internal slot to undefined.
    O['[[Dependencies]]'] = undefined;
    // 17. Set O’s [[Error]] internal slot to nothing.
    O['[[Error]]'] = undefined;
    // 18. Return O.
    return O;
}

export default class ModuleStatus {

    // 5.4.1. ModuleStatus.prototype.constructor
    constructor(loader, key, module) {
        return ModuleStatusConstructor(loader, key, module);
    };

    // 5.4.2. get ModuleStatus.prototype.stage
    get stage() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let stageEntry be GetCurrentStage(entry).
        let stageEntry = GetCurrentStage(entry);
        // 5. Return stageEntry.[[Stage]].
        return stageEntry['[[Stage]]'];
    }

    // 5.4.3. get ModuleStatus.prototype.module
    get module() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Return entry.[[Module]].
        return entry['[[Module]]'];
    }

    // 5.4.4. get ModuleStatus.prototype.error
    get error() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Return entry.[[Error]].
        return entry['[[Error]]'];
    }

    // 5.4.5. get ModuleStatus.prototype.dependencies
    get dependencies() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let array be ArrayCreate(0).
        let array = [];
        // 5. Let n be 0.
        let n = 0;
        // 6. For each pair in entry.[[Dependencies]], do:
        for (var pair in entry['[[Dependencies]]']) {
            // a. Let O be ObjectCreate(%ObjectPrototype%).
            let O = ObjectCreate(Object.prototype);
            // b. Let requestNameDesc be the PropertyDescriptor{[[Value]]: pair.[[RequestName]], [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false}.
            let requestNameDesc = {value: pair['[[RequestName]]'], writable: false, enumerable: true, configurable: false};
            // c. Let requestNameStatus be ? DefinePropertyOrThrow(O, "requestName", requestNameDesc).
            let requestNameStatus = Object.defineProperty(O, "requestName", requestNameDesc);
            // d. Let keyDesc be the PropertyDescriptor{[[Value]]: pair.[[Key]], [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false}.
            let keyDesc = {value: pair['[[Key]]'], writable: false, enumerable: true, configurable: false};
            // e. Let keyStatus be ? DefinePropertyOrThrow(O, "key", keyDesc).
            let keyStatus = Object.defineProperty(O, "key", keyDesc);
            // f. Let moduleStatusDesc be the PropertyDescriptor{[[Value]]: pair.[[ModuleStatus]], [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false}.
            let moduleStatusDesc = {value: pair['[[ModuleStatus]]'], writable: false, enumerable: true, configurable: false};
            // g. Let moduleStatus be ? DefinePropertyOrThrow(O, "entry", moduleStatusDesc).
            let moduleStatus = Object.defineProperty(O, "entry", moduleStatusDesc);
            // h. Let status be ? CreateDataProperty(array, ? ToString(n), O).
            array[n] = O;
            // i. Increment n by 1.
            n += 1;
        }
        // 7. Return array.
        return array;
    }

    // 5.4.6. ModuleStatus.prototype.load(stage)
    load(stage) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();

        let stageValue;
        try {

            // 4. If stage is undefined then let stageValue be "fetch".
            if (!stage) stageValue = 'fetch';
            // 5. Else let stageValue be ToString(stage).
            else stageValue = ToString(stage);

        } catch (stageValue) {

            // 6. RejectIfAbrupt(stageValue).
            return Promise.reject(stageValue);

        }

        // 7. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));
        // 8. Return LoadModule(entry, stageValue).
        return LoadModule(entry, stageValue);
    }

    // 5.4.7. ModuleStatus.prototype.result(stage)
    result(stage) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();

        try {

            // 4. Let stageValue be ToString(stage).
            let stageValue = ToString(stage);

        } catch (stageValue) {

            // 5. RejectIfAbrupt(stageValue).
            return Promise.reject(stageValue);

        }

        // 6. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));

        try {

            // 7. Let stageEntry be GetStage(entry, stageValue).
            let stageEntry = GetStage(entry, stageValue);

        } catch (stageEntry) {

            // 8. RejectIfAbrupt(stageEntry).
            return Promise.reject(stageEntry);

        }

        // 9. If stageEntry is undefined, return a promise resolved with undefined.
        if (stageEntry === undefined) return Promise.resolve(undefined);
        // 10. If stageEntry.[[Result]] is undefined, return a promise resolved with undefined.
        if (stageEntry['[[Result]]'] === undefined) return Promise.resolve(undefined);
        // 11. Return the result of transforming stageEntry.[[Result]] with a new pass-through promise.
        return PassThroughPromise(stageEntry['[[Result]]']);
    }

    // 5.4.8. ModuleStatus.prototype.resolve(stage, result)
    resolve(stage, result) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();

        try {

            // 4. Let stageValue be ToString(stage).
            let stageValue = ToString(stage);

        } catch (stageValue) {

            // 5. RejectIfAbrupt(stageValue).
            return Promise.reject(stageValue);

        }

        // 6. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));
        // 7. Let p0 be the result of transforming result with a new pass-through promise.
        let p0 = PassThroughPromise(result);
        // 8. Let p1 be the result of transforming p0 with a fulfillment handler that, when called with argument value, runs the following steps:
        let p1 = p0.then((value) => {
            // a. Let stageEntry be GetStage(entry, stageValue).
            let stageEntry = GetStage(entry, stageValue);
            // b. If stageEntry is undefined, throw a new TypeError.
            if (stageEntry === undefined) throw new TypeError('missed the train');
            // c. If stageEntry.[[Result]] is undefined, then
            if (stageEntry['[[Result]]'] === undefined) {
                // i. Set stageEntry.[[Result]] to a promise resolved with value.
                stageEntry['[[Result]]'] = Promise.resolve(value);
            // d. Else,
            } else {
                // i. Fulfill stageEntry.[[Result]] with value.
                HowToDoThis();
            }
            // e. UpgradeToStage(entry, stageValue).
            UpgradeToStage(entry, stageValue);
            // f. Return value.
            return value;
        });
        // 9. Return p0.
        return p0;
    }

    // 5.4.9. ModuleStatus.prototype.reject(stage, error)
    reject(stage, error) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();

        try {

            // 4. Let stageValue be ToString(stage).
            let stageValue = ToString(stage);

        } catch (stageValue) {

            // 5. RejectIfAbrupt(stageValue).
            return Promise.reject(stageValue);

        }

        // 6. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));
        // 7. Let p0 be the result of transforming error with a new pass-through promise.
        let p0 = PassThroughPromise(error);
        // 8. Let p1 be the result of transforming p0 with a fulfillment handler that, when called with argument value, runs the following steps:
        let p1 = p0.then((value) => {
            // a. Let stageEntry be GetStage(entry, stageValue).
            let stageEntry = GetStage(entry, stageValue);
            // b. If stageEntry is undefined, throw a new TypeError.
            if (stageEntry === undefined) throw new TypeError('missed the train');
            // c. If stageEntry.[[Result]] is undefined, then
            if (stageEntry['[[Result]]'] === undefined) {
                // i. Set stageEntry.[[Result]] to a promise resolved with value.
                stageEntry['[[Result]]'] = Promise.reject(value);
            // d. Else,
            } else {
                // i. Reject stageEntry.[[Result]] with value.
                HowToDoThis();
            }
            // e. UpgradeToStage(entry, stageValue).
            UpgradeToStage(entry, stageValue);
            // f. Return value.
            return value;
        });
        // 9. Return p0.
        return p0;
    }

}
