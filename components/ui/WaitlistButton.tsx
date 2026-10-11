"use client";

import { ButtonLink } from "@/components/ui/Button";
import { scrollToWaitlist } from "@/lib/scroll";

type WaitlistButtonProps = Omit<React.ComponentProps<typeof ButtonLink>, "onClick">;

/**
 * A link to #waitlist that scrolls there and focuses the email input.
 * Without JavaScript it is a plain anchor link.
 */
export function WaitlistButton(props: WaitlistButtonProps) {
  return (
    <ButtonLink
      {...props}
      onClick={(e) => {
        if (scrollToWaitlist()) e.preventDefault();
      }}
    />
  );
}
