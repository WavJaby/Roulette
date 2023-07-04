window.addEventListener('load', function () {
    const container = document.createElement('div');
    container.classList.add('container');
    document.body.appendChild(container);

    const options = [
        {startAngle: 0, angle: 20, bgColor: '#F6F740', text: '大獎'},
        {startAngle: 20, angle: 120, bgColor: '#f038ff', text: '小獎'},
        {startAngle: 140, angle: 220, bgColor: '#3772ff', text: '沒中'},
    ];
    const roulette = createRoulette(options);
    container.appendChild(roulette);

    const arrow = document.createElement('img');
    arrow.src = './arrow.svg';
    arrow.classList.add('arrow');
    container.appendChild(arrow);

    const standard = gaussian(0, 10);
    let a = 0;
    for (let i = 0; i < 1000000000; i++) {
        const j = standard();
        if (j > a)
            a = j;
    }
    console.log(a)

    // 獎金池
    let spinning = false;
    let entranceFee = 10000;
    let bonusPoolValue = 0;
    const bonusPool = document.createElement('h1');
    updateBonusText();
    document.body.appendChild(bonusPool);

    window.addEventListener('keyup', function (ev) {
        if (ev.key === ' ') {
            if (spinning)
                return;
            spinning = true;
            bonusPoolValue += entranceFee;
            updateBonusText();
            console.log('start');

            startSpin(roulette, -90 - (140 + Math.random() * 220), function () {
                spinning = false;
            });
        }
    });

    function updateBonusText() {
        bonusPool.innerText = '獎金池 : ' + format(bonusPoolValue) + ' 元';
    }
});

function startSpin(obj, angle, onStop) {
    if (!obj.angle)
        obj.angle = 0;

    const startMaxTurnAngle = 360 * 5;
    const endTurnAngle = 360 * 4;

    // const bezier = [0, 0, 1, 1];
    const speed = 360 * 3; // Deg per sec

    const startTurnAngle = startMaxTurnAngle - obj.angle;
    const startDuration = startTurnAngle / speed * 1000;

    // Start spin
    let startTime = window.performance.now();
    let startAngle = obj.angle;
    requestAnimationFrame(start);

    function start() {
        const time = window.performance.now() - startTime;
        let newTime = time / startDuration;
        if (newTime > 1)
            newTime = 1;
        const nowAngle = (startAngle + startTurnAngle * newTime) % 360;
        obj.angle = nowAngle;
        obj.style.rotate = nowAngle + 'deg';

        if (time < startDuration)
            requestAnimationFrame(start);
        else
            stopSpin();
    }

    const stopSpeed = speed;
    let stopTotalAngle;
    let stopDuration;

    function stopSpin() {
        startAngle = obj.angle;
        stopTotalAngle = angle += endTurnAngle - obj.angle;
        // const startSpeed = (cubicBezier(0.01, bezier[0], bezier[1], bezier[2], bezier[3]) - cubicBezier(0, bezier[0], bezier[1], bezier[2], bezier[3])) / 0.01;

        // stopDuration = angle * startSpeed / speed * 1000;
        startTime = window.performance.now();
        requestAnimationFrame(stop);
    }

    function stop() {
        const time = (window.performance.now() - startTime);
        const m = Math.min(1, (angle + 5) / stopTotalAngle);
        let angleChange = stopSpeed * m / 1000 * time;

        console.log(angleChange)

        if (angleChange > angle)
            angleChange = angle;

        angle -= angleChange;
        const nowAngle = (obj.angle + angleChange) % 360;
        obj.angle = nowAngle;
        obj.style.rotate = nowAngle + 'deg'

        if (angle > 0)
            requestAnimationFrame(stop);
        else
            onStop();

        startTime = window.performance.now();
    }
}

function createRoulette(options) {
    const roulette = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    roulette.setAttribute('width', '200');
    roulette.setAttribute('height', '200');
    roulette.setAttribute('viewBox', '0 0 200 200');
    roulette.classList.add('roulette');

    const r = 100;
    const x = 100;
    const y = 100;
    // Option
    for (const option of options) {
        roulette.appendChild(createPie(x, y, r, option.startAngle, option.angle, option.bgColor));
        roulette.appendChild(createSvgTextWithAngle(x, y, r * 0.9, option.startAngle + option.angle / 2, option.text, 15, '#FFFFFF'));
    }
    // Split line
    for (const option of options) {
        roulette.appendChild(createSvgLineWithAngle(x, y, option.startAngle, r, 1, '#FFFFFF'));
    }
    // Center
    roulette.appendChild(createSvgCircle(x, y, 2, {fill: 'white'}));

    return roulette;
}

