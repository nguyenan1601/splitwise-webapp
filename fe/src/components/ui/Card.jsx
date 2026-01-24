import { cn } from "../../lib/utils";

function Card({ className, children, glass = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border shadow-sm",
        glass
          ? "bg-white/80 backdrop-blur-md border-white/20"
          : "bg-white border-slate-200",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold text-slate-900", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn("px-6 py-4 border-t border-slate-100", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
