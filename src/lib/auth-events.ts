/** Lightweight bridge so Auth and Cart stay decoupled across client chunks. */

export const AUTH_CHANGED_EVENT = "wastro:auth-changed";

export function emitAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
