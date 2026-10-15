"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { ButtonIcon, buttonClasses } from "@/components/ui/Button";
import type { site } from "@/content/site";
import { readAttribution } from "@/lib/attribution";
import { isValidEmail } from "@/lib/email";
import { FLAVOR_STORAGE_KEY } from "@/lib/flavor";
import { WAITLIST_INPUT_ID } from "@/lib/scroll";

type WaitlistFormProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  content: typeof site.waitlist;
};

type ErrorKey = keyof (typeof site.waitlist)["errors"];

export function WaitlistForm({ content }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<ErrorKey | null>(null);
  const started = useRef(false);
  const router = useRouter();
  const errorId = useId();
  const loading = status === "loading";

  function onFocus() {
    if (started.current) return;
    started.current = true;
    // TODO(M5): track("email_signup_started")
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const value = email.trim();
    // Same rules as the server; an invalid email never sends a request.
    if (!isValidEmail(value)) {
      setError("invalid_email");
      return;
    }
    setError(null);
    setStatus("loading");

    let firstFlavor: string | null = null;
    try {
      firstFlavor = sessionStorage.getItem(FLAVOR_STORAGE_KEY);
    } catch {
      // Storage blocked: send without it.
    }
    const honeypot = new FormData(e.currentTarget).get("company");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: value,
          company: typeof honeypot === "string" ? honeypot : "",
          // One id per attempt; M5 uses it to match the pixel and server Lead events.
          event_id: crypto.randomUUID(),
          first_flavor_click: firstFlavor,
          attribution: readAttribution(),
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        // A repeat email is treated as success; the visitor is never told it was already on the list.
        // TODO(M5): track("email_signup_completed", { duplicate }) and the pixel Lead (new signups only).
        router.push("/thank-you");
        return;
      }
      const reason = data?.error;
      setError(reason === "invalid_email" || reason === "rate_limited" ? reason : "server");
    } catch {
      setError("network");
    }
    setStatus("idle");
  }

  return (
    <form noValidate onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-0 lg:rounded-pill lg:bg-white lg:p-1.5 lg:focus-within:outline-2 lg:focus-within:outline-offset-2 lg:focus-within:outline-ink">
        <label htmlFor={WAITLIST_INPUT_ID} className="sr-only">
          {content.emailLabel}
        </label>
        <input
          id={WAITLIST_INPUT_ID}
          name="email"
          type="email"
          data-wobbie-cursor
          autoComplete="email"
          inputMode="email"
          required
          placeholder={content.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={onFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-[52px] w-full min-w-0 rounded-pill bg-white px-5 text-[16px] text-ink placeholder:text-muted lg:h-12 lg:flex-1 lg:bg-transparent lg:focus-visible:outline-none"
        />
        {/* Honeypot: hidden from people, filled by bots. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
        <button
          type="submit"
          data-wobbie-cursor
          disabled={loading}
          aria-busy={loading || undefined}
          className={buttonClasses({ className: "h-[52px] w-full lg:h-12 lg:w-auto" })}
        >
          {loading ? content.buttonLoading : content.button}
          <ButtonIcon loading={loading} />
        </button>
      </div>

      <div id={errorId} role="alert">
        {error && <p className="mt-2 px-2 type-small font-semibold text-danger">{content.errors[error]}</p>}
      </div>

      <p className="mt-3 px-2 type-small text-ink">{content.reassurance}</p>
      <p className="mt-1 px-2 type-footnote text-muted">
        {content.consent.before}{" "}
        <Link href={content.consent.linkHref} className="underline underline-offset-2 hover:text-ink">
          {content.consent.linkLabel}
        </Link>
      </p>
    </form>
  );
}
