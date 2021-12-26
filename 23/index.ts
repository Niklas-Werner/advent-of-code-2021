import { dayLogger, runDay } from '../utils';

type Amphipod = {
    readonly type: string; // A, B, C, D
    readonly energy: number; // energy per step for type
    readonly destRoom: number; // destination room for type
    loc: Location;
};

type Location = {
    type: 'hallway';
    pos: number; // 0,1,3,5,7,9,10 left to right
} | {
    type: 'room';
    room: number; // 0-4 left to right
    pos: number; // 0 door, 1 back | part2: 0-3 door to back
};

const energyMap: Record<string, number> = { A: 1, B: 10, C: 100, D: 1000 };
const destinationMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
const energyByRoom = [1, 10, 100, 1000];

runDay(__dirname, {}, input => {

    const roomsInput = [...input.join('').matchAll(/[ABCD]/g)].map(match => match[0]);

    function part(part2: boolean) {
        const roomSize = part2 ? 4 : 2;

        const roomsInput2 = [...roomsInput];
        if (part2)
            roomsInput2.splice(4, 0, 'D', 'C', 'B', 'A', 'D', 'B', 'A', 'C');

        const pods = roomsInput2.map<Amphipod>((type, i) => ({
            type: type,
            energy: energyMap[type],
            destRoom: destinationMap[type],
            loc: {
                type: 'room',
                room: i % 4,
                pos: (i / 4) | 0
            }
        }));

        const hallway = Array.from({ length: 11 }, () => false);
        const rooms: (Amphipod | null)[][] = Array.from({ length: 4 }, (_, room) => Array.from({ length: roomSize }, (_, pos) =>
            pods.find(pod => pod.loc.type === 'room' && pod.loc.room === room && pod.loc.pos === pos) ?? null));

        let solutionEnergy = 0;

        function step(totalEnergy = 0, depth = 0) {
            const solved = pods.every(pod => pod.loc.type === 'room' && pod.loc.room === pod.destRoom);
            if (solved) {
                const better = solutionEnergy === 0 || totalEnergy < solutionEnergy;
                dayLogger.debug(`solution: ${totalEnergy}${better ? ' (better)' : ''}`);
                if (better)
                    solutionEnergy = totalEnergy;
                return;
            }

            const possibleSteps = [];

            for (const pod of pods) {
                const loc = pod.loc;
                const destinations: Location[] = [];

                let roomToRoom = false;
                if (loc.type === 'room') {
                    let canMove = true;
                    let wantsToMove = false;
                    for (let pos = 0; pos < roomSize; pos++) {
                        const pod2 = rooms[loc.room][pos];
                        if (pod2 !== null) {
                            if (pos < loc.pos)
                                canMove = false;
                            if (pod2.destRoom !== loc.room)
                                wantsToMove = true;
                        }
                    }
                    if (canMove && wantsToMove) {
                        for (const pos of [0, 1, 3, 5, 7, 9, 10]) {
                            const dest: Location = { type: 'hallway', pos };
                            if (testHallwayPath(loc, dest, hallway))
                                destinations.push(dest);
                        }
                        roomToRoom = true;
                    }
                }

                if (loc.type !== 'room' || roomToRoom) {
                    let roomUsable = true;
                    let nextPos = roomSize - 1;
                    for (let pos = 0; pos < roomSize; pos++) {
                        const pod2 = rooms[pod.destRoom][pos];
                        if (pod2 !== null) {
                            if (pod2.destRoom !== pod.destRoom)
                                roomUsable = false;
                            if (pod2.loc.pos <= nextPos)
                                nextPos = pos - 1;
                        }
                    }
                    if (roomUsable && nextPos >= 0) {
                        const dest: Location = { type: 'room', room: pod.destRoom, pos: nextPos };
                        if (testHallwayPath(loc, dest, hallway))
                            destinations.push(dest);
                    }
                }

                for (const dest of destinations) {
                    const energy = countSteps(loc, dest) * pod.energy;

                    pod.loc = dest;
                    let prevPod = null;
                    if (loc.type === 'room')
                        rooms[loc.room][loc.pos] = null;
                    if (dest.type === 'room') {
                        prevPod = rooms[dest.room][dest.pos];
                        rooms[dest.room][dest.pos] = pod;
                    }

                    const estimatedRemaining = estimateRemainingEnergy(pods, roomSize, rooms);

                    pod.loc = loc;
                    if (loc.type === 'room')
                        rooms[loc.room][loc.pos] = pod;
                    if (dest.type === 'room')
                        rooms[dest.room][dest.pos] = prevPod;

                    if (solutionEnergy > 0 && totalEnergy + energy + estimatedRemaining >= solutionEnergy)
                        continue;
                    possibleSteps.push({ pod, originalLoc: loc, dest, energy, estimatedRemaining });
                }
            }

            possibleSteps.sort((a, b) => a.estimatedRemaining - b.estimatedRemaining);

            for (let i = 0; i < possibleSteps.length; i++) {
                const { pod, originalLoc, dest, energy, estimatedRemaining } = possibleSteps[i];

                if (solutionEnergy > 0 && totalEnergy + energy + estimatedRemaining >= solutionEnergy)
                    continue;

                pod.loc = dest;
                let prevPod = null;
                if (originalLoc.type === 'hallway')
                    hallway[originalLoc.pos] = false;
                else
                    rooms[originalLoc.room][originalLoc.pos] = null;
                if (dest.type === 'hallway') {
                    hallway[dest.pos] = true;
                }
                else {
                    prevPod = rooms[dest.room][dest.pos];
                    rooms[dest.room][dest.pos] = pod;
                }

                if (depth === 0)
                    dayLogger.debug(`progress [0] ${i}/${possibleSteps.length}`);

                step(totalEnergy + energy, depth + 1);

                if (depth === 1)
                    dayLogger.debug(`progress [1]   ${i + 1}/${possibleSteps.length}`);

                pod.loc = originalLoc;
                if (originalLoc.type === 'hallway')
                    hallway[originalLoc.pos] = true;
                else
                    rooms[originalLoc.room][originalLoc.pos] = pod;
                if (dest.type === 'hallway')
                    hallway[dest.pos] = false;
                else
                    rooms[dest.room][dest.pos] = prevPod;
            }
        }

        step();

        return solutionEnergy;
    }

    const result1 = part(false);
    dayLogger.info('Result 1: ' + result1);

    const result2 = part(true);
    dayLogger.info('Result 2: ' + result2);

});

