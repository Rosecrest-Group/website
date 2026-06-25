import { test, expect } from "@playwright/test";

test.describe("CRM login page", () => {
  test("shows login form", async ({ page }) => {
    await page.goto("/crm/login");
    await expect(page.getByText(/sign in to the operations platform/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });
});
