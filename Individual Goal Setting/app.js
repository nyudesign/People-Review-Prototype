// Tampilan dari desain Figma section "Entrance", "KPI-Cascading" dan "Project Control" (halaman Redesign-Evaluee):
// Evaluee menyusun Sasaran Kerja (Cascading KPI / Project Control / Extramiles) lewat modal "Buat Sasaran Kerja/Proyek",
// lalu menambah proses per periode untuk tiap proyek (Project Control) sebelum lanjut ke Nominate 360.

const PERIOD_LABELS = {
  Bulanan: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
  Triwulan: [1, 2, 3, 4].map((n) => `Triwulan ${n}`),
  Semester: ['Semester 1', 'Semester 2'],
};
// shortcut: KPI Library & daftar pekerja contoh (dari Figma), ganti dengan API master saat ada.
const LIBRARY = ['Enhancement HC-IT System', 'Building Innovation', 'Maksimalisasi penggunaan digital dalam pelaksanaan kompetensi leadership',
  'Membuat buku kamus komptensi teknis', 'Pemerataan penggunaan aplikasi HC baik SAP maupun Non-SAP'];
const PEOPLE = [
  ['Heru Kautsar', 'Sr Analyst II Performance & Competency Mgt'], ['Oka Fitrio', 'Mgr Performance & Competency Mgt'],
  ['Oka Fitrio P.', 'Mgr Risk'], ['Irwan Oka Fitrio', 'Mgr Geologist'], ['Shahid Oka Fitrio', 'Mgr IT'],
  ['Hamim Indra', 'Sr Analyst II Performance & Competency Mgt'], ['Hamim Tohari', 'Mgr Risk'], ['Imran Hamim', 'Mgr Geologist'],
  ['Shaiful Hamim', 'Mgr IT'], ['Aceng Koswara', 'Mgr Geologist'], ['Dede Rukmana', 'Mgr IT'], ['Aryomekka Firdaus', 'VP Talent Development & Recruitment'],
].map(([name, title]) => ({ name, title }));
// Individual Contributory sudah ditentukan sistem (Figma Desktop 1418), tidak diatur di halaman ini.
// Bobot beda untuk Evaluator/manager (akun yang punya evaluee: Oka, Aryo — lihat PEOPLE di ../app.js) dan Evaluee.
// profile.js (yang mengisi window.PR_USER) dimuat sesudah file ini, jadi baca sessionStorage langsung.
const MANAGER = (() => { try { return ['oka', 'aryo'].includes(sessionStorage.getItem('pr-login')); } catch { return false; } })();
const CONTRIBUTORY = MANAGER ? [
  { name: 'HSSE Objective', weight: 8, target: 200, unit: 'Poin' },
  // shortcut: target Talent Development belum ada di sumber data, sementara 100% seperti Development Commitment.
  { name: 'Talent Development', weight: 7, target: 100, unit: '%' },
  { name: 'Project & Community Involvement', weight: 5, target: 250, unit: 'Poin' },
] : [
  { name: 'Development Commitment', weight: 5, target: 110, unit: '%' },
  { name: 'HSSE Objective', weight: 8, target: 200, unit: 'Poin' },
  { name: 'Project & Community Involvement', weight: 7, target: 250, unit: 'Poin' },
];
const KPI_TOTAL = 80; // total bobot Cascading KPI + Project Control (badge "x/80%" di Figma)
const MIN_WEIGHT = 10;
const TIPS = {
  nbh: 'Total bobot item Cascading KPI/Sasaran Kerja Spesifik pada IG Non Pemilik KPI : 85%\n\nSelisih antar item Cascading KPI/Sasaran Kerja Spesifik pada IG Non Pemilik KPI maksimal 20% dengan bobot minimum per item 10% & kelipatan bobot 5%',
  type: 'Cascading KPI: KPI yang diturunkan dari atasan kepada individu\nAdditional KPI 0%: KPI tambahan di luar KPI utama yang digunakan untuk mencatat kontribusi atau tanggung jawab tambahan\nProject Control: Mengukur efektivitas pengendalian dan pencapaian proyek berdasarkan target',
  polarity: 'MAX: Apabila semakin tinggi angka realisasi terhadap target, maka semakin tinggi angka performa yang dicapai\n\nMIN: Apabila semakin rendah angka realisasi terhadap target, maka semakin tinggi angka performa yang dicapai',
  library: 'Tidak perlu terisi untuk saat ini',
  decimal: 'Angka desimal diketik menggunakan titik (.), contoh: 12.5',
};

