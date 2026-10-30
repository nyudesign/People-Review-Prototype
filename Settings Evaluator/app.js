// Tampilan dari desain Figma section "Settings Evaluator": Evaluee memilih satu Evaluator (pilih langsung,
// lewat pencarian, atau lewat filter), bisa menghapus pilihannya, lalu submit dengan konfirmasi.

// shortcut: data evaluator contoh (dari Figma), ganti dengan API master pekerja saat ada.
const EVALUATORS = [
  ['Oka Fitrio', '1905416', 'SDM', 'Human Capital Management', 'Talent Development & Recruitment', 'Manager Performance & Competency Mgt'],
  ['Arif Budiman', '750064', 'Manajemen Risiko', 'Operational Risk Management', 'Technology &Asset Integrity Risk &BCM', 'Manager Business Continuity'],
  ['Roehim Nuranas', '752579', 'Pertamina', 'Internal Audit', 'Policy Setting, Planning, & Monitoring', 'Sr Officer I Audit Relation'],
  ['Wisnu Harviyanto', '741663', 'Pertamina', 'Internal Audit', 'Policy Setting, Planning, & Monitoring', 'Sr Officer I Audit Relation'],
  ['Muhamad Fadlin Ananta', '754933', 'SDM', 'Human Capital Management', 'Talent Development & Recruitment', 'Analyst I Perf.& Comp.Mgt'],
  ['Angen Dian Farella', '752516', 'Manajemen Risiko', 'Operational Risk Management', 'Technology &Asset Integrity Risk &BCM', 'Analyst II Business Continuity'],
].map(([name, nopek, dir, fungsi, divisi, title]) => ({ name, nopek, dir, fungsi, divisi, title, company: 'PT Pertamina (Persero)' }));
const PAGE_SIZE = 6; // 3 baris × 2 kolom (Figma); hanya 1 halaman → pager disembunyikan

/* ---------- Penyimpanan di localStorage (per user login) ---------- */
// shortcut: tanpa backend, pilihan disimpan di localStorage browser ini; ganti dengan API saat ada.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
const SELF = { heru: '19050193', oka: '1905416', aryo: '777777' }[LOGIN]; // diri sendiri tidak bisa jadi Evaluator
const list = EVALUATORS.filter((e) => e.nopek !== SELF);
const STORE_KEY = `pr-evaluator-${LOGIN}`; // dibaca juga oleh Beranda (../app.js) untuk kartu Evaluator
const stored = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();
// Evaluator sudah tersetting otomatis (sama dengan PEOPLE di ../app.js: Heru → Oka Fitrio);
// dipakai bila tidak ada pilihan tersimpan (termasuk pilihan yang dihapus lalu halaman dibuka ulang).
const DEFAULT_PICK = { heru: '1905416' }[LOGIN] ?? null;
const state = list.some((e) => e.nopek === stored?.nopek)
  ? { pick: stored.nopek, submitted: !!stored.submitted }
  : { pick: DEFAULT_PICK, submitted: !!DEFAULT_PICK };
// Tanpa pencarian/filter hanya kartu Evaluator ini yang tampil; tetap tampil (tombol Pilih) walau baru saja dihapus.
let shown = state.pick;
function persist() {
  const e = list.find((x) => x.nopek === state.pick);
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ ...state, nopek: state.pick, name: e?.name, title: e?.title })); return true; } catch { return false; }
}

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
const hydrateIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });
hydrateIcons();

