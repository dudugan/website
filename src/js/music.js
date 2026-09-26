// Music starts on the first click anywhere; until then a small "here" tag rides under the
// cursor (after jia.build). After that, clicking empty space pauses and resumes. Links and
// buttons never pause it, so moving between pages doesn't cut the music. The indicator in
// the bottom-right corner shows playing / not playing and toggles too.
//
// The placeholder soundtrack is generated live with Web Audio: fire crackle, a low drone,
// and a sparse music box wandering an A-minor pentatonic scale. There are no audio files.

const INTERACTIVE = 'a, button, input, textarea, select, label, summary, [role="button"], [contenteditable], .habits';

export function initMusic() {
  const button = document.getElementById('sound');
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioCtx) return;
  button.hidden = false;

  let engine = null;
  let playing = false;
  const tag = clickTag();

  const render = () => {
    button.classList.toggle('playing', playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'pause music' : 'play music');
    button.querySelector('.state').textContent = playing ? 'playing' : 'not playing';
  };
  const play = () => {
    engine ??= createEngine(AudioCtx);
    engine.play();
    playing = true;
    tag?.dismiss();
    render();
  };
  const pause = () => {
    engine?.pause();
    playing = false;
    render();
  };
  const toggle = () => (playing ? pause() : play());

  button.addEventListener('click', toggle);
  document.addEventListener('click', (e) => {
    if (e.target.closest('#sound')) return;
    if (!engine) return play(); // the very first click, wherever it lands
    if (e.target.closest(INTERACTIVE)) return;
    if (String(getSelection()).trim()) return; // finishing a text selection isn't a toggle
    toggle();
  });
  render();
}

// ---------- the "here" tag ----------

const TAG_WORD = 'here';

function clickTag() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return null;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.id = 'click-tag';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = TAG_WORD;
  document.body.append(el);

  let introduced = false;
  let timer = 0;
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    el.style.transform = `translate(${e.clientX}px, ${e.clientY + 24}px) translateX(-50%)`;
    el.classList.add('shown');
    if (!introduced && !still) {
      introduced = true;
      scramble(el, TAG_WORD);
      // Now and then, at uneven intervals, the word dissolves and settles again.
      const again = () => (timer = setTimeout(() => (scramble(el, TAG_WORD), again()), 7000 + Math.random() * 8000));
      again();
    }
  };
  const leave = (e) => {
    if (!e.relatedTarget) el.classList.remove('shown');
  };
  addEventListener('pointermove', move, { passive: true });
  document.addEventListener('mouseout', leave);

  return {
    dismiss() {
      removeEventListener('pointermove', move);
      document.removeEventListener('mouseout', leave);
      clearTimeout(timer);
      el.classList.remove('shown');
      setTimeout(() => el.remove(), 400);
    },
  };
}

// Letters settle one by one out of noise.
function scramble(el, word) {
  const glyphs = '!<>-_/[]{}=+*^?#%&~';
  const frames = 14;
  let frame = 0;
  const tick = () => {
    frame++;
    el.textContent = [...word]
      .map((ch, i) => (frame / frames >= (i + 1) / word.length ? ch : glyphs[(Math.random() * glyphs.length) | 0]))
      .join('');
    if (frame < frames) setTimeout(tick, 40);
  };
  tick();
}

// ---------- the placeholder soundtrack ----------

