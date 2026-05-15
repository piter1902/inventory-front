import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BottomNav } from './bottom-nav';
import { AuthService } from '../../auth/auth.service';

describe('BottomNav', () => {
  const mockAuthService = {
    login: vi.fn(),
  };

  beforeEach(async () => {
    mockAuthService.login.mockClear();

    await TestBed.configureTestingModule({
      imports: [BottomNav],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should render Cajas link with routerLink /boxes', () => {
    const fixture = TestBed.createComponent(BottomNav);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const cajasLink = Array.from(links).find(a =>
      a.textContent?.includes('Cajas'),
    ) as HTMLAnchorElement;
    expect(cajasLink).toBeTruthy();
    expect(cajasLink.getAttribute('href')).toBe('/boxes');
  });

  it('should render Búsqueda link with routerLink /search', () => {
    const fixture = TestBed.createComponent(BottomNav);
    fixture.detectChanges();
    const links = fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>;
    const searchLink = Array.from(links).find(a =>
      a.textContent?.includes('Búsqueda'),
    ) as HTMLAnchorElement;
    expect(searchLink).toBeTruthy();
    expect(searchLink.getAttribute('href')).toBe('/search');
  });
});
