/**
 * Dino Hybrid Tracking - Audio & Rest-Pause Timer Engine
 * Web Audio API synthesizer + Vibration API + Circular Countdown UI
 */

class DinoTimer {
  constructor() {
    this.audioCtx = null;
    this.intervalId = null;
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.isRunning = false;
    this.isRestPauseMode = false;
    this.rpSetCount = 0;
    this.onTickCallbacks = [];
    this.onCompleteCallbacks = [];

    this.initAudio();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported or disabled:", e);
    }
  }

  ensureAudioReady() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  playBeep(freq = 880, duration = 0.12, type = "sine") {
    const settings = window.dinoStorage ? window.dinoStorage.getSettings() : { sound: true };
    if (!settings.sound) return;

    this.ensureAudioReady();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Sound error:", e);
    }
  }

  playCompletionChime() {
    const settings = window.dinoStorage ? window.dinoStorage.getSettings() : { sound: true, vibrate: true };
    if (settings.vibrate && navigator.vibrate) {
      navigator.vibrate([100, 60, 100, 60, 300]);
    }

    if (!settings.sound) return;

    this.ensureAudioReady();
    if (!this.audioCtx) return;

    // Athletic modern 3-tone chime
    const notes = [587.33, 739.99, 880.00]; // D5, F#5, A5
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playBeep(freq, 0.25, "triangle");
      }, idx * 130);
    });
  }

  start(seconds, isRestPause = false) {
    this.stop();
    this.ensureAudioReady();

    this.totalSeconds = Math.max(1, parseInt(seconds) || 60);
    this.remainingSeconds = this.totalSeconds;
    this.isRunning = true;
    this.isRestPauseMode = isRestPause;

    if (isRestPause) {
      this.rpSetCount++;
    }

    this.notifyTick();

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;

      // 3, 2, 1 warning beeps
      if (this.remainingSeconds <= 3 && this.remainingSeconds > 0) {
        this.playBeep(440, 0.08, "sine");
        const settings = window.dinoStorage ? window.dinoStorage.getSettings() : { vibrate: true };
        if (settings.vibrate && navigator.vibrate) {
          navigator.vibrate(40);
        }
      }

      this.notifyTick();

      if (this.remainingSeconds <= 0) {
        this.complete();
      }
    }, 1000);
  }

  addTime(seconds) {
    if (!this.isRunning) {
      this.start(seconds);
      return;
    }
    this.remainingSeconds += seconds;
    this.totalSeconds += seconds;
    this.notifyTick();
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.notifyTick();
  }

  resume() {
    if (this.remainingSeconds > 0 && !this.isRunning) {
      this.start(this.remainingSeconds, this.isRestPauseMode);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.remainingSeconds = 0;
    this.totalSeconds = 0;
    this.notifyTick();
  }

  complete() {
    this.stop();
    this.playCompletionChime();
    this.onCompleteCallbacks.forEach(cb => cb({
      isRestPause: this.isRestPauseMode,
      rpCount: this.rpSetCount
    }));
  }

  onTick(callback) {
    this.onTickCallbacks.push(callback);
  }

  onComplete(callback) {
    this.onCompleteCallbacks.push(callback);
  }

  notifyTick() {
    const formatted = this.formatTime(this.remainingSeconds);
    const progress = this.totalSeconds > 0 ? (this.remainingSeconds / this.totalSeconds) : 0;

    this.onTickCallbacks.forEach(cb => cb({
      remaining: this.remainingSeconds,
      total: this.totalSeconds,
      formatted,
      progress,
      isRunning: this.isRunning,
      isRestPause: this.isRestPauseMode,
      rpSetCount: this.rpSetCount
    }));
  }

  formatTime(totalSec) {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  }
}

// Global Timer Instance
if (typeof window !== "undefined") {
  window.dinoTimer = new DinoTimer();
}
