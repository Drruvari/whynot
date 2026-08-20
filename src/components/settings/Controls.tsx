import type { PointerEvent, ReactNode } from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { haptic } from "@/lib/haptic"
import { playSound } from "@/lib/sound"

export function SettingsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 px-1 font-pixel text-xs tracking-[0.18em] text-muted-foreground">
        {title}
      </h2>
      <div className="flex flex-col gap-px bg-border">{children}</div>
    </section>
  )
}

export function SettingsRow({
  label,
  value,
  onClick,
  children,
}: {
  label: string
  value?: string
  onClick?: () => void
  children?: ReactNode
}) {
  const content = (
    <>
      <span className="text-sm font-medium tracking-[0.14em] uppercase">
        {label}
      </span>
      <span className="flex items-center gap-3">
        {value ? <span className="font-pixel text-sm">{value}</span> : null}
        {children}
      </span>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-14 w-full items-center justify-between bg-card px-4 text-left"
      >
        {content}
      </button>
    )
  }

  return (
    <div className="flex min-h-14 items-center justify-between bg-card px-4">
      {content}
    </div>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { id: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid bg-elevated" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((option) => {
        const selected = option.id === value

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              haptic("tap")
              playSound("toggle")
              onChange(option.id)
            }}
            className={cn(
              "min-h-11 text-xs font-semibold tracking-[0.16em] uppercase",
              selected ? "bg-go text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function VolumeSlider({
  value,
  disabled,
  onChange,
}: {
  value: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  function valueFromEvent(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current

    if (!track) {
      return value
    }

    const rect = track.getBoundingClientRect()
    return Math.round(
      Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * 100
    )
  }

  return (
    <div
      className={cn(
        "flex min-h-14 items-center gap-3 bg-card px-4",
        disabled && "opacity-40"
      )}
    >
      <span
        id="volume-label"
        className="text-sm font-medium tracking-[0.14em] uppercase"
      >
        Volume
      </span>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-labelledby="volume-label"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-disabled={disabled || undefined}
        className="relative h-3 min-w-0 flex-1 bg-elevated outline-none focus-visible:ring-1 focus-visible:ring-ring"
        onKeyDown={(event) => {
          if (disabled) {
            return
          }

          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault()
            onChange(Math.min(100, value + 5))
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault()
            onChange(Math.max(0, value - 5))
          }
          if (event.key === "Home") {
            event.preventDefault()
            onChange(0)
          }
          if (event.key === "End") {
            event.preventDefault()
            onChange(100)
          }
        }}
        onPointerDown={(event) => {
          if (disabled) {
            return
          }

          event.currentTarget.setPointerCapture(event.pointerId)
          onChange(valueFromEvent(event))
        }}
        onPointerMove={(event) => {
          if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) {
            return
          }

          onChange(valueFromEvent(event))
        }}
        onPointerUp={() => {
          if (!disabled) {
            playSound("click")
          }
        }}
      >
        <div className="h-full bg-go" style={{ width: `${value}%` }} />
      </div>
      <span className="w-12 text-right font-pixel text-sm">{value}%</span>
    </div>
  )
}
