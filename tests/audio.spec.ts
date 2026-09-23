import { test, expect, type Page } from '@playwright/test';

type AudioProbe = {
  outputs: { context: BaseAudioContext; analyser: AnalyserNode }[];
  holdResume: boolean;
  releaseResume?: () => void;
};

declare global {
  interface Window { audioProbe: AudioProbe }
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const probe: AudioProbe = { outputs: [], holdResume: false };
    window.audioProbe = probe;
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
    const resume = AudioContext.prototype.resume;
    AudioContext.prototype.resume = function () {
      const resumed = resume.call(this);
      if (!probe.holdResume) return resumed;
      return Promise.all([
        resumed,
        new Promise<void>(resolve => { probe.releaseResume = resolve; }),
      ]).then(() => undefined);
    };
  });
  await page.goto('./#scene=cong-hau');
  await expect(page.locator('#panorama')).toHaveAttribute('aria-busy', 'false');
  await page.locator('#immersive-button').click();
});

async function outputLevel(page: Page) {
  return page.evaluate(() => {
    const outputs = window.audioProbe.outputs;
    if (!outputs.length) throw new Error('No audio output was created');
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

test('pause stops sound and rotation, and play restores previously enabled sound', async ({ page }) => {
  const play = page.locator('#rotate-button');
  const sound = page.locator('#ambient-quick-button');
  await play.click();
  await sound.click();
  await expectSound(page);

  await play.click();
  await expectSilence(page);
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#ambience-button')).toHaveAttribute('aria-pressed', 'false');

  await play.click();
  await expectSound(page);
  await expect(sound).toHaveAttribute('aria-pressed', 'true');

  await sound.click();
  await expectSilence(page);
  await play.click();
  await play.click();
  await expectSilence(page);
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
});

test('pause stays silent when an outstanding audio resume completes', async ({ page }) => {
  const play = page.locator('#rotate-button');
  const sound = page.locator('#ambient-quick-button');
  await play.click();
  await page.evaluate(() => { window.audioProbe.holdResume = true; });
  await sound.click();
  await expect.poll(() => page.evaluate(() => !!window.audioProbe.releaseResume)).toBe(true);
  await play.click();
  await page.evaluate(() => {
    window.audioProbe.holdResume = false;
    window.audioProbe.releaseResume!();
  });
  await expect.poll(() => page.evaluate(() => window.audioProbe.outputs.every(output => output.context.state === 'suspended'))).toBe(true);
  await expectSilence(page);
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await play.click();
  await expectSound(page);
});

test('both sound controls mute promptly and remain silent after rapid toggles', async ({ page }) => {
  const quick = page.locator('#ambient-quick-button');
  await quick.click();
  await expectSound(page);
  await quick.click();
  await expectSilence(page);

  await quick.click();
  await quick.click();
  await quick.click();
  await expectSound(page);
  await page.locator('#presentation-exit').click();
  await page.locator('#scene-sources').click();
  await page.locator('#ambience-button').click();
  await expectSilence(page);
  await expect(quick).toHaveAttribute('aria-pressed', 'false');
});
