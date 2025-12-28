import React from "react"
import { cn } from "@/lib/utils"

interface DuolingoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning"
  size?: "sm" | "md" | "lg"
}

const variantStyles = {
  primary: "bg-[#58CC02] border-b-[#46A302] text-white hover:brightness-110 active:border-b-0 active:translate-y-1",
  secondary: "bg-[#3C4DFF] border-b-[#2B39CC] text-white hover:brightness-110 active:border-b-0 active:translate-y-1",
  danger: "bg-[#FF4B4B] border-b-[#D33131] text-white hover:brightness-110 active:border-b-0 active:translate-y-1",
  warning: "bg-[#FFC800] border-b-[#E5B400] text-slate-900 hover:brightness-110 active:border-b-0 active:translate-y-1",
}

const sizeStyles = {
  sm: "px-4 py-2 text-sm border-b-2",
  md: "px-6 py-3 text-base border-b-4",
  lg: "px-8 py-4 text-lg border-b-4",
}

export const DuolingoButton = React.forwardRef<HTMLButtonElement, DuolingoButtonProps>(
  ({ className, variant = "primary", size = "md", disabled = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "rounded-2xl font-semibold transition-all duration-100 ease-out",
          "active:translate-y-1 active:border-b-0",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:brightness-90",
          sizeStyles[size],
          variantStyles[variant],
          className,
        )}
        {...props}
      />
    )
  },
)

DuolingoButton.displayName = "DuolingoButton"
