function /* 7.2.1 */ ParseExportsDescriptors(obj) {
    // TODO
}

function /* 7.2.2 */ CreateModuleMutator(module) {
    // TODO
}

function /* 7.2.3 */ GetExportNames(exportStarStack) {
    let module = this;
    let exports = [];
    module.['[[LocalExports]].forEach((name) => {
        exports.push(name);
    });
    module.['[[IndirectExports]].forEach((pair) => {
        exports.push(pair.['[[key]]);
    });
    return exports;
}

function /* 7.2.4 */ ResolveExport(exportName, resolveStack, exportStarStack) {
    let module = this;
    if (resolveStack.some((r) => r.['[[module]]'] === module && r.['[[exportName]]'] === exportName) {
        Assert: this is a circular import request.
        throw new SyntaxError();
    }
    resolveStack.push({
        [[module]]: module,
        [[exportName]]: exportName
    });
    let exports = module.['[[LocalExports]]'];
    let pair = exports.find((pair) => pair.['[[key]]'] === exportName);
    if (pair) {
        return {
            [[module]]: module,
            [[bindingName]]: exportName
        };
    }
    let exports = module.['[[IndirectExports]]'];
    let pair = exports.find((pair) => pair.['[[key]]'] === exportName);
    if (pair) {
        return pair.['[[value]]'];
    }
    return null;
}

function /* 7.2.5 */ ModuleDeclarationInstantiation() {
    return undefined;
}

function /* 7.2.6 */ ModuleEvaluation() {
    let module = this;
    let evaluate = module.['[[Evaluate]]'];
    module.['[[Evaluate]]'] = undefined;
    return evaluate();
}


export default class Module {
    constructor() {
        let realm = the current Realm.
        let env = NewModuleEnvironment(realm.['[[globalEnv]]);
        let exportDescriptors = ParseExportsDescriptors(descriptors); // TODO: interleave the subsequent loop with parsing?
        let localExports = [];
        let indirectExports = [];
        let exportNames = [];
        let envRec = env’s environment record.
        exportDescriptors.forEach((desc) => {
            let exportName = desc.['[[Name]]'];
            exportNames.push(exportName);
            if (desc is an Indirect Export Descriptor) {
                let otherMod = desc.['[[Module]]'];
                let resolution = ResolveExport.call(otherMod, desc.['[[Import]]'], « »);
                ReturnIfAbrupt(resolution);
                if (resolution === null) {
                    throw new SyntaxError();
                }
                indirectExports.push({
                    [[key]]: exportName,
                    [[value]]: resolution
                });
            } else {
                localExports.push(exportName);
                if (desc is an Immutable Export Descriptor) {
                    let status = envRec.CreateImmutableBinding(exportName, true).
                    Assert: status is not an abrupt completion.
                } else {
                    Assert: desc is a Mutable Export Descriptor.
                    let status = envRec.CreateMutableBinding(exportName, false).
                    Assert: status is not an abrupt completion.
                }
                if (desc.['[[Initialized]]'] === true) {
                    envRec.InitializeBinding(exportName, desc.['[[Value]]);
                }
        });
        if (evaluate === undefined) {
            let evaluated = true;
        } else {
            let evaluated = false;
        }
        let mod = a new Reflective Module Record {
            [[Realm]]: realm,
            [[Environment]]: env,
            [[Namespace]]: undefined,
            [[Evaluated]]: evaluated,
            [[LocalExports]]: localExports,
            [[IndirectExports]]:
            indirectExports,
            [[Evaluate]]: evaluate
        };
        let ns = ModuleNamespaceCreate(mod, realm, exportNames);
        mod.['[[Namespace]]'] = ns;
        if (executor !== undefined) {
            let mutator = CreateModuleMutator(mod);
            let status = executor(mutator, ns);
            ReturnIfAbrupt(status);
        }
        return ns;
    }
}

Module.isExecuted = function () {
    // TODO: way to force evaluation of a module namespace exotic object (Reflect.Module.evaluate(m)? m[Reflect.Module.evaluate]()?)
};
