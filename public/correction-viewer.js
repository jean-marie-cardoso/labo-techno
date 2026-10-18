/* Lecture du corrigé autorisé par le professeur. Navigation propre à cet écran. */
const PDF_BASE = new URL('/classe-calme/vendor/pdfjs/', location.origin);
const MAX_BYTES = 15 * 1024 * 1024;
let library;

function loadLibrary() {
  library ??= import(new URL('pdf.mjs', PDF_BASE).href).then(pdfjs => {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.mjs', PDF_BASE).href;
    return pdfjs;
  }).catch(error => { library = null; throw error; });
  return library;
}

function discard(task) {
  try { Promise.resolve(task?.destroy()).catch(() => {}); } catch (_) { /* Déjà fermé. */ }
}

export function createCorrectionViewer({ endpoint }) {
  const host = document.createElement('div');
  host.id = 'labo-classe-correction';
  host.style.cssText = 'all:initial!important;position:fixed!important;inset:0!important;z-index:2147483645!important;display:block!important;pointer-events:none!important;';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<style>
    :host{color-scheme:light;font-family:Arial,Helvetica,sans-serif}
    *{box-sizing:border-box}
    [hidden]{display:none!important}
    .viewer,.reopen{font-family:Arial,Helvetica,sans-serif}
    button,input{font:inherit}
    button{min-height:40px;padding:7px 12px;border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#172b43;cursor:pointer;font-size:14px;font-weight:700}
    button:hover{background:#e6edf5}button:disabled{opacity:.4;cursor:default}
    button:focus-visible,input:focus-visible,.scroller:focus-visible{outline:3px solid #3778e1;outline-offset:2px}
    .viewer{position:absolute;inset:0;display:flex;flex-direction:column;background:#e7ecf2;color:#172b43;pointer-events:auto}
    .toolbar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #cbd5e1;box-shadow:0 1px 6px #172b4310;z-index:1}
    .title{font-size:16px;margin:0 6px 0 0;font-weight:800}
    .group{display:flex;align-items:center;gap:6px}
    .page{width:58px;min-height:40px;padding:7px 4px;border:1px solid #cbd5e1;border-radius:9px;text-align:center;font-size:14px;color:inherit;background:#fff;font-variant-numeric:tabular-nums}
    .total,.zoom-label{font-size:14px;white-space:nowrap;font-variant-numeric:tabular-nums}
    .zoom-label{min-width:40px;text-align:center}
    .back{background:#153d65;color:white;border-color:#153d65}.back:hover{background:#245987}
    .scroller{flex:1;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;padding:12px;scrollbar-gutter:stable}
    .paper{width:max-content;min-width:100%;min-height:100%;display:flex;align-items:center;justify-content:center}
    canvas{display:block;background:#fff;box-shadow:0 2px 14px #14233535;flex:none}
    .status{max-width:36em;margin:auto;padding:24px;text-align:center;line-height:1.5;font-size:16px}
    .status p{margin:0 0 14px}
    .reopen{position:absolute;left:max(16px,env(safe-area-inset-left));bottom:max(16px,env(safe-area-inset-bottom));background:#153d65;color:white;border-color:#fff;box-shadow:0 3px 18px #14233535;font-size:15px;pointer-events:auto}
    @media(max-width:680px){.toolbar{gap:6px;padding:7px}.title{width:100%;font-size:15px}.group{gap:4px}button{padding:6px 9px}.zoom-label{display:none}.fullscreen{display:none}.back{font-size:12px}.scroller{padding:8px}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
  </style>
  <section class="viewer" role="dialog" aria-modal="true" aria-label="Correction de l’activité">
    <div class="toolbar" role="group" aria-label="Navigation dans la correction">
      <h2 class="title">Correction</h2>
      <div class="group"><button class="previous" type="button" aria-label="Page précédente">‹</button><input class="page" type="number" min="1" value="1" aria-label="Page du corrigé"><span class="total">/ …</span><button class="next" type="button" aria-label="Page suivante">›</button></div>
      <div class="group"><button class="fit" type="button">Page entière</button><button class="less" type="button" aria-label="Réduire le zoom">−</button><span class="zoom-label"></span><button class="more" type="button" aria-label="Agrandir le zoom">+</button><button class="fullscreen" type="button">Plein écran</button></div>
      <button class="back" type="button">Retour à l’activité</button>
    </div>
    <div class="scroller" tabindex="0" aria-label="Document de correction"><div class="paper"><canvas hidden role="img"></canvas><div class="status" role="status"><p>Chargement de la correction…</p><button class="retry" type="button" hidden>Réessayer</button></div></div></div>
  </section><button class="reopen" type="button" hidden>Revoir la correction</button>`;
  const $ = selector => root.querySelector(selector);
  const viewer = $('.viewer'), scroller = $('.scroller'), canvas = $('canvas');
  const previous = $('.previous'), next = $('.next'), pageInput = $('.page'), total = $('.total');
  const fitButton = $('.fit'), less = $('.less'), more = $('.more'), zoomLabel = $('.zoom-label');
  const fullScreen = $('.fullscreen'), back = $('.back'), reopen = $('.reopen');
  const status = $('.status'), message = $('.status p'), retryButton = $('.retry');
  let disposed = false, opened = true, pdf = null, loadingTask = null, renderTask = null;
  let abort = null, requestTimer = null, retryTimer = null, retryCount = 0;
  let loadVersion = 0, renderVersion = 0, frame = 0, page = 1, zoom = 'fit', fitScale = 1;
  let previousFocus = document.activeElement;

  function place() {
    const parent = document.fullscreenElement || document.body || document.documentElement;
    if (host.parentNode !== parent) parent.appendChild(host);
    if (opened) schedule();
  }

  function controls() {
    pageInput.value = String(page); pageInput.max = String(pdf?.numPages ?? 1);
    total.textContent = pdf ? '/ ' + pdf.numPages : '/ …';
    previous.disabled = !pdf || page <= 1; next.disabled = !pdf || page >= pdf.numPages;
    pageInput.disabled = fitButton.disabled = less.disabled = more.disabled = !pdf;
    fitButton.setAttribute('aria-pressed', String(zoom === 'fit'));
    zoomLabel.textContent = zoom === 'fit' ? '' : Math.round(zoom * 100) + ' %';
  }

  function schedule() {
    cancelAnimationFrame(frame);
    if (opened && !disposed) frame = requestAnimationFrame(render);
  }

  async function render() {
    if (!pdf || disposed || !opened || !scroller.clientWidth || !scroller.clientHeight) return;
    const version = ++renderVersion;
    renderTask?.cancel();
    try {
      const pdfPage = await pdf.getPage(page);
      if (version !== renderVersion || disposed || !opened) return;
      const initial = pdfPage.getViewport({ scale: 1 });
      const padding = innerWidth <= 680 ? 16 : 24;
      fitScale = Math.max(.05, Math.min((scroller.clientWidth - padding) / initial.width, (scroller.clientHeight - padding) / initial.height));
      const viewport = pdfPage.getViewport({ scale: zoom === 'fit' ? fitScale : zoom });
      const density = Math.min(devicePixelRatio || 1, 2, Math.sqrt(16000000 / (viewport.width * viewport.height)));
      const nextCanvas = document.createElement('canvas');
      nextCanvas.width = Math.max(1, Math.floor(viewport.width * density));
      nextCanvas.height = Math.max(1, Math.floor(viewport.height * density));
      renderTask = pdfPage.render({ canvasContext: nextCanvas.getContext('2d', { alpha: false }), viewport, transform: density === 1 ? null : [density, 0, 0, density, 0, 0] });
      await renderTask.promise;
      if (version !== renderVersion || disposed || !opened) return;
      canvas.width = nextCanvas.width; canvas.height = nextCanvas.height;
      canvas.style.width = Math.floor(viewport.width) + 'px'; canvas.style.height = Math.floor(viewport.height) + 'px';
      canvas.getContext('2d', { alpha: false }).drawImage(nextCanvas, 0, 0);
      canvas.setAttribute('aria-label', 'Page ' + page + ' sur ' + pdf.numPages);
      canvas.hidden = false; status.hidden = true;
    } catch (error) {
      if (version !== renderVersion || disposed || error?.name === 'RenderingCancelledException') return;
      showStatus('Cette page ne peut pas être affichée.', true);
    }
  }

  function showStatus(text, retry = false) {
    message.textContent = text; status.hidden = false; retryButton.hidden = !retry;
    if (!pdf) canvas.hidden = true;
  }

  function navigate(nextPage, nextZoom = zoom) {
    if (!pdf || disposed) return;
    const value = Math.max(1, Math.min(pdf.numPages, Math.round(Number(nextPage) || 1)));
    const scale = nextZoom === 'fit' ? 'fit' : Math.min(3, Math.max(.25, Number(nextZoom) || 1));
    const changed = page !== value || zoom !== scale;
    page = value; zoom = scale; controls();
    if (changed) {
      canvas.hidden = true;
      scroller.scrollTop = scroller.scrollLeft = 0;
      schedule();
    }
  }

  async function readPdf(response, signal) {
    if (!response.ok) throw new Error(response.status === 404 ? 'missing' : 'network');
    if (!/^application\/pdf(?:;|$)/i.test(response.headers.get('Content-Type') || '')) throw new Error('format');
    if (Number(response.headers.get('Content-Length')) > MAX_BYTES) throw new Error('size');
    if (!response.body?.getReader) {
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > MAX_BYTES) throw new Error('size');
      return new Uint8Array(bytes);
    }
    const reader = response.body.getReader(), chunks = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (signal.aborted) throw new DOMException('Annulé', 'AbortError');
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('size'); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let position = 0;
    for (const chunk of chunks) { bytes.set(chunk, position); position += chunk.byteLength; }
    return bytes;
  }

  async function load() {
    if (disposed) return;
    const version = ++loadVersion;
    clearTimeout(retryTimer); clearTimeout(requestTimer);
    abort?.abort(); discard(loadingTask); loadingTask = null;
    pdf = null; renderVersion++; renderTask?.cancel(); canvas.hidden = true; controls();
    showStatus('Chargement de la correction…');
    const controller = new AbortController(); abort = controller;
    requestTimer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, { credentials: 'omit', cache: 'no-store', signal: controller.signal, headers: { Accept: 'application/pdf' } });
      const bytes = await readPdf(response, controller.signal);
      clearTimeout(requestTimer); requestTimer = null;
      if (disposed || version !== loadVersion) return;
      const pdfjs = await loadLibrary();
      if (disposed || version !== loadVersion) return;
      loadingTask = pdfjs.getDocument({
        data: bytes, cMapUrl: new URL('cmaps/', PDF_BASE).href, cMapPacked: true,
        standardFontDataUrl: new URL('standard_fonts/', PDF_BASE).href,
        wasmUrl: new URL('wasm/', PDF_BASE).href, iccUrl: new URL('iccs/', PDF_BASE).href,
        isEvalSupported: false
      });
      const loaded = await loadingTask.promise;
      if (disposed || version !== loadVersion) { discard(loaded); return; }
      pdf = loaded; page = Math.min(page, pdf.numPages); retryCount = 0; controls(); schedule();
    } catch (error) {
      clearTimeout(requestTimer); requestTimer = null;
      if (disposed || version !== loadVersion) return;
      const text = error?.message === 'missing' ? 'Correction indisponible pour cette activité.' :
        error?.message === 'size' ? 'Ce corrigé est trop volumineux.' :
        error?.name === 'PasswordException' ? 'Ce corrigé est protégé.' : 'La correction ne peut pas être chargée. Réessayez.';
      showStatus(text, true);
      if (!['missing', 'size', 'format'].includes(error?.message) && error?.name !== 'PasswordException') {
        retryTimer = setTimeout(load, Math.min(30000, 2000 * 2 ** Math.min(retryCount++, 4)));
      }
    }
  }

  function close() {
    if (disposed || !opened) return;
    opened = false; viewer.hidden = true; reopen.hidden = false;
    renderVersion++; cancelAnimationFrame(frame); renderTask?.cancel();
    canvas.width = canvas.height = 0; canvas.hidden = true;
    if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
  }

  function open() {
    if (disposed || opened) return;
    previousFocus = document.activeElement; opened = true; viewer.hidden = false; reopen.hidden = true;
    place(); schedule(); back.focus({ preventScroll: true });
  }

  previous.onclick = () => navigate(page - 1);
  next.onclick = () => navigate(page + 1);
  pageInput.onchange = () => navigate(pageInput.value);
  fitButton.onclick = () => navigate(page, 'fit');
  less.onclick = () => navigate(page, Math.round((zoom === 'fit' ? fitScale : zoom) / 1.25 * 100) / 100);
  more.onclick = () => navigate(page, Math.round((zoom === 'fit' ? fitScale : zoom) * 1.25 * 100) / 100);
  back.onclick = close; reopen.onclick = open; retryButton.onclick = load;
  fullScreen.hidden = !document.fullscreenEnabled;
  fullScreen.onclick = async () => {
    try {
      // La racine conserve aussi les alertes du professeur au-dessus du corrigé.
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    } catch (_) { /* Le document occupe déjà tout l'espace disponible. */ }
  };
  root.addEventListener('keydown', event => {
    if (!opened || disposed || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.composedPath()[0];
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable) return;
    if (['PageDown', 'ArrowRight', 'PageUp', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      navigate(event.key === 'Home' ? 1 : event.key === 'End' ? pdf?.numPages : page + (event.key === 'PageDown' || event.key === 'ArrowRight' ? 1 : -1));
    } else if (event.key === 'Escape' && !document.fullscreenElement) {
      event.preventDefault(); close();
    } else if (event.key === 'Tab') {
      const buttons = [...root.querySelectorAll('button,input,[tabindex]')].filter(element => !element.disabled && !element.hidden && element.getClientRects().length);
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && target === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && target === last) { event.preventDefault(); first.focus(); }
    }
  });
  const observer = new ResizeObserver(schedule); observer.observe(scroller);
  document.addEventListener('fullscreenchange', place);
  place(); controls(); back.focus({ preventScroll: true }); load();

  return {
    open, close,
    destroy() {
      if (disposed) return;
      disposed = true; opened = false; loadVersion++; renderVersion++;
      clearTimeout(retryTimer); clearTimeout(requestTimer); cancelAnimationFrame(frame);
      abort?.abort(); renderTask?.cancel(); discard(loadingTask); loadingTask = null; pdf = null;
      observer.disconnect(); document.removeEventListener('fullscreenchange', place);
      canvas.width = canvas.height = 0; host.remove();
      if (previousFocus?.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus();
    }
  };
}
