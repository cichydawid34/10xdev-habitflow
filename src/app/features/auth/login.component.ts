import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="text-center mb-8">
          <div class="text-4xl mb-2">🎯</div>
          <h1 class="text-2xl font-bold text-slate-800">Welcome to HabitFlow</h1>
          <p class="text-slate-500 mt-2">Track your habits, build your streaks</p>
        </div>

        @if (authService.error()) {
          <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm text-center">
            {{ authService.error() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              class="input"
              placeholder="you@example.com"
              data-testid="email">
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <p class="text-red-500 text-sm mt-1">Please enter a valid email</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div class="relative">
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="password" 
                class="input pr-10"
                placeholder="••••••••"
                data-testid="password">
              <button 
                type="button" 
                (click)="showPassword.set(!showPassword())"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="login-btn">
            @if (authService.isLoading()) {
              <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Signing in...
              </span>
            } @else {
              Sign In
            }
          </button>
        </form>

        <p class="text-center text-slate-500 mt-6">
          Don't have an account? 
          <a routerLink="/register" class="text-primary-600 font-medium hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      await this.authService.signIn(email, password);
    }
  }
}
