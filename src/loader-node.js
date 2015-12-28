import LoaderBase from "./3.loader.js";

export default class Loader extends LoaderBase {
    constructor() {
        super();
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
