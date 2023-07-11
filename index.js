window.addEventListener('load', function () {
    let entranceFee = 10000;

    // Bonus pool value
    const bonusPoolText = document.createElement('h1');
    bonusPoolText.className = 'bonusPoolText';
    document.body.appendChild(bonusPoolText);

    // Container for roulette
    const container = document.createElement('div');
    container.className = 'container';
    document.body.appendChild(container);

    const resultScr = resultScreen();
    let resultShow = false;
    document.body.appendChild(resultScr);

    const state = document.createElement('div');
    state.className = 'state';
    document.body.appendChild(state);

    const options = [
        // {startAngle: 140, angle: 220, bgColor: '#3772ff', text: '沒中', onStop: () => resultScr.show('🎉恭喜沒中哈哈🎉')},
        // {startAngle: 20, angle: 120, bgColor: '#f038ff', text: '小獎', onStop: onSmall},
        // {startAngle: 0, angle: 20, bgColor: '#F6F740', text: '大獎', onStop: onBig},
    ];
    const rewards = [];
    rewards[0] = [];
    for (let i = 0; i < 10; i++)
        rewards[0].push({startAngle: i * 36 + 10, angle: 26, bgColor: '#3772ff', text: '沒中', onStop: onNone});
    options.push(...rewards[0]);

    rewards[1] = [];
    for (let i = 1; i < 10; i++) {
        if (i === 5) continue;
        rewards[1].push({startAngle: i * 36, angle: 10, bgColor: '#f038ff', text: '小獎', onStop: onSmall});
    }
    options.push(...rewards[1]);

    rewards[2] = [];
    rewards[2].push({startAngle: 0, angle: 10, bgColor: '#F6F740', text: '大獎', onStop: onBig});
    rewards[2].push({startAngle: 180, angle: 10, bgColor: '#F6F740', text: '大獎', onStop: onBig});
    options.push(...rewards[2]);

    const roulette = createRoulette(options);
    container.appendChild(roulette);

    const arrow = document.createElement('img');
    arrow.src = './arrow.svg';
    arrow.className = 'arrow';
    container.appendChild(arrow);

    // Init
    const standard = gaussian(0, 1, 1, 20);
    let spinning = false;
    let stopNowFunction = null;
    let bonusPoolValue = 0;
    let forceSmall = false;
    let forceBig = false;
    updatePoolValueText();

    // const a = {};
    // for (let i = 0; i < 10000; i++) {
    //     let random = standard();
    //     if (a[random * 10 | 0])
    //         a[random * 10 | 0]++;
    //     else
    //         a[random * 10 | 0] = 1;
    // }
    // console.log(a);


    window.addEventListener('keyup', function (ev) {
        if (ev.key === 'ArrowUp') {
            bonusPoolValue += 10000;
            updatePoolValueText();
        } else if (ev.key === 'ArrowDown') {
            bonusPoolValue -= 10000;
            if (bonusPoolValue < 0)
                bonusPoolValue = 0;
            updatePoolValueText();
        }

        if (ev.key === '1') {
            forceSmall = !forceSmall;
            updateState();
        } else if (ev.key === '=') {
            forceBig = !forceBig;
            updateState();
        }

        if (ev.key === ' ') {
            // Return if result is showing
            if (resultShow) {
                resultScr.hide();
                resultShow = false;
                return;
            }

            if (spinning) {
                // Stop wheel now
                if (stopNowFunction)
                    stopNowFunction();
                return;
            }
            spinning = true;
            bonusPoolValue += entranceFee;
            updatePoolValueText();
            console.log('start');

            // Get random angle
            let random = standard();
            if (random < 0.5)
                random = 0.5 - random;
            else
                random = 1 - random + 0.5;
            random = Math.max(0.005, Math.min(random, 0.995));

            // Get random section
            let option;
            if (bonusPoolValue < 30000)
                option = rewards[0];
            else {
                const random = Math.random();
                if (bonusPoolValue < 1000000)
                    option = rewards[random < 0.2 ? 1 : 0];
                else
                    option = rewards[random < 0.0005 ? 2 : random < 0.3 ? 1 : 0];
            }
            // hack
            if (forceSmall)
                option = rewards[1];
            if (forceBig)
                option = rewards[2];

            option = option[Math.random() * option.length | 0];

            stopNowFunction = startSpin(roulette.firstElementChild, 270 - (option.startAngle + random * (option.angle - 2) + 1), function () {
                resultShow = true;
                option.onStop();
                spinning = false;
                forceSmall = false;
                forceBig = false;
                updateState();
            });
        }
    });

    function onNone() {
        setTimeout(function () {
            resultScr.show('🎉恭喜沒中哈哈🎉');
        }, 500);
    }

    function onSmall() {
        setTimeout(function () {
            bonusPoolValue -= entranceFee * 3;
            if (bonusPoolValue < 0)
                bonusPoolValue = 0;
            updatePoolValueText();
            resultScr.show('🎉恭喜中小獎, 獲得' + format(entranceFee * 3) + '元🎉');
        }, 500);
    }

    function onBig() {
        setTimeout(function () {
            resultScr.show('🎉恭喜中大獎獲得' + format(bonusPoolValue) + '元🎉');
            bonusPoolValue = 0;
            updatePoolValueText();
        }, 500);
    }

    function updatePoolValueText() {
        if (bonusPoolValue === 0)
            bonusPoolText.innerHTML = '獎金池 : 0 元';
        else
            bonusPoolText.innerHTML = '獎金池 : <span>' + format(bonusPoolValue) + '</span> 元';
    }

    function updateState() {
        state.style.background = forceSmall ? 'blue' : forceBig ? 'red' : 'black';
    }
});

