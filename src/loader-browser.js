const DEFAULT_REFERRER = window.location.href;
const ES6_MODULE_DETECTION_REGEXP = /\.jsm$/;

import ReflectLoader from "./3.loader.js";

/*
  normalizeName() is inspired by Ember's loader:
  https://github.com/emberjs/ember.js/blob/0591740685ee2c444f2cfdbcebad0bebd89d1303/packages/loader/lib/main.js#L39-L53
 */
function normalizeName(child, parentBase) {
    if (child.charAt(0) === '/') {
        child = child.slice(1);
    }
    if (child.charAt(0) !== '.') {
        return child;
    }
    var parts = child.split('/');
    while (parts[0] === '.' || parts[0] === '..') {
        if (parts.shift() === '..') {
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
            if (!referrer) {
                referrer = DEFAULT_REFERRER;
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
