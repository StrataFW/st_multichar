
let ctx: AudioContext | null = null
let muted = false

function ensureCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function blip({
  freq,
  type = 'sine',
  duration = 0.08,
  gain = 0.07,
  sweepTo,
}: {
  freq: number
  type?: OscillatorType
  duration?: number
  gain?: number
  sweepTo?: number
}) {
  if (muted) return
  const ac = ensureCtx()
  if (!ac) return

  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, ac.currentTime)
  if (sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(sweepTo, ac.currentTime + duration)
  }

  g.gain.setValueAtTime(0, ac.currentTime)
  g.gain.linearRampToValueAtTime(gain, ac.currentTime + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration)

  osc.connect(g)
  g.connect(ac.destination)
  osc.start()
  osc.stop(ac.currentTime + duration + 0.02)
}

export const sfx = {
  hover: () => blip({ freq: 720, type: 'sine', duration: 0.05, gain: 0.006 }),
  click: () => blip({ freq: 480, type: 'triangle', duration: 0.07, gain: 0.014, sweepTo: 360 }),
  confirm: () => blip({ freq: 540, type: 'triangle', duration: 0.18, gain: 0.016, sweepTo: 880 }),
  cancel: () => blip({ freq: 380, type: 'sawtooth', duration: 0.12, gain: 0.012, sweepTo: 220 }),
  swipe: () => blip({ freq: 220, type: 'sawtooth', duration: 0.16, gain: 0.01, sweepTo: 110 }),
  setMuted: (m: boolean) => {
    muted = m
  },
}