/* ---------- Penyimpanan di localStorage (per user login) ---------- */
// shortcut: tanpa backend, sasaran kerja disimpan di localStorage browser ini (file dokumen hanya nama & ukuran); ganti dengan API saat ada.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
const ME = { heru: 'Heru Kautsar', oka: 'Oka Fitrio', aryo: 'Aryomekka Firdaus' }[LOGIN] || 'Heru Kautsar';
const STORE_KEY = `pr-igs-${LOGIN}`;
const state = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })() || { items: [], submitted: false };
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; } catch { alert('Data gagal disimpan: penyimpanan browser penuh atau diblokir.'); return false; }
}

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
const hydrateIcons = (root = document) => root.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });
hydrateIcons();
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (n) => (n ?? 0).toLocaleString('id-ID');
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);
const avatarsHTML = (names) => names.slice(0, 3).map((n) => `<span class="avatar" title="${esc(n)}">${esc(initials(n))}</span>`).join('')
  + (names.length > 3 ? `<span class="avatar more">${names.length - 3}+</span>` : '');
const team = (it) => [...new Set([it.leader, ...it.members].filter(Boolean))];
const isKpi = (it) => it.type !== 'Extramiles'; // Extramiles tidak dihitung ke total 80%
const kpiTotal = (exceptId) => sum(state.items.filter((i) => isKpi(i) && i.id !== exceptId).map((i) => i.weight));
const needsProcess = (it) => it.type === 'Project Control' && !it.processes.length;
const unitHTML = (n, unit) => `<b>${fmt(n)}</b><small>${unit === '%' ? '%' : ` ${esc(unit)}`}</small>`;

