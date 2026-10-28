// Tampilan dari desain Figma section "Project & Community Involvement - New Alternative UI - March 2026 - 3".
// Alurnya sama dengan Non-Mandatory di HSSE Objective; evidence opsional per kartu lewat modal "Upload Evidence" (setelah tersimpan: "Lihat Evidence") (Figma "Upload Evidence new version").
const MAX_FILE = 2 * 1024 * 1024;
const IG_URL = BACK.url;

const newAct = () => ({ periode: '2025', tanggal: '', lokasi: '', ket: '' });

// Sumber: Figma (belum ada Excel). Kartu ke-3 di Figma duplikat "Penugasan di luar Sasaran Kerja Utama" berkategori Community Involvement, jadi tidak dimasukkan.
// shortcut: keterangan & evidence masih teks contoh dari Figma, ganti saat daftar aktivitas resmi tersedia.
const KATEGORI = ['Community Involvement', 'Project Involvement'];
const cat = (id, kategori, name, desc, evidence, poin, max, kriteria) => ({ id, kategori, name, desc, evidence, poin, max, kriteria });
const EV_PROFESI = 'Dibuktikan dengan Dokumen kepengurusan atau keanggotaan di ikatan profesi';
const catalog = [
  cat('ci-1', 'Community Involvement', 'Keterlibatan dalam organisasi profesi/asosiasi sesuai bidang pekerjaan/background pendidikan',
    'Contoh: Pengurus Ikatan Ahli Geologi Indonesia (IAGI), Ikatan Dokter Indonesia (IDI), Ikatan Advokasi Indonesia (IAI)', EV_PROFESI, 5, 1, 'Jumlah Organisasi'),
  cat('ci-2', 'Community Involvement', 'Keterlibatan aktif dalam Kegiatan Tanggung Jawab Sosial dan Lingkungan (TJSL)',
    'Contoh: Pengurus Ikatan Ahli Geologi Indonesia (IAGI), Ikatan Dokter Indonesia (IDI), Ikatan Advokasi Indonesia (IAI)', EV_PROFESI, 5, 10, 'Jumlah Kegiatan'),
  cat('pi-1', 'Project Involvement', 'Penugasan di luar Sasaran Kerja Utama pada jangka waktu tertentu',
    'Contoh: a. Menjadi Pengajar Internal pada program pembelajaran Perusahaan b. Menjadi Narasumber KOMET pada bidang/expertise tertentu', EV_PROFESI, 15, 1, 'Jumlah Sharing KOMET'),
  cat('pi-2', 'Project Involvement', 'Keaktifan Pimpinan dalam review, feedback dan approval MyActivity',
    'Jika % approval MyActivity > 75% dalam 1 tahun kalender kerja', EV_PROFESI, 25, 1, 'Approval MyActivity'),
];

let items = [];        // aktivitas yang dipilih user (dibuat dari katalog)
let picks = {};        // draft jumlah aktivitas di layar Pemilihan: { catalogId: jumlah }
let evItem = null;     // item yang modal evidence-nya sedang terbuka; file disimpan di item.ev = { file, url }
let rekapSaved = false;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
const hydrateIcons = (root) => root.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
hydrateIcons(document);

// Pilihan alternatif UI disimpan per browser (kenyamanan saja, aman bila storage diblokir).
const store = {
  get(k, fallback) { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* abaikan */ } },
};
let pilihAlt = store.get('pci.pilihAlt', '1');

/* ---------- Aturan poin & kelengkapan ---------- */
const findCatalog = (id) => catalog.find((c) => c.id === id);
const findItem = (id) => items.find((i) => i.id === id);
const poinNow = (it) => it.poin_per * it.acts.length;
const locked = (it) => it.poin !== null && !it.editing;
const complete = (it) => locked(it) && !it.dirty && it.acts.length > 0;
// Simpan baru aktif bila minimal satu aktivitas punya Tanggal/Lokasi/Keterangan terisi (Periode tidak dihitung: selalu punya nilai default).
const filled = (it) => it.acts.some((a) => [a.tanggal, a.lokasi, a.ket].some((v) => v && v.trim()));
const missingFields = (a) => [!a.tanggal && 'tanggal', !a.lokasi.trim() && 'lokasi'].filter(Boolean);
const total = () => sum(items.map((i) => i.poin || 0)); // poin tidak dibatasi (sesuai sistem lama); "/target" = target Year End, hanya acuan
const allDone = () => items.length > 0 && items.every(complete);

