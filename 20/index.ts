import { BitArray } from '@nw55/common';
import { dayLogger, runDay } from '../utils';

type Image = {
    width: number;
    height: number;
    pixels: BitArray;
    border: boolean;
};

runDay(__dirname, { blankLines: 'group' }, input => {

    const algorithm = input[0][0].split('').map(pixel => pixel === '#');
    const imageInput = input[1].map(line => line.split('').map(pixel => pixel === '#' ? 1 : 0));

    const width = imageInput[0].length;
    const height = imageInput.length;
    const pixels = BitArray.nonemptyEntries(new Uint8Array(imageInput.flat()));
    const image: Image = { width, height, pixels, border: false };

    let stepImage = image;
    for (let step = 1; step <= 50; step++) {
        stepImage = enhance(stepImage, algorithm);
        if (step === 2) {
            const result1 = countPixels(stepImage);
            dayLogger.info('Result 1: ' + result1);
        }
    }
    const result2 = countPixels(stepImage);
    dayLogger.info('Result 2: ' + result2);

});

function get(image: Image, x: number, y: number) {
    if (x < 0 || x >= image.width || y < 0 || y >= image.height)
        return image.border;
    return image.pixels.get(y * image.width + x);
}

function enhance(image: Image, algorithm: boolean[]): Image {
    const pixels = new BitArray((image.width + 2) * (image.height + 2));
    const width = image.width + 2;
    const height = image.height + 2;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let index = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const value = get(image, x - 1 + dx, y - 1 + dy);
                    index <<= 1;
                    index |= value ? 1 : 0;
                }
            }
            pixels.set(y * width + x, algorithm[index]);
        }
    }
    const border = algorithm[image.border ? 0x1f : 0];
    return { width, height, pixels, border };
}

function countPixels(image: Image) {
    if (image.border)
        throw new Error();
    let count = 0;
    for (let i = 0; i < image.pixels.length; i++)
        count += image.pixels.get(i) ? 1 : 0;
    return count;
}
