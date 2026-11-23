// Dummy data diambil dari desain Figma section "Individual Goal".
const semester = () => [{ label: 'Semester 1', target: 50, value: null }, { label: 'Semester 2', target: 50, value: null }];
const seedComments = () => [
  { who: 'Heru Kautsar', when: '5 jam yang lalu', text: 'Bagaimana dengan KPInya?' },
  { who: 'Oka Fitrio', when: '5 jam yang lalu', text: 'Boleh untuk dijalankan' },
  { who: 'Heru Kautsar', when: '5 jam yang lalu', text: 'Ok' },
];
const item = (o) => ({ unit: '%', periods: semester(), comments: seedComments(), activity: [], saved: false, ...o });
const person = (name) => ({ name, nip: '99999999' });
const processes = () => [
  ['Furnace Optimization', 'Optimasi suhu dalam furnace sebagai fundamental cooking naftalena', 20],
  ['Talent Planning', 'Perencanaan talent untuk persiapan project', 30],
].map(([name, desc, target]) => ({
  name, desc, target, value: null,
  pic: ['Hamim Tohari', 'Aceng Koswara', 'Aceng Koswara', 'Aceng Koswara', 'Dede Rukmana'].map(person),
}));

const columns = [
  // Bobot sama dengan Individual Goal Setting: total 100% di Individual Contributory dan 100% di Cascading KPI + Project Control (atau KPI Function).
  { title: 'Individual Contributory', badge: '100%', items: [
    // Target Year End dari sistem lama; realisasi = total poin yang disimpan halaman HSSE / PCI (lihat loadPoin di bawah).
    item({ id: 'hsse', file: null, name: 'HSSE Objective', weight: 40, unit: 'Poin', periods: [{ label: 'Year End', target: YEAR_END_TARGET.hsse, value: null }],
      href: '../HSSE%20Objective/index.html' }),
    // KPI Budget Holder (BUDGET di ../review.js): Talent Development menggantikan Development Commitment, bobot sama dengan Individual Goal Setting.
    item({ id: 'pci', name: 'Community Involvement', rekapName: 'Project & Community Involvement', weight: 25, unit: 'Poin', periods: [{ label: 'Year End', target: YEAR_END_TARGET.pci, value: null }],
      href: '../Project%20Community%20Involvement/index.html' }),
    // Development Commitment = Realisasi Development IDP pemilik data (Heru 100).
    item({ id: 'dev', name: BUDGET ? 'Talent Development' : 'Development Commitment', weight: 35,
      periods: [{ label: 'Year End', target: 100, value: IDP[TEAM[OWNER].nip].dev }], href: '../Development%20Commitment/index.html' }),
  ] },
  { title: 'Cascading KPI', badge: '100/100%', evidence: true, file: null, items: [
    item({ id: 'rbf', name: 'Remodelling Business Flow People Review', desc: 'Model ulang bisnis proses dalam People Review sebagai dasar Re-engineering',
      library: 'Enhancement HC-IT System', type: 'Fully Cascade', polarity: 'MAX', periodType: 'Semester', weight: 60 }),
    item({ id: 'fin', name: 'Finance Efficiency', desc: 'Efisiensi biaya operasional unit', library: 'Improving Finance Policy',
      type: 'Fully Cascade', polarity: 'MAX', periodType: 'Triwulan', weight: 20, unit: 'USD',
      periods: [3000, 2000, 2000, 8000].map((target, i) => ({ label: `Triwulan ${i + 1}`, target, value: null })) }),
  ] },
  { title: 'Project Control', badge: '100/100%', items: [
    item({ id: 'rdmp', project: true, file: null, name: 'Proyek Optimasi RDMP', desc: 'Model ulang bisnis proses dalam People Review sebagai dasar Re-engineering',
      library: 'Building Innovation', type: 'Fully Cascade', polarity: 'MIN', periodType: 'Bulanan', weight: 20,
      leader: person('Oka Fitrio'), members: ['Heru Kautsar', 'Hamim Tohari', 'Aceng Koswara', 'Dede Rukmana'].map(person),
      periods: ['Januari', 'Februari'].map((label) => ({ label, target: 50, value: null, processes: processes() })) }),
  ] },
  { title: 'Extramiles', badge: '0%', items: [
    item({ id: 'ext', name: 'Remodelling Business Flow People Review', library: 'Enhancement HC-IT System',
      type: 'Extramiles', polarity: 'MAX', periodType: 'Semester', weight: 0 }),
  ] },
];
// KPI Budget Holder (BUDGET di ../review.js), sama dengan Individual Goal Setting: kolom Cascading KPI diganti KPI Bisnis/Fungsi
// (juga jenis di rekap & ringkasan Dialog Day) yang hanya berisi KPI Function (bobot 100%), dan tidak ada Project Control.
// shortcut: target KPI Function belum ada di sumber data; sementara 1 periode Year End 100% (sama dengan Individual Goal Setting).
if (BUDGET) {
  Object.assign(columns.find((c) => c.title === 'Cascading KPI'), { title: 'KPI Bisnis/Fungsi', items: [item({ id: 'kpif', name: 'KPI Function',
    polarity: 'MAX', weight: 100, periods: [{ label: 'Year End', target: 100, value: null }] })] });
  columns.splice(columns.findIndex((c) => c.title === 'Project Control'), 1);
}

