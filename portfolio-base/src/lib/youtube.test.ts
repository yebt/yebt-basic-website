import { describe, expect, it } from 'vitest';
import { youtubeEmbedUrl, youtubeVideoId } from './youtube';

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
