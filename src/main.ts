import './style.css';
import 'pannellum/build/pannellum.css';
import { reconstructionNotice, scenes, sources } from './content';

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
const number = (index: number) => String(index + 1).padStart(2, '0');
const fromHash = () => {
  const id = new URLSearchParams(location.hash.slice(1)).get('scene');
  return scenes.find((scene) => scene.id === id);
};
const linkedScene = fromHash();
let current = linkedScene ?? scenes[0];
let started = Boolean(linkedScene);
let viewer: PanoramaViewer | undefined;
let enginePromise: Promise<unknown> | undefined;
let generation = 0;
let loadingTimer: ReturnType<typeof setTimeout> | undefined;
let presentation = false;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const duration = () => reducedMotion.matches ? 0 : 280;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <a class="skip-link" href="#scene-details">Đến nội dung điểm nhìn</a>
  <main class="experience" aria-label="Hành trình Mưa đỏ 360 độ">
    <div class="landscape" aria-hidden="true"><img id="scene-preview" alt="" fetchpriority="high" /><div class="landscape-shade"></div></div>
    <div id="panorama" tabindex="0" role="region" aria-label="Không gian 360 độ. Kéo để nhìn quanh; dùng phím mũi tên khi đang tập trung vào không gian." aria-describedby="panorama-help"></div>
    <div class="tour-vignette" aria-hidden="true"></div>

    <header class="site-header">
      <button class="wordmark" id="home-button" aria-label="Mưa đỏ — trở về phần giới thiệu"><span class="brand-symbol" aria-hidden="true">m<span>·</span></span><span>Mưa đỏ<small>MỘT HÀNH TRÌNH KÝ ỨC</small></span></button>
      <div class="header-center" aria-hidden="true"><span class="small-diamond"></span> QUẢNG TRỊ, 1972</div>
      <nav class="header-actions" aria-label="Thông tin trải nghiệm">
        <button class="text-button" data-open="sources">${icon('book')}<span>Tư liệu & câu chuyện</span></button>
        <button class="icon-button help-trigger" data-open="help" aria-label="Hướng dẫn trải nghiệm" title="Hướng dẫn">${icon('help')}</button>
      </nav>
    </header>

    <section class="introduction" aria-labelledby="intro-title">
      <div class="intro-content">
        <p class="eyebrow intro-eyebrow"><span></span> KHÔNG GIAN LỊCH SỬ · TRẢI NGHIỆM 360°</p>
        <h1 id="intro-title">Mưa đỏ<span>Một hành trình ký ức.</span></h1>
        <p class="intro-copy">Có những miền đất, mỗi tấc đất đều giữ lại một câu chuyện. Hãy chậm lại, nhìn quanh và lắng nghe ký ức bên dòng Thạch Hãn.</p>
        <div class="intro-actions"><button class="primary-button" id="start-button"><span>Bắt đầu hành trình</span>${icon('arrow')}</button><span class="intro-duration">4 điểm nhìn<span>Khám phá theo nhịp của bạn</span></span></div>
        <p class="intro-context">Gợi mở từ lịch sử Thành cổ Quảng Trị<br />và tiểu thuyết <i>Mưa đỏ</i> của nhà văn Chu Lai.<span class="ai-disclosure">Ảnh minh họa do AI tạo, có đối chiếu tư liệu.</span></p>
      </div>
      <div class="intro-side-note" aria-hidden="true"><span>01 — 04</span><div></div><span>LỊCH SỬ TRONG MỘT GÓC NHÌN KHÁC</span></div>
      <div class="intro-bottom"><span class="fine-rule"></span><span>MỘT KHOẢNG LẶNG ĐỂ NHỚ</span><span class="intro-orbit" aria-hidden="true">360°</span></div>
    </section>

    <div class="tour-ui">
      <div class="location-tag"><span class="live-dot"></span><span id="location-eyebrow"></span><span class="tag-divider"></span><span>KHÔNG GIAN 360°</span></div>
      <div class="scene-description" id="scene-details" tabindex="-1"><div class="scene-count"><span id="scene-number">01</span><span>/ 04</span></div><p id="scene-eyebrow" class="eyebrow"></p><h2 id="scene-title"></h2><p id="scene-summary"></p><button class="read-scene text-button" data-open="story">Đọc câu chuyện nơi này ${icon('arrow')}</button></div>
      <div class="view-controls" aria-label="Điều khiển góc nhìn">
        <button class="icon-button" id="zoom-in" aria-label="Phóng to" title="Phóng to (+)">${icon('plus')}</button>
        <button class="icon-button" id="zoom-out" aria-label="Thu nhỏ" title="Thu nhỏ (−)">${icon('minus')}</button>
        <span class="control-divider"></span>
        <button class="icon-button" id="reset-view" aria-label="Đặt lại góc nhìn" title="Đặt lại góc nhìn">${icon('reset')}</button>
        <button class="icon-button" id="fullscreen-button" aria-label="Mở toàn màn hình" title="Toàn màn hình (F)">${icon('expand')}</button>
        <button class="icon-button" id="ambience-button" aria-label="Bật âm thanh thiên nhiên mô phỏng" aria-pressed="false" title="Âm thanh mô phỏng: đang tắt">${icon('muted')}</button>
        <button class="icon-button" id="presentation-button" aria-label="Bật chế độ trình chiếu" aria-pressed="false" title="Trình chiếu (P)">${icon('eye')}</button>
      </div>
      <div class="explore-hint" id="panorama-help">${icon('drag')}<span>Kéo để nhìn quanh</span><span class="hint-dot">·</span><span>Chọn dấu mốc để chuyển điểm</span></div>
      <nav class="scene-navigation" aria-label="Bốn điểm nhìn">
        <div class="scene-nav-heading"><span>HÀNH TRÌNH</span><span class="scene-nav-rule"></span><span>04 ĐIỂM NHÌN</span></div>
        <div class="scene-nav-row"><button class="icon-button scene-step previous" id="previous-scene" aria-label="Điểm nhìn trước" title="Điểm nhìn trước">${icon('chevron')}</button><div class="scene-strip">${scenes.map((scene, index) => `<button class="scene-card" data-scene="${escape(scene.id)}" aria-label="Điểm nhìn ${index + 1}: ${escape(scene.title)}"><img src="${asset(`scenes/${scene.id}-thumb.webp`)}" alt="" loading="lazy" width="160" height="90" /><span class="scene-card-shade"></span><span class="scene-card-number">${number(index)}</span><span class="scene-card-title">${escape(scene.title)}</span><span class="scene-card-indicator" aria-hidden="true"></span></button>`).join('')}</div><button class="icon-button scene-step next" id="next-scene" aria-label="Điểm nhìn tiếp theo" title="Điểm nhìn tiếp theo">${icon('chevron')}</button></div>
      </nav>
    </div>

    <div class="viewer-status" id="viewer-status" role="status" hidden><span class="loading-orbit" aria-hidden="true"></span><span>Đang mở không gian…</span></div>
    <section class="viewer-error" id="viewer-error" aria-label="Không thể mở ảnh 360 độ" hidden><span class="eyebrow">BẠN VẪN CÓ THỂ ĐỌC CÂU CHUYỆN</span><h2>Không gian chưa thể mở.</h2><p>Ảnh 360° chưa tải được hoặc trình duyệt chưa hỗ trợ WebGL. Bạn có thể thử lại, chuyển điểm nhìn hoặc đọc tư liệu.</p><div><button class="primary-button" id="retry-button">Thử tải lại ${icon('reset')}</button><button class="text-button" data-open="story">Đọc câu chuyện ${icon('arrow')}</button></div></section>

    <button class="presentation-exit" id="presentation-exit" hidden>${icon('eye')}<span>Thoát trình chiếu</span><kbd>P</kbd></button>
    <footer class="reconstruction-label"><span class="notice-mark" aria-hidden="true">i</span><span>Phục dựng theo tư liệu <span class="notice-separator">·</span> Không phải ảnh chụp năm 1972</span><button class="notice-details" data-open="sources" aria-label="Đọc nguồn và giới hạn của bản phục dựng">${icon('external')}</button></footer>
    <div class="sr-only" id="announcement" role="status" aria-live="polite" aria-atomic="true"></div>
  </main>

  <dialog class="information-dialog" id="information-dialog" aria-labelledby="dialog-title"><div class="dialog-top"><span class="eyebrow">NHỮNG ĐIỀU CẦN BIẾT</span><button class="icon-button close-dialog" aria-label="Đóng bảng tư liệu">${icon('close')}</button></div><h2 id="dialog-title">Tư liệu & câu chuyện</h2><div class="dialog-tabs" role="tablist" aria-label="Nội dung tư liệu"><button role="tab" id="story-tab" aria-controls="story-panel" aria-selected="true" tabindex="0">Câu chuyện</button><button role="tab" id="sources-tab" aria-controls="sources-panel" aria-selected="false" tabindex="-1">Nguồn & phục dựng</button></div><div class="dialog-scroll"><section id="story-panel" role="tabpanel" aria-labelledby="story-tab" tabindex="0"></section><section id="sources-panel" role="tabpanel" aria-labelledby="sources-tab" tabindex="0" hidden></section></div><div class="dialog-footer">MƯA ĐỎ <span>Không gian để tìm hiểu và tưởng nhớ.</span></div></dialog>
  <dialog class="help-dialog" id="help-dialog" aria-labelledby="help-title"><div class="dialog-top"><span class="eyebrow">DÀNH MỘT CHÚT ĐỂ LÀM QUEN</span><button class="icon-button close-dialog" aria-label="Đóng hướng dẫn">${icon('close')}</button></div><h2 id="help-title">Đi theo nhịp của bạn.</h2><p class="help-intro">Bốn điểm nhìn độc lập, kết nối bằng những dấu mốc. Bạn tự chọn nơi muốn dừng lại.</p><div class="help-grid"><div>${icon('drag')}<h3>Nhìn quanh</h3><p>Kéo chuột hoặc vuốt màn hình. Cuộn chuột, chụm hai ngón tay hoặc dùng nút + / − để thay đổi góc nhìn.</p></div><div>${icon('arrow')}<h3>Chuyển điểm</h3><p>Chọn dấu mốc trong cảnh, ảnh ở thanh hành trình hoặc hai nút trước / sau.</p></div><div>${icon('book')}<h3>Đọc và đối chiếu</h3><p>Mở câu chuyện để đọc bối cảnh, tư liệu lịch sử và những lựa chọn khi phục dựng.</p></div></div><div class="keyboard-help"><h3>Bàn phím</h3><p><kbd>←</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>→</kbd> Nhìn quanh khi chọn không gian</p><p><kbd>1</kbd> — <kbd>4</kbd> Chuyển điểm <span>·</span> <kbd>F</kbd> Toàn màn hình <span>·</span> <kbd>P</kbd> Trình chiếu</p><p><kbd>Esc</kbd> Đóng bảng đang mở / thoát trình chiếu</p></div><p class="help-note">Đây là các góc nhìn minh họa 360°, không phải bản đồ đo đạc hay tuyến đi bộ liên tục. Âm thanh, nếu bật, là âm thanh thiên nhiên tổng hợp. Trải nghiệm không yêu cầu kính VR.</p></dialog>
