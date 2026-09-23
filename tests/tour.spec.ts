import { test, expect, type Page } from '@playwright/test';

const ids = ['thach-han', 'hao-thanh', 'cong-hau', 'luy-bac', 'noi-thanh', 'pho-cu'];
async function ready(page: Page) {
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#panorama canvas')).toBeVisible();
  await expect(page.locator('#viewer-error')).toBeHidden();
}

async function photoReady(page: Page) {
  await expect(page.locator('#photo-viewer')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#document-photo')).toBeVisible();
  await expect(page.locator('#panorama')).toBeHidden();
  await expect(page.locator('#viewer-error')).toBeHidden();
}

for (const [id, file] of [['quang-tri-south-1967', 'photographs/quang-tri-south-1967.jpg'], ['cong-hau', 'scenes/cong-hau.webp']]) {
  test(`a response arriving after timeout cannot reopen the failed scene: ${id}`, async ({ page }) => {
    await page.clock.install();
    let release!: () => void;
    const delayed = new Promise<void>(resolve => { release = resolve; });
    let intercepted!: () => void;
    const interceptedPromise = new Promise<void>(resolve => { intercepted = resolve; });
    const matcher = (url: URL) => url.pathname.endsWith(`/${file}`);
    await page.route(matcher, async route => {
      intercepted();
      await delayed;
      await route.continue();
    });
    await page.goto(`./#scene=${id}`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator(id === 'cong-hau' ? '#panorama' : '#photo-viewer')).toHaveAttribute('aria-busy', 'true');
    await interceptedPromise;
    await page.clock.fastForward(25001);
    await expect(page.locator('#viewer-error')).toBeVisible();
    const responsePromise = page.waitForResponse(result => {
      try {
        return matcher(new URL(result.url()));
      } catch {
        return false;
      }
    });
    release();
    const response = await responsePromise;
    expect(response.ok()).toBe(true);
    await response.finished();
    const responseUrl = response.url();
    await page.evaluate(async source => {
      const image = new Image();
      image.src = source;
      await image.decode();
      await new Promise(resolve => requestAnimationFrame(resolve));
    }, responseUrl);
    await expect(page.locator('#announcement')).not.toContainText('Đã mở');
    await expect(page.locator('#viewer-error')).toBeVisible();
    await expect(page.locator('#panorama canvas')).toHaveCount(0);
    await expect(page.locator('#photo-viewer')).toBeHidden();
    await page.unroute(matcher);
    await page.locator('#retry-button').click();
    if (id === 'cong-hau') await ready(page);
    else await photoReady(page);
  });
}

test('camera buttons look above, below and around without the removed book button', async ({ page }) => {
  await page.goto('./#scene=thach-han');
  await ready(page);
  await expect(page.locator('#scene-information')).toHaveCount(0);
  await expect(page.locator('.tour-ui')).not.toContainText('ảnh AI');
  const hotspot = page.locator('.scene-hotspot').first();
  for (const direction of ['up', 'down', 'left', 'right']) {
    const previous = await hotspot.getAttribute('style');
    await page.locator(`#look-${direction}`).click();
    await expect.poll(() => hotspot.getAttribute('style')).not.toBe(previous);
  }
  await page.locator('#reset-view').click();
  await expect(page.locator('#panorama canvas')).toBeVisible();
});

test('eras restore their selected scenes and links retain date and source attribution', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await expect(page.locator('#scene-date')).toContainText('1972');
  await page.locator('[data-era="present"]').click();
  await ready(page);
  await expect(page.locator('[data-era="present"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#scene-date')).toContainText('2018');
  expect(await page.locator('#scene-preview').evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])).toEqual([7096, 3548]);
  await page.locator('[data-scene="citadel-wall-2018-360"]').click();
  await ready(page);
  expect(await page.locator('#scene-preview').evaluate((image: HTMLImageElement) => [image.naturalWidth, image.naturalHeight])).toEqual([7096, 3548]);
  await page.locator('[data-era="past"]').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=cong-hau$/);
  await page.locator('[data-era="present"]').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=citadel-wall-2018-360$/);
  await page.locator('#scene-sources').click();
  await expect(page.locator('#sources-panel')).toContainText('Phương Huy');
  await expect(page.locator('#sources-panel')).toContainText('CC BY-SA 4.0');
  await expect(page.locator('#sources-panel')).toContainText('Phần ngoài khung ảnh là suy đoán');
  await page.keyboard.press('Escape');
  await page.goBack();
  await ready(page);
  await expect(page.locator('[data-era="past"]')).toHaveAttribute('aria-pressed', 'true');
});

