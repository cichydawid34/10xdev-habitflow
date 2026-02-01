import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const ICONS = ['🏋️', '📚', '🧘', '💧', '🏃', '✍️', '🎸', '💤', '🥗', '📝', '🚿', '☀️'];
const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'];

@Component({
    selector: 'app-add-habit-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" (click)="close.emit()">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 m-4" (click)="$event.stopPropagation()">
        <h2 class="text-xl font-bold text-slate-800 mb-6">Add New Habit</h2>

        <div class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Habit Name</label>
            <input 
              type="text" 
              [(ngModel)]="name"
              class="input"
              placeholder="e.g., Morning workout"
              data-testid="habit-name">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Icon</label>
            <div class="flex flex-wrap gap-2">
              @for (icon of icons; track icon) {
                <button 
                  type="button"
                  (click)="selectedIcon.set(icon)"
                  class="w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all"
                  [class.bg-slate-100]="selectedIcon() !== icon"
                  [class.bg-primary-100]="selectedIcon() === icon"
                  [class.ring-2]="selectedIcon() === icon"
                  [class.ring-primary-500]="selectedIcon() === icon">
                  {{ icon }}
                </button>
              }
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">Color</label>
            <div class="flex flex-wrap gap-2">
              @for (color of colors; track color) {
                <button 
                  type="button"
                  (click)="selectedColor.set(color)"
                  class="w-8 h-8 rounded-full transition-all"
                  [style.backgroundColor]="color"
                  [class.ring-2]="selectedColor() === color"
                  [class.ring-offset-2]="selectedColor() === color"
                  [class.ring-slate-400]="selectedColor() === color">
                </button>
              }
            </div>
          </div>
        </div>

        <div class="flex gap-3 mt-8">
          <button 
            (click)="close.emit()"
            class="flex-1 btn-secondary">
            Cancel
          </button>
          <button 
            (click)="onSave()"
            [disabled]="!name.trim()"
            class="flex-1 btn-primary disabled:opacity-50"
            data-testid="save-habit-btn">
            Add Habit
          </button>
        </div>
      </div>
    </div>
  `
})
export class AddHabitDialogComponent {
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<{ name: string; icon: string; color: string }>();

    name = '';
    selectedIcon = signal('🏋️');
    selectedColor = signal('#22c55e');

    icons = ICONS;
    colors = COLORS;

    onSave() {
        if (this.name.trim()) {
            this.save.emit({
                name: this.name.trim(),
                icon: this.selectedIcon(),
                color: this.selectedColor()
            });
        }
    }
}
