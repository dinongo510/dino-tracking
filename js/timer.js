/**
 * Dino Hybrid Tracking - Unified Stopwatch & Rest Timer Engine
 * Accurate timestamp-based timekeeping (Date.now()) resistant to phone sleep, lock screen, and tab switching.
 * Includes Rest Countdown (Normal 2.5-3m vs Rest-Pause 15-20s) + Workout Session Stopwatch.
 */

class DinoTimerEngine {
  constructor() {
    // 1. WORKOUT SESSION STOPWATCH STATE
    this.sessionIsRunning = false;
    this.sessionIsPaused = false;
    this.sessionStartTimestamp = null;
    this.sessionAccumulatedMs = 0;
    this.sessionLastPauseTimestamp = null;
    this.sessionIntervalId = null;
    this.sessionTickCallbacks = [];

    // 2. REST COUNTDOWN TIMER STATE
    this.restIsRunning = false;
    this.restIsPaused = false;
    this.restEndTime = null;
    this.restTotalSeconds = 0;
    this.restRemainingSeconds = 0;
    this.restIsRP = false;
    this.restIntervalId = null;
    this.restTickCallbacks = [];
    this.restCompleteCallbacks = [];

    this.bindVisibilityListener();
  }

  bindVisibilityListener() {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        this.syncTimers();
      });
      window.addEventListener("focus", () => {
        this.syncTimers();
      });
    }
  }

  // Synchronize both timers immediately whenever page visibility or focus returns
  syncTimers() {
    // Sync Stopwatch
    if (this.sessionIsRunning && !this.sessionIsPaused) {
      this.notifySessionTick();
    }

    // Sync Rest Timer
    if (this.restIsRunning && !this.restIsPaused && this.restEndTime) {
      const remainingMs = this.restEndTime - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      this.restRemainingSeconds = remainingSec;

      this.notifyRestTick();

      if (remainingSec <= 0) {
        this.completeRest();
      }
    }
  }

  // =========================================================================
  // WORKOUT SESSION STOPWATCH (Starts ONLY on explicit user click)
  // =========================================================================

  startSession(initialElapsedSeconds = 0) {
    this.stopSession();
    this.sessionAccumulatedMs = initialElapsedSeconds * 1000;
    this.sessionStartTimestamp = Date.now();
    this.sessionIsRunning = true;
    this.sessionIsPaused = false;

    this.notifySessionTick();

    if (this.sessionIntervalId) clearInterval(this.sessionIntervalId);
    this.sessionIntervalId = setInterval(() => {
      if (this.sessionIsRunning && !this.sessionIsPaused) {
        this.notifySessionTick();
      }
    }, 1000);
  }

  pauseSession() {
    if (!this.sessionIsRunning || this.sessionIsPaused) return;

    const now = Date.now();
    this.sessionAccumulatedMs += (now - this.sessionStartTimestamp);
    this.sessionStartTimestamp = null;
    this.sessionIsPaused = true;
    this.notifySessionTick();
  }

  resumeSession() {
    if (!this.sessionIsRunning || !this.sessionIsPaused) return;

    this.sessionStartTimestamp = Date.now();
    this.sessionIsPaused = false;
    this.notifySessionTick();
  }

  togglePauseSession() {
    if (this.sessionIsPaused) {
      this.resumeSession();
    } else {
      this.pauseSession();
    }
    return !this.sessionIsPaused;
  }

  stopSession() {
    if (this.sessionIntervalId) {
      clearInterval(this.sessionIntervalId);
      this.sessionIntervalId = null;
    }
    this.sessionIsRunning = false;
    this.sessionIsPaused = false;
    this.sessionStartTimestamp = null;
    this.sessionAccumulatedMs = 0;
    this.notifySessionTick();
  }

  getSessionElapsedSeconds() {
    if (!this.sessionIsRunning) return 0;
    let totalMs = this.sessionAccumulatedMs;
    if (!this.sessionIsPaused && this.sessionStartTimestamp) {
      totalMs += (Date.now() - this.sessionStartTimestamp);
    }
    return Math.floor(totalMs / 1000);
  }

  formatSessionTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onSessionTick(cb) {
    this.sessionTickCallbacks.push(cb);
  }

  notifySessionTick() {
    const elapsedSec = this.getSessionElapsedSeconds();
    const formatted = this.formatSessionTime(elapsedSec);
    this.sessionTickCallbacks.forEach(cb => cb({
      elapsedSeconds: elapsedSec,
      formatted,
      isRunning: this.sessionIsRunning,
      isPaused: this.sessionIsPaused
    }));
  }

  // =========================================================================
  // REST COUNTDOWN TIMER (Normal 2.5-3m vs Rest-Pause 15-20s)
  // =========================================================================

  startRest(seconds, isRestPause = false) {
    this.stopRest();

    const sec = Math.max(1, parseInt(seconds) || (isRestPause ? 15 : 150));
    this.restTotalSeconds = sec;
    this.restRemainingSeconds = sec;
    this.restIsRP = isRestPause;
    this.restIsRunning = true;
    this.restIsPaused = false;
    this.restEndTime = Date.now() + (sec * 1000);

    this.notifyRestTick();

    if (this.restIntervalId) clearInterval(this.restIntervalId);
    this.restIntervalId = setInterval(() => {
      if (this.restIsRunning && !this.restIsPaused && this.restEndTime) {
        const remainingMs = this.restEndTime - Date.now();
        const remSec = Math.max(0, Math.ceil(remainingMs / 1000));
        this.restRemainingSeconds = remSec;

        // Warning tick on 3, 2, 1
        if (remSec <= 3 && remSec > 0) {
          if (window.dinoAudio) window.dinoAudio.playWarningTick();
        }

        this.notifyRestTick();

        if (remSec <= 0) {
          this.completeRest();
        }
      }
    }, 1000);
  }

  addRestSeconds(sec = 30) {
    if (!this.restIsRunning) {
      this.startRest(sec, false);
      return;
    }
    this.restTotalSeconds += sec;
    this.restRemainingSeconds += sec;
    this.restEndTime += (sec * 1000);
    this.notifyRestTick();
  }

  pauseRest() {
    if (!this.restIsRunning || this.restIsPaused) return;
    this.restIsPaused = true;
    if (this.restEndTime) {
      this.restRemainingSeconds = Math.max(0, Math.ceil((this.restEndTime - Date.now()) / 1000));
    }
    this.notifyRestTick();
  }

  resumeRest() {
    if (!this.restIsRunning || !this.restIsPaused) return;
    this.restEndTime = Date.now() + (this.restRemainingSeconds * 1000);
    this.restIsPaused = false;
    this.notifyRestTick();
  }

  stopRest() {
    if (this.restIntervalId) {
      clearInterval(this.restIntervalId);
      this.restIntervalId = null;
    }
    this.restIsRunning = false;
    this.restIsPaused = false;
    this.restEndTime = null;
    this.restRemainingSeconds = 0;
    this.restTotalSeconds = 0;
    this.notifyRestTick();
  }

  completeRest() {
    const wasRP = this.restIsRP;
    this.stopRest();

    if (window.dinoAudio) {
      if (wasRP) {
        window.dinoAudio.playRestPauseDone();
      } else {
        window.dinoAudio.playTimerDone();
      }
    }

    this.restCompleteCallbacks.forEach(cb => cb({ isRestPause: wasRP }));
  }

  formatRestTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  onRestTick(cb) {
    this.restTickCallbacks.push(cb);
  }

  onRestComplete(cb) {
    this.restCompleteCallbacks.push(cb);
  }

  notifyRestTick() {
    const formatted = this.formatRestTime(Math.max(0, this.restRemainingSeconds));
    const progress = this.restTotalSeconds > 0
      ? (this.restRemainingSeconds / this.restTotalSeconds)
      : 0;

    this.restTickCallbacks.forEach(cb => cb({
      remaining: this.restRemainingSeconds,
      total: this.restTotalSeconds,
      formatted,
      progress,
      isRunning: this.restIsRunning,
      isPaused: this.restIsPaused,
      isRestPause: this.restIsRP
    }));
  }
}

// Global Timer Instance
if (typeof window !== "undefined") {
  window.dinoTimer = new DinoTimerEngine();
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DinoTimerEngine;
}
