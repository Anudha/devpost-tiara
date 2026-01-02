const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value = 0.15;
masterGain.connect(audioCtx.destination);

const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const instruments = [
    { name: 'FLUTE', wave: 'triangle' },
    { name: 'BRASS', wave: 'sawtooth' },
    { name: 'LEAD', wave: 'square' }
];
const history = [];

const container = document.getElementById('tracks');
const log = document.getElementById('log');

instruments.forEach(inst => {
    const track = document.createElement('div');
    track.className = 'track';
    track.innerHTML = `<div class="label">${inst.name}</div><div class="kb-scroll"><div class="kb"></div></div>`;
    const kb = track.querySelector('.kb');

    for (let oct = 3; oct <= 5; oct++) {
        noteNames.forEach((name, i) => {
            const freq = 440 * Math.pow(2, (((oct + 1) * 12 + i) - 69) / 12);
            const key = document.createElement('div');
            key.className = 'key';
            key.innerText = name + oct;
            
            // Removed e.buttons check - plays on mere hover
            key.onmouseenter = () => play(freq, key, name + oct, inst.wave, inst.name);
            kb.appendChild(key);
        });
    }
    container.appendChild(track);
});

function play(f, el, n, w, inst) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    el.classList.add('active');
    setTimeout(() => el.classList.remove('active'), 150);

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = w;
    osc.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
    
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.6);

    history.push(`${inst}:${n}`);
    log.innerText = history.slice(-20).join(" | ");
    log.scrollTop = log.scrollHeight;
}

document.getElementById('export').onclick = () => {
    const blob = new Blob(["Index,Note\n" + history.map((h, i) => `${i},${h}`).join("\n")], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'synth_log.csv';
    a.click();
};