function createEngine(AudioCtx) {
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = 0;
  const limiter = ctx.createDynamicsCompressor();
  master.connect(limiter).connect(ctx.destination);

  // One generated room, so everything sits in the same space.
  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, 3.4, 2.8);
  reverb.connect(master);
  const send = (node, amount) => {
    const g = ctx.createGain();
    g.gain.value = amount;
    node.connect(g).connect(reverb);
  };

  // Drone: A1, A2 (slightly beating), and E3, low-passed and slowly breathing.
  const drone = ctx.createGain();
  drone.gain.value = 0.05;
  const droneTone = ctx.createBiquadFilter();
  droneTone.type = 'lowpass';
  droneTone.frequency.value = 380;
  droneTone.Q.value = 0.6;
  drone.connect(droneTone).connect(master);
  send(droneTone, 0.35);
  for (const [freq, type, level] of [
    [55, 'sine', 0.9],
    [110, 'triangle', 0.45],
    [110.35, 'sine', 0.35],
    [164.81, 'sine', 0.2],
  ]) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = level;
    osc.connect(g).connect(drone);
    osc.start();
  }
  const breath = ctx.createOscillator();
  breath.frequency.value = 1 / 6.5;
  const breathDepth = ctx.createGain();
  breathDepth.gain.value = 140;
  breath.connect(breathDepth).connect(droneTone.frequency);
  breath.start();

  // Fire bed: a soft low roar under the crackle.
  const bed = ctx.createBufferSource();
  bed.buffer = brownNoise(ctx, 4);
  bed.loop = true;
  const bedTone = ctx.createBiquadFilter();
  bedTone.type = 'lowpass';
  bedTone.frequency.value = 480;
  const bedLevel = ctx.createGain();
  bedLevel.gain.value = 0.05;
  bed.connect(bedTone).connect(bedLevel).connect(master);
  bed.start();

  const white = whiteNoise(ctx, 2);
  function crackle(t) {
    const src = ctx.createBufferSource();
    src.buffer = white;
    const tone = ctx.createBiquadFilter();
    tone.type = 'bandpass';
    tone.frequency.value = 1200 + Math.random() * 4200;
    tone.Q.value = 0.8 + Math.random() * 2;
    const env = ctx.createGain();
    const peak = 0.04 + Math.pow(Math.random(), 3) * 0.35;
    const length = 0.004 + Math.random() * 0.03;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(peak, t + 0.0015);
    env.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(tone).connect(env);
    if (ctx.createStereoPanner) {
      const pan = ctx.createStereoPanner();
      pan.pan.value = (Math.random() - 0.5) * 0.9;
      env.connect(pan).connect(master);
    } else env.connect(master);
    send(env, 0.12);
    src.start(t, Math.random() * 1.9, length + 0.02);
  }

  // Music box: each tine is a sine with two quieter, faster-dying partials.
  const scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];
  let step = 4;
  function tine(t, freq, velocity) {
    const out = ctx.createGain();
    out.gain.value = velocity;
    out.connect(master);
    send(out, 0.55);
    for (const [ratio, level, decay] of [
      [1, 1, 2.6],
      [2, 0.12, 0.9],
      [5.4, 0.035, 0.35],
    ]) {
      const osc = ctx.createOscillator();
      osc.frequency.value = freq * ratio;
      const env = ctx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(level, t + 0.004);
      env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + decay + 0.05);
    }
  }

  // Look-ahead scheduler.
  let nextCrackle = 0;
  let nextNote = 0;
  function schedule() {
    const horizon = ctx.currentTime + 0.25;
    while (nextCrackle < horizon) {
      crackle(nextCrackle);
      nextCrackle += -Math.log(1 - Math.random()) / 7; // ~7 pops a second, at random
    }
    while (nextNote < horizon) {
      step = Math.max(0, Math.min(scale.length - 1, step + [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0]));
      const velocity = 0.07 + Math.random() * 0.05;
      tine(nextNote, scale[step], velocity);
      if (Math.random() < 0.3 && step >= 2) tine(nextNote + 0.012, scale[step - 2], velocity * 0.6);
      if (Math.random() < 0.2) tine(nextNote + 0.2, scale[Math.min(scale.length - 1, step + 1)], velocity * 0.7);
      nextNote += 0.9 + Math.random() * 2.2;
    }
  }

  let timer = 0;
  let sleep = 0;
  const fadeTo = (value, seconds) => {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(value, now + seconds);
  };

  return {
    play() {
      clearTimeout(sleep);
      ctx.resume();
      const now = ctx.currentTime;
      if (nextNote < now) {
        nextNote = now + 0.5;
        nextCrackle = now;
      }
      clearTimeout(timer);
      schedule();
      timer = setInterval(schedule, 100);
      fadeTo(0.85, 1.6);
    },
    pause() {
      clearTimeout(timer);
      fadeTo(0, 0.5);
      sleep = setTimeout(() => ctx.suspend(), 600);
    },
  };
}

function whiteNoise(ctx, seconds) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function brownNoise(ctx, seconds) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  return buffer;
}

function impulse(ctx, seconds, decay) {
  const length = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }
  return buffer;
}
