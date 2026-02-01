export interface AppUser {
    id: string;
    email: string;
    createdAt: Date;
}

export interface AuthState {
    user: AppUser | null;
    isLoading: boolean;
    error: string | null;
}

export interface WeeklyDigest {
    id: string;
    userId: string;
    weekStart: Date;
    content: string;
    createdAt: Date;
}

export interface DayActivity {
    date: Date;
    completedCount: number;
    totalCount: number;
    percentage: number;
}
