import { test, expect } from '@playwright/test';

test('interface refresh: folding the filmstrip frees the photo and retains navigation and focus', async ({ page }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  const photo = page.locator('#photo-viewer');
  await expect(photo).toHaveAttribute('aria-busy', 'false');
  const initialHeight = (await photo.boundingBox())!.height;
  const toggle = page.locator('#scene-list-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#scene-list')).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect.poll(async () => (await photo.boundingBox())!.height).toBeGreaterThan(initialHeight + 50);
  await page.keyboard.press('2');
  await expect(photo).toHaveAttribute('aria-busy', 'false');
  await expect(page).toHaveURL(/scene=quang-tri-northeast-1967/);
  await page.keyboard.press('Enter');
  await expect(page.locator('#scene-list')).toBeVisible();
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
    return route.fulfill({ contentType: 'text/html', body: '<body style="margin:0;background:#141613;color:#eee;height:100vh;display:grid;place-items:center;font:18px Georgia"><p>Canva · test fixture</p><input aria-label="Slide note" /></body>' });
  });
  await page.goto('./#scene=citadel-gate-2018&view=slides&layout=split');
  const split = page.getByRole('button', { name: 'Split-view', exact: true });
  await expect(split).toBeVisible();
  const frame = page.frameLocator('#slides-frame');
  await frame.getByRole('textbox').fill('Retain this slide');
  const divider = page.getByRole('separator', { name: 'Chia diện tích bài chiếu và cảnh' });
  const stage = page.locator('.slides-stage');
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 780 }]) {
    await page.setViewportSize(viewport);
    const stacked = viewport.width < 900;
    await expect(divider).toHaveAttribute('aria-orientation', stacked ? 'horizontal' : 'vertical');
    await divider.focus();
    await page.keyboard.press('Enter');
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
