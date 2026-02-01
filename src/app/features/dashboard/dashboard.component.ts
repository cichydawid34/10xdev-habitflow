import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HabitService } from '../../core/services/habit.service';
import { BookService } from '../../core/services/book.service';
import { Habit, Book } from '../../shared/models';
import { HabitCardComponent } from './components/habit-card.component';
import { AddHabitDialogComponent } from './components/add-habit-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HabitCardComponent, AddHabitDialogComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <span class="text-2xl">🎯</span>
            <h1 class="text-xl font-bold text-slate-800">HabitFlow</h1>
          </div>
          <nav class="flex items-center gap-4">
            <a routerLink="/books" class="text-slate-600 hover:text-primary-600 font-medium">📚 Books</a>
            <a routerLink="/calendar" class="text-slate-600 hover:text-primary-600 font-medium">📅 Calendar</a>
            <a routerLink="/digest" class="text-slate-600 hover:text-primary-600 font-medium">✨ AI Digest</a>
            <button 
              (click)="signOut()" 
              class="text-slate-500 hover:text-slate-700">
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 py-8">
        <!-- Today's Date -->
        <div class="mb-8">
          <p class="text-slate-500 text-sm">{{ todayFormatted }}</p>
          <h2 class="text-3xl font-bold text-slate-800">Today's Habits</h2>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div class="card">
            <p class="text-slate-500 text-sm">Completed Today</p>
            <p class="text-3xl font-bold text-primary-600">{{ completedToday() }}/{{ habits().length }}</p>
          </div>
          <div class="card">
            <p class="text-slate-500 text-sm">Longest Streak</p>
            <p class="text-3xl font-bold text-accent-500">🔥 {{ longestStreak() }} days</p>
          </div>
          <div class="card">
            <p class="text-slate-500 text-sm">Currently Reading</p>
            <p class="text-3xl font-bold text-blue-600">📖 {{ readingBooks().length }}</p>
          </div>
        </div>

        <!-- Habits Grid -->
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-slate-800">Your Habits</h3>
          <button 
            (click)="showAddDialog.set(true)"
            class="btn-primary"
            data-testid="add-habit-btn">
            + Add Habit
          </button>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <svg class="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
        } @else if (habits().length === 0) {
          <div class="card text-center py-12">
            <p class="text-4xl mb-4">🌱</p>
            <h3 class="text-xl font-semibold text-slate-800 mb-2">No habits yet</h3>
            <p class="text-slate-500 mb-4">Start building your first habit today!</p>
            <button (click)="showAddDialog.set(true)" class="btn-primary">
              Add Your First Habit
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (habit of habits(); track habit.id) {
              <app-habit-card 
                [habit]="habit"
                (toggle)="toggleHabit($event)"
                (delete)="deleteHabit($event)">
              </app-habit-card>
            }
          </div>
        }

        <!-- Reading Progress Preview -->
        @if (readingBooks().length > 0) {
          <div class="mt-12">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-slate-800">Currently Reading</h3>
              <a routerLink="/books" class="text-primary-600 font-medium hover:underline">View all →</a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (book of readingBooks().slice(0, 2); track book.id) {
                <div class="card">
                  <div class="flex justify-between items-start mb-2">
                    <div>
                      <h4 class="font-semibold text-slate-800">{{ book.title }}</h4>
                      <p class="text-sm text-slate-500">{{ book.author || 'Unknown author' }}</p>
                    </div>
                    <span class="text-sm font-medium text-primary-600">{{ book.progress }}%</span>
                  </div>
                  <div class="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      class="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      [style.width.%]="book.progress">
                    </div>
                  </div>
                  <p class="text-xs text-slate-400 mt-2">
                    Page {{ book.currentPage }} of {{ book.totalPages || '?' }}
                  </p>
                </div>
              }
            </div>
          </div>
        }
      </main>

      <!-- Add Habit Dialog -->
      @if (showAddDialog()) {
        <app-add-habit-dialog
          (close)="showAddDialog.set(false)"
          (save)="createHabit($event)">
        </app-add-habit-dialog>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  habits = signal<Habit[]>([]);
  books = signal<Book[]>([]);
  isLoading = signal(true);
  showAddDialog = signal(false);

  todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  completedToday = () => this.habits().filter(h => h.completedToday).length;
  longestStreak = () => Math.max(0, ...this.habits().map(h => h.currentStreak || 0));
  readingBooks = () => this.books().filter(b => b.status === 'reading');

  constructor(
    public authService: AuthService,
    private habitService: HabitService,
    private bookService: BookService
  ) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.habitService.getHabitsWithStreaks().subscribe({
      next: (habits) => {
        this.habits.set(habits);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });

    this.bookService.getBooks().subscribe({
      next: (books) => this.books.set(books),
      error: (err) => console.error(err)
    });
  }

  toggleHabit(habit: Habit) {
    const today = new Date();
    if (habit.completedToday) {
      this.habitService.unlogHabit(habit.id, today).subscribe(() => this.loadData());
    } else {
      this.habitService.logHabit(habit.id, today).subscribe(() => this.loadData());
    }
  }

  async createHabit(data: { name: string; icon: string; color: string }) {
    const observable = await this.habitService.createHabit(data);
    observable.subscribe(() => {
      this.showAddDialog.set(false);
      this.loadData();
    });
  }

  deleteHabit(habit: Habit) {
    if (confirm('Delete "' + habit.name + '"?')) {
      this.habitService.deleteHabit(habit.id).subscribe(() => this.loadData());
    }
  }

  signOut() {
    this.authService.signOut();
  }
}

