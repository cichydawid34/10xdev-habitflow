import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habit } from '../../../shared/models';

@Component({
    selector: 'app-edit-habit-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      (click)="close.emit()">
      
      <!-- Dialog -->
      <div 
        class="glass-card p-8 w-full max-w-md relative"
        (click)="$event.stopPropagation()">
        
        <!-- Close button -->
        <button 
          (click)="close.emit()"
          class="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl">
          ✕
        </button>

        <h2 class="text-2xl font-bold text-white mb-6">Edit Habit</h2>

        <form (ngSubmit)="onSubmit()">
          <!-- Name -->
          <div class="mb-6">
            <label class="block text-white/60 text-sm mb-2">Habit Name</label>
            <input 
              type="text"
              [(ngModel)]="name"
              name="name"
              placeholder="e.g., Morning workout"
              class="input-glass"
              required>
          </div>

          <!-- Icon Selection -->
          <div class="mb-6">
            <label class="block text-white/60 text-sm mb-2">Choose Icon</label>
            <div class="flex flex-wrap gap-2">
              @for (emoji of icons; track emoji) {
                <button
                  type="button"
                  (click)="selectedIcon = emoji"
                  class="w-12 h-12 rounded-xl text-2xl transition-all"
                  [class.bg-primary-500]="selectedIcon === emoji"
                  [class.shadow-glow]="selectedIcon === emoji"
                  [class.bg-dark-600]="selectedIcon !== emoji">
                  {{ emoji }}
                </button>
              }
            </div>
          </div>

          <!-- Color Selection -->
          <div class="mb-8">
            <label class="block text-white/60 text-sm mb-2">Choose Color</label>
            <div class="flex gap-3">
              @for (color of colors; track color) {
                <button
                  type="button"
                  (click)="selectedColor = color"
                  class="w-10 h-10 rounded-xl transition-all"
                  [style.backgroundColor]="color"
                  [class.ring-2]="selectedColor === color"
                  [class.ring-white]="selectedColor === color"
                  [class.ring-offset-2]="selectedColor === color"
                  [class.ring-offset-dark-700]="selectedColor === color">
                </button>
              }
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex gap-3">
            <button 
              type="button"
              (click)="close.emit()"
              class="btn-secondary flex-1">
              Cancel
            </button>
            <button 
              type="submit"
              class="btn-primary flex-1"
              [disabled]="!name.trim()">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class EditHabitDialogComponent implements OnInit {
    @Input() habit!: Habit;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ id: string; name: string; icon: string; color: string }>();

    name = '';
    selectedIcon = '💪';
    selectedColor = '#8b5cf6';

    icons = ['💪', '📚', '🏃', '💧', '🧘', '✍️', '🎯', '💤', '🥗', '🎸'];
    colors = ['#8b5cf6', '#3b82f6', '#22c55e', '#f97316', '#ef4444', '#ec4899'];

    ngOnInit() {
        if (this.habit) {
            this.name = this.habit.name;
            this.selectedIcon = this.habit.icon;
            this.selectedColor = this.habit.color;
        }
    }

    onSubmit() {
        if (this.name.trim()) {
            this.save.emit({
                id: this.habit.id,
                name: this.name.trim(),
                icon: this.selectedIcon,
                color: this.selectedColor
            });
        }
    }
}
