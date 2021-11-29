import { Awaitable, TwoWayMap } from '@nw55/common';
import { LogLevel } from '@nw55/logging';
import { runMain, tryReadTextFile, useDefaultConsoleLogging } from '@nw55/node-utils';
import { resolve } from 'path';

useDefaultConsoleLogging(LogLevel.Warning);

export async function readNonEmptyLines(...pathSegments: string[]) {
    const file = resolve(...pathSegments);
    const content = await tryReadTextFile(file);
    if (content === null)
        throw new Error('file not found');
    const lines = content.split(/\r?\n/g);
    return lines.filter(line => line !== '');
}

export function isNonNullable<T>(x: T): x is NonNullable<T> {
    return x !== null && x !== undefined;
}

export interface DayOptions {
    readonly blankLines?: false | 'keep' | 'group';
}

type InputType<Options extends DayOptions> = Options['blankLines'] extends 'group' ? string[][] : string[];

interface FnOptions {
    test: number;
}

export function runDay<O extends DayOptions>(dir: string, options: O, fn: (input: InputType<O>, options: FnOptions) => Awaitable<void>) {
    runMain(async ([param]) => {
        const file = resolve(dir, param === 'test' ? 'test-input' : param === 'test2' ? 'test-input2' : 'input');
        const fnOptions: FnOptions = {
            test: param === 'test' ? 1 : param === 'test2' ? 2 : 0
        };
        let content = await tryReadTextFile(file);
        if (content === null)
            throw new Error('file not found');
        content = content.replace(/(?:\r?\n)+$/, '');
        switch (options.blankLines) {
            case 'keep': {
                const lines = content.split(/\r?\n/g);
                await fn(lines as InputType<typeof options>, fnOptions);
                break;
            }
            case 'group': {
                const groups = content.split(/(?:\r?\n){2}/g);
                const input = groups.map(group => group.split(/\r?\n/g));
                await fn(input as InputType<typeof options>, fnOptions);
                break;
            }
            default: {
                const lines = content.split(/\r?\n/g);
                const input = options.blankLines ? lines : lines.filter(line => line !== '');
                await fn(input as InputType<typeof options>, fnOptions);
                break;
            }
        }
    });
}

function backtrackMatchHelper<K, V>(candidates: Iterable<readonly [K, Iterable<V>]>, target: number, matches: TwoWayMap<K, V>): boolean {
    if (matches.size >= target)
        return true;

    const filteredMatchCandidates = [...candidates]
        .filter(([key, values]) => !matches!.hasKey(key))
        .map(([key, values]) => [key, [...values].filter(value => !matches!.hasValue(value))] as const)
        .filter(([key, values]) => values.length > 0)
        .sort((a, b) => a[1].length - b[1].length);

    if (filteredMatchCandidates.length === 0)
        return false;

    const [allergen, currentIngredients] = filteredMatchCandidates[0];

    for (const ingredient of currentIngredients) {
        if (!matches.hasValue(ingredient)) {
            matches.set(allergen, ingredient);
            if (backtrackMatchHelper(candidates, target, matches))
                return true;
            matches.delete(allergen);
        }
    }

    return false;
}

export function backtrackMatch<K, V>(candidates: Iterable<readonly [K, Iterable<V>]>) {
    const matches = new TwoWayMap<K, V>();
    const target = [...candidates].length;
    const success = backtrackMatchHelper(candidates, target, matches);
    return success ? matches : null;
}

export const compareStrings = (a: string, b: string) => a > b ? 1 : b > a ? -1 : 0;
