import type { Player } from "@/lib/types"
import { SPY_WORDS } from "./words"
import type { SpyData, SpyOutcome } from "./types"

export const MIN_PLAYERS = 3
export const MAX_PLAYERS = 10
export const DISCUSSION_OPTIONS = [60, 90, 120, 180] as const
export const DEFAULT_DISCUSSION_SECONDS = 90

function randomIndex(length: number, random: () => number) {
  const value = random()
  const fraction = Number.isFinite(value) ? Math.min(0.999999999, Math.max(0, value)) : 0
  return Math.floor(fraction * length)
}

function shuffle<T>(list: readonly T[], random: () => number): T[] {
  const copy = [...list]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1, random)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function normalizeDiscussionSeconds(seconds: number) {
  return DISCUSSION_OPTIONS.includes(seconds as typeof DISCUSSION_OPTIONS[number])
    ? seconds
    : DEFAULT_DISCUSSION_SECONDS
}

export function newSpyRound(
  players: Player[],
  discussionSeconds = DEFAULT_DISCUSSION_SECONDS,
  previous?: SpyData | null,
  random: () => number = Math.random,
): SpyData | null {
  const unique = new Set(players.map((player) => player.id))
  if (
    players.length < MIN_PLAYERS || players.length > MAX_PLAYERS ||
    unique.size !== players.length || players.some((player) => !player.id || !player.name)
  ) return null

  const categories = Object.keys(SPY_WORDS)
  const category = categories[randomIndex(categories.length, random)]
  const words = SPY_WORDS[category]
  const word = words[randomIndex(words.length, random)]
  const choices = shuffle([word, ...shuffle(words.filter((entry) => entry !== word), random).slice(0, 3)], random)
  const roster = players.map((player) => ({ ...player }))
  const sameRoster = Boolean(previous) && previous!.players.length === players.length &&
    players.every((player) => previous!.players.some((before) => before.id === player.id))

  return {
    phase: "reveal", players: roster,
    order: shuffle(players.map((player) => player.id), random),
    spyId: players[randomIndex(players.length, random)].id,
    category, word, choices,
    revealIndex: 0, revealSeen: false, voteIndex: 0, votes: {},
    discussionSeconds: normalizeDiscussionSeconds(discussionSeconds),
    deadline: null, outcome: null,
    roundNumber: sameRoster ? previous!.roundNumber + 1 : 1,
    scores: sameRoster ? { ...previous!.scores } : Object.fromEntries(players.map((p) => [p.id, 0])),
  }
}

export function currentViewerId(round: SpyData) {
  return round.order[round.revealIndex]
}

export function currentVoterId(round: SpyData) {
  return round.order[round.voteIndex]
}

export function markRoleSeen(round: SpyData, playerId: string): SpyData {
  if (round.phase !== "reveal" || round.revealSeen || playerId !== currentViewerId(round)) return round
  return { ...round, revealSeen: true }
}

export function nextRole(round: SpyData, playerId: string, now = Date.now()): SpyData {
  if (round.phase !== "reveal" || !round.revealSeen || playerId !== currentViewerId(round)) return round
  if (round.revealIndex + 1 === round.order.length) {
    return { ...round, phase: "discussion", revealSeen: false, deadline: now + round.discussionSeconds * 1000 }
  }
  return { ...round, revealIndex: round.revealIndex + 1, revealSeen: false }
}

export function beginVote(round: SpyData): SpyData {
  if (round.phase !== "discussion") return round
  return { ...round, phase: "vote", deadline: null, voteIndex: 0, votes: {} }
}

function tallyVotes(round: SpyData, votes: Record<string, string>): SpyOutcome {
  const tally = Object.fromEntries(round.players.map((player) => [player.id, 0])) as Record<string, number>
  Object.values(votes).forEach((id) => { tally[id] = (tally[id] ?? 0) + 1 })
  const highest = Math.max(...Object.values(tally))
  const leaders = Object.keys(tally).filter((id) => tally[id] === highest)
  const tie = leaders.length !== 1
  const accusedId = tie ? null : leaders[0]
  const spyCaught = accusedId === round.spyId
  return {
    accusedId, tie, spyCaught, guess: null, spyGuessed: null,
    winner: spyCaught ? "civilians" : "spy", tally,
  }
}

function finish(round: SpyData, outcome: SpyOutcome): SpyData {
  const winner = outcome.winner
  const scores = { ...round.scores }
  if (winner === "spy") {
    scores[round.spyId] = (scores[round.spyId] ?? 0) + 2
  } else {
    for (const player of round.players) {
      if (player.id !== round.spyId) scores[player.id] = (scores[player.id] ?? 0) + 1
    }
  }
  return { ...round, phase: "result", outcome, scores }
}

export function castVote(round: SpyData, voterId: string, targetId: string): SpyData {
  if (
    round.phase !== "vote" || voterId !== currentVoterId(round) ||
    targetId === voterId ||
    !round.order.includes(targetId) || round.votes[voterId]
  ) return round
  const votes = { ...round.votes, [voterId]: targetId }
  if (Object.keys(votes).length !== round.order.length) {
    return { ...round, votes, voteIndex: round.voteIndex + 1 }
  }
  const intermediate = { ...round, votes }
  const outcome = tallyVotes(intermediate, votes)
  return outcome.spyCaught
    ? { ...intermediate, phase: "guess", outcome }
    : finish(intermediate, outcome)
}

export function guessWord(round: SpyData, guess: string): SpyData {
  if (round.phase !== "guess" || !round.outcome?.spyCaught || !round.choices.includes(guess)) return round
  const correct = guess === round.word
  return finish(round, {
    ...round.outcome,
    guess,
    spyGuessed: correct,
    winner: correct ? "spy" : "civilians",
  })
}

export function remainingSeconds(round: SpyData, now = Date.now()): number {
  if (round.phase !== "discussion" || round.deadline === null) return 0
  return Math.max(0, Math.ceil((round.deadline - now) / 1000))
}
