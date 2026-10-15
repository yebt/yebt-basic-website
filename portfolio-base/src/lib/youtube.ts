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

/**
 * Privacy-enhanced embed URL (no cookies until playback). `autoplay` is for
 * the facade: the player is only created after a click, so it should start at once.
 */
export function youtubeEmbedUrl(input: string, options: { autoplay?: boolean } = {}): string | undefined {
  const id = youtubeVideoId(input);
  if (!id) return undefined;
  const base = `https://www.youtube-nocookie.com/embed/${id}`;
  return options.autoplay ? `${base}?autoplay=1&rel=0` : base;
}

/** Still frame for a video id: the 480x360 "hqdefault", which every video has. */
export function youtubeThumbnail(id: string, format: 'jpg' | 'webp' = 'jpg'): string {
  return format === 'webp' ? `https://i.ytimg.com/vi_webp/${id}/hqdefault.webp` : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

const LIST = /^[A-Za-z0-9_-]{10,64}$/;

/** The playlist id (`list` parameter) of a YouTube URL, or undefined. */
export function youtubePlaylistId(input: string): string | undefined {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return undefined;
  }
  if (!HOSTS.has(url.hostname)) return undefined;
  const list = url.searchParams.get('list');
  return list && LIST.test(list) ? list : undefined;
}
