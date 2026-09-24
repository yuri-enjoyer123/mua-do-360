import { test, expect, type Page } from '@playwright/test';

const CANVA_EMBED_URL = 'https://www.canva.com/design/DAHWALcziLU/-vKYtAmPvSmY13YbW3QgZg/view?embed';
const CANVA_VIEW_URL = 'https://www.canva.com/design/DAHWALcziLU/-vKYtAmPvSmY13YbW3QgZg/view';

const MOCK_CANVA_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Canva Embed Test Fixture</title>
  </head>
  <body style="margin:0;padding:16px;background:#0d1117;color:#c9d1d9;font-family:sans-serif;">
    <main data-testid="canva-fixture-root">
      <h1 style="font-size:18px;margin:0 0 12px">Canva test fixture</h1>
      <p>Retained state counter: <span id="counter-value">0</span></p>
      <button id="counter-button" type="button">Increment counter</button>
    </main>
    <script>
      let count = 0;
      const counterEl = document.getElementById('counter-value');
      document.getElementById('counter-button').addEventListener('click', () => {
        count += 1;
        counterEl.textContent = String(count);
      });
    </script>
  </body>
</html>`;

function disableNativeFullscreen(page: Page) {
  return page.addInitScript(() => {
    Element.prototype.requestFullscreen = async () => {
      throw new DOMException('Native fullscreen disabled in test suite', 'NotAllowedError');
    };
  });
}

function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
  tolerance = 0.5,
) {
  return (
    a.x < b.x + b.width - tolerance &&
    a.x + a.width - tolerance > b.x &&
    a.y < b.y + b.height - tolerance &&
    a.y + a.height - tolerance > b.y
  );
}

test.describe('Canva workspace', () => {
  test.setTimeout(60000);

  test('retains the slide while exploring scenes and reading their sources', async ({ page }) => {
    await disableNativeFullscreen(page);

    let iframeRequestCount = 0;
    await page.route(CANVA_EMBED_URL, async route => {
      iframeRequestCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_CANVA_HTML,
      });
    });

    await page.goto('./#scene=cong-hau');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

    const slidesButton = page.locator('#slides-button');
    const slidesDialog = page.locator('#slides-dialog');
    const slidesSplit = page.locator('#slides-split');
    const slidesTour = page.locator('#slides-tour');
    const slidesFrame = page.locator('#slides-frame');
    const iframe = page.frameLocator('#slides-frame');
    const counterBtn = iframe.locator('#counter-button');
    const counterVal = iframe.locator('#counter-value');

    await slidesButton.click();
    await expect(slidesDialog).toHaveAttribute('open', '');
    await expect(counterVal).toHaveText('0');
    expect(iframeRequestCount).toBe(1);

    await slidesSplit.click();
    await expect(slidesSplit).toHaveAttribute('aria-pressed', 'true');
    await expect(slidesTour).toBeVisible();

    await counterBtn.click();
    await expect(counterVal).toHaveText('1');
    await counterBtn.click();
    await expect(counterVal).toHaveText('2');

    await slidesSplit.click();
    await expect(slidesSplit).toHaveAttribute('aria-pressed', 'false');
    await expect(slidesTour).toBeHidden();

    await slidesSplit.click();
    await expect(slidesSplit).toHaveAttribute('aria-pressed', 'true');
    await expect(slidesTour).toBeVisible();
    await expect(counterVal).toHaveText('2');
    expect(iframeRequestCount).toBe(1);

    const sceneSelect = page.locator('#slides-scene-select');
    await sceneSelect.selectOption('citadel-gate-2018-360');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#slides-scene-host #panorama canvas')).toBeVisible();

    await expect(page.locator('#scene-title')).toHaveText('Cổng Thành cổ');

    const slidesSources = page.locator('#slides-sources');
    await slidesSources.click();

    const infoDialog = page.locator('#information-dialog');
    await expect(infoDialog).toBeVisible();
    await expect(page.locator('#sources-panel')).toBeVisible();
    await expect(page.locator('#sources-panel')).toContainText('Phương Huy');
    await expect(page.locator('#sources-panel')).toContainText('Cổng Thành cổ');

    await infoDialog.locator('.close-dialog').click();
    await expect(infoDialog).not.toBeVisible();

    const isInSlidesHost = await page.evaluate(() => {
      const exp = document.querySelector('.experience');
      const host = document.getElementById('slides-scene-host');
      return Boolean(host && exp && host.contains(exp));
    });
    expect(isInSlidesHost).toBe(true);

    await page.locator('#slides-return').click();
    await expect(slidesDialog).not.toHaveAttribute('open', '');
    await expect(slidesFrame).not.toHaveAttribute('src');

    const isUnderApp = await page.evaluate(() => {
      const app = document.getElementById('app');
      const exp = document.querySelector('.experience');
      return exp?.parentElement === app;
    });
    expect(isUnderApp).toBe(true);

    await expect(page.locator('#scene-title')).toHaveText('Cổng Thành cổ');
    expect(page.url()).toContain('scene=citadel-gate-2018-360');
  });

  test('supports browser history, direct links and sharing', async ({ page }) => {
    await disableNativeFullscreen(page);

    await page.route(CANVA_EMBED_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_CANVA_HTML,
      });
    });

    await page.goto('./#scene=cong-hau');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

    const slidesButton = page.locator('#slides-button');
    const slidesDialog = page.locator('#slides-dialog');

    await slidesButton.click();
    await expect(slidesDialog).toHaveAttribute('open', '');
    await expect(page).toHaveURL(/view=slides/);

    await page.goBack();
    await expect(slidesDialog).not.toHaveAttribute('open', '');
    expect(page.url()).not.toContain('view=slides');

    await page.goForward();
    await expect(slidesDialog).toHaveAttribute('open', '');
    expect(page.url()).toContain('view=slides');

    await page.goto('./#scene=cong-hau&view=slides&layout=split');
    await expect(slidesDialog).toHaveAttribute('open', '');
    await expect(page.locator('#slides-split')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#slides-tour')).toBeVisible();

    const isFullscreen = await page.evaluate(() => document.fullscreenElement !== null);
    expect(isFullscreen).toBe(false);

    await page.evaluate(() => {
      (window as unknown as { __copiedText?: string }).__copiedText = '';
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as unknown as { __copiedText?: string }).__copiedText = text;
          },
          readText: async () => (window as unknown as { __copiedText?: string }).__copiedText || '',
        },
      });
    });

    const menuSummary = page.locator('#slides-menu summary');
    const menu = page.locator('#slides-menu');
    await menuSummary.click();
    await expect(menu).toHaveAttribute('open', '');

    const shareButton = page.locator('#slides-share');
    await shareButton.click();

    await expect(menu).not.toHaveAttribute('open', '');
    const feedback = page.locator('#slides-feedback');
    await expect(feedback).toBeVisible();
    await expect(feedback).toHaveText('Đã sao chép liên kết');

    const copiedText = await page.evaluate(() => (window as unknown as { __copiedText?: string }).__copiedText);
    expect(copiedText).toBe(page.url());
    expect(copiedText).toContain('scene=cong-hau');
    expect(copiedText).toContain('view=slides');
    expect(copiedText).toContain('layout=split');
  });

  test('keeps photo zoom and restores immersive viewing after the presentation', async ({ page }) => {
    await disableNativeFullscreen(page);
    await page.route(CANVA_EMBED_URL, route => route.fulfill({ contentType: 'text/html', body: MOCK_CANVA_HTML }));
    await page.goto('./#scene=quang-tri-south-1967');
    const photo = page.locator('#photo-viewer');
    await expect(photo).toHaveAttribute('aria-busy', 'false');
    await page.locator('#zoom-in').click();
    await page.locator('#zoom-in').click();
    const scale = await photo.getAttribute('data-scale');
    expect(Number(scale)).toBeGreaterThan(1);
    await page.locator('#immersive-button').click();
    await page.keyboard.press('s');
    await expect(page.locator('#slides-dialog')).toBeVisible();
    await page.locator('#slides-split').click();
    await expect(photo).toHaveAttribute('data-scale', scale!);
    await expect(page.locator('#look-up')).toBeHidden();
    await page.locator('#zoom-in').click();
    const zoomedScale = await photo.getAttribute('data-scale');
    expect(Number(zoomedScale)).toBeGreaterThan(Number(scale));
    await page.locator('#slides-return').click();
    await expect(page.locator('#slides-dialog')).not.toBeVisible();
    await expect(photo).toHaveAttribute('data-scale', zoomedScale!);
    await expect(page.locator('body')).toHaveClass(/presentation/);
    await expect(page.locator('#presentation-exit')).toBeFocused();
  });

  test('offers a retry and external link when the embed stalls', async ({ page }) => {
    await disableNativeFullscreen(page);

    let releaseEmbedRoute!: () => void;
    const holdEmbedPromise = new Promise<void>(resolve => {
      releaseEmbedRoute = resolve;
    });

    let embedRequestAttempts = 0;
    await page.route(CANVA_EMBED_URL, async route => {
      embedRequestAttempts += 1;
      if (embedRequestAttempts === 1) {
        await holdEmbedPromise;
        await route.fulfill({
          status: 200,
          contentType: 'text/html; charset=utf-8',
          body: MOCK_CANVA_HTML,
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/html; charset=utf-8',
          body: MOCK_CANVA_HTML,
        });
      }
    });

    await page.goto('./#scene=cong-hau');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

    await page.clock.install();

    const slidesButton = page.locator('#slides-button');
    await slidesButton.click();

    const slidesDialog = page.locator('#slides-dialog');
    await expect(slidesDialog).toHaveAttribute('open', '');
    const slidesFrame = page.locator('#slides-frame');
    await expect(slidesFrame).toHaveAttribute('aria-busy', 'true');

    await page.clock.fastForward(12001);

    const retryStatus = page.locator('#slides-retry-status');
    await expect(retryStatus).toBeVisible();
    await expect(page.locator('#slides-loading-text')).toHaveText('Bài chiếu tải lâu hơn bình thường.');

    const menuSummary = page.locator('#slides-menu summary');
    await menuSummary.click();
    const slidesExternal = page.locator('#slides-external');
    await expect(slidesExternal).toBeVisible();
    await expect(slidesExternal).toHaveAttribute('href', CANVA_VIEW_URL);
    await expect(slidesExternal).toHaveAttribute('target', '_blank');

    releaseEmbedRoute();
    await expect(page.frameLocator('#slides-frame').getByTestId('canva-fixture-root')).toBeVisible();

    const toolbarRetry = page.locator('#slides-retry');
    await toolbarRetry.click();

    const iframe = page.frameLocator('#slides-frame');
    await expect(iframe.getByTestId('canva-fixture-root')).toBeVisible();
    await expect(page.locator('#slides-loading')).toBeHidden();
    await expect(slidesFrame).toHaveAttribute('aria-busy', 'false');
    expect(embedRequestAttempts).toBe(2);
  });

  test('fits phone and desktop layouts without restarting the slides', async ({ page }, testInfo) => {
    await disableNativeFullscreen(page);

    await page.route(CANVA_EMBED_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_CANVA_HTML,
      });
    });

    const viewports = [
      { width: 320, height: 568, name: '320x568' },
      { width: 800, height: 390, name: '800x390' },
      { width: 1440, height: 960, name: '1440x960' },
    ];

    await page.goto('./#scene=cong-hau&view=slides&layout=split');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
    const iframe = page.frameLocator('#slides-frame');
    const counterVal = iframe.locator('#counter-value');
    await iframe.locator('#counter-button').click();
    await expect(counterVal).toHaveText('1');
    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const slidesDialog = page.locator('#slides-dialog');
      await expect(slidesDialog).toHaveAttribute('open', '');
      await expect(page.locator('#slides-split')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#slides-tour')).toBeVisible();

      await expect(counterVal).toHaveText('1');

      const splitBtn = page.locator('#slides-split');
      const closeBtn = page.locator('#slides-close');
      const sceneSelect = page.locator('#slides-scene-select');
      const returnBtn = page.locator('#slides-return');

      for (const ctrl of [splitBtn, closeBtn, sceneSelect, returnBtn]) {
        await expect(ctrl).toBeVisible();
        const box = (await ctrl.boundingBox())!;
        expect(box).not.toBeNull();
        expect(box.height).toBeGreaterThanOrEqual(43.9);
        expect(box.width).toBeGreaterThanOrEqual(43.9);
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(vp.height + 1);
      }

      const stage = page.locator('.slides-stage');
      const sceneHost = page.locator('#slides-scene-host');
      await expect(stage).toBeVisible();
      await expect(sceneHost).toBeVisible();

      const stageBox = (await stage.boundingBox())!;
      const hostBox = (await sceneHost.boundingBox())!;

      expect(stageBox.width).toBeGreaterThan(0);
      expect(stageBox.height).toBeGreaterThan(0);
      expect(hostBox.width).toBeGreaterThan(0);
      expect(hostBox.height).toBeGreaterThan(0);

      expect(overlaps(stageBox, hostBox)).toBe(false);

      const dialogBox = (await slidesDialog.boundingBox())!;
      expect(dialogBox.width).toBeLessThanOrEqual(vp.width + 1);
      expect(dialogBox.height).toBeLessThanOrEqual(vp.height + 1);

      await page.setViewportSize({ width: vp.width + 40, height: vp.height + 20 });
      await expect(counterVal).toHaveText('1');
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await expect(counterVal).toHaveText('1');

      if (process.env.MUA_DO_CAPTURE_LAYOUTS === '1') {
        await page.screenshot({
          path: testInfo.outputPath(`slides-workspace-split-${vp.name}.png`),
          scale: 'css',
        });
      }
    }
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('#slides-scene-select').selectOption('citadel-gate-2018-360');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('body')).toHaveAttribute('data-scene-era', 'present');
    await expect(counterVal).toHaveText('1');
    if (process.env.MUA_DO_CAPTURE_LAYOUTS === '1') {
      await page.screenshot({ path: testInfo.outputPath('slides-workspace-present-320.png'), scale: 'css' });
    }
  });
});
