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
  { title: 'Individual Contributory', badge: '20%', items: [
    // Target Year End dari sistem lama; realisasi = total poin yang disimpan halaman HSSE / PCI (lihat loadPoin di bawah).
    item({ id: 'hsse', file: null, name: 'HSSE Objective', weight: 8, unit: 'Poin', periods: [{ label: 'Year End', target: YEAR_END_TARGET.hsse, value: null }],
      href: '../HSSE%20Objective/index.html' }),
    item({ id: 'pci', file: null, name: 'Community Involvement', weight: 7, unit: 'Poin', periods: [{ label: 'Year End', target: YEAR_END_TARGET.pci, value: null }],
      href: '../Project%20Community%20Involvement/index.html' }),
    item({ id: 'dev', name: 'Development Commitment', weight: 5, periods: [{ label: 'Year End', target: 100, value: 100 }],
      href: '../Development%20Commitment/index.html' }),
  ] },
  { title: 'Cascading KPI', badge: '80/80%', evidence: true, file: null, items: [
    item({ id: 'rbf', name: 'Remodelling Business Flow People Review', desc: 'Model ulang bisnis proses dalam People Review sebagai dasar Re-engineering',
      library: 'Enhancement HC-IT System', type: 'Fully Cascade', polarity: 'MAX', periodType: 'Semester', weight: 60 }),
    item({ id: 'fin', name: 'Finance Efficiency', desc: 'Efisiensi biaya operasional unit', library: 'Improving Finance Policy',
      type: 'Fully Cascade', polarity: 'MAX', periodType: 'Triwulan', weight: 10, unit: 'USD',
      periods: [3000, 2000, 2000, 8000].map((target, i) => ({ label: `Triwulan ${i + 1}`, target, value: null })) }),
  ] },
  { title: 'Project Control', badge: '80/80%', items: [
    item({ id: 'rdmp', project: true, file: null, name: 'Proyek Optimasi RDMP', desc: 'Model ulang bisnis proses dalam People Review sebagai dasar Re-engineering',
      library: 'Building Innovation', type: 'Fully Cascade', polarity: 'MIN', periodType: 'Bulanan', weight: 10,
      leader: person('Oka Fitrio'), members: ['Heru Kautsar', 'Hamim Tohari', 'Aceng Koswara', 'Dede Rukmana'].map(person),
      periods: ['Januari', 'Februari'].map((label) => ({ label, target: 50, value: null, processes: processes() })) }),
  ] },
  { title: 'Extramiles', badge: '0%', items: [
    item({ id: 'ext', name: 'Remodelling Business Flow People Review', library: 'Enhancement HC-IT System',
      type: 'Extramiles', polarity: 'MAX', periodType: 'Semester', weight: 0 }),
  ] },
];

const $ = (s) => document.querySelector(s);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
// Isi semua <i data-icon="prefix:nama"> dengan SVG dari icons.js.
const hydrateIcons = (root) => root.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
hydrateIcons(document);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const fmt = (n) => (n == null ? 0 : n).toLocaleString('id-ID');
const initials = (name) => name.split(' ').map((w) => w[0]).join('');

