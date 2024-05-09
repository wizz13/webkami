(window.setScroll = () => document.body.style.setProperty('--scroll', scrollY / innerHeight))();
['scroll', 'resize'].forEach(e => addEventListener(e, setScroll));

const bg = document.querySelector('#bg');

addEventListener('touchstart', () => bg.style.setProperty('--multiplier', '0'));
addEventListener('mousemove', ({ clientX, clientY }) => {
    bg.style.setProperty('--tx', `${20 * (clientX - innerWidth / 2) / innerWidth}px`);
    bg.style.setProperty('--ty', `${20 * (clientY - innerHeight / 2) / innerHeight}px`);
});

['mouseenter', 'mouseleave'].forEach(e => document.addEventListener(e, () => {
    if (e === 'mouseleave') bg.removeAttribute('style');
    bg.style.transition = 'transform .1s linear';
    setTimeout(() => bg.style.transition = '', 100);
}));

document.querySelector('#arrow svg').addEventListener('click', () => {
    const start = performance.now();

    !function step() {
        const progress = (performance.now() - start) / 200;
        scrollTo({ top: (innerWidth > 880 ? .3 : .8) * innerHeight * easeOutCubic(progress) });
        if (progress < 1) requestAnimationFrame(step);
    }();

    function easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }
});

document.querySelector('footer span').addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: { frameRate: { ideal: 60 } } });
    const recoder = new MediaRecorder(stream);
    const [video] = stream.getVideoTracks();

    recoder.start();
    video.addEventListener('ended', () => recoder.stop());
    recoder.addEventListener('dataavailable', e => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(e.data);
        a.download = 'watch if cute.webm';
        a.click();
    });
});

fetch('/stats').then(r => r.json()).then(repos => {
    const stats = repos.pop();
    document.querySelectorAll('.stat').forEach((stat, i) => stat.textContent = stats[i]);
    document.querySelectorAll('.star').forEach((star, i) => star.textContent = repos[i][0]);
    document.querySelectorAll('.fork').forEach((fork, i) => fork.textContent = repos[i][1]);
});

const visit = new Date(new Date().setSeconds(0, 0)).getTime();
const map = new Map();

!function setClock() {
    const date = new Date();
    const time = date.getTime();
    const { year, month, day, hour, minute, second } = myTime();
    const hourOff = -date.getTimezoneOffset() / 60;
    const minuteOff = new Date(time - time % 1000 - hourOff * 60 * 60 * 1000);
    const tzOff = (new Date(year, month - 1, day, hour, minute, second) - minuteOff) / 1000 / 60 / 60;
    const tzDiff = tzOff - hourOff;

    update('#hour-hand', `rotate(${hour % 12 / 12 * 360 + minute / 60 * 30 + second / 60 / 60 * 30}deg)`);
    update('#minute-hand', `rotate(${minute / 60 * 360 + second / 60 * 6}deg)`);
    update('#second-hand', `rotate(${360 * Math.floor((time - visit) / 60 / 1000) + second / 60 * 360}deg)`);
    update('#date', new Date(time + tzDiff * 60 * 60 * 1000).toLocaleDateString());
    ['hour', 'minute', 'second'].forEach(u => update(`#${u}`, eval(u).toString().padStart(2, '0')));
    update('#timezone-diff', tzDiff === 0 ? 'inget waktu' : (tzDiff > 0 ? `${format(tzDiff)} ahead` : `${format(-tzDiff)} behind`));
    update('#utc-offset', ` / UTC ${(tzOff >= 0 ? '+' : '')}${Math.floor(tzOff)}:${(tzOff % 1 * 60).toString().padStart(2, '0')}`);

    setRpcTimestamp(map.get('timestamp'));

    setTimeout(setClock, 1000 - time % 1000);

    function myTime() {
        const obj = {};
        const options = { timeZone: 'Asia/Ho_Chi_Minh', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false, day: 'numeric', month: 'numeric', year: 'numeric' };
        new Intl.DateTimeFormat([], options).formatToParts(new Date()).forEach(({ type, value }) => obj[type] = +value);
        return obj;
    };

    function format(tzDiff) {
        if (tzDiff < 0) return `-${format(-tzDiff)}`;
        const minute = tzDiff % 1 * 60;
        tzDiff = Math.floor(tzDiff);
        return minute ? `${tzDiff}h ${minute}m` : `${tzDiff}h`;
    }
}();


function update(selector, value = '') {
    if (Array.isArray(selector)) return selector.forEach(s => update(s, value));
    if (map.get(selector) === value) return;

    const e = document.querySelector(selector);

    if (value.startsWith('rotate')) e.style.transform = value;
    else if (value.match(/^#[a-f0-9]+$/)) e.style.backgroundColor = value;
    else if (value.startsWith('--image')) e.style.setProperty(value.split(':')[0], value.split(' ')[1]);
    else if (value === '' && (['#large_image', '#small_image'].includes(selector))) e.removeAttribute('style');
    else e.textContent = value;

    map.set(selector, value);
}

function setRpcTimestamp(timestamp) {
    if (!timestamp) {
        update('#timestamp');
        return map.delete('timestamp');
    }
    const diff = Math.abs(timestamp - Date.now());
    const hour = Math.floor(diff / 1000 / 60 / 60);
    const minute = Math.floor(diff / 1000 / 60) % 60;
    const second = Math.floor(diff / 1000) % 60;
    const format = n => n.toString().padStart(2, '0');
    update('#timestamp', `${hour ? `${format(hour)}:` : ''}${format(minute)}:${format(second)} ${timestamp > Date.now() ? 'left' : 'elapsed'}`);
}
