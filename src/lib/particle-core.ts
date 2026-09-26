/** Layered dust lifted by travelling wave packets, returning to its resting plane. */
export function corePoint(index: number, count: number, time: number) {
  const layer = index % 3
  const sample = Math.floor(index / 3)
  const columns = Math.ceil(Math.sqrt(count / 3) * 1.55)
  const rows = Math.ceil(count / (3 * columns))
  const noise = Math.sin(index * 127.1 + 311.7) * 43758.5453
  const jitter = noise - Math.floor(noise) - 0.5
  const u = ((sample % columns) + 0.5 + jitter * 0.55) / columns
  const v = (Math.floor(sample / columns) + 0.5) / rows
  const x = (u - 0.5) * 3.45
  const depth = (v - 0.5) * 2
  const phase = x * 2.7 + depth * 1.2 - time * (0.55 + layer * 0.045) + layer * 0.65
  const crest = Math.pow((Math.cos(phase) + 1) / 2, 5)
  const lift = crest * (0.45 + layer * 0.055)
  const y = depth * 0.42 - lift + layer * 0.14 + x * 0.14
  return {
    x: x + Math.sin(phase) * crest * 0.08,
    y,
    z: depth * 0.55 + layer * 0.12,
    light: crest * (0.65 + (jitter + 0.5) * 0.35),
    envelope: Math.pow(Math.max(0, Math.sin(u * Math.PI) * Math.sin(v * Math.PI)), 0.45),
  }
}
