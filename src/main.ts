import './style.css';
import './eras.css';
import './immersion.css';
import './slides.css';
import 'pannellum/build/pannellum.css';
import { scenes as panoramas, sources } from './content';
import { photoScenes, type TourScene } from './photographs';
import { createPhotoViewer } from './photo-viewer';
import { derivedScenes } from './derived-scenes';
import { createViewMotion } from './view-motion';
import { createSceneTransition } from './scene-transition';
import { createSlides } from './slides';

const scenes: TourScene[] = [...panoramas, ...derivedScenes, ...photoScenes];
type Era = 'past' | 'present';
type Collection = 'panorama' | 'archive';
const eraOf = (scene: TourScene): Era => scene.era ?? 'past';
const collectionOf = (scene: TourScene): Collection => scene.format === 'photo' ? 'archive' : 'panorama';

type IconName = 'arrow' | 'chevron' | 'close' | 'book' | 'help' | 'expand' | 'volume' | 'muted' | 'eye' | 'drag' | 'plus' | 'minus' | 'external' | 'reset' | 'vr' | 'camera' | 'play' | 'pause' | 'phone' | 'slides' | 'split' | 'more' | 'link';
const paths: Record<IconName, string> = {
  split: '<rect x="3" y="4" width="18" height="16" rx="1"/><path d="M14 4v16"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  link: '<path d="m10 13 4-4m-6 6-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m4 2 2-2a4 4 0 0 0-6-6L6 5a4 4 0 0 0 0 6" transform="translate(3 2)"/>',
  slides: '<path d="M2 3h20M4 3v12h16V3M12 15v6m-5 0 5-4 5 4"/><path d="m10 6 5 3-5 3V6Z"/>',
  play: '<path d="m8 5 11 7-11 7V5Z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2M3 6l-2 3 2 3m18 0 2 3-2 3"/>',
  arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  book: '<path d="M12 5v15M12 5C9 3 5 3 3 4v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-2-1-6-1-9 1Z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4M12 16h.01"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  volume: '<path d="m11 4-5 4H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  muted: '<path d="m11 4-5 4H3v8h3l5 4V4Zm5 5 6 6m0-6-6 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  drag: '<path d="M8 13V7a2 2 0 0 1 4 0v5-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9c0 4-3 6-7 6h-1c-2 0-3-1-4-3l-4-6c-1-2 1-3 2-2l2 2Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  external: '<path d="M14 3h7v7m0-7L11 13M10 3H3v18h18v-7"/>',
  reset: '<path d="M4 11a8 8 0 1 1 2 7M4 5v6h6"/>',
  vr: '<path d="M4 8h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-4.5l-2-2.5a2 2 0 0 0-3 0L8.5 18H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"/><circle cx="8" cy="13" r="2"/><circle cx="16" cy="13" r="2"/><path d="M2 12H1m22 0h-1"/>',
  camera: '<path d="M2 9a2 2 0 0 1 2-2h3l2-2h6l2 2h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9Z"/><circle cx="12" cy="13" r="3.5"/>',
};
const icon = (name: IconName, cls = '') => `<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const asset = (path: string) => new URL(`${import.meta.env.BASE_URL}${path}`, document.baseURI).href;
const panoramaAsset = (path: string) => `${asset(path)}?v=esrgan4x`;
const fromHash = () => {
  const id = new URLSearchParams(location.hash.slice(1)).get('scene');
  return scenes.find((scene) => scene.id === id);
};
const linkedScene = fromHash();
let current = linkedScene ?? scenes[0];
const remembered = new Map<string, string>();
const visibleScenes = () => scenes.filter(scene => eraOf(scene) === eraOf(current) && collectionOf(scene) === collectionOf(current));
const sceneAsset = (scene: TourScene) => scene.format === 'photo' ? asset(scene.panorama) : panoramaAsset(scene.panorama);
let viewer: PanoramaViewer | undefined;
let enginePromise: Promise<unknown> | undefined;
let generation = 0;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;
let presentation = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const duration = () => reducedMotion.matches ? 0 : 280;
const slidesUrl = 'https://www.canva.com/design/DAHWALcziLU/-vKYtAmPvSmY13YbW3QgZg/view';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#information-dialog">Đọc về cảnh này</a>
  <main class="experience" aria-label="Mưa đỏ">
    <h1 class="sr-only">Mưa đỏ — Quảng Trị qua những góc nhìn</h1>
    <div class="landscape" aria-hidden="true"><img id="scene-preview" src="${asset(current.thumbnail ?? `scenes/${current.id}-thumb.webp`)}" alt="" fetchpriority="high" /></div>
    <div id="panorama" tabindex="0" role="region" aria-label="Cảnh đang xem. Kéo để nhìn quanh hoặc dùng phím mũi tên." aria-describedby="panorama-help"></div>
    <div class="photo-viewer" id="photo-viewer" tabindex="0" role="region" aria-label="Xem ảnh. Phóng to rồi kéo để xem chi tiết; phím mũi tên dịch chuyển ảnh." hidden><img id="document-photo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" draggable="false" /></div>
    <div id="scene-transition" aria-hidden="true" hidden></div>
    <div class="tour-vignette" aria-hidden="true"></div>

    <div class="tour-ui">
      <div class="era-switch" role="group" aria-label="Chọn thời kỳ"><button data-era="past" aria-pressed="true">Quá khứ</button><button data-era="present" aria-pressed="false">Hiện tại</button></div>
      <div class="collection-switch" role="group" aria-label="Cách xem"><button data-collection="panorama" aria-pressed="true" aria-label="Nhìn quanh" title="Nhìn quanh">${icon('vr')}</button><button id="slides-button" aria-label="Trình chiếu" title="Trình chiếu (S)" aria-keyshortcuts="S" aria-haspopup="dialog" aria-controls="slides-dialog" aria-expanded="false">${icon('slides')}</button><button data-collection="archive" aria-pressed="false" aria-label="Album ảnh" title="Album ảnh">${icon('camera')}</button><button id="immersive-button" aria-pressed="false" aria-label="Ngắm cảnh" title="Ngắm cảnh (P)">${icon('eye')}</button></div>
      <div class="scene-context"><h2 id="scene-title"></h2><p id="scene-date"></p><button id="scene-sources" class="text-button" data-open="sources" aria-label="Mở tư liệu của cảnh">Tư liệu</button></div>
      <div class="view-controls" aria-label="Điều khiển góc nhìn">
        <button class="icon-button" id="look-up" aria-label="Nhìn lên" title="Nhìn lên">${icon('chevron')}</button>
        <button class="icon-button" id="look-down" aria-label="Nhìn xuống" title="Nhìn xuống">${icon('chevron')}</button>
        <button class="icon-button" id="look-left" aria-label="Nhìn sang trái" title="Nhìn sang trái">${icon('chevron')}</button>
        <button class="icon-button" id="look-right" aria-label="Nhìn sang phải" title="Nhìn sang phải">${icon('chevron')}</button>
        <button class="icon-button" id="zoom-in" aria-label="Phóng to" title="Phóng to (+)">${icon('plus')}</button>
        <button class="icon-button" id="zoom-out" aria-label="Thu nhỏ" title="Thu nhỏ (−)">${icon('minus')}</button>
        <button class="icon-button" id="reset-view" aria-label="Đặt lại góc nhìn" title="Đặt lại góc nhìn">${icon('reset')}</button>
        <button class="icon-button" id="fullscreen-button" aria-label="Mở toàn màn hình" title="Toàn màn hình (F)">${icon('expand')}</button>
      </div>
      <p class="sr-only" id="panorama-help">Kéo để nhìn quanh hoặc dùng bốn nút đổi hướng. Chọn ảnh thu nhỏ để chuyển điểm. Mở Tư liệu để đọc thêm.</p>
      <nav class="scene-navigation" aria-label="${scenes.length} điểm nhìn">
        <div class="scene-nav-row"><button class="icon-button scene-step previous" id="previous-scene" aria-label="Điểm nhìn trước" title="Điểm nhìn trước">${icon('chevron')}</button><div class="scene-strip"></div><button class="icon-button scene-step next" id="next-scene" aria-label="Điểm nhìn tiếp theo" title="Điểm nhìn tiếp theo">${icon('chevron')}</button></div>
      </nav>
    </div>

    <div class="viewer-status" id="viewer-status" role="status" hidden><span class="loading-orbit" aria-hidden="true"></span><span>Đang mở cảnh…</span></div>
    <section class="viewer-error" id="viewer-error" aria-label="Không thể mở ảnh" hidden><h2>Chưa mở được cảnh</h2><p>Ảnh chưa tải được hoặc trình duyệt chưa mở được cảnh này. Bạn có thể thử lại, chọn cảnh khác hoặc đọc tư liệu.</p><div><button class="primary-button" id="retry-button">Thử tải lại ${icon('reset')}</button><button class="text-button" data-open="story">Đọc câu chuyện</button></div></section>

    <div id="presentation-tools" class="presentation-tools" role="group" aria-label="Ngắm cảnh" hidden>
      <p id="motion-feedback" role="status" hidden></p>
      <button class="icon-button" id="rotate-button" aria-label="Phát cảnh" aria-pressed="false" title="Phát cảnh">${icon('play', 'play-icon')}${icon('pause', 'pause-icon')}</button>
      <button class="icon-button" id="device-look-button" aria-label="Nghiêng điện thoại để nhìn quanh" aria-pressed="false" aria-busy="false" hidden>${icon('phone')}</button>
      <button class="icon-button" id="ambient-quick-button" aria-label="Bật âm thanh thiên nhiên mô phỏng" aria-pressed="false" title="Âm thanh: đang tắt">${icon('muted')}</button>
      <button class="presentation-exit" id="presentation-exit" aria-label="Trở lại các nút điều khiển">${icon('close')}<span>Trở lại</span></button>
    </div>
    <div class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></div>
  </main>

  <dialog id="slides-dialog" aria-label="Bài trình chiếu">
    <header class="slides-toolbar">
      <h2>Mưa đỏ</h2>
      <button id="slides-split" class="slides-split icon-button" aria-label="Xem cùng cảnh" title="Xem cùng cảnh" aria-pressed="false" aria-controls="slides-tour">${icon('split')}<span id="slides-split-label">Xem cùng cảnh</span></button>
      <button id="slides-fullscreen" class="icon-button" aria-label="Toàn màn hình" title="Toàn màn hình" aria-pressed="false">${icon('expand')}</button>
      <details id="slides-menu">
        <summary class="icon-button" aria-label="Tùy chọn bài chiếu" title="Tùy chọn bài chiếu">${icon('more')}</summary>
        <div class="slides-menu-items">
          <button id="slides-share">${icon('link')}Sao chép liên kết</button>
          <button id="slides-retry">${icon('reset')}Tải lại bài chiếu</button>
          <a id="slides-external" href="${slidesUrl}" target="_blank" rel="noopener noreferrer">${icon('external')}Mở trên Canva<span class="sr-only"> (mở thẻ mới)</span></a>
        </div>
      </details>
      <button id="slides-close" class="icon-button close-dialog" aria-label="Đóng trình chiếu" title="Đóng trình chiếu">${icon('close')}</button>
    </header>
    <div class="slides-body">
      <div class="slides-stage">
        <div id="slides-loading"><p id="slides-loading-text" role="status">Đang mở bài chiếu…</p><button id="slides-retry-status" hidden>Thử lại ${icon('reset')}</button></div>
        <iframe id="slides-frame" title="Ngữ Văn 8 - Nói và Nghe: Giới thiệu ngắn về một cuốn sách" allow="fullscreen" allowfullscreen></iframe>
      </div>
      <section id="slides-tour" aria-label="Cảnh Quảng Trị" hidden>
        <div class="slides-scene-toolbar">
          <select id="slides-scene-select" aria-label="Chọn cảnh cùng bài chiếu">${(['past', 'present'] as const).map(era => `<optgroup label="${era === 'past' ? 'Quá khứ' : 'Hiện tại'}">${scenes.filter(scene => eraOf(scene) === era).map(scene => `<option value="${escape(scene.id)}">${escape(scene.title)}${scene.format === 'photo' ? ' (ảnh)' : ''}</option>`).join('')}</optgroup>`).join('')}</select>
          <button class="text-button" data-open="sources" id="slides-sources">Tư liệu</button>
        </div>
        <div id="slides-scene-host"></div>
        <button id="slides-return">${icon('vr')}Trở lại cảnh</button>
      </section>
    </div>
    <p id="slides-feedback" role="status"></p>
    <span id="slides-focus-end" class="sr-only" tabindex="0"></span>
  </dialog>
  <dialog class="information-dialog" id="information-dialog" aria-labelledby="dialog-title">
    <div class="dialog-top"><button class="icon-button close-dialog" aria-label="Đóng bảng tư liệu">${icon('close')}</button></div>
    <h2 id="dialog-title">Thông tin cảnh</h2>
    <div class="dialog-tabs" role="tablist" aria-label="Nội dung tư liệu"><button role="tab" id="story-tab" aria-controls="story-panel" aria-selected="true" tabindex="0">Câu chuyện</button><button role="tab" id="sources-tab" aria-controls="sources-panel" aria-selected="false" tabindex="-1">Nguồn & phục dựng</button></div>
    <div class="dialog-scroll"><section id="story-panel" role="tabpanel" aria-labelledby="story-tab" tabindex="0"></section><section id="sources-panel" role="tabpanel" aria-labelledby="sources-tab" tabindex="0" hidden></section></div>
    <div class="dialog-footer">
      <div class="dialog-footer-meta"><button class="text-button" data-open="help">${icon('help')}Hướng dẫn</button><small class="author-credit">Trần Ngọc Hải Nam</small></div>
      <button class="icon-button" id="ambience-button" aria-label="Bật âm thanh thiên nhiên mô phỏng" aria-pressed="false" title="Âm thanh mô phỏng: đang tắt">${icon('muted')}</button>
      <button class="icon-button" id="presentation-button" aria-label="Ngắm cảnh" aria-pressed="false" title="Ngắm cảnh (P)">${icon('eye')}</button>
    </div>
  </dialog>
  <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><button class="icon-button close-dialog" aria-label="Đóng hướng dẫn">${icon('close')}</button></div><h2 id="help-title">Cách xem</h2><p class="help-intro">Nút kính VR để nhìn quanh, nút máy ảnh để xem album. Nút con mắt mở Ngắm cảnh, với tự xoay và điều khiển bằng cảm biến điện thoại.</p><div class="help-grid"><div>${icon('drag')}<h3>Nhìn quanh</h3><p>Kéo ảnh hoặc dùng bốn nút mũi tên để nhìn quanh. Trong album, cuộn chuột hoặc chụm hai ngón tay để phóng to, thu nhỏ. Nhấp đúp để phóng to hoặc trở về ban đầu; kéo hoặc dùng phím mũi tên để dịch ảnh.</p></div><div>${icon('arrow')}<h3>Chọn cảnh</h3><p>Nhấn dấu mũi tên trong cảnh, chọn một ảnh nhỏ phía dưới hoặc dùng hai nút trước / sau.</p></div><div>${icon('book')}<h3>Đọc và đối chiếu</h3><p>Chọn Tư liệu bên tên cảnh để đọc bối cảnh, xem ảnh tham chiếu và đối chiếu nguồn.</p></div></div><div class="keyboard-help"><h3>Bàn phím</h3><p><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Nhìn quanh / dịch ảnh khi chọn vùng xem</p><p><kbd>1</kbd> đến <kbd>9</kbd> Chọn điểm trong dải ảnh đang mở <span>·</span> <kbd>F</kbd> Toàn màn hình <span>·</span> <kbd>P</kbd> Ngắm cảnh <span>·</span> <kbd>S</kbd> Trình chiếu</p><p><kbd>Esc</kbd> Đóng bảng đang mở / thoát trình chiếu</p></div><p class="help-note">Âm thanh được mô phỏng và chỉ phát khi bật. Nút tạm dừng dừng xoay và tắt tiếng.</p></dialog>
`;

