import { test, expect } from '@playwright/test';

const baseUrl = 'http://127.0.0.1:5173';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('voevoda_session', JSON.stringify({
      name: 'Алексей',
      surname: 'Ветров',
      login: 'tornado',
      email: 'tornado@example.test',
      phone: '+7 900 000-00-00',
      callsign: 'Торнадо',
    }));
    localStorage.setItem('voevoda_cookie_consent_v1', JSON.stringify({
      necessary: true,
      analytics: false,
      personalization: false,
      updatedAt: new Date().toISOString(),
    }));
  });
});

test('favorites cards align and cart selection works', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/favorites`);
  await page.getByRole('button', { name: /Обучение/ }).click();
  await page.waitForTimeout(600);

  const courseActions = page.getByRole('button', { name: /Продолжить обучение|Записаться и оплатить/ });
  await expect(courseActions).toHaveCount(4);
  const courseBoxes = await courseActions.evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
  expect(Math.max(...courseBoxes) - Math.min(...courseBoxes)).toBeLessThan(4);

  await page.getByRole('button', { name: /Записаться и оплатить/ }).first().click();
  await expect(page.getByText('Добавлено в корзину')).toBeVisible();
  await page.goto(`${baseUrl}/cart`);

  const checkout = page.getByRole('button', { name: 'К оформлению заказа' });
  await expect(checkout).toBeEnabled();
  await page.getByText(/Выбрать все 1/).click();
  await expect(checkout).toBeDisabled();
  await page.getByText(/Выбрать все 1/).click();
  await expect(checkout).toBeEnabled();

  await page.screenshot({ path: testInfo.outputPath('cart.png'), fullPage: true });
});

test('market and kaptorka action rows stay aligned', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/favorites`);
  await page.getByRole('button', { name: /Военмаркет/ }).click();
  await page.waitForTimeout(600);
  const marketActions = page.locator('.fav-card-primary');
  await expect(marketActions).toHaveCount(3);
  const marketTops = await marketActions.evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
  expect(Math.max(...marketTops) - Math.min(...marketTops)).toBeLessThan(4);

  await page.getByRole('button', { name: /Каптёрка/ }).click();
  await page.waitForTimeout(600);
  const kaptorkaActions = page.locator('.fav-card-primary');
  await expect(kaptorkaActions).toHaveCount(3);
  const kaptorkaTops = await kaptorkaActions.evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().top));
  expect(Math.max(...kaptorkaTops) - Math.min(...kaptorkaTops)).toBeLessThan(4);

  await page.screenshot({ path: testInfo.outputPath('favorites.png'), fullPage: true });
});

test('profile chart is enlarged', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/profile`);
  await page.getByRole('button', { name: 'График подготовки' }).click();
  const radar = page.locator('.recharts-wrapper').first();
  await expect(radar).toBeVisible();
  const box = await radar.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(335);
  await page.waitForTimeout(900);
  await page.screenshot({ path: testInfo.outputPath('profile-chart.png'), fullPage: true });
});

test('communities and social sections match the specification', async ({ page }, testInfo) => {
  await page.goto(`${baseUrl}/communities`);
  await expect(page.getByRole('heading', { name: 'Соцсеть «ПАТРИОТ»' })).toBeVisible();
  await expect(page.locator('.community-type-tabs button')).toHaveCount(11);
  await expect(page.getByText('Подать заявку').first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('communities.png'), fullPage: true });
  await page.getByRole('button', { name: 'Подробнее' }).first().click();
  await expect(page.getByText('Фотографии', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Написать сообщение' })).toBeVisible();

  await page.goto(`${baseUrl}/my-circle`);
  for (const label of ['Друзья', 'Сообщества', 'Подписки', 'Подписчики']) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }

  await page.goto(`${baseUrl}/my-journal`);
  await expect(page.getByRole('button', { name: 'Статьи' })).toBeVisible();
  await page.getByRole('button', { name: 'Блог' }).click();
  await expect(page.getByRole('button', { name: 'Добавить' })).toBeVisible();
  await page.waitForTimeout(600);
  await page.screenshot({ path: testInfo.outputPath('my-journal.png'), fullPage: true });
});
