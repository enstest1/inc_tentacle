import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Tentacle e2e", () => {
  test("main page is accessible", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("One send. Every wallet.")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });

  test("CSV import reports line-level errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("csv-text")).toBeVisible();
    const csv = `address
not-an-address
BADADDRESS`;
    await page.getByTestId("csv-text").fill(csv);
    await page.getByTestId("csv-parse").click();
    await expect(page.getByTestId("csv-issues")).toContainText("Line 2");
    await expect(page.getByTestId("csv-issues")).toContainText("Line 3");
  });

  test("wrong network copy is not shown before connect", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Connect an injected wallet/)).toBeVisible();
  });
});