console.assert(poinNow({ poin_per: 5, acts: [{}, {}] }) === 10, 'poin = poin × aktivitas');
console.assert(!complete({ poin: 5, editing: false, dirty: true, acts: [{}] }), 'belum simpan = belum lengkap');
console.assert(!filled({ acts: [{ periode: '2025', tanggal: '', lokasi: ' ', ket: '' }] }) && filled({ acts: [{ tanggal: '', lokasi: '', ket: '' }, { tanggal: '', lokasi: 'Jakarta', ket: '' }] }), 'Simpan aktif bila salah satu aktivitas terisi (kecuali Periode)');
console.assert(missingFields({ tanggal: '', lokasi: ' ' }).length === 2, 'tanggal & lokasi wajib');

/* ---------- Komponen bersama ---------- */
function makeFilter(wrap, tabs, onApply) {
  wrap.append($('#filterTpl').content.cloneNode(true));
  hydrateIcons(wrap);
  const btn = wrap.querySelector('.filter-btn');
  const pop = wrap.querySelector('.filter-pop');
  const search = pop.querySelector('input');
  const list = pop.querySelector('.filter-list');
  const tabBar = pop.querySelector('.filter-tabs');
  // `applied` berlaku di halaman; `picked` hanya pilihan di popup sampai Terapkan. Set kosong = tampilkan semua.
  const f = { applied: tabs.map(() => new Set()) };
  let picked = [];
  let tab = 0;

  const draw = () => {
    tabBar.innerHTML = tabs.map((t, i) => `<button type="button" class="filter-tab${i === tab ? ' active' : ''}" data-tab="${i}">${t.name}${
      picked[i].size ? ` <span class="count">${picked[i].size}</span>` : ''}</button>`).join('');
    const q = search.value.trim().toLowerCase();
    list.innerHTML = tabs[tab].options().filter((o) => o.toLowerCase().includes(q)).map((o) =>
      `<li><button type="button" data-opt="${esc(o)}" aria-pressed="${picked[tab].has(o)}">${esc(o)}${icon('material-symbols:check-rounded', 'check')}</button></li>`).join('');
  };
  const setOpen = (isOpen) => {
    pop.hidden = !isOpen;
    btn.setAttribute('aria-expanded', isOpen);
    if (!isOpen) return;
    picked = f.applied.map((s) => new Set(s));
    tab = 0;
    search.value = '';
    draw();
  };
  const label = () => { const n = sum(f.applied.map((s) => s.size)); btn.querySelector('span').textContent = n ? `Filter (${n})` : 'Filter'; };

  btn.addEventListener('click', () => setOpen(pop.hidden));
  search.addEventListener('input', draw);
  tabBar.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    tab = Number(t.dataset.tab);
    search.value = '';
    draw();
  });
  list.addEventListener('click', (e) => {
    const o = e.target.closest('[data-opt]')?.dataset.opt;
    if (o == null) return;
    picked[tab].has(o) ? picked[tab].delete(o) : picked[tab].add(o);
    draw();
  });
  pop.querySelector('[data-clear]').addEventListener('click', () => { picked.forEach((s) => s.clear()); draw(); });
  pop.querySelector('[data-apply]').addEventListener('click', () => { f.applied = picked; label(); setOpen(false); onApply(); });
  // composedPath, bukan target.closest: klik item me-render ulang list sehingga target sudah terlepas dari DOM.
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(wrap)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  return f;
}

// Jawaban dibaca dari event submit (pasti terpicu & sinkron), bukan event close yang bisa tidak terpicu ulang di Chrome.
let confirmResolve = null;
const answerConfirm = (yes) => { confirmResolve?.(yes); confirmResolve = null; };
function confirmBox(title, text) {
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  answerConfirm(false);
  $('#confirmDialog').showModal();
  return new Promise((resolve) => { confirmResolve = resolve; });
}
$('#confirmDialog form').addEventListener('submit', (e) => answerConfirm(e.submitter?.value === 'yes'));
$('#confirmDialog').addEventListener('cancel', () => answerConfirm(false));
$('#confirmDialog').addEventListener('click', (e) => {
  if (e.target !== e.currentTarget) return;
  e.currentTarget.close();
  answerConfirm(false);
});

// Pilihan alternatif UI ditaruh di tengah footer.
const FOOT_ALT = '<div class="alt-switch" id="footAlt" role="group" aria-label="Alternatif UI"></div>';
function altSwitch(el, options, current, onPick) {
  el.innerHTML = `<span>Alternatif UI</span>${options.map(([v, label]) =>
    `<button type="button" data-alt="${v}" aria-pressed="${v === current}">${label}</button>`).join('')}`;
  el.onclick = (e) => { const v = e.target.closest('[data-alt]')?.dataset.alt; if (v) onPick(v); };
}

const totalsHTML = () => `
  <div class="totals"><div><span><b class="big">${total()}</b><small>/${YEAR_END_TARGET.pci} Poin</small></span><span>Total Realisasi</span></div></div>`;
