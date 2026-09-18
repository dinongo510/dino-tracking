/**
 * Dino Tracking - Gamified Audio Synthesizer & Particle Effects Engine
 * Uses Web Audio API (Zero external mp3 dependencies) + Canvas Particle Burst
 */

class DinoAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("AudioContext not supported:", e);
    }
  }

  ensureAudio() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  get isSoundEnabled() {
    if (window.dinoStorage) {
      const s = window.dinoStorage.getSettings();
      return s.sound !== false;
    }
    return true;
  }

  get isVibrateEnabled() {
    if (window.dinoStorage) {
      const s = window.dinoStorage.getSettings();
      return s.vibrate !== false;
    }
    return true;
  }

  // Play a single synthesized frequency
  playTone(freq, duration = 0.15, type = "sine", gainVal = 0.2, startTimeOffset = 0) {
    if (!this.isSoundEnabled) return;
    this.ensureAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const start = this.audioCtx.currentTime + startTimeOffset;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(gainVal, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(start);
      osc.stop(start + duration);
    } catch (e) {
      console.warn("Tone error:", e);
    }
  }

  // 1. CELEBRATORY PROGRESSIVE OVERLOAD FANFARE (Beat last week!)
  playOverloadFanfare() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 150, 50, 250]);
    }
    if (!this.isSoundEnabled) return;

    // Triumphant ascending arpeggio (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.22, "triangle", 0.25, idx * 0.09);
    });

    // Final harmonic sparkle chime
    setTimeout(() => {
      this.playTone(1318.51, 0.35, "sine", 0.18, 0); // E6
      this.playTone(1567.98, 0.40, "sine", 0.15, 0.05); // G6
    }, 380);
  }

  // 2. REGRESSION / DELOAD SYMPATHETIC TONE (Soft encouragement)
  playRegressionTone() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([80, 80]);
    }
    if (!this.isSoundEnabled) return;

    // Gentle descending dual chord (A4 -> F4)
    this.playTone(440.00, 0.25, "sine", 0.15, 0);
    this.playTone(349.23, 0.35, "sine", 0.12, 0.15);
  }

  // 3. SET COMPLETED CHIME (Standard checkmark)
  playSetComplete() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate(60);
    }
    if (!this.isSoundEnabled) return;

    this.playTone(587.33, 0.12, "sine", 0.18, 0);
    this.playTone(880.00, 0.20, "triangle", 0.20, 0.09);
  }

  // 4. REST TIMER 3-2-1 WARNING
  playWarningTick() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate(40);
    }
    this.playTone(440, 0.07, "sine", 0.15);
  }

  // 5. REST TIMER FINISHED CHIME (Normal Rest)
  playTimerDone() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([100, 60, 100, 60, 300]);
    }
    if (!this.isSoundEnabled) return;

    const notes = [587.33, 739.99, 880.00];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.25, "triangle", 0.22, idx * 0.13);
    });
  }

  // 6. REST-PAUSE TIMER FINISHED CHIME (High-tempo urgent cue)
  playRestPauseDone() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([80, 40, 80, 40, 150]);
    }
    if (!this.isSoundEnabled) return;

    // Double high beep (A5 -> D6)
    this.playTone(880.00, 0.12, "square", 0.22, 0);
    this.playTone(1174.66, 0.20, "triangle", 0.25, 0.12);
  }

  // 7. ROULETTE WHEEL TICK (Click as wheel passes pegs)
  playRouletteTick() {
    if (!this.isSoundEnabled) return;
    this.ensureAudio();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = "sine";
      osc.frequency.setValueAtTime(600 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // 8. ROULETTE WINNING LANDING FANFARE
  playRouletteWin() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 200]);
    }
    if (!this.isSoundEnabled) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 0.25, "triangle", 0.24, idx * 0.08);
    });
  }

  // 9. POST-WORKOUT VICTORY CELEBRATION (Finished full workout)
  playVictoryFanfare() {
    if (this.isVibrateEnabled && navigator.vibrate) {
      navigator.vibrate([150, 80, 150, 80, 400]);
    }
    if (!this.isSoundEnabled) return;

    // Grand heroic brass chord progression
    const chord1 = [523.25, 659.25, 783.99]; // C Major
    const chord2 = [587.33, 739.99, 880.00]; // D Major
    const chord3 = [659.25, 830.61, 987.77]; // E Major
    const chord4 = [1046.50, 1318.51, 1567.98]; // High C Octave

    chord1.forEach(f => this.playTone(f, 0.28, "triangle", 0.22, 0));
    setTimeout(() => chord2.forEach(f => this.playTone(f, 0.28, "triangle", 0.24, 0)), 220);
    setTimeout(() => chord3.forEach(f => this.playTone(f, 0.35, "triangle", 0.26, 0)), 440);
    setTimeout(() => {
      chord4.forEach(f => this.playTone(f, 0.65, "sine", 0.28, 0));
      this.playTone(2093.00, 0.70, "triangle", 0.20, 0.05); // C7 sparkle
    }, 720);
  }

  // Visual Particle Explosion / Sparkles
  triggerConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#ff2a2a", "#ffd700", "#ffffff", "#10b981", "#ff6b6b", "#3b82f6"];

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.42,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // Gravity
        p.alpha -= 0.018;
        p.rotation += p.vRot;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }
}

if (typeof window !== "undefined") {
  window.dinoAudio = new DinoAudioEngine();
}
