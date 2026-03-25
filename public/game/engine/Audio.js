// Web Audio API sound system - all sounds generated procedurally, no audio files needed

export class Audio {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.4;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not available');
      this.enabled = false;
    }
  }

  _resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _playTone(freq, type, duration, gainVal, startDelay = 0, freqEnd = null) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startDelay);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + startDelay + duration);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime + startDelay);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startDelay + duration);
    osc.start(this.ctx.currentTime + startDelay);
    osc.stop(this.ctx.currentTime + startDelay + duration);
  }

  _noise(duration, gainVal) {
    if (!this.enabled || !this.ctx) return;
    this._resume();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.start();
    source.stop(this.ctx.currentTime + duration);
  }

  playAttack() {
    this._playTone(220, 'sawtooth', 0.08, 0.3);
    this._noise(0.05, 0.15);
  }

  playHit() {
    this._noise(0.12, 0.4);
    this._playTone(180, 'square', 0.1, 0.2);
  }

  playMagic() {
    this._playTone(440, 'sine', 0.3, 0.3, 0, 880);
    this._playTone(660, 'sine', 0.2, 0.2, 0.05, 440);
  }

  playFireball() {
    this._playTone(200, 'sawtooth', 0.4, 0.3, 0, 80);
    this._noise(0.35, 0.25);
  }

  playIceLance() {
    this._playTone(800, 'sine', 0.25, 0.25, 0, 400);
    this._playTone(1200, 'triangle', 0.2, 0.15, 0.05);
  }

  playPickup() {
    this._playTone(660, 'sine', 0.06, 0.3);
    this._playTone(880, 'sine', 0.06, 0.3, 0.06);
  }

  playLevelUp() {
    const notes = [261, 329, 392, 523, 659, 784, 1046];
    notes.forEach((f, i) => this._playTone(f, 'sine', 0.15, 0.25, i * 0.1));
  }

  playDeath() {
    this._playTone(400, 'sawtooth', 0.8, 0.4, 0, 100);
    this._noise(0.5, 0.2);
  }

  playFootstep() {
    this._noise(0.04, 0.06);
    this._playTone(120, 'triangle', 0.04, 0.08);
  }

  playCritical() {
    this._playTone(1000, 'square', 0.06, 0.4);
    this._playTone(1400, 'square', 0.06, 0.3, 0.06);
    this._noise(0.1, 0.3);
  }

  playEnemyDie() {
    this._playTone(300, 'sawtooth', 0.3, 0.35, 0, 80);
    this._noise(0.2, 0.2);
  }

  playQuestComplete() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((f, i) => this._playTone(f, 'sine', 0.2, 0.3, i * 0.12));
    this._playTone(1568, 'sine', 0.4, 0.3, 0.48);
  }

  playMenuSelect() {
    this._playTone(440, 'sine', 0.08, 0.2);
  }

  playPortal() {
    for (let i = 0; i < 6; i++) {
      this._playTone(200 + i * 80, 'sine', 0.3, 0.15, i * 0.08);
    }
  }

  playArrow() {
    this._noise(0.05, 0.3);
    this._playTone(800, 'triangle', 0.08, 0.15, 0, 400);
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) this.masterGain.gain.value = this.volume;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (this.masterGain) this.masterGain.gain.value = this.enabled ? this.volume : 0;
    return this.enabled;
  }
}

export default Audio;
