import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../shared/models';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="habit-card cursor-pointer group"
      [class.habit-completed]="habit.completedToday"
      (click)="toggle.emit(habit)"
      [attr.data-testid]="'habit-' + habit.id">
      
      <!-- Icon -->
      <div class="habit-icon">
        {{ habit.icon }}
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-white truncate">{{ habit.name }}</h4>
        <div class="flex items-center gap-2 mt-1">
          @if (habit.currentStreak && habit.currentStreak > 0) {
            <span class="streak-fire text-sm flex items-center gap-1">
              🔥 {{ habit.currentStreak }} day streak
            </span>
          } @else {
            <span class="text-white/40 text-sm">Start your streak!</span>
          }
        </div>
      </div>

      <!-- Progress Ring -->
      <div class="relative w-14 h-14 flex-shrink-0">
        <svg class="progress-ring w-full h-full" viewBox="0 0 36 36">
          <!-- Background circle -->
          <circle
            class="stroke-dark-500"
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke-width="3"
          ></circle>
          <!-- Progress circle -->
          <circle
            class="progress-ring__circle"
            [class.stroke-success-500]="habit.completedToday"
            [class.stroke-primary-500]="!habit.completedToday"
            cx="18" cy="18" r="15.9"
            fill="none"
            stroke-width="3"
            [attr.stroke-dasharray]="circumference"
            [attr.stroke-dashoffset]="habit.completedToday ? 0 : circumference"
          ></circle>
        </svg>
        <!-- Check icon -->
        <div class="absolute inset-0 flex items-center justify-center">
          @if (habit.completedToday) {
            <span class="text-success-400 text-xl">✓</span>
          } @else {
            <span class="text-white/30 group-hover:text-white/60 transition-colors">○</span>
          }
        </div>
      </div>

      <!-- Action buttons -->
      <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          (click)="onEdit($event)"
          class="text-white/30 hover:text-primary-400 p-1 transition-colors"
          title="Edit habit">
          ✏️
        </button>
        <button 
          (click)="onDelete($event)"
          class="text-white/30 hover:text-red-400 p-1 transition-colors"
          title="Delete habit">
          ✕
        </button>
      </div>
    </div>
  `
})
export class HabitCardComponent {
  @Input() habit!: Habit;
  @Output() toggle = new EventEmitter<Habit>();
  @Output() edit = new EventEmitter<Habit>();
  @Output() delete = new EventEmitter<Habit>();

  circumference = 2 * Math.PI * 15.9;

  onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.habit);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.habit);
  }
}
