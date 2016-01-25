// does nothing...
import {
    counter as counter2,
    increment as increment2
} from "./foo.js";

export {
    counter2 as value,
    increment2 as add
};

let fo = 1;

export function foo () {
    console.log('it works...');
    console.log('local binding fo = ', fo);
}

export default function () {
    console.log('default export');
}

export {counter as ccc} from "./foo.js";
