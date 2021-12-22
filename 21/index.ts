import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const [start1, start2] = input.map(line => parseInt(line.split(':')[1]));

    dayLogger.debug('input', { start1, start2 });

    let die = 0;
    let rolls = 0;
    let player1Space = start1;
    let player2Space = start2;
    let player1Score = 0;
    let player2Score = 0;

    function roll() {
        rolls++;
        die = (die % 100) + 1;
        return die;
    }

    let losingScore;
    while (true) {
        const dice1 = roll() + roll() + roll();
        player1Space = (player1Space + dice1 - 1) % 10 + 1;
        player1Score += player1Space;
        if (player1Score >= 1000) {
            losingScore = player2Score;
            break;
        }
        const dice2 = roll() + roll() + roll();
        player2Space = (player2Space + dice2 - 1) % 10 + 1;
        player2Score += player2Space;
        if (player2Score >= 1000) {
            losingScore = player1Score;
            break;
        }
    }

    const result1 = losingScore * rolls;
    dayLogger.info('Result 1: ' + result1);

    function getWins(spaces: [number, number], scores: [number, number], player: 0 | 1, cache: Map<string, [number, number]>): [number, number] {
        const cacheKey = `${spaces[0]},${spaces[1]},${scores[0]},${scores[1]},${player}`;
        const cachedResult = cache.get(cacheKey);
        if (cachedResult !== undefined)
            return cachedResult;

        const result: [number, number] = [0, 0];
        for (let roll1 = 1; roll1 <= 3; roll1++) {
            for (let roll2 = 1; roll2 <= 3; roll2++) {
                for (let roll3 = 1; roll3 <= 3; roll3++) {
                    const sum = roll1 + roll2 + roll3;
                    const newSpaces: [number, number] = [...spaces];
                    newSpaces[player] = (newSpaces[player] + sum - 1) % 10 + 1;
                    const newScores: [number, number] = [...scores];
                    newScores[player] += newSpaces[player];
                    if (newScores[player] >= 21) {
                        result[player]++;
                    }
                    else {
                        const nextPlayer = player === 1 ? 0 : 1;
                        const nextResult = getWins(newSpaces, newScores, nextPlayer, cache);
                        result[0] += nextResult[0];
                        result[1] += nextResult[1];
                    }
                }
            }
        }

        cache.set(cacheKey, result);
        return result;
    }

    const wins = getWins([start1, start2], [0, 0], 0, new Map());
    dayLogger.debug('result 2', { wins });

    const result2 = Math.max(...wins);
    dayLogger.info('Result 2: ' + result2);

});
