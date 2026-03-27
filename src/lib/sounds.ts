// Generate sounds using Web Audio API
// No external files needed

export const createSound = (type: string) => {
  if (typeof window === 'undefined') return;

  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

  const playTone = (freq: number, duration: number, delay: number = 0, wave: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = wave;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + delay);
    gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  };

  switch(type) {
    case 'ding':
      // Simple ding
      playTone(880, 0.5);
      break;

    case 'chime':
      // Double chime
      playTone(660, 0.3, 0);
      playTone(880, 0.3, 0.2);
      playTone(1100, 0.4, 0.4);
      break;

    case 'bell':
      // Restaurant bell
      playTone(587, 0.1, 0, 'square');
      playTone(784, 0.1, 0.1, 'square');
      playTone(987, 0.5, 0.2, 'sine');
      break;

    case 'alert':
      // Urgent alert
      playTone(440, 0.15, 0, 'sawtooth');
      playTone(440, 0.15, 0.2, 'sawtooth');
      playTone(550, 0.3, 0.4, 'sawtooth');
      break;
  }
};