function createPie(x, y, r, startAngle, angle, color) {
    angle /= 360;
    startAngle /= 360;
    const length = r * Math.PI;
    return createSvgCircle(x, y, r / 2, {
        'fill': 'none',
        'stroke': color,
        'stroke-width': r,
        'stroke-dasharray': '0 ' + ((startAngle) * length) + ' ' + ((angle) * length) + ' ' + (length),
    });
    // const a = Math.max(0, angle - 0.25);
    // const b = Math.max(0, startAngle - 0.25);
    // return createSvgCircle(x, y, r / 2, {
    //     'fill': 'none',
    //     'stroke': color,
    //     'stroke-width': r,
    //     'stroke-dasharray': '0 ' + (b * length) + ' ' +
    //         ((a + startAngle - b) * length) + ' ' +
    //         ((0.75 - a) * length) + ' ' +
    //         ((angle - a) * length) + ' ' +
    //         length,
    // });
}

function createSvgCircle(x, y, r, options) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', r);
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    if (options)
        for (const optionsKey in options) {
            circle.setAttribute(optionsKey, options[optionsKey]);
        }
    return circle;
}

function createSvgLineWithAngle(x, y, angle, r, width, color, options) {
    angle *= Math.PI / 180;
    return createSvgLine(x, y, x + Math.cos(angle) * r, y + Math.sin(angle) * r, width, color, options);
}

function createSvgLine(x1, y1, x2, y2, width, color, options) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke-width', width);
    line.setAttribute('stroke', color);
    if (options)
        for (const optionsKey in options) {
            line.setAttribute(optionsKey, options[optionsKey]);
        }
    return line;
}

function createSvgTextWithAngle(x, y, r, angle, text, size, color, options) {
    angle *= Math.PI / 180;
    x += Math.cos(angle) * r;
    y += Math.sin(angle) * r;
    if (!options)
        options = {};
    options.transform = 'rotate(' + (angle * 180 / Math.PI) + ' ' + x + ' ' + y + ')';
    options['text-anchor'] = 'end';
    options['dominant-baseline'] = 'middle';
    return createSvgText(x, y, text, size, color, options);
}

function createSvgText(x, y, text, size, color, options) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    element.setAttribute('font-size', size);
    element.setAttribute('fill', color);
    element.textContent = text;
    if (options)
        for (const optionsKey in options) {
            element.setAttribute(optionsKey, options[optionsKey]);
        }
    return element;
}

function format(number) {
    return String(number)
        .replace(/(.)(?=(\d{3})+$)/g, '$1,');
}

function bezier(t, p0, p1, p2, p3) {
    const cX = 3 * (p1.x - p0.x),
        bX = 3 * (p2.x - p1.x) - cX,
        aX = p3.x - p0.x - cX - bX;

    const cY = 3 * (p1.y - p0.y),
        bY = 3 * (p2.y - p1.y) - cY,
        aY = p3.y - p0.y - cY - bY;

    const x = (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x;
    const y = (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y;

    return {x: x, y: y};
}

function cubicBezier(t, x1, y1, x2, y2) {
    // P = Math.pow(1 - t, 3) * P1 +
    //     3 * Math.pow(1 - t, 2) * t * P2 +
    //     3 * (1 - t) * Math.pow(t, 2) * P3 +
    //     Math.pow(t, 3) * P4;

    const p1y = 0, p4y = 1;
    return Math.pow(1 - t, 3) * p1y +
        3 * Math.pow(1 - t, 2) * t * y1 +
        3 * (1 - t) * Math.pow(t, 2) * y2 +
        Math.pow(t, 3) * p4y;
}

// returns a gaussian random function with the given mean and stdev.
function gaussian(mean, stdev) {
    let y2;
    let use_last = false;
    return function () {
        let y1;
        if (use_last) {
            y1 = y2;
            use_last = false;
        } else {
            let x1, x2, w;
            do {
                x1 = 2.0 * Math.random() - 1.0;
                x2 = 2.0 * Math.random() - 1.0;
                w = x1 * x1 + x2 * x2;
            } while (w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w)) / w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
        }

        const retVal = mean + stdev * y1;
        if (retVal > 0)
            return retVal;
        return -retVal;
    }
}