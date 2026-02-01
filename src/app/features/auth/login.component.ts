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
    <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Ambient glow effects -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/30 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/10 rounded-full blur-3xl"></div>

      <!-- Login Card -->
      <div class="glass-card p-10 w-full max-w-md relative z-10">
        <div class="text-center mb-10">
          <div class="text-6xl mb-4 animate-float">🎯</div>
          <h1 class="text-3xl font-bold">Welcome to HabitFlow</h1>
          <p class="text-white/40 mt-3">Track your habits, build your streaks</p>
        </div>

        @if (authService.error()) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm text-center backdrop-blur-sm">
            {{ authService.error() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="block text-white/60 text-sm mb-2">Email</label>
            <input 
              type="email" 
              formControlName="email" 
              class="input-glass"
              placeholder="you@example.com"
              data-testid="email">
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <p class="text-red-400 text-sm mt-2">Please enter a valid email</p>
            }
          </div>

          <div>
            <label class="block text-white/60 text-sm mb-2">Password</label>
            <div class="relative">
              <input 
                [type]="showPassword() ? 'text' : 'password'" 
                formControlName="password" 
                class="input-glass pr-12"
                placeholder="••••••••"
                data-testid="password">
              <button 
                type="button" 
                (click)="showPassword.set(!showPassword())"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                {{ showPassword() ? '🙈' : '👁️' }}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || authService.isLoading()"
            class="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="login-btn">
            @if (authService.isLoading()) {
              <span class="inline-flex items-center gap-2">
                <div class="spinner w-5 h-5 border-2"></div>
                Signing in...
              </span>
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="mt-8 text-center">
          <p class="text-white/40">
            Don't have an account? 
            <a routerLink="/register" class="text-primary-400 font-medium hover:text-primary-300 transition-colors">
              Sign up
            </a>
          </p>
        </div>

        <!-- Decorative elements -->
        <div class="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-2xl"></div>
        <div class="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-accent-500/20 to-primary-500/20 rounded-full blur-2xl"></div>
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
