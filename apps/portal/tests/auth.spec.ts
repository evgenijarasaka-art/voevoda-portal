import { expect, test } from "@playwright/test";

test.describe("Авторизация", () => {
  test("Страница входа загружается", async ({ page }) => {
    await page.goto("http://localhost:5173/login");
    await expect(page).toHaveTitle(/Вход/);
    await expect(page.locator("h1")).toContainText("Вход");
  });

  test("Форма регистрации имеет все поля", async ({ page }) => {
    await page.goto("http://localhost:5173/register");

    // Проверяем, что все поля есть
    await expect(page.locator('input[placeholder="Иван"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Иванов"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Voevoda"]')).toBeVisible();
    await expect(
      page.locator('input[placeholder="hello@voevoda.ru"]'),
    ).toBeVisible();
    await expect(page.locator("select")).toBeVisible();
    await expect(
      page.locator('input[placeholder="(000) 000-00-00"]'),
    ).toBeVisible();
  });
});
