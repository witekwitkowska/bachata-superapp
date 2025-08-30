"use client";
import { cn } from "@/lib/utils";
import React, { useState, useCallback, useImperativeHandle } from "react";
import { motion, useAnimate } from "motion/react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-black dark:text-white shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  onFinish?: (success: boolean) => void;
}

export interface StatefulButtonRef extends HTMLButtonElement {
  finishAnimation: (success: boolean) => void;
}

export const StatefulButton = React.forwardRef<StatefulButtonRef, ButtonProps>(
  ({ className, variant, size, asChild = false, children, onFinish, ...props }, ref) => {
    const [scope, animate] = useAnimate();
    const [isAnimating, setIsAnimating] = useState(false);

    const animateLoading = async () => {
      setIsAnimating(true);
      await animate(
        ".loader",
        {
          width: "20px",
          scale: 1,
          display: "block",
        },
        {
          duration: 0.2,
        },
      );
    };

    const animateSuccess = async () => {
      await animate(
        ".loader",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          duration: 0.2,
        },
      );
      await animate(
        ".check",
        {
          width: "20px",
          scale: 1,
          display: "block",
        },
        {
          duration: 0.2,
        },
      );

      await animate(
        ".check",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          delay: 2,
          duration: 0.2,
        },
      );
      setIsAnimating(false);
    };

    const animateError = async () => {
      await animate(
        ".loader",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          duration: 0.2,
        },
      );
      await animate(
        ".error-icon",
        {
          width: "20px",
          scale: 1,
          display: "block",
        },
        {
          duration: 0.2,
        },
      );

      await animate(
        ".error-icon",
        {
          width: "0px",
          scale: 0,
          display: "none",
        },
        {
          delay: 3,
          duration: 0.2,
        },
      );
      setIsAnimating(false);
    };

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (props.disabled || isAnimating) return;
      await animateLoading();
      await props.onClick?.(event);
    };

    // Expose finish method to parent component
    const finishAnimation = useCallback((success: boolean) => {
      if (success) {
        animateSuccess();
      } else {
        animateError();
      }
    }, []);

    // Expose finishAnimation method via ref
    useImperativeHandle(ref, () => ({
      finishAnimation,
    } as StatefulButtonRef));

    const {
      onClick,
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      ...buttonProps
    } = props;

    // Determine icon color based on variant
    const iconColor = variant === "default" ? "white" : "black";

    return (
      <motion.button
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, className }),
          "flex min-w-[120px] cursor-pointer items-center justify-center gap-2 transition duration-200"
        )}
        {...buttonProps}
        onClick={handleClick}
      >
        <motion.div ref={scope} className="flex items-center gap-2">
          <Loader color={iconColor} />
          <CheckIcon color={iconColor} />
          <ErrorIcon color={iconColor} />
          <motion.span >{children}</motion.span>
        </motion.div>
      </motion.button>
    );
  }
);

const Loader = ({ color = "white" }: { color?: string }) => {
  return (
    <motion.svg
      animate={{
        rotate: [0, 360],
      }}
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      transition={{
        duration: 0.3,
        repeat: Infinity,
        ease: "linear",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="loader"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 3a9 9 0 1 0 9 9" />
    </motion.svg>
  );
};

const CheckIcon = ({ color = "white" }: { color?: string }) => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="check"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M9 12l2 2l4 -4" />
    </motion.svg>
  );
};

const ErrorIcon = ({ color = "white" }: { color?: string }) => {
  return (
    <motion.svg
      initial={{
        scale: 0,
        width: 0,
        display: "none",
      }}
      style={{
        scale: 0.5,
        display: "none",
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="error-icon"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <circle cx="12" cy="12" r="9" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </motion.svg>
  );
};

StatefulButton.displayName = "StatefulButton";
