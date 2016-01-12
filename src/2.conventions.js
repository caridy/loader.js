import {
    transformPromise,
} from "./utils.js";

// 2. Conventions

// 2.3. Promises

// 2.3.1. Reacting to Promises
export function PassThroughPromise(p) {
    // 1. Transforming p with a fulfillment handler that, when called with argument value, returns value.
    return transformPromise(Promise.resolve(p));
}

// 2.5. Common Operations

// 2.5.1. CreateObject()
export function ObjectCreate() {
    throw new Error('TODO');
    // 1. Let obj be ObjectCreate(%ObjectPrototype%).
    // 2. Return obj.
}

// 2.5.2. SimpleDefine(obj, name, value)
export function SimpleDefine(obj, name, value) {
    throw new Error('TODO: ' + value);
    // 1. Let desc be a new PropertyDescriptor record {[[Value]]: value, [[Writable]]: true, [[Enumerable]]: true, [[Configurable]]: true}.
    // 2. Return ? OrdinaryDefineOwnProperty(obj, name, desc).
}