// Tombol kembali di kiri bawah footer (Figma Desktop 1619 / 1627), menggantikan panah di header — sama dengan HSSE Objective.
const backLink = (href, label) => `<a class="btn-outline" href="${href}">${icon('tabler:arrow-left')}${label}</a>`;
const nextLink = (href, enabled) => enabled
  ? `<a class="btn" href="${href}">Selanjutnya ${icon('tabler:arrow-right')}</a>`
  : `<button class="btn" disabled>Selanjutnya ${icon('tabler:arrow-right')}</button>`;
const fileSize = (f) => `${(f.size / 1024 / 1024).toFixed(1)} MB`;

/* ---------- 1. Pengisian realisasi ---------- */
const realFilter = makeFilter($('#realFilter'), [
  { name: 'Kategori', options: () => [...new Set(items.map((i) => i.kategori))] },
], () => renderReal());

// Pesan error per aktivitas, ringkas: hanya menyebut isian wajib yang masih kosong.
const actError = (miss) => miss.length ? `${miss.map((f) => (f === 'tanggal' ? 'Tanggal' : 'Lokasi')).join(' & ')} wajib diisi` : '';
console.assert(actError(['tanggal', 'lokasi']) === 'Tanggal & Lokasi wajib diisi' && actError(['lokasi']) === 'Lokasi wajib diisi' && actError([]) === '', 'pesan error aktivitas');

function actHTML(it, a, i) {
  const dis = locked(it) ? 'disabled' : '';
  const miss = it.showErrors ? missingFields(a) : [];
  const inv = (f) => (miss.includes(f) ? ' aria-invalid="true"' : '');
  return `
    <div class="act" data-act="${i}">
      <div class="act-head"><span class="chip chip-blue">Aktivitas ${i + 1}</span><span class="chip chip-blue">${it.poin_per} Poin</span>
        <span class="act-error" role="alert" data-act-error>${actError(miss)}</span>
        <button type="button" class="link-danger" data-del-act ${dis}>${icon('ic:round-delete')}Hapus</button></div>
      <div class="act-grid">
        <label>Periode<select data-field="periode" ${dis}>${['2025', '2024'].map((y) => `<option${y === a.periode ? ' selected' : ''}>${y}</option>`).join('')}</select></label>
        <label>Tanggal Pelaksanaan<input type="date" data-field="tanggal" value="${esc(a.tanggal)}" ${dis}${inv('tanggal')}></label>
        <label>Lokasi<input data-field="lokasi" value="${esc(a.lokasi)}" placeholder="Isi Lokasi Kegiatan" ${dis}${inv('lokasi')}></label>
      </div>
      <label class="full">Keterangan<textarea data-field="ket" rows="3" placeholder="Isi Keterangan" ${dis}>${esc(a.ket)}</textarea></label>
    </div>`;
}

function itemHTML(it) {
  const lock = locked(it);
  const canAdd = !lock && it.acts.length < it.max;
  return `
    <article class="hsse-item" data-item="${it.id}">
      <span class="ribbon">${poinNow(it)} Poin</span>
      <div class="hi-head">
        <div class="chips">
          <span class="chip chip-blue">${esc(it.kategori)}</span>
          <span class="chip chip-blue">Evidence: ${esc(it.evidence)}</span>
          <span class="chip chip-blue">Maksimal Aktivitas: ${it.max}</span>
          <span class="menu-wrap">
            <button type="button" class="icon-btn dots" data-menu aria-label="Menu aktivitas" aria-expanded="false" ${lock ? 'disabled' : ''}>${icon('ri:more-fill')}</button>
            <span class="menu" hidden>
              <button type="button" data-add-act ${canAdd ? '' : 'disabled'}>${icon('ic:round-plus')}Tambah Aktivitas</button>
              <button type="button" class="danger" data-del-all ${it.acts.length ? '' : 'disabled'}>${icon('ic:round-delete')}Hapus Semua Aktivitas</button>
            </span>
          </span>
        </div>
        <div class="hi-title">
          <div><h3>${esc(it.name)}</h3><p class="muted small">${esc(it.desc)}</p></div>
          <div class="hi-actions">
            ${lock ? `<button type="button" class="btn-outline" data-edit>${icon('mdi:pencil')}Edit</button>` : ''}
            <button type="button" class="btn-outline" data-evidence>${lock ? 'Lihat' : 'Upload'} Evidence</button>
            <button type="button" class="btn" data-save ${lock || !it.dirty || !filled(it) ? 'disabled' : ''}>${icon('fa-solid:save')}Simpan</button>
            <button type="button" class="icon-btn caret" data-toggle aria-expanded="${it.open}" aria-label="${it.open ? 'Tutup' : 'Buka'} aktivitas">${icon(it.open ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button>
          </div>
        </div>
        ${it.showErrors && it.error ? `<p class="error" role="alert">${it.error}</p>` : ''}
      </div>
      ${it.open ? `<div class="acts">${it.acts.map((a, i) => actHTML(it, a, i)).join('')}
        ${canAdd ? `<button type="button" class="add-tile" data-add-act>${icon('ic:round-plus')}Tambah Aktivitas</button>` : ''}</div>` : ''}
    </article>`;
}