const $ = (s) => document.querySelector(s);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
// Isi semua <i data-icon="prefix:nama"> dengan SVG dari icons.js.
const hydrateIcons = (root) => root.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
hydrateIcons(document);
if (BUDGET) $('#kpiChip').firstChild.textContent = 'KPI Budget Holder '; // tipe jabatan pemilik data (../review.js)
const esc =(s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (n) => (n == null ? 0 : n).toLocaleString('id-ID');
const initials = (name) => name.split(' ').map((w) => w[0]).join('');

// performa(): lihat ../review.js (dipakai juga oleh kartu Individual Contributory di Beranda).
// Realisasi periode project = jumlah realisasi proses apa adanya (boleh melebihi target); null jika belum ada yang diisi.
function periodValue(p) {
  return p.processes.every((pr) => pr.value == null) ? null : sum(p.processes.map((pr) => pr.value || 0));
}
console.assert(periodValue({ processes: [{ target: 20, value: 25 }, { target: 30, value: 30 }] }) === 55, 'realisasi periode tidak dibatasi target');
console.assert(periodValue({ processes: [{ target: 20, value: null }] }) === null, 'periode kosong');

const findItem = (id) => columns.flatMap((c) => c.items).find((i) => i.id === id);

/* ---------- Status realisasi bersama Evaluee (Heru) ↔ Evaluator (Oka) ---------- */
// shortcut: tanpa backend, isian & status realisasi per pemilik disimpan di localStorage browser ini; ganti dengan API saat ada.
// Mode review (lihat ../review.js) membaca milik Heru; selain itu milik user yang login.
// Bukan query ?evaluee=…: sebagian server lokal (live-server) membalas 404 untuk URL ber-query.
const STORE_KEY = `pr-realisasi-${REVIEW ? 'heru' : LOGIN}`;
const ME_NAME = LOGIN === 'oka' ? 'Oka Fitrio' : 'Heru Kautsar';
let review = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })(); // { status, reason, data }
// Terkunci untuk Evaluator, dan untuk Evaluee selama menunggu persetujuan / sudah disetujui.
const locked = () => REVIEW || ['waiting', 'approved'].includes(review?.status);
const fileMeta = (f) => f && { name: f.name, size: f.size };
function snapshot() {
  return {
    cols: columns.map((c) => fileMeta(c.file)),
    items: Object.fromEntries(columns.flatMap((c) => c.items).map((it) => [it.id, {
      file: fileMeta(it.file), saved: it.saved, comments: it.comments, activity: it.activity,
      periods: it.periods.map((p) => ({ value: p.value, processes: p.processes?.map((pr) => pr.value) })),
    }])),
  };
}
function restore(d) {
  columns.forEach((c, i) => { if ('file' in c) c.file = d.cols[i]; });
  Object.entries(d.items).forEach(([id, s]) => {
    const it = findItem(id);
    if (!it) return;
    Object.assign(it, { saved: s.saved, comments: s.comments, activity: s.activity });
    if ('file' in it) it.file = s.file;
    s.periods.forEach((p, i) => {
      it.periods[i].value = p.value;
      p.processes?.forEach((v, j) => { it.periods[i].processes[j].value = v; });
    });
  });
}
function saveStore(patch) {
  review = { ...review, ...patch, data: snapshot() };
  try { localStorage.setItem(STORE_KEY, JSON.stringify(review)); } catch {}
}
const STATUS = { waiting: ['chip-warn', 'Menunggu Persetujuan'], approved: ['chip-ok', 'Disetujui'], revision: ['chip-danger', 'Revisi'] };
function statusChip(el) {
  // Figma Evaluator: chip baru muncul setelah memutuskan.
  const s = !(REVIEW && review?.status === 'waiting') && STATUS[review?.status];
  el.hidden = !s;
  // Pesan revisi Evaluator bisa dibuka lewat "Lihat Pesan" di samping chip.
  el.parentNode.querySelector('.msg-btn').hidden = !(review?.status === 'revision' && review.reason);
  if (!s) return;
  el.className = `chip ${s[0]} status-chip`;
  el.textContent = s[1];
  el.title = review.status === 'revision' && review.reason ? `Alasan: ${review.reason}` : '';
}
const personCard = (p) => `<div class="person"><span class="avatar">${esc(initials(p.name))}</span><div><b>${esc(p.name)}</b><small>${p.nip}</small></div></div>`;
const avatarsHTML = (people) => people.slice(0, 3).map((p) => `<span class="avatar">${esc(initials(p.name))}</span>`).join('')
  + (people.length > 3 ? `<span class="avatar more">${people.length - 3}+</span>` : '');
const evidenceChip = (has) => `<span class="chip ${has ? 'chip-ok' : 'chip-warn'}">Evidence ${has ? 'Sudah' : 'Belum'} Terlampir</span>`;
const open = new Set();

/* ---------- Filter (dipakai di board & halaman proses) ---------- */
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
  f.reset = () => { f.applied = tabs.map(() => new Set()); label(); };
  return f;
}

/* ---------- Board ---------- */
function cardHTML(it) {
  const p = performa(it);
  const w = (p / PERF_MAX) * 100; // ujung bar = PERF_MAX
  const done = p >= 100 && !it.incomplete; // incomplete: HSSE dengan aktivitas Mandatory yang belum disimpan
  return `
    <article class="card">
      <span class="ribbon">Bobot ${it.weight}%</span>
      <div class="card-body">
        <div class="chips"><span class="chip ${done ? 'chip-ok' : 'chip-warn'}">${done ? 'Selesai' : 'Sedang Dikerjakan'}</span>${'file' in it ? evidenceChip(it.file) : ''}</div>
        <div class="title-row"><h3>${esc(it.name)}</h3>${it.members ? `<span class="avatars">${avatarsHTML(it.members)}</span>` : ''}</div>
        ${it.library ? `<div class="library">KPI Library ${icon('tabler:arrow-right')} ${esc(it.library)}</div>` : ''}
        <div class="perf"><span class="with-ico">Performa Anda <button type="button" class="info-btn" data-info aria-label="Info performa" aria-controls="perfTip" aria-expanded="false">${icon('material-symbols:info-outline-rounded', 'info')}</button></span><span><b>${p}</b><small>/${PERF_MAX} %</small></span></div>
        <div class="bar"><i style="width:${w}%"></i>${w > 10 && p < PERF_MAX ? `<em style="left:${w}%">${p}%</em>` : ''}<span${w >= 95 ? ' style="color:#fff"' : ''}>${p >= PERF_MAX ? `${PERF_MAX}%` : PERF_MAX}</span></div>
        <button class="toggle" data-toggle="${it.id}">Lihat ${it.periods.length} Realisasi Per Periode ${icon(open.has(it.id) ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button>
      </div>
      <div class="card-foot">${open.has(it.id) ? `<ul class="periods">${it.periods.map((pr) =>
          `<li><span>${pr.label}</span><span><b>${fmt(pr.value)}</b><small>/${fmt(pr.target)} ${it.unit}</small></span></li>`).join('')}</ul>` : ''}<button class="btn" data-detail="${it.id}">Lihat ${REVIEW && it.href ? 'Data' : 'Detail'} Realisasi</button></div>
    </article>`;
}

