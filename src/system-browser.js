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