/* ---------- Filter: disalin dari Settings Evaluator/app.js (makeFilter) ---------- */
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
    items.innerHTML = tabs[tab].options.filter((o) => o.toLowerCase().includes(q)).map((o) =>
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
const FILTER_TABS = [
  { name: 'Tipe', key: 'type', options: ['Cascading KPI', 'Project Control', 'Extramiles'] },
  { name: 'Polaritas', key: 'polarity', options: ['MAX', 'MIN'] },
  { name: 'Periode', key: 'periodType', options: Object.keys(PERIOD_LABELS) },
];
const filter = makeFilter($('#boardFilter'), FILTER_TABS, () => render());

/* ---------- Board Sasaran Kerja ---------- */
const openPeriods = new Set(); // kartu yang daftar target per periodenya terbuka
let menuOpen = null; // kartu yang menu •••-nya terbuka

function goalCard(it) {
  const tm = team(it);
  return `
    <article class="card">
      <span class="ribbon">Bobot ${it.weight}%</span>
      <div class="card-body">
        ${needsProcess(it) ? `<span class="chip chip-alert">${icon('material-symbols:error-rounded')}Mohon tambah proses terlebih dahulu!</span>` : ''}
        <div class="title-row"><h3>${esc(it.name)}</h3>${tm.length ? `<span class="avatars">${avatarsHTML(tm)}</span>` : ''}</div>
        ${it.library ? `<div class="library">KPI Library ${icon('tabler:arrow-right')} ${esc(it.library)}</div>` : ''}
        <div class="perf"><span>Target Anda</span><span>${unitHTML(sum(it.periods.map((p) => p.target)), it.unit)}</span></div>
        <button type="button" class="toggle" data-toggle="${it.id}">Lihat ${it.periods.length} Target Per Periode ${icon(openPeriods.has(it.id) ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button>
      </div>
      <div class="card-foot">
        ${openPeriods.has(it.id) ? `<ul class="periods">${it.periods.map((p) => `<li><span>${esc(p.label)}</span><span>${unitHTML(p.target, it.unit)}</span></li>`).join('')}</ul>` : ''}
        <div class="card-actions">
          ${it.type === 'Project Control' ? `<button type="button" class="btn-outline" data-process="${it.id}">${icon('streamline-flex:user-collaborate-group-solid')}Lihat Proses</button>` : ''}
          <button type="button" class="btn-outline" data-edit="${it.id}">${icon('mdi:pencil')}Edit</button>
          ${menuHTML(it.id, `data-del="${it.id}"`)}
        </div>
      </div>
    </article>`;
}
const menuHTML = (key, delAttr) => `<span class="menu-wrap">
    <button type="button" class="btn-outline more-btn" data-menu="${key}" aria-label="Opsi lainnya" aria-expanded="${menuOpen === key}">${icon('ri:more-fill')}</button>
    ${menuOpen === key ? `<span class="menu"><button type="button" ${delAttr}>${icon('mdi:trash')}Hapus</button></span>` : ''}
  </span>`;

function render() {
  const q = $('#search').value.trim().toLowerCase();
  const match = (it) => (!q || `${it.name} ${it.desc || ''}`.toLowerCase().includes(q))
    && FILTER_TABS.every((t, i) => !filter.applied[i].size || filter.applied[i].has(it[t.key]));
  const total = kpiTotal();
  const kpiBadge = `<span class="chip ${total === KPI_TOTAL ? 'chip-full' : 'chip-warn'}">${total}/${KPI_TOTAL}%</span>`;
  const col = (title, badge, body, empty) => `<section class="column"><div class="col-head"><h2>${title}</h2>${badge}</div>${body || `<p class="empty">${empty}</p>`}</section>`;
  const typed = (type) => state.items.filter((i) => i.type === type && match(i)).map(goalCard).join('');
  const extra = state.items.filter((i) => i.type === 'Extramiles');
  const contributory = filter.applied.some((s) => s.size) ? [] : CONTRIBUTORY.filter((c) => !q || c.name.toLowerCase().includes(q));
  $('#board').innerHTML = [
    col('Individual Contributory', '<span class="chip chip-blue">20%</span>', contributory.map((c) => `
      <article class="card"><span class="ribbon">Bobot ${c.weight}%</span><div class="card-body">
        <h3>${esc(c.name)}</h3><div class="perf"><span>Target Anda</span><span>${unitHTML(c.target, c.unit)}</span></div>
      </div></article>`).join(''), 'Tidak ada sasaran kerja yang ditemukan'),
    col('Cascading KPI', kpiBadge, typed('Cascading KPI'), 'Tidak ada Goals yang ditambahkan di sini'),
    col('Project Control', kpiBadge, typed('Project Control'), 'Tidak ada proyek yang ditambahkan di sini'),
    col('Extramiles', `<span class="chip chip-blue">${sum(extra.map((i) => i.weight))}%</span>`, typed('Extramiles'), 'Tidak ada item yang ditambahkan di sini'),
  ].join('');
  // Lanjut hanya bila bobot Cascading KPI + Project Control genap 80% dan tiap proyek sudah punya proses.
  const blocker = total !== KPI_TOTAL ? `Total bobot Cascading KPI dan Project Control harus ${KPI_TOTAL}% (saat ini ${total}%)`
    : state.items.some(needsProcess) ? 'Tambahkan proses untuk setiap proyek terlebih dahulu' : '';
  $('#next').disabled = !!blocker;
  $('#next').title = blocker;
  $('#igsStep .check').hidden = !state.submitted;
}

$('#search').addEventListener('input', render);
$('#next').addEventListener('click', () => {
  state.submitted = true;
  if (persist()) location.href = '../Nominate%20360/index.html';
});

// Klik di board & halaman proses: toggle periode, menu •••, Edit, Hapus, Lihat Proses.
let pendingDelete = null;
document.querySelector('main').addEventListener('click', (e) => {
  const t = e.target.closest('[data-toggle], [data-menu], [data-edit], [data-del], [data-del-proc], [data-process]');
  if (!t) return;
  const d = t.dataset;
  if (d.toggle) openPeriods.has(d.toggle) ? openPeriods.delete(d.toggle) : openPeriods.add(d.toggle);
  else if (d.menu) { menuOpen = menuOpen === d.menu ? null : d.menu; route(); return; }
  else if (d.edit) openGoal(state.items.find((i) => i.id === d.edit));
  else if (d.process) location.hash = `proses/${d.process}`;
  else {
    pendingDelete = d.del ? { item: d.del } : { proc: d.delProc };
    $('#deleteTitle').textContent = d.del ? 'Apakah Anda yakin ingin menghapus sasaran kerja ini?' : 'Apakah Anda yakin ingin menghapus proses ini?';
    open($('#deleteDialog'));
  }
  menuOpen = null;
  route();
});
document.addEventListener('click', (e) => {
  if (menuOpen && !e.target.closest('.menu-wrap')) { menuOpen = null; route(); }
});
$('#deleteDialog').addEventListener('close', (e) => {
  if (e.target.returnValue !== 'yes' || !pendingDelete) return;
  if (pendingDelete.item) state.items = state.items.filter((i) => i.id !== pendingDelete.item);
  else project().processes = project().processes.filter((p) => p.id !== pendingDelete.proc);
  state.submitted = false;
  persist();
  route();
});

/* ---------- Halaman proses (#proses/<id proyek>) ---------- */
const project = () => state.items.find((i) => i.id === location.hash.slice('#proses/'.length));
function renderProcess(p) {
  $('#pTitle').textContent = p.name;
  $('#pAvatars').innerHTML = avatarsHTML(team(p));
  const q = $('#pSearch').value.trim().toLowerCase();
  const list = p.processes.filter((pr) => !q || `${pr.name} ${pr.desc}`.toLowerCase().includes(q));
  $('#pBoard').innerHTML = p.periods.map((per) => {
    const inPeriod = list.map((pr) => ({ pr, row: pr.periods.find((r) => r.label === per.label) })).filter((x) => x.row);
    const used = sum(p.processes.map((pr) => pr.periods.find((r) => r.label === per.label)?.target || 0));
    return `<section class="column"><div class="col-head"><h2>${esc(per.label)}</h2>
        <span class="chip ${used === per.target ? 'chip-full' : 'chip-warn'}">${fmt(used)}/${fmt(per.target)}${p.unit === '%' ? '%' : ` ${esc(p.unit)}`}</span></div>
      ${inPeriod.map(({ pr, row }) => `<article class="card"><div class="card-body">
          <div class="title-row"><h3>${esc(pr.name)}</h3><span class="avatars">${avatarsHTML(pr.members)}</span></div>
          ${pr.desc ? `<p class="muted small">${esc(pr.desc)}</p>` : ''}
          <div class="perf"><span>Target Anda</span><span>${unitHTML(row.target, pr.unit)}</span></div>
          <div class="card-actions end">${menuHTML(`${pr.id}@${per.label}`, `data-del-proc="${pr.id}"`)}</div>
        </div></article>`).join('') || '<p class="empty">Tidak ada proyek yang ditambahkan di sini</p>'}
    </section>`;
  }).join('');
}
$('#pSearch').addEventListener('input', () => route());
$('#pBack').addEventListener('click', () => { location.hash = ''; });

function route() {
  const p = project();
  $('#boardView').hidden = $('#boardFooter').hidden = !!p;
  $('#processView').hidden = !p;
  p ? renderProcess(p) : render();
}
addEventListener('hashchange', () => { menuOpen = null; $('#pSearch').value = ''; route(); });

/* ---------- Tooltip info (Figma section "Tooltips") ---------- */
const tip = $('#tip');
let tipAnchor = null;
function showTip(btn) {
  hideTip();
  tipAnchor = btn;
  btn.setAttribute('aria-expanded', 'true');
  // Teks konstanta dari Figma; awalan "Judul:" ditebalkan.
  $('#tipText').innerHTML = TIPS[btn.dataset.tip].split('\n').map((l) => l.replace(/^([^:]{1,30}):/, '<b>$1:</b>')).join('<br>');
  (btn.closest('dialog') || document.body).append(tip); // di dalam modal supaya ikut top layer
  tip.hidden = false;
  // Di atas ikon dan rata tengah; pindah ke bawah kalau tidak muat, digeser supaya tidak keluar layar.
  const r = btn.getBoundingClientRect();
  const mid = r.left + r.width / 2;
  const left = Math.min(Math.max(8, mid - tip.offsetWidth / 2), innerWidth - tip.offsetWidth - 8);
  const below = r.top - tip.offsetHeight - 12 < 8;
  tip.classList.toggle('below', below);
  tip.style.left = `${left}px`;
  tip.style.top = `${below ? r.bottom + 12 : r.top - tip.offsetHeight - 12}px`;
  tip.style.setProperty('--arrow-x', `${mid - left}px`);
}
function hideTip() {
  if (!tipAnchor) return;
  tipAnchor.setAttribute('aria-expanded', 'false');
  tipAnchor = null;
  tip.hidden = true;
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-tip]');
  if (btn) return btn === tipAnchor ? hideTip() : showTip(btn);
  if (!e.composedPath().includes(tip) || e.target.closest('#tipClose')) hideTip();
});
document.addEventListener('scroll', hideTip, true);
addEventListener('resize', hideTip);

