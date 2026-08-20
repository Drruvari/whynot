import { HomeScreen } from "@/screens/HomeScreen"
import { PlayScreen } from "@/screens/PlayScreen"
import { PlayersDrawer } from "@/screens/PlayersScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"
import { useWakeLock } from "@/hooks/use-wake-lock"
import { useApp } from "@/store/app"

export function App() {
  const screen = useApp((state) => state.screen)
  useWakeLock(screen === "play")

  return (
    <div className="flex size-full min-h-0 flex-col bg-background">
      {screen === "home" ? <HomeScreen /> : null}
      {screen === "settings" ? <SettingsScreen /> : null}
      {screen === "play" ? <PlayScreen /> : null}
      <PlayersDrawer />
    </div>
  )
}

export default App
