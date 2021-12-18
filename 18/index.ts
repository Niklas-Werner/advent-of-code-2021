import { isArray } from '@nw55/common';
import { dayLogger, runDay } from '../utils';

type SNum = number | SNumPair;
type SNumPair = [SNum, SNum];

runDay(__dirname, {}, input => {

    const numbers = input.map<SNum>(line => JSON.parse(line));

    let sum = numbers[0];
    dayLogger.debug('  ' + JSON.stringify(sum));
    for (let i = 1; i < numbers.length; i++) {
        dayLogger.debug('+ ' + JSON.stringify(numbers[i]));
        sum = add(sum, numbers[i]);
        dayLogger.debug('= ' + JSON.stringify(sum));
    }
    const result1 = magnitude(sum);
    dayLogger.info('Result 1: ' + result1);

    let result2 = 0;
    for (const a of numbers) {
        for (const b of numbers) {
            if (a === b)
                continue;
            const sum = add(a, b);
            const mag = magnitude(sum);
            if (mag > result2)
                result2 = mag;
        }
    }
    dayLogger.info('Result 2: ' + result2);

});

function add(a: SNum, b: SNum): SNum {
    return reduce([a, b]);
}

function reduce(a: SNumPair) {
    let result = JSON.parse(JSON.stringify(a));
    while (true) {
        const state: ExplodeState = { lastNumPair: null, lastNumIndex: 0, rightValue: -1, done: false };
        explode(result, 1, state);
        if (state.rightValue >= 0)
            continue;
        if (split(result))
            continue;
        break;
    }
    return result;
}

type ExplodeState = { lastNumPair: SNumPair | null; lastNumIndex: 0 | 1; rightValue: number; done: boolean; };
function explode(a: SNumPair, depth: number, state: ExplodeState) {
    for (const i of [0, 1] as const) {
        const next = a[i];
        if (state.done)
            break;
        if (isArray(next)) {
            if (depth === 4 && state.rightValue < 0) {
                const [left, right] = next;
                if (isArray(left) || isArray(right))
                    throw new Error();
                if (state.lastNumPair !== null)
                    (state.lastNumPair[state.lastNumIndex] as number) += left;
                state.rightValue = right;
                a[i] = 0;
            }
            else {
                explode(next, depth + 1, state);
            }
        }
        else {
            if (state.rightValue >= 0) {
                a[i] = next + state.rightValue;
                state.done = true;
            }
            else {
                state.lastNumPair = a;
                state.lastNumIndex = i;
            }
        }
    }
}

function split(a: SNumPair): boolean {
    for (const i of [0, 1] as const) {
        const next = a[i];
        if (isArray(next)) {
            if (split(next))
                return true;
        }
        else if (next >= 10) {
            const left = Math.floor(next / 2);
            const right = next - left;
            a[i] = [left, right];
            return true;
        }
    }
    return false;
}

function magnitude(a: SNum): number {
    if (!isArray(a))
        return a;
    return 3 * magnitude(a[0]) + 2 * magnitude(a[1]);
}
