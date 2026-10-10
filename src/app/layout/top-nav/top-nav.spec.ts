import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopNav } from './top-nav';
import { NAV_ITEMS } from '../nav-items';

describe('TopNav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNav],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render a link for every nav item', () => {
    const fixture = TestBed.createComponent(TopNav);
    fixture.detectChanges();
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a') as NodeListOf<HTMLAnchorElement>,
    );
    expect(links.map(a => a.getAttribute('href'))).toEqual(NAV_ITEMS.map(i => i.route));
  });

  it('should show the label of each item', () => {
    const fixture = TestBed.createComponent(TopNav);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent as string;
    for (const item of NAV_ITEMS) {
      expect(text).toContain(item.label);
    }
  });
});
