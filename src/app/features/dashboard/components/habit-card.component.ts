import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../shared/models';

@Component({
    selector: 'app-habit-card',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div 
      class="card hover:shadow-md transition-shadow cursor-pointer"
      [class.ring-2]="habit.completedToday"
      [class.ring-primary-500]="habit.completedToday"
      [class.bg-primary-50]="habit.completedToday"
      (click)="toggle.emit(habit)">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            [style.backgroundColor]="habit.color + '20'">
            {{ habit.icon }}
          </div>
          <div>
            <h4 class="font-semibold text-slate-800">{{ habit.name }}</h4>
            <div class="flex items-center gap-2 mt-1">
              @if (habit.currentStreak && habit.currentStreak > 0) {
                <span class="streak-badge">
                  🔥 {{ habit.currentStreak }} days
                </span>
              } @else {
                <span class="text-sm text-slate-400">No streak yet</span>
              }
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          @if (habit.completedToday) {
            <span class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
              ✓
            </span>
          } @else {
            <span class="w-8 h-8 border-2 border-slate-300 rounded-full"></span>
          }
          <button 
            (click)="onDelete($event)"
            class="text-slate-400 hover:text-red-500 p-1">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `
})
export class HabitCardComponent {
    @Input({ required: true }) habit!: Habit;
    @Output() toggle = new EventEmitter<Habit>();
    @Output() delete = new EventEmitter<Habit>();

    onDelete(event: Event) {
        event.stopPropagation();
        this.delete.emit(this.habit);
    }
}
