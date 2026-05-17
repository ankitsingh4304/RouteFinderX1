import React from "react";
import { cn } from "../../lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "bg-electric-blue/20 text-cyan border border-cyan/50",
    success: "bg-emerald-green/20 text-emerald-green border border-emerald-green/50",
    warning: "bg-orange-500/20 text-orange-400 border border-orange-500/50",
    danger: "bg-red-500/20 text-red-400 border border-red-500/50",
    outline: "border border-white/20 text-gray-300",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = "Badge";

export { Badge };