test('archival photo can zoom, pan, reset and return to 360 without changing its date', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('./#scene=quang-tri-south-1967');
  await photoReady(page);
  await expect(page.locator('[data-collection="archive"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#scene-date')).toContainText('1967');
  await page.locator('#zoom-in').click();
  await page.locator('#zoom-in').click();
  const photo = page.locator('#photo-viewer');
  await expect.poll(async () => Number(await photo.getAttribute('data-scale'))).toBeGreaterThan(1);
  await page.locator('#look-right').click();
  await expect.poll(async () => Number(await photo.getAttribute('data-x'))).toBeLessThan(0);
  await page.locator('#reset-view').click();
  await expect(photo).toHaveAttribute('data-scale', '1');
  await expect(photo).toHaveAttribute('data-x', '0');
  await page.locator('#scene-sources').click();
  await expect(page.locator('#sources-panel')).toContainText('Sciacchitano');
  await expect(page.locator('#sources-panel a[href*="creativecommons.org"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-collection="panorama"]').click();
  await ready(page);
});

test('present album has six correctly dated photographs and recovers from a missing photo', async ({ page }) => {
  test.setTimeout(60000);
  await page.route('**/photographs/citadel-gate-2018.jpg', route => route.abort());
  await page.goto('./#scene=citadel-gate-2018');
  await expect(page.locator('#viewer-error')).toBeVisible();
  await page.unroute('**/photographs/citadel-gate-2018.jpg');
  await page.locator('#retry-button').click();
  await photoReady(page);
  await expect(page.locator('.scene-navigation')).toHaveAttribute('aria-label', '6 điểm nhìn');
  const items = await page.locator('[data-scene]').evaluateAll(buttons => buttons.map(button => (button as HTMLElement).dataset.scene!));
  for (const id of items) {
    await page.locator(`[data-scene="${id}"]`).click();
    await photoReady(page);
    expect(await page.locator('#document-photo').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(1000);
    await expect(page.locator('#scene-date')).toHaveText(/2016|2018|2025/);
  }
});

test('direct panorama entry, all viewpoints, and clean immersion', async ({ page }) => {
  test.setTimeout(60000);
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
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await page.locator('[data-scene="noi-thanh"]').click();
  await ready(page);
  await page.locator('#scene-sources').click();
  await page.locator('#story-tab').click();
  await page.goBack();
  await expect(page.locator('#scene-title')).toBeVisible();
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await expect(page.locator('#dialog-title')).toHaveText('Quanh Cổng Hậu');
  await page.keyboard.press('Escape');
  await ready(page);
});

test('source drawer separates historical evidence and interpretive details', async ({ page }) => {
  await page.goto('./#scene=cong-hau');
  await ready(page);
  await page.locator('#scene-sources').click();
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
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('#scene-sources')).toBeFocused();
});

