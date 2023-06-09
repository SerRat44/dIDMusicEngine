function sfc32(a, b, c, d) {
    return function() {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21 | c >>> 11);
        d = d + 1 | 0;
        t = t + d | 0;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}

function xmur3(str) {
    for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    }
    return function() {
        h = Math.imul(h ^ h >>> 16, 2246822507);
        h = Math.imul(h ^ h >>> 13, 3266489909);
        return (h ^= h >>> 16) >>> 0;
    }
}

let randomFunction = Math.random;

function seedRNG(seed) {
    const seedHasher = xmur3(seed);
    randomFunction = sfc32(seedHasher(), seedHasher(), seedHasher(), seedHasher());
}

function choose(array) {
    return array[Math.floor(rnd() * array.length)];
}

function rndInt(max) {
    return Math.floor(rnd() * max);
}

function rndBetween(min, max) {
    return rnd() * (max - min) + min;
}

function fill(count, fn) {
    return new Array(count).fill(undefined).map((x, i) => fn(i));
}

function flip(trueChance = 0.5) {
    return rnd() < trueChance;
}

function rnd() {
    return randomFunction();
}

const scales = {
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    phrygianDominant: [0, 1, 4, 5, 7, 8, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    diminished: [0, 2, 3, 5, 6, 8, 9, 11]
};

const chordTypes = {
    triad: [0, 2, 4],
};

function chooseRandomScale(currentScale) {
    const scaleNames = Object.keys(scales);
    if (currentScale === null) {
        return scales[choose(scaleNames)];
    }
    let newScaleName;
    do {
        newScaleName = choose(scaleNames);
    } while (scales[newScaleName] === currentScale);
    return scales[newScaleName];
}

function modulate(key, scale) {
    choose([
        function() {
            scale = chooseRandomScale(scale);
        },
        function() {
            if (Math.random() < 0.5) {
                key = (key + 7) % 12;
            } else {
                key = (key + 5) % 12;
            }
        },
    ])();
    return [key, scale];
}

const PatternSize = 64;


function getChord(context, rowIndex) {
    const {
        progression,
        key,
        scale
    } = context;
    const progIndex = Math.floor(rowIndex / 4);
    const chordNumber = progression[progIndex];
    return chordTypes.triad.map(noteIndex => key + scale[(chordNumber - 1 + noteIndex) % scale.length]);
}



function bass(context) {
    return fill(PatternSize, i => {
        const chord = getChord(context, i);
        const palmMute = flip(0.5) ? 0.5 : 1;
        return {
            note: i % 2 === 1 ? 'cont' : chord[0] + (Math.floor(i / 2) % 2) * 12 - 12,
            vel: palmMute,
            fx: {
                pulseWidth: 0
            },
        };
    });
}

function bass2(context) {
    return fill(PatternSize, i => {
        const chord = getChord(context, i);
        const noteOptions = [chord[0] - 4, chord[0] + 5, chord[0] - 12];
        return {
            note: i % 8 === 0 ? choose(noteOptions) : 'cont',
            vel: 2,
            fx: {
                pulseWidth: rnd()
            }
        };
    });
}


function powerChord(rootNote) {
    return [rootNote, rootNote + 7];
}

function riff(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.7);
        const palmMute = flip(0.5) ? 0.5 : 1;
        const chromaticRun = flip(0.25);
        const chromaticOffset = chromaticRun ? rndInt(4) - 2 : 0;
        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + chromaticOffset : rootNote + chromaticOffset,
            vel: palmMute,
            fx: {
                glide: flip(0.25) ? rndBetween(0.1, 0.7) : 0,
            },
        });
    }
    return pattern;
}

function aggressiveRiff(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.9);
        const palmMute = flip(0.7) ? 0.5 : 1;
        const chromaticRun = flip(0.3);
        const chromaticOffset = chromaticRun ? rndInt(4) - 2 : 0;
        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + chromaticOffset : rootNote + chromaticOffset,
            vel: palmMute,
            fx: {
                glide: flip(0.2) ? rndBetween(0.1, 0.7) : 0,
            },
        });
    }
    return pattern;
}

function tremoloRiff(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.9);
        const chromaticRun = flip(0.5);
        const chromaticOffset = chromaticRun ? rndInt(4) - 2 : 0;
        const intervalJump = flip(0.3) ? rndInt(5) - 2 : 0;

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + chromaticOffset : rootNote + chromaticOffset + intervalJump,
            vel: 1,
            len: 1,
            fx: {
                glide: flip(0.3) ? rndBetween(0.1, 0.7) : 0,
            },
        });
    }
    return pattern;
}

