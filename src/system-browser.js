import './patches.js';
import './env-browser';

import Loader from "./3.loader.js";
import BrowserLoader from './loader-browser.js';
import Module from "./8.module.js";
import ModuleStatus from "./5.module-status.js";

import {
    EnsureEvaluated,
} from './7.linking.js';
import {
    LoadModule,
} from './5.module-status.js';

if (!Reflect.Loader) Reflect.Loader = Loader;
if (!Reflect.Module) Reflect.Module = Module;
if (!Reflect.Module.ModuleStatus) Reflect.Module.ModuleStatus = ModuleStatus;
let loaderPolyfill = new BrowserLoader();
if (!System.loader) System.loader = loaderPolyfill;

export default loaderPolyfill;

// detecting whether the polyfill is needed or not
if (System.loader === loaderPolyfill) {
    // the default loader in a browser should search for any `<script type="module"></script>`
    // in the current document, and act accordingly.
    // TODO: it should also observe mutations to identify new script tags with
    //       `type="module"` to handle them accordingly.

    function completed() {
        document.removeEventListener('DOMContentLoaded', completed, false);
        window.removeEventListener('load', completed, false);
        ready();
    }

    function ready() {
        const scripts = [...document.getElementsByTagName('script')];
        const loader = System.loader;
        for (let i = 0; i < scripts.length; i++) {
            let script = scripts[i];
            if (script.type === 'module') {
                const url = script.src;

                // <script type="module" src="file.js"></script>
                if (url) {
                    loader.import(url);
                }
                // <script type="module">import "x"</script>
                else {
                    let source = script.innerHTML.toString();
                    let entry = new ModuleStatus(loader, 'anonymous');
                    entry.resolve('fetch', source);
                    LoadModule(entry, "instantiate").then(() => {
                        return EnsureEvaluated(entry);
                    }).catch((error) => {
                        console.error(error);
                    });
                }

                // removing the script from the DOM
                script.parentNode.removeChild(script);
            }
        }
    }

    if (document.readyState === 'complete') {
        Promise.resolve().then(ready); // in the next turn
    } else {
        document.addEventListener('DOMContentLoaded', completed, false);
        window.addEventListener('load', completed, false);
    }
}
