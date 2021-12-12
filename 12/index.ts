import { MultiMap } from '@nw55/common';
import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const connections = input.map(line => line.split('-'));

    const reachable = new MultiMap<string, string>();
    for (const [from, to] of connections) {
        reachable.add(from, to);
        reachable.add(to, from);
    }

    function isSmall(cave: string) {
        return cave.charAt(0) >= 'a' && cave.charAt(0) <= 'z';
    }

    function findPaths(from: string, to: string, visitedSmall: Set<string>, visitedSmallTwice: boolean): string[] {
        if (from === to)
            return [to];
        let allPaths: string[] = [];

        if (isSmall(from))
            visitedSmall.add(from);
        for (const next of reachable.get(from)) {
            if (!visitedSmall.has(next))
                allPaths.push(...findPaths(next, to, visitedSmall, visitedSmallTwice).map(path => from + ',' + path));
        }
        visitedSmall.delete(from);

        if (!visitedSmallTwice && isSmall(from) && from !== 'start') {
            for (const next of reachable.get(from)) {
                if (!visitedSmall.has(next))
                    allPaths.push(...findPaths(next, to, visitedSmall, true).map(path => from + ',' + path));
            }
        }

        return allPaths;
    }

    const paths1 = findPaths('start', 'end', new Set(), true);
    const result1 = new Set(paths1).size;
    dayLogger.info('Result 1: ' + result1);

    const paths2 = findPaths('start', 'end', new Set(), false);
    const result2 = new Set(paths2).size;
    dayLogger.info('Result 2: ' + result2);

});