const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const panorama = get('panorama');
const preview = get<HTMLImageElement>('scene-preview');
const photoView = get('photo-viewer');
const photoImage = get<HTMLImageElement>('document-photo');
const photoController = createPhotoViewer(photoView, photoImage);
const infoDialog = get<HTMLDialogElement>('information-dialog');
const helpDialog = get<HTMLDialogElement>('help-dialog');
const slidesDialog = get<HTMLDialogElement>('slides-dialog');
const slidesFrame = get<HTMLIFrameElement>('slides-frame');
const announcement = get('announcement');
const allDialogs = [infoDialog, helpDialog, slidesDialog];
const focusReturns = new WeakMap<HTMLDialogElement, HTMLElement>();
const motion = createViewMotion(get<HTMLButtonElement>('rotate-button'), get<HTMLButtonElement>('device-look-button'), get('motion-feedback'), reducedMotion, syncPlaybackAudio);
const sceneTransition = createSceneTransition(get('scene-transition'), reducedMotion);
const experience = document.querySelector<HTMLElement>('.experience')!;
const sceneContext = document.querySelector<HTMLElement>('.scene-context')!;
function updatePhotoInset() {
  experience.style.setProperty('--context-end', `${sceneContext.getBoundingClientRect().bottom - experience.getBoundingClientRect().top}px`);
}
new ResizeObserver(updatePhotoInset).observe(sceneContext);
window.addEventListener('resize', updatePhotoInset);
const slides = createSlides({
  dialog: slidesDialog,
  frame: slidesFrame,
  experience,
  url: slidesUrl,
  openDialog: () => openDialog(slidesDialog),
  onChange: () => {
    if (!slidesDialog.open) {
      infoDialog.close();
      helpDialog.close();
    }
    syncAudioState();
    document.title = slidesDialog.open ? 'Mưa đỏ · Trình chiếu' : `${current.title} · Mưa đỏ`;
  },
  onResize: () => {
    updatePhotoInset();
    viewer?.resize();
  },
});
new ResizeObserver(() => viewer?.resize()).observe(experience);

