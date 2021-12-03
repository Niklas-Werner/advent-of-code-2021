import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const bitOneCounts: number[] = [];
    for (const line of input) {
        for (let i = 0; i < line.length; i++) {
            if (line.charAt(i) === '1')
                bitOneCounts[i] = (bitOneCounts[i] ?? 0) + 1;
        }
    }

    let gamma = 0;
    let epsilon = 0;
    for (let i = 0; i < bitOneCounts.length; i++) {
        if (bitOneCounts[i] > input.length / 2)
            gamma += 1 << (bitOneCounts.length - i - 1);
        else
            epsilon += 1 << (bitOneCounts.length - i - 1);
    }

    dayLogger.debug('Gamma: ' + gamma.toString(2));
    dayLogger.debug('Epsilon: ' + epsilon.toString(2));

    const power = gamma * epsilon;
    dayLogger.info('Result 1: ' + power);


    input.sort();
    const o2 = part2(input, true);
    const co2 = part2(input, false);

    dayLogger.debug('O2: ' + o2);
    dayLogger.debug('CO2: ' + co2);

    const life = parseInt(o2, 2) * parseInt(co2, 2);
    dayLogger.info('Result 2: ' + life);
});

function part2(orderedLines: string[], mostCommonOr1: boolean, position = 0): string {
    if (orderedLines.length === 1)
        return orderedLines[0];

    const numberOf0 = orderedLines.findIndex(line => line.charAt(position) === '1') ?? orderedLines.length;
    const numberOf1 = orderedLines.length - numberOf0;

    if ((numberOf0 > numberOf1) === mostCommonOr1 || numberOf0 === numberOf1 && !mostCommonOr1)
        return part2(orderedLines.slice(0, numberOf0), mostCommonOr1, position + 1);
    else
        return part2(orderedLines.slice(numberOf0), mostCommonOr1, position + 1);
}
