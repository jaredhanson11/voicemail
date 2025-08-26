// Ephemeral in-memory demo state. Reset on every app reload.
let papaUnlocked = false;

export function setDemoPapaUnlocked(v: boolean) {
  papaUnlocked = v;
}

export function isDemoPapaUnlocked(): boolean {
  return papaUnlocked;
}

// Dummy export to ensure module is picked up in certain TS resolution edge cases
export const __demoState = { get: () => papaUnlocked };
