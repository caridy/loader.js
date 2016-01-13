// TODO: remove helpers
import {
    HowToDoThis,
    assert,
} from './utils.js';

import {
    HostResolveImportedModule,
} from './7.linking.js';

export function OrdinaryCreateFromConstructor (constructor, intrinsicDefaultProto, internalSlotsList) {
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    let proto = constructor.prototype;
    // 3. Return ObjectCreate(proto, internalSlotsList).
    return Object.create(proto, internalSlotsList.reduce((descriptors, internalSlot) => {
        descriptors[internalSlot] = { writable: true, configurable: false, value: undefined, enumerable: false };
        return descriptors;
    }, {}));
}

// 7.1.12 ToString ( argument )
export function ToString(value) {
    // relying on the underlaying implementation
    return typeof value === 'string' ? value : value + '';
}

// 7.1.2 ToBoolean ( argument )
export function ToBoolean(value) {
    // relying on the underlaying implementation
    return !!value;
}

// 7.3.9 GetMethod (V, P)
export function GetMethod(v, p) {
    let func = v[p];
    if (!func) return undefined;
    if (typeof func !== 'function') throw new TypeError();
    return func;
}

// 7.2.3 IsCallable ( argument )
export function IsCallable(argument) {
    // diverging from spec to align with js
    if (typeof argument === 'function') return true;
    if (typeof argument !== 'object') return false;
    if (typeof argument.call === 'function') return true;
    return false;
}

// 15.2.1.18 Runtime Semantics: GetModuleNamespace( module )
export function GetModuleNamespace(module) {
    // 1. Assert: module is an instance of a concrete subclass of Module Record.
    assert('[[Namespace]]' in module, 'module is an instance of a concrete subclass of Module Record.'); // TODO: improve assertion
    // 2. Let namespace be module.[[Namespace]].
    let namespace = module['[[Namespace]]'];
    // 3. If namespace is undefined, then
    if (namespace === undefined) {
        // a. Let exportedNames be ? module.GetExportedNames(« »).
        let exportedNames = module.GetExportedNames([]);
        // b. Let unambiguousNames be a new empty List.
        let unambiguousNames = [];
        // c. For each name that is an element of exportedNames,
        for (let name of exportedNames) {
            // i. Let resolution be ? module.ResolveExport(name, « », « »).
            let resolution = module.ResolveExport(name, [], []);
            // ii. If resolution is null, throw a SyntaxError exception.
            if (resolution === null) throw new SyntaxError();
            // iii. If resolution is not "ambiguous", append name to unambiguousNames.
            if (resolution !== 'ambiguous') unambiguousNames.push(name);
        }
        // d. Let namespace be ModuleNamespaceCreate(module, unambiguousNames).
        namespace = ModuleNamespaceCreate(module, unambiguousNames);
    }
    // 4. Return namespace.
    return namespace;
}

// 15.2.1.16.2 GetExportedNames( exportStarSet ) Concrete Method
export function GetExportedNames(exportStarSet) {
    // 1. Let module be this Source Text Module Record.
    let module = this;
    // 2. If exportStarSet contains module, then
    if (module in exportStarSet) {
        // a. Assert: We've reached the starting point of an import * circularity.
        HowToDoThis('15.2.1.16.2 GetExportedNames', '2.a. Assert: We\'ve reached the starting point of an import * circularity.');
        // b. Return a new empty List.
        return [];
    }
    // 3. Append module to exportStarSet.
    exportStarSet.push(module);
    // 4. Let exportedNames be a new empty List.
    let exportedNames = [];
    // 5. For each ExportEntry Record e in module.[[LocalExportEntries]], do
    for (let e of module['[[LocalExportEntries]]']) {
        // a. Assert: module provides the direct binding for this export.
        HowToDoThis('15.2.1.16.2 GetExportedNames', '5.a. Assert: module provides the direct binding for this export.');
        // b. Append e.[[ExportName]] to exportedNames.
        exportedNames.push(e['[[ExportName]]']);
    }
    // 6. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (let e of module['[[IndirectExportEntries]]']) {
        // a. Assert: module imports a specific binding for this export.
        HowToDoThis('15.2.1.16.2 GetExportedNames', '6.a. Assert: module imports a specific binding for this export.');
        // b. Append e.[[ExportName]] to exportedNames.
        exportedNames.push(e['[[ExportName]]']);
    }
    // 7. For each ExportEntry Record e in module.[[StarExportEntries]], do
    for (let e of module['[[StarExportEntries]]']) {
        // a. Let requestedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
        let requestedModule = HostResolveImportedModule(module, e['[[ModuleRequest]]']);
        // b. Let starNames be requestedModule.GetExportedNames(exportStarSet).
        let starNames = requestedModule.GetExportedNames(exportStarSet);
        // c. For each element n of starNames, do
        for (let n of starNames) {
            // i. If SameValue(n, "default") is false, then
            if (n !== 'default') {
                // 1. If n is not an element of exportedNames, then
                if (exportedNames.indexOf(n) === -1) {
                    // a. Append n to exportedNames.
                    exportedNames.push(n);
                }
            }
        }
    }
    // 8. Return exportedNames.
    return exportedNames;
}

