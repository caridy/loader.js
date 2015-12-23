import {
    NewModuleEnvironment,
    ModuleNamespaceCreate,
    CreateMutableBinding,
} from './262.js';

// TODO: remove helpers
import {
    HowToDoThis,
} from "./utils.js";

// 8.2.1. ParseExportsDescriptors(obj)
export function ParseExportsDescriptors(obj) {
    console.log('TODO: Missing implementation for 8.2.1. ParseExportsDescriptors(obj)');
    return [];
    // TODO: throw new Error('TODO');
}

// 8.2.2. CreateModuleMutator(module)
export function CreateModuleMutator(module) {
    console.log('TODO: Missing implementation for 8.2.2. CreateModuleMutator(module)');
    return module;
    // TODO: throw new Error('TODO');
}

// 8.2.3. GetExportNames(exportStarStack)
export function GetExportNames(exportStarStack) {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. Let exports be a new empty List.
    let exports = [];
    // 3. For each name in module.[[LocalExports]], do:
    module['[[LocalExports]]'].forEach((name) => {
        // a. Append name to exports.
        exports.push(name);
    });
    // 4. For each pair in module.[[IndirectExports]], do:
    module['[[IndirectExports]]'].forEach((pair) => {
        // a. Append pair.[[Key]] to exports.
        exports.push(pair['[[Key]]']);
    });
    // 5. Return exports.
    return exports;
}

// 8.2.4. ResolveExport(exportName, resolveStack, exportStarStack)
export function ResolveExport(exportName, resolveStack, exportStarStack) {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. If resolveStack contains a record r such that r.[[module]] is equal to module and r.[[exportName]] is equal to exportName, then
    if (resolveStack.some((r) => r['[[module]]'] === module && r['[[exportName]]'] === exportName)) {
        // a. Assert: this is a circular import request.
        HowToDoThis('ResolveExport', '2.a. Assert: this is a circular import request.');
        // b. Throw a SyntaxError exception.
        throw new SyntaxError();
    }
    // 3. Append the record {[[module]]: module, [[exportName]]: exportName} to resolveStack.
    resolveStack.push({
        '[[module]]': module,
        '[[exportName]]': exportName
    });
    // 4. Let localExports be module.[[LocalExports]].
    let localExports = module['[[LocalExports]]'];
    // 5. Let localPair be the pair in localExports such that pair.[[Key]] is equal to exportName.
    let localPair = localExports.find((pair) => pair['[[Key]]'] === exportName);
    // 6. If localPair is defined, then:
    if (localPair) {
        // a. Return the Record { [[module]]: module, [[bindingName]]: exportName }.
        return {
            '[[module]]': module,
            '[[bindingName]]': exportName
        };
    }
    // 7. Let exports be module.[[IndirectExports]].
    let exports = module['[[IndirectExports]]'];
    // 8. Let pair be the pair in exports such that pair.[[Key]] is equal to exportName.
    let pair = exports.find((pair) => pair['[[Key]]'] === exportName);
    // 9. If pair is defined, then return pair.[[Value]].
    if (pair) return pair['[[Value]]'];
    // 10. Return null.
    return null;
}

// 8.2.5. ModuleDeclarationInstantiation()
export function ModuleDeclarationInstantiation() {
    // 1. Return undefined.
    return undefined;
}

// 8.2.6. ModuleEvaluation()
export function ModuleEvaluation() {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. Let evaluate be module.[[Evaluate]].
    let evaluate = module['[[Evaluate]]'];
    // 3. Set module.[[Evaluate]] to undefined.
    module['[[Evaluate]]'] = undefined;
    // 4. Return evaluate().
    return evaluate();
}