function epicMetalSolo(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.9);
        const palmMute = flip(0.5) ? 0.5 : 1;
        const chromaticRun = flip(0.5);
        const chromaticOffset = chromaticRun ? rndInt(4) - 2 : 0;
        const fastNotes = flip(0.8);
        const noteLength = fastNotes ? 1 : 2;
        const pinchHarmonic = flip(0.2);
        const tapping = flip(0.15);
        const sweepPicking = flip(0.1);
        const legato = flip(0.3);

        const fxOptions = {
            pinchHarmonic: pinchHarmonic ? rndBetween(0.5, 1) : 0,
            tapping: tapping ? rndBetween(0.5, 1) : 0,
            sweepPicking: sweepPicking ? rndBetween(0.5, 1) : 0,
            legato: legato ? rndBetween(0.5, 1) : 0,
            glide: flip(0.3) ? rndBetween(0.1, 0.7) : 0,
        };

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + chromaticOffset : rootNote + chromaticOffset,
            vel: palmMute,
            len: noteLength,
            fx: fxOptions,
        });
    }
    return pattern;
}

function gallopRhythm(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.9);
        const palmMute = flip(0.5) ? 0.5 : 1;
        const noteLength = i % 4 === 0 ? 2 : 1;
        const intervalJump = flip(0.2) ? rndInt(4) - 2 : 0;

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + intervalJump : rootNote + intervalJump,
            vel: palmMute,
            len: noteLength,
            fx: {
                glide: flip(0.3) ? rndBetween(0.1, 0.7) : 0,
            },
        });
    }
    return pattern;
}

function chuggingRhythm(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const chug = i % 2 === 0 && flip(0.9);
        const noteLength = chug ? 1 : 2;
        const intervalJump = flip(0.15) ? rndInt(4) - 2 : 0;

        pattern.push({
            note: chug ? choose(powerChordNotes) + intervalJump : rootNote + intervalJump,
            vel: chug ? 0.5 : 1,
            len: noteLength,
            fx: {
                glide: flip(0.3) ? rndBetween(0.1, 0.7) : 0,
            },
        });
    }
    return pattern;
}

function alternatePicking(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.7);
        const chromaticRun = flip(0.2);
        const chromaticOffset = chromaticRun ? rndInt(4) - 2 : 0;

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) + chromaticOffset : rootNote + chromaticOffset,
            vel: 1,
            fx: {
                alternatePicking: flip(0.8) ? rndBetween(0.5, 1) : 0,
            },
        });
    }
    return pattern;
}

function sweepArpeggios(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.9);

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) : rootNote,
            vel: 1,
            fx: {
                sweepArpeggio: flip(0.5) ? rndBetween(0.5, 1) : 0,
            },
        });
    }
    return pattern;
}

function harmonics(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.7);

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) : rootNote,
            vel: 1,
            fx: {
                harmonic: flip(0.2) ? rndBetween(0.5, 1) : 0,
            },
        });
    }
    return pattern;
}

function sliding(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.7);

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) : rootNote,
            vel: 1,
            fx: {
                sliding: flip(0.4) ? rndBetween(0.5, 1) : 0,
            },
        });
    }
    return pattern;
}

function dimebagWhammy(context) {
    const octave = choose([0, 12, 24]);
    const pattern = [];
    for (let i = 0; i < PatternSize; i++) {
        const chord = getChord(context, i);
        const rootNote = chord[0] + octave;
        const powerChordNotes = powerChord(rootNote);
        const usePowerChord = flip(0.7);

        pattern.push({
            note: usePowerChord ? choose(powerChordNotes) : rootNote,
            vel: 1,
            fx: {
                dimebagWhammy: flip(0.15) ? rndBetween(0.5, 1) : 0,
            },
        });
    }
    return pattern;
}

function emptyNote() {
    return fill(PatternSize, _ => ({
        note: '---'
    }));
}

function emptyDrum() {
    return fill(PatternSize, _ => ({
        drum: '---'
    }));
}


