import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

const logoClassName =
  "h-9 w-auto max-h-9 max-w-[7.5rem] shrink-0 object-contain object-left"

export function Logo({ className }: LogoProps) {
  const base = import.meta.env.BASE_URL

  return (
    <>
      <img
        src={`${base}brand/logo-dark.png`}
        alt="WhyNot"
        width={40}
        height={36}
        draggable={false}
        className={cn("hidden dark:block", logoClassName, className)}
      />
      <img
        src={`${base}brand/logo-light.png`}
        alt="WhyNot"
        width={40}
        height={36}
        draggable={false}
        className={cn("block dark:hidden", logoClassName, className)}
      />
    </>
  )
}
