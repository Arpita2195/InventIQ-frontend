import { cn } from "../../lib/utils";
export { cn };

/**
 * ShimmerButton - A premium animated button with shimmer hover effect.
 * Professional Modern Style: Focused on brand colors with smooth animations
 */
export function ShimmerButton({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 hover:from-indigo-700 hover:via-violet-700 hover:to-indigo-800",
    secondary:
      "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-600 hover:from-cyan-600 hover:via-blue-700 hover:to-cyan-700",
    accent:
      "bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:via-teal-700 hover:to-emerald-700",
    danger:
      "bg-gradient-to-r from-rose-500 via-red-600 to-rose-600 hover:from-rose-600 hover:via-red-700 hover:to-rose-700",
    dark: "bg-gradient-to-r from-slate-800 via-slate-900 to-slate-950 hover:from-slate-900 hover:via-slate-950 hover:to-black",
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden px-4 py-2.5 rounded-xl font-semibold text-white",
        "transition-all duration-300 ease-out",
        "hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98]",
        "group cursor-pointer border-0",
        variants[variant],
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
      <div
        className={cn(
          "absolute inset-0 -translate-x-full",
          "bg-gradient-to-r from-transparent via-white/30 to-transparent",
          "group-hover:translate-x-full transition-transform duration-700 ease-in-out",
        )}
      />
    </button>
  );
}

/**
 * GlowButton - Button with premium glow effect
 */
export function GlowButton({ children, className, color = "primary", ...props }) {
  const glowColors = {
    primary: "shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)]",
    secondary: "shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.6)]",
    success: "shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.6)]",
    warning: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.6)]",
    danger: "shadow-[0_0_20px_-5px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.6)]",
  };

  const bgColors = {
    primary: "bg-indigo-600 hover:bg-indigo-700",
    secondary: "bg-cyan-600 hover:bg-cyan-700",
    success: "bg-emerald-600 hover:bg-emerald-700",
    warning: "bg-amber-500 hover:bg-amber-600",
    danger: "bg-rose-600 hover:bg-rose-700",
  };

  return (
    <button
      className={cn(
        "px-4 py-2.5 rounded-xl font-semibold text-white",
        "transition-all duration-300",
        "hover:scale-[1.02] active:scale-[0.98]",
        bgColors[color],
        glowColors[color],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * GradientCard - A card with professional gradient backgrounds
 */
export function GradientCard({
  children,
  className,
  gradient = "primary",
  ...props
}) {
  const gradients = {
    primary: "bg-gradient-to-br from-indigo-50/50 via-white to-white",
    secondary: "bg-gradient-to-br from-cyan-50/50 via-white to-white",
    success: "bg-gradient-to-br from-emerald-50/50 via-white to-white",
    slate: "bg-gradient-to-br from-slate-50 via-white to-slate-100/50",
    premium: "bg-gradient-to-br from-indigo-50 via-cyan-50 to-white",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-sm border border-slate-200/60 backdrop-blur-sm",
        "transition-all duration-300 hover:shadow-md hover:border-slate-300/80",
        gradients[gradient],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Badge - Clean professional badge component
 */
export function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border border-slate-200",
    primary: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    secondary: "bg-cyan-50 text-cyan-700 border border-cyan-100",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border border-amber-100",
    danger: "bg-rose-50 text-rose-700 border border-rose-100",
    outline: "bg-transparent border-2 border-indigo-200 text-indigo-600",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center justify-center",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Input - Styled input with premium aesthetics
 */
export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "w-full px-4 py-2.5 rounded-xl text-sm",
        "bg-white border border-slate-200",
        "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
        "transition-all duration-200 outline-none",
        "placeholder:text-slate-400 text-slate-800",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Select - Styled select dropdown
 */
export function Select({ className, children, ...props }) {
  return (
    <div className="relative w-full">
      <select
        className={cn(
          "w-full px-4 py-2.5 rounded-xl text-sm appearance-none",
          "bg-white border border-slate-200",
          "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
          "transition-all duration-200 outline-none",
          "cursor-pointer text-slate-800",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  );
}

/**
 * StatCard - Professional stat display card
 */
export function StatCard({ label, value, icon, trend, color = "primary" }) {
  const colorSchemes = {
    primary: "from-indigo-500 to-violet-600",
    secondary: "from-cyan-500 to-blue-600",
    success: "from-emerald-500 to-teal-600",
    warning: "from-amber-500 to-orange-500",
    danger: "from-rose-500 to-red-600",
  };

  const bgLight = {
    primary: "bg-indigo-50",
    secondary: "bg-cyan-50",
    success: "bg-emerald-50",
    warning: "bg-amber-50",
    danger: "bg-rose-50",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl", bgLight[color])}>
          {icon && <span className="text-xl inline-block transition-transform duration-300 hover:scale-110">{icon}</span>}
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1",
              trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
            )}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>
    </div>
  );
}

/**
 * GlassCard - Glassmorphism card effect
 */
export function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6",
        "bg-white/70 backdrop-blur-xl",
        "border border-white/60",
        "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)]",
        "transition-all duration-300 hover:bg-white/80",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
