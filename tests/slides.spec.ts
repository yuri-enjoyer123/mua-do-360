import { test, expect, type Page } from '@playwright/test';

type AudioProbe = {
  outputs: { context: BaseAudioContext; analyser: AnalyserNode }[];
};

declare global {
  interface Window {
    slidesAudioProbe?: AudioProbe;
    fullscreenRequested?: boolean;
    fullscreenCancelledLate?: boolean;
  }
}

const CANVA_EMBED_URL = 'https://www.canva.com/design/DAHWALcziLU/-vKYtAmPvSmY13YbW3QgZg/view?embed';
const CANVA_VIEW_URL = 'https://www.canva.com/design/DAHWALcziLU/-vKYtAmPvSmY13YbW3QgZg/view';
const MOCK_CANVA_HTML = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Mock Canva Presentation</title></head>
  <body style="margin:0;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
    <div data-testid="mock-slide-content">Mock Canva Slide Fixture - Test Content<button id="fixture-control">Fixture control</button></div>
  </body>
</html>`;

async function installAudioProbe(page: Page) {
  await page.addInitScript(() => {
    const probe: AudioProbe = { outputs: [] };
    window.slidesAudioProbe = probe;
    const connect = AudioNode.prototype.connect;
    Object.defineProperty(AudioNode.prototype, 'connect', {
      configurable: true,
      value(this: AudioNode, ...args: unknown[]) {
        if (args[0] === this.context.destination) {
          const analyser = this.context.createAnalyser();
          analyser.fftSize = 256;
          Reflect.apply(connect, this, [analyser]);
          probe.outputs.push({ context: this.context, analyser });
        }
        return Reflect.apply(connect, this, args);
      },
    });
  });
}

async function outputLevel(page: Page) {
  return page.evaluate(() => {
    const outputs = window.slidesAudioProbe?.outputs;
    if (!outputs || !outputs.length) return 0;
    return Math.max(...outputs.map(({ context, analyser }) => {
      if (context.state !== 'running') return 0;
      const samples = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(samples);
      return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
    }));
  });
}

async function expectSound(page: Page) {
  await expect.poll(() => outputLevel(page)).toBeGreaterThan(0.0001);
}

async function expectSilence(page: Page) {
  await expect.poll(() => outputLevel(page), { timeout: 500, intervals: [25, 50] }).toBeLessThan(0.000001);
}

test.describe('Canva presentation', () => {
  test('opens lazily in fullscreen and closes without changing the scene', async ({ page }) => {
    test.setTimeout(60000);
    let canvaRequested = false;
    await page.route(CANVA_EMBED_URL, async route => {
      canvaRequested = true;
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
    const slidesFrame = page.locator('#slides-frame');
    const slidesClose = page.locator('#slides-close');
    const slidesExternal = page.locator('#slides-external');

    // Contract & placement assertions
    await expect(slidesButton).toBeVisible();
    await expect(slidesButton).toHaveAttribute('aria-label', 'Trình chiếu');
    await expect(slidesButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(slidesButton).toHaveAttribute('aria-controls', 'slides-dialog');

    // #slides-button immediately follows [data-collection="panorama"] in DOM
    const isAdjacent = await page.evaluate(() => {
      const pano = document.querySelector('.collection-switch [data-collection="panorama"]');
      const slides = document.querySelector('#slides-button');
      return pano?.nextElementSibling === slides;
    });
    expect(isAdjacent).toBe(true);

    // Dialog initial state and lazy iframe check
    await expect(slidesDialog).not.toHaveAttribute('open', '');
    expect(await slidesFrame.getAttribute('src')).toBeNull();
    expect(canvaRequested).toBe(false);

    // External link contract
    await expect(slidesExternal).toHaveAttribute('href', CANVA_VIEW_URL);
    await expect(slidesExternal).toHaveAttribute('target', '_blank');

    // Open slides
    await slidesButton.click();
    await expect(slidesDialog).toHaveAttribute('open', '');
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
    await expect(page.frameLocator('#slides-frame').getByTestId('mock-slide-content')).toBeVisible();
    await expect(slidesClose).toBeFocused();

    // Verify iframe attributes and permissions
    await expect(slidesFrame).toHaveAttribute('src', CANVA_EMBED_URL);
    await expect(slidesFrame).toHaveAttribute('title', 'Ngữ Văn 8 - Nói và Nghe: Giới thiệu ngắn về một cuốn sách');
    await expect(slidesFrame).toHaveAttribute('allow', 'fullscreen');
    await expect(slidesFrame).toHaveAttribute('allowfullscreen', '');
    expect(canvaRequested).toBe(true);

    await page.locator('#slides-fullscreen').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await expect(slidesDialog).toHaveAttribute('open', '');
    await slidesClose.focus();
    await page.keyboard.press('Tab');
    await expect(page.frameLocator('#slides-frame').locator('#fixture-control')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#slides-split')).toBeFocused();
    await page.locator('#slides-fullscreen').click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
    await slidesClose.focus();

    // Background shortcuts must be blocked while dialog is open (scene & presentation state remain unchanged)
    const initialHash = page.url();
    await page.keyboard.press('p');
    await expect(page.locator('body')).not.toHaveClass(/presentation/);
    await page.keyboard.press('2');
    expect(page.url()).toBe(initialHash);
    await expect(page.locator('[data-scene="cong-hau"]')).toHaveAttribute('aria-current', 'location');

    // Close slides dialog
    await slidesClose.click();
    await expect(slidesDialog).not.toHaveAttribute('open', '');

    // Iframe src removed / unloaded and focus restored to opener
    await expect(slidesFrame).not.toHaveAttribute('src');
    await expect(slidesButton).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('handles denied or late fullscreen and pauses ambience', async ({ page }) => {
    test.setTimeout(60000);
    await installAudioProbe(page);

    await page.route(CANVA_EMBED_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_CANVA_HTML,
      });
    });

    await page.goto('./#scene=cong-hau');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

    // Turn on sound via Ngắm cảnh (immersion mode)
    await page.locator('#immersive-button').click();
    const quickAudio = page.locator('#ambient-quick-button');
    await quickAudio.click();
    await expectSound(page);

    // Exit presentation mode
    await page.locator('#presentation-exit').click();
    await expectSound(page);

    const slidesButton = page.locator('#slides-button');
    const slidesDialog = page.locator('#slides-dialog');
    const slidesClose = page.locator('#slides-close');

    // Stub requestFullscreen to reject (denial fallback to viewport modal)
    await page.evaluate(() => {
      document.documentElement.requestFullscreen = async () => {
        window.fullscreenRequested = true;
        throw new DOMException('Permissions check failed', 'NotAllowedError');
      };
    });

    // Opening slides should mute audio immediately and remain viewport-sized modal
    await slidesButton.click();
    await expect(slidesDialog).toHaveAttribute('open', '');
    expect(await page.evaluate(() => window.fullscreenRequested)).toBe(true);

    // Dialog stays open and fills viewport as fallback
    const dialogBox = (await slidesDialog.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(dialogBox.width).toBeCloseTo(viewport.width, -1);
    expect(dialogBox.height).toBeCloseTo(viewport.height, -1);

    // Audio must be muted while slides are open
    await expectSilence(page);

    // Close slides: audio must resume automatically
    await slidesClose.click();
    await expect(slidesDialog).not.toHaveAttribute('open', '');
    await expectSound(page);

    // Test late fullscreen cancellation when closed before requestFullscreen resolves
    await page.evaluate(() => {
      let fullscreenElement: Element | null = null;
      Object.defineProperty(document, 'fullscreenElement', { configurable: true, get: () => fullscreenElement });
      let resolvePromise: () => void;
      const deferred = new Promise<void>(resolve => { resolvePromise = resolve; });
      document.documentElement.requestFullscreen = async () => {
        await deferred;
        fullscreenElement = document.documentElement;
      };
      document.exitFullscreen = async () => {
        window.fullscreenCancelledLate = true;
        fullscreenElement = null;
      };
      (window as unknown as { resolveFs: () => void }).resolveFs = resolvePromise!;
    });

    await slidesButton.click();
    await expect(slidesDialog).toHaveAttribute('open', '');
    // Close before requestFullscreen completes
    await slidesClose.click();
    await expect(slidesDialog).not.toHaveAttribute('open', '');

    // Now resolve late fullscreen completion
    await page.evaluate(() => (window as unknown as { resolveFs: () => void }).resolveFs());
    await expect.poll(() => page.evaluate(() => window.fullscreenCancelledLate)).toBe(true);
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('controls remain usable at 320px in both eras', async ({ page }, testInfo) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width: 320, height: 568 });

    await page.route(CANVA_EMBED_URL, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: MOCK_CANVA_HTML,
      });
    });

    await page.goto('./#scene=cong-hau');
    await page.evaluate(() => {
      document.documentElement.requestFullscreen = async () => { throw new DOMException('Unavailable', 'NotAllowedError'); };
    });
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

    for (const era of ['past', 'present'] as const) {
      await page.locator(`[data-era="${era}"]`).click();
      await expect(page.locator(`[data-era="${era}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');

      const eraSwitch = page.locator('.era-switch');
      const collectionSwitch = page.locator('.collection-switch');
      const sceneContext = page.locator('.scene-context');

      await expect(eraSwitch).toBeVisible();
      await expect(collectionSwitch).toBeVisible();
      await expect(sceneContext).toBeVisible();

      // Geometry check: verify 44px min tap targets for controls in top groups
      const topControls = page.locator('.era-switch button, .collection-switch button, #scene-sources');
      const controlCount = await topControls.count();
      for (let i = 0; i < controlCount; i++) {
        const ctrl = topControls.nth(i);
        const box = (await ctrl.boundingBox())!;
        expect(box).not.toBeNull();
        expect(box.width).toBeGreaterThanOrEqual(43.9);
        expect(box.height).toBeGreaterThanOrEqual(43.9);
      }

      // Verify non-overlapping groups between era-switch, collection-switch, and scene-context
      const [eraBox, collBox, ctxBox] = await Promise.all([
        eraSwitch.boundingBox(),
        collectionSwitch.boundingBox(),
        sceneContext.boundingBox(),
      ]);
      expect(eraBox).not.toBeNull();
      expect(collBox).not.toBeNull();
      expect(ctxBox).not.toBeNull();

      const overlaps = (b1: { x: number; y: number; width: number; height: number }, b2: { x: number; y: number; width: number; height: number }) =>
        b1.x < b2.x + b2.width - 0.5 &&
        b1.x + b1.width - 0.5 > b2.x &&
        b1.y < b2.y + b2.height - 0.5 &&
        b1.y + b1.height - 0.5 > b2.y;

      expect(overlaps(eraBox!, collBox!)).toBe(false);
      expect(overlaps(eraBox!, ctxBox!)).toBe(false);
      expect(overlaps(collBox!, ctxBox!)).toBe(false);

      // Open slides modal and verify 320px viewport fit
      const slidesButton = page.locator('#slides-button');
      await slidesButton.click();
      const slidesDialog = page.locator('#slides-dialog');
      await expect(slidesDialog).toHaveAttribute('open', '');
      await expect(page.frameLocator('#slides-frame').getByTestId('mock-slide-content')).toBeVisible();

      const closeBox = (await page.locator('#slides-close').boundingBox())!;
      expect(closeBox.width).toBeGreaterThanOrEqual(43.9);
      expect(closeBox.height).toBeGreaterThanOrEqual(43.9);
      await page.locator('#slides-menu summary').click();
      const extBox = (await page.locator('#slides-external').boundingBox())!;
      expect(extBox.height).toBeGreaterThanOrEqual(43.9);
      await page.locator('#slides-menu summary').click();

      if (process.env.MUA_DO_CAPTURE_LAYOUTS === '1') {
        await page.screenshot({
          path: testInfo.outputPath(`slides-${era}-320.png`),
          scale: 'css',
        });
      }

      await page.locator('#slides-close').focus();
      await page.keyboard.press('Escape');
      await expect(slidesDialog).not.toHaveAttribute('open', '');
      await expect(slidesButton).toBeFocused();
    }
  });
});
