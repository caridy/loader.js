import './patches.js';

import Loader from "./loader.js";
import BrowserLoader from './loader-browser.js';
import Module from "./module.js";
import ModuleStatus from "./module-status.js";

if (!Reflect.Loader) Reflect.Loader = Loader;
if (!Reflect.Module) Reflect.Module = Module;
if (!Reflect.Module.ModuleStatus) Reflect.Module.ModuleStatus = ModuleStatus;
let loaderPolyfill = new BrowserLoader();
if (!System.loader) System.loader = loaderPolyfill;

export default loaderPolyfill;
