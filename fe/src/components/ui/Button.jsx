import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-primary-500 to-cyan-500 text-white hover:from-primary-600 hover:to-cyan-600 focus:ring-primary-500 shadow-lg hover:shadow-xl hover:scale-[1.02]",
      secondary:
        "bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500",
      outline:
        "border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
      ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
      danger: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
