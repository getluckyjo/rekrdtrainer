"use client";

import { useEffect, useState } from "react";
import {
  CODE_ISSUE_MESSAGE,
  CODE_MAX,
  nextCandidates,
  normaliseCode,
  suggestFromName,
  validateCode,
} from "@/lib/codes";
import s from "./form.module.css";

export type CodeState = "idle" | "checking" | "free" | "taken" | "invalid";

type Props = {
  value: string;
  onChange: (code: string) => void;
  fullName: string;
  onStateChange: (state: CodeState) => void;
};

/**
 * The delight moment. A coach seeing their own name set in the brand's
 * typography, next to the link a client will actually click, is the hook.
 */
export default function CodeField({
  value,
  onChange,
  fullName,
  onStateChange,
}: Props) {
  /* Only the fetch result is state. Everything else — idle, invalid,
     checking — is derived, so nothing has to setState during an effect. */
  const [checked, setChecked] = useState<{
    code: string;
    available: boolean;
  } | null>(null);
  const [touched, setTouched] = useState(false);

  const issue = value ? validateCode(value) : null;

  const state: CodeState = !value
    ? "idle"
    : issue
      ? "invalid"
      : checked?.code === value
        ? checked.available
          ? "free"
          : "taken"
        : "checking";

  const suggestions =
    state === "taken" ? nextCandidates(value, fullName, 0).slice(0, 3) : [];

  /* Prefill from the name until the coach edits the field themselves. */
  useEffect(() => {
    if (touched) return;
    const [first] = suggestFromName(fullName);
    onChange(first ?? "");
  }, [fullName, touched, onChange]);

  useEffect(() => {
    onStateChange(state);
  }, [state, onStateChange]);

  useEffect(() => {
    if (!value || issue) return;

    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/trainers/code-check?code=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as { available: boolean };
        setChecked({ code: value, available: data.available });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        // Availability is advisory — the DB unique index is the real gate.
        // Treat a failed check as free rather than blocking the signup.
        setChecked({ code: value, available: true });
      }
    }, 350);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [value, issue]);

  return (
    <div className={s.codeWrap}>
      <label className={s.label} htmlFor="code">
        Your code
      </label>
      <input
        id="code"
        name="code"
        className={s.codeInput}
        value={value}
        maxLength={CODE_MAX}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="YOURNAME"
        aria-describedby="code-status"
        onChange={(e) => {
          setTouched(true);
          onChange(normaliseCode(e.target.value));
        }}
      />

      <div className={s.codePreview}>
        <span>
          Code: <b>{value || "—"}</b>
        </span>
        <span>
          Link: <b>coach.rekrd.io/t/{value || "—"}</b>
        </span>
      </div>

      <div className={s.codeStatus} id="code-status" aria-live="polite">
        {state === "checking" && (
          <>
            <span className={`${s.swatch} ${s.checking}`} />
            Checking…
          </>
        )}
        {state === "free" && (
          <>
            <span className={`${s.swatch} ${s.free}`} />
            {value} is yours
          </>
        )}
        {state === "taken" && (
          <>
            <span className={`${s.swatch} ${s.taken}`} />
            Taken — try one of these
          </>
        )}
        {state === "invalid" && issue && (
          <>
            <span className={`${s.swatch} ${s.taken}`} />
            {CODE_ISSUE_MESSAGE[issue]}
          </>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className={s.suggestions}>
          {suggestions.map((sug) => (
            <button
              key={sug}
              type="button"
              className={s.suggestion}
              onClick={() => {
                setTouched(true);
                onChange(sug);
              }}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      <p className={s.hint}>
        This is what a client types at checkout, so keep it short and say it
        out loud once before you commit. It never expires.
      </p>
    </div>
  );
}
