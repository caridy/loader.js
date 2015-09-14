function /* 7.2.1 */ ParseExportsDescriptors(obj) {
    // TODO
}

function /* 7.2.2 */ CreateModuleMutator(module) {
    // TODO
}

function /* 7.2.3 */ GetExportNames(exportStarStack) {
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
        // a. Append pair.[[key]] to exports.
        exports.push(pair['[[key]]']);
    });
    // 5. Return exports.
    return exports;
}

function /* 7.2.4 */ ResolveExport(exportName, resolveStack, exportStarStack) {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. If resolveStack contains a record r such that r.[[module]] is equal to module and r.[[exportName]] is equal to exportName, then
    if (resolveStack.some((r) => r['[[module]]'] === module && r['[[exportName]]'] === exportName) {
        // a. Assert: this is a circular import request.
        Assert: this is a circular import request.
        // b. Throw a SyntaxError exception.
        throw new SyntaxError();
    }
    // 3. Append the record {[[module]]: module, [[exportName]]: exportName} to resolveStack.
    resolveStack.push({
        [[module]]: module,
        [[exportName]]: exportName
    });
    // 4. Let exports be module.[[LocalExports]].
    let exports = module['[[LocalExports]]'];
    // 5. Let pair be the pair in exports such that pair.[[key]] is equal to exportName.
    let pair = exports.find((pair) => pair['[[key]]'] === exportName);
    // 6. If pair is defined, then:
    if (pair) {
        // a. Return the Record { [[module]]: module, [[bindingName]]: exportName }.
        return {
            [[module]]: module,
            [[bindingName]]: exportName
        };
    }
    // 7. Let exports be module.[[IndirectExports]].
    let exports = module['[[IndirectExports]]'];
    // 8. Let pair be the pair in exports such that pair.[[key]] is equal to exportName.
    let pair = exports.find((pair) => pair['[[key]]'] === exportName);
    // 9. If pair is defined, then return pair.[[value]].
    if (pair) {
        return pair['[[value]]'];
    }
    // 10. Return null.
    return null;
}

function /* 7.2.5 */ ModuleDeclarationInstantiation() {
    // 1. Return undefined.
    return undefined;
}

function /* 7.2.6 */ ModuleEvaluation() {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. Let evaluate be module.[[Evaluate]].
    let evaluate = module['[[Evaluate]]'];
    // 3. Set module.[[Evaluate]] to undefined.
    module['[[Evaluate]]'] = undefined;
    // 4. Return evaluate().
    return evaluate();
}

export default class Module {
    constructor() {
        // 1. Let realm be the current Realm.
        let realm = the current Realm.
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
        let envRec = env’s environment record.
        // 8. For each desc in exportDescriptors, do:
        exportDescriptors.forEach((desc) => {
            // a. Let exportName be desc.[[Name]].
            let exportName = desc['[[Name]]'];
            // b. Append exportName to exportNames.
            exportNames.push(exportName);
            // c. If desc is an Indirect Export Descriptor, then:
            if (desc is an Indirect Export Descriptor) {
                // i. Let otherMod be desc.[[Module]].
                let otherMod = desc['[[Module]]'];
                // ii. Let resolution be otherMod.ResolveExport(desc.[[Import]], « »).
                let resolution = ResolveExport.call(otherMod, desc['[[Import]]'], « »);
                // iii. ReturnIfAbrupt(resolution).
                ReturnIfAbrupt(resolution);
                // iv. If resolution is null, then throw a SyntaxError exception.
                if (resolution === null) {
                    throw new SyntaxError();
                }
                // v. Append the record {[[key]]: exportName, [[value]]: resolution} to indirectExports.
                indirectExports.push({
                    [[key]]: exportName,
                    [[value]]: resolution
                });
            // d. Else:
            } else {
                // i. Append exportName to localExports.
                localExports.push(exportName);
                // ii. If desc is an Immutable Export Descriptor, then:
                if (desc is an Immutable Export Descriptor) {
                    // 1. Let status be envRec.CreateImmutableBinding(exportName, true).
                    let status = envRec.CreateImmutableBinding(exportName, true).
                    // 2. Assert: status is not an abrupt completion.
                    Assert: status is not an abrupt completion.
                // iii. Else:
                } else {
                    // 1. Assert: desc is a Mutable Export Descriptor.
                    Assert: desc is a Mutable Export Descriptor.
                    // 2. Let status be envRec.CreateMutableBinding(exportName, false).
                    let status = envRec.CreateMutableBinding(exportName, false).
                    // 3. Assert: status is not an abrupt completion.
                    Assert: status is not an abrupt completion.
                }
                // iv. If desc.[[Initialized]] is true, then:
                if (desc['[[Initialized]]'] === true) {
                    // 1. Call envRec.InitializeBinding(exportName, desc.[[Value]]).
                    envRec.InitializeBinding(exportName, desc['[[Value]]']);
                }
        });
        // 9. If evaluate is undefined, then let evaluated be true. Otherwise let evaluated be false.
        if (evaluate === undefined) {
            let evaluated = true;
        } else {
            let evaluated = false;
        }
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
        let ns = ModuleNamespaceCreate(mod, realm, exportNames);
        // 12. Set mod.[[Namespace]] to ns.
        mod['[[Namespace]]'] = ns;
        // 13. If executor is not undefined, then
        if (executor !== undefined) {
            // a. Let mutator be CreateModuleMutator(mod).
            let mutator = CreateModuleMutator(mod);
            // b. Let status be executor(mutator, ns).
            let status = executor(mutator, ns);
            // c. ReturnIfAbrupt(status).
            ReturnIfAbrupt(status);
        }
        // 14. Return ns.
        return ns;
    }
}

Module.isExecuted = function () {
    // TODO: way to force evaluation of a module namespace exotic object (Reflect.Module.evaluate(m)? m[Reflect.Module.evaluate]()?)
};
