import { cn } from "@/lib/utils";

interface LoomSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoomSpinner({ size = "md", className }: LoomSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-2 border-orange-200 dark:border-orange-800 animate-pulse"></div>
      
      {/* Middle ring */}
      <div className="absolute inset-1 rounded-full border-2 border-orange-400 dark:border-orange-600 animate-spin" 
           style={{ animationDuration: '1.5s' }}></div>
      
      {/* Inner dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 animate-ping"></div>
      </div>
      
      {/* Rotating arc */}
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-500 animate-spin"
           style={{ animationDuration: '0.8s' }}></div>
    </div>
  );
}

export function LoomLoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

export function LoomPulse({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {/* Pulse effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-orange-600/20 animate-pulse"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}