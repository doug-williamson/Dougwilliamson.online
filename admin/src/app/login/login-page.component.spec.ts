import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { LoginPageComponent } from './login-page.component';
import { AuthService } from '@foliokit/cms-core';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let signInSpy: ReturnType<typeof vi.fn>;
  let signOutSpy: ReturnType<typeof vi.fn>;

  function setup(opts: { authenticated?: boolean; admin?: boolean } = {}) {
    const { authenticated = false, admin = true } = opts;
    signInSpy = vi.fn().mockResolvedValue(undefined);
    signOutSpy = vi.fn().mockResolvedValue(undefined);

    const authMock = {
      isAuthenticated: signal(authenticated),
      isAdmin: signal(admin),
      signInWithGoogle: signInSpy,
      signOut: signOutSpy,
    };

    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
  }

  it('renders the DW logo mark', () => {
    setup();
    expect(fixture.nativeElement.textContent).toContain('DW');
  });

  it('renders the "Doug Williamson" heading', () => {
    setup();
    expect(fixture.nativeElement.querySelector('h1').textContent.trim()).toBe('Doug Williamson');
  });

  it('renders the "Sign in to continue" subtitle', () => {
    setup();
    expect(fixture.nativeElement.textContent).toContain('Sign in to continue');
  });

  it('does not show an error message initially', () => {
    setup();
    expect(fixture.nativeElement.querySelector('[data-testid="error"]')).toBeNull();
  });

  it('calls signInWithGoogle when the button is clicked', async () => {
    setup();
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    expect(signInSpy).toHaveBeenCalledTimes(1);
  });

  it('shows "Sign-in failed" error when signInWithGoogle rejects', async () => {
    setup();
    signInSpy.mockRejectedValue(new Error('popup closed'));
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    const err = fixture.nativeElement.querySelector('[data-testid="error"]');
    expect(err?.textContent).toContain('Sign-in failed');
  });

  it('shows "Access denied" and signs out when user is not an admin', async () => {
    setup({ admin: false });
    fixture.nativeElement.querySelector('button').click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(signOutSpy).toHaveBeenCalled();
    const err = fixture.nativeElement.querySelector('[data-testid="error"]');
    expect(err?.textContent).toContain('Access denied');
  });

  it('redirects to /dashboard when already authenticated on init', async () => {
    // Configure module without creating component yet
    const authMock = {
      isAuthenticated: signal(true),
      isAdmin: signal(true),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock },
      ],
    });

    // Spy before component init fires
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
  });
});
