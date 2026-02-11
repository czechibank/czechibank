import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-2 border-black bg-primary text-primary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-primary/90 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        destructive:
          "border-2 border-black bg-destructive text-destructive-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-destructive/90",
        outline:
          "border-2 border-black bg-background shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-accent hover:text-accent-foreground hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        secondary:
          "border-2 border-black bg-secondary text-secondary-foreground shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-5 px-1 py-1",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot.Root : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