// 8.1.2.6 NewModuleEnvironment (E)
// Note: we will deviate from the spec a little bit here since we have no way
// to create a Lexival Environment from JS.
export function NewModuleEnvironment (E) {
    // 1. Let env be a new Lexical Environment.
    let env = Object.create(null);
    // 2. Let envRec be a new module Environment Record containing no bindings.
    let envRec = Object.create(null);
    // TODO: diverging from spec to track initialized bindings
    envRec['[[$InitializeBinding]]'] = [];
    envRec['[[$MutableBinding]]'] = [];
    // 3. Set env's EnvironmentRecord to be envRec.
    env['[[EnvironmentRecord]]'] = envRec;
    // 4. Set the outer lexical environment reference of env to E.
    Object.setPrototypeOf(envRec, E);
    // 5. Return env.
    return env;
}

// 9.4.6.13 ModuleNamespaceCreate (module, exports)
export function ModuleNamespaceCreate (module, exports) {
    // 1. Assert: module is a Module Record (see 15.2.1.15).
    assert('[[Namespace]]' in module, 'module is a Module Record');
    // 2. Assert: module.[[Namespace]] is undefined.
    assert(module['[[Namespace]]'] === undefined, 'module.[[Namespace]] is undefined');
    // 3. Assert: exports is a List of String values.
    assert(Array.isArray(exports), 'exports is a List of String values.') && exports.forEach(value => assert(typeof value === 'string', 'exports is a List of String values.'));
    // 4. Let M be a newly created object.
    let M = Object.create(null);
    // 5. Set M's essential internal methods to the definitions specified in 9.4.6.
    // - 262 spec expando:
    {
        // 9.4.6.x Module Namespace Exotic Objects
        // note: this block is suppose to control the internal slots used by the engine
        // to discover the internals of the namespace object, this includes:
        // [[GetPrototypeOf]] ( )
        // [[SetPrototypeOf]] (V)
        // [[IsExtensible]] ( )
        // [[PreventExtensions]] ( )
        // [[GetOwnProperty]] (P)
        // [[DefineOwnProperty]] (P, Desc),
        // [[HasProperty]] (P)
        // [[Get]] (P, Receiver)
        // [[Set]] ( P, V, Receiver),
        // [[Delete]] (P)
        // [[Enumerate]] ()
        Object.defineProperty(M, '[[Enumerate]]', { get: function () {
            // Let exports be the value of O's [[Exports]] internal slot.
            let exports = this['[[Exports]]'];
            // Return CreateListIterator(exports).
            return [].concat(exports);
        }, configurable: false, enumerable: false });
        // [[OwnPropertyKeys]] ( )
        // Unfortunately, none of these can be implemented in user-land in a polyfill.
        // In the case of [[Enumerate]], since it will be used by step 8, we defined
        // it anyways.
    };
    // 6. Set M's [[Module]] internal slot to module.
    Object.defineProperty(M, '[[Module]]', { value: module, configurable: false, enumerable: false });
    // 7. Set M's [[Exports]] internal slot to exports.
    Object.defineProperty(M, '[[Exports]]', { value: exports, configurable: false, enumerable: false });

    // 8. Create own properties of M corresponding to the definitions in 26.3.
    // - spec expando on step 8:
    {
        // http://tc39.github.io/ecma262/#sec-module-namespace-objects
        // 26.3 Module Namespace Objects
        {
            // - spec expando on step 26.3:
            // 9.4.6 Module Namespace Exotic Objects
            // A module namespace object is an exotic object that exposes the bindings exported from an ECMAScript Module (See 15.2.3). There is a one-to-one correspondence between the String-keyed own properties of a module namespace exotic object and the binding names exported by the Module. The exported bindings include any bindings that are indirectly exported using export * export items. Each String-valued own property key is the StringValue of the corresponding exported binding name. These are the only String-keyed properties of a module namespace exotic object. Each such property has the attributes {[[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: false}. Module namespace objects are not extensible.
            let envRec = module['[[Environment]]']['[[EnvironmentRecord]]'];
            exports.forEach((name) => {
                let localName = (name === 'default' ? '$default$' : name);
                if (Object.getOwnPropertyDescriptor(envRec, localName) === undefined) {
                    // indirect exports
                    let resolution = module.ResolveExport(name, [], []);
                    assert(resolution !== null && resolution !== 'ambiguous');
                    let importedModule = resolution['[[module]]'];
                    let importedEnvRec = importedModule['[[Environment]]']['[[EnvironmentRecord]]'];
                    let importedName = resolution['[[bindingName]]'];
                    if (importedName === 'default') importedName = '$default$';
                    Object.defineProperty(M, name, {
                        get: () => importedEnvRec[importedName],
                        set: () => { throw new SyntaxError('Live bindings in an exotic namespace object cannot be modified.'); },
                        enumerable: true,
                        configurable: false
                    });
                } else {
                    // local exports
                    Object.defineProperty(M, name, {
                        get: () => envRec[localName],
                        set: () => { throw new SyntaxError('Live bindings in an exotic namespace object cannot be modified.'); },
                        enumerable: true,
                        configurable: false
                    });
                }
            });
        };
        // 26.3.1 @@toStringTag
        Object.defineProperty(M, Symbol.toStringTag, {
            value: 'Module',
            writable: false,
            enumerable: false,
            configurable: true
        });
        // 26.3.2 [ @@iterator ] ( )
        M[Symbol.iterator] = function () {
            // 1. Let N be the this value.
            let N = this;
            // 2. If Type(N) is not Object, throw a TypeError exception.
            if (typeof N !== 'object') throw new TypeError();
            // 3. Return ? N.[[Enumerate]]().
            return N['[[Enumerate]]'];
        };
    };

    // 9. Set module.[[Namespace]] to M.
    module['[[Namespace]]'] = M;
    // 10. Return M.
    return M;
}

