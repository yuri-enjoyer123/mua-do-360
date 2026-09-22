import './style.css';
import 'pannellum/build/pannellum.css';
import { reconstructionNotice, scenes as panoramas, sources } from './content';
import { photoScenes, type TourScene } from './photographs';
import { createPhotoViewer } from './photo-viewer';
import { derivedScenes } from './derived-scenes';

const scenes: TourScene[] = [...panoramas, ...derivedScenes, ...photoScenes];
type Era = 'past' | 'present';
type Collection = 'panorama' | 'archive';
const eraOf = (scene: TourScene): Era => scene.era ?? 'past';
const collectionOf = (scene: TourScene): Collection => scene.format === 'photo' ? 'archive' : 'panorama';

type IconName = 'arrow' | 'chevron' | 'close' | 'book' | 'help' | 'expand' | 'volume' | 'muted' | 'eye' | 'drag' | 'plus' | 'minus' | 'external' | 'reset';
const paths: Record<IconName, string> = {
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

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#information-dialog">Đến nội dung điểm nhìn</a>
  <main class="experience" aria-label="Hành trình Mưa đỏ 360 độ">
    <h1 class="sr-only">Mưa đỏ — Quảng Trị qua những góc nhìn</h1>
    <div class="landscape" aria-hidden="true"><img id="scene-preview" src="${sceneAsset(current)}" alt="" fetchpriority="high" /></div>
    <div id="panorama" tabindex="0" role="region" aria-label="Không gian 360 độ. Kéo để nhìn quanh; dùng phím mũi tên khi đang tập trung vào không gian." aria-describedby="panorama-help"></div>
    <div class="photo-viewer" id="photo-viewer" tabindex="0" role="region" aria-label="Xem ảnh. Phóng to rồi kéo để xem chi tiết; phím mũi tên dịch chuyển ảnh." hidden><img id="document-photo" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="" draggable="false" /></div>
    <div class="tour-vignette" aria-hidden="true"></div>

    <div class="tour-ui">
      <div class="era-switch" role="group" aria-label="Chọn thời kỳ"><button data-era="past" aria-pressed="true">Quá khứ</button><button data-era="present" aria-pressed="false">Hiện tại</button></div>
      <div class="collection-switch" role="group" aria-label="Cách khám phá"><button data-collection="panorama" aria-pressed="true">Không gian 360°</button><button data-collection="archive" aria-pressed="false">Album ảnh</button></div>
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

    <div class="viewer-status" id="viewer-status" role="status" hidden><span class="loading-orbit" aria-hidden="true"></span><span>Đang mở không gian…</span></div>
    <section class="viewer-error" id="viewer-error" aria-label="Không thể mở ảnh" hidden><h2>Chưa mở được cảnh</h2><p>Ảnh chưa tải được hoặc trình duyệt chưa hỗ trợ chế độ xem này. Bạn có thể thử lại, chuyển điểm nhìn hoặc đọc tư liệu.</p><div><button class="primary-button" id="retry-button">Thử tải lại ${icon('reset')}</button><button class="text-button" data-open="story">Đọc câu chuyện</button></div></section>

    <button class="presentation-exit" id="presentation-exit" hidden>${icon('eye')}<span>Thoát trình chiếu</span><kbd>P</kbd></button>
    <div class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></div>
  </main>

  <dialog class="information-dialog" id="information-dialog" aria-labelledby="dialog-title">
    <div class="dialog-top"><button class="icon-button close-dialog" aria-label="Đóng bảng tư liệu">${icon('close')}</button></div>
    <h2 id="dialog-title">Thông tin cảnh</h2>
    <div class="dialog-tabs" role="tablist" aria-label="Nội dung tư liệu"><button role="tab" id="story-tab" aria-controls="story-panel" aria-selected="true" tabindex="0">Câu chuyện</button><button role="tab" id="sources-tab" aria-controls="sources-panel" aria-selected="false" tabindex="-1">Nguồn & phục dựng</button></div>
    <div class="dialog-scroll"><section id="story-panel" role="tabpanel" aria-labelledby="story-tab" tabindex="0"></section><section id="sources-panel" role="tabpanel" aria-labelledby="sources-tab" tabindex="0" hidden></section></div>
    <div class="dialog-footer">
      <button class="text-button" data-open="help">${icon('help')}Hướng dẫn</button>
      <button class="icon-button" id="ambience-button" aria-label="Bật âm thanh thiên nhiên mô phỏng" aria-pressed="false" title="Âm thanh mô phỏng: đang tắt">${icon('muted')}</button>
      <button class="icon-button" id="presentation-button" aria-label="Bật chế độ trình chiếu" aria-pressed="false" title="Trình chiếu (P)">${icon('eye')}</button>
    </div>
  </dialog>
  <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><button class="icon-button close-dialog" aria-label="Đóng hướng dẫn">${icon('close')}</button></div><h2 id="help-title">Cách xem</h2><p class="help-intro">Chọn Quá khứ hoặc Hiện tại, rồi chọn không gian 360° hoặc album ảnh. Mỗi cảnh có niên đại và tư liệu riêng.</p><div class="help-grid"><div>${icon('drag')}<h3>Nhìn quanh</h3><p>Kéo hoặc dùng bốn nút hướng để nhìn lên, xuống và sang hai bên. Trong album, phóng to rồi kéo xem chi tiết; chụm hai ngón tay hoặc dùng + / − để thu phóng.</p></div><div>${icon('arrow')}<h3>Chuyển điểm</h3><p>Chọn dấu mốc trong cảnh, ảnh ở thanh hành trình hoặc hai nút trước / sau.</p></div><div>${icon('book')}<h3>Đọc và đối chiếu</h3><p>Chọn Tư liệu bên tên cảnh để đọc bối cảnh, xem ảnh tham chiếu và đối chiếu nguồn.</p></div></div><div class="keyboard-help"><h3>Bàn phím</h3><p><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Nhìn quanh / dịch ảnh khi chọn vùng xem</p><p><kbd>1</kbd> đến <kbd>9</kbd> Chọn điểm trong dải ảnh đang mở <span>·</span> <kbd>F</kbd> Toàn màn hình <span>·</span> <kbd>P</kbd> Trình chiếu</p><p><kbd>Esc</kbd> Đóng bảng đang mở / thoát trình chiếu</p></div><p class="help-note">Đây là các góc nhìn minh họa 360°, không phải bản đồ đo đạc hay tuyến đi bộ liên tục. Âm thanh, nếu bật, là âm thanh thiên nhiên tổng hợp. Trải nghiệm không yêu cầu kính VR.</p></dialog>
`;

const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const panorama = get('panorama');
const preview = get<HTMLImageElement>('scene-preview');
const photoView = get('photo-viewer');
const photoImage = get<HTMLImageElement>('document-photo');
const photoController = createPhotoViewer(photoView, photoImage);
const infoDialog = get<HTMLDialogElement>('information-dialog');
const helpDialog = get<HTMLDialogElement>('help-dialog');
const announcement = get('announcement');
const allDialogs = [infoDialog, helpDialog];
const focusReturns = new WeakMap<HTMLDialogElement, HTMLElement>();
const experience = document.querySelector<HTMLElement>('.experience')!;
const sceneContext = document.querySelector<HTMLElement>('.scene-context')!;
function updatePhotoInset() {
  experience.style.setProperty('--context-end', `${sceneContext.getBoundingClientRect().bottom - experience.getBoundingClientRect().top}px`);
}
new ResizeObserver(updatePhotoInset).observe(sceneContext);
window.addEventListener('resize', updatePhotoInset);

function announce(text: string) { announcement.textContent = text; }

let stripKey = '';
function renderScene() {
  preview.src = sceneAsset(current);
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
  document.title = `${current.title} · Mưa đỏ 360°`;
  renderStory();
}

function renderStory() {
  get('dialog-title').textContent = get('story-tab').getAttribute('aria-selected') === 'true' ? current.title : 'Tư liệu & phục dựng';
  if (current.photograph) {
    const photo = current.photograph;
    get('story-panel').innerHTML = `<p class="story-lead">${escape(current.summary)}</p>${current.description.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}<button class="text-button" id="story-to-sources">Xem tư liệu của cảnh</button>`;
    get('story-to-sources').addEventListener('click', () => setTab('sources', true));
    get('sources-panel').innerHTML = `<div class="photo-source"><h3>${escape(photo.title)}</h3><p>${escape(photo.caption)}</p><p>${escape(photo.date)} · ${escape(photo.creator)}</p><p><a href="${escape(photo.sourceUrl)}" target="_blank" rel="noopener noreferrer">Hồ sơ ảnh và chú thích ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a></p><p><a href="${escape(photo.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escape(photo.license)}<span class="sr-only"> (mở thẻ mới)</span></a></p>${current.derivation ? `<p>${escape(current.derivation)}</p>` : '<p>Ảnh giữ nguyên khung hình và màu sắc của tệp từ nguồn.</p>'}<figure><a href="${asset(photo.file)}" target="_blank" rel="noopener noreferrer"><img src="${asset(photo.file)}" alt="${escape(photo.caption)}" width="${photo.width}" height="${photo.height}" loading="lazy" /></a><figcaption>${escape(photo.creator)} · ${escape(photo.date)}</figcaption></figure><details><summary>Phạm vi tư liệu</summary>${photo.notes.map(note => `<p>${escape(note)}</p>`).join('')}</details></div>`;
    return;
  }
  const references = sources.filter((source) => current.sourceIds.includes(source.id));
  const orderedSources = [...sources].sort((a, b) => Number(current.sourceIds.includes(b.id)) - Number(current.sourceIds.includes(a.id)));
  get('story-panel').innerHTML = `
    <p class="story-lead">${escape(current.summary)}</p>
    ${current.description.map((paragraph) => `<p>${escape(paragraph)}</p>`).join('')}
    <div class="evidence-block"><h3>Dữ kiện lịch sử</h3>
      <ul>${current.verified.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>
      <div class="inline-sources">${references.filter((source) => source.kind === 'historical').map((source) => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a>`).join('')}</div>
    </div>
    <div class="interpretation-block"><h3>Chi tiết minh họa</h3><ul>${current.interpretation.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div>
    <div class="literary-block"><h3>Liên hệ với tiểu thuyết</h3><p>${escape(current.literaryNote)}</p></div>
    <button class="text-button" id="story-to-sources">Xem nguồn và giới hạn ảnh</button>`;
  get('story-to-sources').addEventListener('click', () => setTab('sources', true));
  get('sources-panel').innerHTML = `
    <div class="source-notice"><h3>Về ảnh phục dựng</h3><p>${escape(reconstructionNotice)}</p><p>Cảnh toàn cảnh được phục dựng để minh họa không gian. Tư liệu giúp định hướng bối cảnh, không xác thực từng chi tiết trong hình. Đây không phải ảnh chụp tư liệu hay bản phục dựng khảo cổ.</p><p>Ảnh được tăng độ phân giải để giảm mờ khi nhìn quanh. Chi tiết bổ sung không phải chứng cứ lịch sử.</p><p>Các dấu chuyển điểm chỉ giúp điều hướng giữa những góc nhìn độc lập; chúng không xác nhận khoảng cách hay hướng đi thực tế.</p></div>
    <details class="archive-map"><summary>Bản đồ lưu trữ Quảng Trị</summary>
      <figure><a href="https://catalog.archives.gov/id/74797754" target="_blank" rel="noopener noreferrer" aria-label="Xem hồ sơ bản đồ Quảng Trị tại National Archives (mở thẻ mới)"><img src="${asset('archive/ams-quang-tri.webp')}" alt="Bản đồ AMS lưu trữ thể hiện sông Thạch Hãn, thị xã và khu Thành cổ Quảng Trị." width="1200" height="1332" loading="lazy" /></a>
      <figcaption>U.S. Army Topographic Command / National Archives, NAID 74797754. Chú giải trên bản đồ ghi thông tin đến năm 1968; hồ sơ lưu trữ ghi khoảng 1942–1972. Bản đồ này không xác nhận nguyên trạng năm 1972 hay vị trí các cảnh minh họa.</figcaption></figure>
      <a class="archive-credit" href="https://commons.wikimedia.org/wiki/File:AMS_-_Quang_Tri,_Vietnam_-_NARA_-_74797754.jpg" target="_blank" rel="noopener noreferrer">Bản gốc độ phân giải cao và thông tin public domain ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a>
    </details>
    <h3 class="sources-heading">Nguồn tham khảo</h3><p class="sources-intro">Nguồn lịch sử và nguồn về văn học được ghi riêng. Các liên kết mở trong thẻ mới.</p>
    <ul class="source-list">${orderedSources.map((source) => `<li><div><span class="source-kind">${source.kind === 'historical' ? 'Tư liệu lịch sử' : 'Nguồn về văn học'}</span><h4><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a></h4><p class="source-publisher">${escape(source.publisher)}</p><p>${escape(source.note)}</p>${current.sourceIds.includes(source.id) ? '<span class="source-relevance">Tham khảo cho điểm nhìn này</span>' : ''}</div></li>`).join('')}</ul>`;
}

function setTab(tab: 'story' | 'sources', focus = false) {
  for (const name of ['story', 'sources'] as const) {
    const selected = tab === name;
    get(`${name}-tab`).setAttribute('aria-selected', String(selected));
    get(`${name}-tab`).tabIndex = selected ? 0 : -1;
    get(`${name}-panel`).hidden = !selected;
  }
  get('dialog-title').textContent = tab === 'story' ? current.title : 'Tư liệu & phục dựng';
  infoDialog.querySelector('.dialog-scroll')!.scrollTop = 0;
  if (focus) get(`${tab}-tab`).focus();
}

function openDialog(dialog: HTMLDialogElement, tab?: 'story' | 'sources') {
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
  dialog.addEventListener('close', () => focusReturns.get(dialog)?.focus({ preventScroll: true }));
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], summary, [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
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
    focusReturns.set(helpDialog, get('scene-sources'));
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
  const url = `${location.pathname}${location.search}#scene=${encodeURIComponent(current.id)}`;
  if (replace) history.replaceState(null, '', url);
  else if (location.hash !== `#scene=${current.id}`) history.pushState(null, '', url);
}

