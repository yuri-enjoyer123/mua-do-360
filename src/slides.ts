import { createSplitResize } from './split-resize';

type SlidesOptions = {
  dialog: HTMLDialogElement;
  frame: HTMLIFrameElement;
  experience: HTMLElement;
  url: string;
  openDialog: () => void;
  onChange: () => void;
  onResize: () => void;
};

export function createSlides(options: SlidesOptions) {
  const { dialog, experience, url } = options;
  let frame = options.frame;
  const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
  const home = document.createComment('scene-home');
  experience.after(home);
  const sceneHost = get('slides-scene-host');
  const splitButton = get('slides-split');
  const fullscreenButton = get<HTMLButtonElement>('slides-fullscreen');
  const menu = get<HTMLDetailsElement>('slides-menu');
  const status = get('slides-loading');
  const statusText = get('slides-loading-text');
  const statusRetry = get('slides-retry-status');
  const feedback = get('slides-feedback');
  const resize = createSplitResize(dialog);
  let loadingTimer: ReturnType<typeof setTimeout> | undefined;
  let feedbackTimer: ReturnType<typeof setTimeout> | undefined;
  let ownsFullscreen = false;
  let fullscreenPending = false;
  let split = false;
  let closingFromHistory = false;

  function route(open: boolean, push = false) {
    const params = new URLSearchParams(location.hash.slice(1));
    if (open) {
      params.set('view', 'slides');
      if (split) params.set('layout', 'split');
      else params.delete('layout');
    } else {
      params.delete('view');
      params.delete('layout');
    }
    const next = `${location.pathname}${location.search}#${params}`;
    const previous = `${location.pathname}${location.search}${location.hash}`;
    if (next === previous) return;
    if (!open && history.state?.slidesFrom === next) history.back();
    else if (push) history.pushState({ slidesFrom: previous }, '', next);
    else history.replaceState(history.state, '', next);
  }

  function setLayout(next: boolean) {
    split = next;
    dialog.dataset.layout = split ? 'split' : 'slides';
    splitButton.setAttribute('aria-pressed', String(split));
    resize.end();
    get('slides-divider').hidden = !split;
    get('slides-tour').hidden = !split;
    if (split) sceneHost.append(experience);
    else home.before(experience);
    options.onResize();
  }

  function showStatus(message: string, retry = false) {
    statusText.textContent = message;
    statusRetry.hidden = !retry;
    status.hidden = false;
    frame.setAttribute('aria-busy', String(!retry));
  }

  function reload() {
    clearTimeout(loadingTimer);
    showStatus(navigator.onLine ? 'Đang mở bài chiếu…' : 'Bạn đang ngoại tuyến.', !navigator.onLine);
    frame.src = `${url}?embed`;
    loadingTimer = setTimeout(() => {
      if (dialog.open) showStatus('Bài chiếu tải lâu hơn bình thường.', true);
    }, 12000);
  }

  function syncFullscreen() {
    const active = Boolean(document.fullscreenElement);
    if (!active) ownsFullscreen = false;
    fullscreenButton.setAttribute('aria-pressed', String(active));
    const label = active ? 'Thoát toàn màn hình' : 'Toàn màn hình';
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.title = label;
    options.onResize();
  }

  async function enterFullscreen() {
    if (document.fullscreenElement || fullscreenPending || !document.documentElement.requestFullscreen) return;
    fullscreenPending = true;
    fullscreenButton.disabled = true;
    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
      if (dialog.open) ownsFullscreen = true;
      else if (document.fullscreenElement === document.documentElement) await document.exitFullscreen();
    } catch {
      // The dialog still fills the viewport when fullscreen is unavailable.
    } finally {
      fullscreenPending = false;
      fullscreenButton.disabled = false;
      syncFullscreen();
    }
  }

  function open(fullscreen = true, fromHistory = false) {
    if (dialog.open) return;
    closingFromHistory = false;
    options.openDialog();
    setLayout(fromHistory && new URLSearchParams(location.hash.slice(1)).get('layout') === 'split');
    if (!fromHistory) route(true, true);
    get('slides-button').setAttribute('aria-expanded', 'true');
    options.onChange();
    reload();
    if (fullscreen) void enterFullscreen();
  }

  function syncRoute() {
    const params = new URLSearchParams(location.hash.slice(1));
    if (params.get('view') === 'slides') {
      if (!dialog.open) open(false, true);
      else setLayout(params.get('layout') === 'split');
    } else if (dialog.open) {
      closingFromHistory = true;
      dialog.close();
    }
  }

  splitButton.addEventListener('click', () => {
    setLayout(!split);
    route(true);
  });
  get('slides-return').addEventListener('click', () => dialog.close());
  fullscreenButton.hidden = !document.documentElement.requestFullscreen;
  fullscreenButton.addEventListener('click', () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else void enterFullscreen();
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  for (const id of ['slides-retry', 'slides-retry-status']) {
    get(id).addEventListener('click', () => {
      menu.open = false;
      get('slides-close').focus();
      reload();
    });
  }
  get('slides-share').addEventListener('click', () => {
    void navigator.clipboard?.writeText(location.href).then(() => {
      feedback.textContent = 'Đã sao chép liên kết';
    }).catch(() => {
      feedback.textContent = 'Bạn có thể sao chép liên kết trên thanh địa chỉ.';
    });
    if (!navigator.clipboard) feedback.textContent = 'Bạn có thể sao chép liên kết trên thanh địa chỉ.';
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 5000);
    menu.open = false;
    menu.querySelector('summary')!.focus();
  });
  dialog.addEventListener('click', event => {
    if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false;
  });
  dialog.addEventListener('cancel', event => {
    if (menu.open) {
      event.preventDefault();
      menu.open = false;
      menu.querySelector('summary')!.focus();
    }
  });
  get('slides-focus-end').addEventListener('focus', () => splitButton.focus());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'Tab' && event.shiftKey && document.activeElement === splitButton) {
      event.preventDefault();
      (split ? get('slides-return') : frame).focus();
    }
  });
  function listenToFrame() {
    const currentFrame = frame;
    currentFrame.addEventListener('load', () => {
      if (currentFrame !== frame || !dialog.open || !frame.hasAttribute('src')) return;
      if (frame.contentDocument?.URL === 'about:blank') return;
      clearTimeout(loadingTimer);
      status.hidden = true;
      frame.setAttribute('aria-busy', 'false');
    });
    currentFrame.addEventListener('error', () => {
      if (currentFrame === frame && dialog.open) showStatus('Chưa mở được bài chiếu.', true);
    });
  }
  listenToFrame();
  window.addEventListener('offline', () => {
    if (dialog.open) showStatus('Bạn đang ngoại tuyến.', true);
  });
  window.addEventListener('online', () => {
    if (dialog.open && !status.hidden) reload();
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    clearTimeout(loadingTimer);
    clearTimeout(feedbackTimer);
    // Removing a src navigates to about:blank and can erase the Forward entry.
    const emptyFrame = frame.cloneNode(false) as HTMLIFrameElement;
    emptyFrame.removeAttribute('src');
    emptyFrame.removeAttribute('aria-busy');
    frame.replaceWith(emptyFrame);
    frame = emptyFrame;
    listenToFrame();
    feedback.textContent = '';
    menu.open = false;
    setLayout(false);
    if (ownsFullscreen) {
      ownsFullscreen = false;
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    }
    if (!closingFromHistory) route(false);
    closingFromHistory = false;
    get('slides-button').setAttribute('aria-expanded', 'false');
    options.onChange();
    get(document.body.classList.contains('presentation') ? 'presentation-exit' : 'slides-button').focus({ preventScroll: true });
  });

  return { open, syncRoute };
}
