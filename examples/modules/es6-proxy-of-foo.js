// does nothing...
import {
    counter as counter2,
    increment as increment2
} from "./foo.js";

export {
    counter2 as value,
    increment2 as add
};

export function foo () {
    console.log('it works...');
}

export {counter as ccc} from "./foo.js";
