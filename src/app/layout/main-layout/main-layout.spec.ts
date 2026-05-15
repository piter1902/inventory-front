import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { MainLayout } from './main-layout';
import { AuthService } from '../../auth/auth.service';
import { ThemeService } from '../../services/theme.service';
import { of } from 'rxjs';

@Component({ template: '', standalone: true })
class DummyComponent {}

describe('MainLayout', () => {
  const mockAuthService = {
    userData$: of({ userData: null }),
    login: vi.fn(),
  };

  const mockThemeService = {
    isDark: signal(false),
    toggle: vi.fn(),
  };

  const routes: Routes = [{ path: '', component: DummyComponent }];

  beforeEach(async () => {
    mockAuthService.login.mockClear();
    mockThemeService.toggle.mockClear();

    await TestBed.configureTestingModule({
      imports: [MainLayout],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();
  });

  it('should render page-header', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-page-header')).toBeTruthy();
  });

  it('should render router-outlet', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render bottom-nav', () => {
    const fixture = TestBed.createComponent(MainLayout);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-bottom-nav')).toBeTruthy();
  });
});