function metalDrum() {
    return fill(PatternSize, i => ({
        drum: i % 8 === 0 ? 'KCK' : i % 8 === 4 ? 'SNR' : (i % 2 === 0 && flip(0.8)) ? 'KCK' : flip(0.3) ? choose(['KCK', 'SNR']) : 'NSS',
        vel: 0.6 + 0.2 * (1 - (i % 2)),
        doubleBass: i % 4 === 2 ? 'KCK' : '---',
    }));
}

function aggressiveMetalDrum() {
    return fill(PatternSize, i => ({
        drum: i % 8 === 0 ? 'KCK' : i % 8 === 4 ? 'SNR' : (i % 2 === 0 && flip(0.85)) ? 'KCK' : flip(0.35) ? choose(['KCK', 'SNR', 'CYM']) : 'NSS',
        vel: 0.6 + 0.2 * (1 - (i % 2)),
        doubleBass: i % 2 === 0 || flip(0.6) ? 'KCK' : '---',
        fill: i % 16 === 15 ? choose(['SDR', 'CYM', 'FTM']) : '---',
    }));
}

function blastBeatDrum() {
    return fill(PatternSize, i => ({
        drum: i % 2 === 0 ? 'KCK' : 'SNR',
        vel: 0.6 + 0.2 * (1 - (i % 2)),
        doubleBass: '---',
    }));
}

function breakdownDrum() {
    return fill(PatternSize, i => ({
        drum: i % 8 === 0 ? 'KCK' : i % 8 === 4 ? 'SNR' : (i % 4 === 0 && flip(0.4)) ? 'CYM' : (i % 4 === 2 && flip(0.3)) ? 'FTM' : 'NSS',
        vel: 0.6 + 0.2 * (1 - (i % 2)),
        doubleBass: i % 8 === 0 ? 'KCK' : '---',
    }));
}



const progressions = [
    [1, 1, 6, 6, 4, 4, 5, 5, 3, 3, 4, 4, 5, 5, 6, 6],
    [1, 1, 6, 6, 4, 4, 5, 5, 1, 1, 6, 6, 3, 3, 5, 5],
    [4, 4, 5, 5, 1, 1, 1, 1, 5, 5, 6, 6, 1, 1, 1, 1],
    [1, 1, 6, 6, 2, 2, 5, 5, 1, 1, 6, 6, 2, 2, 5, 5],
    [5, 5, 1, 1, 6, 6, 4, 4, 5, 5, 1, 1, 6, 6, 4, 4],
    [1, 1, 4, 4, 5, 5, 1, 1, 6, 6, 4, 4, 5, 5, 1, 1],
    [5, 5, 4, 4, 1, 1, 1, 1, 5, 5, 6, 6, 1, 1, 1, 1],
    [5, 5, 6, 6, 2, 2, 4, 4, 5, 5, 6, 6, 2, 2, 4, 4],
    [6, 6, 1, 1, 4, 4, 3, 3, 6, 6, 1, 1, 4, 4, 3, 3],
    [4, 4, 1, 1, 5, 5, 6, 6, 4, 4, 1, 1, 5, 5, 6, 6],
    [6, 6, 6, 6, 5, 5, 5, 5, 4, 4, 4, 4, 5, 5, 5, 5],
    [1, 1, 1, 1, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5],
    [6, 6, 6, 6, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 5, 5],
    [1, 1, 4, 4, 6, 6, 5, 5, 1, 1, 4, 4, 6, 6, 5, 5],
    [1, 1, 6, 6, 4, 4, 5, 5, 1, 1, 6, 6, 4, 4, 5, 5],
    [1, 1, 6, 6, 5, 5, 4, 4, 1, 1, 6, 6, 5, 5, 4, 4],
    [1, 1, 4, 4, 6, 6, 2, 2, 1, 1, 4, 4, 6, 6, 2, 2]
];

function bpmClock() {
    let intervalHandle = {
        bpmClock: 0
    };
    let fN = 0;

    function set(bpm, frameFunction) {
        window.clearInterval(intervalHandle.bpmClock);
        intervalHandle.bpmClock = window.setInterval(() => frameFunction(fN++), (60000 / bpm) / 4);
    }

    function stop() {
        window.clearInterval(intervalHandle.bpmClock);
    }
    return {
        set,
        stop
    }
}

