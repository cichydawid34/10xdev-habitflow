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
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <a routerLink="/dashboard" class="text-slate-400 hover:text-slate-600">←</a>
            <span class="text-2xl">✨</span>
            <h1 class="text-xl font-bold text-slate-800">AI Weekly Digest</h1>
          </div>
          <button 
            (click)="generateDigest()"
            [disabled]="isGenerating()"
            class="btn-primary disabled:opacity-50">
            @if (isGenerating()) {
              <span class="inline-flex items-center gap-2">
                <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Generating...
              </span>
            } @else {
              🪄 Generate This Week's Digest
            }
          </button>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 py-8">
        @if (error()) {
          <div class="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-center">
            {{ error() }}
          </div>
        }

        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else if (digests().length === 0) {
          <div class="card text-center py-12">
            <p class="text-5xl mb-4">🤖</p>
            <h3 class="text-xl font-semibold text-slate-800 mb-2">No digests yet</h3>
            <p class="text-slate-500 mb-6">
              Generate your first AI-powered weekly summary to get personalized insights about your habits and reading progress!
            </p>
            <button 
              (click)="generateDigest()"
              [disabled]="isGenerating()"
              class="btn-primary text-lg px-6 py-3">
              🪄 Generate Your First Digest
            </button>
          </div>
        } @else {
          <div class="space-y-6">
            @for (digest of digests(); track digest.id) {
              <div class="card">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <span class="text-xl">📊</span>
                    <h3 class="font-semibold text-slate-800">
                      Week of {{ formatDate(digest.weekStart) }}
                    </h3>
                  </div>
                  <span class="text-sm text-slate-400">
                    {{ formatDate(digest.createdAt) }}
                  </span>
                </div>
                <div class="prose prose-slate max-w-none" [innerHTML]="formatContent(digest.content)">
                </div>
              </div>
            }
          </div>
        }
      </main>
    </div>
  `,
    styles: [`
    .prose h2 { @apply text-lg font-semibold text-slate-800 mt-4 mb-2; }
    .prose h3 { @apply text-base font-medium text-slate-700 mt-3 mb-1; }
    .prose p { @apply text-slate-600 mb-2; }
    .prose ul { @apply list-disc list-inside text-slate-600 mb-2; }
    .prose li { @apply mb-1; }
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
        // Convert markdown-like syntax to HTML
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