function resultScreen() {
    const screen = document.createElement('div');
    screen.className = 'resultScreen'
    screen.style.display = 'none';

    const title = document.createElement('h1');
    screen.appendChild(title);

    screen.show = function (text) {
        title.textContent = text;
        screen.style.display = 'block';
    };

    screen.hide = function () {
        screen.style.display = 'none';
    };

    return screen;
}

function startSpin(obj, angle, onStop) {
    if (!obj.angle)
        obj.angle = 0;

    let stopNow = false;
    const startMaxTurnAngle = 360 * 3;
    const endTurnAngle = 360 * 3;
    const speed = 360 * 1.8; // Deg per sec

    // Start spin
    const startTurnAngle = startMaxTurnAngle - obj.angle;
    const startDuration = startTurnAngle / speed * 1000;
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

        if (time < startDuration && !stopNow)
            requestAnimationFrame(start);
        else
            stopSpin();
    }

    const stopSpeed = speed;
    let stopTurnAngle;

    function stopSpin() {
        startAngle = obj.angle;
        stopTurnAngle = angle += endTurnAngle - obj.angle;
        // const startSpeed = (cubicBezier(0.01, bezier[0], bezier[1], bezier[2], bezier[3]) - cubicBezier(0, bezier[0], bezier[1], bezier[2], bezier[3])) / 0.01;
        // stopDuration = angle * startSpeed / speed * 1000;
        startTime = window.performance.now();
        requestAnimationFrame(stop);
    }

    function stop() {
        const time = (window.performance.now() - startTime);
        const m = Math.min(1, (angle + 2) / stopTurnAngle * 2);
        let angleChange = stopSpeed * m / 1000 * time;

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

    // Stop now
    return function () {
        stopNow = true;
    }
}

function createRoulette(options) {
    const r = 100;
    const x = 100;
    const y = 100;

    const roulette = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    roulette.setAttribute('width', '200');
    roulette.setAttribute('height', '200');
    roulette.setAttribute('viewBox', '0 0 200 200');
    roulette.classList.add('roulette');
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform-origin', x + ' ' + y);

    // Option
    for (const option of options) {
        group.appendChild(createPie(x, y, r, option.startAngle, option.angle, option.bgColor));
        group.appendChild(createSvgTextWithAngle(x, y, r * 0.9, option.startAngle + option.angle / 2 + 1, option.text, 10, '#FFFFFF'));
    }
    // Split line
    for (const option of options) {
        group.appendChild(createSvgLineWithAngle(x, y, option.startAngle, r, 1, '#FFFFFF'));
    }
    // Center
    group.appendChild(createSvgCircle(x, y, 2, {fill: 'white'}));

    roulette.appendChild(group);
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
function gaussian(min, max, skew, sig) {
    return function () {
        let num;
        do {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            num = Math.sqrt(-sig * Math.log(u)) * Math.cos(sig * Math.PI * v);
            num = num / 10.0 + 0.5;
            // if (num > 1 || num < 0)
            //     console.log(num);
        } while (num > 1 || num < 0);

        return Math.pow(num, skew) * (max - min) + min;
    }
}