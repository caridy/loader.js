import './patches.js';

import Loader from "./3.loader.js";
import BrowserLoader from './loader-browser.js';
import Module from "./8.module.js";
import ModuleStatus from "./5.module-status.js";

if (!Reflect.Loader) Reflect.Loader = Loader;
if (!Reflect.Module) Reflect.Module = Module;
if (!Reflect.Module.ModuleStatus) Reflect.Module.ModuleStatus = ModuleStatus;
let loaderPolyfill = new BrowserLoader();
if (!System.loader) System.loader = loaderPolyfill;

export default loaderPolyfill;

// the default loader in a browser should search for any `<script type="module"></script>`
// in the current document, and act accordingly. it should also observe mutations
// to identify new script tags with `type="module"` to handle them accordingly.


// <script type="module"> support

if (typeof document !== 'undefined' && document.getElementsByTagName) {
    var curScript = document.getElementsByTagName('script');
    curScript = curScript[curScript.length - 1];

    function completed() {
        document.removeEventListener('DOMContentLoaded', completed, false);
        window.removeEventListener('load', completed, false);
        ready();
    }

    function ready() {
        var scripts = document.getElementsByTagName('script');
        var anonCnt = 0;
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.type === 'module') {
                var url = script.src;

                // <script type="module" src="file.js"></script>
                if (url) {
                    System.load(url, 'ready');
                }

                // <script type="module">import "x"</script>
                else {
                    System.provide('anon' + ++anonCnt, 'fetch', script.innerHTML.substr(1));
                    System.load('anon' + anonCnt, 'ready');
                }
            }
        }
    }

    // DOM ready, taken from https://github.com/jquery/jquery/blob/master/src/core/ready.js#L63
    if (document.readyState === 'complete') {
        setTimeout(ready);
    } else if (document.addEventListener) {
        document.addEventListener('DOMContentLoaded', completed, false);
        window.addEventListener('load', completed, false);
    }
}
