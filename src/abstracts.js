import {
    OrdinaryCreateFromConstructor,
} from './262.js';

import Registry from './registry.js';

// =============================================
// 4.1. Abstract Operations for Registry Objects

// 4.1.1. CreateRegistry()
export function CreateRegistry() {
    // 1. Let O be ? OrdinaryCreateFromConstructor(Registry, "%RegistryPrototype%", «[[RegistryMap]]» ).
    let O = OrdinaryCreateFromConstructor(Registry, "%RegistryPrototype%", ['[[RegistryMap]]']);
    // 2. Let M be ObjectCreate(%MapIteratorPrototype%, «[[Map]], [[MapNextIndex]], [[MapIterationKind]]»).
    let M = new Map();
    // 3. Set O’s [[RegistryMap]] internal slot to M.
    O['[[RegistryMap]]'] = M;
    // 4. Return O.
    return O;
}

// =================================================
// 5.1. Abstract Operations for ModuleStatus Objects

// 5.1.1. GetCurrentStage(entry)
export function GetCurrentStage(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(Object.getOwnPropertyDescriptor(entry, '[[Module]]'));
    // 2. Let stages be entry.[[Pipeline]].
    let stages = entry['[[Pipeline]]'];
    // 3. Return the first element of stages.
    return stages[0];
}

// 5.1.2. IsValidStageValue(stage)
export function IsValidStageValue(stage) {
    // 1. Assert: Type(stage) is String.
    assert(typeof stage === 'string');
    // 2. If stage is "fetch", "translate", "instantiate", "satisfy", "link" or "ready", return true.
    if (stage in ['fetch', 'translate', 'instantiate', 'satisfy', 'link', 'ready']) return true;
    // 3. Else return false.
    else return false;
}

// 5.1.3. GetStage(entry, stage)
export function GetStage(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(Object.getOwnPropertyDescriptor(entry, '[[Module]]'));
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string');
    // 3. Let stages be entry.[[Pipeline]].
    let stages = entry['[[Pipeline]]'];
    // 4. For each element entry of stages, do
    for (var stageEntry in stages) {
        // a. If stageEntry.[[Stage]] is equal to stage, then return entry.
        if (stageEntry['[[Stage]]'] === stage) return entry;
    }
    // 7. Return undefined.
    return undefined;
}

// 5.1.4. LoadModule(entry, stage)
export function LoadModule(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(Object.getOwnPropertyDescriptor(entry, '[[Module]]'));
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string');
    // 3. If stage is "fetch", then:
    if (stage === "fetch") {
        // a. Return the result of transforming RequestFetch(entry) with a new pass-through promise.
        return PassThroughPromise(RequestFetch(entry));
    }
    // 4. If stage is "translate", then:
    if (stage === "translate") {
        // Return the result of transforming RequestTranslate(entry) with a new pass-through promise.
        return PassThroughPromise(RequestTranslate(entry));
    }
    // 5. If stage is "instantiate", then:
    if (stage === "instantiate") {
        // a. Return the result of transforming RequestInstantiate(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
        return RequestInstantiate(entry).then((entry) => {
            // i. If entry.[[Module]] is a Function object, return entry.[[Module]].
            if (typeof entry['[[Module]]'] === 'function') return entry['[[Module]]'];
            // ii. Return undefined.
            return undefined;
        });
    }
    // 6. If stage is "satisfy", then:
    if (stage === "satisfy") {
        // a. Return the result of transforming RequestSatisfy(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
        return RequestSatisfy(entry).then((entry) => {
            // i. If entry.[[Module]] is a Function object, return entry.[[Module]].
            if (typeof entry['[[Module]]'] === 'function') return entry['[[Module]]'];
            // ii. Return undefined.
            return undefined;
        });
    }
    // 7. If stage is "link", then:
    if (stage === "link") {
        // a. Return the result of transforming RequestLink(entry) with a fulfillment handler that returns undefined.
        return RequestLink(entry).then(() => undefined);
    }
    // 8. If stage is "ready" or undefined, then:
    if (stage === "ready") {
        // a. Return the result of transforming RequestReady(entry) with a fulfillment handler that, when called with argument entry, runs the following steps:
        return RequestReady(entry).then((entry) => {
            // i. Return GetModuleNamespace(entry.[[Module]]).
            return GetModuleNamespace(entry['[[Module]]']);
        });
    }
    // 9. Return a promise rejected with a new RangeError exception.
    return Promise.reject(new RangeError('stage'));
}

// 5.1.5. UpgradeToStage(entry, stage)
export function UpgradeToStage(entry, stage) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(Object.getOwnPropertyDescriptor(entry, '[[Module]]'));
    // 2. Assert: Type(stage) is String.
    assert(typeof stage === 'string');
    // 3. Let pipeline be entry.[[Pipeline]].
    let pipeline = entry['[[Pipeline]]'];
    // 4. Let stageEntry be GetStage(entry, stage).
    let stageEntry = GetStage(entry, stage);
    // 5. If stageEntry is not undefined, then
    if (!stageEntry) {
        // a. Repeat while the first element of pipeline is not equal to stageEntry
        while (pipeline[0] !== stageEntry) {
            // i. Remove first element from pipeline.
            pipeline.shift();
        }
    }
}

/**
 * Transforming p with a new pass-through promise is a shorthand for wrapping the
 * promise to avoid exposing the original promise.
 */
export function /* 2.3.1 */ PassThroughPromise(p) {
    // 1. Transforming p with a fulfillment handler that, when called with argument value, returns value.
    return Promise.resolve(p).then((value) => value);
}

export function ModuleEvaluation() {

}

export function SimpleDefine() {

}
