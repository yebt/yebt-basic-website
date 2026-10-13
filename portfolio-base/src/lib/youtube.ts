const ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com']);

/** Extracts an 11-character YouTube video id, or undefined for anything else. */
export function youtubeVideoId(input: string): string | undefined {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return undefined;
  }
  if (!HOSTS.has(url.hostname)) return undefined;
  const parts = url.pathname.split('/').filter(Boolean);
  let id: string | null | undefined;
  if (url.hostname === 'youtu.be') id = parts[0];
  else if (parts[0] === 'watch') id = url.searchParams.get('v');
  else if (parts[0] === 'embed' || parts[0] === 'shorts') id = parts[1];
  return id && ID.test(id) ? id : undefined;
}

/** Privacy-enhanced embed URL (no cookies until playback). */
export function youtubeEmbedUrl(input: string): string | undefined {
  const id = youtubeVideoId(input);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
}
