import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Notifications } from './notifications';
import { NotificationService } from '../../services/notification.service';

describe('Notifications', () => {
  let fixture: ComponentFixture<Notifications>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Notifications],
    }).compileComponents();

    fixture = TestBed.createComponent(Notifications);
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render anything when there are no notifications', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.notification')).toBeNull();
  });

  it('should render error notification with icon and message', () => {
    notificationService.show('Test error', 'error');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('.notification');
    expect(notification).toBeTruthy();
    expect(notification!.textContent).toContain('Test error');
    expect(notification!.querySelector('.material-symbols-outlined')?.textContent).toContain('error');
  });

  it('should render success notification with check icon', () => {
    notificationService.show('Success!', 'success');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.notification .material-symbols-outlined');
    expect(icon?.textContent).toContain('check_circle');
  });

  it('should render info notification with info icon', () => {
    notificationService.show('Info message', 'info');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.notification .material-symbols-outlined');
    expect(icon?.textContent).toContain('info');
  });

  it('should render multiple notifications', () => {
    notificationService.show('First error', 'error');
    notificationService.show('Second error', 'error');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.notification').length).toBe(2);
  });

  it('should remove notification when clicked', () => {
    notificationService.show('Click to dismiss', 'error');
    fixture.detectChanges();
    expect(notificationService.notifications().length).toBe(1);

    const compiled = fixture.nativeElement as HTMLElement;
    const notification = compiled.querySelector('.notification') as HTMLElement;
    notification.click();
    fixture.detectChanges();

    expect(notificationService.notifications().length).toBe(0);
    expect(compiled.querySelector('.notification')).toBeNull();
  });
});
