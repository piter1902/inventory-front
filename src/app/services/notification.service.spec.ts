import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty notifications', () => {
    expect(service.notifications()).toEqual([]);
  });

  it('should add a notification on show()', () => {
    service.show('Error message', 'error');

    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Error message');
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].id).toBeDefined();
  });

  it('should default to error type', () => {
    service.show('Something went wrong');

    expect(service.notifications()[0].type).toBe('error');
  });

  it('should add multiple notifications', () => {
    service.show('First error', 'error');
    service.show('Second error', 'error');

    expect(service.notifications().length).toBe(2);
  });

  it('should remove a notification by id', () => {
    service.show('Error message', 'error');
    const id = service.notifications()[0].id;

    service.remove(id);

    expect(service.notifications()).toEqual([]);
  });

  it('should remove only the specified notification', () => {
    service.show('First', 'error');
    service.show('Second', 'error');
    const firstId = service.notifications()[0].id;

    service.remove(firstId);

    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].message).toBe('Second');
  });

  it('should auto-remove notification after timeout', () => {
    service.show('Auto dismiss', 'error');
    expect(service.notifications().length).toBe(1);

    vi.advanceTimersByTime(5000);

    expect(service.notifications()).toEqual([]);
  });

  it('should not remove other notifications on auto-dismiss', () => {
    service.show('First', 'error');
    vi.advanceTimersByTime(1000);
    service.show('Second', 'error');
    expect(service.notifications().length).toBe(2);

    vi.advanceTimersByTime(4000);

    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].message).toBe('Second');
  });
});
