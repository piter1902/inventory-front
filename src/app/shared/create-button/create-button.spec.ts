import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { CreateButton } from './create-button';

@Component({
  imports: [CreateButton],
  template: `<app-create-button label="Nueva caja" (pressed)="count = count + 1" />`,
})
class Host {
  count = 0;
}

describe('CreateButton', () => {
  it('should expose the label and emit on click', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Nueva caja');
    expect(button.textContent).toContain('Nueva caja');
    button.click();
    expect(fixture.componentInstance.count).toBe(1);
  });
});
