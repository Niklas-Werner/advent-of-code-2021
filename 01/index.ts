import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const values = input.map(line => parseInt(line));

    let last = Infinity;
    let result = 0;

    for (const value of values) {
        if (value > last)
            result++;
        last = value;
    }

    dayLogger.info('Result 1: ' + result);

    const windows = values.map((value, i) => {
        if (i < 2)
            return Infinity;
        return value + values[i - 1] + values[i - 2];
    }).slice(2);

    let lastWindow = Infinity;
    let result2 = 0;

    for (const window of windows) {
        if (window > lastWindow)
            result2++;
        lastWindow = window;
    }

    dayLogger.info('Result 2: ' + result2);

});
