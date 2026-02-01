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
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <a routerLink="/dashboard" class="text-slate-400 hover:text-slate-600">←</a>
            <span class="text-2xl">📚</span>
            <h1 class="text-xl font-bold text-slate-800">Reading List</h1>
          </div>
          <button 
            (click)="showAddDialog.set(true)"
            class="btn-primary">
            + Add Book
          </button>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 py-8">
        <!-- Tabs -->
        <div class="flex gap-2 mb-6">
          @for (tab of tabs; track tab.value) {
            <button 
              (click)="activeTab.set(tab.value)"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors"
              [class.bg-primary-100]="activeTab() === tab.value"
              [class.text-primary-700]="activeTab() === tab.value"
              [class.text-slate-600]="activeTab() !== tab.value"
              [class.hover:bg-slate-100]="activeTab() !== tab.value">
              {{ tab.icon }} {{ tab.label }} ({{ getCountByStatus(tab.value) }})
            </button>
          }
        </div>

        <!-- Books Grid -->
        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else if (filteredBooks().length === 0) {
          <div class="card text-center py-12">
            <p class="text-4xl mb-4">📖</p>
            <h3 class="text-xl font-semibold text-slate-800 mb-2">No books yet</h3>
            <p class="text-slate-500 mb-4">Start tracking your reading journey!</p>
            <button (click)="showAddDialog.set(true)" class="btn-primary">
              Add Your First Book
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (book of filteredBooks(); track book.id) {
              <div class="card hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1">
                    <h3 class="font-semibold text-slate-800 line-clamp-1">{{ book.title }}</h3>
                    <p class="text-sm text-slate-500">{{ book.author || 'Unknown author' }}</p>
                  </div>
                  <button 
                    (click)="deleteBook(book)"
                    class="text-slate-400 hover:text-red-500 p-1">
                    🗑️
                  </button>
                </div>

                @if (book.status === 'reading' && book.totalPages) {
                  <div class="mb-3">
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-slate-500">Progress</span>
                      <span class="text-primary-600 font-medium">{{ book.progress }}%</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        [style.width.%]="book.progress">
                      </div>
                    </div>
                    <p class="text-xs text-slate-400 mt-1">
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
                      class="input flex-1 py-1 text-sm">
                    <button 
                      (click)="markAsComplete(book)"
                      class="btn-secondary text-sm py-1">
                      ✓ Done
                    </button>
                  </div>
                } @else {
                  <div class="flex items-center justify-between text-sm">
                    <span 
                      class="px-2 py-1 rounded-full"
                      [class.bg-green-100]="book.status === 'completed'"
                      [class.text-green-700]="book.status === 'completed'"
                      [class.bg-yellow-100]="book.status === 'paused'"
                      [class.text-yellow-700]="book.status === 'paused'"
                      [class.bg-blue-100]="book.status === 'want_to_read'"
                      [class.text-blue-700]="book.status === 'want_to_read'">
                      {{ getStatusLabel(book.status) }}
                    </span>
                    @if (book.status !== 'reading') {
                      <button 
                        (click)="startReading(book)"
                        class="text-primary-600 hover:underline">
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
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="showAddDialog.set(false)">
          <div class="bg-white rounded-2xl w-full max-w-md p-6 m-4" (click)="$event.stopPropagation()">
            <h2 class="text-xl font-bold text-slate-800 mb-6">Add New Book</h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBook.title"
                  class="input"
                  placeholder="Book title">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Author</label>
                <input 
                  type="text" 
                  [(ngModel)]="newBook.author"
                  class="input"
                  placeholder="Author name">
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Total Pages</label>
                <input 
                  type="number" 
                  [(ngModel)]="newBook.totalPages"
                  class="input"
                  placeholder="Number of pages">
              </div>
            </div>

            <div class="flex gap-3 mt-6">
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
  `
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

