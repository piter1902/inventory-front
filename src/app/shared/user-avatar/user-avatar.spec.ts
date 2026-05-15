import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { UserAvatar, getInitials } from './user-avatar';
import { AuthService } from '../../auth/auth.service';

describe('getInitials', () => {
  it('should return initials from full name', () => {
    expect(getInitials({ name: 'John Doe' })).toBe('JD');
  });

  it('should return initials from single name', () => {
    expect(getInitials({ name: 'John' })).toBe('J');
  });

  it('should return initials from given_name and family_name', () => {
    expect(getInitials({ given_name: 'Jane', family_name: 'Doe' })).toBe('JD');
  });

  it('should return initials from given_name only', () => {
    expect(getInitials({ given_name: 'Jane' })).toBe('J');
  });

  it('should return initials from family_name only', () => {
    expect(getInitials({ family_name: 'Doe' })).toBe('D');
  });

  it('should return first letter of email', () => {
    expect(getInitials({ email: 'john@example.com' })).toBe('J');
  });

  it('should return ? for undefined', () => {
    expect(getInitials(undefined)).toBe('?');
  });

  it('should return ? for empty object', () => {
    expect(getInitials({})).toBe('?');
  });
});

describe('UserAvatar', () => {
  let fixture: ComponentFixture<UserAvatar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAvatar],
      providers: [
        {
          provide: AuthService,
          useValue: {
            userData$: of({ userData: { name: 'John Doe' } }),
          } as unknown as AuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAvatar);
    fixture.detectChanges();
  });

  it('should render initials from auth', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent?.trim()).toBe('JD');
  });
});
