import {
    assert,
    HowToDoThis,
} from './utils.js';

import {
    GetCurrentStage,
} from './5.module-status.js';

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
    // 5. Assert: currentStageEntry.[[Stage]] is in "link" or "ready" stage.
    assert(currentStageEntry['[[Stage]]'] === 'link' || currentStageEntry['[[Stage]]'] === 'ready',
            'currentStageEntry.[[Stage]] is in "link" or "ready" stage.');
    // 6. Let pair be the pair in entry.[[Dependencies]] such that pair.[[RequestName]] is equal to requestName.
    let pair = entry['[[Dependencies]]'].find((pair) => pair['[[RequestName]]'] === requestName);
    // 7. Assert: pair is defined.
    assert(pair !== undefined, 'pair is defined.');
    // 8. Let depEntry be pair.[[ModuleStatus]].
    let depEntry = pair['[[ModuleStatus]]'];
    // 9. Let depStageEntry be GetCurrentStage(depEntry).
    let depStageEntry = GetCurrentStage(depEntry);
    // 10. Assert: depStageEntry.[[Stage]] is equal "link" or "ready" stage.
    assert(depStageEntry['[[Stage]]'] === 'link' || depStageEntry['[[Stage]]'] === 'ready',
            'depStageEntry.[[Stage]] is equal "link" or "ready" stage.');
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
        // b. If depStageEntry.[[Stage]] is "link" and dep.[[Module]] is a Function object, then:
        if (depStageEntry['[[Stage]]'] === "link" && typeof dep['[[Module]]'] === 'function') {
            // i. Let f be dep.[[Module]].
            let f = dep['[[Module]]'];
            // ii. Let m be ? f().
            let m = f();
            // iii. Set dep.[[Module]] to m.
            dep['[[Module]]'] = m;
            // iv. UpgradeToStage(dep, "ready").
            UpgradeToStage(dep, 'ready');
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
            // iii. Let status be ? module.ModuleDeclarationInstantiation().
            ModuleDeclarationInstantiation.call(module);
            // iv. UpgradeToStage(dep, "ready").
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
    // 3. If entry is already in result, then return undefined.
    if (result.indexOf(entry) !== -1) return undefined;
    // 4. Append entry to result.
    result.push(entry);
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
