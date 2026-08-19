export function shuffle<T>(items: T[]) {
  const next = [...items]

  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }

  return next
}

export function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}
