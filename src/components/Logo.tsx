import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const base = import.meta.env.BASE_URL

  return (
    <img
      src={`${base}brand/logo-dark.png`}
      alt="WhyNot"
      width={132}
      height={80}
      draggable={false}
      className={cn(
        "h-9 w-auto max-h-9 max-w-[7.5rem] shrink-0 object-contain object-left",
        className
      )}
    />
  )
}
