import { dayLogger, runDay } from '../utils';

const pairs: Record<string, string> = {
    '(': ')',
    '[': ']',
    '{': '}',
    '<': '>'
};

const scores: Record<string, number> = {
    ')': 3,
    ']': 57,
    '}': 1197,
    '>': 25137
};

const scores2: Record<string, number> = {
    ')': 1,
    ']': 2,
    '}': 3,
    '>': 4
};

runDay(__dirname, {}, input => {

    const scores = input.map(getScore);

    const corruptedScore = scores.filter(score => score.type === 'corrupted').reduce((a, b) => a + b.score, 0);
    dayLogger.info('Result 1: ' + corruptedScore);

    const incompleteScores = scores.filter(score => score.type === 'incomplete').map(score => score.score).sort((a, b) => a - b);
    const incompleteScore = incompleteScores[(incompleteScores.length - 1) / 2];
    dayLogger.info('Result 2: ' + incompleteScore);

});

function getScore(line: string) {
    const stack = [];
    for (const ch of line) {
        if (ch in pairs) {
            stack.push(pairs[ch]);
        }
        else {
            const expected = stack.pop();
            if (expected !== ch)
                return { type: 'corrupted', score: scores[ch] } as const;
        }
    }

    let incompleteScore = 0;
    while (stack.length > 0) {
        const expected = stack.pop()!;
        incompleteScore *= 5;
        incompleteScore += scores2[expected];
    }

    return { type: 'incomplete', score: incompleteScore } as const;
}
