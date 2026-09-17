const TAU = Math.PI * 2

/** A single ruled ribbon, gently folding around a stable S-shaped centerline.
 * Coordinates are decorative, deterministic, and unrelated to product activity. */
export function fieldPoint(progress: number, strand: number, time: number) {
  const u = (progress - 0.5) * TAU
  const across = strand * 2 - 1
  const sway = Math.sin(time * 0.22) * 0.12
  const twist = u * 0.72 + 0.45 + Math.sin(time * 0.18) * 0.32
  const spread = 0.44 + 0.3 * Math.pow(Math.sin(progress * Math.PI), 2)
  const ripple = Math.sin(u * 2.2 - time * 0.55) * 0.025
  const x = (progress - 0.5) * 4.7 + across * 0.12 * Math.sin(twist)
  const y = Math.sin(u * 0.85 + sway) * 0.68 + across * spread * Math.cos(twist)
  const z = Math.cos(u * 0.85) * 0.36 + across * spread * Math.sin(twist) + ripple
  // The silhouette stays recognizable: only the fabric folds and its particles flow.
  const tilt = -0.62
  return {
    x: x * Math.cos(tilt) - y * Math.sin(tilt),
    y: x * Math.sin(tilt) + y * Math.cos(tilt),
    z,
    // Fade the open current's seam before particles wrap to its beginning.
    envelope: Math.pow(Math.max(0, Math.sin(progress * Math.PI)), 0.6),
  }
}

export function projectFieldPoint(
  point: ReturnType<typeof fieldPoint>,
  width: number,
  height: number,
  compact: boolean,
) {
  const perspective = 3.8 / (3.8 - point.z)
  const scale = compact ? width * 0.3 : Math.min(width * 0.25, height * 0.4)
  return {
    x: width * (compact ? 0.5 : 0.73) + point.x * scale * perspective,
    y: height * 0.49 + point.y * scale * perspective,
    depth: Math.max(0.15, Math.min(1, (point.z + 1.5) / 3)),
    perspective,
  }
}
