/**
 * Deterministic initials + colour for a person, so the same name always gets
 * the same avatar. Works for Latin and Persian names.
 */

const PALETTE = [
  '#1867c0', // blue
  '#00897b', // teal
  '#e65100', // orange
  '#6a1b9a', // purple
  '#2e7d32', // green
  '#c62828', // red
  '#00838f', // cyan
  '#4527a0', // indigo
  '#ad1457', // pink
  '#5d4037', // brown
]

export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return PALETTE[hash % PALETTE.length]
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = [...parts[0]][0] ?? ''
  const second = parts.length > 1 ? ([...parts[1]][0] ?? '') : ''
  return (first + second).toUpperCase()
}
