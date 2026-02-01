import { Injectable } from '@angular/core';
import { Observable, from, map, forkJoin } from 'rxjs';
import OpenAI from 'openai';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';
import { HabitService } from './habit.service';
import { BookService } from './book.service';
import { WeeklyDigest } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class AiService {
    private openai: OpenAI;

    constructor(
        private supabase: SupabaseService,
        private habitService: HabitService,
        private bookService: BookService
    ) {
        this.openai = new OpenAI({
            apiKey: environment.openaiApiKey,
            dangerouslyAllowBrowser: true
        });
    }

    generateWeeklyDigest(): Observable<WeeklyDigest> {
        const weekStart = this.getWeekStart();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        return forkJoin({
            habits: this.habitService.getHabitsWithStreaks(),
            logs: this.habitService.getLogsForPeriod(weekStart, weekEnd),
            books: this.bookService.getBooks()
        }).pipe(
            map(async ({ habits, logs, books }) => {
                const prompt = this.buildDigestPrompt(habits, logs, books, weekStart, weekEnd);
                const content = await this.callOpenAI(prompt);

                // Save to database
                const { data, error } = await this.supabase.client
                    .from('weekly_digests')
                    .insert({
                        week_start: weekStart.toISOString().split('T')[0],
                        content
                    })
                    .select()
                    .single();

                if (error) throw error;

                return this.mapDigest(data);
            }),
            map(promise => from(promise)),
            map(obs => obs as any)
        );
    }

    getWeeklyDigests(): Observable<WeeklyDigest[]> {
        return from(
            this.supabase.client
                .from('weekly_digests')
                .select('*')
                .order('week_start', { ascending: false })
                .limit(12)
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapDigest);
            })
        );
    }

    private async callOpenAI(prompt: string): Promise<string> {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are a supportive habit coach providing weekly progress summaries. Be encouraging but honest. Use emojis sparingly. Keep it concise (max 300 words). Format with markdown headings.`
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            return response.choices[0].message.content || 'Unable to generate digest.';
        } catch (error) {
            console.error('OpenAI error:', error);
            return 'Failed to generate weekly digest. Please check your API key.';
        }
    }

    private buildDigestPrompt(
        habits: any[],
        logs: any[],
        books: any[],
        weekStart: Date,
        weekEnd: Date
    ): string {
        const habitSummary = habits.map(h => {
            const weekLogs = logs.filter(l => l.habitId === h.id);
            return `- ${h.icon} ${h.name}: ${weekLogs.length}/7 days, streak: ${h.currentStreak || 0} days`;
        }).join('\n');

        const readingBooks = books.filter(b => b.status === 'reading');
        const bookSummary = readingBooks.map(b =>
            `- "${b.title}": ${b.progress}% complete (page ${b.currentPage}/${b.totalPages || '?'})`
        ).join('\n');

        const completedBooks = books.filter(b =>
            b.status === 'completed' &&
            b.finishedAt &&
            new Date(b.finishedAt) >= weekStart
        );

        return `Generate a weekly progress summary for the week of ${weekStart.toDateString()} to ${weekEnd.toDateString()}.

HABITS:
${habitSummary || 'No habits tracked yet.'}

READING PROGRESS:
${bookSummary || 'No books currently being read.'}

BOOKS COMPLETED THIS WEEK:
${completedBooks.map(b => `- "${b.title}" by ${b.author || 'Unknown'}`).join('\n') || 'None'}

Please provide:
1. A brief overview of the week
2. Highlight any achievements (long streaks, completed books)
3. Areas for improvement
4. One actionable tip for next week`;
    }

    private getWeekStart(): Date {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    }

    private mapDigest(data: any): WeeklyDigest {
        return {
            id: data.id,
            userId: data.user_id,
            weekStart: new Date(data.week_start),
            content: data.content,
            createdAt: new Date(data.created_at)
        };
    }
}
