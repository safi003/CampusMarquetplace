export function getSafeRedirect(fallback = "/") {
  if (typeof window === "undefined") return fallback;

  const redirect = new URLSearchParams(window.location.search).get("redirect");
  if (redirect && redirect.startsWith("/") && !redirect.startsWith("//")) {
    return redirect;
  }
  return fallback;
}