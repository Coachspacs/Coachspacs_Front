// Lightweight, pleasant, and modern UI sound effects powered by Web Audio API (zero external audio file downloads)

class SoundEffectManager {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined" || !this.soundEnabled) return null;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!this.audioCtx && AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx && this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  /**
   * Cheerful, smooth sci-fi chime & whoosh when moving between steps
   */
  playStepTransition(direction: "forward" | "backward" = "forward") {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // Primary tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      // Soft harmonic overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";

      if (direction === "forward") {
        // Uplifting ascending chime
        osc1.frequency.setValueAtTime(520, now);
        osc1.frequency.exponentialRampToValueAtTime(840, now + 0.12);
        osc1.frequency.exponentialRampToValueAtTime(1046, now + 0.22);

        osc2.frequency.setValueAtTime(260, now);
        osc2.frequency.exponentialRampToValueAtTime(523, now + 0.18);

        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.09, now + 0.025);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(0.03, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      } else {
        // Gentle descending tone
        osc1.frequency.setValueAtTime(780, now);
        osc1.frequency.exponentialRampToValueAtTime(440, now + 0.18);

        osc2.frequency.setValueAtTime(390, now);
        osc2.frequency.exponentialRampToValueAtTime(220, now + 0.18);

        gain1.gain.setValueAtTime(0.001, now);
        gain1.gain.linearRampToValueAtTime(0.07, now + 0.02);
        gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        gain2.gain.setValueAtTime(0.001, now);
        gain2.gain.linearRampToValueAtTime(0.02, now + 0.02);
        gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
      }

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + 0.28);
      osc2.stop(now + 0.28);
    } catch {}
  }

  /**
   * Crisp, pleasing micro-tap when selecting an option
   */
  playOptionSelect() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.045);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Cute futuristic robotic glide & jet booster sound when moving along the scenic trail
   */
  playRobotTravel(stepNumber: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Robot Thruster / Jet Glide (Smooth frequency modulation sweep)
      const jetOsc = ctx.createOscillator();
      const jetGain = ctx.createGain();

      jetOsc.type = "sine";
      const baseFreq = 320 + stepNumber * 60;
      jetOsc.frequency.setValueAtTime(baseFreq, now);
      jetOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.18);
      jetOsc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.35);

      // Jet gain envelope
      jetGain.gain.setValueAtTime(0.001, now);
      jetGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      jetGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      jetOsc.connect(jetGain);
      jetGain.connect(ctx.destination);
      jetOsc.start(now);
      jetOsc.stop(now + 0.4);

      // 2. Robotic Electronic Beep / Whistle (Playful R2-D2 style micro-warble)
      const beepOsc = ctx.createOscillator();
      const beepGain = ctx.createGain();
      beepOsc.type = "triangle";

      beepOsc.frequency.setValueAtTime(660 + stepNumber * 70, now + 0.04);
      beepOsc.frequency.linearRampToValueAtTime(880 + stepNumber * 90, now + 0.12);
      beepOsc.frequency.linearRampToValueAtTime(1100 + stepNumber * 60, now + 0.22);

      beepGain.gain.setValueAtTime(0.001, now + 0.04);
      beepGain.gain.linearRampToValueAtTime(0.05, now + 0.09);
      beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);

      beepOsc.connect(beepGain);
      beepGain.connect(ctx.destination);
      beepOsc.start(now + 0.04);
      beepOsc.stop(now + 0.28);

      // 3. Milestone Arrival Landing Chime (Plays right when robot settles at the flag)
      const chimeTime = now + 0.25;
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();

      chimeOsc.type = "sine";
      const chimeFreq = stepNumber === 4 ? 1318.51 : 880 + stepNumber * 80;
      chimeOsc.frequency.setValueAtTime(chimeFreq, chimeTime);

      chimeGain.gain.setValueAtTime(0.001, chimeTime);
      chimeGain.gain.linearRampToValueAtTime(0.09, chimeTime + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 0.3);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(ctx.destination);
      chimeOsc.start(chimeTime);
      chimeOsc.stop(chimeTime + 0.32);

      // If step 4 (Finish milestone), add celebratory second chime
      if (stepNumber === 4) {
        const chime2Time = chimeTime + 0.12;
        const chime2Osc = ctx.createOscillator();
        const chime2Gain = ctx.createGain();
        chime2Osc.type = "triangle";
        chime2Osc.frequency.setValueAtTime(1567.98, chime2Time); // G6

        chime2Gain.gain.setValueAtTime(0.001, chime2Time);
        chime2Gain.gain.linearRampToValueAtTime(0.09, chime2Time + 0.02);
        chime2Gain.gain.exponentialRampToValueAtTime(0.0001, chime2Time + 0.35);

        chime2Osc.connect(chime2Gain);
        chime2Gain.connect(ctx.destination);
        chime2Osc.start(chime2Time);
        chime2Osc.stop(chime2Time + 0.37);
      }
    } catch {}
  }

  /**
   * Rewarding harmonic arpeggio upon milestone completion or roadmap generation
   */
  playCelebration() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const noteStart = ctx.currentTime + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.4);
      });
    } catch {}
  }
}

export const soundFx = new SoundEffectManager();