test('closing the source drawer preserves a newly focused control', async ({ page }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  await photoReady(page);
  await page.locator('#scene-sources').click();
  await page.evaluate(() => new Promise<void>((resolve) => {
    const dialog = document.querySelector<HTMLDialogElement>('#information-dialog')!;
    const vrButton = document.querySelector<HTMLButtonElement>('[data-collection="panorama"]')!;
    dialog.addEventListener('close', () => resolve(), { once: true });
    dialog.querySelector<HTMLButtonElement>('.close-dialog')!.click();
    vrButton.focus();
  }));
  const vrButton = page.locator('[data-collection="panorama"]');
  await expect(vrButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(vrButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#information-dialog')).not.toBeVisible();
  await ready(page);
});

test('presentation and audio controls inside info dialog; presentation closes dialog', async ({ page }) => {
  await page.goto('./#scene=thach-han');
  await ready(page);
  await page.locator('#scene-sources').click();
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

test('responsive layout, image assets, and initial transfer budget', async ({ page, isMobile }) => {
  const captureLayouts = process.env.MUA_DO_CAPTURE_LAYOUTS === '1';
  if (captureLayouts) test.setTimeout(90000);
  await page.goto('./');
  await ready(page);
  const layout = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width + 1);
  const transfer = await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, e) => sum + (e as PerformanceResourceTiming).transferSize, 0));
  expect(transfer).toBeLessThan(5 * 1024 * 1024);
  const broken = await page.locator('img').evaluateAll(images => images.filter(el => el.complete && !el.naturalWidth).map(el => el.src));
  expect(broken).toEqual([]);
  if (!captureLayouts) {
    await page.screenshot({ path: `test-results/overview-${test.info().project.name}.png`, scale: 'css' });
    return;
  }
  for (const width of isMobile ? [320, 390, 430] : [1440]) {
    await page.setViewportSize({ width, height: isMobile ? 780 : 960 });
    for (const era of ['past', 'present']) {
      await page.locator(`[data-era="${era}"]`).click();
      await ready(page);
      const blockedControls = await page.locator('.era-switch button, .collection-switch button, .view-controls button, #scene-sources, .scene-step').evaluateAll(buttons => buttons.flatMap(button => {
        const box = button.getBoundingClientRect();
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2);
        return box.width < 43.9 || box.height < 43.9 || box.x < 0 || box.y < 0
          || box.right > innerWidth || box.bottom > innerHeight || !button.contains(hit)
          ? [button.id || button.getAttribute('aria-label') || button.textContent] : [];
      }));
      expect(blockedControls).toEqual([]);
      await page.screenshot({ path: `test-results/overview-${era}-${width}.png`, scale: 'css', animations: 'disabled' });
      if (width === 320 || !isMobile) {
        await page.locator('#scene-sources').click();
        const photo = page.locator('.photo-source figure img');
        if (await photo.count()) await expect.poll(async () => photo.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
        await page.screenshot({ path: `test-results/sources-${era}-${width}.png`, scale: 'css', animations: 'disabled' });
        await page.locator('#story-tab').click();
        await page.screenshot({ path: `test-results/story-${era}-${width}.png`, scale: 'css', animations: 'disabled' });
        await page.keyboard.press('Escape');
        if (era === 'past') {
          await page.locator('[data-collection="archive"]').click();
          await photoReady(page);
          await page.screenshot({ path: `test-results/album-${era}-${width}.png`, scale: 'css', animations: 'disabled' });
          await page.locator('[data-collection="panorama"]').click();
          await ready(page);
        }
      }
    }
  }
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

test('compact info access reaches historical sources with a 44px target', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  const infoButton = page.locator('#scene-sources');
  const box = await infoButton.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);

  await infoButton.click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#sources-panel')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/\bAI\b|AI.generated|made by AI/i);

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
  await page.locator('#scene-sources').click();
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
  await expect(page.locator('#scene-sources')).toBeFocused();
});

test('new scenes accessible via keyboard, story tab verification, and cyclic navigation wrapping', async ({ page }) => {
  test.setTimeout(60000);
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

  await page.locator('#scene-sources').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await page.locator('#story-tab').click();
  await expect(page.locator('#story-panel')).toBeVisible();
  await expect(page.locator('#story-panel')).toContainText('đường Quang Trung');
  await expect(page.locator('#story-panel')).toContainText('Government of Vietnam Photo');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();

  await page.locator('#next-scene').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=thach-han$/);
  await expect(page.locator('#scene-title')).toHaveText('Bờ sông Thạch Hãn');

  await page.locator('#previous-scene').click();
  await ready(page);
  await expect(page).toHaveURL(/#scene=pho-cu$/);
});

