export interface Habit {
    id: string;
    userId: string;
    name: string;
    icon: string;
    color: string;
    targetDays: number[]; // 1=Mon, 7=Sun
    createdAt: Date;
    // Computed
    currentStreak?: number;
    longestStreak?: number;
    completedToday?: boolean;
}

export interface HabitLog {
    id: string;
    habitId: string;
    completedAt: Date;
}

export interface CreateHabitDto {
    name: string;
    icon?: string;
    color?: string;
    targetDays?: number[];
}

export interface UpdateHabitDto {
    name?: string;
    icon?: string;
    color?: string;
    targetDays?: number[];
}