/* ---------- Tooltip "Performa Anda" ---------- */
const tip = $('#perfTip');
let tipAnchor = null;

function showTip(btn) {
  hideTip();
  tipAnchor = btn;
  btn.setAttribute('aria-expanded', 'true');
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

$('#perfTipClose').addEventListener('click', hideTip);
document.addEventListener('click', (e) => {
  const path = e.composedPath();
  if (!path.includes(tip) && !path.some((el) => el.dataset?.info !== undefined)) hideTip();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
// Posisi tooltip fixed, jadi tutup saat halaman/board di-scroll atau ukuran layar berubah.
document.addEventListener('scroll', hideTip, true);
window.addEventListener('resize', hideTip);

// Syarat tombol Menuju Rekap (Figma): semua evidence yang diwajibkan sudah terlampir.
const evidenceOk = () => columns.every((col) => (!col.evidence || col.file) && col.items.every((it) => !('file' in it) || it.file));
function render() {
  hideTip();
  $('#toRekap').disabled = !evidenceOk();
  statusChip($('#boardStatus'));
  const q = $('#search').value.trim().toLowerCase();
  const [cats] = boardFilter.applied;
  $('#board').innerHTML = columns.map((col, ci) => {
    if (cats.size && !cats.has(col.title)) return '';
    const items = col.items.filter((i) => !q || `${i.name} ${i.library || ''}`.toLowerCase().includes(q));
    return `
      <section class="column">
        <div class="col-head"><h2>${col.title}</h2><span class="chip chip-warn">${col.badge}</span></div>
        ${col.evidence ? `<div class="col-tools">
          <button class="btn-outline" data-upload="${ci}">${locked() ? `${icon('mdi:eye')}Lihat` : `${icon('akar-icons:plus')}Upload`} Evidence</button>${evidenceChip(col.file)}</div>` : ''}
        ${items.length ? items.map(cardHTML).join('') : `<p class="empty">Tidak ada ${q ? 'hasil pencarian' : 'proyek yang ditambahkan'} di sini</p>`}
      </section>`;
  }).join('');
  saveSummary();
}

const boardFilter = makeFilter($('#boardFilter'), [{ name: 'Kategori', options: () => columns.map((c) => c.title) }], render);

/* ---------- Detail realisasi ---------- */
let current = null;
let tab = 'comments';
const shownRes = new Set(); // periode yang baris "Realisasi Anda"-nya dibuka (default tertutup): `${itemId}:${index}`

function renderDetail() {
  const it = current;
  $('#detailTitle').textContent = `Detail ${columns.find((c) => c.items.includes(it)).title}`;
  $('#dName').textContent = it.name;
  $('#dDesc').textContent = it.desc || '';
  $('#dMeta').innerHTML = [
    it.type && `Tipe: ${it.type}`, it.polarity && `Polaritas: ${it.polarity}`, it.library && `KPI Library: ${it.library}`,
    it.periodType && `Periode Monitor Target: ${it.periodType}`, `Bobot: ${it.weight}%`,
  ].filter(Boolean).map((m) => `<span class="chip chip-grey">${esc(m)}</span>`).join('');
  $('#dTeam').innerHTML = it.leader ? `
    <h4>Nama Ketua/Penanggung Jawab</h4><div class="people">${personCard(it.leader)}</div>
    <h4>Nama Anggota</h4><div class="people">${it.members.map(personCard).join('')}</div>` : '';
  $('#dTotal').innerHTML = `${performa(it)}<small>/${PERF_MAX} %</small>`;
  $('#dProject').hidden = !it.project;
  $('#realForm').hidden = !!it.project;
  if (it.project) {
    $('#dProjPeriods').innerHTML = it.periods.map((p) => `
      <div class="period-row"><div class="period-input"><span class="chip chip-blue">${p.label}</span><span class="grow"></span>
        <span><span class="big">${fmt(p.value)}</span><small>/${p.target} %</small></span></div></div>`).join('');
    attachUpload(it, $('#dEvidence'));
  } else {
    $('#dPeriods').innerHTML = it.periods.map((p, i) => `
      <div class="period-row">
        <label class="period-input"><span class="chip chip-blue">${p.label}</span>
          <input type="number" min="0" step="any" name="p${i}" value="${p.value ?? ''}" placeholder="Isi angka realisasi anda" ${it.saved || locked() ? 'disabled' : ''}>
          ${it.unit}<button type="button" class="icon-btn res-toggle" data-res="${i}" aria-expanded="${shownRes.has(`${it.id}:${i}`)}" aria-label="Tampilkan/sembunyikan realisasi ${p.label}">${icon(shownRes.has(`${it.id}:${i}`) ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button></label>
        ${shownRes.has(`${it.id}:${i}`) ? `<div class="period-result"><span>Realisasi${REVIEW ? '' : ' Anda'}</span><span><span class="big">${fmt(p.value)}</span><small>/${fmt(p.target)} ${it.unit}</small></span></div>` : ''}
      </div>`).join('');
    $('#editBtn').hidden = !it.saved || locked();
    $('#saveBtn').hidden = locked();
    $('#saveBtn').disabled = it.saved;
  }
  renderFeed();
}

function renderFeed() {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === tab));
  const list = tab === 'comments' ? current.comments : current.activity;
  $('#feed').innerHTML = list.length
    ? list.map((c) => `<li><span class="avatar">${esc(initials(c.who))}</span>
        <div><small>${esc(c.who)} • ${esc(c.when)}</small>${esc(c.text)}</div></li>`).join('')
    : '<li class="muted small">Belum ada aktivitas</li>';
  $('#commentForm').hidden = tab !== 'comments';
}

$('#realForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const values = current.periods.map((_, i) => fd.get(`p${i}`));
  if (values.some((v) => v !== '' && !(Number(v) >= 0))) return alert('Realisasi harus berupa angka ≥ 0');
  askSave(() => {
    values.forEach((v, i) => { current.periods[i].value = v === '' ? null : Number(v); });
    current.saved = true;
    current.activity.unshift({ who: ME_NAME, when: 'Baru saja', text: `Menyimpan realisasi (performa ${performa(current)}%)` });
    saveStore({}); // tersimpan di localStorage: tetap ada setelah refresh
    renderDetail();
    render();
  });
});

