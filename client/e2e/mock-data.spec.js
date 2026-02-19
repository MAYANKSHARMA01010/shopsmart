import { test, expect } from '@playwright/test';

test.describe('Frontend with Mock Data', () => {
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
});