function countSteps(from: Location, to: Location) {
    const hallwayStepFrom = from.type === 'hallway' ? from.pos : (from.room + 1) * 2;
    const hallwayStepTo = to.type === 'hallway' ? to.pos : (to.room + 1) * 2;
    let doorSteps = 0;
    if (from.type === 'room')
        doorSteps += from.pos + 1;
    if (to.type === 'room')
        doorSteps += to.pos + 1;
    if (doorSteps > 0 && hallwayStepFrom === hallwayStepTo)
        throw new Error();
    return Math.abs(hallwayStepTo - hallwayStepFrom) + doorSteps;
}

function testHallwayPath(from: Location, to: Location, hallway: boolean[]) {
    const hallwayStepFrom = from.type === 'hallway' ? from.pos : (from.room + 1) * 2;
    const hallwayStepTo = to.type === 'hallway' ? to.pos : (to.room + 1) * 2;
    const d = Math.sign(hallwayStepTo - hallwayStepFrom);
    for (let pos = hallwayStepFrom + d; d * pos <= d * hallwayStepTo; pos += d) {
        if (hallway[pos])
            return false;
    }
    return true;
}

function estimateRemainingEnergy(pods: Amphipod[], roomSize: number, rooms: (Amphipod | null)[][]) {
    let result = 0;
    for (let room = 0; room < 4; room++) {
        let missing = roomSize;
        for (let pos = roomSize - 1; pos >= 0; pos--) {
            const pod2 = rooms[room][pos];
            if (pod2 === null || pod2.destRoom !== room)
                break;
            missing--;
        }
        result += [0, 0, 1, 3, 6][missing] * energyByRoom[room];
    }
    for (const pod of pods) {
        const loc = pod.loc;
        let steps = 0;
        if (loc.type === 'room' && loc.room === pod.destRoom) {
            let needsToMove = false;
            for (let pos = loc.pos + 1; pos < roomSize; pos++) {
                const pod2 = rooms[loc.room][pos];
                if (pod2 !== null && pod2.destRoom !== loc.room) {
                    needsToMove = true;
                    break;
                }
            }
            if (needsToMove)
                steps += 4 + loc.pos;
        }
        else {
            const hallwayStepFrom = loc.type === 'hallway' ? loc.pos : (loc.room + 1) * 2;
            const hallwayStepTo = (pod.destRoom + 1) * 2;
            steps += Math.abs(hallwayStepTo - hallwayStepFrom);
            if (loc.type === 'hallway')
                steps += 1;
            else
                steps += 2 + loc.pos;
        }
        result += steps * pod.energy;
    }
    return result;
}
