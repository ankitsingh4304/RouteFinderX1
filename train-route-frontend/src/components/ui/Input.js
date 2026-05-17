import React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative flex items-center w-full">
      {Icon && (
        <div className="absolute left-3 text-gray-400">
          <Icon size={18} />
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border border-white/10 bg-dark-card/50 px-3 py-2 text-sm text-white transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          Icon && "pl-10",
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
});
Input.displayName = "Input";

export { Input };
