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
    <div class="min-h-screen bg-slate-50">
      <!-- Header -->
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <a routerLink="/dashboard" class="text-slate-400 hover:text-slate-600">←</a>
            <span class="text-2xl">📅</span>
            <h1 class="text-xl font-bold text-slate-800">Activity Calendar</h1>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-4 py-8">
        <!-- Legend -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-slate-800">{{ currentYear }}</h2>
          <div class="flex items-center gap-2 text-sm text-slate-500">
            <span>Less</span>
            <div class="flex gap-1">
              <div class="w-3 h-3 rounded-sm bg-slate-200"></div>
              <div class="w-3 h-3 rounded-sm bg-primary-200"></div>
              <div class="w-3 h-3 rounded-sm bg-primary-400"></div>
              <div class="w-3 h-3 rounded-sm bg-primary-600"></div>
              <div class="w-3 h-3 rounded-sm bg-primary-800"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        <!-- Months -->
        <div class="flex gap-1 mb-2 text-xs text-slate-400">
          @for (month of months; track month) {
            <div class="flex-1 text-center">{{ month }}</div>
          }
        </div>

        <!-- Heatmap Grid -->
        <div class="card overflow-x-auto">
          @if (isLoading()) {
            <div class="flex justify-center py-12">
              <svg class="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          } @else {
            <div class="flex gap-1">
              <!-- Day labels -->
              <div class="flex flex-col gap-1 text-xs text-slate-400 pr-2">
                <div class="h-3"></div>
                <div class="h-3">Mon</div>
                <div class="h-3"></div>
                <div class="h-3">Wed</div>
                <div class="h-3"></div>
                <div class="h-3">Fri</div>
                <div class="h-3"></div>
              </div>
              
              <!-- Weeks -->
              @for (week of weeks(); track $index) {
                <div class="flex flex-col gap-1">
                  @for (day of week; track day?.date?.getTime() ?? $index) {
                    @if (day) {
                      <div 
                        class="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125"
                        [class]="getColorClass(day.percentage)"
                        [title]="getTooltip(day)">
                      </div>
                    } @else {
                      <div class="w-3 h-3"></div>
                    }
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div class="card text-center">
            <p class="text-3xl font-bold text-primary-600">{{ totalCompletions() }}</p>
            <p class="text-sm text-slate-500">Total Completions</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-accent-500">{{ activeDays() }}</p>
            <p class="text-sm text-slate-500">Active Days</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-blue-600">{{ currentStreak() }}</p>
            <p class="text-sm text-slate-500">Current Streak</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-purple-600">{{ longestStreak() }}</p>
            <p class="text-sm text-slate-500">Longest Streak</p>
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

        // Current streak
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

        // Longest streak
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

        // Find the first Sunday of the display
        const displayStart = new Date(yearStart);
        displayStart.setDate(displayStart.getDate() - displayStart.getDay());

        // Group logs by date
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

    getColorClass(percentage: number): string {
        if (percentage === 0) return 'bg-slate-200';
        if (percentage < 25) return 'bg-primary-200';
        if (percentage < 50) return 'bg-primary-400';
        if (percentage < 75) return 'bg-primary-600';
        return 'bg-primary-800';
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
