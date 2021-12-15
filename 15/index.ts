import { dayLogger, notNull, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const grid = input.map(line => line.split('').map(parseDecimalInt));
    const w = grid[0].length;
    const h = grid.length;
    const values = grid.flat();

    function createGetSuccessors(w: number, h: number) {
        return function getSuccessors(i: number) {
            const x = i % w;
            const y = (i - x) / w;
            return [
                x > 0 ? i - 1 : null,
                x < w - 1 ? i + 1 : null,
                y > 0 ? i - w : null,
                y < h - 1 ? i + w : null
            ].filter(notNull);
        };
    }

    function createHeuristic(w: number, h: number) {
        return function heuristic(i: number) {
            const x = i % w;
            const y = (i - x) / w;
            return (w - 1 - x) + (h - 1 - y);
        };
    }

    function getDistance(i: number) {
        return values[i];
    }

    const result1 = aStarDistance(0, w * h - 1, createGetSuccessors(w, h), getDistance, createHeuristic(w, h));
    dayLogger.info('Result 1: ' + result1);

    function getDistance2(i: number) {
        const x2 = i % (w * 5);
        const y2 = (i - x2) / (w * 5);
        const baseTileX = x2 % w;
        const baseTileY = y2 % h;
        const tileX = (x2 - baseTileX) / w;
        const tileY = (y2 - baseTileY) / h;
        const baseValue = values[baseTileY * w + baseTileX];
        return (baseValue + tileX + tileY - 1) % 9 + 1;
    }

    const result2 = aStarDistance(0, w * 5 * h * 5 - 1, createGetSuccessors(w * 5, h * 5), getDistance2, createHeuristic(w * 5, h * 5));
    dayLogger.info('Result 2: ' + result2);

});

export function aStarDistance<T>(start: T, end: T, getSuccessors: (from: T) => T[], getDistance: (to: T) => number, heuristic: (from: T) => number) {
    const openList = new Map<T, number>();
    openList.set(start, 0);
    const closedList = new Set<T>();
    const dist = new Map<T, number>();
    dist.set(start, 0);

    while (true) {
        if (openList.size === 0)
            return undefined;
        const currentNode = [...openList].reduce((a, b) => a[1] <= b[1] ? a : b)[0];
        openList.delete(currentNode);
        if (currentNode === end)
            break;
        closedList.add(currentNode);

        const successors = getSuccessors(currentNode);
        for (const successor of successors) {
            if (closedList.has(successor))
                continue;
            const tentativeG = dist.get(currentNode)! + getDistance(successor);
            if (openList.has(successor) && tentativeG >= dist.get(successor)!)
                continue;
            dist.set(successor, tentativeG);
            const f = tentativeG + heuristic(successor);
            openList.set(successor, f);
        }
    }

    return dist.get(end);
}