// 8.1.1.1.2 CreateMutableBinding (N, D)
export function CreateMutableBinding (N/*, D*/) {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    let envRec = this;
    // 2. Assert: envRec does not already have a binding for N.
    assert(Object.getOwnPropertyDescriptor(envRec, N) === undefined, 'envRec does not already have a binding for N.');
    // 3. Create a mutable binding in envRec for N and record that it is uninitialized. If D is true record that the newly created binding may be deleted by a subsequent DeleteBinding call.
    // TODO: divering from spec since we don't really care about "DeleteBinding"
    Object.defineProperty(envRec, N, {
        configurable: true,
        enumerable: true,
    });
    // IMPLEMENTATION: diverging from spec to mark binding as immutable for the initialization
    envRec['[[$MutableBinding]]'].push(N);
    // 4. Return NormalCompletion(empty).
    return;
}

// 8.1.1.1.3 CreateImmutableBinding (N, S)
export function CreateImmutableBinding (N/*, S*/) {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    let envRec = this;
    // 2. Assert: envRec does not already have a binding for N.
    assert(Object.getOwnPropertyDescriptor(envRec, N) === undefined, 'envRec does not already have a binding for N.');
    // 3. Create an immutable binding in envRec for N and record that it is uninitialized. If S is true record that the newly created binding is a strict binding.
    // TODO: diverging from spec since all bindings are strict bindings
    Object.defineProperty(envRec, N, {
        configurable: true,
        enumerable: true,
    });
    // 4. Return NormalCompletion(empty).
    return;
}

