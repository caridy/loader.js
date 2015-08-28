import './patches.js';

import NodeLoader from './loader-node.js';
import Module from "./module.js";
import Loader from "./loader.js";

Reflect.Module = Module;
Reflect.Loader = Loader;
System.loader  = new NodeLoader();

export default System;
