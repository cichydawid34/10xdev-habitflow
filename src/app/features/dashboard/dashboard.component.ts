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
    <div class="min-h-screen">
      <!-- Ambient glow effect -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
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
            <a routerLink="/dashboard" class="nav-item active">
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
            <a routerLink="/digest" class="nav-item">
              <span class="text-xl">✨</span>
              <span class="hidden lg:block">AI Digest</span>
            </a>
          </div>
        </div>

        <div class="absolute bottom-6 left-0 right-0 px-6">
          <button 
            (click)="signOut()" 
            class="nav-item w-full text-white/40 hover:text-white">
            <span class="text-xl">🚪</span>
            <span class="hidden lg:block">Logout</span>
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="ml-20 lg:ml-64 p-8 relative z-10">
        <!-- Header -->
        <div class="mb-10">
          <p class="text-white/40 text-sm mb-1">{{ todayFormatted }}</p>
          <h2 class="text-4xl font-bold">Today's Habits</h2>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <!-- Completed Today -->
          <div class="glass-card-hover p-6 group">
            <div class="flex items-center justify-between mb-4">
              <span class="text-white/40 text-sm">Completed Today</span>
              <div class="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center group-hover:bg-primary-500/30 transition-colors">
                <span class="text-xl">✅</span>
              </div>
            </div>
            <p class="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              {{ completedToday() }}/{{ habits().length }}
            </p>
            <div class="mt-3 h-2 bg-dark-600 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                [style.width.%]="habits().length ? (completedToday() / habits().length * 100) : 0">
              </div>
            </div>
          </div>

          <!-- Longest Streak -->
          <div class="glass-card-hover p-6 group">
            <div class="flex items-center justify-between mb-4">
              <span class="text-white/40 text-sm">Longest Streak</span>
              <div class="w-10 h-10 rounded-xl bg-streak-500/20 flex items-center justify-center group-hover:shadow-streak transition-all">
                <span class="text-xl streak-fire">🔥</span>
              </div>
            </div>
            <p class="text-4xl font-bold text-streak-400">
              {{ longestStreak() }} <span class="text-lg text-white/40">days</span>
            </p>
          </div>

          <!-- Currently Reading -->
          <div class="glass-card-hover p-6 group">
            <div class="flex items-center justify-between mb-4">
              <span class="text-white/40 text-sm">Currently Reading</span>
              <div class="w-10 h-10 rounded-xl bg-accent-500/20 flex items-center justify-center group-hover:bg-accent-500/30 transition-colors">
                <span class="text-xl">📖</span>
              </div>
            </div>
            <p class="text-4xl font-bold text-accent-400">
              {{ readingBooks().length }} <span class="text-lg text-white/40">books</span>
            </p>
          </div>
        </div>

        <!-- Habits Section -->
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold text-white/90">Your Habits</h3>
          <button 
            (click)="showAddDialog.set(true)"
            class="btn-primary"
            data-testid="add-habit-btn">
            <span class="mr-2">+</span> Add Habit
          </button>
        </div>

        @if (isLoading()) {
          <div class="flex justify-center py-16">
            <div class="spinner"></div>
          </div>
        } @else if (habits().length === 0) {
          <div class="glass-card text-center py-16">
            <p class="text-6xl mb-6">🌱</p>
            <h3 class="text-2xl font-bold text-white mb-3">No habits yet</h3>
            <p class="text-white/40 mb-6">Start building your first habit today!</p>
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
            <div class="flex justify-between items-center mb-6">
              <h3 class="text-2xl font-bold text-white/90">Currently Reading</h3>
              <a routerLink="/books" class="text-primary-400 font-medium hover:text-primary-300 transition-colors">
                View all →
              </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (book of readingBooks().slice(0, 2); track book.id) {
                <div class="glass-card-hover p-6">
                  <div class="flex justify-between items-start mb-4">
                    <div>
                      <h4 class="font-semibold text-white text-lg">{{ book.title }}</h4>
                      <p class="text-sm text-white/40">{{ book.author || 'Unknown author' }}</p>
                    </div>
                    <span class="text-lg font-bold text-primary-400">{{ book.progress }}%</span>
                  </div>
                  <div class="w-full bg-dark-600 rounded-full h-3 overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500"
                      [style.width.%]="book.progress">
                    </div>
                  </div>
                  <p class="text-sm text-white/30 mt-3">
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
