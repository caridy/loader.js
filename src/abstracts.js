/**
 * The GetStateValue abstract operation returns a Number value representing the
 * state.
 */
export function /*2.5.3*/ GetStateValue(state) {
    // 1. If state is the string "fetch" return 0.
    if (state === 'fetch') return 0.
    // 2. If state is the string "translate" return 1.
    if (state === 'translate') return 1.
    // 3. If state is the string "instantiate" return 2.
    if (state === 'instantiate') return 2.
    // 4. If state is the string "link" return 3.
    if (state === 'link') return 3.
    // 5. If state is the string "ready" return 4.
    if (state === 'ready') return 4.
}

/**
 * The SetStateToMax abstract operation to reset the internal state of an
 * entry to the maximum state between the current state and the provided
 * newState.
 */
export function /*2.5.4*/ SetStateToMax(entry, newState) {
    // 1. Let state be entry.[[State]].
    let state = entry['[[State]]'];
    // 2. Let stateValue be GetStateValue(state).
    let stateValue = GetStateValue(state);
    // 3. Let newStateValue be GetStateValue(newState).
    let newStateValue = GetStateValue(newState);
    // 4. If newStateValue is larger than stateValue, set entry.[[State]] to newState.
    if (newStateValue > stateValue) entry['[[State]]'] = newState;
}

export function GetMethod() {

}

export function ModuleEvaluation() {

}

export function SimpleDefine() {

}
