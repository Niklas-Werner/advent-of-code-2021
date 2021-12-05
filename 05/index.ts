import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const lines = input.map(line => {
        const match = line.match(/^(\d+),(\d+) -> (\d+),(\d+)$/);
        if (!match)
            throw new Error(line);
        return match.slice(1).map(parseDecimalInt);
    })

    const minX = lines.reduce((a, b) => Math.min(a, b[0], b[2]), Infinity);
    const maxX = lines.reduce((a, b) => Math.max(a, b[0], b[2]), -Infinity);
    const minY = lines.reduce((a, b) => Math.min(a, b[1], b[3]), Infinity);
    const maxY = lines.reduce((a, b) => Math.max(a, b[1], b[3]), -Infinity);

    dayLogger.debug('Ranges', { minX, maxX, minY, maxY });

    const grid1 = Array.from({ length: maxY + 1 }, _ => Array(maxX + 1).fill(0));
    const grid2 = Array.from({ length: maxY + 1 }, _ => Array(maxX + 1).fill(0));

    for (const [x1, y1, x2, y2] of lines) {
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);
        for (let y = y1, x = x1; dy * y <= dy * y2 && dx * x <= dx * x2; y += dy, x += dx) {
            if (dx === 0 || dy === 0)
                grid1[y][x]++;
            grid2[y][x]++;
        }
    }

    // console.info(grid1.map(line => line.join('').replace(/0/g, '.')).join('\n'));
    // console.info(grid2.map(line => line.join('').replace(/0/g, '.')).join('\n'));

    const overlapCount1 = grid1.flat().filter(x => x >= 2).length;
    dayLogger.info('Result 1: ' + overlapCount1);

    const overlapCount2 = grid2.flat().filter(x => x >= 2).length;
    dayLogger.info('Result 2: ' + overlapCount2);

});
