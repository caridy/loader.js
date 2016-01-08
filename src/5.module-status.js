import {
    ToString,
    OrdinaryCreateFromConstructor,
    GetModuleNamespace,
} from "./262.js";

import {
    RequestReady,
} from './6.loading.js';

import {
    PassThroughPromise,
} from './2.conventions.js';

// TODO: remove helpers
import {
    HowToDoThis,
    assert,
} from "./utils.js";

// 5. ModuleStatus Objects

// 5.1. Abstract Operations for ModuleStatus Objects

// 5.1.1. GetCurrentStage(entry)
export function GetCurrentStage(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let stages be entry.[[Pipeline]].
    let stages = entry['[[Pipeline]]'];
    // 3. Return the first element of stages.
    return stages[0];
}

// 5.1.2. IsValidStageValue(stage)
export function IsValidStageValue(stage) {
    // 1. Assert: Type(stage) is String.
    assert(typeof stage === 'string', 'Type(stage) is String.');
    // 2. If stage is "fetch", "translate", "instantiate", "satisfy", "link" or "ready", return true.
    if (['fetch', 'translate', 'instantiate', 'satisfy', 'link', 'ready'].indexOf(stage) !== -1) return true;
    // 3. Else return false.
    else return false;
}

// 5.1.3. GetStage(entry, stage)
export function GetStage(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string', 'Type(stage) is String.');
    // 3. Let stages be entry.[[Pipeline]].
    let stages = entry['[[Pipeline]]'];
    // 4. For each element entry of stages, do
    for (var stageEntry of stages) {
        // a. If stageEntry.[[Stage]] is equal to stage, return stageEntry.
        if (stageEntry['[[Stage]]'] === stage) return stageEntry;
    }
    // 7. Return undefined.
    return undefined;
}

// 5.1.4. LoadModule(entry, stage)
export function LoadModule(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Module]]' in entry, 'Type(stage) is String.');
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string', 'Type(stage) is String.');
    // 3. Assert: stage is a valid stage value.
    assert(['fetch', 'translate', 'instantiate', 'satisfy', 'link', 'ready'].indexOf(stage) !== -1, 'stage is a valid stage value.');
    // 4. If stage is "fetch", then:
    if (stage === "fetch") {
        // a. Return the result of transforming RequestFetch(entry) with a new pass-through promise.
        return PassThroughPromise(RequestFetch(entry));
    }
    // 5. If stage is "translate", then:
    if (stage === "translate") {
        // Return the result of transforming RequestTranslate(entry) with a new pass-through promise.
        return PassThroughPromise(RequestTranslate(entry));
    }
    // 6. If stage is "instantiate", then:
    if (stage === "instantiate") {
        // a. Return the result of transforming RequestInstantiate(entry) with a new pass-through promise.
        return PassThroughPromise(RequestInstantiate(entry));
    }
    // 7. If stage is "satisfy", then:
    if (stage === "satisfy") {
        // a. Return the result of transforming RequestSatisfy(entry) with a new pass-through promise.
        return PassThroughPromise(RequestSatisfy(entry));
    }
    // 8. If stage is "link", then:
    if (stage === "link") {
        // a. Return the result of transforming RequestLink(entry) with a new pass-through promise.
        return PassThroughPromise(RequestLink(entry));
    }
    // 9. If stage is "ready", then:
    if (stage === "ready") {
        // a. Return the result of transforming RequestReady(entry) with a new pass-through promise.
        return PassThroughPromise(RequestReady(entry));
    }
    // 10. Return a promise rejected with a new RangeError exception.
    return Promise.reject(new RangeError('stage'));
}

// 5.1.5. UpgradeToStage(entry, stage)
export function UpgradeToStage(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string', 'Type(stage) is String.');
    // 3. Let pipeline be entry.[[Pipeline]].
    let pipeline = entry['[[Pipeline]]'];
    // 4. Let stageEntry be GetStage(entry, stage).
    let stageEntry = GetStage(entry, stage);
    // 5. If stageEntry is not undefined, then
    if (stageEntry !== undefined) {
        // a. Repeat while the first element of pipeline is not equal to stageEntry
        while (pipeline[0] !== stageEntry) {
            // i. Remove first element from pipeline.
            pipeline.shift();
        }
    }
}

// 5.2. The ModuleStatus Constructor