/* ---------- Dialog umum ---------- */
// returnValue dikosongkan dulu: tutup dengan Esc tidak mengubahnya, jadi nilai lama bisa terbawa.
const open = (dlg) => { dlg.returnValue = ''; dlg.showModal(); };
document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((d) => d.addEventListener('close', hideTip));
const setSelect = (sel, v) => { sel.value = v ?? ''; sel.dispatchEvent(new Event('change', { bubbles: true })); };

/* ---------- Pemilih pekerja (Ketua / Anggota / Penugasan) ---------- */
// single: maksimal 1 nama; fixed: nama yang tidak bisa dihapus (diri sendiri sebagai anggota, Figma Desktop 1250).
function makePicker(host, { single = false, source, placeholder, onChange = () => {} }) {
  let picked = [];
  host.innerHTML = `<span class="picked"></span><input type="text" placeholder="${placeholder}" aria-label="${placeholder}" autocomplete="off"><div class="suggest" role="listbox" hidden></div>`;
  const [chips, input, box] = host.children;
  const draw = () => {
    chips.innerHTML = picked.map((n) => `<span class="pchip"><span class="avatar">${esc(initials(n))}</span>${esc(n)}<button type="button" class="icon-btn" data-rm="${esc(n)}" aria-label="Hapus ${esc(n)}">${icon('material-symbols:close-rounded')}</button></span>`).join('');
    input.hidden = single && picked.length > 0;
    input.placeholder = picked.length ? '' : placeholder;
  };
  const suggest = () => {
    const q = input.value.trim().toLowerCase();
    const opts = source().filter((p) => !picked.includes(p.name) && p.name.toLowerCase().includes(q)).slice(0, 6);
    box.innerHTML = opts.map((p) => `<button type="button" role="option" data-add="${esc(p.name)}"><span class="avatar">${esc(initials(p.name))}</span><span><b>${esc(p.name)}</b><small>${esc(p.title || '')}</small></span></button>`).join('');
    box.hidden = !opts.length || host.closest('fieldset')?.disabled;
  };
  input.addEventListener('input', suggest);
  input.addEventListener('focus', suggest);
  host.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]')?.dataset.add;
    const rm = e.target.closest('[data-rm]')?.dataset.rm;
    if (add) { picked = single ? [add] : [...picked, add]; input.value = ''; box.hidden = true; }
    else if (rm) picked = picked.filter((n) => n !== rm);
    else return input.focus();
    draw();
    onChange();
    if (!input.hidden) input.focus();
  });
  document.addEventListener('click', (e) => { if (!host.contains(e.target)) box.hidden = true; });
  return {
    get: () => [...picked],
    set: (names) => { picked = [...names]; input.value = ''; box.hidden = true; draw(); },
  };
}

