import { useReducedMotion } from "motion/react"

import { useApp } from "@/store/app"

export function useGameMotion() {
  const preference = useApp((state) => state.motion)
  const systemReduced = useReducedMotion()

  if (preference === "full") {
    return false
  }

  if (preference === "reduced") {
    return true
  }

  return Boolean(systemReduced)
}