function mutateState(state) {
    state.songIndex++;
    if (state.songIndex % 8 === 0) {
        state.bpm = rndInt(40) + 110;
    }
    if (state.songIndex % 4 === 0) {
        [state.key, state.scale] = modulate(state.key, state.scale);
    }
    if (state.songIndex % 2 === 0) {
        state.progression = choose(progressions);
    }
    state.seedCode = hex(rndInt(255)) + hex(rndInt(255)) + hex(rndInt(255)) + hex(rndInt(255));
    seedRNG(state.seedCode);

}

let trackControl;

function genTrack() {
    const seedOrSave = document.getElementById("seedInput").value;
    const state = createInitialState(seedOrSave);

    let patterns = [
        [],
        [],
        [],
        [],
        []
    ];

    const clock = bpmClock();
    const displayObj = display();

    const ctx = new(window.AudioContext || window.webkitAudioContext)();
    const au = Audio(ctx);

    const synths = [
        au.SquareSynth(),
        au.SquareSynth(-0.5),
        au.SquareSynth(),
        au.SquareSynth(0.5),
        au.DrumSynth()
    ];

    function newPatterns() {
        seedRNG(state.seedCode);
        patterns = [
            choose([bass, bass2, emptyNote])(state),
            rnd() < 0.80 ? choose([riff, aggressiveRiff, tremoloRiff, gallopRhythm, chuggingRhythm, alternatePicking, sweepArpeggios, harmonics, sliding, dimebagWhammy, aggressiveRiff, riff])(state) : emptyNote(),
            rnd() < 0.80 ? choose([riff, aggressiveRiff, tremoloRiff, gallopRhythm, chuggingRhythm, alternatePicking, sweepArpeggios, harmonics, sliding, dimebagWhammy, aggressiveRiff, riff])(state) : epicMetalSolo(state),
            choose([emptyNote, riff, emptyNote, tremoloRiff, emptyNote, aggressiveRiff, emptyNote, harmonics, emptyNote, sliding])(state),
            rnd() < 0.90 ? choose([metalDrum, aggressiveMetalDrum, breakdownDrum, metalDrum, aggressiveMetalDrum, breakdownDrum, metalDrum, aggressiveMetalDrum, blastBeatDrum, breakdownDrum, metalDrum, aggressiveMetalDrum, breakdownDrum, metalDrum, aggressiveMetalDrum, breakdownDrum])(state) : emptyNote(),
        ];
    }

    function frame(f) {
        const positionInPattern = f % PatternSize;
        if (f % 128 === 0 && f !== 0) {
            mutateState(state);
            newPatterns();
            clock.set(state.bpm, frame);
            displayObj.track(patterns, save(state));

            console.log(patterns);
            console.log(state);
            console.log(save(state));
        }
        synths[0].play(patterns[0][positionInPattern]);
        synths[1].play(patterns[1][positionInPattern]);
        synths[2].play(patterns[2][positionInPattern]);
        synths[3].play(patterns[3][positionInPattern]);
        synths[4].play(patterns[4][positionInPattern]);

        displayObj.highlight(patterns, f);
    }

    function stop() {
        synths.forEach(synth => synth.stop());
        clock.stop();
        ctx.close();
        return;
    }

    function changeVolume(volume) {
        au.setVolume(volume);
    }

    newPatterns();
    clock.set(state.bpm, frame);
    displayObj.track(patterns, save(state));

    document.getElementById("resetBtn").disabled = false;
    document.getElementById("generateBtn").disabled = true;

    console.log(patterns);
    console.log(state);
    console.log(save(state));

    return {
        stop,
        changeVolume
    }
}

function playEffect(effect) {
    const clock = bpmClock();
    const ctx = new(window.AudioContext || window.webkitAudioContext)();
    const au = Audio(ctx);
    au.setVolume(settings.effectVolume);

    const synths = [
        au.SquareSynth(),
        au.SquareSynth(-0.5),
        au.SquareSynth(0.5)
    ];

    function noteToMidi(note) {
        const octave = parseInt(note.slice(-1));
        const pitchClass = note.slice(0, -1);
        const pitchClassToNumber = {
            "C": 0,
            "C#": 1,
            "D": 2,
            "D#": 3,
            "E": 4,
            "F": 5,
            "F#": 6,
            "G": 7,
            "G#": 8,
            "A": 9,
            "A#": 10,
            "B": 11
        };
        return 12 * octave + pitchClassToNumber[pitchClass];
    }

    const pattern = effect.notes.map(note => ({
        note: note === "---" ? "---" : noteToMidi(note)
    }));

    function frame(f) {
        const positionInPattern = f % pattern.length;
        if (f === pattern.length) {
            synths.forEach(synth => synth.stop());
            setTimeout(() => {
                ctx.close();
                clock.stop();
            }, 60 / effect.bpm * 1000);
            return;
        }
        au.setVolume(settings.effectVolume);
        synths.forEach((synth, i) => {
            synth.play(pattern[positionInPattern]);
        });
    }
    clock.set(effect.bpm, frame);
}