function renderReal() {
  $('#addActivity').hidden = !items.length;
  const q = $('#realSearch').value.trim().toLowerCase();
  const [kats] = realFilter.applied;
  const shown = items.filter((i) => (!kats.size || kats.has(i.kategori)) && i.name.toLowerCase().includes(q));
  $('#realList').innerHTML = items.length
    ? shown.map(itemHTML).join('') || '<p class="empty">Tidak ada aktivitas yang cocok</p>'
    : `<div class="empty-state">
        <img src="assets/empty-illustration.svg" alt="" width="158" height="203">
        <h2>Kategori Aktivitas Anda Kosong</h2>
        <p class="muted">Silakan untuk memilih kategori aktivitas Anda di bawah ini</p>
        <a class="btn" href="#pilih">Mulai Mencari ${icon('tabler:arrow-right')}</a>
      </div>`;
  renderRealFoot();
}

// persist(): footer dirender ulang setiap perubahan (termasuk saat mengetik) → titik simpan yang lengkap.
const renderRealFoot = () => {
  $('#foot').innerHTML = `${backLink(IG_URL, `Kembali ke ${BACK.label}`)}<span class="foot-actions">${totalsHTML()}${nextLink('#rekap', allDone())}</span>`;
  persist();
};

$('#realList').addEventListener('click', async (e) => {
  const card = e.target.closest('[data-item]');
  const btn = e.target.closest('button');
  if (!card || !btn) return;
  const it = findItem(card.dataset.item);
  const actEl = btn.closest('[data-act]');
  const a = actEl && it.acts[Number(actEl.dataset.act)];

  if ('toggle' in btn.dataset) { it.open = !it.open; return renderReal(); }
  if ('evidence' in btn.dataset) { evItem = it; renderEvidence(); return $('#evidenceDialog').showModal(); }
  if ('menu' in btn.dataset) {
    const menu = btn.nextElementSibling;
    menu.hidden = !menu.hidden;
    return btn.setAttribute('aria-expanded', !menu.hidden);
  }
  if ('edit' in btn.dataset) { it.editing = true; it.open = true; return renderReal(); }
  if ('addAct' in btn.dataset) {
    if (it.acts.length >= it.max) return;
    it.acts.push(newAct());
    it.open = true;
    it.dirty = true;
    return renderReal();
  }
  if ('delAct' in btn.dataset || 'delAll' in btn.dataset) {
    const all = 'delAll' in btn.dataset;
    const ok = await confirmBox(all ? 'Apakah Anda ingin menghapus semua aktivitas?' : 'Apakah Anda ingin menghapus aktivitas?',
      'Jika semua list realisasi dihapus, maka akan menghilangkan kelompok aktivitas');
    if (!ok) return;
    all ? it.acts.splice(0) : it.acts.splice(it.acts.indexOf(a), 1);
    it.dirty = true;
    if (!it.acts.length) items = items.filter((i) => i !== it);
    rekapSaved = false;
    return renderReal();
  }
  if ('save' in btn.dataset) {
    const incomplete = it.acts.some((x) => missingFields(x).length);
    it.showErrors = incomplete || !it.acts.length;
    it.error = !it.acts.length ? 'Tambahkan minimal 1 aktivitas sebelum menyimpan.' : ''; // isian kosong: pesan per aktivitas (actError)
    if (it.showErrors) { it.open = true; return renderReal(); }
    if (!await confirmBox('Apakah Anda ingin menyimpan data realisasi?', 'Data realisasi akan berubah menjadi yang terbaru')) return;
    it.poin = poinNow(it);
    it.editing = it.dirty = false;
    rekapSaved = false;
    return renderReal();
  }
});