/* ---------- Baris Target per Periode ---------- */
// Label periode fixed & berurutan untuk semua tipe periode (Figma Desktop 1266).
function makeRows(host, addBtn, labelsFn) {
  let rows = [];
  const draw = () => {
    const labels = labelsFn();
    host.innerHTML = rows.map((r, i) => `<div class="target-row">
      <span class="chip chip-blue">${esc(r.label)}</span>
      <button type="button" class="info-btn" data-tip="decimal" aria-label="Info format angka">${icon('material-symbols:info-outline-rounded', 'info')}</button>
      <input type="number" min="0" step="any" data-i="${i}" value="${r.target ?? ''}" placeholder="Isi target" aria-label="Target ${esc(r.label)}">
      <button type="button" class="btn-outline danger" data-rm="${i}">${icon('mdi:trash')}Hapus</button>
    </div>`).join('');
    addBtn.disabled = !labels.length || rows.length >= labels.length;
  };
  addBtn.addEventListener('click', () => {
    const free = labelsFn().find((l) => !rows.some((r) => r.label === l));
    if (free) { rows.push({ label: free, target: null }); draw(); host.querySelector('.target-row:last-child input')?.focus(); }
  });
  host.addEventListener('input', (e) => { if (e.target.matches('input')) rows[e.target.dataset.i].target = e.target.value === '' ? null : Number(e.target.value); });
  host.addEventListener('click', (e) => {
    const i = e.target.closest('[data-rm]')?.dataset.rm;
    if (i == null) return;
    rows.splice(i, 1);
    rows.forEach((r, k) => { r.label = labelsFn()[k]; }); // label tetap urut setelah hapus
    draw();
  });
  return { get: () => rows.map((r) => ({ ...r })), set: (v) => { rows = v.map((r) => ({ ...r })); draw(); }, draw };
}
// Urutkan sesuai urutan label periode, lalu validasi: minimal 1 baris & semua target terisi > 0.
const cleanRows = (rows, labels) => {
  const sorted = [...rows].sort((a, b) => labels.indexOf(a.label) - labels.indexOf(b.label));
  return sorted.length && sorted.every((r) => r.target > 0) ? sorted : null;
};
console.assert(cleanRows([{ label: 'Maret', target: 5 }, { label: 'Januari', target: 1 }], PERIOD_LABELS.Bulanan)?.[0].label === 'Januari', 'urut per periode');
console.assert(cleanRows([{ label: 'Januari', target: null }], PERIOD_LABELS.Bulanan) === null, 'target wajib diisi');
console.assert(cleanRows([], PERIOD_LABELS.Bulanan) === null, 'minimal 1 periode');

