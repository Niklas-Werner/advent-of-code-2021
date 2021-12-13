import { BitArray } from '@nw55/common';
import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, { blankLines: 'group' }, input => {

    const dots = input[0].map(line => line.split(',').map(parseDecimalInt));

    const w = dots.reduce((max, dot) => Math.max(max, dot[0]), 0) + 1;
    const h = dots.reduce((max, dot) => Math.max(max, dot[1]), 0) + 1;

    dayLogger.debug('size', { w, h });

    const paper = new BitArray(w * h);

    for (const [x, y] of dots)
        paper.set(y * w + x);

    let result1 = -1;

    let resultW = w;
    let resultH = h;

    for (const instruction of input[1]) {
        const match = instruction.match(/^fold along ([xy])=(\d+)$/);
        if (!match)
            throw new Error(instruction);
        const foldAxis = match[1];
        const foldPosition = parseInt(match[2]);
        if (foldAxis === 'x') {
            foldX(paper, w, h, foldPosition);
            resultW = foldPosition;
        }
        if (foldAxis === 'y') {
            foldY(paper, w, h, foldPosition);
            resultH = foldPosition;
        }
        if (result1 < 0)
            result1 = count(paper);
    }

    dayLogger.info('Result 1: ' + result1);

    dayLogger.debug('size', { resultW, resultH });

    const output = print(paper, w, resultW, resultH);
    console.info(output);

});

function foldX(paper: BitArray, w: number, h: number, xFold: number) {
    for (let y = 0; y < h; y++) {
        for (let x = xFold + 1; x < w; x++) {
            if (paper.get(y * w + x)) {
                paper.unset(y * w + x);
                const x2 = xFold - (x - xFold);
                if (x2 >= 0)
                    paper.set(y * w + x2);
            }
        }
    }
}

function foldY(paper: BitArray, w: number, h: number, yFold: number) {
    for (let y = yFold + 1; y < h; y++) {
        for (let x = 0; x < w; x++) {
            if (paper.get(y * w + x)) {
                paper.unset(y * w + x);
                const y2 = yFold - (y - yFold);
                if (y2 >= 0)
                    paper.set(y2 * w + x);
            }
        }
    }
}

function count(paper: BitArray) {
    let result = 0;
    for (let i = 0; i < paper.length; i++)
        result += paper.get(i) ? 1 : 0;
    return result;
}

function print(paper: BitArray, w: number, outputW: number, outputH: number) {
    let lines = [];
    for (let y = 0; y < outputH; y++) {
        let line = '';
        for (let x = 0; x < outputW; x++)
            line += paper.get(y * w + x) ? '#' : '.';
        lines.push(line);
    }
    return lines.join('\n');
}
