import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { GameId, MotionPref, Screen } from "@/lib/types"
import { identityMigrate } from "@/store/persist"

type AppState = {
  screen: Screen
  setupGameId: GameId | null
  activeGameId: GameId | null
  playersOpen: boolean
  soundOn: boolean
  soundVolume: number
  hapticsOn: boolean
  motion: MotionPref
  keepAwake: boolean
  confirmExit: boolean
  goHome: () => void
  openPlayers: () => void
  closePlayers: () => void
  goSettings: () => void
  openSetup: (id: GameId) => void
  closeSetup: () => void
  startGame: (id: GameId) => void
  exitGame: () => void
  setSoundOn: (on: boolean) => void
  setSoundVolume: (volume: number) => void
  setHapticsOn: (on: boolean) => void
  setMotion: (motion: MotionPref) => void
  setKeepAwake: (on: boolean) => void
  setConfirmExit: (on: boolean) => void
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      screen: "home",
      setupGameId: null,
      activeGameId: null,
      playersOpen: false,
      soundOn: true,
      soundVolume: 80,
      hapticsOn: true,
      motion: "system",
      keepAwake: true,
      confirmExit: true,
      goHome: () =>
        set({
          screen: "home",
          activeGameId: null,
          playersOpen: false,
        }),
      openPlayers: () => set({ playersOpen: true, setupGameId: null }),
      closePlayers: () => set({ playersOpen: false }),
      goSettings: () =>
        set({ screen: "settings", playersOpen: false, setupGameId: null }),
      openSetup: (id) => set({ setupGameId: id, playersOpen: false }),
      closeSetup: () => set({ setupGameId: null }),
      startGame: (id) =>
        set({
          screen: "play",
          activeGameId: id,
          setupGameId: null,
          playersOpen: false,
        }),
      exitGame: () =>
        set({ screen: "home", activeGameId: null, playersOpen: false }),
      setSoundOn: (on) => set({ soundOn: on }),
      setSoundVolume: (volume) =>
        set({ soundVolume: Math.max(0, Math.min(100, Math.round(volume))) }),
      setHapticsOn: (on) => set({ hapticsOn: on }),
      setMotion: (motion) => set({ motion }),
      setKeepAwake: (on) => set({ keepAwake: on }),
      setConfirmExit: (on) => set({ confirmExit: on }),
    }),
    {
      name: "whynot-app",
      version: 1,
      migrate: identityMigrate,
      partialize: (state) => ({
        soundOn: state.soundOn,
        soundVolume: state.soundVolume,
        hapticsOn: state.hapticsOn,
        motion: state.motion,
        keepAwake: state.keepAwake,
        confirmExit: state.confirmExit,
      }),
    }
  )
)
