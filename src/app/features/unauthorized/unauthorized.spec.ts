import { TestBed } from '@angular/core/testing';
import { Unauthorized } from './unauthorized';
import { provideRouter } from '@angular/router';

describe('Unauthorized', () => {
  let fixture: any;
  let component: Unauthorized;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Unauthorized],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Unauthorized);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the error heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Acceso no autorizado');
  });

  it('should render the error description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No se ha podido iniciar sesión');
  });

  it('should display "Volver al inicio" button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Volver al inicio');
  });

  it('should render the material icon', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const icon = compiled.querySelector('.material-symbols-outlined');
    expect(icon).toBeTruthy();
    expect(icon?.textContent).toContain('gpp_bad');
  });
});
