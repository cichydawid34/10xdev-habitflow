export interface Book {
    id: string;
    userId: string;
    title: string;
    author: string | null;
    totalPages: number | null;
    currentPage: number;
    status: BookStatus;
    startedAt: Date | null;
    finishedAt: Date | null;
    notes: string | null;
    createdAt: Date;
    // Computed
    progress?: number; // 0-100
}

export type BookStatus = 'reading' | 'completed' | 'paused' | 'want_to_read';

export interface CreateBookDto {
    title: string;
    author?: string;
    totalPages?: number;
    status?: BookStatus;
}

export interface UpdateBookDto {
    title?: string;
    author?: string;
    totalPages?: number;
    currentPage?: number;
    status?: BookStatus;
    notes?: string;
}