$('#dPeriods').addEventListener('click', (e) => {
  const b = e.target.closest('[data-res]');
  if (!b) return;
  e.preventDefault(); // tombol ada di dalam label: jangan sampai fokus pindah ke input
  const key = `${current.id}:${b.dataset.res}`;
  // renderDetail() menulis ulang input dari nilai tersimpan; bawa ketikan yang belum disimpan.
  const typed = [...$('#dPeriods').querySelectorAll('input')].map((inp) => inp.value);
  shownRes.has(key) ? shownRes.delete(key) : shownRes.add(key);
  renderDetail();
  $('#dPeriods').querySelectorAll('input').forEach((inp, i) => { inp.value = typed[i]; });
});

$('#editBtn').addEventListener('click', () => { current.saved = false; renderDetail(); });
$('#seeProcess').addEventListener('click', () => { $('#detailDialog').close(); location.hash = `proses/${current.id}`; });

$('#commentForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#commentInput').value.trim();
  if (!text) return;
  current.comments.push({ who: ME_NAME, when: 'Baru saja', text });
  if (review) saveStore({}); // komentar ikut terlihat oleh pihak lain
  $('#commentInput').value = '';
  renderFeed();
  $('#feed').scrollTop = $('#feed').scrollHeight;
});

document.querySelectorAll('.tab').forEach((t) => t.addEventListener('click', () => { tab = t.dataset.tab; renderFeed(); }));

/* ---------- Upload evidence ---------- */
// Target = kolom (Cascading KPI) atau item project; dropzone dipindah ke dialog upload / modal detail.
let uploadTarget = null;
const MAX = 2 * 1024 * 1024;

function attachUpload(target, host) {
  uploadTarget = target;
  host.append($('#drop'), $('#uploadError'));
  $('#uploadError').hidden = true;
  renderUpload();
}

function renderUpload() {
  const f = uploadTarget.file;
  const ro = locked();
  $('#uploadTitle').textContent = `${ro ? 'Evidence' : 'Upload Evidence'} ${uploadTarget.title}`;
  $('#dEvTitle').textContent = ro ? 'Evidence' : 'Upload Evidence';
  $('#dropEmpty').hidden = !!f || ro;
  $('#noFile').hidden = !!f || !ro;
  $('#changeFile').hidden = $('#removeFile').hidden = ro;
  $('#dropFile').hidden = !f;
  if (f) {
    $('#fileName').textContent = f.name;
    $('#fileSize').textContent = `${(f.size / 1024 / 1024).toFixed(1)} MB`;
  }
}

function setFile(f) {
  $('#uploadError').hidden = true;
  if (!f || locked()) return;
  if (!/\.(pdf|jpe?g)$/i.test(f.name) || f.size > MAX) {
    $('#uploadError').textContent = 'File harus .pdf/.jpg dan maksimal 2MB';
    $('#uploadError').hidden = false;
    return;
  }
  if (uploadTarget.url) URL.revokeObjectURL(uploadTarget.url);
  uploadTarget.file = f;
  uploadTarget.url = URL.createObjectURL(f);
  renderUpload();
  render();
}

$('#pickFile').addEventListener('click', () => $('#fileInput').click());
$('#changeFile').addEventListener('click', () => $('#fileInput').click());
$('#fileInput').addEventListener('change', (e) => { setFile(e.target.files[0]); e.target.value = ''; });
// File dari localStorage hanya berupa nama & ukuran, jadi tampilkan file pengganti.
$('#viewFile').addEventListener('click', () => window.open(uploadTarget.url
  || URL.createObjectURL(new Blob([`Evidence: ${uploadTarget.file.name} (contoh prototype)`], { type: 'text/plain' })), '_blank'));
$('#removeFile').addEventListener('click', () => {
  URL.revokeObjectURL(uploadTarget.url);
  uploadTarget.file = uploadTarget.url = null;
  renderUpload();
  render();
});
const drop = $('#drop');
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); setFile(e.dataTransfer.files[0]); });

/* ---------- Halaman proses Project Control ---------- */
// Isian yang belum disimpan ada di `pr.draft`; dibuang saat keluar halaman, dipindah ke `pr.value` saat Simpan.
let proj = null;
const closedPeriods = new Set();
const allProcs = () => proj.periods.flatMap((p) => p.processes);
const isDirty = () => allProcs().some((pr) => pr.draft !== undefined);

const procFilter = makeFilter($('#processFilter'), [
  { name: 'Periode', options: () => proj.periods.map((p) => p.label) },
  { name: 'Proses', options: () => [...new Set(allProcs().map((pr) => pr.name))] },
], () => renderProcess());