function hex(v) {
    return Math.floor(v).toString(16).toUpperCase().padStart(2, '0');
}

function unhex(v) {
    return parseInt(v, 16);
}

function save(state) {
    const nonRandomElements = [
        state.key,
        Object.keys(scales).indexOf(Object.keys(scales).find(key => scales[key] === state.scale)),
        progressions.indexOf(state.progression),
        state.bpm,
        state.songIndex % 256
    ];
    const saveCode = "0x" + nonRandomElements.map(hex).join("") + state.seedCode;
    return saveCode;
}

function restore(code) {
    const codeString = code.slice(2);
    const key = unhex(codeString.slice(0, 2));
    const scale = scales[Object.keys(scales)[unhex(codeString.slice(2, 4))]];
    const progression = progressions[unhex(codeString.slice(4, 6))];
    const bpm = unhex(codeString.slice(6, 8));
    const songIndex = unhex(codeString.slice(8, 10));
    const seedCode = codeString.slice(10);
    return {
        bpm,
        key,
        progression,
        scale,
        seedCode,
        songIndex
    };
}

function createInitialState(seedOrSave) {
    if (seedOrSave.startsWith("0x")) {
        return restore(seedOrSave);
    } else {
        const seed = (seedOrSave && seedOrSave.length > 0) ? seedOrSave : "" + rnd();
        seedRNG(seed);

        return {
            key: rndInt(12),
            scale: chooseRandomScale(),
            progression: progressions[rndInt(12)],
            bpm: rndInt(40) + 110,
            seedCode: createSeedCode(),
            songIndex: 0
        };
    }
}

function createSeedCode() {
    return hex(rndInt(255)) + hex(rndInt(255)) + hex(rndInt(255)) + hex(rndInt(255));
}

const A3Frequency = 440;
const A0Frequency = A3Frequency / 8;

