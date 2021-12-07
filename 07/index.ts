import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const positions = input[0].split(',').map(parseDecimalInt);

    const min = Math.min(...positions);
    const max = Math.max(...positions);

    dayLogger.debug('input', { min, max, avg: positions.reduce((a, b) => a + b, 0) / positions.length });

    let bestTarget1 = 0;
    let bestFuel1 = Infinity;
    let bestTarget2 = 0;
    let bestFuel2 = Infinity;

    for (let target = min; target <= max; target++) {
        const fuel1 = positions.reduce((sum, pos) => sum + Math.abs(pos - target), 0);
        if (fuel1 < bestFuel1) {
            bestTarget1 = target;
            bestFuel1 = fuel1;
        }
        const fuel2 = positions.map(pos => Math.abs(pos - target)).reduce((sum, diff) => sum + (diff + 1) * diff / 2, 0);
        if (fuel2 < bestFuel2) {
            bestTarget2 = target;
            bestFuel2 = fuel2;
        }
    }

    dayLogger.debug('Best target 1: ' + bestTarget1);
    dayLogger.info('Result 1: ' + bestFuel1);

    dayLogger.debug('Best target 2: ' + bestTarget2);
    dayLogger.info('Result 2: ' + bestFuel2);

});