// 8.1.1.1.4 InitializeBinding (N, V)
export function InitializeBinding (N, V) {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    let envRec = this;
    // 2. Assert: envRec must have an uninitialized binding for N.
    assert(Object.getOwnPropertyDescriptor(envRec, N) !== undefined && envRec['[[$InitializeBinding]]'].indexOf(N) === -1, 'envRec must have an uninitialized binding for N.');
    // 3. Set the bound value for N in envRec to V.
    Object.defineProperty(envRec, N, {
        value: V,
        // IMPLEMENTATION: only after the binding is initialized we lock it down if it is not mutable
        configurable: envRec['[[$MutableBinding]]'].indexOf(N) !== -1,
    });
    // 4. Record that the binding for N in envRec has been initialized.
    envRec['[[$InitializeBinding]]'].push(N);
    // 5. Return NormalCompletion(empty).
    return;
}

// 8.1.1.5.5 CreateImportBinding (N, M, N2)
export function CreateImportBinding (N, M, N2) {
    // 1. Let envRec be the module Environment Record for which the method was invoked.
    let envRec = this;
    // 2. Assert: envRec does not already have a binding for N.
    assert(!(N in envRec), 'envRec does not already have a binding for N.');
    // 3. Assert: M is a Module Record.
    assert('[[Namespace]]' in M, 'M is a Module Record.');
    // 4. Assert: When M.[[Environment]] is instantiated it will have a direct binding for N2.
    assert(M['[[Environment]]'] === undefined || Object.getOwnPropertyDescriptor(M['[[Environment]]']['[[EnvironmentRecord]]'], N2) !== undefined, 'When M.[[Environment]] is instantiated it will have a direct binding for N2.');
    // 5. Create an immutable indirect binding in envRec for N that references M and N2 as its target binding and record that the binding is initialized.
    Object.defineProperty(envRec, N, {
        get: () => {
            return M['[[EnvironmentRecord]]'][N2];
        },
        set: () => { throw new SyntaxError('Live bindings in an exotic namespace object cannot be modified.'); },
        configurable: false,
        enumerable: true,
    });
    envRec['[[$InitializeBinding]]'].push(N);
    // 6. Return NormalCompletion(empty).
    return;
}

// 9.4.4.7.1 MakeArgGetter (name, env)
export function MakeArgGetter (name, env) {
    return function () {
        return env[name];
    };
}

// 9.4.4.7.2 MakeArgSetter (name, env)
export function MakeArgSetter (name, env) {
    return function (value) {
        // IMPLEMENTATION: diverging considerable from spec to track down the initialization of the bindings
        if (env['[[$MutableBinding]]'].indexOf(name) === -1 && env['[[$InitializeBinding]]'].indexOf(name) === -1) {
            InitializeBinding.call(env, name, value);
        } else {
            Object.defineProperty(env, name, {
                value: value,
            });
        }
    };
}

// 15.2.1.9 Static Semantics: ImportedLocalNames (importEntries)
export function ImportedLocalNames(importEntries) {
    // 1. Let localNames be a new empty List.
    let localNames = [];
    // 2. For each ImportEntry Record i in importEntries, do
    for (let i of importEntries) {
        // a. Append i.[[LocalName]] to localNames.
        localNames.push(i['[[LocalName]]']);
    }
    // 3. Return localNames.
    return localNames;
}

