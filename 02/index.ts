import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    let hPos = 0;
    let depth = 0;
    let aim = 0;
    let depth2 = 0;

    for (const line of input) {
        const [command, valueStr] = line.split(' ');
        const value = parseInt(valueStr);
        switch (command) {
            case 'forward':
                hPos += value;
                depth2 += aim * value;
                break;
            case 'down':
                depth += value;
                aim += value;
                break;
            case 'up':
                depth -= value;
                aim -= value;
                break;
            default:
                dayLogger.warn(line);
        }
    }

    const result1 = hPos * depth;
    dayLogger.info('Result 1: ' + result1);

    const result2 = hPos * depth2;
    dayLogger.info('Result 2: ' + result2);

});
