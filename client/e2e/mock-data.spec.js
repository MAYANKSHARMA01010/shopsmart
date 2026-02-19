import { test, expect } from '@playwright/test';

test.describe('Frontend with Mock Data', () => {
    test('should display loading state initially', async ({ page }) => {
        // Delay the response to verify loading state
        await page.route('*/**/api/health', async (route) => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await route.fulfill({
                json: { status: 'ok', message: 'Delayed Response', timestamp: new Date().toISOString() }
            });
        });

        await page.goto('/');
        await expect(page.getByText('Loading backend status...')).toBeVisible();
    });

    test('should display mocked health status', async ({ page }) => {
        // Mock the API response for health check
        await page.route('*/**/api/health', async (route) => {
            const json = {
                status: 'ok',
                message: 'Mocked Health Check',
                timestamp: new Date().toISOString(),
            };
            await route.fulfill({ json });
        });

        // Navigate to the home page
        await page.goto('/');

        // Verify that the mocked status is displayed
        await expect(page.getByRole('heading', { name: 'Backend Status' })).toBeVisible();
        await expect(page.getByText('Mocked Health Check')).toBeVisible();
    });

    test('should display error message when API fails', async ({ page }) => {
        // Mock the API response to return a 500 error
        await page.route('*/**/api/health', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal Server Error' }),
            });
        });

        await page.goto('/');

        // Verify that the error message is displayed
        await expect(page.getByText('Failed to fetch health status')).toBeVisible();
    });
});