/* ---------- Modal Buat Sasaran Kerja/Proyek ---------- */
const gf = $('#goalForm');
$('#librarySelect').insertAdjacentHTML('beforeend', LIBRARY.map((l) => `<option>${esc(l)}</option>`).join(''));
const goalRows = makeRows($('#gPeriods'), $('#gAddPeriod'), () => PERIOD_LABELS[gf.elements.periodType.value] || []);
const leader = makePicker($('#leaderPicker'), { single: true, source: () => PEOPLE, placeholder: 'Isi nama Ketua/Penanggung Jawab',
  onChange: () => members.set(members.get().filter((n) => n !== leader.get()[0])) }); // ketua tidak dobel di anggota
const members = makePicker($('#memberPicker'), { source: () => PEOPLE, placeholder: 'Isi nama anggota Anda' });
let editing = null;
let file = null;

function weightMax() { return gf.elements.type.value === 'Extramiles' ? KPI_TOTAL : KPI_TOTAL - kpiTotal(editing?.id); }
function drawWeight() {
  const r = gf.elements.weight;
  r.max = KPI_TOTAL; // skala slider tetap 0–80 (Figma); nilai dibatasi sisa bobot
  r.value = Math.min(Number(r.value), weightMax());
  r.style.setProperty('--p', `${(r.value / KPI_TOTAL) * 100}%`);
  $('#weightOut').textContent = `${r.value}%`;
  $('#weightHint').textContent = gf.elements.type.value && gf.elements.type.value !== 'Extramiles'
    ? `Sisa bobot Cascading KPI & Project Control: ${weightMax() - r.value}% (minimum ${MIN_WEIGHT}% per item, kelipatan 5%)` : '';
}
gf.elements.weight.addEventListener('input', drawWeight);
document.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
  gf.elements.weight.value = Math.max(0, Number(gf.elements.weight.value) + Number(b.dataset.step));
  drawWeight();
}));
// Daftar Kelompok Proyek hanya untuk tipe Project Control (disembunyikan & terkunci untuk tipe lain).
const syncType = () => {
  const off = gf.elements.type.value !== 'Project Control';
  $('#teamSet').disabled = off;
  $('#teamSet').hidden = off;
  drawWeight();
};
gf.elements.type.addEventListener('change', syncType);
gf.elements.periodType.addEventListener('change', () => goalRows.set([]));

