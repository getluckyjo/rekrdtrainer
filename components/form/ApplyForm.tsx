"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CLAIMS_CHECK_VERSION } from "@/lib/claims";
import { validateCode } from "@/lib/codes";
import { useClaimsGate } from "@/components/sections/ClaimsGate";
import CodeField, { type CodeState } from "./CodeField";
import s from "./form.module.css";

const DISCIPLINES = [
  "Personal training",
  "Biokinetics",
  "Padel",
  "Tennis",
  "Golf",
  "Running",
  "Cycling",
  "CrossFit",
  "Pilates / Yoga",
  "Team sport",
  "Other",
];

const CITIES = [
  "Johannesburg",
  "Pretoria",
  "Cape Town",
  "Durban",
  "Port Elizabeth",
  "Gqeberha",
  "Bloemfontein",
  "East London",
  "Nelspruit",
  "Mbombela",
  "Polokwane",
  "Kimberley",
  "Rustenburg",
  "George",
  "Stellenbosch",
  "Paarl",
  "Somerset West",
  "Centurion",
  "Midrand",
  "Sandton",
  "Randburg",
  "Roodepoort",
  "Benoni",
  "Boksburg",
  "Pietermaritzburg",
  "Ballito",
  "Umhlanga",
  "Knysna",
  "Hermanus",
  "Potchefstroom",
];

const CLIENT_BANDS = ["1–10", "11–25", "26–50", "51–100", "100+"];

