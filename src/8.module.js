import {
    NewModuleEnvironment,
    ModuleNamespaceCreate,
    CreateMutableBinding,
    CreateImmutableBinding,
    InitializeBinding,
    MakeArgGetter,
    MakeArgSetter,
    IsCallable,
    ToBoolean,
    ToString,
} from './262.js';

import {
    EnsureEvaluated,
} from "./7.linking.js";

// TODO: remove helpers
import {
    HowToDoThis,
    assert,
} from "./utils.js";

// 8.2.1. ParseExportsDescriptors(obj)
export function ParseExportsDescriptors(obj) {
    // 1. Assert: Type(obj) is an Object.
    assert(typeof obj === 'object', 'Type(obj) is an Object.');
    // 2. Let props be ? ToObject(Obj).
    let props = obj;
    // 3. Let keys be ? props.[[OwnPropertyKeys]]().
    let keys = Object.getOwnPropertyNames(props);
    // 4. Let descriptors be an empty List.
    let descriptors = [];

    let desc; // divering to escape the block binding...
    // 5. Repeat for each element nextKey of keys in List order,
    for (let nextKey of keys) {
        // a. Let propDesc be ? props.[[GetOwnProperty]](nextKey).
        let propDesc = Object.getOwnPropertyDescriptor(props, nextKey);
        // b. If propDesc is not undefined and propDesc.[[Enumerable]] is true, then
        if (propDesc !== undefined && propDesc.enumerable === true) {
            // i. Let descObj be ? Get(props, nextKey).
            let descObj = props[nextKey];
            // ii. Let hasModule be ? HasProperty(descObj, "module").
            let hasModule = ("module" in descObj);
            // ii. If hasModule is true, then
            if (hasModule === true) {
                // 1. Let ns be ? Get(descObj, "module").
                let ns = descObj.module;
                // 2. If ns is not a module namespace exotic object, throw a TypeError exception.
                if (!('[[Module]]' in ns)) throw new TypeError();
                // 3. Let importName be ToString(? Get(descObj, "import")).
                let importName = ToString(descObj.import);
                // 4. Let desc be a new Indirect Export Descriptor Record {[[Name]]: nextKey, [[Module]]: ns.[[Module]], [[Import]]: importName}.
                desc = {
                    '[[IndirectExportDescriptor]]': true,
                    '[[Name]]': nextKey,
                    '[[Module]]': ns['[[Module]]'],
                    '[[Import]]': importName,
                };
            }
            // iv. Else,
            else {
                // 1. Let hasValue be ? HasProperty(descObj, "value").
                let hasValue = ("value" in descObj);
                // 2. If hasValue is true, let value be ? Get(descObj, "value").
                let value = (hasValue === true ? descObj.value : undefined);
                // 3. Let hasConst be ? HasProperty(descObj, "const").
                let hasConst = ("const" in descObj);
                // 4. If hasConst is true, let isConst be ToBoolean(? Get(descObj, "const")).
                let isConst = (hasConst === true ? ToBoolean(descObj.const) : undefined);
                // 5. If isConst is true, then
                if (isConst === true) {
                    // a. If hasValue is true, then
                    if (hasValue === true) {
                        // i. Let desc be a new Immutable Export Descriptor Record {[[Name]]: nextKey, [[Value]]: value, [[Initialized]]: true}.
                        desc = {
                            '[[ImmutableExportDescriptor]]': true,
                            '[[Name]]': nextKey,
                            '[[Value]]': value,
                            '[[Initialized]]': true,
                        };
                    }
                    // b. Else,
                    else {
                        // i. Let desc be a new Immutable Export Descriptor Record {[[Name]]: nextKey, [[Value]]: undefined, [[Initialized]]: false}.
                        desc = {
                            '[[ImmutableExportDescriptor]]': true,
                            '[[Name]]': nextKey,
                            '[[Value]]': undefined,
                            '[[Initialized]]': false,
                        };
                    }
                }
                // 6. Else,
                else {
                    // a. If hasValue is true, then
                    if (hasValue === true) {
                        // i. Let desc be a new Mutable Export Descriptor Record {[[Name]]: nextKey, [[Value]]: value, [[Initialized]]: true}.
                        desc = {
                            '[[MutableExportDescriptor]]': true,
                            '[[Name]]': nextKey,
                            '[[Value]]': value,
                            '[[Initialized]]': true,
                        };
                    }
                    // b. Else,
                    else {
                        // i. Let desc be a new Mutable Export Descriptor Record {[[Name]]: nextKey, [[Value]]: undefined, [[Initialized]]: false}.
                        desc = {
                            '[[MutableExportDescriptor]]': true,
                            '[[Name]]': nextKey,
                            '[[Value]]': undefined,
                            '[[Initialized]]': false,
                        };
                    }
                }
            }
            // v. Append desc to the end of descriptors.
            descriptors.push(desc);
        }
    }
    // 6. Return descriptors.
    return descriptors;
}

