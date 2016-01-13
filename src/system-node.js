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

import {
    Script,
    createContext,
} from "vm";

global.EnvSourceTextParserHook = (source) => {
    let VarScopedDeclarations = [];
    let LexicallyScopedDeclarations = [];
    let ModuleRequests = [];
    let ImportEntries = [];
    let ExportEntries = [];
    let ast = transform(source, {
        plugins: [function() {
            return {
                visitor: {
                    ImportDeclaration(path) {
                        path.remove();
                    },
                    ExportNamedDeclaration(path) {
                        if (path.node.declaration && path.node.declaration.type !== 'FunctionDeclaration') {
                            path.replaceWith(path.node.declaration);
                        } else {
                            path.remove();
                        }
                    },
                    ExportAllDeclaration(path) {
                        path.remove();
                    },
                    ExportDefaultDeclaration(path) {
                        let declaration = path.node.declaration;
                        if (declaration && declaration.type === 'FunctionDeclaration' && !declaration.id) {
                            path.remove();
                            LexicallyScopedDeclarations.push({
                                BoundNames: ['$default$'],
                                IsConstantDeclaration: true,
                                FunctionDeclaration: source.slice(declaration.start, declaration.end),
                                FunctionName: undefined,
                            });
                            // TODO: this solves the issue that export default function () {} doesn't appear in metadata.modules.exports
                            ExportEntries.push({
                                '[[ModuleRequest]]': null,
                                '[[LocalName]]': '$default$',
                                '[[ExportName]]': 'default',
                                '[[ImportName]]': undefined,
                            });
                        } else {
                            path.replaceWith(path.node.declaration);
                        }
                    },
                    Program(path) {
                        const all = path.scope.getAllBindings();
                        for (let name in all) {
                            const d = all[name];
                            const parent = d.path.parent;
                            if (d.kind === 'hoisted' && (parent.type === 'ExportNamedDeclaration' || parent.type === 'ExportDefaultDeclaration')) {
                                let fn = parent.declaration;
                                LexicallyScopedDeclarations.push({
                                    BoundNames: [name],
                                    IsConstantDeclaration: !!d.constant,
                                    FunctionDeclaration: source.slice(fn.start, fn.end),
                                    FunctionName: fn.id.name,
                                });
                            }
                        }
                        const vars = path.scope.getAllBindingsOfKind("var");
                        const lets = path.scope.getAllBindingsOfKind("let");
                        if (vars.length > 0) {
                            VarScopedDeclarations.push({
                                BoundNames: vars,
                            });
                        }
                        if (lets.length > 0) {
                            VarScopedDeclarations.push({
                                BoundNames: lets,
                            });
                        }
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
    return {
        ModuleCode,
        ModuleRequests,
        ImportEntries,
        ExportEntries,
        VarScopedDeclarations,
        LexicallyScopedDeclarations,
    };
};

global.EnvECMAScriptEvaluationHook = (env, code) => {
    const script = new Script(code);
    if (!env.nodeExecutionContext) {
        env.nodeExecutionContext = new createContext(env['[[EnvironmentRecord]]']);
    }
    script.runInContext(env.nodeExecutionContext);
};

global.EnvECMAScriptCurrentRealm = () => {
    return {
        '[[globalEnv]]': global
    };
};