// 15.2.1.16.1 ParseModule (sourceText, hostDefined)
export function ParseModule (sourceText, hostDefined) {
    // 1. Assert: sourceText is an ECMAScript source text (see clause 10).
    assert(typeof(sourceText) === 'string', 'sourceText is an ECMAScript source text (see clause 10).');
    // 2. Parse sourceText using Module as the goal symbol and analyze the parse result for any Early Error conditions. If the parse was successful and no early errors were found, let body be the resulting parse tree. Otherwise, let body be a List of one or more SyntaxError or ReferenceError objects representing the parsing errors and/or early errors. Parsing and early error detection may be interweaved in an implementation dependent manner. If more than one parsing error or early error is present, the number and ordering of error objects in the list is implementation dependent, but at least one must be present.
    let body = EnvSourceTextParserHook(sourceText);
    // 3. If body is a List of errors, then return body.
    // TODO: ignoring this line, errors will throw
    // 4. Let requestedModules be the ModuleRequests of body.
    let requestedModules = body.ModuleRequests;
    // 5. Let importEntries be ImportEntries of body.
    let importEntries = body.ImportEntries;
    // 6. Let importedBoundNames be ImportedLocalNames(importEntries).
    let importedBoundNames = ImportedLocalNames(importEntries);
    // 7. Let indirectExportEntries be a new empty List.
    let indirectExportEntries = [];
    // 8. Let localExportEntries be a new empty List.
    let localExportEntries = [];
    // 9. Let starExportEntries be a new empty List.
    let starExportEntries = [];
    // 10. Let exportEntries be ExportEntries of body.
    let exportEntries = body.ExportEntries;
    // 11. For each record ee in exportEntries, do
    for (let ee of exportEntries) {
        // a. If ee.[[ModuleRequest]] is null, then
        if (ee['[[ModuleRequest]]'] === null) {
            // i. If ee.[[LocalName]] is not an element of importedBoundNames, then
            if (importedBoundNames.indexOf(ee['[[LocalName]]']) === -1) {
                // 1. Append ee to localExportEntries.
                localExportEntries.push(ee);
            }
            // ii. Else,
            else {
                // Let ie be the element of importEntries whose [[LocalName]] is the same as ee.[[LocalName]].
                let ie = importEntries.find((i) => i['[[LocalName]]'] === ee['[[LocalName]]']);
                // If ie.[[ImportName]] is "*", then
                if (ie['[[ImportName]]'] === '*') {
                    // Assert: this is a re-export of an imported module namespace object.
                    assert(false, 'this is a re-export of an imported module namespace object.');
                    // Append ee to localExportEntries.
                    localExportEntries.push(ee);
                }
                // Else, this is a re-export of a single name
                else {
                    // Append to indirectExportEntries the Record {[[ModuleRequest]]: ie.[[ModuleRequest]], [[ImportName]]: ie.[[ImportName]], [[LocalName]]: null, [[ExportName]]: ee.[[ExportName]] }.
                    indirectExportEntries.push({
                        '[[ModuleRequest]]': ie['[[ModuleRequest]]'],
                        '[[ImportName]]': ie['[[ImportName]]'],
                        '[[LocalName]]': null,
                        '[[ExportName]]': ee['[[ExportName]]']
                    });
                }
            }
        }
        // b. Else, if ee.[[ImportName]] is "*", then
        else if (ee['[[ImportName]]'] === '*') {
            // i. Append ee to starExportEntries.
            starExportEntries.push(ee);
        }
        // c. Else,
        else {
            // i. Append ee to indirectExportEntries.
            indirectExportEntries.push(ee);
        }
    }
    // 12. Let realm be the running execution context's Realm.
    let realm = EnvECMAScriptCurrentRealm();
    // 13. Return Source Text Module Record {[[Realm]]: realm, [[Environment]]: undefined, [[HostDefined]]: hostDefined, [[Namespace]]: undefined, [[Evaluated]]: false, [[ECMAScriptCode]]: body, [[RequestedModules]]: requestedModules, [[ImportEntries]]: importEntries, [[LocalExportEntries]]: localExportEntries, [[StarExportEntries]]: starExportEntries, [[IndirectExportEntries]]: indirectExportEntries}.
    return {
        '[[Realm]]': realm,
        '[[Environment]]': undefined,
        '[[HostDefined]]': hostDefined,
        '[[Namespace]]': undefined,
        '[[Evaluated]]': false,
        '[[ECMAScriptCode]]': body,
        '[[RequestedModules]]': requestedModules,
        '[[ImportEntries]]': importEntries,
        '[[LocalExportEntries]]': localExportEntries,
        '[[StarExportEntries]]': starExportEntries,
        '[[IndirectExportEntries]]': indirectExportEntries,
        // wiring up concrete implementations
        GetExportedNames,
        ModuleDeclarationInstantiation,
        ModuleEvaluation,
        ResolveExport,
    };
}

