import { MultiMap, TwoWayMap } from '@nw55/common';
import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const result1 = input
        .flatMap(line => line.split('|')[1].trim().split(' '))
        .filter(digit => digit.length <= 4 || digit.length === 7)
        .length;

    dayLogger.info('Result 1: ' + result1);

    let result2 = 0;
    for (const line of input) {
        const [patterns, outputs] = line.split('|').map(x => x.trim().split(' '));
        const value = decode(patterns, outputs);
        dayLogger.debug('Value: ' + value);
        result2 += value;
    }

    dayLogger.info('Result 2: ' + result2);

});

const digitValueMapping = new TwoWayMap([
    [0, 'abcefg'],
    [1, 'cf'],
    [2, 'acdeg'],
    [3, 'acdfg'],
    [4, 'bcdf'],
    [5, 'abdfg'],
    [6, 'abdefg'],
    [7, 'acf'],
    [8, 'abcdefg'],
    [9, 'abcdfg']
]);

const digitsByLength = new MultiMap([...digitValueMapping.values()].map(pattern => [pattern.length, pattern]));

function decode(patterns: string[], outputs: string[]) {
    patterns.sort((a, b) => a.length - b.length);
    const segmentMapping = decode2(patterns, 0, 0, {}, {});
    if (segmentMapping === null)
        throw new Error();

    let value = 0;
    for (const output of outputs) {
        const digit = [...output].map(segment => segmentMapping[segment]).sort().join('');
        const digitValue = digitValueMapping.getKey(digit)!;
        dayLogger.debug('Digit', { output, digit, digitValue });
        value *= 10;
        value += digitValue;
    }

    return value;
}

function decode2(digits: string[], digitIndex: number, segmentIndex: number, digitMapping: Record<string, string>, segmentMapping: Record<string, string>): Record<string, string> | null {
    if (digitIndex === digits.length)
        return Object.keys(segmentMapping).length === 7 ? segmentMapping : null;

    const digit = digits[digitIndex];

    if (segmentIndex === digit.length)
        return decode2(digits, digitIndex + 1, 0, digitMapping, segmentMapping);

    const segment = digit.charAt(segmentIndex);

    for (const matchingDigit of digitsByLength.get(digit.length)) {
        if (digitMapping[digit] !== matchingDigit) {
            if (Object.values(digitMapping).includes(matchingDigit))
                continue;
            if (digitMapping[digit] !== undefined)
                continue;
        }
        const newDigitMapping = { ...digitMapping, [digit]: matchingDigit };
        for (const matchingSegment of matchingDigit) {
            if (segmentMapping[segment] !== matchingSegment) {
                if (Object.values(segmentMapping).includes(matchingSegment))
                    continue;
                if (segmentMapping[segment] !== undefined)
                    continue;
            }
            const newSegmentMapping = { ...segmentMapping, [segment]: matchingSegment };
            const result = decode2(digits, digitIndex, segmentIndex + 1, newDigitMapping, newSegmentMapping);
            if (result !== null)
                return result;
        }
    }

    return null;
}
