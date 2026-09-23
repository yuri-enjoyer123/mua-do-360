import { test, expect, type Page } from '@playwright/test';
import { createHash } from 'node:crypto';

const viewDigest = async (page: Page) => createHash('sha256').update(await page.locator('#panorama canvas').screenshot()).digest('hex');

async function openView(page: Page) {
  await page.goto('./#scene=cong-hau');
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#panorama canvas')).toBeVisible();
}

test('immersive view opens from the scene and stops rotation when leaving', async ({ page }) => {
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await expect(page.locator('.era-switch')).not.toBeVisible();
  await expect(page.locator('#presentation-tools')).toBeVisible();
  const rotate = page.locator('#rotate-button');
  await expect(rotate).toHaveAttribute('aria-pressed', 'false');
  await rotate.click();
  await expect(rotate).toHaveAttribute('aria-pressed', 'true');
  const before = await viewDigest(page);
  await expect.poll(() => viewDigest(page)).not.toBe(before);
  await page.keyboard.press('Escape');
  await expect(page.locator('.era-switch')).toBeVisible();
  await expect(rotate).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#panorama')).toBeFocused();
});

test('scene transition retains the previous view while loading and clears on error', async ({ page }) => {
  await openView(page);
  let release!: () => void;
  const pending = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/scenes/luy-bac.webp*', async route => {
    await pending;
    await route.abort();
  });
  await page.locator('[data-scene="luy-bac"]').click();
  await expect(page.locator('#scene-transition')).toBeVisible();
  const imageRange = await page.locator('#scene-transition').evaluate(async element => {
    const image = new Image();
    image.src = (element as HTMLElement).style.backgroundImage.slice(5, -2);
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 16;
    const context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, 16, 16);
    const pixels = context.getImageData(0, 0, 16, 16).data;
    const red = Array.from(pixels).filter((_, index) => index % 4 === 0);
    return Math.max(...red) - Math.min(...red);
  });
  expect(imageRange).toBeGreaterThan(20);
  await expect(page.locator('#viewer-status')).toBeVisible();
  release();
  await expect(page.locator('#viewer-error')).toBeVisible();
  await expect(page.locator('#scene-transition')).toBeHidden();
  await page.locator('[data-era="present"]').click();
  await expect(page.locator('#scene-transition')).toBeHidden();
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
});

test('reduced motion keeps transitions immediate and automatic rotation off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await expect(page.locator('#rotate-button')).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.locator('[data-scene="luy-bac"]').click();
  await expect(page.locator('#scene-transition')).toBeHidden();
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  expect(await page.locator('#panorama').evaluate(el => el.getAnimations().length)).toBe(0);
});

test('album uses the same immersive controls without panorama-only actions', async ({ page }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  await expect(page.locator('#photo-viewer')).toHaveAttribute('aria-busy', 'false');
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await expect(page.locator('#rotate-button')).toBeHidden();
  await expect(page.locator('#device-look-button')).toBeHidden();
  await expect(page.locator('#ambient-quick-button')).toBeVisible();
  const rect = await page.locator('#photo-viewer').boundingBox();
  expect(rect?.x).toBe(0);
  expect(rect?.y).toBe(0);
  await page.locator('#presentation-exit').click();
  await expect(page.locator('.era-switch')).toBeVisible();
});

test('ambient sound follows the scene and both sound buttons stay in sync', async ({ page }) => {
  await page.addInitScript(() => {
    const filters: BiquadFilterNode[] = [];
    (window as unknown as { sceneFilters: BiquadFilterNode[] }).sceneFilters = filters;
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {
      createBiquadFilter() {
        const filter = super.createBiquadFilter();
        filters.push(filter);
        return filter;
      }
    };
  });
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await page.locator('#ambient-quick-button').click();
  const frequency = () => page.evaluate(() => (window as unknown as { sceneFilters: BiquadFilterNode[] }).sceneFilters[0]?.frequency.value);
  await expect.poll(frequency).toBeGreaterThan(0);
  const before = await frequency();
  await page.keyboard.press('1');
  await expect(page).toHaveURL(/#scene=thach-han$/);
  await expect.poll(frequency).toBeGreaterThan(before * 1.4);
  await page.keyboard.press('Escape');
  await page.locator('#scene-sources').click();
  await expect(page.locator('#ambience-button')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#ambience-button').click();
  await expect(page.locator('#ambient-quick-button')).toHaveAttribute('aria-pressed', 'false');
});

test('phone orientation moves the view only after opting in', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone sensor control');
  await page.addInitScript(() => {
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { value: () => Promise.resolve('granted') });
  });
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  const device = page.locator('#device-look-button');
  await device.click();
  await expect(device).toHaveAttribute('aria-busy', 'false');
  await expect(device).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 0, beta: 90, gamma: 0 })));
  await expect(page.locator('#motion-feedback')).toBeHidden();
  const before = await viewDigest(page);
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 20, beta: 105, gamma: 0 })));
  await expect.poll(() => viewDigest(page)).not.toBe(before);
  await page.keyboard.press('Escape');
  await expect(device).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => window.dispatchEvent(new DeviceOrientationEvent('deviceorientation', { alpha: 80, beta: 90, gamma: 0 })));
  await expect(page.locator('.era-switch')).toBeVisible();
});

test('denied phone permission leaves dragging available and reports the outcome', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone permission flow');
  await page.addInitScript(() => {
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { value: () => Promise.resolve('denied') });
  });
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await page.locator('#device-look-button').click();
  await expect(page.locator('#device-look-button')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#motion-feedback')).toContainText('Chưa được phép');
  await expect(page.locator('#panorama canvas')).toBeVisible();
});

test('leaving immersive view cancels a pending sensor permission', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Phone permission flow');
  await page.addInitScript(() => {
    const permission = new Promise<string>(resolve => {
      (window as unknown as { grantMotion: () => void }).grantMotion = () => resolve('granted');
    });
    Object.defineProperty(DeviceOrientationEvent, 'requestPermission', { value: () => permission });
  });
  await openView(page);
  await page.getByRole('button', { name: 'Ngắm cảnh', exact: true }).click();
  await page.locator('#device-look-button').click();
  await expect(page.locator('#device-look-button')).toHaveAttribute('aria-busy', 'true');
  await page.keyboard.press('Escape');
  await page.evaluate(() => (window as unknown as { grantMotion: () => void }).grantMotion());
  await expect(page.locator('#device-look-button')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#motion-feedback')).toBeHidden();
  await expect(page.locator('#panorama')).toBeFocused();
});