// 15.2.1.16.3 ResolveExport( exportName, resolveSet, exportStarSet )
export function ResolveExport(exportName, resolveSet, exportStarSet) {
    // 1. Let module be this Source Text Module Record.
    let module = this;
    // 2. For each Record {[[module]], [[exportName]]} r in resolveSet, do:
    for (let r of resolveSet) {
        // a. If module and r.[[module]] are the same Module Record and SameValue(exportName, r.[[exportName]]) is true, then
        if (module === r['[[module]]'] && exportName === r['[[exportName]]']) {
            // i. Assert: this is a circular import request.
            // TODO
            // ii. Return null.
            return null;
        }
    }
    // 2. Append the Record {[[module]]: module, [[exportName]]: exportName} to resolveSet.
    resolveSet.push({
        '[[module]]': module,
        '[[exportName]]': exportName
    });
    // 4. For each ExportEntry Record e in module.[[LocalExportEntries]], do
    for (let e of module['[[LocalExportEntries]]']) {
        // a. If SameValue(exportName, e.[[ExportName]]) is true, then
        if (exportName === e['[[ExportName]]']) {
            // i. Assert: module provides the direct binding for this export.
            // TODO:
            // ii. Return Record{[[module]]: module, [[bindingName]]: e.[[LocalName]]}.
            return {
                '[[module]]': module,
                '[[bindingName]]': e['[[LocalName]]'],
            };
        }
    }
    // 5. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (let e of module['[[IndirectExportEntries]]']) {
        // a. If SameValue(exportName, e.[[ExportName]]) is true, then
        if (exportName === e['[[ExportName]]']) {
            // i. Assert: module imports a specific binding for this export.
            // TODO:
            // ii. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
            let importedModule = HostResolveImportedModule(module, e['[[ModuleRequest]]']);
            // iii. Let indirectResolution be ? importedModule.ResolveExport(e.[[ImportName]], resolveSet, exportStarSet).
            let indirectResolution = importedModule.ResolveExport(e['[[ImportName]]'], resolveSet, exportStarSet);
            // iv. If indirectResolution is not null, return indirectResolution.
            if (indirectResolution !== null) return indirectResolution;
        }
    }
    // 6. If SameValue(exportName, "default") is true, then
    if (exportName === 'default') {
        // a. Assert: A default export was not explicitly defined by this module.
        // TODO:
        // b. Throw a SyntaxError exception.
        throw new SyntaxError();
        // c. NOTE A default export cannot be provided by an export *.
    }
    // 7. If exportStarSet contains module, return null.
    if (exportStarSet.indexOf(module) !== -1) return null;
    // 8. Append module to exportStarSet.
    exportStarSet.push(module);
    // 9. Let starResolution be null.
    let starResolution = null;
    // 10. For each ExportEntry Record e in module.[[StarExportEntries]], do
    for (let e of module['[[StarExportEntries]]']) {
        // a. Let importedModule be ? HostResolveImportedModule(module, e.[[ModuleRequest]]).
        let importedModule = HostResolveImportedModule(module, e['[[ModuleRequest]]']);
        // b. Let resolution be ? importedModule.ResolveExport(exportName, resolveSet, exportStarSet).
        let resolution = importedModule.ResolveExport(exportName, resolveSet, exportStarSet);
        // c. If resolution is "ambiguous", return "ambiguous".
        if (resolution === 'ambiguous') return 'ambiguous';
        // d. If resolution is not null, then
        if (resolution !== null) {
            // i. If starResolution is null, let starResolution be resolution.
            if (starResolution === null) starResolution = resolution;
            // ii. Else,
            else {
                // 1. Assert: there is more than one * import that includes the requested name.
                // TODO:
                // 2. If resolution.[[module]] and starResolution.[[module]] are not the same Module Record or SameValue(resolution.[[bindingName]], starResolution.[[bindingName]]) is false, return "ambiguous".
                if (resolution['[[module]]'] !== starResolution['[[module]]'] || resolution['[[bindingName]]'] !== starResolution['[[bindingName]]']) return 'ambiguous';
            }
        }
    }
    // 11. Return starResolution.
    return starResolution;
}

