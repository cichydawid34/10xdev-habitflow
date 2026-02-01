import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Ambient glow effects -->
      <div class="absolute top-0 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>

      <!-- Register Card -->
      <div class="glass-card p-10 w-full max-w-md relative z-10">
        <div class="text-center mb-8">
          <div class="text-5xl mb-4">🚀</div>
          <h1 class="text-3xl font-bold">Create Account</h1>
          <p class="text-white/40 mt-3">Start your habit journey today</p>
        </div>

        @if (authService.error()) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
            {{ authService.error() }}
          </div>
        }

        @if (success()) {
          <div class="bg-success-500/10 border border-success-500/30 text-success-400 p-4 rounded-xl mb-6 text-sm text-center">
            {{ success() }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-white/60 text-sm mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              class="input-glass"
              placeholder="you@example.com">
          </div>

          <div>
            <label class="block text-white/60 text-sm mb-2">Password</label>
            <input 
              [type]="showPassword() ? 'text' : 'password'" 
              formControlName="password" 
              class="input-glass"
              placeholder="Minimum 6 characters">
          </div>

          <div>
            <label class="block text-white/60 text-sm mb-2">Confirm Password</label>
            <input 
              [type]="showPassword() ? 'text' : 'password'" 
              formControlName="confirmPassword" 
              class="input-glass"
              placeholder="Repeat your password">
            @if (registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched) {
              <p class="text-red-400 text-sm mt-2">Passwords don't match</p>
            }
          </div>

          <div class="flex items-start gap-3">
            <input 
              type="checkbox" 
              formControlName="terms"
              class="w-5 h-5 rounded bg-dark-600 border-white/20 text-primary-500 focus:ring-primary-500 mt-0.5">
            <label class="text-white/60 text-sm">
              I agree to the <a href="#" class="text-primary-400 hover:underline">Terms of Service</a> 
              and <a href="#" class="text-primary-400 hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button 
            type="submit" 
            [disabled]="registerForm.invalid || authService.isLoading()"
            class="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
            @if (authService.isLoading()) {
              <span class="inline-flex items-center gap-2">
                <div class="spinner w-5 h-5 border-2"></div>
                Creating account...
              </span>
            } @else {
              Create Account
            }
          </button>
        </form>

        <p class="text-center text-white/40 mt-8">
          Already have an account? 
          <a routerLink="/login" class="text-primary-400 font-medium hover:text-primary-300 transition-colors">
            Sign in
          </a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  showPassword = signal(false);
  success = signal('');

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password?.value !== confirmPassword?.value) {
      return { mismatch: true };
    }
    return null;
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { email, password } = this.registerForm.value;
      try {
        await this.authService.signUp(email, password);
        this.success.set('Account created! Check your email to verify.');
        this.registerForm.reset();
      } catch (error) {
        // Error handled by authService
      }
    }
  }
}