// Ketik di isian: simpan ke state tanpa render ulang (supaya fokus tidak hilang), cukup perbarui tombol & footer.
function onField(e) {
  const field = e.target.dataset.field;
  if (!field) return;
  const it = findItem(e.target.closest('[data-item]').dataset.item);
  it.acts[Number(e.target.closest('[data-act]').dataset.act)][field] = e.target.value;
  it.dirty = true;
  if (e.target.value.trim()) e.target.removeAttribute('aria-invalid');
  if (it.showErrors) { const el = e.target.closest('[data-act]'); el.querySelector('[data-act-error]').textContent = actError(missingFields(it.acts[Number(el.dataset.act)])); }
  e.target.closest('[data-item]').querySelector('[data-save]').disabled = !filled(it);
  renderRealFoot();
}
// Seluruh kepala kartu bisa diklik untuk buka/tutup (bukan hanya chevron), kecuali tombol, menu, isian, atau saat memblok teks.
$('#realList').addEventListener('click', (e) => {
  const head = e.target.closest('.hi-head');
  if (!head || e.target.closest('button, a, input, select, textarea, .menu-wrap') || getSelection().toString()) return;
  head.querySelector('[data-toggle]').click();
});
$('#realList').addEventListener('input', onField);
$('#realList').addEventListener('change', onField);
document.addEventListener('click', (e) => {
  document.querySelectorAll('.menu:not([hidden])').forEach((m) => {
    if (!e.composedPath().includes(m.parentElement)) {
      m.hidden = true;
      m.previousElementSibling.setAttribute('aria-expanded', 'false');
    }
  });
});
$('#realSearch').addEventListener('input', () => renderReal());

/* ---------- 2. Pemilihan aktivitas (Alt. 1 kartu, Alt. 2 dropdown/tabel, Alt. 3 dua panel) ---------- */
const openKat = new Set([KATEGORI[0]]);
const pilihFilter = makeFilter($('#pilihFilter'), [{ name: 'Kategori', options: () => KATEGORI }], () => renderPilih());
const pickedPoin = () => sum(Object.entries(picks).map(([id, n]) => findCatalog(id).poin * n));

function stepperHTML(c) {
  const n = picks[c.id] || 0;
  return `<div class="num-stepper">
    <button type="button" data-dec="${c.id}" aria-label="Kurangi ${esc(c.name)}" ${n <= 0 ? 'disabled' : ''}>${icon('ic:round-minus')}</button>
    <output aria-live="polite">${n}</output>
    <button type="button" data-inc="${c.id}" aria-label="Tambah ${esc(c.name)}" ${n >= c.max ? 'disabled' : ''}>${icon('ic:round-plus')}</button>
  </div>`;
}

function pickCardHTML(c, { removable = false } = {}) {
  return `
    <article class="pick-card${picks[c.id] && !removable ? ' selected' : ''}">
      <span class="ribbon">${c.poin} Point</span>
      <span class="chip chip-blue">${esc(c.kategori)}</span>
      <h3>${esc(c.name)}</h3>
      <p class="muted small">${esc(c.desc)}</p>
      <div class="pick-foot">
        <div><b class="ev-label">Evidence</b><p class="small">${esc(c.evidence)}</p></div>
        <div class="pick-count"><b>${esc(c.kriteria)}</b>${stepperHTML(c)}<small class="muted">Maks. ${c.max} aktivitas</small></div>
        ${removable ? `<button type="button" class="btn-outline danger" data-unpick="${c.id}">${icon('ic:round-delete')}Hapus</button>` : ''}
      </div>
    </article>`;
}

