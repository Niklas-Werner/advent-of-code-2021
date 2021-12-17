import { dayLogger, runDay } from '../utils';

runDay(__dirname, {}, input => {

    const [x1, x2, y1, y2] = [...input[0].matchAll(/-?\d+/g)].map(match => parseInt(match[0]));

    dayLogger.debug('input', { x1, x2, y1, y2 });

    let xts: [number, boolean, number][] = [];

    for (let vx = 0; vx <= x2; vx++) {
        let x = 0;
        let t = 0;
        while (x <= x2 && t < vx) {
            x += (vx - t);
            t++;
            if (x >= x1 && x <= x2) {
                const v0 = t === vx;
                dayLogger.debug('x hit', { x, vx, t, v0 });
                xts.push([t, v0, vx]);
            }
        }
    }

    let result1 = 0;
    let vxys = new Set<string>();

    for (let vy = y1; vy < -y1; vy++) {
        let y = 0;
        let t = 0;
        let vy2 = vy;
        while (y >= y1) {
            y += vy2;
            vy2--;
            t++;
            if (y >= y1 && y <= y2) {
                dayLogger.debug('y hit', { y, vy, t });
                const vxs = xts.filter(([xt, v0, vx]) => xt === t || v0 && xt <= t).map(([xt, v0, vx]) => vx);
                if (vy >= 1 && vxs.length > 0) {
                    let yMax = (vy + 1) * vy / 2;
                    result1 = Math.max(result1, yMax);
                }
                for (const vx of vxs)
                    vxys.add(vx + ',' + vy);
            }
        }
    }

    dayLogger.info('Result 1: ' + result1);

    const result2 = vxys.size;
    dayLogger.info('Result 2: ' + result2);

});