// 8.2.2. CreateModuleMutator(module)
export function CreateModuleMutator(module) {
    // 1. Assert: module is a Reflective Module Records.
    assert('[[Namespace]]' in module, 'module is a Reflective Module Records.');
    // 2. Let mutator be ObjectCreate(%ObjectPrototype%).
    let mutator = Object.create(null);
    // 3. Let env be module.[[Environment]].
    let env = module['[[Environment]]'];
    // 4. Let envRec be env’s environment record.
    let envRec = env['[[EnvironmentRecord]]'];
    // 5. For each name in _module_.[[LocalExports]], do:
    for (let name of module['[[LocalExports]]']) {
        // a. Assert: mutator does not already have a binding for name.
        assert(Object.getOwnPropertyDescriptor(mutator, name) === undefined, 'mutator does not already have a binding for name.');
        // b. Let p be MakeArgSetter(name, envRec).
        let p = MakeArgSetter(name, envRec);
        // c. Let localExportDesc be the PropertyDescriptor{[[Get]]: g, [[Set]]: p, [[Enumerable]]: true, [[Configurable]]: false}.
        let localExportDesc = {get: () => { throw new TypeError(); }, set: p, enumerable: true, configurable: false};
        // d. Perform ? DefinePropertyOrThrow(mutator, name, localExportDesc).
        Object.defineProperty(mutator, name, localExportDesc);
    }
    // 6. Return mutator.
    return mutator;
}

// 8.2.3. GetExportNames(exportStarStack)
export function GetExportNames(exportStarStack) {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. Let exports be a new empty List.
    let exports = [];
    // 3. For each name in module.[[LocalExports]], do:
    for (let name of module['[[LocalExports]]']) {
        // a. Append name to exports.
        exports.push(name);
    }
    // 4. For each pair in module.[[IndirectExports]], do:
    for (let pair of module['[[IndirectExports]]']) {
        // a. Append pair.[[Key]] to exports.
        exports.push(pair['[[Key]]']);
    }
    // 5. Return exports.
    return exports;
}