function openGoal(it = null) {
  editing = it;
  $('#goalTitle').textContent = it ? 'Edit Sasaran Kerja' : 'Buat Sasaran Kerja';
  $('#goalSubmit').textContent = it ? 'Simpan Perubahan' : 'Buat Sasaran Kerja';
  gf.reset();
  gf.elements.name.value = it?.name || '';
  gf.elements.desc.value = it?.desc || '';
  ['type', 'polarity', 'library', 'periodType', 'unit'].forEach((k) => setSelect(gf.elements[k], it?.[k]));
  goalRows.set(it?.periods || []); // setelah periodType: change periodType mengosongkan baris
  gf.elements.weight.value = it?.weight ?? 0;
  leader.set(it?.leader ? [it.leader] : []);
  members.set(it?.members || [ME]); // nama sendiri terisi otomatis, boleh dipindah ke Ketua
  setFile(it?.file || null);
  $('#goalError').hidden = true;
  syncType();
  open($('#goalDialog'));
  gf.scrollTop = 0;
}
$('#addGoal').addEventListener('click', () => openGoal());

gf.addEventListener('submit', (e) => {
  e.preventDefault();
  const v = Object.fromEntries(['name', 'desc', 'type', 'polarity', 'library', 'periodType', 'unit'].map((k) => [k, gf.elements[k].value.trim()]));
  const weight = Number(gf.elements.weight.value);
  const periods = cleanRows(goalRows.get(), PERIOD_LABELS[v.periodType] || []);
  const isProject = v.type === 'Project Control';
  const error = !v.name ? 'Nama Sasaran Kerja wajib diisi'
    : !v.type ? 'Pilih Tipe sasaran kerja'
    : !v.polarity ? 'Pilih Polaritas'
    : !v.periodType ? 'Pilih Periode Monitor Target'
    : !v.unit ? 'Pilih Satuan Target'
    : !periods ? 'Tambahkan minimal 1 periode target dan isi semua nilai target lebih dari 0'
    : v.type !== 'Extramiles' && weight < MIN_WEIGHT ? `Bobot minimum ${MIN_WEIGHT}%`
    : weight > weightMax() ? `Bobot melebihi sisa bobot (${weightMax()}%)`
    : isProject && !leader.get().length ? 'Isi Nama Ketua/Penanggung Jawab'
    : isProject && ![...leader.get(), ...members.get()].includes(ME) ? 'Nama Anda wajib diisi sebagai Ketua/Penanggung Jawab atau Anggota' : '';
  $('#goalError').textContent = error;
  $('#goalError').hidden = !error;
  if (error) return;
  const labels = periods.map((p) => p.label);
  const item = {
    id: editing?.id || Date.now().toString(36), ...v, weight, periods,
    leader: isProject ? leader.get()[0] : null, members: isProject ? members.get() : [], file: isProject ? file : null,
    // Proses ikut periode proyek: target pada periode yang dihapus ikut dibuang.
    processes: isProject ?(editing?.processes || []).map((pr) => ({ ...pr, periods: pr.periods.filter((r) => labels.includes(r.label)) })).filter((pr) => pr.periods.length) : [],
  };
  state.items = editing ? state.items.map((i) => (i.id === item.id ? item : i)) : [...state.items, item];
  state.submitted = false;
  if (!persist()) return;
  $('#goalDialog').close();
  route();
});