function announce(text: string) { announcement.textContent = text; }

function updateViewControls() {
  const isPhoto = current.format === 'photo';
  for (const id of ['look-up', 'look-down', 'look-left', 'look-right']) {
    get(id).hidden = isPhoto;
  }
  const resetLabel = isPhoto ? 'Đặt lại ảnh' : 'Đặt lại góc nhìn';
  get('reset-view').setAttribute('aria-label', resetLabel);
  get('reset-view').title = resetLabel;
}

function getSourcesTitle(): string {
  return current.format === 'photo' ? 'Tư liệu ảnh' : 'Tư liệu & phục dựng';
}

function getSourcesTabLabel(): string {
  return current.format === 'photo' ? 'Nguồn ảnh' : 'Nguồn & phục dựng';
}

let stripKey = '';
function renderScene() {
  const isPhoto = current.format === 'photo';
  preview.onerror = null;
  if (!isPhoto) {
    const fullUrl = sceneAsset(current);
    preview.onerror = () => {
      preview.onerror = null;
      preview.src = fullUrl;
    };
    preview.src = asset(current.thumbnail ?? `scenes/${current.id}-thumb.webp`);
  } else {
    preview.removeAttribute('src');
  }
  updateViewControls();
  const era = eraOf(current);
  const collection = collectionOf(current);
  remembered.set(era, current.id);
  remembered.set(`${era}:${collection}`, current.id);
  document.body.dataset.sceneEra = era;
  document.querySelectorAll<HTMLElement>('[data-era]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.era === era)));
  document.querySelectorAll<HTMLElement>('[data-collection]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.collection === collection)));
  document.querySelector<HTMLElement>('.collection-switch')!.hidden = !scenes.some(scene => eraOf(scene) === era && collectionOf(scene) !== collection);
  const items = visibleScenes();
  const key = items.map(scene => scene.id).join(',');
  if (key !== stripKey) {
    document.querySelector('.scene-strip')!.innerHTML = items.map((scene, index) => `<button class="scene-card" data-scene="${escape(scene.id)}" aria-label="Điểm nhìn ${index + 1}: ${escape(scene.title)}" title="${escape(scene.title)}"><img src="${asset(scene.thumbnail ?? `scenes/${scene.id}-thumb.webp`)}" alt="" loading="lazy" width="320" height="180" /><span class="scene-card-title">${escape(scene.title)}</span></button>`).join('');
    stripKey = key;
  }
  const navigation = document.querySelector<HTMLElement>('.scene-navigation')!;
  navigation.setAttribute('aria-label', `${items.length} điểm nhìn`);
  navigation.style.setProperty('--scene-count', String(items.length));
  get('scene-title').textContent = current.title;
  get<HTMLSelectElement>('slides-scene-select').value = current.id;
  get('scene-date').textContent = current.photograph?.date ?? 'Quảng Trị, 1972';
  document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) => {
    const selected = button.dataset.scene === current.id;
    button.classList.toggle('active', selected);
    if (selected) {
      button.setAttribute('aria-current', 'location');
      button.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
    }
    else button.removeAttribute('aria-current');
  });
  document.title = slidesDialog.open ? 'Mưa đỏ · Trình chiếu' : `${current.title} · Mưa đỏ`;
  renderStory();
  updateAmbienceScene();
}

