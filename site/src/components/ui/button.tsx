import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The one shared clay button. Most "buttons" in the castle are actually
 * plain `<a href="#room">` nav links or one-off game controls styled by
 * hand — this exists for the real repeatable CTAs (say hi, play again,
 * gallery arrows, contact pills) so their press/hover feel stays consistent.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "clay-sm clay-interactive rounded-full bg-primary text-primary-foreground hover:brightness-105",
        soft: "clay-sm clay-interactive rounded-full bg-card text-foreground hover:text-primary",
        ghost:
          "rounded-full text-muted-foreground hover:text-foreground hover:bg-muted",
      },
      size: {
        default: "h-11 min-w-11 px-5",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
