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
].map(([name, title]) => ({ name, title, nip: { 'Heru Kautsar': '19050193', 'Oka Fitrio': '1905416', 'Aryomekka Firdaus': '777777' }[name] || '19245124' }));
// shortcut: NIP selain akun demo memakai contoh dari Figma (19245124); ganti dengan data master pekerja saat ada.
const nipOf = (name) => PEOPLE.find((p) => p.name === name)?.nip || '';
// Chip nama + NIP (Figma Desktop 1252–1255, 1814).
const personChip = (n, rm = '') => `<span class="pchip"><span class="avatar">${esc(initials(n))}</span><span class="pname">${esc(n)}<small>${esc(nipOf(n))}</small></span>${rm}</span>`;
// Individual Contributory sudah ditentukan sistem (Figma Desktop 1418), tidak diatur di halaman ini.
// Bobot beda untuk Evaluator/manager (akun yang punya evaluee: Oka, Aryo — lihat PEOPLE di ../app.js) dan Evaluee.
// profile.js (yang mengisi window.PR_USER) dimuat sesudah file ini, jadi baca sessionStorage langsung.
// Mode Evaluator (Figma "Approve IGS baru"): Oka membuka sasaran kerja Heru dari jalur Evaluator di Beranda
// (sessionStorage 'pr-review', sama dengan ../review.js & Nominate 360) lalu menyetujui atau meminta revisi.
const APPROVE = (() => { try { return sessionStorage.getItem('pr-login') !== 'heru' && sessionStorage.getItem('pr-review') === 'heru'; } catch { return false; } })();
const MANAGER = !APPROVE && (() => { try { return ['oka', 'aryo'].includes(sessionStorage.getItem('pr-login')); } catch { return false; } })();
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
const MAX_PICK = 8; // maksimal item dicentang (Figma Desktop 1806: "Item melebihi batas! (maksimal 8 item)")
const MIN_PICK = 4; // minimal item Cascading KPI dan/atau Project Control yang dicentang (Figma Desktop 1418: "1/4 Item")
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
const STORE_KEY = `pr-igs-${APPROVE ? 'heru' : LOGIN}`;
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
// Bobot Terisi hanya menghitung sasaran kerja/proyek yang dicentang (yang akan dikirim ke evaluator).
const kpiTotal = (exceptId) => sum(state.items.filter((i) => i.selected && isKpi(i) && i.id !== exceptId).map((i) => i.weight));
// Status pengajuan ke evaluator (Figma Desktop 1810/1811/1820): draft → pending (Menunggu Persetujuan) → approved (Disetujui) / revisi (Revisi).
const STATUS = { pending: ['Menunggu Persetujuan', 'st-pending'], approved: ['Disetujui', 'st-approved'], revisi: ['Revisi', 'st-revisi'] };
const sent = () => !!STATUS[state.status]; // sudah dikirim: tampil label status, tombol Atur Kembali
const locked = () => APPROVE || state.status === 'pending' || state.status === 'approved'; // Edit/Hapus terkunci; Revisi boleh diedit (Evaluee)
// Proyek belum siap dikirim bila belum punya proses, atau total target proses per periode kurang/melebihi target periode proyek.
const procUsed = (it, label) => sum(it.processes.map((pr) => pr.periods.find((r) => r.label === label)?.target || 0));
const needsProcess = (it) => it.type === 'Project Control' && (!it.processes.length || it.periods.some((p) => procUsed(it, p.label) !== p.target));
// Badge kolom (Figma Desktop 1418, 1805, 1806): hijau bila genap, merah bila melebihi batas.
const fillChip = (label, used, max, unit = '%', over = 'Bobot melebihi batas!') => `<span class="chip fill ${used === max ? 'chip-full' : used > max ? 'chip-over' : 'chip-warn'}">${
  used > max ? over : label} <b>${fmt(used)}</b>/${fmt(max)}${unit === '%' ? ' %' : ` ${esc(unit)}`}</span>`;
// Ringkasan target: satuan menumpuk (Rp, Poin, Learning Hour) dijumlah; satuan laju/persen (%, MMBOPD) tidak bisa
// dijumlah, jadi pakai target periode terakhir (posisi akhir tahun).
const RATE_UNITS = ['%', 'MMBOPD'];
const isRate = (unit) => RATE_UNITS.includes(unit);
const targetSum = (periods, unit) => (isRate(unit) ? periods.at(-1)?.target ?? 0 : sum(periods.map((p) => p.target)));
console.assert(targetSum([{ target: 20000 }, { target: 300 }], 'MMBOPD') === 300, 'laju: periode terakhir');
console.assert(targetSum([{ target: 5 }, { target: 7 }], 'Rp') === 12, 'menumpuk: dijumlah');
const unitHTML = (n, unit) => `<b>${fmt(n)}</b><small>${unit === '%' ? '%' : ` ${esc(unit)}`}</small>`;