function renderStory() {
  get('sources-tab').textContent = getSourcesTabLabel();
  get('dialog-title').textContent = get('story-tab').getAttribute('aria-selected') === 'true' ? current.title : getSourcesTitle();
  if (current.photograph) {
    const photo = current.photograph;
    get('story-panel').innerHTML = `<p class="story-lead">${escape(current.summary)}</p>${current.description.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}<button class="text-button" id="story-to-sources">Xem tư liệu của cảnh</button>`;
    get('story-to-sources').addEventListener('click', () => setTab('sources', true));
    get('sources-panel').innerHTML = `
      <div class="photo-source">
        <h3>${escape(photo.title)}</h3>
        <p>${escape(photo.caption)}</p>
        <figure>
          <a href="${asset(photo.file)}" target="_blank" rel="noopener noreferrer"><img src="${asset(photo.file)}" alt="${escape(photo.caption)}" width="${photo.width}" height="${photo.height}" loading="lazy" /></a>
          <figcaption>${escape(photo.creator)} · ${escape(photo.date)}</figcaption>
        </figure>
        <p><a href="${escape(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">Xem nguồn ảnh ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a></p>
        <p><a href="${escape(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(photo.license)}<span class="sr-only"> (mở thẻ mới)</span></a></p>
        ${current.derivation ? `<p>${escape(current.derivation)}</p>` : ''}
        ${photo.notes.length ? `<details open><summary>Chú thích</summary>${photo.notes.map(note => `<p>${escape(note)}</p>`).join('')}</details>` : ''}
      </div>`;
    return;
  }
  const references = sources.filter((source) => current.sourceIds.includes(source.id));
  get('story-panel').innerHTML = `
    <p class="story-lead">${escape(current.summary)}</p>
    ${current.description.map((paragraph) => `<p>${escape(paragraph)}</p>`).join('')}
    <div class="evidence-block"><h3>Dữ kiện lịch sử</h3>
      <ul>${current.verified.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>
      <div class="inline-sources">${references.filter((source) => source.kind === 'historical').map((source) => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a>`).join('')}</div>
    </div>
    <div class="interpretation-block"><h3>Chi tiết minh họa</h3><ul>${current.interpretation.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div>
    <button class="text-button" id="story-to-sources">Xem nguồn tư liệu</button>`;
  get('story-to-sources').addEventListener('click', () => setTab('sources', true));
  get('sources-panel').innerHTML = `
    <details class="archive-map"><summary>Bản đồ lưu trữ Quảng Trị</summary>
      <figure><a href="https://catalog.archives.gov/id/74797754" target="_blank" rel="noopener noreferrer" aria-label="Xem hồ sơ bản đồ Quảng Trị tại National Archives (mở thẻ mới)"><img src="${asset('archive/ams-quang-tri.webp')}" alt="Bản đồ AMS lưu trữ thể hiện sông Thạch Hãn, thị xã và khu Thành cổ Quảng Trị." width="1200" height="1332" loading="lazy" /></a>
      <figcaption>U.S. Army Topographic Command / National Archives, NAID 74797754. Chú giải trên bản đồ ghi thông tin đến năm 1968; hồ sơ lưu trữ ghi khoảng 1942–1972. Bản đồ này không xác nhận nguyên trạng năm 1972 hay vị trí các cảnh minh họa.</figcaption></figure>
      <a class="archive-credit" href="https://commons.wikimedia.org/wiki/File:AMS_-_Quang_Tri,_Vietnam_-_NARA_-_74797754.jpg" target="_blank" rel="noopener noreferrer">Bản gốc độ phân giải cao và thông tin public domain ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a>
    </details>
    <h3 class="sources-heading">Nguồn tham khảo</h3>
    <ul class="source-list">${references.map((source) => `<li><div><span class="source-kind">${source.kind === 'historical' ? 'Tư liệu lịch sử' : 'Nguồn về văn học'}</span><h4><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a></h4><p class="source-publisher">${escape(source.publisher)}</p><p>${escape(source.note)}</p></div></li>`).join('')}</ul>`;
}

function setTab(tab: 'story' | 'sources', focus = false) {
  for (const name of ['story', 'sources'] as const) {
    const selected = tab === name;
    get(`${name}-tab`).setAttribute('aria-selected', String(selected));
    get(`${name}-tab`).tabIndex = selected ? 0 : -1;
    get(`${name}-panel`).hidden = !selected;
  }
  get('sources-tab').textContent = getSourcesTabLabel();
  get('dialog-title').textContent = tab === 'story' ? current.title : getSourcesTitle();
  infoDialog.querySelector('.dialog-scroll')!.scrollTop = 0;
  if (focus) get(`${tab}-tab`).focus();
}

function openDialog(dialog: HTMLDialogElement, tab?: 'story' | 'sources') {
  motion.stop();
  if (tab) setTab(tab);
  if (dialog.open) return;
  focusReturns.set(dialog, document.activeElement as HTMLElement);
  dialog.showModal();
  dialog.querySelector<HTMLButtonElement>('.close-dialog')!.focus();
}

allDialogs.forEach((dialog) => {
  dialog.querySelector('.close-dialog')!.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    const focused = document.activeElement;
    if (focused === document.body || dialog.contains(focused)) {
      focusReturns.get(dialog)?.focus({ preventScroll: true });
    }
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab' || dialog === slidesDialog) return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, iframe, [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((button) => button.addEventListener('click', () => {
  const target = button.dataset.open;
  if (target === 'help') {
    infoDialog.close();
    openDialog(helpDialog);
    focusReturns.set(helpDialog, get(slidesDialog.open ? 'slides-sources' : 'scene-sources'));
  }
  else openDialog(infoDialog, target === 'story' ? 'story' : 'sources');
}));
for (const name of ['story', 'sources'] as const) {
  get(`${name}-tab`).addEventListener('click', () => setTab(name));
  get(`${name}-tab`).addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    setTab(event.key === 'Home' ? 'story' : event.key === 'End' ? 'sources' : name === 'story' ? 'sources' : 'story', true);
  });
}

function writeHash(replace = false) {
  const params = new URLSearchParams(location.hash.slice(1));
  params.set('scene', current.id);
  const url = `${location.pathname}${location.search}#${params}`;
  if (replace || slidesDialog.open) history.replaceState(history.state, '', url);
  else if (location.hash !== `#${params}`) history.pushState(null, '', url);
}

