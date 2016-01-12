import {
    assert,
    HowToDoThis,
    isPromiseResolved,
} from './utils.js';

import {
    GetCurrentStage,
    UpgradeToStage,
} from './5.module-status.js';

import {
    ModuleEvaluation,
    ModuleDeclarationInstantiation,
} from './8.module.js';

import {
    GetModuleNamespace,
} from './262.js';

// 7. Linking Semantics

// 7.1. Resolving Dependencies

// 7.1.1. HostResolveImportedModule(module, requestName)
export function HostResolveImportedModule(module, requestName) {
    // 1. Assert: module is a Source Text Module Record.
    assert('[[ECMAScriptCode]]' in module, 'module is a Source Text Module Record.');
    // 2. Assert: Type(requestName) is String.
    assert(typeof requestName === 'string', 'Type(requestName) is String.');
    // 3. Let entry be module.[[ModuleStatus]].
    let entry = module['[[ModuleStatus]]'];
    // 4. Let currentStageEntry be GetCurrentStage(entry).
    let currentStageEntry = GetCurrentStage(entry);
    // 5. Assert: currentStageEntry.[[Stage]] is "instantiate" and  currentStageEntry.[[Result]] is a resolved promise.
    assert(currentStageEntry['[[Stage]]'] === 'instantiate' && isPromiseResolved(currentStageEntry['[[Result]]']),
            'currentStageEntry.[[Stage]] is "instantiate" and  currentStageEntry.[[Result]] is a resolved promise.');
    // 6. Let pair be the pair in entry.[[Dependencies]] such that pair.[[RequestName]] is equal to requestName.
    let pair = entry['[[Dependencies]]'].find((pair) => pair['[[RequestName]]'] === requestName);
    // 7. Assert: pair is defined.
    assert(pair !== undefined, 'pair is defined.');
    // 8. Let depEntry be pair.[[ModuleStatus]].
    let depEntry = pair['[[ModuleStatus]]'];
    // 9. Let depStageEntry be GetCurrentStage(depEntry).
    let depStageEntry = GetCurrentStage(depEntry);
    // 10. Assert: depStageEntry.[[Stage]] is "instantiate" and  depStageEntry.[[Result]] is a resolved promise.
    assert(depStageEntry['[[Stage]]'] === 'instantiate' && isPromiseResolved(depStageEntry['[[Result]]']),
            'depStageEntry.[[Stage]] is "instantiate" and  depStageEntry.[[Result]] is a resolved promise.');
    // 11. Return depEntry.[[Module]].
    return depEntry['[[Module]]'];
}

// 7.2. Linking

// 7.2.1. Link(root)
export function Link(root) {
    // 1. Assert: root must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in root, 'root must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let deps be DependencyGraph(root).
    let deps = DependencyGraph(root);
    // 3. For each dep in deps, do:
    for (let dep of deps) {
        // a. Let depStageEntry be GetCurrentStage(dep).
        let depStageEntry = GetCurrentStage(dep);
        // b. If dep.[[Module]] is a Function object, then:
        if (typeof dep['[[Module]]'] === 'function') {
            // i. Assert: depStageEntry.[[Stage]] is "link".
            assert(depStageEntry['[[Stage]]'] === 'link', 'depStageEntry.[[Stage]] is "link".');
            // ii. Let func be dep.[[Module]].
            let func = dep['[[Module]]'];
            // iii. Let argList be a new empty List.
            let argList = [];
            // iv. Let ns be ? Call(func, undefined, argList).
            let ns = func.call(undefined, ...argList);
            // v. If ns is not a module namespace exotic object, throw a TypeError exception.
            if (!('[[Module]]' in ns)) throw new TypeError();
            // vi. Set dep.[[Module]] to ns.[[Module]].
            dep['[[Module]]'] = ns['[[Module]]'];
        }
    }
    // 4. Assert: the following sequence is guaranteed not to run any user code.
    HowToDoThis('7.2.1. Link(root)', '// 4. Assert: the following sequence is guaranteed not to run any user code.');
    // 5. For each dep in deps, do:
    for (let dep of deps) {
        // a. Let depStageEntry be GetCurrentStage(dep).
        let depStageEntry = GetCurrentStage(dep);
        // b. If depStageEntry.[[Stage]] is "link", then:
        if (depStageEntry['[[Stage]]'] === 'link') {
            // i. Let module be dep.[[Module]].
            let module = dep['[[Module]]'];
            // ii. Assert: module is a Module Record.
            assert('[[Namespace]]' in module, 'module is a Module Record');
            // iii. Perform ? module.ModuleDeclarationInstantiation().
            module.ModuleDeclarationInstantiation();
            // iv. Perform UpgradeToStage(dep, "ready").
            UpgradeToStage(dep, 'ready');
        }
    }
    // 6. Return undefined.
    return undefined;
}

