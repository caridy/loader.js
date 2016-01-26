const BASE_PATHNAME = window.location.pathname;
const BASE_ORIGIN = window.location.origin;
const ES6_MODULE_DETECTION_REGEXP = /\.jsm$/;
const PROTOCOL_DETECTION_REGEXP = /^(https?:)?\/\//;

import ReflectLoader from "./3.loader.js";

function normalizeName(child, parentBase) {
    if (PROTOCOL_DETECTION_REGEXP.test(child) === true) {
        return child;
    }
    if (child.charAt(0) === '/') {
        child = parentBase.slice(0, 3).join('/') + child;
    }
    if (child.charAt(0) !== '.') {
        return parentBase.concat(child).join('/');
    }
    let parts = child.split('/');
    while (parts[0] === '.' || parts[0] === '..') {
        if (parts.shift() === '..' && parentBase.length > 3) {
            parentBase.pop();
        }
    }
    return parentBase.concat(parts).join('/');
}

export default class Loader extends ReflectLoader {
    constructor() {
        super();

        // resolve hook
        this[ReflectLoader.resolve] = (name, referrer) => {
            if (!referrer || referrer === 'anonymous') {
                referrer = BASE_ORIGIN + BASE_PATHNAME;
            }
            return normalizeName(name, referrer.split('/').slice(0, -1));
        };

        // fetch hook
        this[ReflectLoader.fetch] = (entry, key) => {
            // only fetch module over the network if it is identified as es6 module
            // TODO: improve detection, for now just using a filename token match
            return  (ES6_MODULE_DETECTION_REGEXP.test(key) === true ? fetch(key).then((response) => response.text()) : undefined);
        };

        // translate hook
        this[ReflectLoader.translate] = (entry, payload) => {
            // dummy translation to string.
            return payload && payload.toString();
        };

        // instantiate hook
        this[ReflectLoader.instantiate] = (/* entry, source */) => {
            // return no instance, in which case an instance of source text
            // module record will be created
            return undefined;
        };

    }
}
