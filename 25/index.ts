import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const inputCucumbers = input.map(line => line.split('')).flat();
    const h = input.length;
    const w = input[0].length;
    dayLogger.debug('input', { w, h });

    function moveEast(cucumbers: string[]) {
        const newCucumbers = cucumbers.slice();
        let movement = false;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                const i2 = y * w + (x + 1) % w;
                if (cucumbers[i] === '>' && cucumbers[i2] === '.') {
                    newCucumbers[i] = '.';
                    newCucumbers[i2] = '>';
                    movement = true;
                }
            }
        }
        return { newCucumbers, movement };
    }

    function moveSouth(cucumbers: string[]) {
        const newCucumbers = cucumbers.slice();
        let movement = false;
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = y * w + x;
                const i2 = (y + 1) % h * w + x;
                if (cucumbers[i] === 'v' && cucumbers[i2] === '.') {
                    newCucumbers[i] = '.';
                    newCucumbers[i2] = 'v';
                    movement = true;
                }
            }
        }
        return { newCucumbers, movement };
    }

    let cucumbers = inputCucumbers;
    let step = 1;
    while (true) {
        const east = moveEast(cucumbers);
        cucumbers = east.newCucumbers;
        const south = moveSouth(cucumbers);
        cucumbers = south.newCucumbers;
        if (!east.movement && !south.movement)
            break;
        step++;
    }

    dayLogger.info('Result 1: ' + step);

});
