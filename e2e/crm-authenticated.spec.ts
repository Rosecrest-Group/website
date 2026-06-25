import { test, expect } from "@playwright/test";

const email = process.env.CRM_TEST_EMAIL;
const password = process.env.CRM_TEST_PASSWORD;

test.describe("CRM authenticated flows", () => {
  test.skip(!email || !password, "Set CRM_TEST_EMAIL and CRM_TEST_PASSWORD to run");

  test.beforeEach(async ({ page }) => {
    await page.goto("/crm/login");
    await page.getByLabel(/email/i).fill(email!);
    await page.getByLabel(/password/i).fill(password!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/crm\/?$/);
  });

  test("dashboard loads", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /dashboard|sales|rosecrest/i }).first()).toBeVisible();
  });

  test("new lead form accepts phone query param", async ({ page }) => {
    await page.goto("/crm/leads/new?phone=07700900142");
    await expect(page.getByLabel(/phone/i)).toHaveValue("07700900142");
    await expect(page.getByRole("heading", { name: /new lead/i })).toBeVisible();
  });

  test("leads list page loads", async ({ page }) => {
    await page.goto("/crm/leads");
    await expect(page.getByRole("heading", { name: /leads/i })).toBeVisible();
  });

  test("jobs list page loads", async ({ page }) => {
    await page.goto("/crm/jobs");
    await expect(page.getByRole("heading", { name: /jobs/i })).toBeVisible();
  });

  test("workflows list page loads", async ({ page }) => {
    await page.goto("/crm/workflows");
    await expect(page.getByText(/workflow/i).first()).toBeVisible();
  });

  test("SLA dashboard loads", async ({ page }) => {
    await page.goto("/crm/slas");
    await expect(page.getByText(/sla/i).first()).toBeVisible();
  });

  test("trade schedule page loads", async ({ page }) => {
    await page.goto("/crm/schedule");
    await expect(page.getByRole("heading", { name: /schedule/i })).toBeVisible();
  });
});