function setLoading(loading: boolean) {
  const status = get('viewer-status');
  status.hidden = !loading;
  const statusText = status.querySelector('span:last-child');
  if (statusText) {
    statusText.textContent = current.format === 'photo' ? 'Đang mở ảnh tư liệu…' : 'Đang mở cảnh…';
  }
  panorama.setAttribute('aria-busy', String(loading));
  photoView.setAttribute('aria-busy', String(loading));
  document.body.classList.toggle('is-loading', loading);
}

function failScene(token: number) {
  if (token !== generation) return;
  generation++;
  clearTimeout(loadingTimer);
  motion.setViewer(undefined, current.format !== 'photo');
  sceneTransition.clear();
  setLoading(false);
  viewer?.destroy();
  viewer = undefined;
  panorama.hidden = true;
  photoView.hidden = true;
  get('viewer-error').hidden = false;
  get('viewer-error').querySelector('h2')!.textContent = current.format === 'photo' ? 'Chưa mở được ảnh tư liệu' : 'Chưa mở được cảnh';
  document.body.classList.add('has-error');
  if (current.format === 'photo') {
    announce('Chưa tải được ảnh. Bạn có thể thử lại, chọn ảnh khác hoặc mở tư liệu.');
  } else {
    announce('Chưa tải được cảnh. Bạn có thể thử lại, chọn cảnh khác hoặc mở tư liệu.');
  }
}

