"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { buttonClasses, ButtonIcon } from "@/components/ui/Button";
import type { site } from "@/content/site";
import { FLAVOR_STORAGE_KEY } from "@/lib/flavor";

type ThankYouFormProps = {
  // Passed from the server so site.ts stays out of the client bundle.
  content: typeof site.thankYou;
  hasSession: boolean;
};

type Answers = {
  flavor_preference?: string;
  occasion_preferences: string[];
  pack_preference?: string;
  snack_instead: string;
};

// Native inputs styled as pills: the label carries the look, the input stays real for keyboards
// and screen readers (radio group for one choice, checkboxes for many).
const pill =
  "relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border-2 border-line bg-white px-4 py-2 type-small font-semibold text-ink transition-colors duration-150 hover:border-berry/50 has-checked:border-berry has-checked:bg-berry has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

/**
 * The four optional research questions on /thank-you (guide/docs/pages/thank-you.md).
 * Everything is optional; skipping is one tap and a failed save never blocks the visitor.
 */
export function ThankYouForm({ content, hasSession }: ThankYouFormProps) {
  const { questions: q } = content;
  const [answers, setAnswers] = useState<Answers>({ occasion_preferences: [], snack_instead: "" });
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [saveError, setSaveError] = useState(false);
  const snackId = useId();

  // Start question 1 on the flavor picked on the landing page, if any.
  useEffect(() => {
    try {
      const picked = sessionStorage.getItem(FLAVOR_STORAGE_KEY);
      if (picked && q.flavor.options.some((o) => o.id === picked)) {
        setAnswers((a) => (a.flavor_preference ? a : { ...a, flavor_preference: picked }));
      }
    } catch {
      // Storage blocked: start empty.
    }
    // TODO(M5): track("thank_you_viewed", { has_session: hasSession })
  }, [q.flavor.options]);

  // No session (page opened directly): just the heading and a way back.
  if (!hasSession) {
    return (
      <Link href={content.back.href} className={buttonClasses({ variant: "outline", className: "mt-8" })}>
        {content.back.label}
      </Link>
    );
  }

  if (status === "done") {
    return (
      <div className="mt-6" role="status">
        <p className="type-body text-ink">{content.done}</p>
        <Link href={content.back.href} className={buttonClasses({ variant: "outline", className: "mt-6" })}>
          {content.back.label}
        </Link>
      </div>
    );
  }

  function toggleOccasion(id: string) {
    setAnswers((a) => ({
      ...a,
      occasion_preferences: a.occasion_preferences.includes(id)
        ? a.occasion_preferences.filter((o) => o !== id)
        : [...a.occasion_preferences, id],
    }));
    // TODO(M5): track("research_answered", { question: "occasion_preferences", option: id })
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    // Send only what was answered.
    const body: Record<string, unknown> = {};
    if (answers.flavor_preference) body.flavor_preference = answers.flavor_preference;
    if (answers.occasion_preferences.length) body.occasion_preferences = answers.occasion_preferences;
    if (answers.pack_preference) body.pack_preference = answers.pack_preference;
    if (answers.snack_instead.trim()) body.snack_instead = answers.snack_instead.trim();

    setStatus("saving");
    setSaveError(false);
    try {
      const res = await fetch("/api/signup/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      // TODO(M5): track("research_submitted")
      setStatus("done");
    } catch {
      setSaveError(true);
      setStatus("idle");
    }
  }

  function skip() {
    // TODO(M5): track("research_skipped")
    setStatus("done");
  }

  const saving = status === "saving";

  return (
    <>
      <p className="mt-4 type-body text-ink">{content.body}</p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-7">
        {/* 1. Flavor: pick one. */}
        <fieldset>
          <legend className="font-heading text-[19px] leading-tight font-semibold text-ink">{q.flavor.label}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.flavor.options.map((o) => (
              <label key={o.id} className={pill}>
                <input
                  type="radio"
                  name={q.flavor.id}
                  value={o.id}
                  checked={answers.flavor_preference === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, flavor_preference: o.id }))}
                  className="sr-only"
                />
                {o.label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* 2. Occasions: pick any. */}
        <fieldset>
          <legend className="font-heading text-[19px] leading-tight font-semibold text-ink">{q.occasions.label}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {q.occasions.options.map((o) => {
              const checked = answers.occasion_preferences.includes(o.id);
              return (
                <label key={o.id} className={pill}>
                  <input
                    type="checkbox"
                    name={q.occasions.id}
                    value={o.id}
                    checked={checked}
                    onChange={() => toggleOccasion(o.id)}
                    className="sr-only"
                  />
                  {checked && <Check aria-hidden strokeWidth={3} className="size-3.5" />}
                  {o.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        {/* 3. Pack: pick one, as two stacked cards. */}
        <fieldset>
          <legend className="font-heading text-[19px] leading-tight font-semibold text-ink">{q.pack.label}</legend>
          <div className="mt-3 flex flex-col gap-3">
            {q.pack.options.map((o) => (
              <label
                key={o.id}
                className="relative flex cursor-pointer items-start gap-3 rounded-card border-2 border-line bg-white p-4 transition-colors duration-150 hover:border-berry/50 has-checked:border-berry has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name={q.pack.id}
                  value={o.id}
                  checked={answers.pack_preference === o.id}
                  onChange={() => setAnswers((a) => ({ ...a, pack_preference: o.id }))}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-outline peer-checked:border-berry peer-checked:bg-berry"
                >
                  <span className="size-2 rounded-full bg-white" />
                </span>
                <span>
                  <span className="block type-body font-semibold text-ink">{o.label}</span>
                  <span className="mt-0.5 block type-small text-muted">{o.detail}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* 4. Free text. */}
        <div>
          <label htmlFor={snackId} className="font-heading text-[19px] leading-tight font-semibold text-ink">
            {q.snack.label}
          </label>
          <input
            id={snackId}
            name={q.snack.id}
            type="text"
            maxLength={q.snack.maxLength}
            placeholder={q.snack.placeholder}
            value={answers.snack_instead}
            onChange={(e) => setAnswers((a) => ({ ...a, snack_instead: e.target.value }))}
            className="mt-3 h-12 w-full rounded-pill border-2 border-line bg-white px-5 text-[16px] text-ink placeholder:text-muted focus-visible:border-berry"
          />
        </div>

        <div role="alert">{saveError && <p className="type-small font-semibold text-danger">{content.saveError}</p>}</div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-4">
          <button type="submit" disabled={saving} aria-busy={saving || undefined} className={buttonClasses({ className: "w-full sm:w-auto" })}>
            {content.submit}
            <ButtonIcon loading={saving} />
          </button>
          <button
            type="button"
            onClick={skip}
            className="inline-flex min-h-11 items-center justify-center rounded-pill px-3 type-button text-ink underline underline-offset-4 hover:text-berry"
          >
            {content.skip}
          </button>
        </div>
      </form>
    </>
  );
}
