import { test, expect } from '@playwright/test';

test.describe('ShopSmart End-to-End User Flow', () => {
  test('should navigate home, check health, and view products list', async ({ page }) => {
    // 1. Visit the Home Page
    await page.goto('/');
    
    // Check if hero title is visible
    await expect(page.locator('text=ShopSmart v2')).toBeVisible();

    // Check backend health indicator is working
    await expect(page.locator('text=Backend is operational')).toBeVisible({ timeout: 10000 });

    // 2. Navigate to Products
    await page.click('text=Products');
    await page.waitForURL('/products');

    // 3. Verify Products Page
    await expect(page.locator('h1', { hasText: 'Product Catalog' })).toBeVisible();

    // Verify search bar is visible
    await expect(page.getByPlaceholder('Search products...')).toBeVisible();
    
    // Verify an add product form exists
    await expect(page.locator('text=Add New Product')).toBeVisible();
  });
});
