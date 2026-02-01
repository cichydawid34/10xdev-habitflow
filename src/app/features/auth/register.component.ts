import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🚀</div>
          <h1 class="text-2xl font-bold text-slate-800">Create Account</h1>
          <p class="text-slate-500 mt-2">Start building better habits today</p>
        </div>

        @if (success()) {
          <div class="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-center">
            <p class="font-medium">Account created! 🎉</p>
            <p class="text-sm mt-1">Redirecting to login...</p>
          </div>
        }

        @if (authService.error()) {
          <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center">
            {{ authService.error() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              class="input"
              placeholder="you@example.com"
              data-testid="email">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input 
              [type]="showPassword() ? 'text' : 'password'" 
              formControlName="password" 
              class="input"
              placeholder="At least 8 characters"
              data-testid="password">
            @if (registerForm.get('password')?.hasError('minlength') && registerForm.get('password')?.touched) {
              <p class="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
            <input 
              [type]="showPassword() ? 'text' : 'password'" 
              formControlName="confirmPassword" 
              class="input"
              placeholder="Confirm your password"
              data-testid="confirm-password">
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <p class="text-red-500 text-sm mt-1">Passwords don't match</p>
            }
          </div>

          <div class="flex items-center gap-2">
            <input 
              type="checkbox" 
              formControlName="acceptTerms" 
              id="terms"
              class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500">
            <label for="terms" class="text-sm text-slate-600">
              I agree to the Terms of Service
            </label>
          </div>

          <button 
            type="submit" 
            [disabled]="registerForm.invalid || authService.isLoading() || success()"
            class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="register-btn">
            @if (authService.isLoading()) {
              <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Creating account...
              </span>
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="text-center text-slate-500 mt-6">
          Already have an account? 
          <a routerLink="/login" class="text-primary-600 font-medium hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = signal(false);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirm = control.get('confirmPassword');
    if (password && confirm && password.value !== confirm.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      const result = await this.authService.signUp(email, password);
      if (result) {
        this.success.set(true);
        setTimeout(() => this.router.navigate(['/login']), 2000);
      }
    }
  }
}
