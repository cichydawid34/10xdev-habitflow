import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { Book, BookStatus } from '../../shared/models';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen">
      <!-- Ambient glow -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-0 right-1/3 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
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
            <a routerLink="/books" class="nav-item active">
              <span class="text-xl">📚</span>
              <span class="hidden lg:block">Books</span>
            </a>
            <a routerLink="/digest" class="nav-item">
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
            <h2 class="text-4xl font-bold">Reading List</h2>
            <p class="text-white/40 mt-2">Track your reading journey</p>
          </div>
          <button (click)="showAddDialog.set(true)" class="btn-primary">
            <span class="mr-2">+</span> Add Book
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-8 flex-wrap">
          @for (tab of tabs; track tab.value) {
            <button 
              (click)="activeTab.set(tab.value)"
              class="tab-btn"
              [class.tab-active]="activeTab() === tab.value">
              {{ tab.icon }} {{ tab.label }} ({{ getCountByStatus(tab.value) }})
            </button>
          }
        </div>

        <!-- Books Grid -->
        @if (isLoading()) {
          <div class="flex justify-center py-16">
            <div class="spinner"></div>
          </div>
        } @else if (filteredBooks().length === 0) {
          <div class="glass-card text-center py-16">
            <p class="text-6xl mb-6">📖</p>
            <h3 class="text-2xl font-bold text-white mb-3">No books yet</h3>
            <p class="text-white/40 mb-6">Start tracking your reading journey!</p>
            <button (click)="showAddDialog.set(true)" class="btn-primary">
              Add Your First Book
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (book of filteredBooks(); track book.id) {
              <div class="glass-card-hover p-6 group">
                <div class="flex justify-between items-start mb-4">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-white text-lg truncate">{{ book.title }}</h3>
                    <p class="text-sm text-white/40">{{ book.author || 'Unknown author' }}</p>
                  </div>
                  <button 
                    (click)="deleteBook(book)"
                    class="text-white/30 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    🗑️
                  </button>
                </div>

                @if (book.status === 'reading' && book.totalPages) {
                  <div class="mb-4">
                    <div class="flex justify-between text-sm mb-2">
                      <span class="text-white/40">Progress</span>
                      <span class="text-primary-400 font-semibold">{{ book.progress }}%</span>
                    </div>
                    <div class="w-full bg-dark-600 rounded-full h-3 overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                        [style.width.%]="book.progress">
                      </div>
                    </div>
                    <p class="text-xs text-white/30 mt-2">
                      Page {{ book.currentPage }} of {{ book.totalPages }}
                    </p>
                  </div>

                  <div class="flex gap-2">
                    <input 
                      type="number"
                      [value]="book.currentPage"
                      (change)="updateProgress(book, $event)"
                      min="0"
                      [max]="book.totalPages"
                      class="input-glass flex-1 py-2 text-sm text-center">
                    <button (click)="markAsComplete(book)" class="btn-secondary text-sm py-2 px-4">
                      ✓ Done
                    </button>
                  </div>
                } @else {
                  <div class="flex items-center justify-between">
                    <span class="status-badge" [attr.data-status]="book.status">
                      {{ getStatusLabel(book.status) }}
                    </span>
                    @if (book.status !== 'reading') {
                      <button (click)="startReading(book)" class="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                        Start reading →
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>

      <!-- Add Book Dialog -->
      @if (showAddDialog()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="showAddDialog.set(false)">
          <div class="glass-card p-8 w-full max-w-md" (click)="$event.stopPropagation()">
            <h2 class="text-2xl font-bold text-white mb-6">Add New Book</h2>

            <div class="space-y-5">
              <div>
                <label class="block text-white/60 text-sm mb-2">Title</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBook.title"
                  class="input-glass"
                  placeholder="Book title">
              </div>
              <div>
                <label class="block text-white/60 text-sm mb-2">Author</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBook.author"
                  class="input-glass"
                  placeholder="Author name">
              </div>
              <div>
                <label class="block text-white/60 text-sm mb-2">Total Pages</label>
                <input 
                  type="number" 
                  [(ngModel)]="newBook.totalPages"
                  class="input-glass"
                  placeholder="Number of pages">
              </div>
            </div>

            <div class="flex gap-3 mt-8">
              <button (click)="showAddDialog.set(false)" class="flex-1 btn-secondary">
                Cancel
              </button>
              <button 
                (click)="addBook()"
                [disabled]="!newBook.title"
                class="flex-1 btn-primary disabled:opacity-50">
                Add Book
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tab-btn {
      padding: 0.625rem 1.25rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      background: rgba(34, 34, 46, 0.5);
      color: rgba(255, 255, 255, 0.6);
    }
    .tab-btn:hover {
      background: rgba(42, 42, 56, 0.5);
      color: white;
    }
    .tab-active {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #3b82f6 100%);
      color: white;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status-badge[data-status="completed"] {
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
    }
    .status-badge[data-status="paused"] {
      background: rgba(249, 115, 22, 0.2);
      color: #fb923c;
    }
    .status-badge[data-status="want_to_read"] {
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
    }
  `]
})
export class BooksComponent implements OnInit {
  books = signal<Book[]>([]);
  isLoading = signal(true);
  showAddDialog = signal(false);
  activeTab = signal<BookStatus | 'all'>('all');

  tabs = [
    { value: 'all' as const, label: 'All', icon: '📚' },
    { value: 'reading' as const, label: 'Reading', icon: '📖' },
    { value: 'completed' as const, label: 'Completed', icon: '✅' },
    { value: 'want_to_read' as const, label: 'Want to Read', icon: '📋' }
  ];

  newBook = { title: '', author: '', totalPages: null as number | null };

  filteredBooks = () => {
    const tab = this.activeTab();
    if (tab === 'all') return this.books();
    return this.books().filter(b => b.status === tab);
  };

  constructor(private bookService: BookService) { }

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading.set(true);
    this.bookService.getBooks().subscribe({
      next: (books) => {
        this.books.set(books);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  getCountByStatus(status: BookStatus | 'all'): number {
    if (status === 'all') return this.books().length;
    return this.books().filter(b => b.status === status).length;
  }

  getStatusLabel(status: BookStatus): string {
    const labels: Record<BookStatus, string> = {
      reading: 'Reading',
      completed: 'Completed',
      paused: 'Paused',
      want_to_read: 'Want to Read'
    };
    return labels[status];
  }

  async addBook() {
    if (!this.newBook.title) return;

    const observable = await this.bookService.createBook({
      title: this.newBook.title,
      author: this.newBook.author || undefined,
      totalPages: this.newBook.totalPages || undefined,
      status: 'want_to_read'
    });
    observable.subscribe({
      next: () => {
        this.showAddDialog.set(false);
        this.newBook = { title: '', author: '', totalPages: null };
        this.loadBooks();
      }
    });
  }

  startReading(book: Book) {
    this.bookService.updateBook(book.id, { status: 'reading' }).subscribe({
      next: () => this.loadBooks()
    });
  }

  updateProgress(book: Book, event: Event) {
    const input = event.target as HTMLInputElement;
    const page = parseInt(input.value) || 0;
    this.bookService.updateProgress(book.id, page).subscribe({
      next: () => this.loadBooks()
    });
  }

  markAsComplete(book: Book) {
    this.bookService.updateBook(book.id, {
      status: 'completed',
      currentPage: book.totalPages || book.currentPage
    }).subscribe({
      next: () => this.loadBooks()
    });
  }

  deleteBook(book: Book) {
    if (confirm('Delete "' + book.title + '"?')) {
      this.bookService.deleteBook(book.id).subscribe({
        next: () => this.loadBooks()
      });
    }
  }
}
