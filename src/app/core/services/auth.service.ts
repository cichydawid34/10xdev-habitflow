import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { AppUser } from '../../shared/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private userSignal = signal<AppUser | null>(null);
    private loadingSignal = signal(true);
    private errorSignal = signal<string | null>(null);

    readonly user = this.userSignal.asReadonly();
    readonly isLoading = this.loadingSignal.asReadonly();
    readonly error = this.errorSignal.asReadonly();
    readonly isAuthenticated = computed(() => !!this.userSignal());

    constructor(
        private supabase: SupabaseService,
        private router: Router
    ) {
        this.initAuthListener();
    }

    private async initAuthListener() {
        // Check initial session
        const user = await this.supabase.getCurrentUser();
        if (user) {
            this.userSignal.set(this.mapUser(user));
        }
        this.loadingSignal.set(false);

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                this.userSignal.set(this.mapUser(session.user));
            } else {
                this.userSignal.set(null);
            }

            if (event === 'SIGNED_IN') {
                this.router.navigate(['/dashboard']);
            } else if (event === 'SIGNED_OUT') {
                this.router.navigate(['/login']);
            }
        });
    }

    private mapUser(user: any): AppUser {
        return {
            id: user.id,
            email: user.email!,
            createdAt: new Date(user.created_at)
        };
    }

    async signUp(email: string, password: string): Promise<boolean> {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        try {
            const { error } = await this.supabase.signUp(email, password);
            if (error) {
                this.errorSignal.set(error.message);
                return false;
            }
            return true;
        } catch (e: any) {
            this.errorSignal.set(e.message);
            return false;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async signIn(email: string, password: string): Promise<boolean> {
        this.loadingSignal.set(true);
        this.errorSignal.set(null);

        try {
            const { error } = await this.supabase.signIn(email, password);
            if (error) {
                this.errorSignal.set(error.message);
                return false;
            }
            return true;
        } catch (e: any) {
            this.errorSignal.set(e.message);
            return false;
        } finally {
            this.loadingSignal.set(false);
        }
    }

    async signOut(): Promise<void> {
        await this.supabase.signOut();
    }
}
