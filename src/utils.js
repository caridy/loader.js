/*
Utility methods to deal with promises in the spec. Specifically,
these 3 methods allow us to create promises as internal slots
while resolving those promises in another abtract operation by
keeping an internal slot for resolver and rejecter. E.g.:

    // when creating the internal slot
    obj.['[[InternalSlot]]'] = createPromiseSlot();

    // then in another method, resolve it with
    resolvePromiseSlot(obj.['[[InternalSlot]]'], withThisValue);

*/
const PromiseSlotResolver = Symbol();
const PromiseSlotRejecter = Symbol();
const PromiseSlotResolvedOrRejected = Symbol();

export function resolvePromise(p, value) {
    assert(PromiseSlotResolvedOrRejected in p, 'extra: only promise we create can be inspected');
    p[PromiseSlotResolver](value);
}

export function rejectPromise(p, error) {
    assert(PromiseSlotResolvedOrRejected in p, 'extra: only promise we create can be inspected');
    p[PromiseSlotRejecter](error);
}

export function transformPromise(p) {
    if (p && PromiseSlotResolvedOrRejected in p) return p; // optimization
    let resolve;
    let reject;
    let result = new Promise(function (resolveFn, rejectFn) {
        resolve = resolveFn;
        reject = rejectFn;
    });
    let then = result.then;
    result[PromiseSlotResolver] = resolve;
    result[PromiseSlotRejecter] = reject;
    result[PromiseSlotResolvedOrRejected] = false;
    result.then = (resolve, reject) => transformPromise(then.call(result, resolve, reject));
    Promise.resolve(p).then((value) => {
        result[PromiseSlotResolvedOrRejected] = true;
        return resolve(value);
    }, (error) => {
        result[PromiseSlotResolvedOrRejected] = true;
        return reject(error);
    });
    return result;
}

export function isPromiseResolved(p) {
    assert(PromiseSlotResolvedOrRejected in p, 'extra: only promise we create can be inspected');
    return p[PromiseSlotResolvedOrRejected];
}

export function resolvedPromise(value) {
    return tranformPromise(Promise.resolve(value));
}

export function rejectedPromise(error) {
    return transformPromise(Promise.rejected(error));
}

/*
Promise abstract operation for "the result of promise-calling f(value)".

Details here:
https://www.w3.org/2001/tag/doc/promises-guide#shorthand-promise-calling
*/
export function promiseCall(f, ...args) {
    try {
        return Promise.resolve(f(...args));
    } catch (e) {
        return Promise.reject(e);
    }
}

export function assert(value, message) {
    if (!value) {
        throw new Error('Assertion: ' + (message || 'Loader Spec Error'));
    }
}

export function HowToDoThis(algo, step) {
    if (!algo) {
        throw new Error('HowToDoThis(algo, step) is missing the `algo` argument');
    }
    if (!step) {
        throw new Error('HowToDoThis(algo, step) is missing the `step` argument');
    }
    console.log(`TODO: algo [${algo}], step: ${step}`);
}

export function Record(o) {
    for (let name in o) {
        Object.defineProperty(o, name, {
            enumerable: false,
        });
    }
    return o;
}
