import { dayLogger, parseDecimalInt, runDay } from '../utils';

type Coord = [number, number, number];

runDay(__dirname, { blankLines: 'group' }, input => {

    const scannerValues = input.map(scanner => scanner.slice(1).map(line => line.split(',').map(parseDecimalInt) as Coord));

    // [scanner][orientation][base]: [baseCoord, coordStringsSet]
    const preparedScannerValues = scannerValues.map(scanner => Array.from({ length: 24 }, (_, o) =>
        scanner.map(baseCoord => [
            orientation(baseCoord, o),
            new Set(scanner.map(coord => coordToString(orientation(subtract(coord, baseCoord), o))))
        ] as const)
    ));

    dayLogger.debug('prepared');

    const mappings: [from: number, to: number, orientation: number, offset: Coord][] = [];

    for (let s1 = 0; s1 < preparedScannerValues.length; s1++) {
        scannerLoop:
        for (let s2 = 0; s2 < preparedScannerValues.length; s2++) {
            if (s1 === s2)
                continue;

            const o1 = 0;
            const scannerValues1 = preparedScannerValues[s1][o1];
            for (let o2 = 0; o2 < 24; o2++) {
                const scannerValues2 = preparedScannerValues[s2][o2];

                for (let b1 = 0; b1 < scannerValues1.length; b1++) {
                    const [baseCoord1, coords1Set] = scannerValues1[b1];
                    for (let b2 = 0; b2 < scannerValues2.length; b2++) {
                        const [baseCoord2, coords2Set] = scannerValues2[b2];

                        let matchCount = 0;
                        for (const coord2 of coords2Set) {
                            if (coords1Set.has(coord2))
                                matchCount++;
                        }
                        if (matchCount >= 12) {
                            const offset = subtract(baseCoord2, baseCoord1);
                            dayLogger.debug('Match', { s1, s2, o2, offset });
                            mappings.push([s1, s2, o2, offset]);
                            continue scannerLoop;
                        }

                    }
                }

            }

        }
    }

    function getAllScanner0Coordinates(mode: 'scanners' | 'beacons', scanner: number, o: number, offset: Coord, reached: Set<number>): Coord[] {
        reached.add(scanner);
        const coords: Coord[] = mode === 'scanners' ? [[0, 0, 0]] : [...scannerValues[scanner]];
        for (const [from, to, o2, offset2] of mappings) {
            if (from === scanner && !reached.has(to))
                coords.push(...getAllScanner0Coordinates(mode, to, o2, offset2, reached));
        }
        return coords.map(coord => subtract(orientation(coord, o), offset));
    }

    const allCoords = getAllScanner0Coordinates('beacons', 0, 0, [0, 0, 0], new Set());
    const result1 = new Set(allCoords.map(coordToString)).size;
    dayLogger.info('Result 1: ' + result1);

    const allScanners = getAllScanner0Coordinates('scanners', 0, 0, [0, 0, 0], new Set());
    let result2 = 0;
    for (const [x1, y1, z1] of allScanners) {
        for (const [x2, y2, z2] of allScanners) {
            const dist = Math.abs(x2 - x1) + Math.abs(y2 - y1) + Math.abs(z2 - z1);
            result2 = Math.max(result2, dist);
        }
    }
    dayLogger.info('Result 2: ' + result2);

});

function orientation(xyz: Coord, o: number) {
    const r = o % 4;
    return rotation(direction(xyz, (o - r) / 4), r);
}

function direction(xyz: Coord, d: number) {
    switch (d) {
        case 0:
            return xyz;
        case 1:
            return rotateZ(xyz);
        case 2:
            return rotateZ(rotateZ(xyz));
        case 3:
            return rotateZ(rotateZ(rotateZ(xyz)));
        case 4:
            return rotateY(xyz);
        case 5:
            return rotateY(rotateY(rotateY(xyz)));
    }
    throw new Error();
}

function rotation(xyz: Coord, r: number) {
    switch (r) {
        case 0:
            return xyz;
        case 1:
            return rotateX(xyz);
        case 2:
            return rotateX(rotateX(xyz));
        case 3:
            return rotateX(rotateX(rotateX(xyz)));
    }
    throw new Error();
}

function rotateX([x, y, z]: Coord): Coord {
    return [x, -z, y];
}

function rotateY([x, y, z]: Coord): Coord {
    return [z, y, -x];
}

function rotateZ([x, y, z]: Coord): Coord {
    return [-y, x, z];
}

function subtract([x1, y1, z1]: Coord, [x2, y2, z2]: Coord): Coord {
    return [x1 - x2, y1 - y2, z1 - z2];
}

function coordToString([x, y, z]: Coord) {
    return `${x},${y},${z}`
}