// 15.2.1.16.5 ModuleEvaluation()
export function ModuleEvaluation() {
    // 1. Let module be this Source Text Module Record.
    let module = this;
    // 2. Assert: ModuleDeclarationInstantiation has already been invoked on module and successfully completed.
    assert(module['[[Environment]]'] !== undefined, 'ModuleDeclarationInstantiation has already been invoked on module and successfully completed.');
    // 3. Assert: module.[[Realm]] is not undefined.
    assert(module['[[Realm]]'] !== undefined, 'module.[[Realm]] is not undefined.');
    // 4. If module.[[Evaluated]] is true, return undefined.
    if (module['[[Evaluated]]'] === true) return undefined;
    // 5. Set module.[[Evaluated]] to true.
    module['[[Evaluated]]'] = true;
    // 6. For each String required that is an element of module.[[RequestedModules]] do,
    for (let required of module['[[RequestedModules]]']) {
        // a. Let requiredModule be ? HostResolveImportedModule(module, required).
        let requiredModule = HostResolveImportedModule(module, required);
        // b. Let status be ? requiredModule.ModuleEvaluation().
        requiredModule.ModuleEvaluation();
    }
    // 7. Let moduleCxt be a new ECMAScript code execution context.
    // 8. Set the Function of moduleCxt to null.
    // 9. Set the Realm of moduleCxt to module.[[Realm]].
    // 10. Set the ScriptOrModule of moduleCxt to module.
    // 11. Assert: module has been linked and declarations in its module environment have been instantiated.
    // 12. Set the VariableEnvironment of moduleCxt to module.[[Environment]].
    // 13. Set the LexicalEnvironment of moduleCxt to module.[[Environment]].
    // 14. Suspend the currently running execution context.
    // 15. Push moduleCxt on to the execution context stack; moduleCxt is now the running execution context.
    // 16. Let result be the result of evaluating module.[[ECMAScriptCode]].
    // 17. Suspend moduleCxt and remove it from the execution context stack.
    // 18. Resume the context that is now on the top of the execution context stack as the running execution context.
    // 19. Return Completion(result).
    // TODO: diverging (step 7-19) from the spec to emitate this in javascript
    EnvECMAScriptEvaluationHook(module['[[Environment]]'], `"use strict";\n` + module['[[ECMAScriptCode]]'].ModuleCode);
    return;
}

