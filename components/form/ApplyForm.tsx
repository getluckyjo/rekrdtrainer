"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AGREEMENT_COMMITMENTS, AGREEMENT_VERSION } from "@/lib/claims";
import { validateCode } from "@/lib/codes";
import CodeField, { type CodeState } from "./CodeField";
import s from "./form.module.css";

/* Widened past coaching: the programme now recruits creators, clubs and
   retailers, and this field is required — a list of ten sports would have
   turned an influencer away at the last step. */
const DISCIPLINES = [
  "Creator / influencer",
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
  "Club or gym",
  "Retailer",
  "Athlete",
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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [codeState, setCodeState] = useState<CodeState>("idle");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gym, setGym] = useState("");
  const [instagram, setInstagram] = useState("");
  const [clientBand, setClientBand] = useState("");
  /* One tick per commitment rather than a single blanket "I agree" — these are
     obligations an ambassador is signing up to, not boilerplate. */
  const [commitments, setCommitments] = useState<Record<string, boolean>>({});
  const allAgreed = AGREEMENT_COMMITMENTS.every((c) => commitments[c.id]);
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

  const submitLabel = submitting
    ? "Setting you up…"
    : "Become an ambassador";

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
    if (!addressLine1.trim()) errors.addressLine1 = "We need somewhere to send it";
    if (!postalCode.trim()) errors.postalCode = "And a postal code";
    /* Required now: the bio-link commitment can't be checked against a profile
       we never captured. */
    if (!instagram.trim()) errors.instagram = "We need one profile";
    if (!allAgreed) errors.agreed = "Tick all three to continue";

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
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || null,
          suburb: suburb.trim() || null,
          postalCode: postalCode.trim(),
          disciplines,
          code,
          gym: gym.trim() || null,
          instagram: instagram.trim().replace(/^@/, ""),
          clientBand: clientBand || null,
          marketingOptIn: marketing,
          // Every commitment is required, so this always goes up.
          claimsCheckVersion: AGREEMENT_VERSION,
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

      router.push(`/ambassadors/welcome/${data.code}`);
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

      {/* Framed as the benefit it is, not as data collection — this exists
          because we post them a tub every month. */}
      <div className={s.row}>
        <span className={s.label}>Where do we send your tub?</span>
        <div className={`${s.row} ${s.two}`} style={{ marginTop: 8 }}>
          <div>
            <label className={s.label} htmlFor="addressLine1">
              Street address
            </label>
            <input
              id="addressLine1"
              className={`${s.input} ${fieldErrors.addressLine1 ? s.inputError : ""}`}
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              autoComplete="address-line1"
              required
            />
            {fieldErrors.addressLine1 && (
              <p className={s.error}>{fieldErrors.addressLine1}</p>
            )}
          </div>
          <div>
            <label className={s.label} htmlFor="addressLine2">
              Complex or unit
              <span className={s.optional}>Optional</span>
            </label>
            <input
              id="addressLine2"
              className={s.input}
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              autoComplete="address-line2"
            />
          </div>
        </div>
        <div className={`${s.row} ${s.two}`}>
          <div>
            <label className={s.label} htmlFor="suburb">
              Suburb
              <span className={s.optional}>Optional</span>
            </label>
            <input
              id="suburb"
              className={s.input}
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
            />
          </div>
          <div>
            <label className={s.label} htmlFor="postalCode">
              Postal code
            </label>
            <input
              id="postalCode"
              className={`${s.input} ${fieldErrors.postalCode ? s.inputError : ""}`}
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              required
            />
            {fieldErrors.postalCode && (
              <p className={s.error}>{fieldErrors.postalCode}</p>
            )}
          </div>
        </div>
      </div>

      <div className={s.row}>
        <span className={s.label} id="disciplines-label">
          What's your world?
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
            Gym, club or business
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
            Instagram or TikTok
          </label>
          <input
            id="instagram"
            className={`${s.input} ${fieldErrors.instagram ? s.inputError : ""}`}
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@yourhandle"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
          <p className={s.hint}>
            So we can find you, repost you, and see the link in your bio.
          </p>
          {fieldErrors.instagram && (
            <p className={s.error}>{fieldErrors.instagram}</p>
          )}
        </div>
      </div>

      <div className={s.row}>
        <span className={s.label} id="band-label">
          Roughly how many people?
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

      {/* One tick per commitment. These are obligations, and a single box
          swallowing all three would make the record much weaker — a copy of
          exactly this list goes out in the welcome email. */}
      <div className={s.row}>
        <span className={s.label} id="agreement-label">
          What you&rsquo;re agreeing to
        </span>
        <div role="group" aria-labelledby="agreement-label">
          {AGREEMENT_COMMITMENTS.map((c) => (
            <div className={s.consent} key={c.id}>
              <input
                id={`commit-${c.id}`}
                type="checkbox"
                checked={Boolean(commitments[c.id])}
                onChange={(e) =>
                  setCommitments((prev) => ({
                    ...prev,
                    [c.id]: e.target.checked,
                  }))
                }
              />
              <label htmlFor={`commit-${c.id}`}>
                {c.id === "terms" ? (
                  <>
                    I&rsquo;ll say I earn from my code when I recommend it, and
                    I accept the{" "}
                    <a href="/ambassadors/terms">programme terms</a>.
                  </>
                ) : (
                  c.label
                )}
              </label>
            </div>
          ))}
        </div>
        {fieldErrors.agreed && <p className={s.error}>{fieldErrors.agreed}</p>}
      </div>

      <div className={`${s.consent} ${s.consentOptional}`}>
        <input
          id="marketing"
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        <label htmlFor="marketing">
          Send me the ambassador monthly — new flavours, campaign assets, what&rsquo;s
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
