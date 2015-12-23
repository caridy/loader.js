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
