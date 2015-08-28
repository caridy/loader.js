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
export function createPromiseSlot() {
    let resolve;
    let reject;
    let p = new Promise(function (resolveFn, reject) {
        resolve = resolveFn;
        reject = rejectFn;
    });
    p[PromiseSlotResolver] = resolve;
    p[PromiseSlotRejecter] = reject;
    return p;
}

export function resolvePromiseSlot(p, value) {
    p[PromiseSlotResolver](value);
}

export function rejectPromiseSlot(p, error) {
    p[PromiseSlotRejecter](error);
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