async function loadScene() {
  const token = ++generation;
  clearTimeout(loadingTimer);
  motion.setViewer(undefined, current.format !== 'photo');
  viewer?.destroy();
  viewer = undefined;
  const isPhoto = current.format === 'photo';
  panorama.hidden = isPhoto;
  photoView.hidden = !isPhoto;
  document.querySelector<HTMLElement>('.landscape')!.hidden = isPhoto;
  document.body.classList.toggle('viewing-photo', isPhoto);
  get('viewer-error').hidden = true;
  document.body.classList.remove('has-error');
  setLoading(true);
  loadingTimer = setTimeout(() => failScene(token), 25000);
  try {
    // Predecode catches missing images before Pannellum's XHR error parser runs.
    const sceneImage = new Image();
    sceneImage.src = sceneAsset(current);
    if (isPhoto) {
      await sceneImage.decode();
      if (token !== generation) return;
      photoImage.src = sceneImage.src;
      photoImage.alt = current.summary;
      await photoImage.decode();
      if (token !== generation) return;
      photoController.reset();
      clearTimeout(loadingTimer);
      setLoading(false);
      sceneTransition.reveal(photoImage);
      announce(`Đã mở ${current.title}, ${current.photograph?.date}.`);
      return;
    }
    enginePromise ??= import('pannellum').catch((error: unknown) => { enginePromise = undefined; throw error; });
    await Promise.all([enginePromise, sceneImage.decode()]);
    if (token !== generation) return;
    preview.onerror = null;
    preview.src = sceneImage.src;
    viewer = window.pannellum.viewer(panorama, {
      // Static mode preserves split textures on devices with smaller GPU limits.
      type: 'equirectangular', panorama: sceneImage.src,
      autoLoad: true, showControls: false, compass: false,
      disableKeyboardCtrl: true, keyboardZoom: false,
      yaw: current.initialYaw, pitch: current.initialPitch,
      hfov: window.innerWidth < 600 ? 80 : 100, minHfov: 65, maxHfov: 120,
      mouseZoom: true, friction: reducedMotion.matches ? 1 : 0.15,
      escapeHTML: true, backgroundColor: [0.07, 0.10, 0.08],
      strings: { loadingLabel: 'Đang mở cảnh…', fileAccessError: 'Chưa tải được ảnh.', genericWebGLError: 'Trình duyệt chưa mở được cảnh này.', noWebGLError: 'Trình duyệt này chưa hỗ trợ cách xem này.' },
      hotSpots: current.hotspots.map((spot) => ({
        pitch: window.innerWidth < 600 || (window.innerHeight <= 500 && window.innerWidth > window.innerHeight) ? 8 : spot.pitch,
        yaw: spot.yaw, cssClass: 'scene-hotspot',
        createTooltipFunc: (element: HTMLElement) => {
          const button = document.createElement('button');
          button.className = 'hotspot-button';
          button.type = 'button';
          button.setAttribute('aria-label', `Chuyển điểm: ${spot.label}`);
          button.innerHTML = `<span class="hotspot-circle">${icon('arrow')}</span><span class="hotspot-caption">${escape(spot.label)}</span>`;
          button.addEventListener('click', (event) => { event.stopPropagation(); selectScene(spot.targetId); });
          element.append(button);
        },
      })),
    });
    const onLoaded = () => {
      if (token !== generation) return;
      clearTimeout(loadingTimer);
      // The library creates hotspot children after firing load. Let their first
      // paint finish before exposing a completed scene, including reduced motion.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (token !== generation) return;
        setLoading(false);
        motion.setViewer(viewer, true);
        sceneTransition.reveal(panorama);
        announce(`Đã mở ${current.title}.`);
      }));
    };
    viewer.on('load', onLoaded);
    viewer.on('error', () => failScene(token));
    if (viewer.isLoaded()) onLoaded();
    else if (panorama.querySelector<HTMLElement>('.pnlm-error-msg')?.style.display === 'table') failScene(token);
  } catch { failScene(token); }
}

function selectScene(id: string, fromHistory = false) {
  const next = scenes.find((scene) => scene.id === id);
  if (!next || (current.id === next.id && get('viewer-error').hidden)) return;
  sceneTransition.capture(viewer, current.format !== 'photo' && next.format !== 'photo' && eraOf(current) === eraOf(next));
  current = next;
  renderScene();
  if (!fromHistory) writeHash();
  void loadScene();
}

function stepScene(direction: number) {
  const items = visibleScenes();
  selectScene(items[(items.indexOf(current) + direction + items.length) % items.length].id);
}

function chooseEra(era: Era) {
  const id = remembered.get(era) ?? scenes.find(scene => eraOf(scene) === era)?.id;
  if (id) selectScene(id);
}

