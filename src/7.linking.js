import {
    assert,
} from './utils.js';

import {
    HowToDoThis,
} from './utils.js';

// 7. Linking Semantics

// 7.1. Resolving Dependencies

// 7.1.1. HostResolveImportedModule(module, requestName)
export function HostResolveImportedModule(module, requestName) {
    // 1. Assert: module is a Source Text Module Record.
    // 2. Assert: Type(requestName) is String.
    // 3. Let entry be module.[[ModuleStatus]].
    // 4. Let currentStageEntry be GetCurrentStage(entry).
    // 5. Assert: currentStageEntry.[[Stage]] is in "link" or "ready" stage.
    // 6. Let pair be the pair in entry.[[Dependencies]] such that pair.[[RequestName]] is equal to requestName.
    // 7. Assert: pair is defined.
    // 8. Let depEntry be pair.[[ModuleStatus]].
    // 9. Let depStageEntry be GetCurrentStage(depEntry).
    // 10. Assert: depStageEntry.[[Stage]] is equal "link" or "ready" stage.
    // 11. Return depEntry.[[Module]].
}

// 7.2. Linking

// 7.2.1. Link(root)
export function Link(root) {
    // 1. Assert: root must have all of the internal slots of a ModuleStatus Instance (5.5).
    assert(root['[[Pipeline]]']);
    // 2. Let deps be DependencyGraph(root).
    let deps = DependencyGraph(root);
    // 3. For each dep in deps, do:
        // Let depStageEntry be GetCurrentStage(dep).
        // If depStageEntry.[[Stage]] is "link" and dep.[[Module]] is a Function object, then:
        // Let f be dep.[[Module]].
        // Let m be ? f().
        // Set dep.[[Module]] to m.
        // UpgradeToStage(dep, "ready").
    // 4. Assert: the following sequence is guaranteed not to run any user code.
    HowToDoThis('7.2.1. Link(root)', '// 4. Assert: the following sequence is guaranteed not to run any user code.');
    // 5. For each dep in deps, do:
        // Let depStageEntry be GetCurrentStage(dep).
        // If depStageEntry.[[Stage]] is "link", then:
        // Let module be dep.[[Module]].
        // Assert: module is a Module Record.
        // Let status be ? module.ModuleDeclarationInstantiation().
        // UpgradeToStage(dep, "ready").
    // 6. Return undefined.
    return undefined;
}

// 7.2.2. DependencyGraph(root)
export function DependencyGraph(root) {
    // 1. Assert: root must have all of the internal slots of a ModuleStatus Instance (5.5).
    // 2. Let result be a new empty List.
    // 3. Call ComputeDependencyGraph(root, result).
    // 4. Return result.
}

// 7.2.3. ComputeDependencyGraph(entry, result)
export function ComputeDependencyGraph(entry, result) {
    // 1. Assert: entry must have all of the internal slots of a ModuleStatus Instance (5.5).
    // 2. Assert: result must be a List.
    // 3. If entry is already in result, then return undefined.
    // 4. Append entry to result.
    // 5. For each pair in entry.[[Dependencies]], do:
        // a. Assert: pair.[[ModuleStatus]] is defined.
        // b. Call ComputeDependencyGraph(pair.[[ModuleStatus]], result).
    // 6. Return undefined.
}
