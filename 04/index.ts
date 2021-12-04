import { dayLogger, parseDecimalInt, runDay } from '../utils';

runDay(__dirname, { blankLines: 'group' }, input => {

    const numbers = input[0][0].split(',')
        .map(parseDecimalInt);

    const boards = input.slice(1)
        .map(lines => lines
            .map(line => line.trim().split(/\s+/g)
                .map(parseDecimalInt)));

    let part1Done = false;
    for (const number of numbers) {
        for (let i = 0; i < boards.length; i++) {
            const board = boards[i];
            if (markAndTest(board, number)) {
                if (!part1Done) {
                    const boardSum = sumUnmarked(board);
                    const result = boardSum * number;
                    dayLogger.debug('Board sum: ' + boardSum);
                    dayLogger.debug('Number: ' + number);
                    dayLogger.info('Result 1: ' + result);
                    part1Done = true;
                }
                if (boards.length === 1) {
                    const boardSum = sumUnmarked(boards[0]);
                    const result = boardSum * number;
                    dayLogger.debug('Board sum: ' + boardSum);
                    dayLogger.debug('Number: ' + number);
                    dayLogger.info('Result 2: ' + result);
                    return;
                }
                boards.splice(i, 1);
                i--;
            }
        }
    }

});

function markAndTest(board: number[][], number: number) {
    for (let row = 0; row < board.length; row++) {
        for (let column = 0; column < board[row].length; column++) {
            if (board[row][column] === number) {
                board[row][column] = -1;
                if (testRow(board, row) || testColumn(board, column))
                    return true;
            }
        }
    }
    return false;
}

function testRow(board: number[][], row: number) {
    return board[row].every(value => value === -1);
}

function testColumn(board: number[][], column: number) {
    return board.every(rowValues => rowValues[column] === -1);
}

function sumUnmarked(board: number[][]) {
    return board.flat().filter(value => value !== -1).reduce((a, b) => a + b, 0);
}
