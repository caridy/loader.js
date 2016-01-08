import ReflectLoader from "./3.loader.js";
import {
    Module as nodeModule,
} from "module";

import {
    readFileSync,
} from "fs";

const MainModule = process.mainModule;

function createReflectiveModuleRecordFromEntry(entry) {
    let exports = require(entry['[[Key]]']);
    let exportDescriptors = {};
    for (let name in exports) {
        let desc = {
            value: exports[name]
        };
        let nameDesc = Object.getOwnPropertyDescriptor(exports, name);
        if (!nameDesc.configurable || !nameDesc.writable) {
            desc.const = true;
        }
        exportDescriptors[name] = desc;
    }
    return new Reflect.Module(exportDescriptors, (mutator) => {
        for (let name in exportDescriptors) {
            if (!exportDescriptors[name].const) {
                mutator[name] = exports[name];
                Object.defineProperty(exports, name, {
                    get: () => mutator[name],
                    set: (value) => mutator[name] = value,
                    configurable: false
                });
            }
        }
    }, () => {});
}

function createSourceTextModuleRecordFromEntry(entry) {
    throw new Error('TODO');
}

export default class Loader extends ReflectLoader {

    constructor() {
        super();

        let registry = this.registry;

        // resolve hook
        this[ReflectLoader.resolve] = (name, referrer) => {
            if (referrer) {
                referrer = { filename: referrer };
            } else if (registry.has(name)) {
                return name;
            }
            return nodeModule._resolveFilename(name, referrer || MainModule);
        };

        // fetch hook
        this[ReflectLoader.fetch] = (entry, key) => {
            // TODO: ignore native node modules
            // TODO: ignore cjs modules
            return false && fs.readFileSync(key, 'utf8');
        };

        // translate hook
        this[ReflectLoader.translate] = (entry, payload) => {
            // TODO: ignore native node modules
            // TODO: ignore cjs modules
            return payload && payload.toString();
        };

        // instantiate hook
        this[ReflectLoader.instantiate] = (entry, source) => {
            if (source) {
                // es module, we should create a source text module record
                return createSourceTextModuleRecordFromEntry(entry, source);
            } else {
                // cjs module or native node module, we should run in back-compat mode
                return createReflectiveModuleRecordFromEntry(entry);
            }
        };

    }

}
/*

* If module doesn't have a referrer, it is a top Module and should be considered an ES Module
* ES Modules can invoke require() as a normal global from the runtime, does require calls will work sync as they do in node today
* ES Modules can import a CJS module.
* Resolve will delegate to npm resolution logic but it should take into consideration package.json esnext:main to detect whether or not the imported module is ES Module
* For non-ES Modules fetch will run the underlaying sync mechanism
* For non-ES Modules translate does nothing
* For non-ES Module instantiate just create a new dynamic module which mutator extends the cached `export` with a bunch of getters and setters.
* For ES Modules fetch reads the file from disk.
* For ES Modules translate does transformations and store some metadata about the internals of the source text
* For ES Modules instantiate create a new source text module record
* Only CJS modules imported by an ES6 module will make it into the loader registry.

*/