function renderPilih() {
  const q = $('#pilihSearch').value.trim().toLowerCase();
  const [kats] = pilihFilter.applied;
  const list = catalog.filter((c) => (!kats.size || kats.has(c.kategori)) && `${c.name} ${c.kategori} ${c.desc}`.toLowerCase().includes(q));
  const empty = '<p class="empty">Tidak ada aktivitas yang cocok</p>';
  // Alt. 3: cari & filter pindah ke judul kolom "Pilih Aktivitas" (Figma Two-Menus); jaga fokus/kursor & scroll panel saat render ulang.
  const search = $('#pilihSearch'), tools = [search.closest('.search'), $('#pilihFilter')];
  const typing = document.activeElement === search, caret = search.selectionStart;
  const scrolls = [...$('#pilihList').querySelectorAll('.pick-stack')].map((el) => el.scrollTop);
  $('#viewPilih .board-head').append(...tools);
  search.placeholder = pilihAlt === '3' ? 'Cari Kategori/Aktivitas' : 'Cari kategori aktivitas yang sesuai dengan Anda';

  if (pilihAlt === '1') {
    $('#pilihList').innerHTML = list.length ? `<div class="pick-grid">${list.map((c) => pickCardHTML(c)).join('')}</div>` : empty;
  } else if (pilihAlt === '2') {
    const groups = KATEGORI.map((k) => [k, list.filter((c) => c.kategori === k)]).filter(([, cs]) => cs.length);
    $('#pilihList').innerHTML = groups.map(([k, cs]) => `
      <details class="period" data-kat="${esc(k)}"${openKat.has(k) ? ' open' : ''}>
        <summary><b>${esc(k)}</b><span><span class="big">${sum(cs.map((c) => c.poin * (picks[c.id] || 0)))}</span><small> Poin</small></span>${icon('tabler:chevron-up', 'caret')}</summary>
        <div class="table-scroll"><table class="hsse-table">
          <thead><tr><th>Nama Aktivitas</th><th>Poin per Aktivitas</th><th>Maksimal Aktivitas</th><th>Kriteria Perhitungan</th><th>Keterangan</th><th>Evidence</th><th>Jumlah Aktivitas</th></tr></thead>
          <tbody>${cs.map((c) => `<tr class="${picks[c.id] ? 'selected' : ''}"><td>${esc(c.name)}</td><td>${c.poin}</td><td>${c.max}</td><td>${esc(c.kriteria)}</td>
            <td>${esc(c.desc)}</td><td>${esc(c.evidence)}</td><td>${stepperHTML(c)}</td></tr>`).join('')}</tbody>
        </table></div>
      </details>`).join('') || empty;
  } else {
    const chosen = catalog.filter((c) => picks[c.id]);
    $('#pilihList').innerHTML = `
      <div class="two-col">
        <section><div class="col-head"><h2 class="col-title">Pilih Aktivitas</h2><div class="col-tools" id="pilihTools"></div></div>
          <div class="pick-stack">${list.map((c) => pickCardHTML(c)).join('') || empty}</div></section>
        <section><div class="col-head"><h2 class="col-title">Aktivitas Terpilih</h2></div><div class="pick-stack chosen">${chosen.map((c) => pickCardHTML(c, { removable: true })).join('')
          || '<p class="empty">Aktivitas Anda masih kosong<br>Silakan untuk memilih terlebih dahulu</p>'}</div></section>
      </div>`;
    $('#pilihTools').append(...tools);
    $('#pilihList').querySelectorAll('.pick-stack').forEach((el, i) => { el.scrollTop = scrolls[i] || 0; });
  }
  if (typing) { search.focus(); search.setSelectionRange(caret, caret); }
  const n = pickedPoin();
  $('#foot').innerHTML = backLink('#isi', 'Kembali ke List Aktivitas') + FOOT_ALT + `<span class="foot-actions">
    <div class="totals"><div><span><b class="big">${n}</b><small> Poin</small></span><span>Total Poin Aktivitas Terpilih</span></div></div>
    <button type="button" class="btn" data-commit ${n ? '' : 'disabled'}>Selanjutnya ${icon('tabler:arrow-right')}</button></span>`;
  altSwitch($('#footAlt'), [['1', 'Alt. 1 Kartu'], ['2', 'Alt. 2 Dropdown'], ['3', 'Alt. 3 Two Menus']], pilihAlt, (v) => {
    pilihAlt = v;
    store.set('pci.pilihAlt', v);
    renderPilih();
  });
}

$('#pilihList').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.dataset.inc || b.dataset.dec || b.dataset.unpick;
  if (!id) return;
  const c = findCatalog(id);
  const n = picks[id] || 0;
  picks[id] = b.dataset.unpick ? 0 : Math.max(0, Math.min(c.max, n + (b.dataset.inc ? 1 : -1)));
  if (!picks[id]) delete picks[id];
  renderPilih();
});
$('#pilihList').addEventListener('toggle', (e) => {
  const k = e.target.dataset.kat;
  if (k) e.target.open ? openKat.add(k) : openKat.delete(k);
}, true);
$('#pilihSearch').addEventListener('input', () => renderPilih());

// Terapkan pilihan: item yang sudah ada dipertahankan (isian tidak hilang), jumlah aktivitas disesuaikan.
function commitPicks() {
  items = catalog.filter((c) => picks[c.id]).map((c) => {
    const it = findItem(c.id) || { ...c, poin_per: c.poin, acts: [], open: true, poin: null, editing: false, dirty: false, ev: null };
    const want = picks[c.id];
    if (it.acts.length !== want) {
      while (it.acts.length < want) it.acts.push(newAct());
      it.acts.splice(want);
      it.dirty = true;
      if (it.poin !== null) it.editing = true;
    }
    return it;
  });
  rekapSaved = false;
  location.hash = 'isi';
}