// 15.2.1.16.4 ModuleDeclarationInstantiation()
export function ModuleDeclarationInstantiation() {
    // 1. Let module be this Source Text Module Record.
    let module = this;
    // 2. Let realm be module.[[Realm]].
    let realm = module['[[Realm]]'];
    // 3. Assert: realm is not undefined.
    assert(realm !== undefined, 'realm is not undefined.');
    // 4. Let code be module.[[ECMAScriptCode]].
    let code = module['[[ECMAScriptCode]]'];
    // 5. If module.[[Environment]] is not undefined, return NormalCompletion(empty).
    if (module['[[Environment]]'] !== undefined) return;
    // 6. Let env be NewModuleEnvironment(realm.[[globalEnv]]).
    let env = NewModuleEnvironment(realm['[[globalEnv]]']);
    // 7. Set module.[[Environment]] to env.
    module['[[Environment]]'] = env;
    // 8. For each String required that is an element of module.[[RequestedModules]] do,
    for (let required of module['[[RequestedModules]]']) {
        // a. NOTE: Before instantiating a module, all of the modules it requested must be available. An implementation may perform this test at any time prior to this point,
        // b. Let requiredModule be ? HostResolveImportedModule(module, required).
        let requiredModule = HostResolveImportedModule(module, required);
        // c. Let status be ? requiredModule.ModuleDeclarationInstantiation().
        requiredModule.ModuleDeclarationInstantiation();
    }
    // 9. For each ExportEntry Record e in module.[[IndirectExportEntries]], do
    for (let e of module['[[IndirectExportEntries]]']) {
        // a. Let resolution be ? module.ResolveExport(e.[[ExportName]], « », « »).
        let resolution = module.ResolveExport(e['[[ExportName]]'], [], []);
        // b. If resolution is null or resolution is "ambiguous", throw a SyntaxError exception.
        if (resolution === null || resolution === "ambiguous") throw new SyntaxError();
    }
    // 10. Assert: all named exports from module are resolvable.
    // 11. Let envRec be env's EnvironmentRecord.
    let envRec = env['[[EnvironmentRecord]]'];
    // 12. For each ImportEntry Record in in module.[[ImportEntries]], do
    for (let i of module['[[ImportEntries]]']) {
        // a. Let importedModule be ? HostResolveImportedModule(module, in.[[ModuleRequest]]).
        let importedModule = HostResolveImportedModule(module, i['[[ModuleRequest]]']);
        // b. If in.[[ImportName]] is "*", then
        if (i['[[ImportName]]'] === '*') {
            // i. Let namespace be ? GetModuleNamespace(importedModule).
            let namespace = GetModuleNamespace(importedModule);
            // ii. Let status be envRec.CreateImmutableBinding(in.[[LocalName]], true).
            CreateImmutableBinding.call(envRec, i['[[LocalName]]'], true);
            // iii. Assert: status is not an abrupt completion.
            // iv. Call envRec.InitializeBinding(in.[[LocalName]], namespace).
            InitializeBinding.call(envRec, i['[[LocalName]]'], namespace);
        }
        // c. Else,
        else {
            // i. Let resolution be ? importedModule.ResolveExport(in.[[ImportName]], « », « »).
            let resolution = importedModule.ResolveExport(i['[[ImportName]]'], [], []);
            // ii. If resolution is null or resolution is "ambiguous", throw a SyntaxError exception.
            if (resolution === null || resolution === "ambiguous") throw new SyntaxError();
            // iii. Call envRec.CreateImportBinding(in.[[LocalName]], resolution.[[module]], resolution.[[bindingName]]).
            CreateImportBinding.call(envRec, i['[[LocalName]]'], resolution['[[module]]'], resolution['[[bindingName]]']);
        }
    }
    // 13. Let varDeclarations be the VarScopedDeclarations of code.
    let varDeclarations = code.VarScopedDeclarations;
    // 14. Let declaredVarNames be an empty List.
    let declaredVarNames = [];
    // 15. For each element d in varDeclarations do
    for (let d of varDeclarations) {
        // a. For each element dn of the BoundNames of d
        for (let dn of d.BoundNames) {
            // i. If dn is not an element of declaredVarNames, then
            if (declaredVarNames.indexOf(dn) === -1) {
                // 1. Let status be envRec.CreateMutableBinding(dn, false).
                CreateMutableBinding.call(envRec, dn, false);
                // 2. Assert: status is not an abrupt completion.
                // TODO: ignoring assertion
                // 3. Call envRec.InitializeBinding(dn, undefined).
                InitializeBinding.call(envRec, dn, undefined);
                // 4. Append dn to declaredVarNames.
                declaredVarNames.push(dn);
            }
        }
    }
    // 16. Let lexDeclarations be the LexicallyScopedDeclarations of code.
    let lexDeclarations = code.LexicallyScopedDeclarations;
    // 17. For each element d in lexDeclarations do
    for (let d of lexDeclarations) {
        // a. For each element dn of the BoundNames of d do
        for (let dn of d.BoundNames) {
            // i. If IsConstantDeclaration of d is true, then
            if (d.IsConstantDeclaration === true) {
                // 1. Let status be envRec.CreateImmutableBinding(dn, true).
                // TODO: CreateImmutableBinding.call(envRec, dn, true);
            }
            // ii. Else,
            else {
                // 1. Let status be envRec.CreateMutableBinding(dn, false).
                CreateMutableBinding.call(envRec, dn, false);
            }
            // iii. Assert: status is not an abrupt completion.
            // TODO: diverging to ignore
            // iv. If d is a GeneratorDeclaration production or a FunctionDeclaration production, then
            if (d.GeneratorDeclaration || d.FunctionDeclaration) {
                // 1. Let fo be the result of performing InstantiateFunctionObject for d with argument env.
                // 2. Call envRec.InitializeBinding(dn, fo).
                // TODO: diverging from spec (step 1 - 2) to evaluate the function declaration in the right context
                let code = `${dn} = ${d.FunctionDeclaration};\n`;
                if (d.FunctionName && dn !== d.FunctionName) {
                    code += `${d.FunctionName} = ${dn};\n`;
                }
                EnvECMAScriptEvaluationHook(env, code);
                envRec['[[$InitializeBinding]]'].push(dn); // tracking the initialization
            }
        }
    }
    // 18. Return NormalCompletion(empty).
    return;
}
