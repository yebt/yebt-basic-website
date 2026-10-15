import { describe, expect, it } from 'vitest';
import { youtubeEmbedUrl, youtubePlaylistId, youtubeThumbnail, youtubeVideoId, youtubeWatchUrl } from './youtube';

describe('youtubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtube.com/watch?v=dQw4w9WgXcQ&t=42', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://m.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('reads the id from %s', (url, id) => {
    expect(youtubeVideoId(url)).toBe(id);
  });

  it.each([
    'https://vimeo.com/123',
    'https://www.youtube.com/playlist?list=PL123',
    'not a url',
    'https://www.youtube.com/watch?v=<script>',
  ])('returns undefined for %s', (url) => {
    expect(youtubeVideoId(url)).toBeUndefined();
  });
});

describe('youtubeEmbedUrl', () => {
  it('uses the privacy-enhanced domain', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('returns undefined when there is no video id', () => {
    expect(youtubeEmbedUrl('https://vimeo.com/1')).toBeUndefined();
  });
});

describe('youtubeEmbedUrl with autoplay', () => {
  it('asks the player to start at once and to keep related videos on the channel', () => {
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ', { autoplay: true })).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0',
    );
  });
});

describe('youtubeThumbnail', () => {
  it('builds the high-quality JPEG still by default', () => {
    expect(youtubeThumbnail('dQw4w9WgXcQ')).toBe('https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  });

  it('builds the WebP variant from its own path', () => {
    expect(youtubeThumbnail('dQw4w9WgXcQ', 'webp')).toBe('https://i.ytimg.com/vi_webp/dQw4w9WgXcQ/hqdefault.webp');
  });
});

describe('youtubeWatchUrl', () => {
  it('links to the watch page for a video id', () => {
    expect(youtubeWatchUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});

describe('youtubePlaylistId', () => {
  it('reads the list parameter of a playlist URL', () => {
    expect(youtubePlaylistId('https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG')).toBe(
      'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',
    );
  });

  it.each(['https://vimeo.com/playlist?list=PL123456789012', 'https://www.youtube.com/playlist?list=<x>', 'nope'])(
    'returns undefined for %s',
    (url) => {
      expect(youtubePlaylistId(url)).toBeUndefined();
    },
  );
});