/* ---------- Evidence per aktivitas (modal, opsional) ---------- */
// Isi modal sama dengan Upload Evidence di Self Review: dropzone; file terunggah tampil di tengah dropzone.
// Setelah kartu disimpan, Hapus File disembunyikan (Figma "Upload Evidence new version - setelah simpan"); Ubah File tetap bisa.
function renderEvidence() {
  const ev = evItem.ev;
  $('#evidenceBox').innerHTML = ev
    ? `<div class="drop">${icon('line-md:file-twotone', 'file-ico')}
        <p class="file-name">${esc(ev.file.name)}</p><p class="muted">${fileSize(ev.file)}</p>
        <div class="file-actions">
          <button type="button" class="btn-outline" data-view>${icon('mdi:eye')}Lihat File</button>
          <button type="button" class="btn-outline" data-pick>${icon('iconamoon:swap-bold')}Ubah File</button>
          ${locked(evItem) ? '' : `<button type="button" class="btn-outline danger" data-del-file>${icon('mdi:trash')}Hapus File</button>`}
        </div>
      </div>`
    : `<div class="drop" data-drop>
        <img src="assets/upload-illustration.svg" alt="" width="64" height="62">
        <p class="link">Tarik dan lepaskan file yang Anda ingin unggah<br>(.pdf/.jpg max. 2MB)</p>
        <p class="muted">atau</p>
        <button type="button" class="btn" data-pick>Pilih File</button>
      </div>`;
  persist();
}

function setEvidence(f) {
  if (!f) return;
  if (!/\.(pdf|jpe?g)$/i.test(f.name) || f.size > MAX_FILE) return alert('File harus berformat PDF/JPG dan maksimal 2MB');
  if (evItem.ev) URL.revokeObjectURL(evItem.ev.url);
  evItem.ev = { file: f, url: URL.createObjectURL(f) };
  rekapSaved = false;
  renderEvidence();
}

$('#evidenceDialog [data-close]').addEventListener('click', () => $('#evidenceDialog').close());
$('#evidenceBox').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('pick' in b.dataset) return $('#fileInput').click();
  if ('view' in b.dataset) return window.open(evItem.ev.url, '_blank');
  if ('delFile' in b.dataset) {
    if (!await confirmBox('Apakah Anda ingin menghapus file evidence ini?', 'File evidence akan dihapus dan Anda harus melakukan upload kembali')) return;
    URL.revokeObjectURL(evItem.ev.url);
    evItem.ev = null;
    rekapSaved = false;
    renderEvidence();
  }
});
$('#evidenceBox').addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
$('#evidenceBox').addEventListener('dragleave', (e) => e.target.closest('[data-drop]')?.classList.remove('over'));
$('#evidenceBox').addEventListener('drop', (e) => {
  if (!e.target.closest('[data-drop]')) return;
  e.preventDefault();
  setEvidence(e.dataTransfer.files[0]);
});
$('#fileInput').addEventListener('change', (e) => {
  setEvidence(e.target.files[0]);
  e.target.value = '';
});

/* ---------- 3. Rekap realisasi (per kategori, Figma "Summary New Version") ---------- */
const rekapFilter = makeFilter($('#rekapFilter'), [
  { name: 'Kategori', options: () => [...new Set(items.map((i) => i.kategori))] },
], () => renderRekap());

const rekapRows = (list) => list.map((i) => `
  <tr><td>${esc(i.kategori)}</td><td>${esc(i.name)}</td><td>${esc(i.desc)}</td><td>${esc(i.evidence)}</td>
    <td>${i.ev ? `<button type="button" class="btn-outline" data-view-file="${i.id}">${icon('mdi:eye')}Lihat File</button>` : '-'}</td>
    <td>${i.acts.length}</td><td>${i.poin} Poin</td></tr>`).join('');

function renderRekap() {
  const q = $('#rekapSearch').value.trim().toLowerCase();
  const [kats] = rekapFilter.applied;
  const groups = KATEGORI.filter((k) => !kats.size || kats.has(k))
    .map((k) => [k, items.filter((i) => i.kategori === k && i.name.toLowerCase().includes(q))]).filter(([, list]) => list.length);
  const head = '<thead><tr><th>Kategori</th><th>Daftar Aktivitas</th><th>Keterangan</th><th>Evidence</th><th>File Lampiran Evidence</th><th>Jumlah Aktivitas</th><th>Total Poin</th></tr></thead>';

  $('#rekapList').innerHTML = groups.map(([k, list]) => `
      <details class="period" open>
        <summary><b>${esc(k)}</b>${icon('tabler:chevron-up', 'caret')}</summary>
        <div class="table-scroll"><table class="hsse-table">${head}<tbody>${rekapRows(list)}</tbody></table></div>
      </details>`).join('') || '<p class="empty">Tidak ada aktivitas yang cocok</p>';

  $('#foot').innerHTML = REVIEW ? totalsHTML() + `<span class="foot-actions"><a class="btn" href="${IG_URL}">Kembali ke ${BACK.label}</a></span>` : backLink('#isi', 'Kembali ke List Aktivitas') + `<span class="foot-actions">${totalsHTML()}
    ${rekapSaved ? `<button type="button" class="btn-outline" data-rekap-edit>${icon('mdi:pencil')}Edit</button>
      <a class="btn" href="${IG_URL}">Kembali ke ${BACK.label}</a>` : ''}
    <button type="button" class="btn" data-rekap-save ${rekapSaved ? 'disabled' : ''}>Simpan Data Realisasi</button></span>`;
  persist();
}
$('#rekapList').addEventListener('click', (e) => {
  const id = e.target.closest('[data-view-file]')?.dataset.viewFile;
  if (id) window.open(findItem(id).ev.url, '_blank');
});
$('#rekapSearch').addEventListener('input', () => renderRekap());