function chooseCollection(collection: Collection) {
  const era = eraOf(current);
  const id = remembered.get(`${era}:${collection}`) ?? scenes.find(scene => eraOf(scene) === era && collectionOf(scene) === collection)?.id;
  if (id) selectScene(id);
}

function turn(yaw: number, pitch: number) {
  motion.stop();
  if (current.format === 'photo') photoController.move(-yaw * 8, pitch * 8);
  else {
    if (yaw) viewer?.setYaw(viewer.getYaw() + yaw, duration());
    if (pitch) viewer?.setPitch(Math.max(-85, Math.min(85, viewer.getPitch() + pitch)), duration());
  }
}

function zoom(direction: number) {
  motion.stop();
  if (current.format === 'photo') photoController.zoom(direction > 0 ? 1.3 : 1 / 1.3);
  else viewer?.setHfov(viewer.getHfov() - direction * 10, duration());
}

function resetView() {
  motion.stop();
  if (current.format === 'photo') photoController.reset();
  else viewer?.lookAt(current.initialPitch, current.initialYaw, window.innerWidth < 600 ? 80 : 100, duration());
}

function setPresentation(active: boolean) {
  presentation = active;
  if (!active) motion.stop();
  document.body.classList.toggle('presentation', active);
  get('presentation-tools').hidden = !active;
  get('immersive-button').setAttribute('aria-pressed', String(active));
  get('presentation-button').setAttribute('aria-pressed', String(active));
  get('presentation-button').setAttribute('aria-label', active ? 'Trở lại các nút điều khiển' : 'Ngắm cảnh');
  get('presentation-exit').hidden = !active;
  if (active) get('presentation-exit').focus();
  else (current.format === 'photo' ? photoView : panorama).focus({ preventScroll: true });
  viewer?.resize();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else announce('Trình duyệt này chưa hỗ trợ toàn màn hình. Bạn vẫn có thể dùng chế độ Ngắm cảnh.');
  } catch { announce('Chưa thể mở toàn màn hình trên trình duyệt này. Bạn vẫn có thể dùng chế độ Ngắm cảnh.'); }
}

let audioContext: AudioContext | undefined;
let ambienceGain: GainNode | undefined;
let ambienceFilter: BiquadFilterNode | undefined;
let ambiencePulse: OscillatorNode | undefined;
let ambienceDepth: GainNode | undefined;
let ambienceOn = false;
let ambiencePausedForPlayback = false;
let audioOpQueue: Promise<void> = Promise.resolve();

function updateAmbienceScene() {
  if (!audioContext || !ambienceFilter || !ambiencePulse || !ambienceDepth) return;
  const water = current.id.startsWith('thach-han') || current.id.startsWith('citadel-wall')
    || ['hao-thanh', 'quang-tri-northeast-1967', 'hien-luong-bridge-2016'].includes(current.id);
  const now = audioContext.currentTime;
  ambienceFilter.frequency.cancelScheduledValues(now);
  ambienceFilter.frequency.setTargetAtTime(water ? 1100 : 450, now, 0.8);
  ambiencePulse.frequency.setTargetAtTime(water ? 0.18 : 0.07, now, 0.8);
  ambienceDepth.gain.setTargetAtTime(water ? 90 : 160, now, 0.8);
}

function syncAmbienceUI(on: boolean) {
  for (const id of ['ambience-button', 'ambient-quick-button']) {
    const button = get(id);
    button.innerHTML = icon(on ? 'volume' : 'muted');
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', `${on ? 'Tắt' : 'Bật'} âm thanh thiên nhiên mô phỏng`);
    button.title = `Âm thanh: ${on ? 'đang bật' : 'đang tắt'}`;
  }
}

function audioUnavailable() {
  ambienceOn = false;
  syncAmbienceUI(false);
  announce('Trình duyệt chưa thể phát âm thanh. Các chức năng khác vẫn hoạt động.');
}

function syncAudioState() {
  // Mute immediately, even while an earlier resume is still pending.
  if ((!ambienceOn || document.hidden || slidesDialog.open) && audioContext && ambienceGain) {
    ambienceGain.gain.cancelScheduledValues(audioContext.currentTime);
    ambienceGain.gain.setValueAtTime(0, audioContext.currentTime);
  }
  audioOpQueue = audioOpQueue.then(async () => {
    if (!audioContext || !ambienceGain) return;
    if (ambienceOn && !document.hidden && !slidesDialog.open) await audioContext.resume();
    // A resume may finish after the user has muted or left the page.
    const audible = ambienceOn && !document.hidden && !slidesDialog.open;
    ambienceGain.gain.cancelScheduledValues(audioContext.currentTime);
    if (audible) ambienceGain.gain.setTargetAtTime(0.24, audioContext.currentTime, 0.35);
    else {
      ambienceGain.gain.setValueAtTime(0, audioContext.currentTime);
      await audioContext.suspend();
    }
  }).catch(audioUnavailable);
}