/* ---------- Filter: sama dengan Individual Goal/app.js (makeFilter; options berupa fungsi) ---------- */
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
  f.reset = () => { f.applied = tabs.map(() => new Set()); label(); };
  return f;
}
const FILTER_TABS = [
  { name: 'Tipe', key: 'type', options: () => ['Cascading KPI', 'Project Control', 'Extramiles'] },
  { name: 'Polaritas', key: 'polarity', options: () => ['MAX', 'MIN'] },
  { name: 'Periode', key: 'periodType', options: () => Object.keys(PERIOD_LABELS) },
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
        ${sent() ? (it.selected ? `<span class="chip status ${STATUS[state.status][1]}">${STATUS[state.status][0]}</span>` : '')
          // Proses belum lengkap/melebihi target: chip error menggantikan checkbox, tidak bisa dipilih (Figma Desktop 1805).
          : needsProcess(it) ? `<span class="chip chip-alert">${icon('material-symbols:error-rounded')}Mohon atur proses terlebih dahulu!</span>`
          : `<input type="checkbox" class="pick" data-pick="${it.id}"${it.selected ? ' checked' : ''} aria-label="Pilih ${esc(it.name)} untuk dikirim ke evaluator">`}
        <div class="title-row"><h3>${esc(it.name)}</h3>${tm.length ? `<span class="avatars">${avatarsHTML(tm)}</span>` : ''}</div>
        ${it.library ? `<div class="library">KPI Library ${icon('tabler:arrow-right')} ${esc(it.library)}</div>` : ''}
        <div class="perf"><span>Target Anda${isRate(it.unit) && it.periods.length > 1 ? ` <small>(${esc(it.periods.at(-1).label)})</small>` : ''}</span><span>${unitHTML(targetSum(it.periods, it.unit), it.unit)}</span></div>
        <button type="button" class="toggle" data-toggle="${it.id}">Lihat ${it.periods.length} Target Per Periode ${icon(openPeriods.has(it.id) ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button>
      </div>
      <div class="card-foot">
        ${openPeriods.has(it.id) ? `<ul class="periods">${it.periods.map((p) => `<li><span>${esc(p.label)}</span><span>${unitHTML(p.target, it.unit)}</span></li>`).join('')}</ul>` : ''}
        <div class="card-actions">
          <button type="button" class="btn-outline" data-edit="${it.id}"${locked() ? ' disabled' : ''}>${icon('mdi:pencil')}Edit</button>
          ${it.type === 'Project Control' ? `<button type="button" class="btn-outline" data-process="${it.id}">${icon('streamline-flex:user-collaborate-group-solid')}Lihat Proses</button>` : ''}
          ${it.type === 'Project Control' ? '' : `<button type="button" class="btn-outline" data-detail="${it.id}">${icon('material-symbols:info-outline-rounded')}Lihat Detail</button>`}
          ${menuHTML(it.id, `data-del="${it.id}"`, it.type === 'Project Control' ? `<button type="button" class="info" data-detail="${it.id}">${icon('material-symbols:info-outline-rounded')}Lihat Detail</button>` : '')}
        </div>
      </div>
    </article>`;
}
// extra: item tambahan di atas Hapus (Project Control: Lihat Detail, Figma Desktop 1813).
const menuHTML = (key, delAttr, extra = '') => `<span class="menu-wrap">
    <button type="button" class="btn-outline more-btn" data-menu="${key}" aria-label="Opsi lainnya" aria-expanded="${menuOpen === key}">${icon('ri:more-fill')}</button>
    ${menuOpen === key ? `<span class="menu">${extra}<button type="button" class="danger" ${delAttr}${locked() ? ' disabled' : ''}>${icon('mdi:trash')}Hapus</button></span>` : ''}
  </span>`;

function render() {
  const q = $('#search').value.trim().toLowerCase();
  const match = (it) => (!q || `${it.name} ${it.desc || ''}`.toLowerCase().includes(q))
    && FILTER_TABS.every((t, i) => !filter.applied[i].size || filter.applied[i].has(it[t.key]));
  // Proyek yang prosesnya bermasalah otomatis tidak terpilih (sebelum dikirim).
  if (!APPROVE && !sent() && state.items.some((i) => i.selected && needsProcess(i))) {
    state.items.forEach((i) => { if (needsProcess(i)) i.selected = false; });
    persist();
  }
  const total = kpiTotal();
  const kpiBadge = fillChip('Bobot Terisi', total, KPI_TOTAL);
  const col = (title, badge, body, empty) => `<section class="column"><div class="col-head"><h2>${title}</h2>${badge}</div>${body || `<p class="empty">${empty}</p>`}</section>`;
  // Evaluator hanya melihat sasaran kerja yang dikirim (dicentang) Evaluee.
  const typed = (type) => state.items.filter((i) => i.type === type && match(i) && (!APPROVE || (sent() && i.selected))).map(goalCard).join('');
  const extra = state.items.filter((i) => i.type === 'Extramiles' && i.selected);
  const contributory = filter.applied.some((s) => s.size) ? [] : CONTRIBUTORY.filter((c) => !q || c.name.toLowerCase().includes(q));
  $('#board').innerHTML = [
    col('Individual Contributory', fillChip('Bobot Terisi', sum(CONTRIBUTORY.map((c) => c.weight)), 20), contributory.map((c) => `
      <article class="card"><span class="ribbon">Bobot ${c.weight}%</span><div class="card-body">
        <h3>${esc(c.name)}</h3><div class="perf"><span>Target Anda <small>(Year End)</small></span><span>${unitHTML(c.target, c.unit)}</span></div>
      </div></article>`).join(''), 'Tidak ada sasaran kerja yang ditemukan'),
    col('Cascading KPI', kpiBadge, typed('Cascading KPI'), 'Tidak ada Goals yang ditambahkan di sini'),
    col('Project Control', kpiBadge, typed('Project Control'), 'Tidak ada proyek yang ditambahkan di sini'),
    // Extramiles tanpa batas bobot: desain "Bobot Terisi" tanpa pembagi, hijau seperti Individual Contributory.
    col('Extramiles', `<span class="chip fill chip-full">Bobot Terisi <b>${fmt(sum(extra.map((i) => i.weight)))}</b> %</span>`, typed('Extramiles'), 'Tidak ada item yang ditambahkan di sini'),
  ].join('');
  // Lanjut hanya bila bobot Cascading KPI + Project Control genap 80%, tiap proyek sudah punya proses,
  // dan minimal 4 item Cascading KPI dan/atau Project Control dicentang untuk dikirim ke evaluator (Figma Desktop 1418).
  const picked = state.items.filter((i) => i.selected && isKpi(i)).length;
  $('#pickCount').firstElementChild.innerHTML = `<b>${picked}</b><span>/${MIN_PICK}</span> Item`;
  const blocker = total !== KPI_TOTAL ? `Total bobot Cascading KPI dan Project Control harus ${KPI_TOTAL}% (saat ini ${total}%)`
    : picked < MIN_PICK ? `Pilih minimal ${MIN_PICK} item Cascading KPI dan/atau Project Control (saat ini ${picked})`
    : picked > MAX_PICK ? `Maksimal ${MAX_PICK} item Cascading KPI dan/atau Project Control (saat ini ${picked})` : '';
  $('#pickCount').classList.toggle('over', picked > MAX_PICK);
  $('#next').disabled = !!blocker;
  $('#next').title = blocker;
  $('#next').hidden = $('#pickCount').hidden = APPROVE || sent();
  $('#pickOver').hidden = APPROVE || sent() || picked <= MAX_PICK;
  $('#reset').hidden = APPROVE || !sent();
  // Chip status di header setelah dikirim, untuk Evaluee & Evaluator (Figma 1810, 1811, 1820 / 1845, 1851, 1852).
  const head = sent() && STATUS[state.status];
  // Evaluee: Tambah nonaktif selama menunggu persetujuan (Figma 1810); setelah disetujui hanya Extramiles.
  $('#addGoal').disabled = state.status === 'pending';
  $('#headStatus').hidden = !head;
  if (head) { $('#headStatus').className = `chip head-status ${head[1]}`; $('#headStatus').lastChild.textContent = head[0]; }
  $('#msgBtn').hidden = !(APPROVE && state.status === 'revisi');
  $('#tolakBtn').hidden = $('#setujuBtn').hidden = !(APPROVE && state.status === 'pending');
  $('#ubahBtn').hidden = !(APPROVE && ['approved', 'revisi'].includes(state.status));
  $('#ubahBtn').disabled = state.status === 'revisi'; // menunggu Evaluee memperbaiki & mengirim ulang
  $('#waitNote').hidden = !(APPROVE && !sent());
  const check = $('#igsStep .check'); // tidak ada di mode Evaluator (stepper diganti)
  if (check) check.hidden = state.status !== 'approved'; // centang setelah Disetujui Evaluator (Figma 1811)
}

$('#search').addEventListener('input', render);
// Centang = sasaran kerja/proyek yang dikirim ke evaluator.
$('#board').addEventListener('change', (e) => {
  const it = state.items.find((i) => i.id === e.target.dataset.pick);
  if (!it) return;
  it.selected = e.target.checked;
  if (!sent()) state.submitted = false; // setelah dikirim, perubahan tidak membatalkan pengajuan
  persist();
  render();
});
/* ---------- Rekap → konfirmasi → terkirim (Figma Desktop 1429, 1808, 1809) ---------- */
// Isi rekap: sasaran kerja/proyek yang dicentang + Individual Contributory (tetap, target tahunan).
const rekapItems = () => [
  ...state.items.filter((i) => i.selected).map((i) => ({ name: i.name, kind: i.type === 'Cascading KPI' ? 'Cascading KPI / IG' : i.type, polarity: i.polarity,
    weight: i.weight, unit: i.unit, periodType: i.periodType, periods: i.periods })),
  ...CONTRIBUTORY.map((c) => ({ name: c.name, kind: 'Individual Contributory', polarity: 'MAX', weight: c.weight, unit: c.unit,
    periodType: 'Annual', periods: [{ label: 'Annual', target: c.target }] })),
];
let rekap = [];
const unitText = (n, unit) => `${fmt(n)} ${unit === 'Poin' ? 'Point' : unit}`;
function renderRekap() {
  const q = $('#rekapSearch').value.trim().toLowerCase();
  $('#rekapRows').innerHTML = rekap.map((r, i) => ({ r, i })).filter(({ r }) => !q || [r.name, r.kind, r.polarity, r.periodType, unitText(targetSum(r.periods, r.unit), r.unit)].join(' ').toLowerCase().includes(q))
    .map(({ r, i }) => `<tr><td>${esc(r.name)}</td><td>${esc(r.kind)}</td><td>${esc(r.polarity)}</td><td>${r.weight} %</td>
      <td>${esc(unitText(targetSum(r.periods, r.unit), r.unit))}</td><td>${esc(r.periodType)}</td>
      <td><button type="button" class="btn-outline" data-periods="${i}">Lihat ${r.periods.length} Target</button></td></tr>`).join('')
    || '<tr><td colspan="7" class="muted">Tidak ada sasaran kerja yang ditemukan</td></tr>';
}
$('#next').addEventListener('click', () => {
  rekap = rekapItems();
  $('#rekapSearch').value = '';
  renderRekap();
  open($('#rekapDialog'));
});
$('#rekapSearch').addEventListener('input', renderRekap);
$('#rekapRows').addEventListener('click', (e) => {
  const r = rekap[e.target.closest('[data-periods]')?.dataset.periods];
  if (!r) return;
  $('#periodName').textContent = r.name;
  $('#periodRows').innerHTML = r.periods.map((p) => `<div><span class="chip chip-blue">${esc(p.label)}</span><span>${unitHTML(p.target, r.unit)}</span></div>`).join('');
  open($('#periodDialog'));
});
$('#submitGoals').addEventListener('click', () => open($('#sendDialog')));
$('#sendDialog').addEventListener('close', (e) => {
  if (e.target.returnValue !== 'yes') return;
  state.status = 'pending';
  state.submitted = true;
  if (!persist()) return;
  $('#rekapDialog').close();
  route();
  open($('#doneDialog'));
});
$('#doneDialog').addEventListener('close', (e) => { if (e.target.returnValue === 'next') location.href = '../Nominate%20360/index.html'; });
// Atur Kembali: tarik pengajuan, kembali ke mode edit.
$('#reset').addEventListener('click', () => {
  state.status = 'draft';
  state.submitted = false;
  if (persist()) route();
});

// Klik di board & halaman proses: toggle periode, menu •••, Edit, Hapus, Lihat Proses.
let pendingDelete = null;
document.querySelector('main').addEventListener('click', (e) => {
  const t = e.target.closest('[data-toggle], [data-menu], [data-edit], [data-del], [data-del-proc], [data-process], [data-detail], [data-edit-proc], [data-detail-proc]');
  if (!t) return;
  const d = t.dataset;
  if (d.toggle) openPeriods.has(d.toggle) ? openPeriods.delete(d.toggle) : openPeriods.add(d.toggle);
  else if (d.menu) { menuOpen = menuOpen === d.menu ? null : d.menu; route(); return; }
  else if (d.edit) openGoal(state.items.find((i) => i.id === d.edit));
  else if (d.process) location.hash = `proses/${d.process}`;
  else if (d.detail) showDetail(state.items.find((i) => i.id === d.detail));
  else if (d.editProc) openProcess(project().processes.find((p) => p.id === d.editProc));
  else if (d.detailProc) showDetail(project().processes.find((p) => p.id === d.detailProc), true);
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
  if (!sent()) state.submitted = false; // setelah dikirim, perubahan tidak membatalkan pengajuan
  persist();
  route();
});

/* ---------- Halaman proses (#proses/<id proyek>) ---------- */
const project = () => state.items.find((i) => i.id === location.hash.slice('#proses/'.length));
function renderProcess(p) {
  $('#pTitle').textContent = p.name;
  $('#pAvatars').innerHTML = avatarsHTML(team(p));
  const q = $('#pSearch').value.trim().toLowerCase();
  const [periods, procs] = procFilter.applied;
  const list = p.processes.filter((pr) => (!procs.size || procs.has(pr.name)) && (!q || `${pr.name} ${pr.desc}`.toLowerCase().includes(q)));
  $('#pBoard').innerHTML = p.periods.filter((per) => !periods.size || periods.has(per.label)).map((per) => {
    const inPeriod = list.map((pr) => ({ pr, row: pr.periods.find((r) => r.label === per.label) })).filter((x) => x.row);
    const used = procUsed(p, per.label);
    return `<section class="column"><div class="col-head"><h2>${esc(per.label)}</h2>${fillChip('Target Terisi', used, per.target, p.unit, 'Target melebihi batas!')}</div>
      ${inPeriod.map(({ pr, row }) => `<article class="card"><div class="card-body">
          <div class="title-row"><h3>${esc(pr.name)}</h3><span class="avatars">${avatarsHTML(pr.members)}</span></div>
          <div class="perf"><span>Target Anda</span><span>${unitHTML(row.target, p.unit)}</span></div>
          <div class="card-actions">
            <button type="button" class="btn-outline" data-edit-proc="${pr.id}"${locked() ? ' disabled' : ''}>${icon('mdi:pencil')}Edit</button>
            <button type="button" class="btn-outline" data-detail-proc="${pr.id}">${icon('material-symbols:info-outline-rounded')}Lihat Detail</button>
            ${menuHTML(`${pr.id}@${per.label}`, `data-del-proc="${pr.id}"`)}
          </div>
        </div></article>`).join('') || '<p class="empty">Tidak ada proyek yang ditambahkan di sini</p>'}
    </section>`;
  }).join('');
}
$('#pSearch').addEventListener('input', () => route());
const procFilter = makeFilter($('#processFilter'), [
  { name: 'Periode', options: () => project().periods.map((p) => p.label) },
  { name: 'Proses', options: () => [...new Set(project().processes.map((pr) => pr.name))] },
], () => route());
$('#pBack').addEventListener('click', () => { location.hash = ''; });

function route() {
  const p = project();
  $('#boardView').hidden = $('#boardFooter').hidden = !!p;
  $('#processView').hidden = $('#processFooter').hidden = !p;
  $('#addProcess').disabled = locked();
  $('#addProcess').hidden = APPROVE;
  p ? renderProcess(p) : render();
}
addEventListener('hashchange', () => { menuOpen = null; $('#pSearch').value = ''; procFilter.reset(); route(); });

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
    chips.innerHTML = picked.map((n) => personChip(n, `<button type="button" class="icon-btn" data-rm="${esc(n)}" aria-label="Hapus ${esc(n)}">${icon('material-symbols:close-rounded')}</button>`)).join('');
    input.hidden = single && picked.length > 0;
    input.placeholder = picked.length ? '' : placeholder;
  };
  const suggest = () => {
    const q = input.value.trim().toLowerCase();
    const opts = source().filter((p) => !picked.includes(p.name) && p.name.toLowerCase().includes(q)).slice(0, 6);
    box.innerHTML = opts.map((p) => `<button type="button" role="option" data-add="${esc(p.name)}"><span class="avatar">${esc(initials(p.name))}</span><span><b>${esc(p.name)}</b><small>${esc([p.nip, p.title].filter(Boolean).join(' '))}</small></span></button>`).join('');
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
// Periode dipilih lewat dropdown; tiap periode hanya boleh dipakai 1 baris (Figma Desktop 1267, 1801).
function makeRows(host, addBtn, labelsFn) {
  let rows = [];
  const draw = () => {
    const labels = labelsFn();
    host.innerHTML = rows.map((r, i) => `<div class="target-row">
      <select data-label="${i}" aria-label="Periode target ${i + 1}">${labels.filter((l) => l === r.label || !rows.some((x) => x.label === l))
        .map((l) => `<option${l === r.label ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>
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
  host.addEventListener('change', (e) => { if (e.target.matches('select')) { rows[e.target.dataset.label].label = e.target.value; draw(); } });
  host.addEventListener('click', (e) => {
    const i = e.target.closest('[data-rm]')?.dataset.rm;
    if (i == null) return;
    rows.splice(i, 1);
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
  onChange: () => syncLeader() });
// Ketua tidak dobel di anggota.
function syncLeader() { members.set(members.get().filter((n) => n !== leader.get()[0])); }
const members = makePicker($('#memberPicker'), { source: () => PEOPLE, placeholder: 'Isi nama anggota Anda' });
let editing = null;
let file = null;

// Total boleh melebihi 80% (Figma Desktop 1806: badge "Bobot melebihi batas!"); Selanjutnya terkunci sampai genap 80%.
function drawWeight() {
  const r = gf.elements.weight;
  r.style.setProperty('--p', `${(r.value / KPI_TOTAL) * 100}%`);
  $('#weightOut').textContent = `${r.value}%`;
  const left = KPI_TOTAL - kpiTotal(editing?.id) - Number(r.value);
  $('#weightHint').textContent = gf.elements.type.value && gf.elements.type.value !== 'Extramiles'
    // Dihitung seolah item ini ikut dicentang, karena Bobot Terisi hanya menghitung item yang dicentang.
    ? (left < 0 ? `Bila dicentang, total bobot Cascading KPI & Project Control melebihi ${KPI_TOTAL}% (lebih ${-left}%)` : `Sisa bobot Cascading KPI & Project Control bila dicentang: ${left}%`)
      + ` (minimum ${MIN_WEIGHT}% per item, kelipatan 5%)` : '';
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
  $('#goalTitle').textContent = it ? 'Edit Sasaran Kerja/Proyek' : 'Buat Sasaran Kerja/Proyek';
  $('#goalSubmit').textContent = it ? 'Simpan Perubahan' : 'Buat Sasaran Kerja';
  gf.reset();
  gf.elements.name.value = it?.name || '';
  gf.elements.desc.value = it?.desc || '';
  ['type', 'polarity', 'library', 'periodType', 'unit'].forEach((k) => setSelect(gf.elements[k], it?.[k]));
  goalRows.set(it?.periods || []); // setelah periodType: change periodType mengosongkan baris
  gf.elements.weight.value = it?.weight ?? 0;
  leader.set(it?.leader ? [it.leader] : []);
  members.set(it?.members || [ME]); // nama sendiri terisi otomatis, boleh dipindah ke Ketua
  syncLeader();
  // Setelah dikirim (menunggu/disetujui) tetap bisa menambah, tapi tipe yang terbuka hanya Extramiles (catatan Figma Desktop 1811).
  const onlyExtra = !it && locked();
  if (onlyExtra) setSelect(gf.elements.type, 'Extramiles');
  gf.elements.type.disabled = onlyExtra;
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
    : isProject && !leader.get().length ? 'Isi Nama Ketua/Penanggung Jawab'
    : isProject && ![...leader.get(), ...members.get()].includes(ME) ? 'Nama Anda wajib diisi sebagai Ketua/Penanggung Jawab atau Anggota' : '';
  $('#goalError').textContent = error;
  $('#goalError').hidden = !error;
  if (error) return;
  const labels = periods.map((p) => p.label);
  const item = {
    id: editing?.id || Date.now().toString(36), ...v, weight, periods, selected: editing?.selected || false,
    comments: editing?.comments || [], activity: editing?.activity || [],
    leader: isProject ? leader.get()[0] : null, members: isProject ? members.get() : [], file: isProject ? file : null,
    // Proses ikut periode proyek: target pada periode yang dihapus ikut dibuang.
    processes: isProject ?(editing?.processes || []).map((pr) => ({ ...pr, periods: pr.periods.filter((r) => labels.includes(r.label)) })).filter((pr) => pr.periods.length) : [],
  };
  logActivity(item, editing ? 'Mengubah sasaran kerja' : 'Membuat sasaran kerja');
  state.items = editing ? state.items.map((i) => (i.id === item.id ? item : i)) : [...state.items, item];
  if (!sent()) state.submitted = false; // setelah dikirim, perubahan tidak membatalkan pengajuan
  if (!persist()) return;
  $('#goalDialog').close();
  route();
});

/* ---------- Lihat Detail + Komentar/Aktivitas (Figma Desktop 1424, 1814) ---------- */
let detail = null; // { it, isProc }
let feedTab = 'comments';
function showDetail(it, isProc = false) {
  detail = { it, isProc };
  feedTab = 'comments';
  const unit = isProc ? project().unit : it.unit;
  const meta = isProc ? [] : [it.type, `Polaritas: ${it.polarity}`, it.library && `KPI Library: ${it.library}`,
    `Target Per Periode: ${it.periodType}`, `Bobot ${it.weight}%`].filter(Boolean);
  $('#detailTitle').textContent = isProc ? 'Detail Proses' : `Detail ${it.type}`;
  $('#detailBody').innerHTML = `<h3 class="link">${esc(it.name)}</h3>
    ${it.desc ? `<p class="desc">${esc(it.desc)}</p>` : ''}
    ${meta.length ? `<div class="meta">${meta.map((m) => `<span class="chip chip-grey">${esc(m)}</span>`).join('')}</div>` : ''}
    ${isProc ? `<div class="meta">${it.members.map((n) => `<span class="chip chip-grey">${esc(n)}</span>`).join('')}</div>` : ''}
    <div class="totals-list"><div><span>${isRate(unit) && it.periods.length > 1 ? `Target Akhir (${esc(it.periods.at(-1).label)})` : 'Total Target'}</span><span>${unitHTML(targetSum(it.periods, unit), unit)}</span></div>
      ${it.periods.map((r) => `<div><span>${esc(r.label)}</span><span>${unitHTML(r.target, unit)}</span></div>`).join('')}</div>
    ${!isProc && it.type === 'Project Control' ? `<div class="detail-actions"><button type="button" class="btn-outline" id="detailProcess">${icon('streamline-flex:user-collaborate-group-solid')}Lihat Proses</button></div>
    <section class="team-view"><h3>Daftar Kelompok Proyek</h3>
      <h4>Nama Ketua/Penanggung Jawab</h4><div class="picker">${it.leader ? personChip(it.leader) : ''}</div>
      <h4>Nama Anggota</h4><div class="picker">${it.members.map((n) => personChip(n)).join('')}</div>
      <h4>Dokumen (Nota Dinas, Penugasan, atau sejenisnya)</h4>
      <div class="drop">${it.file ? `<div class="file-ico">${icon('line-md:file-twotone')}</div><p class="link small">${esc(it.file.name)}</p>
        <p class="muted small">${(it.file.size / 1024 / 1024).toFixed(1)} MB</p>
        <div class="file-actions"><button type="button" class="btn-outline" id="detailFile">${icon('mdi:eye')}Lihat File</button></div>` : '<p class="muted small">Belum ada dokumen yang diunggah</p>'}</div>
    </section>` : ''}`;
  $('#detailFile')?.addEventListener('click', () => viewFile(it.file));
  $('#detailProcess')?.addEventListener('click', () => { $('#detailDialog').close(); location.hash = `proses/${it.id}`; });
  $('#commentInput').value = '';
  renderFeed();
  open($('#detailDialog'));
}
function renderFeed() {
  document.querySelectorAll('[data-feed]').forEach((t) => t.classList.toggle('active', t.dataset.feed === feedTab));
  const list = detail.it[feedTab] || [];
  $('#feed').innerHTML = list.length
    ? list.map((c) => `<li><span class="avatar">${esc(initials(c.who))}</span><div><span class="who"><b>${esc(c.who)}</b><i></i>${esc(c.when)}</span><p>${esc(c.text)}</p></div></li>`).join('')
    : `<li class="muted small">${feedTab === 'comments' ? 'Belum ada komentar' : 'Belum ada aktivitas'}</li>`;
  $('#commentForm').hidden = feedTab !== 'comments';
}
document.querySelectorAll('[data-feed]').forEach((t) => t.addEventListener('click', () => { feedTab = t.dataset.feed; renderFeed(); }));
$('#commentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#commentInput').value.trim();
  if (!text) return;
  // shortcut: waktu ditulis "Baru saja" (tanpa timestamp relatif), sama seperti Individual Goal.
  (detail.it.comments ||= []).push({ who: ME, when: 'Baru saja', text });
  if (!persist()) return;
  $('#commentInput').value = '';
  renderFeed();
  $('#feed').scrollTop = $('#feed').scrollHeight;
});
const logActivity = (it, text) => (it.activity ||= []).unshift({ who: ME, when: 'Baru saja', text });

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
function viewFile(f) {
  const url = fileUrls.get(f?.name);
  url ? window.open(url, '_blank') : alert('File hanya bisa dilihat pada sesi saat file diunggah (prototype tanpa server).');
}
$('#viewFile').addEventListener('click', () => viewFile(file));
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
let editingProc = null;
function openProcess(pr = null) {
  editingProc = pr;
  $('#processTitle').textContent = pr ? 'Edit Proses' : 'Buat Proses';
  $('#processSubmit').textContent = pr ? 'Simpan Perubahan' : 'Buat Sasaran Kerja';
  pf.reset();
  pf.elements.name.value = pr?.name || '';
  pf.elements.desc.value = pr?.desc || '';
  procRows.set(pr?.periods || []);
  assign.set(pr?.members || []);
  $('#processError').hidden = true;
  open($('#processDialog'));
}
$('#addProcess').addEventListener('click', () => openProcess());
pf.addEventListener('submit', (e) => {
  e.preventDefault();
  const p = project();
  const periods = cleanRows(procRows.get(), p.periods.map((x) => x.label));
  const error = !pf.elements.name.value.trim() ? 'Nama Proses wajib diisi'
    : !assign.get().length ? 'Pilih minimal 1 anggota tim'
    : !periods ? 'Tambahkan minimal 1 periode target dan isi semua nilai target lebih dari 0' : '';
  $('#processError').textContent = error;
  $('#processError').hidden = !error;
  if (error) return;
  // Satuan proses mengikuti proyek (Figma Desktop 1804 tidak punya field Satuan Target).
  const pr = { id: editingProc?.id || Date.now().toString(36), name: pf.elements.name.value.trim(), desc: pf.elements.desc.value.trim(),
    members: assign.get(), unit: p.unit, periods, comments: editingProc?.comments || [], activity: editingProc?.activity || [] };
  logActivity(pr, editingProc ? 'Mengubah proses' : 'Membuat proses');
  p.processes = editingProc ? p.processes.map((x) => (x.id === pr.id ? pr : x)) : [...p.processes, pr];
  if (!sent()) state.submitted = false; // setelah dikirim, perubahan tidak membatalkan pengajuan
  if (!persist()) return;
  $('#processDialog').close();
  route();
});


/* ---------- Approve Individual Goal Setting (Evaluator, Figma Desktop 1845–1852) ---------- */
// Dialog serbaguna: icon, judul, teks & dua tombol; hasil 'yes' / 'no'.
function askBox({ ico = 'material-symbols:warning-outline-rounded', title, text, yes, no, danger = false }) {
  $('#askIco').innerHTML = icon(ico);
  $('#askTitle').textContent = title;
  $('#askText').textContent = text;
  $('#askYes').textContent = yes;
  $('#askNo').textContent = no;
  $('#askYes').className = danger ? 'btn-outline danger' : 'btn';
  $('#askNo').className = danger ? 'btn' : 'btn-outline';
  return waitClose($('#askDialog'));
}
// Jawaban dibaca dari submit form (event close tidak selalu terpicu di Chrome; pola sama dengan Nominate 360).
let answer = null;
// setTimeout: dialog yang sama bisa dibuka lagi (konfirmasi → sukses) setelah submit sebelumnya selesai menutupnya.
const waitClose = (dlg) => new Promise((resolve) => { answer?.(null); answer = resolve; setTimeout(() => open(dlg)); });
['#askDialog', '#reasonDialog'].forEach((id) => {
  $(id).querySelector('form').addEventListener('submit', (e) => { answer?.(e.submitter?.value); answer = null; });
  $(id).addEventListener('cancel', () => { answer?.(null); answer = null; });
});
const NOMINATE_URL = '../Nominate%20360/index.html';
async function doneBox(title) {
  const go = await askBox({ ico: 'material-symbols:check-rounded', title, text: 'Silakan untuk melanjutkan ke halaman Approve Nominee 360',
    yes: 'Lanjut ke Approve Nominee 360', no: 'Tetap di halaman ini' });
  if (go === 'yes') location.href = NOMINATE_URL;
}
function decide(status) {
  state.status = status;
  if (persist()) route();
}
if (APPROVE) {
  document.title = 'Approve Individual Goal Setting – People Review';
  $('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • <span>Evaluator</span>';
  $('.flow-pill').firstChild.textContent = 'Alur Evaluator ';
  $('.topbar-right').insertAdjacentHTML('afterbegin', '<span class="flow-pill evaluee-pill">Heru Kautsar - 19050193</span>');
  // Langkah sama dengan initReviewUI di ../review.js & header Approve Nominee 360.
  $('#stepper').innerHTML = [
    ['tabler:award-filled', 'Approve Individual Goal Setting', null, 'current'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', NOMINATE_URL],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', '../Individual%20Goal/index.html'],
    ['ri:survey-fill', 'Behaviour Survey', '../Behavior%20Survey/index.html'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', '../Sintesis%20Evaluator/index.html'],
  ].map(([ic, label, href, cls]) => `<li${cls ? ` class="${cls}"` : ''}>${href ? `<a href="${href}">${icon(ic)}${label}</a>` : `${icon(ic)}${label}`}</li>`).join('');
  $('#addGoal').hidden = true;
}
$('#setujuBtn').addEventListener('click', async () => {
  if (await askBox({ title: 'Anda yakin untuk menyetujui Individual Goal dari Evaluee?',
    text: 'Individual Goal Setting yang disetujui ini akan terkunci dan disampaikan kepada Evaluee', yes: 'Ya', no: 'Tidak' }) !== 'yes') return;
  state.reason = '';
  decide('approved');
  doneBox('Individual Goal Evaluee sudah disetujui!');
});
$('#reasonInput').addEventListener('input', (e) => { $('#reasonCount').textContent = `${e.target.value.length}/200`; });
$('#tolakBtn').addEventListener('click', async () => {
  if (await askBox({ title: 'Anda yakin tidak menyetujui Individual Goal dari Evaluee?',
    text: 'Revisi Individual Goal Setting ini akan disampaikan kepada Evaluee', yes: 'Ya, ajukan revisi', no: 'Tidak', danger: true }) !== 'yes') return;
  $('#reasonInput').value = '';
  $('#reasonCount').textContent = '0/200';
  if (await waitClose($('#reasonDialog')) !== 'yes') return;
  state.reason = $('#reasonInput').value.trim();
  decide('revisi'); // Evaluee bisa mengedit lalu mengirim ulang
  doneBox('Revisi Individual Goal sudah terkirim!');
});
$('#ubahBtn').addEventListener('click', () => decide('pending'));
$('#msgBtn').addEventListener('click', () => {
  $('#msgText').textContent = state.reason || 'Evaluator tidak menuliskan alasan revisi.';
  open($('#msgDialog'));
});

route();
