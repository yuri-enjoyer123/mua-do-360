import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window {
    __audioContexts: AudioContext[];
    __holdAudioResume: boolean;
    __releaseAudioResume?: () => void;
  }
}

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

test('1. Preview gate keeps thumbnail visible while busy and high-res dimensions are retained', async ({ page }) => {
  let releaseRequest!: () => void;
  const gatePromise = new Promise<void>(resolve => {
    releaseRequest = resolve;
  });

  const matcher = (url: URL) => url.pathname.endsWith('/scenes/cong-hau.webp') && url.searchParams.get('v') === 'esrgan4x';

  await page.route(matcher, async route => {
    await gatePromise;
    await route.continue();
  });

  try {
    await page.goto('./#scene=cong-hau', { waitUntil: 'domcontentloaded' });

    const preview = page.locator('#scene-preview');
    await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'true');
    await expect(preview).toBeVisible();

    await expect(preview).toHaveAttribute('src', /cong-hau-thumb\.webp$/);
    await expect.poll(() => preview.evaluate((img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0 && img.naturalHeight > 0,
    )).toBe(true);

    // Release the full panorama request gate
    releaseRequest();

    // Await ready canvas
    await ready(page);

    // Assert final preview image retained high-quality dimensions (7096 x 3548)
    await expect.poll(async () => {
      return preview.evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
    }).toEqual([7096, 3548]);
  } finally {
    releaseRequest();
    await page.unroute(matcher);
  }
});

test('2. Album source clarity, context labels and restoration across scenes', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('./#scene=quang-tri-south-1967');
  await photoReady(page);

  for (const direction of ['up', 'down', 'left', 'right']) {
    await expect(page.locator(`#look-${direction}`)).toBeHidden();
  }
  const resetView = page.locator('#reset-view');
  await expect(resetView).toHaveAttribute('aria-label', 'Đặt lại ảnh');

  // Open sources dialog
  await page.locator('#scene-sources').click();
  const infoDialog = page.locator('#information-dialog');
  await expect(infoDialog).toBeVisible();

  const dialogTitle = page.locator('#dialog-title');
  await expect(dialogTitle).toHaveText('Tư liệu ảnh');
  const sourcesTab = page.locator('#sources-tab');
  await expect(sourcesTab).toHaveText('Nguồn ảnh');

  // Ensure sources tab/panel is active
  await sourcesTab.click();
  const sourcesPanel = page.locator('#sources-panel');
  await expect(sourcesPanel).toBeVisible();

  const photoSource = sourcesPanel.locator('.photo-source');
  await expect(photoSource).toBeVisible();
  const details = photoSource.locator('details');
  await expect(details).toBeVisible();
  await expect.poll(async () => details.evaluate((el: HTMLDetailsElement) => el.open)).toBe(true);

  // Assert original figure img computed filter is none
  const figureImg = photoSource.locator('figure img');
  await expect(figureImg).toBeVisible();
  const computedFilter = await figureImg.evaluate((img: HTMLImageElement) => getComputedStyle(img).filter);
  expect(computedFilter).toBe('none');
  expect(await photoSource.evaluate(el => Boolean(
    el.querySelector('figure')!.compareDocumentPosition(el.querySelector('a[href^="https:"]')!) & Node.DOCUMENT_POSITION_FOLLOWING,
  ))).toBe(true);

  // Assert metadata 1967 and Sciacchitano unchanged
  await expect(sourcesPanel).toContainText('1967');
  await expect(sourcesPanel).toContainText('Sciacchitano');

  // Close dialog and navigate to #scene=cong-hau
  await page.keyboard.press('Escape');
  await expect(infoDialog).not.toBeVisible();

  await page.goto('./#scene=cong-hau');
  await ready(page);

  for (const direction of ['up', 'down', 'left', 'right']) {
    await expect(page.locator(`#look-${direction}`)).toBeVisible();
  }
  await expect(page.locator('#look-left')).toHaveAttribute('aria-label', 'Nhìn sang trái');
  await expect(page.locator('#reset-view')).toHaveAttribute('aria-label', 'Đặt lại góc nhìn');

  // Open sources dialog for cong-hau
  await page.locator('#scene-sources').click();
  await expect(infoDialog).toBeVisible();

  // Assert dialog title for sources tab
  await page.locator('#sources-tab').click();
  await expect(dialogTitle).toHaveText('Tư liệu & phục dựng');
  await expect(sourcesTab).toHaveText('Nguồn & phục dựng');

  await expect(infoDialog).toContainText('Bản đồ này không xác nhận nguyên trạng năm 1972 hay vị trí các cảnh minh họa');
  await expect(infoDialog).toContainText('Cục Di sản văn hóa');

  await page.keyboard.press('Escape');
});

