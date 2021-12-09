import { BitArray } from '@nw55/common';
import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const heightmap = input.map(line => line.split('').map(parseDecimalInt));

    let riskSum = 0;
    const basinSizes = [];

    for (let y = 0; y < heightmap.length; y++) {
        for (let x = 0; x < heightmap[y].length; x++) {
            let lowerCount = 0;
            for (let y2 = y - 1; y2 <= y + 1; y2++) {
                if (y2 !== y && y2 >= 0 && y2 < heightmap.length && heightmap[y2][x] <= heightmap[y][x])
                    lowerCount++;
            }
            for (let x2 = x - 1; x2 <= x + 1; x2++) {
                if (x2 !== x && x2 >= 0 && x2 < heightmap[y].length && heightmap[y][x2] <= heightmap[y][x])
                    lowerCount++;
            }
            if (lowerCount === 0) {
                riskSum += heightmap[y][x] + 1;
                const size = getBasinSize(heightmap, x, y);
                basinSizes.push(size);
                dayLogger.debug(`Basin at ${x}/${y} with lowest point ${heightmap[y][x]} and size ${size}`);
            }
        }
    }

    dayLogger.info('Result 1: ' + riskSum);

    basinSizes.sort((a, b) => b - a);
    const result2 = basinSizes[0] * basinSizes[1] * basinSizes[2];
    dayLogger.info('Result 2: ' + result2);

});

function prepareBuffer(heightmap: number[][]) {
    const w = heightmap[0].length;
    const h = heightmap.length;
    const buffer = new BitArray(h * w);
    for (let y = 0; y < heightmap.length; y++) {
        for (let x = 0; x < heightmap[y].length; x++) {
            if (heightmap[y][x] === 9)
                buffer.set(y * w + x);
        }
    }
    return { w, h, buffer };
}

function getBasinSize(heightmap: number[][], x: number, y: number) {
    const { w, h, buffer } = prepareBuffer(heightmap);
    return floodFillCount(buffer, w, h, x, y);
}

function floodFillCount(buffer: BitArray, w: number, h: number, x: number, y: number): number {
    let result = 0;
    if (x >= 0 && x < w && y >= 0 && y < h && !buffer.get(y * w + x)) {
        buffer.set(y * w + x);
        result += 1;
        result += floodFillCount(buffer, w, h, x + 1, y);
        result += floodFillCount(buffer, w, h, x - 1, y);
        result += floodFillCount(buffer, w, h, x, y + 1);
        result += floodFillCount(buffer, w, h, x, y - 1);
    }
    return result;
}
