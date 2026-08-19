import { useState } from "react"
import { ArrowLeft, CaretRight } from "@phosphor-icons/react"

import { ConfirmDialog } from "@/components/game/ConfirmDialog"
import { GameButton } from "@/components/game/GameButton"
import {
  Segmented,
  SettingsRow,
  SettingsSection,
  VolumeSlider,
} from "@/components/settings/Controls"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"
import { useApp } from "@/store/app"
import { endNight, resetAllGames } from "@/store/session-actions"
import { useSession } from "@/store/session"

export function SettingsScreen() {
  const goHome = useApp((state) => state.goHome)
  const openPlayers = useApp((state) => state.openPlayers)
  const soundOn = useApp((state) => state.soundOn)
  const setSoundOn = useApp((state) => state.setSoundOn)
  const soundVolume = useApp((state) => state.soundVolume)
  const setSoundVolume = useApp((state) => state.setSoundVolume)
  const hapticsOn = useApp((state) => state.hapticsOn)
  const setHapticsOn = useApp((state) => state.setHapticsOn)
  const motion = useApp((state) => state.motion)
  const setMotion = useApp((state) => state.setMotion)
  const keepAwake = useApp((state) => state.keepAwake)
  const setKeepAwake = useApp((state) => state.setKeepAwake)
  const confirmExit = useApp((state) => state.confirmExit)
  const setConfirmExit = useApp((state) => state.setConfirmExit)
  const players = useSession((state) => state.players)
  const { theme, setTheme } = useTheme()
  const [confirm, setConfirm] = useState<"reset" | "end-night" | null>(null)

  return (
    <div className="flex h-dvh flex-col bg-background px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <header className="flex h-12 shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Back"
          onClick={() => {
            playSound("back")
            goHome()
          }}
          className="flex size-11 items-center justify-center text-muted-foreground"
        >
          <ArrowLeft weight="fill" size={22} />
        </button>
        <h1 className="font-display text-xl font-extrabold tracking-tight">
          SETTINGS
        </h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <SettingsSection title="DISPLAY">
          <div className="bg-card px-4 py-3">
            <p className="mb-2 text-sm font-medium tracking-[0.14em] uppercase">
              Theme
            </p>
            <Segmented
              value={theme === "system" ? "system" : theme}
              options={[
                { id: "dark", label: "Dark" },
                { id: "light", label: "Light" },
                { id: "system", label: "Auto" },
              ]}
              onChange={setTheme}
            />
          </div>
          <div className="bg-card px-4 py-3">
            <p className="mb-2 text-sm font-medium tracking-[0.14em] uppercase">
              Motion
            </p>
            <Segmented
              value={motion}
              options={[
                { id: "system" as const, label: "System" },
                { id: "full" as const, label: "Full" },
                { id: "reduced" as const, label: "Reduced" },
              ]}
              onChange={setMotion}
            />
          </div>
        </SettingsSection>

        <SettingsSection title="FEEDBACK">
          <SettingsRow label="Sound effects">
            <Switch
              checked={soundOn}
              onCheckedChange={(on) => {
                setSoundOn(on)
                if (on) {
                  playSound("toggle")
                }
                haptic("tap")
              }}
            />
          </SettingsRow>
          <VolumeSlider
            value={soundVolume}
            disabled={!soundOn}
            onChange={setSoundVolume}
          />
          <SettingsRow label="Haptics" value={hapticsOn ? "ON" : "OFF"}>
            <Switch
              checked={hapticsOn}
              onCheckedChange={(on) => {
                setHapticsOn(on)
                haptic("tap")
                playSound("toggle")
              }}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="GAMEPLAY">
          <SettingsRow label="Keep screen awake" value={keepAwake ? "ON" : "OFF"}>
            <Switch
              checked={keepAwake}
              onCheckedChange={(on) => {
                setKeepAwake(on)
                haptic("tap")
                playSound("toggle")
              }}
            />
          </SettingsRow>
          <SettingsRow
            label="Confirm before exit"
            value={confirmExit ? "ON" : "OFF"}
          >
            <Switch
              checked={confirmExit}
              onCheckedChange={(on) => {
                setConfirmExit(on)
                haptic("tap")
                playSound("toggle")
              }}
            />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="DATA">
          <SettingsRow
            label="Players"
            value={String(players.length)}
            onClick={() => {
              playSound("select")
              openPlayers()
            }}
          >
            <CaretRight weight="fill" size={16} className="text-muted-foreground" />
          </SettingsRow>
          <SettingsRow
            label="Reset game data"
            onClick={() => {
              playSound("warning")
              setConfirm("reset")
            }}
          >
            <CaretRight weight="fill" size={16} className="text-muted-foreground" />
          </SettingsRow>
        </SettingsSection>
      </div>

      <GameButton
        tone="danger"
        onClick={() => {
          playSound("warning")
          setConfirm("end-night")
        }}
      >
        END NIGHT
      </GameButton>
      <p className="pt-3 text-center font-pixel text-[10px] tracking-[0.18em] text-muted-foreground">
        WHYNOT / v0.1.0
      </p>

      <ConfirmDialog
        open={confirm === "reset"}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null)
          }
        }}
        title="RESET DATA?"
        description="Beer Bomb and Roulette progress clear. Players stay."
        cancelLabel="KEEP"
        confirmLabel="RESET"
        onConfirm={() => {
          resetAllGames()
          haptic("warn")
        }}
      />
      <ConfirmDialog
        open={confirm === "end-night"}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null)
          }
        }}
        title="END NIGHT?"
        description="Players and scores wipe. Fresh table."
        cancelLabel="KEEP"
        confirmLabel="END NIGHT"
        onConfirm={() => {
          haptic("warn")
          endNight()
        }}
      />
    </div>
  )
}