// 5.2.1. ModuleStatus(loader, key)
export default function ModuleStatus(loader, key) {
    // 1. If NewTarget is undefined, then throw a TypeError exception.
    HowToDoThis('ModuleStatus', '1. If NewTarget is undefined, then throw a TypeError exception.');
    // 2. If Type(loader) is not Object, throw a TypeError exception.
    if (typeof loader !== "object") throw new TypeError();
    // 3. If loader does not have all of the internal slots of a Loader Instance (3.5), throw a TypeError exception.
    if (!Object.getOwnPropertyDescriptor(loader, '[[Registry]]')) throw new TypeError();
    // 4. Let keyString be ? ToString(key).
    let keyString = ToString(key);
    // 5. Let O be ? OrdinaryCreateFromConstructor(NewTarget, "%ModuleStatusPrototype%", «[[Loader]], [[Pipeline]], [[Key]], [[Module]], [[Metadata]], [[Dependencies]], [[Error]]» ).
    let O = OrdinaryCreateFromConstructor(ModuleStatus, "%ModuleStatusPrototype%", ['[[Loader]]', '[[Pipeline]]', '[[Key]]', '[[Module]]', '[[Metadata]]', '[[Dependencies]]', '[[Error]]']);
    // 6. Let pipeline be a new List.
    let pipeline = [];
    // 7. Add new stage entry record { [[Stage]]: "fetch", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "fetch", '[[Result]]': undefined });
    // 8. Add new stage entry record { [[Stage]]: "translate", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "translate", '[[Result]]': undefined });
    // 9. Add new stage entry record { [[Stage]]: "instantiate", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "instantiate", '[[Result]]': undefined });
    // 10. Add new stage entry record { [[Stage]]: "satisfy", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "satisfy", '[[Result]]': undefined });
    // 11. Add new stage entry record { [[Stage]]: "link", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "link", '[[Result]]': undefined });
    // 12. Add new stage entry record { [[Stage]]: "ready", [[Result]]: undefined } as a new element of the list pipeline.
    pipeline.push({ '[[Stage]]': "ready", '[[Result]]': undefined });
    // 13. Set O’s [[Loader]] internal slot to loader.
    O['[[Loader]]'] = loader;
    // 14. Set O’s [[Pipeline]] internal slot to pipeline.
    O['[[Pipeline]]'] = pipeline;
    // 15. Set O’s [[Key]] internal slot to keyString.
    O['[[Key]]'] = keyString;
    // 16. Set O’s [[Module]] internal slot to module.
    O['[[Module]]'] = undefined;
    // 17. Set O’s [[Metadata]] internal slot to undefined.
    O['[[Metadata]]'] = undefined;
    // 18. Set O’s [[Dependencies]] internal slot to undefined.
    O['[[Dependencies]]'] = undefined;
    // 19. Set O’s [[Error]] internal slot to false.
    O['[[Error]]'] = false;
    // 20. Return O.
    return O;
}