function setAmbience(on: boolean) {
  ambienceOn = on;
  try {
    if (ambienceOn && !audioContext) {
      const Context = window.AudioContext ?? window.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      audioContext = new Context();
      // A soft filtered noise bed: a synthetic soundscape, never archival audio.
      const buffer = audioContext.createBuffer(2, audioContext.sampleRate * 12, audioContext.sampleRate);
      const seam = Math.round(audioContext.sampleRate * 0.2);
      for (let channel = 0; channel < 2; channel++) {
        const values = buffer.getChannelData(channel);
        let previous = 0;
        for (let index = 0; index < values.length; index++) {
          previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
          values[index] = previous * 3.5;
        }
        for (let index = 0; index < seam; index++) {
          const mix = (index + 1) / seam;
          const tail = values.length - seam + index;
          values[tail] = values[tail] * (1 - mix) + values[index] * mix;
        }
      }
      const sound = audioContext.createBufferSource();
      sound.buffer = buffer; sound.loop = true; sound.loopStart = 0.2;
      ambienceFilter = audioContext.createBiquadFilter();
      ambienceFilter.type = 'lowpass'; ambienceFilter.frequency.value = 450;
      ambiencePulse = audioContext.createOscillator();
      ambienceDepth = audioContext.createGain();
      ambiencePulse.frequency.value = 0.07;
      ambienceDepth.gain.value = 160;
      ambiencePulse.connect(ambienceDepth).connect(ambienceFilter.frequency);
      updateAmbienceScene();
      ambienceGain = audioContext.createGain();
      ambienceGain.gain.value = 0;
      sound.connect(ambienceFilter).connect(ambienceGain).connect(audioContext.destination);
      ambiencePulse.start();
      sound.start();
    }
    syncAmbienceUI(ambienceOn);
    syncAudioState();
    announce(`Âm thanh thiên nhiên mô phỏng đã ${ambienceOn ? 'bật' : 'tắt'}.`);
  } catch { audioUnavailable(); }
}

function toggleAmbience() {
  ambiencePausedForPlayback = false;
  setAmbience(!ambienceOn);
}

function syncPlaybackAudio(playing: boolean) {
  if (!playing) {
    ambiencePausedForPlayback = ambienceOn;
    if (ambienceOn) setAmbience(false);
  } else if (ambiencePausedForPlayback) {
    ambiencePausedForPlayback = false;
    setAmbience(true);
  }
}

get('previous-scene').addEventListener('click', () => stepScene(-1));
get('next-scene').addEventListener('click', () => stepScene(1));
get('retry-button').addEventListener('click', () => void loadScene());
get('zoom-in').addEventListener('click', () => zoom(1));
get('zoom-out').addEventListener('click', () => zoom(-1));
get('look-up').addEventListener('click', () => turn(0, 15));
get('look-down').addEventListener('click', () => turn(0, -15));
get('look-left').addEventListener('click', () => turn(-20, 0));
get('look-right').addEventListener('click', () => turn(20, 0));
get('reset-view').addEventListener('click', resetView);
get('fullscreen-button').addEventListener('click', () => void toggleFullscreen());
get('slides-button').addEventListener('click', () => slides.open());
get('slides-scene-select').addEventListener('change', event => selectScene((event.target as HTMLSelectElement).value));
get('presentation-button').addEventListener('click', () => {
  infoDialog.close();
  if (slidesDialog.open) slidesDialog.close();
  setPresentation(!presentation);
});
get('immersive-button').addEventListener('click', () => setPresentation(!presentation));
get('presentation-exit').addEventListener('click', () => setPresentation(false));
get('ambience-button').addEventListener('click', () => void toggleAmbience());
get('ambient-quick-button').addEventListener('click', () => void toggleAmbience());
panorama.addEventListener('pointerdown', () => motion.stop(), { passive: true });
panorama.addEventListener('wheel', () => motion.stop(), { passive: true });
document.querySelector('.scene-strip')!.addEventListener('click', event => {
  const button = (event.target as HTMLElement).closest<HTMLElement>('[data-scene]');
  if (button?.dataset.scene) selectScene(button.dataset.scene);
});
document.querySelectorAll<HTMLElement>('[data-era]').forEach(button => button.addEventListener('click', () => chooseEra(button.dataset.era as Era)));
document.querySelectorAll<HTMLElement>('[data-collection]').forEach(button => button.addEventListener('click', () => chooseCollection(button.dataset.collection as Collection)));
document.querySelector<HTMLAnchorElement>('.skip-link')!.addEventListener('click', (event) => { event.preventDefault(); openDialog(infoDialog, 'story'); });
window.addEventListener('hashchange', () => {
  const scene = fromHash();
  if (scene) selectScene(scene.id, true);
  else {
    selectScene(scenes[0].id, true);
    writeHash(true);
  }
  slides.syncRoute();
});
document.addEventListener('fullscreenchange', () => {
  get('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Thoát toàn màn hình' : 'Mở toàn màn hình');
  viewer?.resize();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) motion.stop();
  if (!audioContext) return;
  syncAudioState();
});
document.addEventListener('keydown', (event) => {
  const target = event.target as HTMLElement;
  if ([infoDialog, helpDialog].some(dialog => dialog.open) || (slidesDialog.open && !experience.contains(target)) || event.altKey || event.ctrlKey || event.metaKey) return;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'Escape' && presentation && !slidesDialog.open) { setPresentation(false); return; }
  if (event.key.toLowerCase() === 's' && !slidesDialog.open) { event.preventDefault(); slides.open(); return; }
  if (/^[1-9]$/.test(event.key) && visibleScenes()[Number(event.key) - 1]) { event.preventDefault(); selectScene(visibleScenes()[Number(event.key) - 1].id); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); void toggleFullscreen(); return; }
  if (event.key.toLowerCase() === 'p' && !slidesDialog.open) { event.preventDefault(); setPresentation(!presentation); return; }
  const isPanoramaTarget = target === panorama || panorama.contains(target);
  if ((!viewer && current.format !== 'photo') || (!isPanoramaTarget && target !== photoView && target !== document.body)) return;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-'].includes(event.key)) {
    if (event.key === 'ArrowLeft') turn(-10, 0);
    else if (event.key === 'ArrowRight') turn(10, 0);
    else if (event.key === 'ArrowUp') turn(0, 8);
    else if (event.key === 'ArrowDown') turn(0, -8);
    else if (event.key === '+' || event.key === '=') zoom(1);
    else if (event.key === '-') zoom(-1);
    event.preventDefault();
  }
});

renderScene();
writeHash(true);
void loadScene();
slides.syncRoute();