function renderProcess() {
  const q = $('#pSearch').value.trim().toLowerCase();
  const [periods, procs] = procFilter.applied;
  $('#pTitle').textContent = proj.name;
  $('#pAvatars').innerHTML = avatarsHTML(proj.members);
  $('#processForm').innerHTML = proj.periods.map((p, pi) => {
    if (periods.size && !periods.has(p.label)) return '';
    const rows = p.processes.map((pr, ri) => ({ pr, ri }))
      .filter(({ pr }) => (!procs.size || procs.has(pr.name)) && pr.name.toLowerCase().includes(q));
    return `
      <details class="period" data-period="${pi}"${closedPeriods.has(pi) ? '' : ' open'}>
        <summary><b>${p.label}</b><span>Total Realisasi${REVIEW ? '' : ' Anda'} Per Periode<span class="big">${fmt(p.value)}</span><small>/${p.target} %</small></span>${icon('tabler:chevron-up', 'caret')}</summary>
        <div class="table-scroll"><table>
          <thead><tr><th>Nama Proses</th><th>Deskripsi</th><th>PIC</th><th>Target</th><th>Realisasi</th></tr></thead>
          <tbody>${rows.map(({ pr, ri }) => `
            <tr>
              <td>${esc(pr.name)}</td>
              <td>${esc(pr.desc)}</td>
              <td><div class="pic">${pr.pic.map(personCard).join('')}</div></td>
              <td>${pr.target} %</td>
              <td><input type="number" min="0" step="any" data-proc="${pi}-${ri}" value="${pr.draft ?? pr.value ?? ''}"
                placeholder="Isi angka realisasi anda" aria-label="Realisasi ${esc(pr.name)} ${p.label}" ${proj.saved || locked() ? 'disabled' : ''}>
                <small>Satuan Target: %</small></td>
            </tr>`).join('') || '<tr><td colspan="5" class="empty">Tidak ada proses yang cocok</td></tr>'}
          </tbody>
        </table></div>
      </details>`;
  }).join('') || '<p class="empty">Tidak ada periode yang cocok</p>';
  renderProcessFooter();
}

function renderProcessFooter() {
  $('#pTotal').innerHTML = `${performa(proj)}<small>/${PERF_MAX} %</small>`;
  $('#pEdit').hidden = !proj.saved || locked();
  $('#pSave').hidden = locked();
  $('#pSave').disabled = proj.saved || !isDirty();
}

$('#pSearch').addEventListener('input', () => renderProcess());
$('#processForm').addEventListener('input', (e) => {
  const [pi, ri] = e.target.dataset.proc.split('-').map(Number);
  proj.periods[pi].processes[ri].draft = e.target.value;
  renderProcessFooter();
});
// event `toggle` tidak bubble, jadi pakai capture untuk mengingat periode yang ditutup.
$('#processForm').addEventListener('toggle', (e) => {
  const pi = Number(e.target.dataset.period);
  e.target.open ? closedPeriods.delete(pi) : closedPeriods.add(pi);
}, true);

$('#processForm').addEventListener('submit', (e) => {
  e.preventDefault();
  if (allProcs().some((pr) => pr.draft !== undefined && pr.draft !== '' && !(Number(pr.draft) >= 0))) {
    return alert('Realisasi harus berupa angka ≥ 0');
  }
  askSave(() => {
    proj.periods.forEach((p) => {
      p.processes.forEach((pr) => {
        if (pr.draft === undefined) return;
        pr.value = pr.draft === '' ? null : Number(pr.draft);
        delete pr.draft;
      });
      p.value = periodValue(p);
    });
    proj.saved = true;
    proj.activity.unshift({ who: ME_NAME, when: 'Baru saja', text: `Menyimpan realisasi proses (performa ${performa(proj)}%)` });
    saveStore({});
    renderProcess();
  });
});

// Konfirmasi simpan (Figma "Apakah Anda ingin menyimpan data realisasi?"), dipakai modal Detail & Project Control.
let onConfirmSave = null;
function askSave(save) {
  onConfirmSave = save;
  $('#confirmDialog').returnValue = '';
  $('#confirmDialog').showModal();
}
// submit (bukan close): event close tidak selalu terpicu ulang saat dialog dibuka-tutup berkali-kali di Chrome.
$('#confirmDialog form').addEventListener('submit', (e) => {
  const save = onConfirmSave;
  onConfirmSave = null;
  if (e.submitter?.value === 'yes') save?.();
});

$('#pEdit').addEventListener('click', () => { proj.saved = false; renderProcess(); });