// 5.4. Properties of the ModuleStatus Prototype Object
ModuleStatus.prototype = {

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
    },

    // 5.4.3. get ModuleStatus.prototype.originalKey
    get originalKey() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Return entry.[[Key]].
        return entry['[[Key]]'];
    },

    // 5.4.4. get ModuleStatus.prototype.module
    get module() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let module be entry.[[Module]].
        let module = entry['[[Module]]'];
        // 5. If module is a Module Record, return GetModuleNamespace(module).
        if ('[[Namespace]]' in module) return GetModuleNamespace(module);
        // 6. Return undefined.
        return undefined;
    },

    // 5.4.5. get ModuleStatus.prototype.error
    get error() {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Return entry.[[Error]].
        return entry['[[Error]]'];
    },

    // 5.4.6. get ModuleStatus.prototype.dependencies
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
        for (var pair of entry['[[Dependencies]]']) {
            // a. Let O be ObjectCreate(%ObjectPrototype%).
            let O = ObjectCreate(Object.prototype);
            // b. Let requestNameDesc be the PropertyDescriptor{[[Value]]: pair.[[RequestName]], [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false}.
            let requestNameDesc = {value: pair['[[RequestName]]'], writable: false, enumerable: true, configurable: false};
            // c. Perform ? DefinePropertyOrThrow(O, "requestName", requestNameDesc).
            Object.defineProperty(O, "requestName", requestNameDesc);
            // d. Let moduleStatusDesc be the PropertyDescriptor{[[Value]]: pair.[[ModuleStatus]], [[Writable]]: false, [[Enumerable]]: true, [[Configurable]]: false}.
            let moduleStatusDesc = {value: pair['[[ModuleStatus]]'], writable: false, enumerable: true, configurable: false};
            // e. Perform ? DefinePropertyOrThrow(O, "entry", moduleStatusDesc).
            Object.defineProperty(O, "entry", moduleStatusDesc);
            // f. Perform ? CreateDataProperty(array, ? ToString(n), O).
            array[ToString(n)] = O;
            // g. Increment n by 1.
            n += 1;
        }
        // 7. Return array.
        return array;
    },

    // 5.4.7. ModuleStatus.prototype.load(stage)
    load(stage) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. If stage is undefined, let stageValue be "fetch"; otherwise, let stageValue be ToString(stage).
        let stageValue = stage === undefined ? 'fetch' : ToString(stage);
        // 5. RejectIfAbrupt(stageValue).
        // TODO: diverging by ignoring the RejectIfAbrupt.
        // 6. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));
        // 7. Return LoadModule(entry, stageValue).
        return LoadModule(entry, stageValue);
    },

    // 5.4.8. ModuleStatus.prototype.result(stage)
    result(stage) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let stageValue be ToString(stage).
        let stageValue = ToString(stage);
        // 5. RejectIfAbrupt(stageValue).
        // TODO: diverging by ignoring the RejectIfAbrupt.
        // 6. If IsValidStageValue(stageValue) is false, return a promise rejected with a new RangeError exception.
        if (!IsValidStageValue(stageValue)) return Promise.reject(new RangeError('stage out of range'));
        // 7. Let stageEntry be GetStage(entry, stageValue).
        let stageEntry = GetStage(entry, stageValue);
        // 8. If stageEntry is undefined, return a promise resolved with undefined.
        if (stageEntry === undefined) return Promise.resolve(undefined);
        // 9. If stageEntry.[[Result]] is undefined, return a promise resolved with undefined.
        if (stageEntry['[[Result]]'] === undefined) return Promise.resolve(undefined);
        // 10. Return the result of transforming stageEntry.[[Result]] with a new pass-through promise.
        return PassThroughPromise(stageEntry['[[Result]]']);
    },

    // 5.4.9. ModuleStatus.prototype.resolve(stage, result)
    resolve(stage, result) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let stageValue be ToString(stage).
        let stageValue = ToString(stage);
        // 5. RejectIfAbrupt(stageValue).
        // TODO: diverging by ignoring the RejectIfAbrupt.
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
                HowToDoThis('ModuleStatus.prototype.resolve', '8.d.i. Fulfill stageEntry.[[Result]] with value.');
            }
            // e. Perform UpgradeToStage(entry, stageValue).
            UpgradeToStage(entry, stageValue);
        });
        // 9. Let pCatch be the result of transforming p1 with a rejection handler that, when called, runs the following steps:
        p1.catch(() => {
            // a. Set entry.[[Error]] to true.
            entry['[[Error]]'] = true;
        });
        // 10. Return p1.
        return p1;
    },

    // 5.4.10. ModuleStatus.prototype.reject(stage, error)
    reject(stage, error) {
        // 1. Let entry be this value.
        let entry = this;
        // 2. If Type(entry) is not Object, throw a TypeError exception.
        if (typeof entry !== 'object') throw new TypeError('entry');
        // 3. If entry does not have all of the internal slots of a ModuleStatus Instance (5.5), throw a TypeError exception.
        if (!Object.getOwnPropertyDescriptor(entry, '[[Module]]')) throw new TypeError();
        // 4. Let stageValue be ToString(stage).
        let stageValue = ToString(stage);
        // 5. RejectIfAbrupt(stageValue).
        // TODO: diverging by ignoring the RejectIfAbrupt.
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
                HowToDoThis('ModuleStatus.prototype.reject', '8.d.i. Reject stageEntry.[[Result]] with value.');
            }
            // e. Perform UpgradeToStage(entry, stageValue).
            UpgradeToStage(entry, stageValue);
        });
        // 9. Let pCatch be the result of transforming p1 with a rejection handler that, when called, runs the following steps:
        p1.catch(() => {
            // a. Set entry.[[Error]] to true.
            entry['[[Error]]'] = true;
        });
        // 10. Return p1.
        return p1;
    }

};

// 5.4.1. ModuleStatus.prototype.constructor
ModuleStatus.prototype.constructor = ModuleStatus;
