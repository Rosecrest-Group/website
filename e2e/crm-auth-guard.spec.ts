import { test, expect } from "@playwright/test";

test.describe("CRM auth guard", () => {
  test("redirects unauthenticated users from dashboard to login", async ({ page }) => {
    await page.goto("/crm");
    await expect(page).toHaveURL(/\/crm\/login/);
    await expect(page.getByText(/sign in to the operations platform/i)).toBeVisible();
  });

  test("redirects unauthenticated users from leads to login with redirect param", async ({ page }) => {
    await page.goto("/crm/leads");
    await expect(page).toHaveURL(/\/crm\/login\?redirect=%2Fcrm%2Fleads/);
  });

  test("redirects unauthenticated users from jobs to login", async ({ page }) => {
    await page.goto("/crm/jobs");
    await expect(page).toHaveURL(/\/crm\/login/);
  });

  test("redirects unauthenticated users from workflows to login", async ({ page }) => {
    await page.goto("/crm/workflows");
    await expect(page).toHaveURL(/\/crm\/login/);
  });

  test("redirects unauthenticated users from SLA dashboard to login", async ({ page }) => {
    await page.goto("/crm/slas");
    await expect(page).toHaveURL(/\/crm\/login/);
  });
});