// Performa (rumus sistem lama, per periode): realisasi tiap periode dihitung maksimal sebesar targetnya (kelebihan di satu
// periode tidak menutup kekurangan periode lain), lalu Σ ÷ Σ target × 100%, maksimal 100%.
// Polaritas MIN (makin kecil makin baik): skor tiap periode = Target ÷ Realisasi (maks 100%; realisasi 0 = 100%),
// dihitung dari periode yang sudah diisi, dirata-rata tertimbang target.
const PERF_MAX = 100;
function performa(it) {
  const min = it.polarity === 'MIN';
  const filled = it.periods.filter((p) => p.value != null);
  const ps = min ? filled : it.periods;
  // realisasi yang dihitung per periode, dalam satuan target (maks sebesar target)
  const got = ps.map((p) => (min ? (p.value ? Math.min(1, p.target / p.value) : 1) * p.target : Math.min(p.value || 0, p.target)));
  const target = sum(ps.map((p) => p.target));
  return filled.length && target ? Math.min(PERF_MAX, Math.round((sum(got) / target) * 100)) : 0;
}
console.assert(performa({ periods: [{ target: 50, value: 80 }, { target: 50, value: 20 }] }) === 70, 'kelebihan periode tidak menutup periode lain');
console.assert(performa({ periods: [{ target: 50, value: 60 }, { target: 100, value: 115 }] }) === 100, 'maks 100%');
console.assert(performa({ periods: [{ target: 50, value: 50 }, { target: 50, value: null }] }) === 50, 'periode kosong dihitung 0');
console.assert(performa({ periods: [{ target: 50, value: 40 }, { target: 100, value: 60 }] }) === 67, 'Σ realisasi ÷ Σ target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 20 }, { target: 10, value: null }] }) === 50, 'MIN: target ÷ realisasi periode terisi');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 50, value: 60 }, { target: 50, value: 40 }] }) === 92, 'MIN per periode (maks 100%), rata-rata tertimbang target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 0 }] }) === 100 && performa({ polarity: 'MIN', periods: [{ target: 10, value: null }] }) === 0, 'MIN: realisasi 0 = 100%, kosong = 0');
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
  const done = p >= 100 && !it.incomplete; // incomplete: HSSE dengan aktivitas Mandatory yang belum disimpan
  return `
    <article class="card">
      <span class="ribbon">Bobot ${it.weight}%</span>
      <div class="card-body">
        <div class="chips"><span class="chip ${done ? 'chip-ok' : 'chip-warn'}">${done ? 'Selesai' : 'Sedang Dikerjakan'}</span>${'file' in it ? evidenceChip(it.file) : ''}</div>
        <div class="title-row"><h3>${esc(it.name)}</h3>${it.members ? `<span class="avatars">${avatarsHTML(it.members)}</span>` : ''}</div>
        ${it.library ? `<div class="library">KPI Library ${icon('tabler:arrow-right')} ${esc(it.library)}</div>` : ''}
        <div class="perf"><span class="with-ico">Performa Anda <button type="button" class="info-btn" data-info aria-label="Info performa" aria-controls="perfTip" aria-expanded="false">${icon('material-symbols:info-outline-rounded', 'info')}</button></span><span><b>${p}</b><small>/100 %</small></span></div>
        <div class="bar"><i style="width:${p}%"></i>${p > 10 && p < 100 ? `<em style="left:${p}%">${p}%</em>` : ''}<span${p >= 95 ? ' style="color:#fff"' : ''}>${p >= 100 ? '100%' : 100}</span></div>
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
  $('#dTotal').innerHTML = `${performa(it)}<small>/100 %</small>`;
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
  $('#pTotal').innerHTML = `${performa(proj)}<small>/100 %</small>`;
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
  $('#boardView').hidden = !!proj || rekap;
  $('#boardFooter').hidden = REVIEW || !!proj || rekap;
  $('#processView').hidden = $('#processFooter').hidden = !proj;
  $('#rekapView').hidden = !rekap;
  $('#rekapFooter').hidden = REVIEW || !rekap;
  $('#reviewFooter').hidden = !REVIEW || !!proj;
  if (REVIEW) {
    disableLink($('#rvBack'), !rekap);
    disableLink($('#rvToRekap'), rekap || !evidenceOk());
    renderDecide();
  }
  if (rekap) {
    renderRekap();
  } else if (proj) {
    $('#pSearch').value = '';
    procFilter.reset();
    closedPeriods.clear();
    renderProcess();
  } else {
    render();
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

/* ---------- Rekap realisasi sasaran kerja ---------- */
// Item berbobot 0 (mis. Extramiles) tidak ikut rekap, sesuai Figma.
const rekapGroups = () => columns.map((col) => ({ col, items: col.items.filter((it) => it.weight > 0) })).filter((g) => g.items.length);
const weighted = (it) => (it.weight * performa(it)) / 100;
const evidenceOf = (col, it) => (col.evidence ? col.file : 'file' in it ? it.file : undefined); // undefined = tidak wajib evidence
console.assert(weighted({ weight: 60, periods: [{ target: 50, value: 50 }, { target: 50, value: 50 }] }) === 60, 'bobot × performa');

function renderRekap() {
  const groups = rekapGroups();
  const total = sum(groups.flatMap((g) => g.items.map(weighted)));
  statusChip($('#rekapStatus'));
  $('#rkSubmit').disabled = locked();
  $('#rkPerforma').innerHTML = `<h2>Performa Anda</h2><div class="rk-scroll">${groups.map(({ col, items }) => `
    <div class="rk-group">
      <div class="rk-group-head"><h3>${col.title}</h3><span class="chip chip-blue">Bobot: ${sum(items.map((i) => i.weight))}%</span></div>
      ${items.map((it) => {
        const p = performa(it);
        const ev = evidenceOf(col, it);
        return `<div class="rk-item">
          <div class="rk-item-head">
            <div><p>${esc(it.name)}</p><span><span class="big">${p}</span><small>/100 %</small><span class="chip chip-blue">Bobot: ${it.weight}%</span></span></div>
            ${ev === undefined ? '' : `<span class="rk-ev ${ev ? 'ok' : ''}">${icon(ev ? 'material-symbols:check-rounded' : 'material-symbols:warning-outline-rounded')}Evidence ${ev ? 'Sudah' : 'Belum'} Terupload</span>`}
          </div>
          <div class="bar"><i style="width:${p}%"></i></div>
        </div>`;
      }).join('')}
    </div>`).join('')}</div>`;

  const C = 2 * Math.PI * 42;
  $('#rkKpi').innerHTML = `
    <div class="rk-kpi-main">
      <h2>KPI Anda</h2>
      <p class="muted small">Berdasarkan perhitungan capaian kinerja dan Individual Contributory yang dikalikan dengan bobot</p>
      <div class="rk-scroll">${groups.map(({ col, items }) => `<div class="rk-kpi-group"><h3>${col.title}</h3>${items.map((it) => `
        <b>${esc(it.name)}</b>
        <div class="rk-calc"><span class="muted">Hasil Performa Pembobotan</span><span>${it.weight}% x ${performa(it)}% = <b>${weighted(it).toFixed(2)}</b></span></div>`).join('')}</div>`).join('')}</div>
      <div class="rk-total"><span>Total Performa Pembobotan</span><span>${fmt(+total.toFixed(2))}%</span></div>
    </div>
    <div class="rk-kpi-side">
      <div class="donut">
        <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" class="donut-track"/>
          <circle cx="50" cy="50" r="42" class="donut-fill" stroke-dasharray="${(C * Math.min(100, total)) / 100} ${C}"/></svg>
        <b>${fmt(+total.toFixed(2))}%</b>
      </div>
      <div class="dev-legend"><span class="dot"></span>KPI Performance <span><span class="big">${fmt(+total.toFixed(2))}</span><small>/100 %</small></span></div>
    </div>`;
}

$('#toRekap').addEventListener('click', () => { location.hash = 'rekap'; });
$('#rkSubmit').addEventListener('click', () => { $('#submitDialog').showModal(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  saveStore({ status: 'waiting', reason: '' });
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
const refresh = () => { renderDecide(); location.hash === '#rekap' ? renderRekap() : render(); };
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
      it.periods.forEach((p) => {
        p.processes?.forEach((pr) => { pr.value = pr.target; });
        p.value = p.processes ? periodValue(p) : p.target;
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
    it.file = sm.evidence; // { name, size } atau null
    it.incomplete = sm.mandatoryDone === false; // hanya HSSE yang mengirim mandatoryDone
  });
}
loadPoin();
if (REVIEW) initReviewUI('Review Realisasi Target');
window.addEventListener('hashchange', route);
route();