/* ---------- Filter: disalin dari Individual Goal/app.js (makeFilter) ---------- */
function makeFilter(wrap, tabs, onApply) {
  wrap.append($('#filterTpl').content.cloneNode(true));
  hydrateIcons(wrap);
  const btn = wrap.querySelector('.filter-btn');
  const pop = wrap.querySelector('.filter-pop');
  const search = pop.querySelector('input');
  const items = pop.querySelector('.filter-list');
  const tabBar = pop.querySelector('.filter-tabs');
  // `applied` berlaku di halaman; `picked` hanya pilihan di popup sampai Terapkan. Set kosong = tampilkan semua.
  const f = { applied: tabs.map(() => new Set()) };
  let picked = [];
  let tab = 0;

  const draw = () => {
    tabBar.innerHTML = tabs.map((t, i) => `<button type="button" class="filter-tab${i === tab ? ' active' : ''}" data-tab="${i}">${t.name}${
      picked[i].size ? ` <span class="count">${picked[i].size}</span>` : ''}</button>`).join('');
    const q = search.value.trim().toLowerCase();
    items.innerHTML = tabs[tab].options().filter((o) => o.toLowerCase().includes(q)).map((o) =>
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
  const label = () => { const n = f.applied.reduce((a, s) => a + s.size, 0); btn.querySelector('span').textContent = n ? `Filter (${n})` : 'Filter'; };

  btn.addEventListener('click', () => setOpen(pop.hidden));
  search.addEventListener('input', draw);
  tabBar.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    tab = Number(t.dataset.tab);
    search.value = '';
    draw();
  });
  items.addEventListener('click', (e) => {
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
// Tab filter sesuai Figma Desktop 696; isi pilihan diambil dari data evaluator.
const FILTER_TABS = [['Perusahaan', 'company'], ['Direktorat', 'dir'], ['Fungsi', 'fungsi'], ['Divisi', 'divisi']]
  .map(([name, key]) => ({ name, key, options: () => [...new Set(list.map((e) => e[key]))] }));
const filter = makeFilter($('#evFilter'), FILTER_TABS, () => { page = 1; render(); });

/* ---------- Pagination: disalin dari ../app.js (Pilih Evaluee) ---------- */
let page = 1;
// Nomor yang tampil: 1, sekitar halaman aktif (minimal sampai 3), dan halaman terakhir; celahnya jadi "…".
function pageNumbers(cur, last) {
  const nums = [1, last];
  for (let n = Math.max(1, cur - 1); n <= Math.min(last, Math.max(cur + 1, 3)); n++) nums.push(n);
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}
function renderPager(nav, cur, pages) {
  nav.hidden = pages === 1;
  nav.innerHTML = `
    <button type="button" class="icon-btn" data-page="${cur - 1}" aria-label="Halaman sebelumnya"${cur === 1 ? ' disabled' : ''}>${icon('mdi:chevron-down', 'pg-prev')}</button>
    ${pageNumbers(cur, pages).map((n) => n === '…' ? '<span class="pg-gap">…</span>'
      : `<button type="button" class="pg" data-page="${n}"${n === cur ? ' aria-current="page"' : ''}>${n}</button>`).join('')}
    <button type="button" class="icon-btn" data-page="${cur + 1}" aria-label="Halaman berikutnya"${cur === pages ? ' disabled' : ''}>${icon('mdi:chevron-down', 'pg-next')}</button>`;
}

/* ---------- Daftar evaluator ---------- */
const card = (e) => {
  const on = e.nopek === state.pick;
  return `<article class="pick-card${on ? ' picked' : ''}">
    <span class="tag">${esc(e.company)}</span>
    <div>
      <h3>${esc(e.name)}</h3>
      <p class="nip">${e.nopek}</p>
      <p class="meta">${[e.dir, e.fungsi, e.divisi].map((t) => `<span>${esc(t)}</span>`).join('')}</p>
      <p class="title">${esc(e.title)}</p>
    </div>
    <button type="button" class="btn-outline pick-btn" data-pick="${e.nopek}" aria-pressed="${on}" aria-label="${on ? 'Hapus' : 'Pilih'} ${esc(e.name)}">
      <span class="add">${icon('akar-icons:plus')}Pilih</span><span class="on">${icon('material-symbols:check-rounded')}Terpilih</span><span class="off">${icon('material-symbols:close-rounded')}Hapus</span>
    </button>
  </article>`;
};
function render() {
  const q = $('#evSearch').value.trim().toLowerCase();
  const searching = q || filter.applied.some((s) => s.size);
  const rows = list.filter((e) => (searching ? !q || e.name.toLowerCase().includes(q) || e.nopek.includes(q) : e.nopek === shown)
    && FILTER_TABS.every((t, i) => !filter.applied[i].size || filter.applied[i].has(e[t.key])));
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  page = Math.min(page, pages);
  $('#evList').innerHTML = rows.length ? rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(card).join('')
    : `<p class="muted ev-empty">${searching ? 'Evaluator tidak ditemukan.' : 'Cari Nopek/Nama Evaluator untuk memilih Evaluator.'}</p>`;
  renderPager($('#evPager'), page, pages);
  $('#evSubmit').disabled = !state.pick;
  $('#evStep .check').hidden = !state.submitted;
}

$('#evSearch').addEventListener('input', () => { page = 1; render(); });
$('#evPager').addEventListener('click', (e) => {
  const b = e.target.closest('[data-page]');
  if (b && !b.disabled) { page = +b.dataset.page; render(); }
});
// Satu Evaluator saja: memilih yang lain menggantikan pilihan sebelumnya; klik Terpilih (tampil "Hapus") = hapus.
$('#evList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pick]');
  if (!b) return;
  state.pick = state.pick === b.dataset.pick ? null : b.dataset.pick;
  if (state.pick) shown = state.pick;
  state.submitted = false; // pilihan berubah → perlu submit ulang
  persist();
  render();
});

// returnValue dikosongkan dulu: tutup dengan Esc tidak mengubahnya, jadi nilai lama bisa terbawa.
const open = (dlg) => { dlg.returnValue = ''; dlg.showModal(); };
$('#evSubmit').addEventListener('click', () => open($('#confirmDialog')));
$('#confirmDialog').addEventListener('close', (e) => {
  if (e.target.returnValue !== 'yes') return;
  state.submitted = true;
  if (!persist()) alert('Pilihan gagal disimpan: penyimpanan browser penuh atau diblokir.');
  render();
  open($('#successDialog'));
});
// Individual Goal Setting belum punya halaman di prototype (sama dengan langkahnya di Beranda).
$('#successDialog').addEventListener('close', (e) => {
  if (e.target.returnValue === 'go') alert('Halaman ini belum tersedia di prototype.');
});

render();
