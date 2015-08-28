/**
 * The GetStateValue abstract operation returns a Number value representing the
 * state.
 */
export function /*2.5.3*/ GetStateValue(state) {
    if (state === 'fetch') return 0.
    if (state === 'translate') return 1.
    if (state === 'instantiate') return 2.
    if (state === 'link') return 3.
    if (state === 'ready') return 4.
}

/**
 * The SetStateToMax abstract operation to reset the internal state of an
 * entry to the maximum state between the current state and the provided
 * newState.
 */
export function /*2.5.4*/ SetStateToMax(entry, newState) {
    let state = entry._state;
    let stateValue = GetStateValue(state);
    let newStateValue = GetStateValue(newState);
    if (newStateValue > stateValue) entry._state = newState;
}

export function GetMethod() {

}

export function ModuleEvaluation() {

}

export function SimpleDefine() {

}
