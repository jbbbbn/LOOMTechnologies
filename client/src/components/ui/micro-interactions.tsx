import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface BouncyButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function BouncyButton({ children, onClick, className, disabled }: BouncyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={cn(
        "transform transition-all duration-150 ease-in-out",
        "hover:scale-105 active:scale-95",
        "hover:rotate-1 active:rotate-0",
        isPressed ? "animate-bounce" : "",
        className
      )}
      onClick={() => {
        if (!disabled) {
          setIsPressed(true);
          setTimeout(() => setIsPressed(false), 500);
          onClick?.();
        }
      }}
      disabled={disabled}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {children}
    </button>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  className?: string;
}

export function FloatingElement({ children, className }: FloatingElementProps) {
  return (
    <div className={cn(
      "animate-float",
      className
    )}>
      {children}
    </div>
  );
}

interface ShimmerCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ShimmerCard({ children, className }: ShimmerCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer",
      "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
      className
    )}>
      {children}
    </div>
  );
}

interface HeartbeatProps {
  children: React.ReactNode;
  className?: string;
}

export function Heartbeat({ children, className }: HeartbeatProps) {
  return (
    <div className={cn(
      "animate-pulse",
      "hover:animate-ping",
      className
    )}>
      {children}
    </div>
  );
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypewriterText({ text, speed = 50, className }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <span className={cn("relative", className)}>
      {displayedText}
      {index < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}