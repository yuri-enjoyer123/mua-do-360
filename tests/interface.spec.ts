import { test, expect } from '@playwright/test';

test('interface refresh: hotspot arrows follow the camera without changing their destinations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#scene=hao-thanh');
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  const previous = page.getByRole('button', { name: 'Chuyển điểm: Điểm trước: Bờ sông' });
  const next = page.getByRole('button', { name: 'Chuyển điểm: Điểm tiếp: Cổng Hậu' });
  const horizontalDirection = (button: typeof previous) => button.locator('svg').evaluate(element => new DOMMatrixReadOnly(getComputedStyle(element).transform).a);
  await expect.poll(() => horizontalDirection(previous)).toBe(-1);
  await expect.poll(() => horizontalDirection(next)).toBe(1);
  await page.locator('#look-left').click();
  await page.locator('#look-left').click();
  await expect.poll(() => horizontalDirection(previous)).toBe(1);
  await page.locator('#reset-view').click();
  await expect.poll(() => horizontalDirection(previous)).toBe(-1);
  await next.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/scene=cong-hau/);
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await expect.poll(() => horizontalDirection(page.getByRole('button', { name: 'Chuyển điểm: Điểm trước: Hào thành' }))).toBe(-1);
});

test.describe('present camera', () => {
  test.use({ deviceScaleFactor: 1 });
  test('interface refresh: present views keep a bounded field when resized or used in Split-view', async ({ page }, testInfo) => {
    test.setTimeout(90000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://www.canva.com/**', route => route.fulfill({ contentType: 'text/html', body: '<p>Presentation fixture</p>' }));
    await page.addInitScript(() => {
      let engine: { viewer: (...args: unknown[]) => unknown };
      Object.defineProperty(window, 'pannellum', {
        configurable: true,
        get: () => engine,
        set(value) {
          engine = value;
          const create = engine.viewer;
          engine.viewer = (...args: unknown[]) => {
            const viewer = create(...args);
            Object.assign(window, { testViewer: viewer });
            return viewer;
          };
        },
      });
    });
    const longField = () => page.evaluate(() => {
      const viewer = (window as unknown as { testViewer: { getHfov(): number } }).testViewer;
      const view = document.querySelector<HTMLElement>('.experience')!;
      return 2 * Math.atan(Math.tan(viewer.getHfov() * Math.PI / 360) / Math.min(1, view.clientWidth / view.clientHeight)) * 180 / Math.PI;
    });
    await page.goto('./#scene=citadel-gate-2018-360');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
    for (const viewport of [{ width: 390, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 960 }]) {
      await page.setViewportSize(viewport);
      await page.locator('#reset-view').click();
      await expect.poll(longField).toBeCloseTo(95, 1);
      await page.locator('#zoom-out').click();
      await page.locator('#zoom-out').click();
      await expect.poll(longField).toBeLessThanOrEqual(100.01);
    }
    await page.locator('#slides-button').click();
    await page.locator('#slides-split').click();
    await expect.poll(longField).toBeLessThanOrEqual(100.01);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect.poll(longField).toBeLessThanOrEqual(100.01);
    await page.locator('#reset-view').click();
    await expect.poll(longField).toBeCloseTo(95, 1);
    await page.locator('#slides-close').click();
    await expect.poll(longField).toBeCloseTo(95, 1);

    if (process.env.MUA_DO_CAPTURE_LAYOUTS === '1') {
      await page.setViewportSize({ width: 960, height: 640 });
      for (const scene of ['citadel-gate-2018-360', 'citadel-wall-2018-360']) {
        await page.locator(`[data-scene="${scene}"]`).click();
        await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
        for (const [name, yaw, pitch] of [['front', 0, 0], ['right', 90, 0], ['back', 180, 0], ['down', 0, -35]] as const) {
          await page.evaluate(({ yaw, pitch }) => {
            (window as unknown as { testViewer: { lookAt(pitch: number, yaw: number, hfov: number, duration: number): void } }).testViewer.lookAt(pitch, yaw, 85, 0);
          }, { yaw, pitch });
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          await page.locator('#panorama').screenshot({ path: testInfo.outputPath(`${scene}-${name}.png`), scale: 'css' });
        }
      }
    }
  });
});

test('interface refresh: folding the filmstrip frees the photo and retains navigation and focus', async ({ page }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  const photo = page.locator('#photo-viewer');
  await expect(photo).toHaveAttribute('aria-busy', 'false');
  const initialHeight = (await photo.boundingBox())!.height;
  const toggle = page.locator('#scene-list-toggle');
  await expect(toggle).toHaveText('Ẩn');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toHaveText('Hiện');
  await expect(toggle).toHaveAccessibleName('Hiện dải ảnh');
  await expect(page.locator('#scene-list')).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect.poll(async () => (await photo.boundingBox())!.height).toBeGreaterThan(initialHeight + 50);
  await page.keyboard.press('2');
  await expect(photo).toHaveAttribute('aria-busy', 'false');
  await expect(page).toHaveURL(/scene=quang-tri-northeast-1967/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#scene-list')).toBeVisible();
  await expect(toggle).toHaveText('Ẩn');
  await expect(page.locator('[aria-current="location"]')).toHaveAttribute('data-scene', 'quang-tri-northeast-1967');
  await page.locator('#scene-sources').click();
  await page.locator('[data-open="help"]').click();
  const close = page.locator('#help-dialog .close-dialog');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#scene-sources')).toBeFocused();
});

test('interface refresh: Split-view resizes with keyboard and pointer without reloading Canva', async ({ page }, testInfo) => {
  let requests = 0;
  await page.route('https://www.canva.com/**', route => {
    requests++;
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<body style="margin:0;background:#141613;color:#eee;height:100vh;display:grid;place-items:center;font:18px Georgia"><p>Canva · test fixture</p><input aria-label="Slide note" /></body>' });
  });
  await page.goto('./#scene=citadel-gate-2018&view=slides&layout=split');
  const split = page.getByRole('button', { name: 'Split-view', exact: true });
  await expect(split).toBeVisible();
  const frame = page.frameLocator('#slides-frame');
  await frame.getByRole('textbox').fill('Retain this slide');
  const divider = page.getByRole('separator', { name: 'Chia diện tích bài chiếu và cảnh' });
  const stage = page.locator('.slides-stage');
  for (const viewport of [{ width: 1440, height: 960 }, { width: 640, height: 390 }, { width: 390, height: 780 }]) {
    await page.setViewportSize(viewport);
    const stacked = viewport.width < 600 || viewport.width < 900 && viewport.height > 500;
    await expect(divider).toHaveAttribute('aria-orientation', stacked ? 'horizontal' : 'vertical');
    await divider.focus();
    await page.keyboard.press('Home');
    const before = (await stage.boundingBox())!;
    await page.keyboard.press(stacked ? 'ArrowDown' : 'ArrowRight');
    await expect.poll(async () => {
      const box = (await stage.boundingBox())!;
      return stacked ? box.height - before.height : box.width - before.width;
    }).toBeGreaterThan(15);
    const handle = (await divider.boundingBox())!;
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    const oldRatio = Number(await divider.getAttribute('aria-valuenow'));
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x - (stacked ? 0 : 80), y - (stacked ? 60 : 0), { steps: 4 });
    await page.mouse.up();
    expect(Number(await divider.getAttribute('aria-valuenow'))).toBeLessThan(oldRatio);
    await divider.focus();
    await page.keyboard.press('End');
    expect(Number(await divider.getAttribute('aria-valuenow'))).toBe(Number(await divider.getAttribute('aria-valuemax')));
    for (const id of ['slides-scene-select', 'slides-return', 'slides-sources', 'zoom-in', 'reset-view']) {
      const bounds = (await page.locator(`#${id}`).boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    await page.keyboard.press('Enter');
    await expect(frame.getByRole('textbox')).toHaveValue('Retain this slide');
    if (process.env.MUA_DO_CAPTURE_LAYOUTS === '1') await page.screenshot({ path: testInfo.outputPath(`split-photo-${viewport.width}.png`), scale: 'css' });
  }
  await split.click();
  await expect(split).toHaveText('Split-view');
  await expect(divider).toBeHidden();
  await split.click();
  await expect(split).toHaveText('Split-view');
  await expect(frame.getByRole('textbox')).toHaveValue('Retain this slide');
  expect(requests).toBe(1);
});

test('interface refresh: reduced motion disables decorative movement in both eras', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./#scene=cong-hau');
  for (const era of ['past', 'present']) {
    await page.locator(`[data-era="${era}"]`).click();
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
    expect(await page.locator('.tour-ui').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
    await page.locator('#scene-sources').click();
    await expect(page.locator('#information-dialog')).toBeVisible();
    const duration = await page.locator('#information-dialog').evaluate(element => parseFloat(getComputedStyle(element).animationDuration));
    expect(duration).toBeLessThan(0.01);
    await page.keyboard.press('Escape');
  }
});
