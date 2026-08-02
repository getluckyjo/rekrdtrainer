"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Gate = {
  passed: boolean;
  pass: () => void;
};

const Ctx = createContext<Gate>({ passed: false, pass: () => {} });

/**
 * The claims check lives in one section and gates the submit button in
 * another, so the state has to be shared. A four-line context beats prop
 * drilling through half a page of server components.
 */
export function ClaimsGateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [passed, setPassed] = useState(false);
  const value = useMemo(
    () => ({ passed, pass: () => setPassed(true) }),
    [passed],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClaimsGate() {
  return useContext(Ctx);
}