function route() {
  const rekap = location.hash === '#rekap';
  if (rekap && !evidenceOk()) return location.replace('#');
  const id = location.hash.match(/^#proses\/(.+)$/)?.[1];
  const target = id && findItem(id);
  if (proj) allProcs().forEach((pr) => delete pr.draft);
  proj = target?.project ? target : null;
  $('#boardView').hidden = !!proj;
  $('#boardFooter').hidden = REVIEW || !!proj;
  $('#processView').hidden = $('#processFooter').hidden = !proj;
  $('#reviewFooter').hidden = !REVIEW || !!proj;
  if (!rekap && $('#rekapDialog').open) $('#rekapDialog').close();
  if (REVIEW) {
    disableLink($('#rvToRekap'), !evidenceOk());
    renderDecide();
  }
  if (proj) {
    $('#pSearch').value = '';
    procFilter.reset();
    closedPeriods.clear();
    renderProcess();
  } else {
    render();
    if (rekap) openRekap();
  }
  scrollTo(0, 0);
}

/* ---------- Wiring ---------- */
$('#board').addEventListener('click', (e) => {
  const t = e.target.closest('button');
  if (!t) return;
  if (t.dataset.info !== undefined) {
    tipAnchor === t ? hideTip() : showTip(t);
  } else if (t.dataset.toggle) {
    open.has(t.dataset.toggle) ? open.delete(t.dataset.toggle) : open.add(t.dataset.toggle);
    render();
  } else if (t.dataset.detail) {
    current = findItem(t.dataset.detail);
    if (current.href) return void (location.href = current.href);
    tab = 'comments';
    renderDetail();
    $('#detailDialog').showModal();
  } else if (t.dataset.upload) {
    attachUpload(columns[t.dataset.upload], $('#uploadHost'));
    $('#uploadDialog').showModal();
  }
});

document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach((d) => d.addEventListener('click', (e) => { if (e.target === d) d.close(); }));

$('#search').addEventListener('input', render);
// Tombol Tampilkan/Sembunyikan Alur: lihat ../profile.js (pilihan diingat lintas halaman).

/* ---------- Rekap realisasi sasaran kerja (modal 2 langkah, Figma "Rekap Realisasi Sasaran Kerja": tabel → Skor Akhir) ---------- */
// Semua sasaran ikut rekap, termasuk Extramiles berbobot 0 (Figma).
const JENIS = { 'Cascading KPI': 'Cascading KPI / IG' };
const weighted = (it) => (it.weight * performa(it)) / 100;
console.assert(weighted({ weight: 60, periods: [{ target: 50, value: 50 }, { target: 50, value: 50 }] }) === 60, 'bobot × performa');
// Grup kolom Persentase Individual Goal (rumus Skor Akhir); kolom lain (Cascading KPI / KPI Bisnis/Fungsi, Project Control) = KPI.
const GROUP = { 'Individual Contributory': 'ic', Extramiles: 'none' };
const groupOf = (col) => GROUP[col.title] || 'kpi';
const IG_PCT = { ic: 10, kpi: 70, bs: 20 };
const KPI_LABEL = BUDGET ? 'KPI Function' : 'Cascading KPI';
// shortcut: skor Behavior Survey belum dihitung dari jawaban survey (../behavior-survey.js); sementara nilai Figma 67,5%.
const BS_SCORE = 67.5;
// Figma kondisi "Behavior Survey belum selesai dinilai": skor BS kosong, Kirim nonaktif. Tombol Shift = ganti normal ↔ error.
// shortcut: status penilaian (Penilai 360 & atasan) belum dibaca dari halaman Behavior Survey; ganti dengan data asli saat ada.
let bsPending = false;
const num = (n) => fmt(+n.toFixed(2));
// Skor grup = Σ weighted performance / Σ bobot, dalam skala Performa (maks PERF_MAX), mis. Figma Cascading KPI 110/110 %.
const score = (its) => { const w = sum(its.map((it) => it.weight)); return w ? (sum(its.map(weighted)) / w) * 100 : 0; };
console.assert(score([{ weight: 60, periods: [{ target: 50, value: 55 }, { target: 50, value: 55 }] }, { weight: 20, periods: [{ target: 10, value: 5 }] }]) === 95, 'skor grup ternormalisasi bobot');
const groupScore = (g) => score(columns.filter((c) => groupOf(c) === g).flatMap((c) => c.items));

// Ringkasan untuk Sintesis Evaluator Final: Σ weighted performance per Jenis (satu baris per Jenis; Individual Contributory per item).
const SUMMARY_KEY = `pr-realisasi-summary-${REVIEW ? 'heru' : LOGIN}`;
function saveSummary() {
  if (!REVIEW && !review?.status) return; // draft Evaluee belum ikut sintesis
  const total = {};
  columns.forEach((col) => col.items.forEach((it) => {
    const jenis = col.title === 'Individual Contributory' ? it.name : col.title;
    total[jenis] = (total[jenis] || 0) + weighted(it);
  }));
  try { localStorage.setItem(SUMMARY_KEY, JSON.stringify(total)); } catch {}
}

const chip = (g, label, v, max) => `<span class="rk-chip pct-${g}">${label}<span>${v == null ? '<b>-</b>' : `<b>${num(v)}</b><small>${max ? `/${max}` : ''} %</small>`}</span></span>`;
function renderRekap() {
  // cells = kolom setelah Persentase Individual Goal: Polaritas, Periode, Bobot, Performa; Behavior Survey tanpa sasaran (Figma "-").
  const rows = [...columns.flatMap((col) => col.items.map((it) => ({ it, g: groupOf(col), name: it.rekapName || it.name, jenis: JENIS[col.title] || col.title,
    cells: [it.polarity || 'MAX', it.periodType || 'Annual', `${it.weight} %`, `${performa(it)} %`], wp: `${num(weighted(it))} %` }))),
    { g: 'bs', name: 'Behavior Survey', jenis: 'Behavior Survey', cells: ['-', '-', '-', '-'], wp: '-' }];
  $('#rkTotal').innerHTML = chip('kpi', KPI_LABEL, groupScore('kpi'), PERF_MAX) + chip('ic', 'Individual Contributory', groupScore('ic'), PERF_MAX);
  $('#rkBs').innerHTML = chip('bs', 'Behavior Survey', bsPending ? null : BS_SCORE);
  $('#rkSubmit').disabled = locked() || bsPending;
  const q = $('#rkSearch').value.trim().toLowerCase();
  const shown = rows.filter((r) => !q || [r.name, r.jenis, ...r.cells, r.wp].join(' ').toLowerCase().includes(q));
  $('#rkRows').innerHTML = shown.length ? shown.map(({ it, g, name, jenis, cells, wp }, k) => {
    // Sel Persentase Individual Goal digabung (rowspan) untuk baris berurutan dalam grup yang sama, seperti Figma.
    const n = shown.slice(k).findIndex((r) => r.g !== g);
    const pct = shown[k - 1]?.g === g ? '' : `<td class="pct pct-${g}" rowspan="${n < 0 ? shown.length - k : n}">${IG_PCT[g] ? `${IG_PCT[g]} %` : '-'}</td>`;
    return `<tr><td>${esc(name)}</td><td>${esc(jenis)}</td>${pct}${cells.map((c) => `<td>${esc(c)}</td>`).join('')}
      ${it ? `<td class="pct pct-${g}">${wp}</td><td><button type="button" class="btn-outline" data-periods="${it.id}"><span>Lihat ${it.periods.length}<br>Realisasi</span></button></td>`
        : `<td>-</td><td class="pct pct-bs">${bsPending ? '-' : `${num(BS_SCORE)} %`}</td>`}</tr>`;
  }).join('') : '<tr><td colspan="9" class="empty">Tidak ada hasil pencarian</td></tr>';
}
// Langkah 2 (Figma "Skor Akhir Anda"): kontribusi = persentase × skor realisasi; irisan donut sebanding kontribusi terhadap total.
const PIE_COLOR = { kpi: '#0765a5', ic: '#2e9f4f', bs: '#f0a030' };
const dec2 = (n) => n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); // Figma: 70,00 / 5,55
// Cincin seperti Figma: viewBox 260, pusat 130, r luar 118, r dalam 82; sudut 0 = jam 12, searah jarum jam.
const pt = (r, a) => `${(130 + r * Math.sin(a)).toFixed(2)} ${(130 - r * Math.cos(a)).toFixed(2)}`;
const arc = (a, b) => { const big = b - a > Math.PI ? 1 : 0; return `M${pt(118, a)}A118 118 0 ${big} 1 ${pt(118, b)}L${pt(82, b)}A82 82 0 ${big} 0 ${pt(82, a)}Z`; };
console.assert(arc(0, Math.PI / 2) === 'M130.00 12.00A118 118 0 0 1 248.00 130.00L212.00 130.00A82 82 0 0 0 130.00 48.00Z', 'busur kuadran pertama');
function renderScore() {
  const parts = [['kpi', KPI_LABEL, groupScore('kpi')], ['ic', 'Individual Contributory', groupScore('ic')], ['bs', 'Behavior Survey', BS_SCORE]]
    .map(([g, label, s]) => ({ g, label, s, v: (IG_PCT[g] * s) / 100 }));
  const total = sum(parts.map((p) => p.v));
  $('#rkWarn').hidden = !bsPending;
  let a = Math.PI; // Figma "Diputar": irisan pertama mulai dari jam 6
  // Behavior Survey belum dinilai (Figma): cincin abu penuh tanpa angka tengah, tanpa hover.
  const slices = bsPending ? `<path d="${arc(0, 2 * Math.PI - 1e-4)}" fill="#eef2f6"/>` : parts.map(({ g, v }) => {
    const b = a + (total ? (v / total) * 2 * Math.PI : 0), mid = (a + b) / 2;
    // Irisan hover bergeser 12 unit keluar searah garis tengahnya (Figma Donut hover: Behavior Survey); 100% dikurangi sedikit agar busur tidak hilang.
    const d = v > 0 ? `<path d="${arc(a, Math.min(b, a + 2 * Math.PI - 1e-4))}" fill="${PIE_COLOR[g]}" data-g="${g}" data-v="${dec2(v)}" style="--dx:${(12 * Math.sin(mid)).toFixed(2)}px;--dy:${(-12 * Math.cos(mid)).toFixed(2)}px"/>` : '';
    a = b;
    return d;
  }).join('');
  const row = (cells, attrs = '') => `<div class="rk-ri"${attrs}>${cells.join('')}</div>`;
  const val = bsPending ? '' : dec2(total);
  const wait = (g) => bsPending && g === 'bs';
  $('#rkPie').innerHTML = `<div class="rk-pie"><svg viewBox="0 0 260 260" aria-hidden="true">${slices}</svg><b id="rkPieVal" data-v="${val}">${val}</b></div>
    <div class="rk-rincian"><h4>Rincian</h4>
      ${row(['<span></span>', '<span>Komponen</span>', '<span>Persentase Individual Goal</span>', '<span>×</span>', '<span>Skor Realisasi</span>', '<span>=</span>', '<span>Kontribusi</span>'], ' data-head')}
      ${parts.map(({ g, label, s, v }) => row([`<i style="background:${PIE_COLOR[g]}"></i>`, `<span>${esc(label)}</span>`, `<span>${IG_PCT[g]}%</span>`, '<span>×</span>',
        wait(g) ? '<span class="rk-wait">Belum Dinilai</span>' : `<span>${dec2(s)}</span>`, '<span>=</span>', `<b>${wait(g) ? '-' : dec2(v)}</b>`],
        bsPending ? '' : ` data-g="${g}" data-v="${dec2(v)}"`)).join('')}
      ${row(['<span></span>', '<span>Total</span>', bsPending ? '<b class="rk-wait">Menunggu Behavior Survey</b>' : `<b>${dec2(total)}</b>`], ' data-total')}
    </div>`;
}
// Hover irisan atau baris Rincian → irisan itu keluar, irisan lain pudar, angka tengah = kontribusinya.
function hlPie(el) {
  const g = el?.dataset.g, val = $('#rkPieVal');
  $('#rkPie').classList.toggle('hl', !!g);
  $('#rkPie').querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('on', x.dataset.g === g));
  val.textContent = g ? el.dataset.v : val.dataset.v;
}
$('#rkPie').addEventListener('pointerover', (e) => hlPie(e.target.closest('[data-g]')));
$('#rkPie').addEventListener('pointerleave', () => hlPie(null));
const rkStep = (n) => {
  $('#rekapDialog').dataset.step = n;
  if (n === 2) renderScore();
};
$('#rkNext').addEventListener('click', () => rkStep(2));
$('#rkBack').addEventListener('click', () => rkStep(1));
function openRekap() {
  $('#rkSearch').value = '';
  rkStep(1);
  renderRekap();
  if (!$('#rekapDialog').open) $('#rekapDialog').showModal();
}
// Tutup modal = kembali ke board tanpa memicu route() lagi.
$('#rekapDialog').addEventListener('close', () => { if (location.hash === '#rekap') history.replaceState(null, '', '#'); });
$('#rkSearch').addEventListener('input', renderRekap);
$('#rkRows').addEventListener('click', (e) => {
  const id = e.target.closest('[data-periods]')?.dataset.periods;
  if (!id) return;
  const it = findItem(id);
  $('#ppName').textContent = it.name;
  $('#ppList').innerHTML = it.periods.map((p) => `<div class="pp-row"><span class="chip chip-blue">${esc(p.label)}</span>
    <span><span class="big">${fmt(p.value)}</span><small>/${fmt(p.target)} ${esc(it.unit)}</small></span></div>`).join('');
  $('#periodDialog').showModal();
});

