import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const inputStates = input[0].split(',').map(parseDecimalInt);

    const fishStates: Record<number, number> = {};

    for (const state of inputStates)
        fishStates[state] = (fishStates[state] ?? 0) + 1;

    dayLogger.debug('before', { fishStates });

    for (let day = 1; day <= 256; day++) {
        const newFishCount = fishStates[0] ?? 0;
        for (let state = 1; state <= 8; state++)
            fishStates[state - 1] = fishStates[state] ?? 0;
        fishStates[6] += newFishCount;
        fishStates[8] = newFishCount;

        if (day === 80) {
            dayLogger.debug('after 80 days', { fishStates });
            const total1 = Object.values(fishStates).reduce((a, b) => a + b, 0);
            dayLogger.info('Result 1: ' + total1);
        }
    }

    dayLogger.debug('after 256 days', { fishStates });
    const total2 = Object.values(fishStates).reduce((a, b) => a + b, 0);
    dayLogger.info('Result 2: ' + total2);

});