function Audio(ctx) {
    const globalGain = gainNode();
    globalGain.connect(ctx.destination);

    function setVolume(value) {
        globalGain.gain.setValueAtTime(value, ctx.currentTime);
    }

    function oscillatorNode(type, freq = 440) {
        const node = ctx.createOscillator();
        node.type = type;
        node.frequency.value = freq;
        return node;
    }

    function waveShaperNode(curve) {
        const node = ctx.createWaveShaper();
        node.curve = new Float32Array(curve);
        return node;
    }

    function gainNode(gainAmount = 0) {
        const node = ctx.createGain();
        node.gain.value = gainAmount;
        return node;
    }

    function stereoPannerNode(pan) {
        if (ctx.createStereoPanner) {
            const node = ctx.createStereoPanner();
            node.pan.value = pan;
            return node;
        } else {
            const node = ctx.createPanner();
            node.panningModel = "equalpower";
            node.setPosition(pan, 0, 0.5);
            node.pan = node.positionX;
            return node;
        }
    }

    function SquareSynth(pan = 0) {
        const set = (a, v) => {
            a.cancelScheduledValues(ctx.currentTime);
            a.setValueAtTime(v, ctx.currentTime);
        };
        const towards = (a, v, t) => {
            a.setTargetAtTime(t, ctx.currentTime, t)
        };
        const slide = (a, v, t) => {
            a.cancelScheduledValues(ctx.currentTime);
            a.setTargetAtTime(v, ctx.currentTime, t)
        };

        const wavetableTrigger = oscillatorNode("sawtooth"),
            pulseWavetable = waveShaperNode(new Float32Array(256).fill(-1, 0, 128).fill(1, 128, 256)),
            alwaysOneWavetable = waveShaperNode(new Float32Array(2).fill(1, 0, 2)),
            wavetableOffsetGain = gainNode(),
            pulseOutputGain = gainNode(),
            outputPanner = stereoPannerNode(pan);
        wavetableTrigger.start();
        wavetableTrigger.connect(pulseWavetable);
        wavetableTrigger.connect(alwaysOneWavetable);
        alwaysOneWavetable.connect(wavetableOffsetGain);
        wavetableOffsetGain.connect(pulseWavetable);
        pulseWavetable.connect(pulseOutputGain);
        pulseOutputGain.connect(outputPanner);
        outputPanner.connect(globalGain);

        const freq = wavetableTrigger.frequency,
            width = wavetableOffsetGain.gain,
            gain = pulseOutputGain.gain;

        const decay = 0.04,
            sustain = 0.7,
            release = 0.01,
            level = 0.1;

        function noteOn(note, glide = 0) {
            const glideTime = glide / 10;
            slide(freq, A0Frequency * 2 ** (note / 12), glideTime);
            set(gain, level);
            towards(gain, level * sustain, decay);
        }

        function noteOff() {
            slide(gain, 0, release);
        }

        function play(note) {
            if (note.note === "---") {
                noteOff();
            } else if (note.note === 'cont') {
                // do nothing
            } else {
                noteOn(note.note, note.fx ? note.fx.glide : undefined);
            }
            set(width, note.fx ? (note.fx.pulseWidth || 0.0) : 0.0);
        }

        function stop() {
            const releaseTime = 0.01;
            gain.cancelScheduledValues(ctx.currentTime);
            gain.setTargetAtTime(0, ctx.currentTime, releaseTime);
            setTimeout(() => {
                outputPanner.disconnect();
            }, releaseTime * 1000);
        }
        return {
            play,
            stop
        }
    }

    function DrumSynth() {
        const toneOscillator = oscillatorNode("square", 55),
            toneGain = gainNode(),
            noiseWavetableTrigger = oscillatorNode("sawtooth", 20),
            noiseWavetable = waveShaperNode(fill(1024, x => rnd() * 2 - 1)),
            noiseGain = gainNode(),
            noisePan = stereoPannerNode(0);

        toneOscillator.start();
        noiseWavetableTrigger.start();

        toneOscillator.connect(toneGain);
        toneGain.connect(globalGain);

        noiseWavetableTrigger.connect(noiseWavetable);
        noiseWavetable.connect(noiseGain);
        noiseGain.connect(noisePan);
        noisePan.connect(globalGain);

        function play(slot) {
            const vel = slot.vel ? slot.vel : 1;
            if (slot.drum === 'KCK') {
                toneOscillator.detune.cancelScheduledValues(ctx.currentTime);
                toneOscillator.detune.setValueAtTime(3000, ctx.currentTime);
                toneOscillator.detune.setTargetAtTime(0, ctx.currentTime, 0.07);
                toneGain.gain.cancelScheduledValues(ctx.currentTime);
                toneGain.gain.setValueAtTime(0.2 * vel, ctx.currentTime);
                toneGain.gain.setValueCurveAtTime(new Float32Array([0.2 * vel, 0.2 * vel, 0.13 * vel, 0.05 * vel, 0.0]), ctx.currentTime, 0.10);
            } else if (slot.drum === 'NSS') {
                noiseGain.gain.cancelScheduledValues(ctx.currentTime);
                noiseGain.gain.setValueAtTime(0.1 * vel, ctx.currentTime);
                noiseGain.gain.setValueCurveAtTime(new Float32Array([0.1 * vel, 0.04 * vel, 0.0]), ctx.currentTime, 0.08);

                if ("pan" in noisePan) {
                    noisePan.pan.cancelScheduledValues(ctx.currentTime);
                    noisePan.pan.setValueAtTime(rnd() * 0.4 - 0.2, ctx.currentTime);
                }
            } else if (slot.drum === 'SNR') {
                toneOscillator.detune.cancelScheduledValues(ctx.currentTime);
                toneOscillator.detune.setValueAtTime(2400, ctx.currentTime);
                toneOscillator.detune.setTargetAtTime(600, ctx.currentTime, 0.04);
                toneGain.gain.cancelScheduledValues(ctx.currentTime);
                toneGain.gain.setValueAtTime(0.15 * vel, ctx.currentTime);
                toneGain.gain.setValueCurveAtTime(new Float32Array([0.2 * vel, 0.2 * vel, 0.13 * vel, 0.05 * vel, 0.0]), ctx.currentTime, 0.10);

                noiseGain.gain.cancelScheduledValues(ctx.currentTime);
                noiseGain.gain.setValueAtTime(0.2 * vel, ctx.currentTime);
                noiseGain.gain.setValueCurveAtTime(new Float32Array([0.2 * vel, 0.15 * vel, 0.0]), ctx.currentTime, 0.15);
            }
        }

        function stop() {
            const releaseTime = 0.01;

            toneGain.gain.cancelScheduledValues(ctx.currentTime);
            toneGain.gain.setTargetAtTime(0, ctx.currentTime, releaseTime);
            setTimeout(() => {
                toneGain.disconnect();
            }, releaseTime * 1000);
            noiseGain.gain.cancelScheduledValues(ctx.currentTime);
            noiseGain.gain.setTargetAtTime(0, ctx.currentTime, releaseTime);
            setTimeout(() => {
                noiseGain.disconnect();
            }, releaseTime * 1000);
        }
        return {
            play,
            stop,
        }
    }
    return {
        SquareSynth,
        DrumSynth,
        setVolume
    }
}