$('#toRekap').addEventListener('click', () => { location.hash === '#rekap' ? openRekap() : (location.hash = 'rekap'); });
$('#rkSubmit').addEventListener('click', () => { $('#submitDialog').showModal(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  saveStore({ status: 'waiting', reason: '' });
  render(); // chip "Menunggu Persetujuan" di board (Figma) di belakang modal
  renderRekap();
  $('#doneDialog').showModal();
});
$('#doneDialog form').addEventListener('submit', (e) => {
  // shortcut: halaman Self Review belum ada di prototype, ganti dengan link-nya saat sudah dibuat.
  if (e.submitter?.value === 'self') alert('Halaman Self Review belum tersedia di prototype ini.');
});

/* ---------- Mode Evaluator: setuju / tidak setuju ---------- */
const disableLink = (a, off) => {
  a.classList.toggle('is-disabled', off);
  a.setAttribute('aria-disabled', off);
  a.tabIndex = off ? -1 : 0;
};
function renderDecide() {
  $('#rvDecide').innerHTML = review.status === 'waiting'
    ? `<button type="button" class="btn-outline danger" data-decide="reject">${icon('material-symbols:close-rounded')}Tidak Setuju</button>
       <button type="button" class="btn-outline ok" data-decide="approve">${icon('material-symbols:check-rounded')}Setuju</button>`
    // Ubah Persetujuan = alur Tidak Setuju (konfirmasi → alasan → revisi terkirim).
    : `<button type="button" class="btn-outline danger" data-decide="reject">${icon('material-symbols:close-rounded')}Ubah Persetujuan</button>`;
}
const refresh = () => { renderDecide(); render(); if ($('#rekapDialog').open) renderRekap(); };
function decided(title) {
  refresh();
  $('#decidedTitle').textContent = title;
  $('#decidedDialog').showModal();
}
$('#rvDecide').addEventListener('click', (e) => {
  const d = e.target.closest('[data-decide]')?.dataset.decide;
  if (d === 'approve') $('#approveDialog').showModal();
  else if (d === 'reject') $('#rejectDialog').showModal();});
$('#approveDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  saveStore({ status: 'approved', reason: '' });
  decided('Realisasi Target sudah disetujui!');
});
$('#rejectDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  $('#reasonInput').value = '';
  $('#reasonCount').textContent = '0/200';
  $('#reasonDialog').showModal();
});
document.querySelectorAll('[data-msg]').forEach((b) => b.addEventListener('click', () => {
  $('#msgText').textContent = review.reason;
  $('#msgDialog').showModal();
}));
$('#reasonInput').addEventListener('input', (e) => { $('#reasonCount').textContent = `${e.target.value.length}/200`; });
$('#reasonDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'send') return;
  saveStore({ status: 'revision', reason: $('#reasonInput').value.trim() });
  decided('Revisi Realisasi Target sudah dikirim!');
});
$('#decidedDialog form').addEventListener('submit', (e) => {
  // shortcut: halaman Behavior Survey belum ada di prototype.
  if (e.submitter?.value === 'survey') alert('Halaman Behavior Survey belum tersedia di prototype ini.');
});

