import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { Habit, HabitLog, DayActivity } from '../../shared/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen">
      <!-- Ambient glow -->
      <div class="fixed inset-0 pointer-events-none">
        <div class="absolute top-1/4 left-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
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
            <a routerLink="/dashboard" class="nav-item">
              <span class="text-xl">📊</span>
              <span class="hidden lg:block">Dashboard</span>
            </a>
            <a routerLink="/calendar" class="nav-item active">
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
      </nav>

      <!-- Main Content -->
      <main class="ml-20 lg:ml-64 p-8 relative z-10">
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-4xl font-bold">Activity Calendar</h2>
          <p class="text-white/40 mt-2">Track your habit consistency over time</p>
        </div>

        <!-- Legend -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-semibold text-white/90">{{ currentYear }}</h3>
          <div class="flex items-center gap-2 text-sm text-white/40">
            <span>Less</span>
            <div class="flex gap-1">
              <div class="w-4 h-4 rounded-sm bg-dark-600 border border-white/10"></div>
              <div class="w-4 h-4 rounded-sm bg-primary-900/50"></div>
              <div class="w-4 h-4 rounded-sm bg-primary-700/70"></div>
              <div class="w-4 h-4 rounded-sm bg-primary-500"></div>
              <div class="w-4 h-4 rounded-sm bg-primary-400 shadow-glow"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <!-- Months -->
        <div class="flex gap-1 mb-3 text-xs text-white/40 ml-10">
          @for (month of months; track month) {
            <div class="flex-1 text-center">{{ month }}</div>
          }
        </div>

        <!-- Heatmap Grid -->
        <div class="glass-card p-6 overflow-x-auto">
          @if (isLoading()) {
            <div class="flex justify-center py-16">
              <div class="spinner"></div>
            </div>
          } @else {
            <div class="flex gap-[3px]">
              <!-- Day labels -->
              <div class="flex flex-col gap-[3px] text-xs text-white/40 pr-3">
                <div class="h-4"></div>
                <div class="h-4 flex items-center">Mon</div>
                <div class="h-4"></div>
                <div class="h-4 flex items-center">Wed</div>
                <div class="h-4"></div>
                <div class="h-4 flex items-center">Fri</div>
                <div class="h-4"></div>
              </div>
              
              <!-- Weeks -->
              @for (week of weeks(); track $index) {
                <div class="flex flex-col gap-[3px]">
                  @for (day of week; track day?.date?.getTime() ?? $index) {
                    @if (day) {
                      <div 
                        class="heatmap-cell cursor-pointer"
                        [ngStyle]="getColorStyle(day.percentage)"
                        [title]="getTooltip(day)">
                      </div>
                    } @else {
                      <div style="width: 16px; height: 16px;"></div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div class="glass-card-hover p-6 text-center">
            <p class="text-4xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              {{ totalCompletions() }}
            </p>
            <p class="text-sm text-white/40 mt-2">Total Completions</p>
          </div>
          <div class="glass-card-hover p-6 text-center">
            <p class="text-4xl font-bold text-accent-400">{{ activeDays() }}</p>
            <p class="text-sm text-white/40 mt-2">Active Days</p>
          </div>
          <div class="glass-card-hover p-6 text-center">
            <p class="text-4xl font-bold text-success-400">{{ currentStreak() }}</p>
            <p class="text-sm text-white/40 mt-2">Current Streak</p>
          </div>
          <div class="glass-card-hover p-6 text-center">
            <p class="text-4xl font-bold text-streak-400 streak-fire">🔥 {{ longestStreak() }}</p>
            <p class="text-sm text-white/40 mt-2">Longest Streak</p>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CalendarComponent implements OnInit {
  isLoading = signal(true);
  habits = signal<Habit[]>([]);
  logs = signal<HabitLog[]>([]);

  currentYear = new Date().getFullYear();
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  weeks = computed(() => this.generateWeeks());
  totalCompletions = computed(() => this.logs().length);
  activeDays = computed(() => {
    const uniqueDays = new Set(
      this.logs().map(l => new Date(l.completedAt).toDateString())
    );
    return uniqueDays.size;
  });
  currentStreak = signal(0);
  longestStreak = signal(0);

  constructor(private habitService: HabitService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const yearStart = new Date(this.currentYear, 0, 1);
    const yearEnd = new Date(this.currentYear, 11, 31);

    forkJoin({
      habits: this.habitService.getHabits(),
      logs: this.habitService.getLogsForPeriod(yearStart, yearEnd)
    }).subscribe({
      next: ({ habits, logs }) => {
        this.habits.set(habits);
        this.logs.set(logs);
        this.calculateStreaks(logs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  private calculateStreaks(logs: HabitLog[]) {
    const sortedDates = [...new Set(
      logs.map(l => new Date(l.completedAt).toDateString())
    )].map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    if (sortedDates.length === 0) {
      this.currentStreak.set(0);
      this.longestStreak.set(0);
      return;
    }

    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = today;

    for (const date of sortedDates) {
      date.setHours(0, 0, 0, 0);
      if (date.getTime() === checkDate.getTime()) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (date.getTime() < checkDate.getTime()) {
        break;
      }
    }
    this.currentStreak.set(current);

    let longest = 1;
    let tempStreak = 1;
    const chronological = sortedDates.sort((a, b) => a.getTime() - b.getTime());

    for (let i = 1; i < chronological.length; i++) {
      const diff = (chronological[i].getTime() - chronological[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    this.longestStreak.set(longest);
  }

  private generateWeeks(): (DayActivity | null)[][] {
    const weeks: (DayActivity | null)[][] = [];
    const yearStart = new Date(this.currentYear, 0, 1);
    const yearEnd = new Date(this.currentYear, 11, 31);

    const displayStart = new Date(yearStart);
    displayStart.setDate(displayStart.getDate() - displayStart.getDay());

    const logsByDate = new Map<string, number>();
    const habitCount = this.habits().length || 1;

    for (const log of this.logs()) {
      const dateStr = new Date(log.completedAt).toDateString();
      logsByDate.set(dateStr, (logsByDate.get(dateStr) || 0) + 1);
    }

    let currentDate = new Date(displayStart);
    while (currentDate <= yearEnd || currentDate.getDay() !== 0) {
      const week: (DayActivity | null)[] = [];
      for (let i = 0; i < 7; i++) {
        if (currentDate >= yearStart && currentDate <= yearEnd) {
          const dateStr = currentDate.toDateString();
          const completed = logsByDate.get(dateStr) || 0;
          week.push({
            date: new Date(currentDate),
            completedCount: completed,
            totalCount: habitCount,
            percentage: Math.min(100, (completed / habitCount) * 100)
          });
        } else {
          week.push(null);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }

    return weeks;
  }

  getColorStyle(percentage: number): { [key: string]: string } {
    const baseStyle = {
      width: '16px',
      height: '16px',
      borderRadius: '3px',
      border: '1px solid'
    };

    if (percentage === 0) {
      return { ...baseStyle, backgroundColor: '#22222e', borderColor: 'rgba(255,255,255,0.05)' };
    }
    if (percentage < 25) {
      return { ...baseStyle, backgroundColor: 'rgba(76, 29, 149, 0.5)', borderColor: 'rgba(109, 40, 217, 0.3)' };
    }
    if (percentage < 50) {
      return { ...baseStyle, backgroundColor: 'rgba(109, 40, 217, 0.7)', borderColor: 'rgba(124, 58, 237, 0.3)' };
    }
    if (percentage < 75) {
      return { ...baseStyle, backgroundColor: '#8b5cf6', borderColor: 'rgba(167, 139, 250, 0.3)' };
    }
    return {
      ...baseStyle,
      backgroundColor: '#a78bfa',
      borderColor: 'rgba(196, 181, 253, 0.3)',
      boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)'
    };
  }

  getTooltip(day: DayActivity): string {
    const dateStr = day.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return `${dateStr}: ${day.completedCount} habits completed`;
  }
}
