import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AiService } from '../../core/services/ai.service';
import { WeeklyDigest } from '../../shared/models';

@Component({
  selector: 'app-digest',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen">
      <!-- Ambient glow -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-1/3 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-1/3 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
      </div>

      <!-- Sidebar -->
      <nav class="fixed left-0 top-0 bottom-0 w-20 lg:w-64 glass-card rounded-none border-r border-white/5 z-20">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-10">
            <span class="text-3xl">🎯</span>
            <h1 class="hidden lg:block text-xl font-bold bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
              HabitFlow
            </h1>
          </div>
          <div class="space-y-2">
            <a routerLink="/dashboard" class="nav-item">
              <span class="text-xl">📊</span>
              <span class="hidden lg:block">Dashboard</span>
            </a>
            <a routerLink="/calendar" class="nav-item">
              <span class="text-xl">📅</span>
              <span class="hidden lg:block">Calendar</span>
            </a>
            <a routerLink="/books" class="nav-item">
              <span class="text-xl">📚</span>
              <span class="hidden lg:block">Books</span>
            </a>
            <a routerLink="/digest" class="nav-item active">
              <span class="text-xl">✨</span>
              <span class="hidden lg:block">AI Digest</span>
            </a>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="ml-20 lg:ml-64 p-8 relative z-10">
        <!-- Header -->
        <div class="flex justify-between items-start mb-8">
          <div>
            <h2 class="text-4xl font-bold">AI Weekly Digest</h2>
            <p class="text-white/40 mt-2">Get AI-powered insights about your habits</p>
          </div>
          <button 
            (click)="generateDigest()"
            [disabled]="isGenerating()"
            class="btn-primary disabled:opacity-50">
            @if (isGenerating()) {
              <span class="inline-flex items-center gap-2">
                <div class="spinner w-4 h-4 border-2"></div>
                Generating...
              </span>
            } @else {
              🪄 Generate This Week's Digest
            }
          </button>
        </div>

        @if (error()) {
          <div class="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-center">
            {{ error() }}
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-center py-16">
            <div class="spinner"></div>
          </div>
        } @else if (digests().length === 0) {
          <div class="glass-card text-center py-16 max-w-2xl mx-auto">
            <div class="text-7xl mb-6 animate-float">🤖</div>
            <h3 class="text-2xl font-bold text-white mb-4">No digests yet</h3>
            <p class="text-white/40 mb-8 max-w-md mx-auto">
              Generate your first AI-powered weekly summary to get personalized insights about your habits and reading progress!
            </p>
            <button 
              (click)="generateDigest()"
              [disabled]="isGenerating()"
              class="btn-primary text-lg px-8 py-4">
              🪄 Generate Your First Digest
            </button>
          </div>
        } @else {
          <div class="space-y-6 max-w-3xl">
            @for (digest of digests(); track digest.id) {
              <div class="glass-card-hover p-8">
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xl shadow-glow">
                      📊
                    </div>
                    <div>
                      <h3 class="font-semibold text-white text-lg">
                        Week of {{ formatDate(digest.weekStart) }}
                      </h3>
                      <p class="text-white/40 text-sm">
                        Generated {{ formatDate(digest.createdAt) }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="prose prose-invert max-w-none" [innerHTML]="formatContent(digest.content)">
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .prose h2 { 
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      background: linear-gradient(135deg, #ffffff 0%, #a78bfa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .prose h3 { 
      font-size: 1.125rem;
      font-weight: 600;
      color: #c4b5fd;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
    }
    .prose p { 
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.75rem;
      line-height: 1.625;
    }
    .prose ul { 
      list-style: none;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1rem;
    }
    .prose li { 
      position: relative;
      padding-left: 1.5rem;
      margin-bottom: 0.5rem;
    }
    .prose li::before {
      content: '✦';
      position: absolute;
      left: 0;
      color: #a78bfa;
    }
    .prose strong { 
      color: #c4b5fd;
      font-weight: 600;
    }
  `]
})
export class DigestComponent implements OnInit {
  digests = signal<WeeklyDigest[]>([]);
  isLoading = signal(true);
  isGenerating = signal(false);
  error = signal<string | null>(null);

  constructor(private aiService: AiService) { }

  ngOnInit() {
    this.loadDigests();
  }

  loadDigests() {
    this.aiService.getWeeklyDigests().subscribe({
      next: (digests) => {
        this.digests.set(digests);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  generateDigest() {
    this.isGenerating.set(true);
    this.error.set(null);

    this.aiService.generateWeeklyDigest().subscribe({
      next: () => {
        this.isGenerating.set(false);
        this.loadDigests();
      },
      error: (err) => {
        this.error.set('Failed to generate digest. Please check your API key.');
        this.isGenerating.set(false);
        console.error(err);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatContent(content: string): string {
    return content
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^\- (.*$)/gm, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.*)$/gm, (match) => {
        if (match.startsWith('<')) return match;
        return `<p>${match}</p>`;
      });
  }
}
