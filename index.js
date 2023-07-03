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


    let startTime = 0;
    window.addEventListener('keyup', function (ev) {
        if (ev.key === ' ') {
            console.log('start');

            startSpin(roulette, -90 - (140 + Math.random() * 220));
        }

        // if (ev.key === 'w') {
        //     const timePass = window.performance.now() - startTime;
        //     let percent = timePass / duration;
        //     if (percent > 1) percent = 1;
        //     console.log(angle * cubicBezier(percent, {x: 0.3, y: 0.8}, {x: 0.4, y: 1}));
        // }
    })
});

function startSpin(obj, angle) {
    if (!obj.angle)
        obj.angle = 0;

    const startMaxTurnAngle = 360 * 2;
    const endTurnAngle = 360 * 5;

    const bezier = [0, 0, 1, 1];
    const speed = 360 * 3; // Deg per sec

    for (let i = 0; i < 1; i += 0.1) {
        console.log(cubicBezier(i, bezier[0], bezier[1], bezier[2], bezier[3]));
    }

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

    let stopDuration;

    function stopSpin() {
        startAngle = obj.angle;
        angle += endTurnAngle - obj.angle;
        const startSpeed = (cubicBezier(0.01, bezier[0], bezier[1], bezier[2], bezier[3]) - cubicBezier(0, bezier[0], bezier[1], bezier[2], bezier[3])) / 0.01;

        stopDuration = angle * startSpeed / speed * 1000;
        startTime = window.performance.now();
        requestAnimationFrame(stop);
    }

    function stop() {
        const time = (window.performance.now() - startTime);
        let newTime = time / stopDuration;
        if (newTime > 1)
            newTime = 1;
        newTime = cubicBezier(newTime, bezier[0], bezier[1], bezier[2], bezier[3]);
        const nowAngle = (startAngle + angle * newTime) % 360;
        obj.angle = nowAngle;
        obj.style.rotate = nowAngle + 'deg';

        if (time < stopDuration)
            requestAnimationFrame(stop);
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
    return  Math.pow(1 - t, 3) * p1y +
        3 * Math.pow(1 - t, 2) * t * y1 +
        3 * (1 - t) * Math.pow(t, 2) * y2 +
        Math.pow(t, 3) * p4y;
}

// function bezier(t, p1, p2) {
//     const initial = 0;
//     const final = 1;
//     return (1 - t) * (1 - t) * (1 - t) * initial
//         +
//         3 * (1 - t) * (1 - t) * t * p1
//         +
//         3 * (1 - t) * t * t * p2
//         +
//         t * t * t * final;
// }