test('archival photo viewer gestures update rendered geometry and presentation fills viewport', async ({ page, isMobile }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  await photoReady(page);

  const viewer = page.locator('#photo-viewer');
  const image = page.locator('#document-photo');

  const getGeometry = async () => {
    return image.evaluate((el: HTMLImageElement) => {
      const rect = el.getBoundingClientRect();
      const styleTransform = el.style.transform;
      const computedTransform = getComputedStyle(el).transform;
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        styleTransform,
        computedTransform,
      };
    });
  };

  const initialGeometry = await getGeometry();

  const viewerBox = await viewer.boundingBox();
  expect(viewerBox).not.toBeNull();
  const centerX = Math.round(viewerBox!.x + viewerBox!.width / 2);
  const centerY = Math.round(viewerBox!.y + viewerBox!.height / 2);

  if (isMobile) {
    const client = await page.context().newCDPSession(page);
    // Two-finger pinch to zoom in with stable unique touch identifiers
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: centerX - 25, y: centerY, id: 1 },
        { x: centerX + 25, y: centerY, id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: centerX - 80, y: centerY, id: 1 },
        { x: centerX + 80, y: centerY, id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(async () => {
      const current = await getGeometry();
      return current.computedTransform;
    }).not.toEqual(initialGeometry.computedTransform);

    const postZoomGeometry = await getGeometry();
    expect(postZoomGeometry.width).toBeGreaterThan(initialGeometry.width);

    // One-finger drag to pan
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: centerX, y: centerY, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: centerX - 60, y: centerY - 40, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(async () => {
      const current = await getGeometry();
      return current.computedTransform;
    }).not.toEqual(postZoomGeometry.computedTransform);

    const postDragGeometry = await getGeometry();
    const hasMoved = Math.abs(postDragGeometry.left - postZoomGeometry.left) > 1 || Math.abs(postDragGeometry.top - postZoomGeometry.top) > 1;
    expect(hasMoved).toBe(true);
  } else {
    // Desktop mouse wheel zoom
    await page.mouse.move(centerX, centerY);
    await page.mouse.wheel(0, -200);

    await expect.poll(async () => {
      const current = await getGeometry();
      return current.computedTransform;
    }).not.toEqual(initialGeometry.computedTransform);

    const postZoomGeometry = await getGeometry();
    expect(postZoomGeometry.width).toBeGreaterThan(initialGeometry.width);

    // Desktop mouse drag to pan
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    await page.mouse.move(centerX - 60, centerY - 40, { steps: 6 });
    await page.mouse.up();

    await expect.poll(async () => {
      const current = await getGeometry();
      return current.computedTransform;
    }).not.toEqual(postZoomGeometry.computedTransform);

    const postDragGeometry = await getGeometry();
    const hasMoved = Math.abs(postDragGeometry.left - postZoomGeometry.left) > 1 || Math.abs(postDragGeometry.top - postZoomGeometry.top) > 1;
    expect(hasMoved).toBe(true);
  }

  // Reset restores rendered geometry
  await page.locator('#reset-view').click();
  await expect.poll(async () => {
    const current = await getGeometry();
    return current.computedTransform;
  }).toEqual(initialGeometry.computedTransform);
  const resetGeometry = await getGeometry();
  expect(Math.round(resetGeometry.width)).toEqual(Math.round(initialGeometry.width));
  expect(Math.round(resetGeometry.height)).toEqual(Math.round(initialGeometry.height));
  expect(Math.round(resetGeometry.left)).toEqual(Math.round(initialGeometry.left));
  expect(Math.round(resetGeometry.top)).toEqual(Math.round(initialGeometry.top));

  // Enter presentation using existing interface (#scene-sources -> #presentation-button)
  await page.locator('#scene-sources').click();
  const dialog = page.locator('#information-dialog');
  await expect(dialog).toBeVisible();
  await dialog.locator('#presentation-button').click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('body')).toHaveClass(/presentation/);

  // Assert photo-viewer fills viewport
  const viewport = page.viewportSize()!;
  await expect.poll(async () => {
    const box = await viewer.boundingBox();
    return box ? { x: Math.round(box.x), y: Math.round(box.y), width: Math.round(box.width), height: Math.round(box.height) } : null;
  }).toEqual({ x: 0, y: 0, width: viewport.width, height: viewport.height });

  // Exit presentation
  await expect(page.locator('#presentation-exit')).toBeVisible();
  await page.locator('#presentation-exit').click();
  await expect(page.locator('body')).not.toHaveClass(/presentation/);
});
