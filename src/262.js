// TODO: remove helpers
import {
    HowToDoThis,
    assert,
} from './utils.js';

import {
    HostResolveImportedModule,
} from './7.linking.js';

import {
    ResolveExport,
} from './8.module.js';


export function OrdinaryCreateFromConstructor (constructor, intrinsicDefaultProto, internalSlotsList) {
    // 1. Assert: intrinsicDefaultProto is a String value that is this specification's name of an intrinsic object. The corresponding object must be an intrinsic that is intended to be used as the [[Prototype]] value of an object.
    // 2. Let proto be ? GetPrototypeFromConstructor(constructor, intrinsicDefaultProto).
    let proto = constructor.prototype;
    // 3. Return ObjectCreate(proto, internalSlotsList).
    return Object.create(proto, internalSlotsList.reduce((descriptors, internalSlot) => {
        descriptors[internalSlot] = { writable: true, configurable: false, value: undefined };
        return descriptors;
    }, {}));
}

// 7.1.12 ToString ( argument )
export function ToString(value) {
    // relying on the underlaying implementation
    return typeof value === 'string' ? value : value + '';
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
        let exportedNames = GetExportedNames.call(module);
        // b. Let unambiguousNames be a new empty List.
        let unambiguousNames = [];
        // c. For each name that is an element of exportedNames,
        for (var name in exportedNames) {
            // i. Let resolution be ? module.ResolveExport(name, « », « »).
            let resolution = ResolveExport.call(module, name);
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
        let starNames = GetExportedNames.call(requestedModule, exportStarSet);
        // c. For each element n of starNames, do
        for (let n of startNames) {
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
    // 3. Set env's EnvironmentRecord to be envRec.
    env['[[EnvironmentRecord]]'] = envRec;
    // 4. Set the outer lexical environment reference of env to E.
    env['outer lexical environment'] = E;
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
        // 9.4.6 Module Namespace Exotic Objects
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
        M['[[Enumerate]]'] = function () {
            // Let exports be the value of O's [[Exports]] internal slot.
            let exports = this['[[Exports]]'];
            // Return CreateListIterator(exports).
            return [].concat(exports);
        };
        // [[OwnPropertyKeys]] ( )
        // Unfortunately, none of these can be implemented in user-land in a polyfill.
        // In the case of [[Enumerate]], since it will be used by step 8, we defined
        // it anyways.
    };
    // 6. Set M's [[Module]] internal slot to module.
    M['[[Module]]'] = module;
    // 7. Set M's [[Exports]] internal slot to exports.
    M['[[Exports]]'] = exports;

    // 8. Create own properties of M corresponding to the definitions in 26.3.
    // - 262 spec expando:
    {
        // http://tc39.github.io/ecma262/#sec-module-namespace-objects
        // 26.3 Module Namespace Objects
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
export function CreateMutableBinding (N, D) {
    // 1. Let envRec be the declarative Environment Record for which the method was invoked.
    let envRec = this;
    // 2. Assert: envRec does not already have a binding for N.
    assert(Object.getOwnPropertyDescriptor(envRec, N) === undefined, 'envRec does not already have a binding for N.');
    // 3. Create a mutable binding in envRec for N and record that it is uninitialized. If D is true record that the newly created binding may be deleted by a subsequent DeleteBinding call.
    Object.defineProperty(envRec, N, {
        configurable: true
    });
    // 4. Return NormalCompletion(empty).
    return;
}