// 8.3. The Module Constructor
// 8.3.1. Module(descriptors[, executor[, evaluate]])
export default function Module(descriptors, executor, evaluate) {
    // 1. Let realm be the current Realm.
    let realm = Object.create(null);
    // 2. Let env be NewModuleEnvironment(realm.[[globalEnv]]).
    let env = NewModuleEnvironment(realm['[[globalEnv]]']);
    // 3. Let exportDescriptors be ParseExportsDescriptors(descriptors). // TODO: interleave the subsequent loop with parsing?
    let exportDescriptors = ParseExportsDescriptors(descriptors);
    // 4. Let localExports be a new empty List.
    let localExports = [];
    // 5. Let indirectExports be a new empty List.
    let indirectExports = [];
    // 6. Let exportNames be a new empty List.
    let exportNames = [];
    // 7. Let envRec be env’s environment record.
    let envRec = Object.create(null);
    // 8. For each desc in exportDescriptors, do:
    for (var desc in exportDescriptors) {
        // a. Let exportName be desc.[[Name]].
        let exportName = desc['[[Name]]'];
        // b. Append exportName to exportNames.
        exportNames.push(exportName);
        // c. If desc is an Indirect Export Descriptor, then:
        if (desc['[[IndirectExportDescriptor]]']) {
            // i. Let otherMod be desc.[[Module]].
            let otherMod = desc['[[Module]]'];
            // ii. Let resolution be otherMod.ResolveExport(desc.[[Import]], « »).
            let resolution = ResolveExport.call(otherMod, desc['[[Import]]']);
            // iii. ReturnIfAbrupt(resolution).
            ReturnIfAbrupt(resolution);
            // iv. If resolution is null, then throw a SyntaxError exception.
            if (resolution === null) {
                throw new SyntaxError();
            }
            // v. Append the record {[[Key]]: exportName, [[Value]]: resolution} to indirectExports.
            indirectExports.push({
                '[[Key]]': exportName,
                '[[Value]]': resolution
            });
        // d. Else:
        } else {
            // i. Append exportName to localExports.
            localExports.push(exportName);
            // ii. If desc is an Immutable Export Descriptor, then:
            if (desc['[[ImmutableExportDescriptor]]']) {
                // 1. Let status be envRec.CreateImmutableBinding(exportName, true).
                let status = CreateImmutableBinding.call(envRec, exportName, true).
                // 2. Assert: status is not an abrupt completion.
                HowToDoThis();
            // iii. Else:
            } else {
                // 1. Assert: desc is a Mutable Export Descriptor.
                HowToDoThis('class Module {}', '8.d.iii.1. Assert: desc is a Mutable Export Descriptor.');
                // 2. Let status be envRec.CreateMutableBinding(exportName, false).
                let status = CreateMutableBinding.call(envRec, exportName, false).
                // 3. Assert: status is not an abrupt completion.
                HowToDoThis();
            }
            // iv. If desc.[[Initialized]] is true, then:
            if (desc['[[Initialized]]'] === true) {
                // 1. Call envRec.InitializeBinding(exportName, desc.[[Value]]).
                InitializeBinding.call(envRec, exportName, desc['[[Value]]']);
            }
        }
    }
    // 9. If evaluate is undefined, then let evaluated be true. Otherwise let evaluated be false.
    let evaluated = (evaluate === undefined ? true : false);
    // 10. Let mod be a new Reflective Module Record {[[Realm]]: realm, [[Environment]]: env, [[Namespace]]: undefined, [[Evaluated]]:
    // evaluated, [[LocalExports]]: localExports, [[IndirectExports]]: indirectExports, [[Evaluate]]: evaluate}.
    let mod = {
        '[[Realm]]': realm,
        '[[Environment]]': env,
        '[[Namespace]]': undefined,
        '[[Evaluated]]': evaluated,
        '[[LocalExports]]': localExports,
        '[[IndirectExports]]': indirectExports,
        '[[Evaluate]]': evaluate,
    };
    // 11. Let ns be ModuleNamespaceCreate(mod, realm, exportNames).
    // TODO: deviated from spec, `realm` is not needed in this call
    let ns = ModuleNamespaceCreate(mod, exportNames);
    // 12. Set mod.[[Namespace]] to ns.
    mod['[[Namespace]]'] = ns;
    // 13. If executor is not undefined, then
    if (executor !== undefined) {
        // a. Let mutator be CreateModuleMutator(mod).
        let mutator = CreateModuleMutator(mod);
        // b. Let status be ? executor(mutator, ns).
        executor(mutator, ns);
    }
    // 14. Return ns.
    return ns;
}

// 8.4. Properties of the Module Constructor
Module.prototype.constructor = Module;

// 8.4.1. Module.evaluate(m)
Module.evaluate = function (m) {
    throw new Error('TODO');
    // TODO: way to force evaluation of a module namespace exotic object (Reflect.Module.evaluate(m)? m[Reflect.Module.evaluate]()?)
};