function display() {
    function getNoteName(noteValue) {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = ((noteValue % 12) + 12) % 12;
        const octave = Math.floor(noteValue / 12);
        return noteNames[noteIndex] + octave;
    }

    function track(patterns, trackCode) {
        const songDisplay = document.getElementById("trackDisplay");
        const trackCodeElement = document.getElementById("trackCode");
        const columns = [];

        songDisplay.innerHTML = '';
        trackCodeElement.textContent = `${trackCode}`;

        for (let i = 0; i < patterns.length; i++) {
            const songColumn = document.createElement("div");
            songColumn.classList.add("songColumn");

            const outputLabel = document.createElement("div");
            outputLabel.classList.add("output-label");
            outputLabel.textContent = `Output ${i + 1}`;
            songColumn.appendChild(outputLabel);

            for (let j = 0; j < patterns[i].length; j++) {
                const noteElement = document.createElement("div");
                noteElement.classList.add("note");

                if (patterns[i][j]) {
                    if (patterns[i][j].note === '---') {
                        noteElement.textContent = '-';
                    } else if (patterns[i][j].note === 'cont') {
                        noteElement.textContent = '•';
                    } else if (patterns[i][j].note !== undefined) {
                        noteElement.textContent = getNoteName(patterns[i][j].note);
                    } else if (patterns[i][j].drum) {
                        noteElement.textContent = patterns[i][j].drum;
                    }
                } else {
                    noteElement.textContent = '-';
                }
                songColumn.appendChild(noteElement);
            }
            songDisplay.appendChild(songColumn);
            columns.push(songColumn);
        }

        return columns;
    }

    function highlight(patterns, frame) {
        const positionInPattern = frame % PatternSize;

        for (let i = 0; i < patterns.length; i++) {
            const column = document.getElementsByClassName('songColumn')[i];
            const currentHighlight = column.querySelector('.highlight');
            if (currentHighlight) currentHighlight.classList.remove('highlight');
        }

        for (let i = 0; i < patterns.length; i++) {
            const column = document.getElementsByClassName('songColumn')[i];
            const row = column.children[positionInPattern + 1];
            row.classList.add('highlight');
        }
    }
    return {
        track,
        highlight
    }
}

let settings = {
    trackVolume: 0.3
};

function updateVolume(volumeType, volume) {
    settings[volumeType] = parseFloat(volume.target.value) / 100;

    updateSliderValues();
}

function setSliderPositions() {
    trackVolume.value = settings.trackVolume * 100;
}

function updateSliderValues() {
    trackVolumeValue.textContent = `${trackVolume.value}%`;
}

async function copyTrackCode() {
    const trackCodeElement = document.getElementById("trackCode");
    try {
        await navigator.clipboard.writeText(trackCodeElement.textContent);
    } catch (err) {
        console.error('Failed to copy track code: ', err);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    setSliderPositions();
    updateSliderValues();

    document.getElementById("generateBtn").addEventListener("click", () => {
        trackControl = genTrack();
        trackControl.changeVolume(settings.trackVolume);
    });
    document.getElementById("resetBtn").addEventListener("click", () => {
        trackControl.stop();
        document.getElementById("resetBtn").disabled = true;
        document.getElementById("generateBtn").disabled = false;
    });
    trackVolume.addEventListener("input", (event) => {
        updateVolume("trackVolume", event);
        if (trackControl) {
            trackControl.changeVolume(settings.trackVolume);
        }
    });
});