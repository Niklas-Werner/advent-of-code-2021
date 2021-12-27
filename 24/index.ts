import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const parameters: [A: number, B: number, D: boolean][] = [
       /*  1 */[11, 8, false],
       /*  2 */[14, 13, false],
       /*  3 */[10, 2, false],
       /*  4 */[0, 7, true],
       /*  5 */[12, 11, false],
       /*  6 */[12, 4, false],
       /*  7 */[12, 13, false],
       /*  8 */[-8, 13, true],
       /*  9 */[-9, 10, true],
       /* 10 */[11, 1, false],
       /* 11 */[0, 2, true],
       /* 12 */[-5, 14, true],
       /* 13 */[-6, 6, true],
       /* 14 */[-12, 14, true]
    ];

    const limits = [
        7,
        7,
        7,
        7,
        6,
        6,
        6,
        6,
        5,
        4,
        4,
        3,
        2,
        1
    ].map(x => Math.pow(26, x));

    const range2 = Array.from({ length: 9 }, (_, i) => i + 1);
    const range1 = range2.slice().reverse();

    function step(w: number, z: number, A: number, B: number, D: boolean) {
        if (w - A === z % 26) {
            if (D)
                z = (z / 26) | 0;
        }
        else {
            if (D)
                z = (z / 26) | 0;
            z = z * 26 + w + B;
        }
        return z;
    }

    function solve(part2: boolean, z = 0, input = 0): number[] | null {
        if (input === 14)
            return z === 0 ? [] : null;

        if (z > limits[input])
            return null;

        const [A, B, D] = parameters[input];

        const range = part2 ? range2 : range1;
        for (const w of range) {
            const z2 = step(w, z, A, B, D);
            const result = solve(part2, z2, input + 1);
            if (result !== null)
                return [w, ...result];
        }

        return null;
    }

    const result1 = solve(false);
    dayLogger.info('Result 1: ' + result1?.join(''));

    const result2 = solve(true);
    dayLogger.info('Result 2: ' + result2?.join(''));

});
