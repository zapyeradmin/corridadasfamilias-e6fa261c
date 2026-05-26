export function parseYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const url = input.trim();
  if (!url) return null;
  // Already an id?
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      // /embed/{id}, /shorts/{id}, /v/{id}, /live/{id}
      if (parts.length >= 2 && ["embed", "shorts", "v", "live"].includes(parts[0])) {
        const id = parts[1];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    // fall through
  }
  return null;
}
