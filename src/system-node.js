import './patches.js';

import Loader from "./loader.js";
import NodeLoader from './loader-node.js';
import Module from "./module.js";
import ModuleStatus from "./module-status.js";

if (!Reflect.Loader) Reflect.Loader = Loader;
if (!Reflect.Module) Reflect.Module = Module;
if (!Reflect.Module.ModuleStatus) Reflect.Module.ModuleStatus = ModuleStatus;
let loaderPolyfill = new NodeLoader();
if (!System.loader) System.loader = loaderPolyfill;

export default loaderPolyfill;