function setLoading(loading: boolean) {
  get('viewer-status').hidden = !loading;
  panorama.setAttribute('aria-busy', String(loading));
  photoView.setAttribute('aria-busy', String(loading));
  document.body.classList.toggle('is-loading', loading);
}

function failScene(token: number) {
  if (token !== generation) return;
  generation++;
  clearTimeout(loadingTimer);
  setLoading(false);
  viewer?.destroy();
  viewer = undefined;
  panorama.hidden = true;
  photoView.hidden = true;
  get('viewer-error').hidden = false;
  document.body.classList.add('has-error');
  announce('Không thể tải không gian 360 độ. Bạn có thể thử tải lại, chuyển điểm nhìn hoặc đọc câu chuyện.');
}

async function loadScene() {
  const token = ++generation;
  clearTimeout(loadingTimer);
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
      announce(`Đã mở ${current.title}, ${current.photograph?.date}. Có thể phóng to và kéo xem ảnh.`);
      return;
    }
    enginePromise ??= import('pannellum').catch((error: unknown) => { enginePromise = undefined; throw error; });
    await Promise.all([enginePromise, sceneImage.decode()]);
    if (token !== generation) return;
    viewer = window.pannellum.viewer(panorama, {
      // Static mode preserves split textures on devices with smaller GPU limits.
      type: 'equirectangular', panorama: sceneImage.src,
      autoLoad: true, showControls: false, compass: false,
      disableKeyboardCtrl: true, keyboardZoom: false,
      yaw: current.initialYaw, pitch: current.initialPitch,
      hfov: window.innerWidth < 600 ? 80 : 100, minHfov: 65, maxHfov: 120,
      mouseZoom: true, friction: reducedMotion.matches ? 1 : 0.15,
      escapeHTML: true, backgroundColor: [0.07, 0.10, 0.08],
      strings: { loadingLabel: 'Đang mở không gian…', fileAccessError: 'Chưa tải được ảnh 360°.', genericWebGLError: 'Trình duyệt chưa mở được không gian 360°.', noWebGLError: 'Trình duyệt chưa hỗ trợ WebGL.' },
      hotSpots: current.hotspots.map((spot) => ({
        pitch: window.innerWidth < 600 ? 8 : spot.pitch, yaw: spot.yaw, cssClass: 'scene-hotspot',
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
        announce(`Đã mở điểm nhìn ${visibleScenes().indexOf(current) + 1}: ${current.title}. Kéo để nhìn quanh hoặc chọn dấu chuyển điểm.`);
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
  if (current.format === 'photo') photoController.move(-yaw * 8, pitch * 8);
  else {
    if (yaw) viewer?.setYaw(viewer.getYaw() + yaw, duration());
    if (pitch) viewer?.setPitch(Math.max(-85, Math.min(85, viewer.getPitch() + pitch)), duration());
  }
}

function zoom(direction: number) {
  if (current.format === 'photo') photoController.zoom(direction > 0 ? 1.3 : 1 / 1.3);
  else viewer?.setHfov(viewer.getHfov() - direction * 10, duration());
}

function resetView() {
  if (current.format === 'photo') photoController.reset();
  else viewer?.lookAt(current.initialPitch, current.initialYaw, window.innerWidth < 600 ? 80 : 100, duration());
}

function setPresentation(active: boolean) {
  presentation = active;
  document.body.classList.toggle('presentation', active);
  get('presentation-button').setAttribute('aria-pressed', String(active));
  get('presentation-button').setAttribute('aria-label', active ? 'Tắt chế độ trình chiếu' : 'Bật chế độ trình chiếu');
  get('presentation-exit').hidden = !active;
  if (active) get('presentation-exit').focus();
  else (current.format === 'photo' ? photoView : panorama).focus({ preventScroll: true });
  viewer?.resize();
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
    else announce('Trình duyệt này chưa hỗ trợ toàn màn hình. Bạn vẫn có thể dùng chế độ trình chiếu.');
  } catch { announce('Chưa thể mở toàn màn hình trên trình duyệt này. Bạn vẫn có thể dùng chế độ trình chiếu.'); }
}

let audioContext: AudioContext | undefined;
let ambienceGain: GainNode | undefined;
let ambienceOn = false;
async function toggleAmbience() {
  try {
    if (!audioContext) {
      const Context = window.AudioContext ?? window.webkitAudioContext;
      if (!Context) throw new Error('Audio unavailable');
      audioContext = new Context();
      // A soft filtered noise bed: a synthetic soundscape, never archival audio.
      const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 4, audioContext.sampleRate);
      const values = buffer.getChannelData(0);
      let previous = 0;
      for (let index = 0; index < values.length; index++) { previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02; values[index] = previous * 3.5; }
      const sound = audioContext.createBufferSource();
      sound.buffer = buffer; sound.loop = true;
      const filter = audioContext.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 650;
      ambienceGain = audioContext.createGain();
      ambienceGain.gain.value = 0;
      sound.connect(filter).connect(ambienceGain).connect(audioContext.destination);
      sound.start();
    }
    await audioContext.resume();
    ambienceOn = !ambienceOn;
    ambienceGain!.gain.setTargetAtTime(ambienceOn ? 0.24 : 0, audioContext.currentTime, 0.35);
    const button = get('ambience-button');
    button.innerHTML = icon(ambienceOn ? 'volume' : 'muted');
    button.setAttribute('aria-pressed', String(ambienceOn));
    button.setAttribute('aria-label', `${ambienceOn ? 'Tắt' : 'Bật'} âm thanh thiên nhiên mô phỏng`);
    button.title = `Âm thanh mô phỏng: ${ambienceOn ? 'đang bật' : 'đang tắt'}`;
    announce(`Âm thanh thiên nhiên mô phỏng ${ambienceOn ? 'đã bật' : 'đã tắt'}.`);
  } catch { announce('Trình duyệt chưa thể phát âm thanh. Các chức năng khác vẫn hoạt động.'); }
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
get('presentation-button').addEventListener('click', () => { infoDialog.close(); setPresentation(!presentation); });
get('presentation-exit').addEventListener('click', () => setPresentation(false));
get('ambience-button').addEventListener('click', () => void toggleAmbience());
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
});
document.addEventListener('fullscreenchange', () => {
  get('fullscreen-button').setAttribute('aria-label', document.fullscreenElement ? 'Thoát toàn màn hình' : 'Mở toàn màn hình');
  viewer?.resize();
});
document.addEventListener('visibilitychange', () => {
  if (!audioContext || !ambienceOn) return;
  if (document.hidden) void audioContext.suspend();
  else void audioContext.resume();
});
document.addEventListener('keydown', (event) => {
  if (allDialogs.some((dialog) => dialog.open) || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'Escape' && presentation) { setPresentation(false); return; }
  if (/^[1-9]$/.test(event.key) && visibleScenes()[Number(event.key) - 1]) { event.preventDefault(); selectScene(visibleScenes()[Number(event.key) - 1].id); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); void toggleFullscreen(); return; }
  if (event.key.toLowerCase() === 'p') { event.preventDefault(); setPresentation(!presentation); return; }
  if ((!viewer && current.format !== 'photo') || (target !== panorama && target !== photoView && target !== document.body)) return;
  if (event.key === 'ArrowLeft') turn(-10, 0);
  else if (event.key === 'ArrowRight') turn(10, 0);
  else if (event.key === 'ArrowUp') turn(0, 8);
  else if (event.key === 'ArrowDown') turn(0, -8);
  else if (event.key === '+' || event.key === '=') zoom(1);
  else if (event.key === '-') zoom(-1);
  else return;
  event.preventDefault();
});

renderScene();
writeHash(true);
void loadScene();
