import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('ThemeService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  it('should initialize with light mode by default', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    mockMatchMedia(false);

    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('should toggle from light to dark', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    mockMatchMedia(false);

    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(false);

    service.toggle();
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('should persist to localStorage on toggle', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    mockMatchMedia(false);
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const service = TestBed.inject(ThemeService);
    service.toggle();
    expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should set data-theme attribute on html element', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    mockMatchMedia(false);

    const service = TestBed.inject(ThemeService);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.toggle();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
