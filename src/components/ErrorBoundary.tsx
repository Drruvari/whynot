import { Component, type ErrorInfo, type ReactNode } from "react"

import { GameButton } from "@/components/game/GameButton"
import { useApp } from "@/store/app"

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("WhyNot crashed", error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return <CrashScreen onReset={() => this.setState({ error: null })} />
  }
}

function CrashScreen({ onReset }: { onReset: () => void }) {
  const goHome = useApp((state) => state.goHome)

  return (
    <div className="flex size-full flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <p className="font-pixel text-4xl text-danger">CRASH</p>
      <p className="text-sm font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Something broke. Back to home.
      </p>
      <GameButton
        onClick={() => {
          onReset()
          goHome()
        }}
      >
        GO HOME
      </GameButton>
    </div>
  )
}
