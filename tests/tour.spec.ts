import { test, expect, type Page } from '@playwright/test';

const ids = ['thach-han', 'hao-thanh', 'cong-hau', 'luy-bac', 'noi-thanh', 'pho-cu'];
async function ready(page: Page) {
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#panorama canvas')).toBeVisible();
  await expect(page.locator('#viewer-error')).toBeHidden();
}

test('direct panorama entry, all viewpoints, and clean immersion', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await expect(page.locator('.introduction')).toHaveCount(0);
  await expect(page.locator('header')).toHaveCount(0);
  await expect(page.locator('.location-tag')).toHaveCount(0);
  await expect(page.locator('.reconstruction-label')).toHaveCount(0);
  await expect(page.locator('nav.scene-navigation')).toHaveAttribute('aria-label', '6 điểm nhìn');
  await ready(page);
  for (const id of ids) {
    await page.locator(`[data-scene="${id}"]`).click();
    await expect(page).toHaveURL(new RegExp(`#scene=${id}$`));
    await ready(page);
    await expect(page.locator(`[data-scene="${id}"]`)).toHaveAttribute('aria-current', 'location');
    const size = await page.locator('#scene-preview').evaluate((image: HTMLImageElement) => ({ width: image.naturalWidth, height: image.naturalHeight }));
    expect(size.width).toBeGreaterThanOrEqual(7000);
    expect(size.width).toBe(size.height * 2);
    await expect(page.locator('.introduction')).toHaveCount(0);
    await expect(page.locator('.reconstruction-label')).toHaveCount(0);
  }
  expect(errors).toEqual([]);
  const resolution = await page.locator('#panorama canvas').evaluate((canvas: HTMLCanvasElement) => ({ width: canvas.width, expected: Math.floor(canvas.clientWidth * devicePixelRatio) }));
  expect(resolution.width).toBeGreaterThanOrEqual(resolution.expected);
});

test('deep link and browser history restore selected viewpoint', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await expect(page.locator('#scene-title')).toHaveClass(/sr-only/);
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await page.locator('[data-scene="noi-thanh"]').click();
  await ready(page);
  await page.goBack();
  await expect(page.locator('#scene-title')).toHaveClass(/sr-only/);
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await ready(page);
});

test('source drawer separates historical evidence and interpretive details', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await page.locator('#scene-information').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#sources-panel')).toBeVisible();
  await expect(page.locator('#sources-panel')).toContainText('Cục Di sản');
  const links = await page.locator('#sources-panel a[href]').evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThanOrEqual(3);
  expect(links.every(url => url.startsWith('https://'))).toBe(true);
  await page.locator('#story-tab').click();
  await expect(page.locator('#story-panel')).toBeVisible();
  await expect(dialog).toContainText('vòm cuốn');
  await expect(dialog).toContainText('diễn họa');
  await expect(dialog).toContainText('tiểu thuyết');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#scene-information')).toBeFocused();
});

test('presentation and audio controls inside info dialog; presentation closes dialog', async ({ page }) => {
  await page.goto('./#scene=thach-han');
  await ready(page);
  await page.locator('#scene-information').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#ambience-button')).toHaveAttribute('aria-pressed', 'false');
  await dialog.locator('#presentation-button').click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('body')).toHaveClass(/presentation/);
  await expect(page.locator('#presentation-exit')).toBeVisible();
  await page.locator('#presentation-exit').click();
  await expect(page.locator('body')).not.toHaveClass(/presentation/);
});

test('missing panorama can retry and recover without trapping navigation', async ({ page }) => {
  await page.route('**/scenes/hao-thanh.webp?*', route => route.abort());
  await page.goto('./#scene=hao-thanh');
  await expect(page.locator('#viewer-error')).toBeVisible();
  await expect(page.locator('#scene-title')).toContainText('Hào');
  await page.unroute('**/scenes/hao-thanh.webp?*');
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

test('wide panoramas stay within GPU texture limits after turning and zooming', async ({ page }) => {
  const fixture = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1774;
    canvas.height = 887;
    const context = canvas.getContext('2d')!;
    context.fillStyle = '#ab6842';
    context.fillRect(0, 0, 887, 887);
    context.fillStyle = '#456b83';
    context.fillRect(887, 0, 887, 887);
    return canvas.toDataURL('image/png').split(',')[1];
  });
  await page.route('**/scenes/thach-han.webp?*', route => route.fulfill({ contentType: 'image/png', body: Buffer.from(fixture, 'base64') }));
  await page.addInitScript(() => {
    const uploads: { width: number; height: number }[] = [];
    Object.assign(window, { textureUploads: uploads });
    const getParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function (parameter) {
      return parameter === this.MAX_TEXTURE_SIZE ? 1024 : getParameter.call(this, parameter);
    };
    const upload = WebGLRenderingContext.prototype.texImage2D;
    WebGLRenderingContext.prototype.texImage2D = function (...args: unknown[]) {
      const image = args[5] as { width?: number; height?: number } | undefined;
      if (image?.width && image.height) uploads.push({ width: image.width, height: image.height });
      return Reflect.apply(upload, this, args);
    } as typeof upload;
  });
  await page.goto('./#scene=thach-han');
  await ready(page);
  await page.locator('#zoom-in').click();
  await page.locator('#panorama').focus();
  await page.keyboard.press('ArrowRight');
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  const uploads = await page.evaluate(() => (window as unknown as { textureUploads: { width: number; height: number }[] }).textureUploads);
  expect(uploads.filter(image => image.width === 887 && image.height === 887)).toHaveLength(2);
  expect(uploads.every(image => image.width <= 1024 && image.height <= 1024)).toBe(true);
});

