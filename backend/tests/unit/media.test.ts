import { toMediaUrl } from '../../src/lib/media';

// .env.test sets MEDIA_BASE_URL=http://cdn.test
describe('toMediaUrl', () => {
  it('returns absolute http(s) URLs untouched', () => {
    expect(toMediaUrl('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(toMediaUrl('http://example.com/b.png')).toBe('http://example.com/b.png');
  });

  it('uses the configured base by default and adds a missing slash', () => {
    expect(toMediaUrl('static/x.svg')).toBe('http://cdn.test/static/x.svg');
    expect(toMediaUrl('/static/x.svg')).toBe('http://cdn.test/static/x.svg');
  });

  it('returns a plain rooted path when no base is set', () => {
    expect(toMediaUrl('static/x.svg', '')).toBe('/static/x.svg');
    expect(toMediaUrl('/static/x.svg', '')).toBe('/static/x.svg');
  });

  it('strips a trailing slash from the base', () => {
    expect(toMediaUrl('/a.png', 'http://cdn.test/')).toBe('http://cdn.test/a.png');
  });
});
