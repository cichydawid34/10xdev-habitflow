import { Injectable } from '@angular/core';
import { Observable, from, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Book, BookStatus, CreateBookDto, UpdateBookDto } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class BookService {
    constructor(private supabase: SupabaseService) { }

    getBooks(): Observable<Book[]> {
        return from(
            this.supabase.client
                .from('books')
                .select('*')
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapBook);
            })
        );
    }

    getBooksByStatus(status: BookStatus): Observable<Book[]> {
        return from(
            this.supabase.client
                .from('books')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapBook);
            })
        );
    }

    getBook(id: string): Observable<Book> {
        return from(
            this.supabase.client
                .from('books')
                .select('*')
                .eq('id', id)
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapBook(data);
            })
        );
    }

    async createBook(dto: CreateBookDto): Promise<Observable<Book>> {
        const user = await this.supabase.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        return from(
            this.supabase.client
                .from('books')
                .insert({
                    user_id: user.id,
                    title: dto.title,
                    author: dto.author || null,
                    total_pages: dto.totalPages || null,
                    status: dto.status || 'want_to_read',
                    current_page: 0,
                    started_at: dto.status === 'reading' ? new Date().toISOString().split('T')[0] : null
                })
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapBook(data);
            })
        );
    }

    updateBook(id: string, dto: UpdateBookDto): Observable<Book> {
        const updates: any = {};
        if (dto.title !== undefined) updates.title = dto.title;
        if (dto.author !== undefined) updates.author = dto.author;
        if (dto.totalPages !== undefined) updates.total_pages = dto.totalPages;
        if (dto.currentPage !== undefined) updates.current_page = dto.currentPage;
        if (dto.status !== undefined) {
            updates.status = dto.status;
            if (dto.status === 'reading' && !updates.started_at) {
                updates.started_at = new Date().toISOString().split('T')[0];
            }
            if (dto.status === 'completed') {
                updates.finished_at = new Date().toISOString().split('T')[0];
            }
        }
        if (dto.notes !== undefined) updates.notes = dto.notes;

        return from(
            this.supabase.client
                .from('books')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapBook(data);
            })
        );
    }

    updateProgress(id: string, currentPage: number): Observable<Book> {
        return this.updateBook(id, { currentPage });
    }

    deleteBook(id: string): Observable<void> {
        return from(
            this.supabase.client
                .from('books')
                .delete()
                .eq('id', id)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
            })
        );
    }

    private mapBook(data: any): Book {
        const totalPages = data.total_pages;
        const currentPage = data.current_page;
        const progress = totalPages ? Math.round((currentPage / totalPages) * 100) : 0;

        return {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            author: data.author,
            totalPages: data.total_pages,
            currentPage: data.current_page,
            status: data.status,
            startedAt: data.started_at ? new Date(data.started_at) : null,
            finishedAt: data.finished_at ? new Date(data.finished_at) : null,
            notes: data.notes,
            createdAt: new Date(data.created_at),
            progress
        };
    }
}
