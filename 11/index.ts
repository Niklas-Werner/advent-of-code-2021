import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const energy = input.map(line => line.split('').map(parseDecimalInt));
    const w = energy.length;
    const h = energy[0].length;

    let flashes = 0;
    let firstSynchronizedStep = 0;

    function runStep() {
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++)
                energy[y][x]++;
        }

        let stepFlashes = 0;

        function flash(y: number, x: number) {
            stepFlashes++;
            energy[y][x] = -Infinity;
            for (let y2 = y - 1; y2 <= y + 1; y2++) {
                if (y2 < 0 || y2 >= w)
                    continue;
                for (let x2 = x - 1; x2 <= x + 1; x2++) {
                    if (x2 < 0 || x2 >= h)
                        continue;
                    energy[y2][x2]++;
                    if (energy[y2][x2] > 9)
                        flash(y2, x2);
                }
            }
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (energy[y][x] > 9)
                    flash(y, x);
            }
        }

        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                if (energy[y][x] < 0)
                    energy[y][x] = 0;
            }
        }

        return stepFlashes;
    }

    for (let step = 1; step <= 100 || firstSynchronizedStep === 0; step++) {
        const stepFlashes = runStep();
        if (step <= 100)
            flashes += stepFlashes;
        if (firstSynchronizedStep === 0 && stepFlashes === w * h)
            firstSynchronizedStep = step;
    }

    dayLogger.info('Result 1: ' + flashes);
    dayLogger.info('Result 2: ' + firstSynchronizedStep);

});
