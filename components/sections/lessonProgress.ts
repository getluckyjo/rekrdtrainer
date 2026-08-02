"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "rekrd.lessons.read";

/**
 * Which lessons a coach has opened, persisted so the rail survives a reload.
 *
 * An external store rather than state-loaded-in-an-effect: it reads on the
 * first client render instead of after one, so the rail never flashes 0 of 8
 * for someone who's been here before.
 */

const listeners = new Set<() => void>();

/** Cached so getSnapshot returns a stable reference between notifications. */
let snapshot: readonly string[] = [];
let loaded = false;

const EMPTY: readonly string[] = [];

function load(): readonly string[] {
  if (loaded) return snapshot;
  loaded = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    snapshot = Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    // Private browsing, quota, a corrupt value — the rail is decoration.
    snapshot = [];
  }
  return snapshot;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function markLessonRead(id: string): void {
  const current = load();
  if (current.includes(id)) return;

  snapshot = [...current, id];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore — in-memory progress is still correct for this session */
  }
  listeners.forEach((l) => l());
}

export function useLessonsRead(): readonly string[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
