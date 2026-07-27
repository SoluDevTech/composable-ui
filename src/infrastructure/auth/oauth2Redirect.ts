/**
 * Centralised oauth2-proxy redirect helper.
 *
 * Used by the axios response interceptors and the SSE error handler to send
 * the browser to the oauth2-proxy sign-in endpoint when the backend returns
 * 401. The cookie session is shared across subdomains (`.soludev.tech`), so
 * once signed in the user is bounced back here.
 *
 * Guard against infinite redirect loops: if we are already on an oauth2-proxy
 * auth page, do nothing.
 */

const SIGN_IN_PATH = "/oauth2/start";
const SIGN_OUT_PATH = "/oauth2/sign_out";

function isOnAuthPage(): boolean {
  try {
    const href = window.location.href;
    const pathname =
      typeof href === "string" && href.includes("://")
        ? new URL(href).pathname
        : (window.location.pathname ?? "");
    return pathname === SIGN_IN_PATH || pathname === SIGN_OUT_PATH;
  } catch {
    return false;
  }
}

/**
 * Redirects the browser to the oauth2-proxy sign-in endpoint with the
 * current URL as the `rd` (redirect) parameter. No-op if already on the
 * sign-in page (avoids redirect loops).
 */
export function redirectToSignIn(): void {
  if (isOnAuthPage()) return;
  const current = window.location.href;
  const target = `${SIGN_IN_PATH}?rd=${encodeURIComponent(current)}`;
  window.location.href = target;
}

/**
 * Redirects the browser to the oauth2-proxy sign-out endpoint, clearing
 * the cookie session.
 */
export function redirectToSignOut(): void {
  window.location.href = "/oauth2/sign_out";
}
