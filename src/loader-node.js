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

export default class Loader extends ReflectLoader {

    constructor() {
        super();

        let registry = this.registry;

        // resolve hook
        this[ReflectLoader.resolve] = (name, referrer) => {
            if (referrer) {
                referrer = { filename: referrer, id: referrer };
            } else if (registry.has(name)) {
                return name;
            }
            return nodeModule._resolveFilename(name, referrer || MainModule);
        };

        // fetch hook
        this[ReflectLoader.fetch] = (entry, key) => {
            // only reading file from disk if the module is identified as es6 module
            // TODO: improve detection, for now just using a filename token match
            return  (key.indexOf('es6') !== -1 ? readFileSync(key, 'utf8') : undefined);
        };

        // translate hook
        this[ReflectLoader.translate] = (entry, payload) => {
            // dummy translation to string.
            return payload && payload.toString();
        };

        // instantiate hook
        this[ReflectLoader.instantiate] = (entry, source) => {
            if (source) {
                // return no instance, in which case an instance of source text
                // module record will be created
                return undefined;
            } else {
                // cjs module or native node module, we should run in back-compat mode
                return createReflectiveModuleRecordFromEntry(entry);
            }
        };

    }

}
/*

* ES Modules can invoke require() as a normal global from the runtime, does require calls will work sync as they do in node today
* ES Modules can import a CJS module.
* Resolve will delegate to npm resolution logic but it should take into consideration package.json esnext:main to detect whether or not the imported module is ES Module
* For non-ES Modules fetch does nothing.
* For non-ES Modules translate does nothing
* For non-ES Module instantiate just create a new dynamic module which mutator that extends the cached `export` with a bunch of getters and setters.
* For ES Modules fetch reads file from disk to produce the payload.
* For ES Modules translate does nothing.
* For ES Modules instantiate does nothing, which means a new source text module record will be created internally from the `payload` produced by fetch hook.
* Only CJS modules imported by an ES6 module will make it into the loader registry.

*/
