import './patches.js';

import BrowserLoader from './loader-browser.js';
import Module from "./module.js";
import Loader from "./loader.js";

Reflect.Module = Module;
Reflect.Loader = Loader;
System.loader  = new BrowserLoader();

export default System;
