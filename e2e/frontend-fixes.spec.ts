import { expect, test } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:5173';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('voevoda_session', JSON.stringify({ login:'tornado', callsign:'Торнадо' }));
    localStorage.setItem('voevoda_cookie_consent_v1', JSON.stringify({ necessary:true, analytics:false, personalization:false }));
  });
});

test('course list interactions are connected', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/courses`);
  await page.getByRole('button', { name:'Серии курсов' }).click();
  await expect(page.getByText(/Серия курсов 01/)).toBeVisible();
  await expect(page.getByText(/Система комплексной военной подготовки/).first()).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({ path:testInfo.outputPath('course-series.png'), fullPage:false });

  await page.getByRole('button', { name:'Все курсы' }).click();
  await page.getByRole('button', { name:'Подать заявку' }).first().click();
  await expect(page).toHaveURL(/\/competitions\?competition=1/);
});

test('course landing gallery, reviews and reminder work', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/courses/${encodeURIComponent('Общевойсковой Снайпер')}`);
  await expect(page.getByRole('button', { name:'Записаться', exact:true })).toBeVisible();
  await expect(page.locator('.cl-review')).toHaveCount(4);

  const heroPhoto = page.locator('.cl-photo-main');
  await expect(heroPhoto).toBeVisible();
  const firstPhotoAlt = await heroPhoto.getAttribute('alt');
  await page.getByRole('button', { name:'Следующее фото' }).click();
  await expect(heroPhoto).not.toHaveAttribute('alt', firstPhotoAlt ?? '');

  await page.locator('.sc-ev').first().click();
  await expect(page.getByText('Сохранить напоминание')).toBeVisible();
  await page.screenshot({ path:testInfo.outputPath('lesson-modal.png'), fullPage:false });
  await page.getByRole('button', { name:/Сохранить напоминание/ }).click();
  await expect(page.getByText('Напоминание сохранено')).toBeVisible();
  await page.getByRole('button', { name:'Закрыть', exact:true }).last().click();
  await expect(page.locator('header').getByRole('button', { name:/Уведомления:/ })).toBeVisible();
});

test('settings content is visible', async ({ page }) => {
  await page.goto(`${baseUrl}/settings`);
  await expect(page.getByText('Аккаунт', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Данные аккаунта', { exact: true })).toBeVisible();
});
