import { useEffect } from "react"

import { useApp } from "@/store/app"

export function useWakeLock(active: boolean) {
  const keepAwake = useApp((state) => state.keepAwake)

  useEffect(() => {
    if (
      !active ||
      !keepAwake ||
      typeof navigator === "undefined" ||
      !navigator.wakeLock
    ) {
      return
    }

    let lock: WakeLockSentinel | null = null
    let cancelled = false

    async function request() {
      try {
        lock = await navigator.wakeLock.request("screen")
      } catch {
        // Unsupported, denied, or document not visible.
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible" && !cancelled) {
        void request()
      }
    }

    void request()
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibility)
      void lock?.release()
    }
  }, [active, keepAwake])
}
