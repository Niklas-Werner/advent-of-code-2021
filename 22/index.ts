import { dayLogger, runDay } from '../utils';

type Axis = 'x' | 'y' | 'z';
type Box = Record<`${Axis}${1 | 2}`, number>;

const part1Box: Box = { x1: -50, x2: 50, y1: -50, y2: 50, z1: -50, z2: 50 };

runDay(__dirname, {}, input => {

    const steps = input.map(line => {
        const on = line.startsWith('on');
        const [x1, x2, y1, y2, z1, z2] = [...line.matchAll(/-?\d+/g)].map(match => parseInt(match[0]));
        return { on, x1, x2, y1, y2, z1, z2 } as const;
    });

    let boxes1: Box[] = [];
    let boxes2: Box[] = [];

    for (let i = 0; i < steps.length; i++) {
        const { on, ...box } = steps[i];
        if (contains(part1Box, box)) {
            if (on)
                boxes1 = addBox(boxes1, box);
            else
                boxes1 = removeBox(boxes1, box);
        }
        if (on)
            boxes2 = addBox(boxes2, box);
        else
            boxes2 = removeBox(boxes2, box);
        if ((i + 1) % 20 === 0)
            dayLogger.debug(`progress ${i + 1}/${steps.length} (${boxes1.length}, ${boxes2.length})`);
    }

    const result1 = boxes1.map(boxSize).reduce((a, b) => a + b, 0);
    dayLogger.info('Result 1: ' + result1);

    const result2 = boxes2.map(boxSize).reduce((a, b) => a + b, 0);
    dayLogger.info('Result 2: ' + result2);

});

function addBox(boxes: Box[], box: Box) {
    if (boxes.some(box2 => contains(box2, box)))
        return boxes;
    const boxes2 = boxes.filter(box2 => !contains(box, box2));
    const split = boxes2.reduce((split, box2) => split.flatMap(box3 => splitBox(box3, box2)), [box]);
    const toAdd = split.filter(box2 => !boxes2.some(box3 => contains(box3, box2)));
    return boxes2.concat(toAdd);
}

function removeBox(boxes: Box[], box: Box) {
    const boxes2 = boxes.filter(box2 => !contains(box, box2));
    const split = boxes2.flatMap(box2 => splitBox(box2, box));
    return split.filter(box2 => !contains(box, box2));
}

function intersects(box1: Box, box2: Box) {
    return intersectsAxis(box1, box2, 'x') && intersectsAxis(box1, box2, 'y') && intersectsAxis(box1, box2, 'z');
}

function contains(box1: Box, box2: Box) {
    return containsAxis(box1, box2, 'x') && containsAxis(box1, box2, 'y') && containsAxis(box1, box2, 'z');
}

function intersectsAxis(box1: Box, box2: Box, axis: Axis) {
    return box1[`${axis}1`] <= box2[`${axis}2`] && box2[`${axis}1`] <= box1[`${axis}2`];
}

function containsAxis(box1: Box, box2: Box, axis: Axis) {
    return box2[`${axis}1`] >= box1[`${axis}1`] && box2[`${axis}2`] <= box1[`${axis}2`];
}

function boxSize(box: Box) {
    return (box.x2 - box.x1 + 1) * (box.y2 - box.y1 + 1) * (box.z2 - box.z1 + 1);
}

function splitBox(boxToSplit: Box, box2: Box) {
    if (!intersects(boxToSplit, box2))
        return [boxToSplit];
    const result = splitBoxAlong(boxToSplit, 'x', box2.x1)
        .flatMap(box => splitBoxAlong(box, 'x', box2.x2 + 1))
        .flatMap(box => splitBoxAlong(box, 'y', box2.y1))
        .flatMap(box => splitBoxAlong(box, 'y', box2.y2 + 1))
        .flatMap(box => splitBoxAlong(box, 'z', box2.z1))
        .flatMap(box => splitBoxAlong(box, 'z', box2.z2 + 1));
    return result;
}

function splitBoxAlong(boxToSplit: Box, axis: Axis, value: number) {
    if (value <= boxToSplit[`${axis}1`] || value > boxToSplit[`${axis}2`])
        return [boxToSplit];
    return [{
        ...boxToSplit,
        [`${axis}2`]: value - 1
    }, {
        ...boxToSplit,
        [`${axis}1`]: value
    }];
}
