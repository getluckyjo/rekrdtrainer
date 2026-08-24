"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const LINKS = [
  { href: "#deal", label: "The deal" },
  { href: "#earnings", label: "Earn" },
  { href: "#product", label: "Product" },
];

export default function Nav() {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    const ids = LINKS.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Whichever tracked section is nearest the top of the viewport wins.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-56px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="nav">
      <div className="wrap">
        <a className="nav-logo" href="#top" aria-label="REKRD — back to top">
          <Logo height={22} title={null} />
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              aria-current={active === l.href.slice(1) ? "true" : undefined}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a className="btn ghost small nav-cta" href="#apply">
          Become an ambassador
        </a>
      </div>
      <div className="flavour-bar" />
    </nav>
  );
}