export default function ApplyForm() {
  const router = useRouter();
  const { passed } = useClaimsGate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<CodeState>("idle");
  const [gym, setGym] = useState("");
  const [instagram, setInstagram] = useState("");
  const [clientBand, setClientBand] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [trap, setTrap] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [startedAt] = useState(() => Date.now());

  const toggle = (d: string) =>
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );

  const canSubmit = !submitting;

  const submitLabel = submitting ? "Creating your code…" : "Get my code";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "We need a name";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      errors.email = "Check that email address";
    if (phone.replace(/\D/g, "").length < 9)
      errors.phone = "Check that mobile number";
    if (!city.trim()) errors.city = "Where are you based?";
    if (disciplines.length === 0) errors.disciplines = "Pick at least one";
    if (validateCode(code)) errors.code = "Pick a valid code";
    if (codeState === "taken") errors.code = "That code is taken";
    if (!agreed) errors.agreed = "We need this one";

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Almost — a couple of fields need another look.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/trainers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          city: city.trim(),
          disciplines,
          code,
          gym: gym.trim() || null,
          instagram: instagram.trim().replace(/^@/, "") || null,
          clientBand: clientBand || null,
          marketingOptIn: marketing,
          // Optional: only stamped when the coach actually completed the check.
          claimsCheckVersion: passed ? CLAIMS_CHECK_VERSION : null,
          // Bot signals: a filled honeypot, or a form completed impossibly fast.
          trap,
          elapsedMs: Date.now() - startedAt,
        }),
      });

      const data = (await res.json()) as {
        code?: string;
        error?: string;
        suggestions?: string[];
      };

      if (res.status === 409) {
        setFieldErrors({
          code: data.suggestions?.length
            ? `Just taken — try ${data.suggestions.join(" or ")}`
            : "That code was just taken",
        });
        setFormError("Someone claimed that code a moment before you did.");
        setSubmitting(false);
        return;
      }

      if (!res.ok || !data.code) {
        setFormError(
          data.error ??
            "Something went wrong on our side. Try again, and if it keeps happening email partners@rekrd.io.",
        );
        setSubmitting(false);
        return;
      }

      router.push(`/coaches/welcome/${data.code}`);
    } catch {
      setFormError(
        "Couldn't reach us — check your connection and try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form className={s.form} onSubmit={onSubmit} noValidate>
      {formError && <div className={s.formError}>{formError}</div>}

      <div className={`${s.row} ${s.two}`}>
        <div>
          <label className={s.label} htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            className={`${s.input} ${fieldErrors.fullName ? s.inputError : ""}`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            required
          />
          {fieldErrors.fullName && (
            <p className={s.error}>{fieldErrors.fullName}</p>
          )}
        </div>
        <div>
          <label className={s.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            className={`${s.input} ${fieldErrors.email ? s.inputError : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          {fieldErrors.email && <p className={s.error}>{fieldErrors.email}</p>}
        </div>
      </div>

      <div className={`${s.row} ${s.two}`}>
        <div>
          <label className={s.label} htmlFor="phone">
            Mobile
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            className={`${s.input} ${fieldErrors.phone ? s.inputError : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="082 123 4567"
            autoComplete="tel"
            required
          />
          <p className={s.hint}>
            So we can WhatsApp you your link and QR. Nothing else.
          </p>
          {fieldErrors.phone && <p className={s.error}>{fieldErrors.phone}</p>}
        </div>
        <div>
          <label className={s.label} htmlFor="city">
            City or town
          </label>
          <input
            id="city"
            className={`${s.input} ${fieldErrors.city ? s.inputError : ""}`}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list="sa-cities"
            autoComplete="address-level2"
            required
          />
          <datalist id="sa-cities">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {fieldErrors.city && <p className={s.error}>{fieldErrors.city}</p>}
        </div>
      </div>

      <div className={s.row}>
        <span className={s.label} id="disciplines-label">
          What do you coach?
        </span>
        <div
          className={s.chips}
          role="group"
          aria-labelledby="disciplines-label"
        >
          {DISCIPLINES.map((d) => (
            <button
              key={d}
              type="button"
              className={s.chipBtn}
              aria-pressed={disciplines.includes(d)}
              onClick={() => toggle(d)}
            >
              {d}
            </button>
          ))}
        </div>
        {fieldErrors.disciplines && (
          <p className={s.error}>{fieldErrors.disciplines}</p>
        )}
      </div>

      <div className={s.row}>
        <CodeField
          value={code}
          onChange={setCode}
          fullName={fullName}
          onStateChange={setCodeState}
        />
        {fieldErrors.code && <p className={s.error}>{fieldErrors.code}</p>}
      </div>

      <div className={`${s.row} ${s.two}`}>
        <div>
          <label className={s.label} htmlFor="gym">
            Gym, studio or club
            <span className={s.optional}>Optional</span>
          </label>
          <input
            id="gym"
            className={s.input}
            value={gym}
            onChange={(e) => setGym(e.target.value)}
          />
        </div>
        <div>
          <label className={s.label} htmlFor="instagram">
            Instagram
            <span className={s.optional}>Optional</span>
          </label>
          <input
            id="instagram"
            className={s.input}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@yourhandle"
            autoCapitalize="none"
            spellCheck={false}
          />
          <p className={s.hint}>
            So we can find you, repost you, and send assets that suit your feed.
          </p>
        </div>
      </div>

      <div className={s.row}>
        <span className={s.label} id="band-label">
          Roughly how many clients?
          <span className={s.optional}>Optional</span>
        </span>
        <div className={s.chips} role="group" aria-labelledby="band-label">
          {CLIENT_BANDS.map((b) => (
            <button
              key={b}
              type="button"
              className={s.chipBtn}
              aria-pressed={clientBand === b}
              onClick={() => setClientBand(clientBand === b ? "" : b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className={s.consent}>
        <input
          id="agreed"
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <label htmlFor="agreed">
          I&rsquo;ve read <a href="#claims">how to talk about REKRD</a>{" "}
          and I&rsquo;ll stick to it. I accept the{" "}
          <a href="/coaches/terms">programme terms</a>.
        </label>
      </div>
      {fieldErrors.agreed && <p className={s.error}>{fieldErrors.agreed}</p>}

      <div className={`${s.consent} ${s.consentOptional}`}>
        <input
          id="marketing"
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <label htmlFor="marketing">
          Send me the coach monthly — new flavours, campaign assets, what&rsquo;s
          actually selling. Optional, and you can stop it any time.
        </label>
      </div>

      {/* Honeypot. Real people never see it, bots fill everything. */}
      <div className={s.honeypot} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
        />
      </div>

      <div className={s.submitRow}>
        <button
          type="submit"
          className={`btn ${s.submit}`}
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
        >
          {submitLabel}
        </button>
        <p className={s.submitNote}>
          No banking details — we ask for those once you&rsquo;ve actually
          earned something. Your code is live the moment you submit.
        </p>
      </div>
    </form>
  );
}
