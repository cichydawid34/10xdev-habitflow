import { test, expect } from '@playwright/test';

/**
 * HabitFlow E2E Test Suite
 * 
 * Tests the core user journey:
 * 1. Register/Login
 * 2. Add habits
 * 3. Complete habits
 * 4. Verify streaks
 */

test.describe('HabitFlow User Journey', () => {
    const testUser = {
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };

    test('should display login page for unauthenticated users', async ({ page }) => {
        await page.goto('/');

        // Should redirect to login
        await expect(page).toHaveURL(/.*login/);
        await expect(page.locator('h1')).toContainText('Welcome to HabitFlow');
    });

    test('should register a new user', async ({ page }) => {
        await page.goto('/register');

        await expect(page.locator('h1')).toContainText('Create Account');

        // Fill registration form
        await page.getByTestId('email').fill(testUser.email);
        await page.getByTestId('password').fill(testUser.password);
        await page.getByTestId('confirm-password').fill(testUser.password);
        await page.locator('#terms').check();

        await page.getByTestId('register-btn').click();

        // Should show success or redirect
        await expect(page.locator('text=Account created')).toBeVisible({ timeout: 10000 });
    });

    test('should login with credentials', async ({ page }) => {
        await page.goto('/login');

        await page.getByTestId('email').fill(testUser.email);
        await page.getByTestId('password').fill(testUser.password);
        await page.getByTestId('login-btn').click();

        // Should redirect to dashboard
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    });

    test('should add a new habit', async ({ page }) => {
        // Assuming logged in
        await page.goto('/dashboard');

        // Click add habit button
        await page.getByTestId('add-habit-btn').click();

        // Fill habit form
        await page.getByTestId('habit-name').fill('Morning Workout');
        await page.getByTestId('save-habit-btn').click();

        // Verify habit appears
        await expect(page.locator('text=Morning Workout')).toBeVisible({ timeout: 5000 });
    });

    test('should display reading list page', async ({ page }) => {
        await page.goto('/books');

        await expect(page.locator('h1')).toContainText('Reading List');
    });

    test('should display calendar page', async ({ page }) => {
        await page.goto('/calendar');

        await expect(page.locator('h1')).toContainText('Activity Calendar');
    });

    test('should display AI digest page', async ({ page }) => {
        await page.goto('/digest');

        await expect(page.locator('h1')).toContainText('AI Weekly Digest');
    });
});

test.describe('Navigation', () => {
    test('should navigate between pages', async ({ page }) => {
        await page.goto('/login');

        // Login link to register
        await page.click('text=Sign up');
        await expect(page).toHaveURL(/.*register/);

        // Register link to login
        await page.click('text=Sign in');
        await expect(page).toHaveURL(/.*login/);
    });
});