test('responsive layout, image assets, and initial transfer budget', async ({ page }) => {
  await page.goto('./');
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

test('invalid hash during tour resets to valid first scene with working renderer', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await page.evaluate(() => {
    location.hash = '#scene=invalid-corrupted-hash';
  });
  await ready(page);
  await expect(page).toHaveURL(/#scene=thach-han$/);
  await expect(page.locator('#scene-title')).toHaveText('Bờ sông Thạch Hãn');
  await expect(page.locator('#panorama canvas')).toBeVisible();
  await page.evaluate(() => {
    location.hash = '';
  });
  await ready(page);
  await expect(page).toHaveURL(/#scene=thach-han$/);
  await expect(page.locator('#scene-title')).toHaveText('Bờ sông Thạch Hãn');
  await expect(page.locator('#panorama canvas')).toBeVisible();
});

test('compact info access reaches sources, AI disclosure, historical links, and 44px target', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  const infoButton = page.locator('#scene-information');
  const box = await infoButton.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  await infoButton.click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#sources-panel')).toBeVisible();
  await expect(page.locator('#sources-panel')).toContainText('Toàn bộ ảnh toàn cảnh do AI tạo');
  await expect(page.locator('#sources-panel')).toContainText('Đây không phải ảnh tư liệu');

  const links = await page.locator('#sources-panel a[href]').evaluateAll(nodes => nodes.map(n => (n as HTMLAnchorElement).href));
  expect(links.length).toBeGreaterThanOrEqual(3);
  expect(links.some(url => url.includes('dsvh.gov.vn') || url.includes('vnanet.vn') || url.includes('quangtri.gov.vn') || url.includes('vietnamtourism.vn'))).toBe(true);
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

test('archive map opens by keyboard with source, date limits and a loaded image', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  await page.locator('#scene-information').click();
  const summary = page.locator('.archive-map summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.archive-map')).toHaveAttribute('open', '');
  const map = page.locator('.archive-map img');
  await map.scrollIntoViewIfNeeded();
  await expect.poll(() => map.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1200);
  await expect(page.locator('.archive-map figcaption')).toContainText('1968');
  await expect(page.locator('.archive-map figcaption')).toContainText('không xác nhận nguyên trạng năm 1972');
  await expect(page.locator('.archive-map figure a')).toHaveAttribute('href', 'https://catalog.archives.gov/id/74797754');
  await page.keyboard.press('Escape');
  await expect(page.locator('#scene-information')).toBeFocused();
});

test('new scenes accessible via keyboard, story tab verification, and cyclic navigation wrapping', async ({ page }) => {
  await page.goto('./');
  await ready(page);

  await page.locator('#panorama').focus();
  await page.keyboard.press('4');
  await ready(page);
  await expect(page).toHaveURL(/#scene=luy-bac$/);
  await expect(page.locator('#scene-title')).toHaveText('Lũy đất phía Bắc');

  await page.locator('#panorama').focus();
  await page.keyboard.press('6');
  await ready(page);
  await expect(page).toHaveURL(/#scene=pho-cu$/);
  await expect(page.locator('#scene-title')).toHaveText('Phố sau chiến sự');

  await page.locator('#scene-information').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await page.locator('#story-tab').click();
  await expect(page.locator('#story-panel')).toBeVisible();
  await expect(page.locator('#story-panel')).toContainText('tháng 6–8/1972');
  await expect(page.locator('#story-panel')).toContainText('không phải ảnh tư liệu được tô màu');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();

  await page.locator('#next-scene').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=thach-han$/);
  await expect(page.locator('#scene-title')).toHaveText('Bờ sông Thạch Hãn');

  await page.locator('#previous-scene').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=pho-cu$/);
  await expect(page.locator('#scene-title')).toHaveText('Phố sau chiến sự');
});
