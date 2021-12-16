import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, (input, { test }) => {
    for (const line of input) {
        if (test)
            dayLogger.debug('input: ' + line);
        run(line);
    }
});

type PosRef = { pos: number; };

type Packet =
    | { type: 'literal'; version: number; value: bigint; }
    | { type: 'operation'; opType: number; version: number; packets: Packet[]; };

function run(input: string) {
    const binary = input.split('').map(ch => parseInt(ch, 16).toString(2).padStart(4, '0')).join('');

    const packet = readPacket(binary, { pos: 0 });
    // dayLogger.debug('packet', packet);

    const result1 = sumVersions(packet);
    dayLogger.info('Result 1: ' + result1);

    const result2 = evaluate(packet);
    dayLogger.info('Result 2: ' + result2);
}

function read(binary: string, posRef: PosRef, length: number) {
    const value = parseInt(binary.slice(posRef.pos, posRef.pos + length), 2);
    posRef.pos += length;
    return value;
}

function readPacket(binary: string, posRef: PosRef): Packet {
    const version = read(binary, posRef, 3);
    const type = read(binary, posRef, 3);

    if (type === 4) {
        const value = readLiteral(binary, posRef);
        return { type: 'literal', version, value };
    }

    const lengthType = read(binary, posRef, 1);
    let packets = [];
    if (lengthType === 0) {
        const bitLength = read(binary, posRef, 15);
        const limit = posRef.pos + bitLength;
        while (posRef.pos < limit)
            packets.push(readPacket(binary, posRef));
        if (posRef.pos > limit)
            throw new Error(`read past limit ${posRef.pos} > ${limit}`);
    }
    else {
        const packetLength = read(binary, posRef, 11);
        for (let i = 0; i < packetLength; i++)
            packets.push(readPacket(binary, posRef));
    }
    return { type: 'operation', opType: type, version, packets };
}

function readLiteral(binary: string, posRef: PosRef) {
    let value = 0n;
    while (true) {
        const group = read(binary, posRef, 5);
        value <<= 4n;
        value |= BigInt(group & 0xf);
        if ((group & 0x10) === 0)
            break;
    }
    return value;
}

function sumVersions(packet: Packet): number {
    let sum = packet.version;
    if (packet.type === 'operation')
        sum += packet.packets.map(sumVersions).reduce((a, b) => a + b, 0);
    return sum;
}

function evaluate(packet: Packet): bigint {
    if (packet.type === 'literal')
        return packet.value;
    const operators = packet.packets.map(evaluate);
    switch (packet.opType) {
        case 0: // sum
            return operators.reduce((a, b) => a + b, 0n);
        case 1: // product
            return operators.reduce((a, b) => a * b, 1n);
        case 2: // minimum
            return operators.reduce((a, b) => a <= b ? a : b);
        case 3: // maximum
            return operators.reduce((a, b) => a >= b ? a : b);
        case 5: // greater than
            return operators[0] > operators[1] ? 1n : 0n;
        case 6: // less than
            return operators[0] < operators[1] ? 1n : 0n;
        case 7: // equal to
            return operators[0] === operators[1] ? 1n : 0n;
    }
    throw new Error(`unsupported packet opType ${packet.opType}`);
}
