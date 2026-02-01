import { Injectable } from '@angular/core';
import { Observable, from, map, forkJoin, of } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Habit, HabitLog, CreateHabitDto, UpdateHabitDto } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class HabitService {
    constructor(private supabase: SupabaseService) { }

    getHabits(): Observable<Habit[]> {
        return from(
            this.supabase.client
                .from('habits')
                .select('*')
                .order('created_at', { ascending: true })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapHabit);
            })
        );
    }

    getHabitsWithStreaks(): Observable<Habit[]> {
        return forkJoin({
            habits: this.getHabits(),
            logs: this.getAllLogs()
        }).pipe(
            map(({ habits, logs }) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                return habits.map(habit => {
                    const habitLogs = logs.filter(log => log.habitId === habit.id);
                    const streak = this.calculateStreak(habitLogs);
                    const completedToday = habitLogs.some(log => {
                        const logDate = new Date(log.completedAt);
                        logDate.setHours(0, 0, 0, 0);
                        return logDate.getTime() === today.getTime();
                    });

                    return {
                        ...habit,
                        currentStreak: streak,
                        completedToday
                    };
                });
            })
        );
    }

    private calculateStreak(logs: HabitLog[]): number {
        if (logs.length === 0) return 0;

        const sortedDates = logs
            .map(log => {
                const d = new Date(log.completedAt);
                d.setHours(0, 0, 0, 0);
                return d.getTime();
            })
            .sort((a, b) => b - a); // Most recent first

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if the streak is still active (completed today or yesterday)
        const mostRecent = sortedDates[0];
        if (mostRecent !== today.getTime() && mostRecent !== yesterday.getTime()) {
            return 0;
        }

        let streak = 0;
        let checkDate = mostRecent === today.getTime() ? today : yesterday;

        for (const logTime of sortedDates) {
            if (logTime === checkDate.getTime()) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (logTime < checkDate.getTime()) {
                break;
            }
        }

        return streak;
    }

    getAllLogs(): Observable<HabitLog[]> {
        return from(
            this.supabase.client
                .from('habit_logs')
                .select('*')
                .order('completed_at', { ascending: false })
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapLog);
            })
        );
    }

    getLogsForPeriod(startDate: Date, endDate: Date): Observable<HabitLog[]> {
        return from(
            this.supabase.client
                .from('habit_logs')
                .select('*')
                .gte('completed_at', startDate.toISOString().split('T')[0])
                .lte('completed_at', endDate.toISOString().split('T')[0])
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return (data || []).map(this.mapLog);
            })
        );
    }

    async createHabit(dto: CreateHabitDto): Promise<Observable<Habit>> {
        const user = await this.supabase.getCurrentUser();
        if (!user) throw new Error('Not authenticated');

        return from(
            this.supabase.client
                .from('habits')
                .insert({
                    user_id: user.id,
                    name: dto.name,
                    icon: dto.icon || '✅',
                    color: dto.color || '#22c55e',
                    target_days: dto.targetDays || [1, 2, 3, 4, 5, 6, 7]
                })
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapHabit(data);
            })
        );
    }

    updateHabit(id: string, dto: UpdateHabitDto): Observable<Habit> {
        const updates: any = {};
        if (dto.name !== undefined) updates.name = dto.name;
        if (dto.icon !== undefined) updates.icon = dto.icon;
        if (dto.color !== undefined) updates.color = dto.color;
        if (dto.targetDays !== undefined) updates.target_days = dto.targetDays;

        return from(
            this.supabase.client
                .from('habits')
                .update(updates)
                .eq('id', id)
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapHabit(data);
            })
        );
    }

    deleteHabit(id: string): Observable<void> {
        return from(
            this.supabase.client
                .from('habits')
                .delete()
                .eq('id', id)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
            })
        );
    }

    toggleHabitCompletion(habitId: string, date: Date): Observable<boolean> {
        const dateStr = date.toISOString().split('T')[0];

        return from(
            this.supabase.client
                .from('habit_logs')
                .select('id')
                .eq('habit_id', habitId)
                .eq('completed_at', dateStr)
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (data) {
                    // Log exists, delete it
                    this.supabase.client
                        .from('habit_logs')
                        .delete()
                        .eq('id', data.id)
                        .then();
                    return false;
                } else {
                    // No log, create one
                    this.supabase.client
                        .from('habit_logs')
                        .insert({ habit_id: habitId, completed_at: dateStr })
                        .then();
                    return true;
                }
            })
        );
    }

    logHabit(habitId: string, date: Date = new Date()): Observable<HabitLog> {
        const dateStr = date.toISOString().split('T')[0];
        return from(
            this.supabase.client
                .from('habit_logs')
                .upsert({ habit_id: habitId, completed_at: dateStr })
                .select()
                .single()
        ).pipe(
            map(({ data, error }) => {
                if (error) throw error;
                return this.mapLog(data);
            })
        );
    }

    unlogHabit(habitId: string, date: Date = new Date()): Observable<void> {
        const dateStr = date.toISOString().split('T')[0];
        return from(
            this.supabase.client
                .from('habit_logs')
                .delete()
                .eq('habit_id', habitId)
                .eq('completed_at', dateStr)
        ).pipe(
            map(({ error }) => {
                if (error) throw error;
            })
        );
    }

    private mapHabit(data: any): Habit {
        return {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            icon: data.icon,
            color: data.color,
            targetDays: data.target_days,
            createdAt: new Date(data.created_at)
        };
    }

    private mapLog(data: any): HabitLog {
        return {
            id: data.id,
            habitId: data.habit_id,
            completedAt: new Date(data.completed_at)
        };
    }
}