/* ---------- Shortcut demo: Enter 4x berturut-turut = semua sasaran terpenuhi & rekap aktif ---------- */
function completeAll() {
  fillDemo();
  route();
}
function fillDemo() {
  const demoFile = () => {
    const file = new File(['Evidence demo'], 'evidence-demo.pdf', { type: 'application/pdf' });
    return { file, url: URL.createObjectURL(file) };
  };
  columns.forEach((col) => {
    if (col.evidence && !col.file) Object.assign(col, demoFile());
    col.items.forEach((it) => {
      // Realisasi demo = performa maksimal (110%), jadi Total Weighted Performance = Σ bobot × 110% (Figma 110/110 %).
      const k = it.polarity === 'MIN' ? 100 / PERF_MAX : PERF_MAX / 100;
      it.periods.forEach((p) => {
        p.processes?.forEach((pr) => { pr.value = +(pr.target * k).toFixed(2); });
        p.value = p.processes ? periodValue(p) : +(p.target * k).toFixed(2);
      });
      if ('file' in it && !it.file) Object.assign(it, demoFile());
      it.saved = true;
    });
  });
}
let enterCount = 0;
let enterAt = 0;
document.addEventListener('keydown', (e) => {
  // Enter di dalam isian/tombol punya fungsi sendiri, jadi tidak dihitung.
  if (locked() || e.key !== 'Enter' || e.target.closest('input, textarea, select, button, a, dialog')) { enterCount = 0; return; }
  enterCount = e.timeStamp - enterAt < 1000 ? enterCount + 1 : 1;
  enterAt = e.timeStamp;
  if (enterCount === 4) { enterCount = 0; completeAll(); }
});
// Shortcut demo: Shift ditekan sendirian (bukan Shift+huruf/Tab, bukan di isian) = Behavior Survey normal ↔ belum dinilai.
let shiftAlone = false;
document.addEventListener('keydown', (e) => { if (e.key !== 'Shift') shiftAlone = false; else if (!e.repeat) shiftAlone = true; });
document.addEventListener('keyup', (e) => {
  if (e.key !== 'Shift' || !shiftAlone || e.target.closest('input, textarea')) return;
  shiftAlone = false;
  bsPending = !bsPending;
  if (!$('#rekapDialog').open) return;
  renderRekap();
  if ($('#rekapDialog').dataset.step === '2') renderScore();
});

// Evaluator hanya melihat data yang sudah disubmit; draft Evaluee (tanpa status) tidak ditampilkan.
if (review?.data && (!REVIEW || review.status)) restore(review.data);
else if (REVIEW) { fillDemo(); review = { status: 'waiting' }; } // Heru dianggap sudah submit (data contoh Figma)
// Poin yang disimpan halaman HSSE / PCI (`pr-hsse-…` / `pr-pci-…`, ringkasan `summary`) = realisasi Year End kartunya.
function loadPoin() {
  ['hsse', 'pci'].forEach((id) => {
    let sm = null;
    try { sm = JSON.parse(localStorage.getItem(`pr-${id}-${REVIEW ? 'heru' : LOGIN}`))?.summary; } catch {}
    if (!sm) return;
    const it = findItem(id);
    it.periods[0].value = sm.total;
    if ('file' in it) it.file = sm.evidence; // { name, size } atau null; PCI tanpa `file` karena evidence-nya opsional
    it.incomplete = sm.mandatoryDone === false; // hanya HSSE yang mengirim mandatoryDone
  });
}
loadPoin();
// Talent Development selalu dihitung dari data IDP (bukan snapshot tersimpan), sama dengan halamannya.
if (BUDGET) findItem('dev').periods[0].value = teamDev(OWNER).td;
if (REVIEW) initReviewUI('Review Realisasi Target');
window.addEventListener('hashchange', route);
route();