/* ---------- Upload dokumen proyek (pola sama dengan Upload Evidence di Individual Goal) ---------- */
const MAX_FILE = 2 * 1024 * 1024;
const fileUrls = new Map(); // shortcut: isi file hanya bisa dibuka di sesi ini (localStorage hanya menyimpan nama & ukuran)
function setFile(f) {
  file = f;
  $('#dropEmpty').hidden = !!f;
  $('#dropFile').hidden = !f;
  $('#fileError').hidden = true;
  if (!f) return;
  $('#fileName').textContent = f.name;
  $('#fileSize').textContent = `${(f.size / 1024 / 1024).toFixed(1)} MB`;
}
function takeFile(f) {
  if (!f) return;
  const err = !/\.(pdf|jpe?g)$/i.test(f.name) ? 'Format file harus .pdf atau .jpg' : f.size > MAX_FILE ? 'Ukuran file maksimal 2MB' : '';
  if (err) { $('#fileError').textContent = err; $('#fileError').hidden = false; return; }
  fileUrls.set(f.name, URL.createObjectURL(f));
  setFile({ name: f.name, size: f.size });
}
$('#pickFile').addEventListener('click', () => $('#fileInput').click());
$('#changeFile').addEventListener('click', () => $('#fileInput').click());
$('#removeFile').addEventListener('click', () => setFile(null));
$('#viewFile').addEventListener('click', () => {
  const url = fileUrls.get(file?.name);
  url ? window.open(url, '_blank') : alert('File hanya bisa dilihat pada sesi saat file diunggah (prototype tanpa server).');
});
$('#fileInput').addEventListener('change', (e) => { takeFile(e.target.files[0]); e.target.value = ''; });
const drop = $('#drop');
drop.addEventListener('dragover', (e) => { e.preventDefault(); if (!$('#teamSet').disabled) drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (!$('#teamSet').disabled) takeFile(e.dataTransfer.files[0]); });

/* ---------- Modal Buat Proses ---------- */
const pf = $('#processForm');
const procRows = makeRows($('#prPeriods'), $('#prAddPeriod'), () => project()?.periods.map((p) => p.label) || []);
const assign = makePicker($('#assignPicker'), { source: () => team(project()).map((name) => PEOPLE.find((p) => p.name === name) || { name }),
  placeholder: 'Pilih anggota tim yang akan berkontribusi dalam proses ini' });
$('#addProcess').addEventListener('click', () => {
  pf.reset();
  setSelect(pf.elements.unit, project().unit);
  procRows.set([]);
  assign.set([]);
  $('#processError').hidden = true;
  open($('#processDialog'));
});
pf.addEventListener('submit', (e) => {
  e.preventDefault();
  const p = project();
  const periods = cleanRows(procRows.get(), p.periods.map((x) => x.label));
  const error = !pf.elements.name.value.trim() ? 'Nama Proses wajib diisi'
    : !assign.get().length ? 'Pilih minimal 1 anggota tim'
    : !pf.elements.unit.value ? 'Pilih Satuan Target'
    : !periods ? 'Tambahkan minimal 1 periode target dan isi semua nilai target lebih dari 0' : '';
  $('#processError').textContent = error;
  $('#processError').hidden = !error;
  if (error) return;
  p.processes.push({ id: Date.now().toString(36), name: pf.elements.name.value.trim(), desc: pf.elements.desc.value.trim(),
    members: assign.get(), unit: pf.elements.unit.value, periods });
  state.submitted = false;
  if (!persist()) return;
  $('#processDialog').close();
  route();
});

route();