`;

const get = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const panorama = get('panorama');
const preview = get<HTMLImageElement>('scene-preview');
const infoDialog = get<HTMLDialogElement>('information-dialog');
const helpDialog = get<HTMLDialogElement>('help-dialog');
const announcement = get('announcement');
const allDialogs = [infoDialog, helpDialog];
const focusReturns = new WeakMap<HTMLDialogElement, HTMLElement>();

function announce(text: string) { announcement.textContent = text; }

function renderScene() {
  const index = scenes.indexOf(current);
  preview.src = asset(current.panorama);
  get('scene-title').textContent = current.title;
  get('scene-eyebrow').textContent = current.eyebrow;
  get('location-eyebrow').textContent = current.title;
  get('scene-summary').textContent = current.summary;
  get('scene-number').textContent = number(index);
  document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) => {
    const selected = button.dataset.scene === current.id;
    button.classList.toggle('active', selected);
    if (selected) button.setAttribute('aria-current', 'location');
    else button.removeAttribute('aria-current');
  });
  document.title = started ? `${current.title} — Mưa đỏ 360°` : 'Mưa đỏ — Một hành trình ký ức 360°';
  renderStory();
}

function renderStory() {
  const references = sources.filter((source) => current.sourceIds.includes(source.id));
  get('story-panel').innerHTML = `<p class="eyebrow story-eyebrow">ĐIỂM NHÌN ${number(scenes.indexOf(current))} / 04</p><h3 class="story-title">${escape(current.title)}</h3><p class="story-lead">${escape(current.summary)}</p>${current.description.map((paragraph) => `<p>${escape(paragraph)}</p>`).join('')}<div class="evidence-block"><span class="section-kicker">01 / TƯ LIỆU LỊCH SỬ</span><h3>Những điều có thể đối chiếu</h3><ul>${current.verified.map((item) => `<li>${escape(item)}</li>`).join('')}</ul><div class="inline-sources">${references.filter((source) => source.kind === 'historical').map((source) => `<a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.publisher)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a>`).join('')}</div></div><div class="interpretation-block"><span class="section-kicker">02 / LỰA CHỌN PHỤC DỰNG</span><h3>Hình dung về một không gian</h3><ul>${current.interpretation.map((item) => `<li>${escape(item)}</li>`).join('')}</ul></div><div class="literary-block"><span class="section-kicker">03 / KẾT NỐI VĂN HỌC</span><h3>Từ không gian đến trang sách</h3><p>${escape(current.literaryNote)}</p></div><button class="text-button" id="story-to-sources">Xem nguồn & giới hạn phục dựng ${icon('arrow')}</button>`;
  get('story-to-sources').addEventListener('click', () => setTab('sources', true));
  get('sources-panel').innerHTML = `<div class="source-notice"><span class="section-kicker">VỀ NHỮNG HÌNH ẢNH BẠN ĐANG XEM</span><h3>Một bản phục dựng minh họa.</h3><p>${escape(reconstructionNotice)}</p><p>Toàn bộ ảnh toàn cảnh do AI tạo để minh họa không gian. Tư liệu giúp định hướng bối cảnh, không xác thực từng chi tiết trong hình. Đây không phải ảnh tư liệu hay bản phục dựng khảo cổ.</p><p>Các dấu chuyển điểm chỉ giúp điều hướng giữa những góc nhìn độc lập; chúng không xác nhận khoảng cách hay hướng đi thực tế.</p></div><h3 class="sources-heading">Nguồn tham khảo</h3><p class="sources-intro">Nguồn lịch sử và nguồn về văn học được ghi riêng. Các liên kết mở trong thẻ mới.</p><ol class="source-list">${sources.map((source, index) => `<li><span class="source-number">${number(index)}</span><div><span class="source-kind">${source.kind === 'historical' ? 'TƯ LIỆU LỊCH SỬ' : 'NGUỒN VỀ VĂN HỌC'}</span><h4><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${escape(source.title)} ${icon('external')}<span class="sr-only"> (mở thẻ mới)</span></a></h4><p class="source-publisher">${escape(source.publisher)}</p><p>${escape(source.note)}</p>${current.sourceIds.includes(source.id) ? '<span class="source-relevance">Tham khảo cho điểm nhìn này</span>' : ''}</div></li>`).join('')}</ol>`;
}

function setTab(tab: 'story' | 'sources', focus = false) {
  for (const name of ['story', 'sources'] as const) {
    const selected = tab === name;
    get(`${name}-tab`).setAttribute('aria-selected', String(selected));
    get(`${name}-tab`).tabIndex = selected ? 0 : -1;
    get(`${name}-panel`).hidden = !selected;
  }
  get('dialog-title').textContent = tab === 'story' ? 'Ký ức của một miền đất' : 'Tư liệu & phục dựng';
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
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-open]').forEach((button) => button.addEventListener('click', () => {
  const target = button.dataset.open;
  if (target === 'help') openDialog(helpDialog);
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
  document.body.classList.toggle('is-loading', loading);
}

function failScene(token: number) {
  if (token !== generation) return;
  clearTimeout(loadingTimer);
  setLoading(false);
  viewer?.destroy();
  viewer = undefined;
  panorama.hidden = true;
  get('viewer-error').hidden = false;
  document.body.classList.add('has-error');
  announce('Không thể tải không gian 360 độ. Bạn có thể thử tải lại, chuyển điểm nhìn hoặc đọc câu chuyện.');
}

async function loadScene() {
  const token = ++generation;
  clearTimeout(loadingTimer);
  viewer?.destroy();
  viewer = undefined;
  panorama.hidden = false;
  get('viewer-error').hidden = true;
  document.body.classList.remove('has-error');
  setLoading(true);
  loadingTimer = setTimeout(() => failScene(token), 25000);
  try {
    // Decode the selected image before handing it to Pannellum. This also keeps
    // a usable static preview when WebGL is unavailable, and avoids the viewer
    // library's XHR error path trying to parse a missing image response.
    const sceneImage = new Image();
    sceneImage.src = asset(current.panorama);
    enginePromise ??= import('pannellum').catch((error: unknown) => { enginePromise = undefined; throw error; });
    await Promise.all([enginePromise, sceneImage.decode()]);
    if (token !== generation || !started) return;
    viewer = window.pannellum.viewer(panorama, {
      type: 'equirectangular', panorama: sceneImage, dynamic: true, dynamicUpdate: true,
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
          button.innerHTML = `<span class="hotspot-circle">${icon('arrow')}</span><span class="hotspot-caption"><small>CHUYỂN ĐIỂM</small>${escape(spot.label)}</span>`;
          button.addEventListener('click', (event) => { event.stopPropagation(); selectScene(spot.targetId); });
          element.append(button);
        },
      })),
    });
    const onLoaded = () => {
      if (token !== generation) return;
      // Pannellum requires one dynamic update to initialize a decoded image.
      // Stop continuous updates once the static panorama has been uploaded.
      viewer?.setUpdate(false);
      clearTimeout(loadingTimer);
      setLoading(false);
      announce(`Đã mở điểm nhìn ${scenes.indexOf(current) + 1}: ${current.title}. Kéo để nhìn quanh hoặc chọn dấu chuyển điểm.`);
    };
    viewer.on('load', onLoaded);
    viewer.on('error', () => failScene(token));
    // An already-decoded image initializes synchronously; its load/error event
    // may occur inside the constructor before listeners can be attached.
    if (viewer.isLoaded()) onLoaded();
    else if (panorama.querySelector<HTMLElement>('.pnlm-error-msg')?.style.display === 'table') failScene(token);
  } catch { failScene(token); }
}

function selectScene(id: string, fromHistory = false) {
  const next = scenes.find((scene) => scene.id === id);
  if (!next || (current.id === next.id && started && get('viewer-error').hidden)) return;
  current = next;
  if (!started) { startTour(); return; }
  renderScene();
  if (!fromHistory) writeHash();
  void loadScene();
}

function startTour() {
  started = true;
  document.body.classList.add('has-started');
  document.querySelector<HTMLElement>('.introduction')!.inert = true;
  get('start-button').tabIndex = -1;
  renderScene();
  writeHash(true);
  void loadScene();
  panorama.focus({ preventScroll: true });
}

function goHome(fromHistory = false) {
  started = false;
  generation++;
  clearTimeout(loadingTimer);
  viewer?.destroy();
  viewer = undefined;
  setLoading(false);
  get('viewer-error').hidden = true;
  document.body.classList.remove('has-started', 'has-error');
  document.querySelector<HTMLElement>('.introduction')!.inert = false;
  get('start-button').tabIndex = 0;
  setPresentation(false);
  if (!fromHistory) history.pushState(null, '', `${location.pathname}${location.search}`);
  renderScene();
  get('start-button').focus({ preventScroll: true });
}

function stepScene(direction: number) {
  selectScene(scenes[(scenes.indexOf(current) + direction + scenes.length) % scenes.length].id);
}

function setPresentation(active: boolean) {
  presentation = active;
  document.body.classList.toggle('presentation', active);
  get('presentation-button').setAttribute('aria-pressed', String(active));
  get('presentation-button').setAttribute('aria-label', active ? 'Tắt chế độ trình chiếu' : 'Bật chế độ trình chiếu');
  get('presentation-exit').hidden = !active;
  if (active) get('presentation-exit').focus();
  else if (started) panorama.focus({ preventScroll: true });
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

get('start-button').addEventListener('click', startTour);
get('home-button').addEventListener('click', () => goHome());
get('previous-scene').addEventListener('click', () => stepScene(-1));
get('next-scene').addEventListener('click', () => stepScene(1));
get('retry-button').addEventListener('click', () => void loadScene());
get('zoom-in').addEventListener('click', () => viewer?.setHfov(viewer.getHfov() - 10, duration()));
get('zoom-out').addEventListener('click', () => viewer?.setHfov(viewer.getHfov() + 10, duration()));
get('reset-view').addEventListener('click', () => viewer?.lookAt(current.initialPitch, current.initialYaw, window.innerWidth < 600 ? 80 : 100, duration()));
get('fullscreen-button').addEventListener('click', () => void toggleFullscreen());
get('presentation-button').addEventListener('click', () => setPresentation(!presentation));
get('presentation-exit').addEventListener('click', () => setPresentation(false));
get('ambience-button').addEventListener('click', () => void toggleAmbience());
document.querySelectorAll<HTMLButtonElement>('[data-scene]').forEach((button) => button.addEventListener('click', () => selectScene(button.dataset.scene!)));
document.querySelector<HTMLAnchorElement>('.skip-link')!.addEventListener('click', (event) => { event.preventDefault(); openDialog(infoDialog, 'story'); });
window.addEventListener('hashchange', () => {
  const scene = fromHash();
  if (scene) selectScene(scene.id, true);
  else if (!location.hash && started) goHome(true);
  else if (started) writeHash(true);
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
  if (allDialogs.some((dialog) => dialog.open) || !started || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return;
  if (event.key === 'Escape' && presentation) { setPresentation(false); return; }
  if (/^[1-4]$/.test(event.key)) { event.preventDefault(); selectScene(scenes[Number(event.key) - 1].id); return; }
  if (event.key.toLowerCase() === 'f') { event.preventDefault(); void toggleFullscreen(); return; }
  if (event.key.toLowerCase() === 'p') { event.preventDefault(); setPresentation(!presentation); return; }
  if (!viewer || (target !== panorama && target !== document.body)) return;
  const yaw = viewer.getYaw();
  const pitch = viewer.getPitch();
  if (event.key === 'ArrowLeft') viewer.setYaw(yaw - 10, duration());
  else if (event.key === 'ArrowRight') viewer.setYaw(yaw + 10, duration());
  else if (event.key === 'ArrowUp') viewer.setPitch(pitch + 8, duration());
  else if (event.key === 'ArrowDown') viewer.setPitch(pitch - 8, duration());
  else if (event.key === '+' || event.key === '=') viewer.setHfov(viewer.getHfov() - 10, duration());
  else if (event.key === '-') viewer.setHfov(viewer.getHfov() + 10, duration());
  else return;
  event.preventDefault();
});

renderScene();
if (started) startTour();
