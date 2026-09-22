import { test, expect, type Page } from '@playwright/test';

const ids = ['thach-han', 'hao-thanh', 'cong-hau', 'noi-thanh'];
async function ready(page: Page) {
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#panorama canvas')).toBeVisible();
  await expect(page.locator('#viewer-error')).toBeHidden();
}

test('intro, real panorama, all viewpoints, and historical notice', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Mưa đỏ');
  await expect(page.locator('.reconstruction-label')).toContainText('Không phải ảnh chụp năm 1972');
  await page.getByRole('button', { name: 'Bắt đầu hành trình' }).click();
  await ready(page);
  for (const id of ids) {
    await page.locator(`[data-scene="${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#scene=${id}$`));
    await ready(page);
    await expect(page.locator(`[data-scene="${id}"]`)).toHaveAttribute('aria-current', 'location');
    await expect(page.locator('.reconstruction-label')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('deep link and browser history restore selected viewpoint', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await page.locator('[data-scene="noi-thanh"]').click();
  await ready(page);
  await page.goBack();
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await ready(page);
});

test('source drawer separates historical evidence and interpretive details', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await page.locator('.read-scene').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('vòm cuốn');
  await expect(dialog).toContainText('diễn họa');
  await expect(dialog).toContainText('tiểu thuyết');
  await page.locator('#sources-tab').click();
  await expect(page.locator('#sources-panel')).toContainText('Cục Di sản');
  const links = await page.locator('#sources-panel a[href]').evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThanOrEqual(3);
  expect(links.every(url => url.startsWith('https://'))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('.read-scene')).toBeFocused();
});

test('presentation keeps disclosure visible and can exit; audio defaults off', async ({ page }) => {
  await page.goto('./#scene=thach-han');
  await ready(page);
  await expect(page.locator('#ambience-button')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#presentation-button').click();
  await expect(page.locator('body')).toHaveClass(/presentation/);
  await expect(page.locator('.reconstruction-label')).toBeVisible();
  await expect(page.locator('#presentation-exit')).toBeVisible();
  await page.locator('#presentation-exit').click();
  await expect(page.locator('body')).not.toHaveClass(/presentation/);
});

test('missing panorama can retry and recover without trapping navigation', async ({ page }) => {
  await page.route('**/scenes/hao-thanh.webp', route => route.abort());
  await page.goto('./#scene=hao-thanh');
  await expect(page.locator('#viewer-error')).toBeVisible();
  await expect(page.locator('#scene-title')).toContainText('Hào');
  await page.unroute('**/scenes/hao-thanh.webp');
  await page.getByRole('button', { name: 'Thử tải lại' }).click();
  await ready(page);
  await page.locator('[data-scene="thach-han"]').click();
  await ready(page);
});

test('WebGL unavailable leaves readable scene and source access', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (kind: string, ...args: unknown[]) {
      if (kind.includes('webgl')) return null;
      return original.call(this, kind as '2d', ...args);
    } as typeof original;
  });
  await page.goto('./#scene=thach-han');
  await expect(page.locator('#viewer-error')).toBeVisible();
  await page.locator('#viewer-error [data-open="story"]').click();
  await expect(page.locator('#information-dialog')).toContainText('Thạch Hãn');
});

test('responsive layout, image assets, and initial transfer budget', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Bắt đầu hành trình' }).click();
  await ready(page);
  const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
  const transfer = await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, e) => sum + (e as PerformanceResourceTiming).transferSize, 0));
  expect(transfer).toBeLessThan(5 * 1024 * 1024);
  const broken = await page.locator('img').evaluateAll(images => images.filter(el => el.complete && !el.naturalWidth).map(el => el.src));
  expect(broken).toEqual([]);
  await page.screenshot({ path: `test-results/overview-${test.info().project.name}.png` });
});

test('rapid navigation finishes on latest scene, including invalid hash', async ({ page }) => {
  await page.goto('./#scene=does-not-exist');
  await page.getByRole('button', { name: 'Bắt đầu hành trình' }).click();
  await ready(page);
  await page.evaluate(() => {
    for (const id of ['hao-thanh', 'cong-hau', 'noi-thanh']) {
      (document.querySelector(`[data-scene="${id}"]`) as HTMLButtonElement).click();
    }
  });
  await ready(page);
  await expect(page).toHaveURL(/#scene=noi-thanh$/);
  await expect(page.locator('#scene-title')).toHaveText('Bên trong Thành cổ');
});

test('reconstruction disclosure remains legible', async ({ page }) => {
  await page.goto('./');
  const size = await page.locator('.reconstruction-label').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(10);
});

test('mouse or touch drag and keyboard turn the actual panorama', async ({ page, isMobile }) => {
  await page.goto('./#scene=thach-han');
  await ready(page);
  const hotspot = page.locator('.scene-hotspot').first();
  const original = await hotspot.getAttribute('style');
  const viewport = page.viewportSize()!;
  const x = Math.round(viewport.width / 2), y = Math.round(viewport.height * 0.35);
  if (isMobile) {
    const client = await page.context().newCDPSession(page);
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x - 90, y }] });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  } else {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - 130, y, { steps: 8 });
    await page.mouse.up();
  }
  await expect.poll(() => hotspot.getAttribute('style')).not.toEqual(original);
  await page.locator('#panorama').focus();
  const afterDrag = await hotspot.getAttribute('style');
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => hotspot.getAttribute('style')).not.toEqual(afterDrag);
});