test('3. Keyboard hotspot navigation triggers app turn and Enter activates target scene', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto('./#scene=cong-hau');
  await ready(page);

  const firstHotspotButton = page.locator('.hotspot-button').first();
  await expect(firstHotspotButton).toBeVisible();

  const getHotspotGeometry = async () => {
    return firstHotspotButton.evaluate((el: HTMLElement) => {
      const parent = el.closest('.scene-hotspot') as HTMLElement | null;
      return {
        buttonTransform: el.style.transform || getComputedStyle(el).transform,
        parentTransform: parent ? (parent.style.transform || parent.getAttribute('style') || '') : '',
        parentStyle: parent ? parent.getAttribute('style') : '',
        rect: el.getBoundingClientRect(),
      };
    });
  };

  const initialGeo = await getHotspotGeometry();

  // Focus the first hotspot button
  await firstHotspotButton.focus();
  await expect(firstHotspotButton).toBeFocused();

  // Press ArrowRight to rotate view
  await page.keyboard.press('ArrowRight');

  // Assert rendered hotspot geometry / transform changes
  await expect.poll(async () => {
    const currentGeo = await getHotspotGeometry();
    return (
      currentGeo.parentStyle !== initialGeo.parentStyle ||
      currentGeo.parentTransform !== initialGeo.parentTransform ||
      Math.abs(currentGeo.rect.left - initialGeo.rect.left) > 0.5 ||
      Math.abs(currentGeo.rect.top - initialGeo.rect.top) > 0.5
    );
  }).toBe(true);

  // Hotspot button keeps focus
  await expect(firstHotspotButton).toBeFocused();

  // Native Enter activates target scene (cong-hau first hotspot targets hao-thanh)
  await page.keyboard.press('Enter');

  // Confirm target scene transition to hao-thanh and content record matches
  await ready(page);
  await expect(page).toHaveURL(/#scene=hao-thanh$/);
  await expect(page.locator('#scene-title')).toHaveText('Hào và tường thành');
});