$('#foot').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('commit' in b.dataset) return commitPicks();
  if ('rekapSave' in b.dataset) {
    if (!await confirmBox('Apakah Anda ingin menyimpan data realisasi?', 'Data realisasi akan berubah menjadi yang terbaru')) return;
    rekapSaved = true;
    return renderRekap();
  }
  if ('rekapEdit' in b.dataset) { rekapSaved = false; location.hash = 'isi'; }
});

/* ---------- Routing: #isi, #pilih, #rekap ---------- */
function route() {
  let h = REVIEW ? 'rekap' : location.hash.slice(1) || 'isi';
  // Langkah berikutnya hanya bisa dibuka bila langkah sebelumnya selesai.
  if (h === 'rekap' && !allDone()) return location.replace('#isi');
  if (!['pilih', 'rekap'].includes(h)) h = 'isi';
  $('#viewReal').hidden = h !== 'isi';
  $('#viewPilih').hidden = h !== 'pilih';
  $('#viewRekap').hidden = h !== 'rekap';
  if (h === 'isi') renderReal();
  else if (h === 'pilih') { picks = Object.fromEntries(items.map((i) => [i.id, i.acts.length])); renderPilih(); }
  else renderRekap();
  document.querySelectorAll('.hsse-list').forEach((l) => { l.scrollTop = 0; });
}

// Tombol Tampilkan/Sembunyikan Alur: lihat ../profile.js (pilihan diingat lintas halaman).

/* ---------- Penyimpanan (localStorage per user login) ---------- */
// shortcut: tanpa backend, isian aktivitas disimpan di localStorage browser ini (file evidence hanya nama & ukurannya); ganti dengan API saat ada.
// `summary` dibaca halaman Individual Goal: total poin yang sudah disimpan = realisasi kartu Project & Community Involvement.
const DATA_KEY = `pr-pci-${REVIEW ? 'heru' : LOGIN}`;
const fileMeta = (f) => f && { name: f.name, size: f.size };
function persist() {
  if (REVIEW) return; // Evaluator hanya melihat
  const data = { rekapSaved,
    items: items.map((it) => ({ id: it.id, open: it.open, poin: it.poin, editing: it.editing, dirty: it.dirty, acts: it.acts, ev: fileMeta(it.ev?.file) })),
    summary: { total: total() } }; // evidence opsional → tidak dikirim ke Individual Goal
  try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* storage penuh/diblokir: tetap jalan tanpa simpan */ }
}
function restoreData() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(DATA_KEY)); } catch { /* abaikan */ }
  if (!d) return false;
  items = d.items.filter((s) => findCatalog(s.id)).map((s) => {
    const c = findCatalog(s.id);
    // File yang dipulihkan hanya nama & ukuran, jadi "Lihat File" membuka file pengganti (sama seperti Individual Goal).
    const ev = s.ev && { file: s.ev, url: URL.createObjectURL(new Blob([`Evidence: ${s.ev.name} (contoh prototype)`], { type: 'text/plain' })) };
    return { ...c, poin_per: c.poin, open: s.open, poin: s.poin, editing: !!s.editing, dirty: !!s.dirty, acts: s.acts.map((a) => ({ ...newAct(), ...a })), ev };
  });
  rekapSaved = !!d.rekapSaved;
  return true;
}
const restored = restoreData();

// Mode evaluator: rekap read-only berisi isian Heru yang tersimpan; bila belum ada, data contoh (Figma "Project & Community Involvement + Evidence").
if (REVIEW && !restored) {
  items = [['ci-1', 1], ['ci-2', 6], ['pi-1', 1]].map(([id, n]) => {
    const c = findCatalog(id);
    const acts = Array.from({ length: n }, () => ({ ...newAct(), tanggal: '2025-06-10', lokasi: 'Jakarta' }));
    const file = new File(['Evidence demo'], 'Evidence.pdf', { type: 'application/pdf' });
    return { ...c, poin_per: c.poin, acts, open: false, poin: c.poin * n, editing: false, dirty: false, ev: { file, url: URL.createObjectURL(file) } };
  });
}
if (REVIEW) {
  initReviewUI('Review Community Involvement');
}

window.addEventListener('hashchange', route);
route();