// 8.2.4. ResolveExport(exportName, resolveStack, exportStarStack)
export function ResolveExport(exportName, resolveStack, exportStarStack) {
    // 1. Let module be this Reflective Module Record.
    let module = this;
    // 2. If resolveStack contains a record r such that r.[[module]] is equal to module and r.[[exportName]] is equal to exportName, then
    if (resolveStack.find((r) => r['[[module]]'] === module && r['[[exportName]]'] === exportName)) {
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
    // 5. If exportName is in localExports, then:
    if (localExports.indexOf(exportName) !== -1) {
        // a. Return the Record { [[module]]: module, [[bindingName]]: exportName }.
        return {
            '[[module]]': module,
            '[[bindingName]]': exportName
        };
    }
    // 6. Let indirectExports be module.[[IndirectExports]].
    let indirectExports = module['[[IndirectExports]]'];
    // 7. Let pair be the pair in indirectExports such that pair.[[Key]] is equal to exportName.
    let pair = indirectExports.find((pair) => pair['[[Key]]'] === exportName);
    // 8. If pair is defined, return pair.[[Value]].
    if (pair) return pair['[[Value]]'];
    // 9. Return null.
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
    // 2. If module.[[Evaluated]] is true, return undefined.
    if (module['[[Evaluated]]'] === true) return undefined;
    // 3. Let func be module.[[Evaluate]].
    let func = module['[[Evaluate]]'];
    // 4. Set module.[[Evaluated]] to true.
    module['[[Evaluated]]'] = true;
    // 5. Set module.[[Evaluate]] to undefined.
    module['[[Evaluate]]'] = undefined;
    // 6. For each requiredModule in module.[[RequestedModules]], do:
    for (let pair of module['[[IndirectExports]]']) {
        // a. Let requiredModule be pair.[[Value]].[[module]].
        let requiredModule = pair['[[Value]]']['[[module]]'];
        // b. Assert: requiredModule is a Module Record.
        assert('[[Namespace]]' in requiredModule, 'requiredModule is a Module Record.');
        // c. Perform ? requiredModule.ModuleEvaluation().
        requiredModule.ModuleEvaluation();
    }
    // 7. If IsCallable(func) is true, then:
    if (IsCallable(func) === true) {
        // a. Let argList be a new empty List.
        let argList = [];
        // b. Perform ? Call(func, undefined, argList).
        func.apply(undefined, argList);
    }
    // 8. Return undefined.
    return undefined;
}

// 8.3. The Module Constructor
// 8.3.1. Module(descriptors[, executor[, evaluate]])
export default function Module(descriptors, executor, evaluate) {
    // 1. Let realm be the current Realm Record.
    let realm = EnvECMAScriptCurrentRealm();
    // 2. Let env be NewModuleEnvironment(realm.[[globalEnv]]).
    let env = NewModuleEnvironment(realm['[[globalEnv]]']);
    // 3. If Type(descriptors) is not Object, throw a TypeError exception.
    if (typeof descriptors !== 'object') throw new TypeError();
    // 4. Let exportDescriptors be ParseExportsDescriptors(descriptors). // TODO: interleave the subsequent loop with parsing?
    let exportDescriptors = ParseExportsDescriptors(descriptors);
    // 5. Let localExports be a new empty List.
    let localExports = [];
    // 6. Let indirectExports be a new empty List.
    let indirectExports = [];
    // 7. Let exportNames be a new empty List.
    let exportNames = [];
    // 8. Let envRec be env’s environment record.
    let envRec = env['[[EnvironmentRecord]]'];
    // IMPLEMENTATION: diverging from spec to track initialized and mutable bindings
    envRec['[[$InitializeBinding]]'] = [];
    envRec['[[$MutableBinding]]'] = [];
    // 9. For each desc in exportDescriptors, do:
    for (let desc of exportDescriptors) {
        // a. Let exportName be desc.[[Name]].
        let exportName = desc['[[Name]]'];
        // b. Append exportName to exportNames.
        exportNames.push(exportName);
        // c. If desc is an Indirect Export Descriptor, then:
        if (desc['[[IndirectExportDescriptor]]']) {
            // i. Let otherMod be desc.[[Module]].
            let otherMod = desc['[[Module]]'];
            // ii. Let resolution be ? otherMod.ResolveExport(desc.[[Import]], « »).
            let resolution = otherMod.ResolveExport(desc['[[Import]]'], []);
            // iii. If resolution is null, then throw a SyntaxError exception.
            if (resolution === null) {
                throw new SyntaxError();
            }
            // iv. Append the record {[[Key]]: exportName, [[Value]]: resolution} to indirectExports.
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
                // 1. Perform ? envRec.CreateImmutableBinding(exportName, true).
                CreateImmutableBinding.call(envRec, exportName, true);
            // iii. Else:
            } else {
                // 1. Assert: desc is a Mutable Export Descriptor.
                assert('[[MutableExportDescriptor]]' in desc, 'desc is a Mutable Export Descriptor.');
                // 2. Perform ? envRec.CreateMutableBinding(exportName, false).
                CreateMutableBinding.call(envRec, exportName, false);
            }
            // iv. If desc.[[Initialized]] is true, then:
            if (desc['[[Initialized]]'] === true) {
                // 1. Call envRec.InitializeBinding(exportName, desc.[[Value]]).
                InitializeBinding.call(envRec, exportName, desc['[[Value]]']);
            }
        }
    }

    // 11. If evaluate is not undefined, then
    if (evaluate !== undefined) {
        // a. If IsCallable(evaluate) is false, throw a new TypeError exception.
        if (IsCallable(evaluate) === false) throw new TypeError();
    }
    // 12. Let mod be a new Reflective Module Record {[[Realm]]: realm, [[Environment]]: env, [[Namespace]]: undefined, [[LocalExports]]: localExports, [[IndirectExports]]: indirectExports, [[Evaluated]]: *false*, [[Evaluate]]: evaluate}.
    let mod = {
        '[[Realm]]': realm,
        '[[Environment]]': env,
        '[[Namespace]]': undefined,
        '[[LocalExports]]': localExports,
        '[[IndirectExports]]': indirectExports,
        '[[Evaluated]]': false,
        '[[Evaluate]]': evaluate,
        // wiring up concrete implementations
        GetExportedNames,
        ModuleDeclarationInstantiation,
        ModuleEvaluation,
        ResolveExport,
    };
    // 13. Let ns be ModuleNamespaceCreate(mod, realm, exportNames).
    // TODO: deviated from spec, `realm` is not needed in this call
    let ns = ModuleNamespaceCreate(mod, exportNames);
    // 14. Set mod.[[Namespace]] to ns.
    mod['[[Namespace]]'] = ns;
    // 15. If executor is not undefined, then
    if (executor !== undefined) {
        // a. If IsCallable(executor) is false, throw a new TypeError exception.
        if (IsCallable(executor) === false) throw new TypeError();
        // b. Let mutator be CreateModuleMutator(mod).
        let mutator = CreateModuleMutator(mod);
        // c. Perform ? executor(mutator, ns).
        executor(mutator, ns);
    }
    // 16. Return ns.
    return ns;
}

// 8.4. Properties of the Module Constructor
Module.prototype.constructor = Module;

// 8.4.1. Module.evaluate(ns)
Module.evaluate = function (ns) {
    // 1. If ns is not a module namespace exotic object, throw a TypeError exception.
    if (!('[[Module]]' in ns)) throw new TypeError();
    // 2. Let module be ns.[[Module]].
    let module = ns['[[Module]]'];
    // 3. Let entry be module.[[Entry]].
    let entry = module['[[Entry]]'];
    // 4. Let status be EnsureEvaluated(entry).
    let status = EnsureEvaluated(entry);
    // 5. RejectIfAbrupt(status);
    // TODO: diverging by ignoring the RejectIfAbrupt.
    // 6. Return a promise resolved with undefined.
    return Promise.resolve(undefined);
};

export function GetExportedNames() {
    return undefined;
}
