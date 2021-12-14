import { MultiKeyMap } from '@nw55/common';
import { dayLogger, runDay, splitOnce } from '../utils';

runDay(__dirname, { blankLines: 'group' }, input => {

    const polymer = input[0][0];
    const insertions = Object.fromEntries(input[1].map(splitOnce(' -> ')));

    const cache = new MultiKeyMap<string, number, Record<string, number>>();

    function runPart(steps: number) {
        const finalCounts = { [polymer.charAt(0)]: 1 };
        for (let i = 1; i < polymer.length; i++) {
            const insertCounts = getInsertionCountsAfterSteps(polymer.slice(i - 1, i + 1), steps, insertions, cache);
            addTo(finalCounts, insertCounts);
            addTo(finalCounts, { [polymer.charAt(i)]: 1 });
        }
        dayLogger.debug('finalCounts', finalCounts);

        const countValues = Object.values(finalCounts);
        const min = Math.min(...countValues);
        const max = Math.max(...countValues);
        dayLogger.debug('min/max', { min, max });
        return max - min;
    }

    const result1 = runPart(10);
    dayLogger.info('Result 1: ' + result1);

    const result2 = runPart(40);
    dayLogger.info('Result 2: ' + result2);

});

function getInsertionCountsAfterSteps(pair: string, steps: number, insertions: Record<string, string>, cache: MultiKeyMap<string, number, Record<string, number>>): Record<string, number> {
    if (steps === 0)
        return {};

    const cachedResult = cache.get(pair, steps);
    if (cachedResult !== undefined)
        return cachedResult;

    const left = pair.charAt(0);
    const right = pair.charAt(1);
    const mid = insertions[pair];
    if (!mid)
        throw new Error();

    const leftResult = getInsertionCountsAfterSteps(left + mid, steps - 1, insertions, cache);
    const rightResult = getInsertionCountsAfterSteps(mid + right, steps - 1, insertions, cache);

    const result = { [mid]: 1 };
    addTo(result, leftResult);
    addTo(result, rightResult);
    cache.set(pair, steps, result);
    return result;
}

function addTo(target: Record<string, number>, values: Record<string, number>) {
    for (const [key, value] of Object.entries(values))
        target[key] = (target[key] ?? 0) + value;
}
