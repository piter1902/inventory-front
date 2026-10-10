import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BoxImage } from './box-image';
import { BoxImageService } from '../../services/box-image.service';

@Component({
  imports: [BoxImage],
  template: `<app-box-image boxId="1" [hasImage]="hasImage" alt="Caja" />`,
})
class Host {
  hasImage = true;
}

describe('BoxImage', () => {
  const load = vi.fn();

  beforeEach(async () => {
    load.mockReset().mockResolvedValue('blob:img');
    URL.revokeObjectURL = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [{ provide: BoxImageService, useValue: { load } }],
    }).compileComponents();
  });

  it('should not request the image when the box has none', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.hasImage = false;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should render the loaded image and revoke the URL on destroy', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(load).toHaveBeenCalledWith('1');
    expect(fixture.nativeElement.querySelector('img')?.getAttribute('src')).toBe('blob:img');
    fixture.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:img');
  });
});
