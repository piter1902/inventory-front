import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { PageHeader } from './page-header';
import { PageHeaderService } from './page-header.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../auth/auth.service';

describe('PageHeader', () => {
  const mockHeaderService = {
    title: signal(''),
    showBack: signal(false),
    back: vi.fn(),
  };

  const mockThemeService = {
    isDark: signal(false),
    toggle: vi.fn(),
  };

  const mockAuthService = {
    userData$: of({ userData: { name: 'Test' } }),
  };

  beforeEach(async () => {
    mockHeaderService.title.set('');
    mockHeaderService.showBack.set(false);
    mockHeaderService.back.mockClear();
    mockThemeService.isDark.set(false);
    mockThemeService.toggle.mockClear();

    await TestBed.configureTestingModule({
      imports: [PageHeader],
      providers: [
        { provide: PageHeaderService, useValue: mockHeaderService },
        { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should render title in h1', () => {
    mockHeaderService.title.set('Page Title');
    const fixture = TestBed.createComponent(PageHeader);
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1?.textContent).toContain('Page Title');
  });

  it('should show back button when showBack is true', () => {
    mockHeaderService.showBack.set(true);
    const fixture = TestBed.createComponent(PageHeader);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>;
    const backBtn = Array.from(buttons).find(b =>
      b.textContent?.includes('arrow_back'),
    );
    expect(backBtn).toBeTruthy();
  });

  it('should hide back button when showBack is false', () => {
    mockHeaderService.showBack.set(false);
    const fixture = TestBed.createComponent(PageHeader);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>;
    const backBtn = Array.from(buttons).find(b =>
      b.textContent?.includes('arrow_back'),
    );
    expect(backBtn).toBeFalsy();
  });

  it('should toggle theme when theme button is clicked', () => {
    const fixture = TestBed.createComponent(PageHeader);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>;
    const themeBtn = Array.from(buttons).find(b =>
      b.textContent?.includes('dark_mode') ||
      b.textContent?.includes('light_mode'),
    );
    expect(themeBtn).toBeTruthy();
    themeBtn?.click();
    expect(mockThemeService.toggle).toHaveBeenCalledOnce();
  });

  it('should call headerService.back() when back button is clicked', () => {
    mockHeaderService.showBack.set(true);
    const fixture = TestBed.createComponent(PageHeader);
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLElement>;
    const backBtn = Array.from(buttons).find(b =>
      b.textContent?.includes('arrow_back'),
    ) as HTMLElement;
    backBtn?.click();
    expect(mockHeaderService.back).toHaveBeenCalledOnce();
  });
});
