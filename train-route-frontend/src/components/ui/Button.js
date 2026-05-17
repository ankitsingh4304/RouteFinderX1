import React from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const variants = {
      default: "bg-electric-blue text-white hover:bg-cyan hover:shadow-[0_0_15px_rgba(0,240,255,0.6)] border border-transparent",
      outline: "border border-cyan text-cyan hover:bg-cyan/10 hover:shadow-[0_0_10px_rgba(0,240,255,0.4)]",
      ghost: "text-white hover:bg-white/10",
      emerald: "bg-emerald-green text-deep-navy hover:bg-[#00c853] hover:shadow-[0_0_15px_rgba(0,230,118,0.6)] font-semibold",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-12 rounded-lg px-8 text-lg",
      icon: "h-10 w-10",
    };

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export { Button };