test('4. Photo zoom anchoring stays stable under cursor on desktop wheel and mobile pinch', async ({ page, isMobile }) => {
  await page.goto('./#scene=quang-tri-south-1967');
  await photoReady(page);

  const viewer = page.locator('#photo-viewer');
  const image = page.locator('#document-photo');

  const getImageMetrics = async () => {
    return image.evaluate((img: HTMLImageElement) => {
      const rect = img.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    });
  };

  const initialMetrics = await getImageMetrics();
  const viewerBox = (await viewer.boundingBox())!;
  const viewerCenterX = viewerBox.x + viewerBox.width / 2;
  const viewerCenterY = viewerBox.y + viewerBox.height / 2;

  if (!isMobile) {
    // Desktop: Double click center to scale 2
    await page.mouse.dblclick(viewerCenterX, viewerCenterY);
    await expect.poll(async () => {
      const m = await getImageMetrics();
      return m.width;
    }).toBeGreaterThan(initialMetrics.width * 1.5);

    const postDblMetrics = await getImageMetrics();

    // Wheel at point: center + (60, 40)
    const anchorX = viewerCenterX + 60;
    const anchorY = viewerCenterY + 40;

    // Verify point is inside photo and away from clamped edge
    expect(anchorX).toBeGreaterThan(postDblMetrics.left + 20);
    expect(anchorX).toBeLessThan(postDblMetrics.left + postDblMetrics.width - 20);
    expect(anchorY).toBeGreaterThan(postDblMetrics.top + 20);
    expect(anchorY).toBeLessThan(postDblMetrics.top + postDblMetrics.height - 20);

    // Normalized relative position in image before wheel
    const uBefore = (anchorX - postDblMetrics.left) / postDblMetrics.width;
    const vBefore = (anchorY - postDblMetrics.top) / postDblMetrics.height;

    await page.mouse.move(anchorX, anchorY);
    await page.mouse.wheel(0, -120);

    // Assert actual rendered width changes
    await expect.poll(async () => {
      const m = await getImageMetrics();
      return m.width;
    }).toBeGreaterThan(postDblMetrics.width);

    const postWheelMetrics = await getImageMetrics();
    // Visual image point under cursor after zoom
    const pointXAfter = postWheelMetrics.left + uBefore * postWheelMetrics.width;
    const pointYAfter = postWheelMetrics.top + vBefore * postWheelMetrics.height;

    // Assert visual image point under cursor stays within ~2px
    expect(Math.abs(pointXAfter - anchorX)).toBeLessThanOrEqual(2.5);
    expect(Math.abs(pointYAfter - anchorY)).toBeLessThanOrEqual(2.5);
  } else {
    // Mobile CDP 2-finger touch
    const client = await page.context().newCDPSession(page);

    // First pinch for zoom
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: Math.round(viewerCenterX - 30), y: Math.round(viewerCenterY), id: 1 },
        { x: Math.round(viewerCenterX + 30), y: Math.round(viewerCenterY), id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: Math.round(viewerCenterX - 75), y: Math.round(viewerCenterY), id: 1 },
        { x: Math.round(viewerCenterX + 75), y: Math.round(viewerCenterY), id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(async () => {
      const m = await getImageMetrics();
      return m.width;
    }).toBeGreaterThan(initialMetrics.width * 1.3);

    const zoomedMetrics = await getImageMetrics();

    // Fresh 2 fingers off-center: midpoint (viewerCenterX + 40, viewerCenterY + 30)
    const mid1X = viewerCenterX + 40;
    const mid1Y = viewerCenterY + 30;
    const p1Start = { x: Math.round(mid1X - 30), y: Math.round(mid1Y) };
    const p2Start = { x: Math.round(mid1X + 30), y: Math.round(mid1Y) };

    const uMid = (mid1X - zoomedMetrics.left) / zoomedMetrics.width;
    const vMid = (mid1Y - zoomedMetrics.top) / zoomedMetrics.height;

    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: p1Start.x, y: p1Start.y, id: 10 },
        { x: p2Start.x, y: p2Start.y, id: 11 },
      ],
    });

    // Move centroid + expand pinch: move midpoint by (+20, +15) and spread fingers
    const mid2X = mid1X + 20;
    const mid2Y = mid1Y + 15;
    const p1Move = { x: Math.round(mid2X - 60), y: Math.round(mid2Y) };
    const p2Move = { x: Math.round(mid2X + 60), y: Math.round(mid2Y) };

    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: p1Move.x, y: p1Move.y, id: 10 },
        { x: p2Move.x, y: p2Move.y, id: 11 },
      ],
    });

    await expect.poll(async () => {
      const m = await getImageMetrics();
      return m.width;
    }).toBeGreaterThan(zoomedMetrics.width);

    const postPinchMetrics = await getImageMetrics();
    const renderedMidX = postPinchMetrics.left + uMid * postPinchMetrics.width;
    const renderedMidY = postPinchMetrics.top + vMid * postPinchMetrics.height;

    // Verify content point under initial midpoint tracks new midpoint within 3px tolerance
    expect(Math.abs(renderedMidX - mid2X)).toBeLessThanOrEqual(3.5);
    expect(Math.abs(renderedMidY - mid2Y)).toBeLessThanOrEqual(3.5);

    // Lift one finger (id 11), remaining finger (id 10) stationary
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [{ x: p1Move.x, y: p1Move.y, id: 10 }],
    });

    // Sample remaining finger stationary - verify no jump
    const preSampleMetrics = await getImageMetrics();
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: p1Move.x, y: p1Move.y, id: 10 }],
    });
    const postSampleMetrics = await getImageMetrics();
    expect(Math.abs(postSampleMetrics.left - preSampleMetrics.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(postSampleMetrics.top - preSampleMetrics.top)).toBeLessThanOrEqual(1);

    // End touch
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
});

test('5. Short landscape viewport 844x280 maintains controls visibility and tap target standards', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 280 });
  await page.goto('./#scene=cong-hau');
  await ready(page);

  // Selected scene / navigation focus
  const selectedSceneButton = page.locator('[data-scene="cong-hau"]');
  await expect(selectedSceneButton).toHaveAttribute('aria-current', 'location');

  const viewportWidth = 844;
  const viewportHeight = 280;
  const epsilon = 0.1;

  // Verify controls: era buttons, collection buttons, view controls, step buttons, scene sources
  const controlsToVerify = [
    page.locator('[data-era="past"]'),
    page.locator('[data-era="present"]'),
    page.locator('[data-collection="panorama"]'),
    page.locator('[data-collection="archive"]'),
    page.locator('#scene-sources'),
    page.locator('#look-up'),
    page.locator('#look-down'),
    page.locator('#look-left'),
    page.locator('#look-right'),
    page.locator('#zoom-in'),
    page.locator('#zoom-out'),
    page.locator('#reset-view'),
    page.locator('#fullscreen-button'),
    page.locator('#previous-scene'),
    page.locator('#next-scene'),
  ];

  for (const control of controlsToVerify) {
      await expect(control).toBeVisible();
      const box = (await control.boundingBox())!;
      expect(box).not.toBeNull();
      // Fully in viewport with epsilon 0.1
      expect(box.x).toBeGreaterThanOrEqual(-epsilon);
      expect(box.y).toBeGreaterThanOrEqual(-epsilon);
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + epsilon);
      expect(box.y + box.height).toBeLessThanOrEqual(viewportHeight + epsilon);

      expect(box.width).toBeGreaterThanOrEqual(44 - epsilon);
      expect(box.height).toBeGreaterThanOrEqual(44 - epsilon);
  }

  // Caption .hotspot-caption hidden, but hotspot buttons still visible and accessible
  const captions = page.locator('.hotspot-caption');
  const captionCount = await captions.count();
  for (let i = 0; i < captionCount; i++) {
    const isHidden = await captions.nth(i).evaluate((el: HTMLElement) => {
      const style = getComputedStyle(el);
      return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0' || el.offsetWidth === 0;
    });
    expect(isHidden).toBe(true);
  }

  const hotspotButtons = page.locator('.hotspot-button');
  const hotspotCount = await hotspotButtons.count();
  expect(hotspotCount).toBeGreaterThan(0);
  for (let i = 0; i < hotspotCount; i++) {
    await expect(hotspotButtons.nth(i)).toBeVisible();
    await expect(hotspotButtons.nth(i)).toHaveAttribute('aria-label', /.+/);
    await expect.poll(() => hotspotButtons.nth(i).evaluate(button => {
      const box = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2));
    })).toBe(true);
  }

  // Source facts and modes unchanged
  await expect(page.locator('#scene-title')).toHaveText('Quanh Cổng Hậu');
  await expect(page.locator('#scene-date')).toContainText('1972');
});

