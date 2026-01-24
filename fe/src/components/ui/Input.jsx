import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(
  ({ className, type = "text", label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-slate-400" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-all duration-200",
              Icon && "pl-10",
              error && "border-rose-500 focus:ring-rose-500",
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-sm text-rose-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