// 7.2.2. DependencyGraph(root)
export function DependencyGraph(root) {
    // 1. Assert: root must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in root, 'root must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let result be a new empty List.
    let result = [];
    // 3. Call ComputeDependencyGraph(root, result).
    ComputeDependencyGraph(root, result);
    // 4. Return result.
    return result;
}

// 7.2.3. ComputeDependencyGraph(entry, result)
export function ComputeDependencyGraph(entry, result) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Assert: result must be a List.
    assert(Array.isArray(result), 'result must be a List.');
    // 3. If entry is already in result, return undefined.
    if (result.indexOf(entry) !== -1) return undefined;
    // 4. Insert entry as the first element of result.
    result.unshift(entry);
    // 5. For each pair in entry.[[Dependencies]], do:
    for (let pair of entry['[[Dependencies]]']) {
        // a. Assert: pair.[[ModuleStatus]] is defined.
        assert(pair['[[ModuleStatus]]'] !== undefined, 'pair.[[ModuleStatus]] is defined');
        // b. Call ComputeDependencyGraph(pair.[[ModuleStatus]], result).
        ComputeDependencyGraph(pair['[[ModuleStatus]]'], result);
    }
    // 6. Return undefined.
    return undefined;
}

// 7.2.3. EnsureLinked(entry)
export function EnsureLinked(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let deps be DependencyGraph(entry).
    let deps = DependencyGraph(entry);
    // 3. For each dep in deps, do:
    for (let dep of deps) {
        // Let depStageEntry be GetCurrentStage(dep).
        let depStageEntry = GetCurrentStage(dep);
        // Assert: depStageEntry.[[Stage]] is "instantiate" and depStageEntry.[[Result]] is a resolved promise.
        assert(depStageEntry['[[Stage]]'] === "instantiate" && isPromiseResolved(depStageEntry['[[Result]]']), 'depStageEntry.[[Stage]] is "instantiate" and depStageEntry.[[Result]] is a resolved promise.');
        // If dep.[[Module]] is a Function object, then:
        if (typeof(dep['[[Module]]']) === 'function') {
            // Let func be dep.[[Module]].
            let func = dep['[[Module]]'];
            // Let argList be a new empty List.
            let argList = [];
            // Let ns be ? Call(func, undefined, argList).
            let ns = func.apply(undefined, argList);
            // If ns is not a module namespace exotic object, throw a TypeError exception.
            if (!('[[Module]]' in ns)) throw new TypeError();
            // v. Set dep.[[Module]] to ns.[[Module]].
            dep['[[Module]]'] = ns['[[Module]]'];
        }
    }
    // 4. Assert: the following sequence is guaranteed not to run any user code.
    HowToDoThis('EnsureLinked(entry)', '4. Assert: the following sequence is guaranteed not to run any user code.');
    // 5. For each dep in deps, do:
    for (let dep of deps) {
        // a. Let module be dep.[[Module]].
        let module = dep['[[Module]]'];
        // b. Assert: module is a Module Record.
        assert('[[Namespace]]' in module, 'Assert: module is a Module Record.');
        // c. Perform ? module.ModuleDeclarationInstantiation().
        module.ModuleDeclarationInstantiation();
    }
}

// 7.2.4. EnsureEvaluated(entry)
export function EnsureEvaluated(entry) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert('[[Pipeline]]' in entry, 'entry must have all of the internal slots of a ModuleStatus Instance (5.5).');
    // 2. Let stageEntry be GetCurrentStage(entry).
    let stageEntry = GetCurrentStage(entry);
    // 3. Assert: stageEntry.[[Stage]] is "instantiate" and stageEntry.[[Result]] is a resolved promise.
    assert(stageEntry['[[Stage]]'] === "instantiate" && isPromiseResolved(stageEntry['[[Result]]']), 'stageEntry.[[Stage]] is "instantiate" and stageEntry.[[Result]] is a resolved promise.');
    // 4. Let module be entry.[[Module]].
    let module = entry['[[Module]]'];
    // 5. If module.[[Evaluated]] is false, then:
    if (module['[[Evaluated]]'] === false) {
        // a. Perform ? EnsureLinked(entry).
        EnsureLinked(entry);
        // b. Perform ? module.ModuleEvaluation().
        module.ModuleEvaluation();
    }
    // 6. Return ? GetModuleNamespace(module).
    return GetModuleNamespace(module);
}
