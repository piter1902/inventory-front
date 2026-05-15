import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { PageHeaderService } from './page-header.service';

describe('PageHeaderService', () => {
  let service: PageHeaderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([])],
    }).compileComponents();
    service = TestBed.inject(PageHeaderService);
  });

  it('should have initial title as empty string', () => {
    expect(service.title()).toBe('');
  });

  it('should have initial showBack as false', () => {
    expect(service.showBack()).toBe(false);
  });

  it('should update title when setTitle is called', () => {
    service.setTitle('Test Title');
    expect(service.title()).toBe('Test Title');
  });

  it('should update showBack when setShowBack is called', () => {
    service.setShowBack(true);
    expect(service.showBack()).toBe(true);
  });

  describe('back()', () => {
    it('should call window.history.back when history length > 1', () => {
      vi.spyOn(window.history, 'length', 'get').mockReturnValue(2);
      const backSpy = vi.spyOn(window.history, 'back');
      service.back();
      expect(backSpy).toHaveBeenCalledOnce();
    });

    it('should navigate to /boxes when history length <= 1', () => {
      vi.spyOn(window.history, 'length', 'get').mockReturnValue(1);
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigateByUrl');
      service.back();
      expect(navigateSpy).toHaveBeenCalledWith('/boxes');
    });
  });
});
