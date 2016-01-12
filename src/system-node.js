import './patches.js';

import Loader from "./3.loader.js";
import NodeLoader from './loader-node.js';
import Module from "./8.module.js";
import ModuleStatus from "./5.module-status.js";

if (!Reflect.Loader) Reflect.Loader = Loader;
if (!Reflect.Module) Reflect.Module = Module;
if (!Reflect.Module.ModuleStatus) Reflect.Module.ModuleStatus = ModuleStatus;
let loaderPolyfill = new NodeLoader();

if (!System.loader) System.loader = loaderPolyfill;

export default loaderPolyfill;

// the default loader in node should tap into node's require hooks to inject any
// node module into the loader registry.


/*
From this point on, we take the liberty to do implementation specific routines
to accomodate the loader.
*/
import {
    transform
}
from "babel-core";

global.EnvSourceTextParserHook = (source) => {
    let ast = transform(source, {
        plugins: [function() {
            return {
                visitor: {
                    ImportDeclaration(path) {
                        path.remove();
                    },
                    ExportNamedDeclaration(path) {
                        if (path.node.declaration) {
                            path.replaceWith(path.node.declaration);
                        } else {
                            path.remove();
                        }
                    },
                    ExportAllDeclaration(path) {
                        path.remove();
                    },
                    ExportDefaultDeclaration() {
                        throw new Error('TODO');
                    }
                }
            };
        }]
    });
    let {
        imports,
        exports: {
            specifiers: exports
        },
    } = ast.metadata.modules;
    let ModuleRequests = [];
    let ImportEntries = [];
    let ExportEntries = [];
    let ModuleCode = ast.code;
    imports.forEach((i) => {
        if (i.source && ModuleRequests.indexOf(i.source) === -1) {
            ModuleRequests.push(i.source);
        }
        i.specifiers.forEach((s) => {
            ImportEntries.push({
                '[[ModuleRequest]]': i.source || null,
                '[[LocalName]]': s.local,
                '[[ImportName]]': s.imported,
            });
        });
    });
    exports.forEach((e) => {
        if (e.source) {
            if (ModuleRequests.indexOf(e.source) === -1) {
                ModuleRequests.push(e.source);
            }
            ExportEntries.push({
                '[[ModuleRequest]]': e.source,
                '[[LocalName]]': undefined,
                '[[ExportName]]': e.exported,
                '[[ImportName]]': e.kind === 'external-all' ? '*' : e.local,
            });
        } else {
            ExportEntries.push({
                '[[ModuleRequest]]': null,
                '[[LocalName]]': e.local,
                '[[ExportName]]': e.exported,
                '[[ImportName]]': undefined,
            });
        }
    });
    let VarScopedDeclarations = [];
    let LexicallyScopedDeclarations = [];
    return {
        ModuleCode,
        ModuleRequests,
        ImportEntries,
        ExportEntries,
        VarScopedDeclarations,
        LexicallyScopedDeclarations,
    };
};

global.EnvECMAScriptEvaluationHook = (cxt, code) => {

};