test('6. Audio suspends on mute or hide and a late resume cannot override muting', async ({ page }) => {
  // Add init script subclassing AudioContext to track instances and state changes
  await page.addInitScript(() => {
    const OriginalAudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    window.__audioContexts = [];
    window.__holdAudioResume = false;

    class TrackedAudioContext extends OriginalAudioContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        window.__audioContexts.push(this);
      }
      override async resume() {
        await super.resume();
        if (window.__holdAudioResume) {
          await new Promise<void>(resolve => { window.__releaseAudioResume = resolve; });
        }
      }
    }

    window.AudioContext = TrackedAudioContext as unknown as typeof AudioContext;
    if ((window as unknown as { webkitAudioContext: unknown }).webkitAudioContext) {
      (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext = TrackedAudioContext;
    }
  });

  await page.goto('./#scene=cong-hau');
  await ready(page);

  // Initial: no audio context created, ambience button aria-pressed false
  const initialContextsCount = await page.evaluate(() => (window as unknown as { __audioContexts: AudioContext[] }).__audioContexts.length);
  expect(initialContextsCount).toBe(0);

  // Open Sources dialog to access ambience control
  await page.locator('#scene-sources').click();
  const infoDialog = page.locator('#information-dialog');
  await expect(infoDialog).toBeVisible();

  const ambienceButton = infoDialog.locator('#ambience-button');
  const audioState = () => page.evaluate(() => window.__audioContexts[0]?.state);
  const setHidden = (hidden: boolean) => page.evaluate(value => {
    Object.defineProperty(document, 'hidden', { configurable: true, value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  await expect(ambienceButton).toBeVisible();
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'false');

  // Click ambience button to turn on audio
  await ambienceButton.click();

  // Await aria-pressed="true" and context state running
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => {
    return page.evaluate(() => {
      const list = (window as unknown as { __audioContexts: AudioContext[] }).__audioContexts;
      return list.length > 0 ? list[0].state : null;
    });
  }).toBe('running');

  // Click off
  await ambienceButton.click();
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'false');

  // Wait for context to suspend within 3500ms (accounting for 1200ms fade)
  await expect.poll(async () => {
    return page.evaluate(() => {
      const list = (window as unknown as { __audioContexts: AudioContext[] }).__audioContexts;
      return list.length > 0 ? list[0].state : null;
    });
  }, { timeout: 3500 }).toBe('suspended');

  // Re-enable and expect running again
  await ambienceButton.click();
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(async () => {
    return page.evaluate(() => {
      const list = (window as unknown as { __audioContexts: AudioContext[] }).__audioContexts;
      return list.length > 0 ? list[0].state : null;
    });
  }).toBe('running');

  await setHidden(true);
  await expect.poll(audioState).toBe('suspended');
  await setHidden(false);
  await expect.poll(audioState).toBe('running');

  // Three fast toggles end OFF even if a prior resume has not settled yet.
  await ambienceButton.evaluate(button => { button.click(); button.click(); button.click(); });
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(audioState, { timeout: 3500 }).toBe('suspended');
  await setHidden(true);
  await setHidden(false);
  await expect.poll(audioState).toBe('suspended');

  // Delay the native resume promise so OFF must win over its late completion.
  await page.evaluate(() => { window.__holdAudioResume = true; });
  await ambienceButton.click();
  await expect.poll(() => page.evaluate(() => Boolean(window.__releaseAudioResume))).toBe(true);
  await ambienceButton.click();
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'false');
  await page.evaluate(() => {
    window.__holdAudioResume = false;
    window.__releaseAudioResume!();
  });
  await expect.poll(audioState).toBe('suspended');
  await expect(ambienceButton).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Escape');
});
