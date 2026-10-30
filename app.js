// Dari desain Figma section "Halaman Utama", "Homepage" (Evaluator), "Notification", "Log Out" dan "Flow Start".
// Rute: # = Beranda; #pwtt = PWTT (Pilih Role); #pwtt-evaluator = Pilih Evaluee.
// Akun aktif dari profile.js (window.PR_USER).
const IG = './Individual%20Goal/index.html';
const steps = [
  { label: 'Settings Evaluator', icon: 'material-symbols-light:frame-person-rounded', href: './Settings%20Evaluator/index.html' },
  { label: 'Individual Goal Setting', icon: 'tabler:award-filled', href: './Individual%20Goal%20Setting/index.html' },
  { label: 'CSB', icon: 'tabler:award-filled', hidden: true }, // disembunyikan atas permintaan
  { label: 'Nominate 360', icon: 'streamline-flex:user-collaborate-group-solid', href: './Nominate%20360/index.html' },
  { label: 'Realisasi Target', icon: 'mingcute:target-fill', href: IG },
  { label: 'Self Review', icon: 'material-symbols:person-rounded', href: './Self%20Review/index.html' },
  { label: 'CoPI Feedback', icon: 'mdi:speak' },
];
// Performa (%) sama dengan kartu di Realisasi Target: performa() di review.js atas realisasi Year End.
// Realisasi HSSE / PCI = total poin yang disimpan halamannya (`summary` di `pr-hsse-…` / `pr-pci-…`); Development Commitment = angka tetap yang sama dengan Realisasi Target.
const savedPoin = (id) => { try { return JSON.parse(localStorage.getItem(`pr-${id}-${window.PR_USER}`))?.summary?.total ?? null; } catch { return null; } };
const yearEnd = (target, value) => performa({ periods: [{ target, value }] });
const contributory = [
  { name: 'HSSE Objective', value: yearEnd(YEAR_END_TARGET.hsse, savedPoin('hsse')), href: './HSSE%20Objective/index.html?from=beranda' },
  { name: 'Development Commitment', value: yearEnd(100, 100), href: './Development%20Commitment/index.html?from=beranda' },
  { name: 'Community Involvement', value: yearEnd(YEAR_END_TARGET.pci, savedPoin('pci')), href: './Project%20Community%20Involvement/index.html?from=beranda' },
];
const nominees = [
  { name: 'Jamaludin Ahmad', nip: '29231284', done: false },
  { name: 'Fariz Nur', nip: '29231284', done: false },
  { name: 'Bakrie Muh', nip: '29231284', done: true },
];
// Sama dengan RATEES di Nominate 360/app.js; status mengikuti Penilaian 360 yang tersimpan di halaman itu.
const besSaved = (() => { try { return JSON.parse(localStorage.getItem(`pr-nominate-${window.PR_USER}`))?.ratings; } catch { return null; } })();
const besTargets = [
  { name: 'Zahara', nip: '1905416', done: false },
  { name: 'Dani Zulfah', nip: '1905416', done: true },
].map((p, i) => ({ ...p, done: besSaved?.[i] ? !!besSaved[i].submitted : p.done }));
const notifs = [
  { group: 'Terkini', type: 'nominate', photo: 'avatar.png', title: 'Arjuna menambahkan Anda sebagai Nominee 360', text: 'Segera lakukan penilaian agar melancarkan proses rating sintesis' },
  { group: 'Terkini', type: 'rating', title: 'Evaluator Anda telah memberikan penilaian rating sintesis', text: 'Klik notifikasi ini untuk membuka ke rating sintesis' },
  { group: '11 September 2025', type: 'nominate', photo: 'avatar.png', title: 'Arjuna menambahkan Anda sebagai Nominee 360', text: 'Segera lakukan penilaian agar melancarkan proses rating sintesis' },
  { group: '11 September 2025', type: 'rating', title: 'Evaluator Anda telah memberikan penilaian rating sintesis', text: 'Klik notifikasi ini untuk membuka ke rating sintesis' },
];
const NTABS = [{ id: 'all', label: 'Semua' }, { id: 'nominate', label: 'Nominate 360' }, { id: 'rating', label: 'Rating Sintesis' }];
// Status Realisasi Target Heru yang ditulis halaman Individual Goal (submit Heru / keputusan Oka).
const realisasi = (() => { try { return JSON.parse(localStorage.getItem('pr-realisasi-heru')); } catch { return null; } })();
const REVIEW_HERU = IG; // dibuka Oka → otomatis mode Review & Approve Realisasi Target
const SINTESIS = './Sintesis%20Evaluator/index.html';
const BEHAVIOR = './Behavior%20Survey/index.html'; // dibuka Oka → Behaviour Survey Evaluator
const NOMINATE = './Nominate%20360/index.html'; // dibuka Oka → mode Approve Nominee 360
// Evaluee milik Oka (Figma "Homepage" → Pilih Evaluee). Approval Progress = shortcut ke halaman langkahnya.
// approval(n, realisasiHref): n langkah pertama sudah disetujui (dicentang), langkah ke-n+1 aktif, sisanya abu-abu. C5B dihilangkan atas permintaan.
// n = -1: evaluee belum submit Individual Goal Setting → semua langkah abu-abu.
// Langkah yang sudah punya halaman (href) tidak dikunci.
// shortcut: Sintesis Evaluator Final dinyalakan dulu tanpa menunggu Realisasi Target disetujui (permintaan user); kunci lagi bila alur sudah lengkap.
const approval = (n, realisasiHref, sintesisHref, nominateHref, bsHref) => [
  { group: 'Approval Progress', label: 'Individual Goal Setting' },
  { group: 'Approval Progress', label: 'Nominate 360', href: nominateHref, gate: true },
  { group: 'Approval Progress', label: 'Realisasi Target', href: realisasiHref },
  { group: 'Penilaian', label: 'Penilaian Behavior Survey 360', href: bsHref },
  { group: 'Penilaian', label: 'Sintesis Evaluator Final', href: sintesisHref },
].map((s, i) => {
  const off = s.gate && !s.href; // Nominate 360 tanpa href = Evaluee belum submit → abu-abu & tidak dicentang
  return { ...s, done: i < n && !off, locked: off || (i > n && !s.href) };
});
// Pilihan Nominee 360 Heru (disimpan Nominate 360/app.js) sudah dikirim ke Evaluator?
const nominateHeru = (() => { try { return !!JSON.parse(localStorage.getItem('pr-nominate-heru'))?.submitted; } catch { return false; } })();
const PEOPLE = {
  heru: {
    name: 'Heru Kautsar', nip: '19050193', title: 'Sr Analyst II Performance &amp; Competency Mgt',
    evaluator: { name: 'Oka Fitrio', nip: '1905416', title: 'Manager Performance &amp; Competency Mgt' },
    evaluees: [],
    // shortcut: Project Progress masih angka tetap 0 (kondisi awal Figma), belum ada sumber data proyek.
    project: { label: 'Total Project', total: 0, done: 0, prog: 0 },
  },
  oka: {
    name: 'Oka Fitrio', nip: '1905416', title: 'Manager Performance &amp; Competency Mgt',
    evaluator: { name: 'Aryomekka Firdaus', nip: '777777', title: 'VP Talent Development &amp; Recruitment' },
    evaluees: [
      // pos = urutan di halaman Pilih Evaluee (Figma); beranda memakai urutan array.
      { name: 'Muhamad Fadlin Ananta', nip: '754933', title: 'Analyst I Perf.&amp; Comp.Mgt', steps: approval(-1), pos: 3 },
      { name: 'Heru Kautsar', nip: '19050193', title: 'Sr Analyst II Performance &amp; Competency Mgt', steps: approval(realisasi?.status === 'approved' ? 3 : 2, REVIEW_HERU, SINTESIS, nominateHeru && NOMINATE, BEHAVIOR), review: REVIEW_HERU, open: true, pos: 1 },
      { name: 'Roehim Nuranas', nip: '752579', title: 'Sr Officer I Audit Relation', steps: approval(-1), pos: 2 },
    ],
    project: { label: 'Total Tugas', total: 27, done: 9, prog: 10 },
  },
  // Chairman (Figma "Rekapitulasi Sintesis Evaluator - Alt 2 - POV Chairman"): Evaluator bagi Oka sekaligus
  // penyetuju Rekapitulasi Sintesis yang diajukan Evaluator (tab Persetujuan Penilaian Kinerja, persetujuan.js).
  aryo: {
    name: 'Aryomekka Firdaus', nip: '777777', title: 'VP Talent Development &amp; Recruitment', chairman: true,
    // shortcut: atasan Chairman belum ada di desain; isi contoh sampai ada data organisasi.
    evaluator: { name: 'I Made Wisnu Suryadana', nip: '700001', title: 'SVP Human Capital' },
    evaluees: [{ name: 'Oka Fitrio', nip: '1905416', title: 'Manager Performance &amp; Competency Mgt', steps: approval(-1), pos: 1 }],
    project: { label: 'Total Tugas', total: 12, done: 4, prog: 3 },
  },
};
const ME = PEOPLE[window.PR_USER] || PEOPLE.heru;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
// Evaluator yang sudah di-submit di halaman Settings Evaluator menggantikan Evaluator bawaan.
const myEvaluator = (() => { try { return JSON.parse(localStorage.getItem(`pr-evaluator-${window.PR_USER}`)); } catch { return null; } })();
if (myEvaluator?.submitted && myEvaluator.name) ME.evaluator = { name: esc(myEvaluator.name), nip: esc(myEvaluator.nopek), title: esc(myEvaluator.title) };
// Notifikasi untuk Heru setelah Evaluator memutuskan Realisasi Target-nya.
if (ME === PEOPLE.heru && ['approved', 'revision'].includes(realisasi?.status)) {
  const ok = realisasi.status === 'approved';
  notifs.unshift({
    group: 'Terkini', type: 'realisasi', photo: 'avatar-oka.png', href: ok ? `${IG}#rekap` : IG,
    title: `Evaluator Anda ${ok ? 'telah menyetujui' : 'tidak menyetujui'} Realisasi Target Anda`,
    text: ok ? 'Klik notifikasi ini untuk melihat Rekap Realisasi Sasaran Kerja'
      : `${realisasi.reason ? `Alasan: ${esc(realisasi.reason)}. ` : ''}Silakan perbaiki lalu submit ulang realisasi Anda`,
  });
}
let notifTab = 'all';
let role = null;

const $ = (s) => document.querySelector(s);
const icon = (name) => `<i class="ico">${ICONS[name]}</i>`;
const status = (done) => done ? '<span class="chip chip-ok">Completed</span>' : '<span class="chip chip-warn">In Progress</span>';
const notReady = () => alert('Halaman ini belum tersedia di prototype.');
function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    el.classList.add('ico');
    el.innerHTML = ICONS[el.dataset.icon];
  });
}

// Langkah tanpa halaman di prototype tetap bisa di-hover, tapi kliknya hanya memberi info.
$("#steps").innerHTML = steps.filter((s) => !s.hidden).map((s) => `<li><a href="${s.href || '#'}"${s.href ? '' : ' data-missing'}>${icon(s.icon)}<span>${s.label}</span></a></li>`).join('');

$('#icList').innerHTML = contributory.map((c) => `
  <a class="ic" href="${c.href}">
    <span class="ic-name">${c.name}</span>
    <span><b class="big">${c.value}</b><small class="muted">/${PERF_MAX} %</small></span>
    ${icon('tabler:arrow-right')}
    <span class="ic-bar" role="progressbar" aria-label="Performa ${c.name}" aria-valuenow="${c.value}" aria-valuemin="0" aria-valuemax="${PERF_MAX}"><i style="width:${(c.value / PERF_MAX) * 100}%"></i></span>
  </a>`).join('');

const person = (p, action) => `
  <div class="box person-card">
    <div class="pc-head"><div><b class="name">${p.name}</b><span class="muted">${p.nip}</span></div>${status(p.done)}</div>
    ${action ? `<button type="button" class="btn-outline wide" data-missing>${p.done ? 'Lihat Penilaian' : 'Mulai Penilaian'}${icon('tabler:arrow-right')}</button>` : ''}
  </div>`;
const emptyState = (ic, title, text, action = '') => `
  <div class="empty-state"><span class="es-ico">${icon(ic)}</span><b>${title}</b><p>${text}</p>${action}</div>`;
// Figma "Homepage (empty state) (NEW)": Heru belum memilih Nominee 360, Oka belum diminta menilai BeS 360.
const myNominees = ME === PEOPLE.heru ? [] : nominees;
const myBes = ME === PEOPLE.oka ? [] : besTargets;
$('#tab-nominee').innerHTML = myNominees.map((p) => person(p, false)).join('')
  || emptyState('fluent:people-error-24-filled', 'Tidak ditemukan data Pekerja<br>yang dipilih oleh Anda', 'Anda belum memilih Pekerja<br>untuk Nominee 360',
    `<a class="btn-outline" href="./Nominate%20360/index.html">Menuju Nominate 360${icon('tabler:arrow-right')}</a>`);
$('#tab-bes').innerHTML = myBes.map((p) => person(p, true)).join('')
  || emptyState('fluent:comment-error-24-regular', 'Tidak ditemukan data Pekerja yang<br>memilih Anda untuk menilai', 'Belum ada Pekerja yang memberikan permintaan Anda<br>untuk melakukan Penilaian 360');

$('#greetName').textContent = `${ME.name}!`;
$('#meBox').innerHTML = `<b>${ME.name}</b><span class="muted">${ME.nip} • ${ME.title}</span>`;
$('#evalBox').innerHTML = `<b class="name">${ME.evaluator.name}</b><span class="muted">${ME.evaluator.nip}</span><small>${ME.evaluator.title}</small>`;
$('#pLabel').textContent = ME.project.label;
$('#pTotal').textContent = ME.project.total; $('#pDone').textContent = ME.project.done; $('#pProg').textContent = ME.project.prog;

// "Pilih Jenis Penilaian" (popup sebelum review) disembunyikan dulu atas permintaan → Mulai Review langsung lanjut.
// Hanya review Heru yang bisa dibuka; evaluee lain belum submit semua tahapan → tombol disabled.
const startReview = (p) => (p.review
  ? `<a class="btn-outline wide" href="${p.review}" data-review>Mulai Review${icon('tabler:arrow-right')}</a>`
  : `<button type="button" class="btn-outline wide" disabled title="Evaluee belum submit semua tahapan">Mulai Review${icon('tabler:arrow-right')}</button>`);
const stepRow = (s) => `<a class="ap-step${s.locked ? ' locked' : ''}" href="${s.href || '#'}"${s.href ? ' data-review' : ' data-missing'}>
  <span>${s.label}${icon('tabler:arrow-right')}</span><i class="ap-check${s.done ? ' on' : ''}" aria-label="${s.done ? 'Sudah disetujui' : 'Belum disetujui'}">${s.done ? ICONS['material-symbols:check-rounded'] : ''}</i></a>`;
const evCard = (p) => `
  <div class="box ev-card"><details${p.open ? ' open' : ''}>
    <summary class="pc-head"><div><b class="name">${p.name}</b><span class="muted">${p.nip}</span></div><span class="ev-meta">${status(false)}${icon('mdi:chevron-down')}</span></summary>
    <div class="ap">${[...new Set(p.steps.map((s) => s.group))].map((g) => `<p class="ap-group">${g}</p>${p.steps.filter((s) => s.group === g).map(stepRow).join('')}`).join('')}</div>
  </details>${startReview(p)}</div>`;
// Dua kolom terpisah (kartu ke-1,3,5… kiri; 2,4,6… kanan) supaya kartu yang dibuka tidak membuat celah di kolom sebelah.
$('#myEvaluees').innerHTML = [0, 1].map((c) => `<div class="ev-col">${ME.evaluees.filter((_, i) => i % 2 === c).map(evCard).join('')}</div>`).join('');
$('#myEvalueesHead').hidden = $('#myEvaluees').hidden = !ME.evaluees.length;

// Pagination: 6 evaluee per halaman (3 baris × 2 kolom). Hanya 1 halaman → pager disembunyikan.
const PAGE_SIZE = 6;
let evPage = 1;
// Nomor yang tampil: 1, sekitar halaman aktif (minimal sampai 3), dan halaman terakhir; celahnya jadi "…".
function pageNumbers(cur, last) {
  const nums = [1, last];
  for (let n = Math.max(1, cur - 1); n <= Math.min(last, Math.max(cur + 1, 3)); n++) nums.push(n);
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}
function renderEvList() {
  const q = $('#evSearch').value.trim().toLowerCase();
  const list = ME.evaluees
    .filter((p) => !q || p.name.toLowerCase().includes(q) || p.nip.includes(q))
    .sort((a, b) => (a.pos ?? Infinity) - (b.pos ?? Infinity));
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  evPage = Math.min(evPage, pages);
  $('#evList').innerHTML = list.length ? list.slice((evPage - 1) * PAGE_SIZE, evPage * PAGE_SIZE).map((p) => `
    <div class="box ev-row">
      <div><b class="name">${p.name}</b><span class="nip">${p.nip}</span><small>${p.title}</small></div>
      ${startReview(p).replace(' wide', '')}
    </div>`).join('') : '<p class="muted ev-empty">Pekerja tidak ditemukan.</p>';
  renderPager($('#evPager'), evPage, pages);
}
// Dipakai juga oleh Rekapitulasi Sintesis Evaluator (rekap.js).
function renderPager(nav, cur, pages) {
  nav.hidden = pages === 1;
  nav.innerHTML = `
    <button type="button" class="icon-btn" data-page="${cur - 1}" aria-label="Halaman sebelumnya"${cur === 1 ? ' disabled' : ''}>${icon('mdi:chevron-down').replace('class="ico"', 'class="ico pg-prev"')}</button>
    ${pageNumbers(cur, pages).map((n) => n === '…' ? '<span class="pg-gap">…</span>'
      : `<button type="button" class="pg" data-page="${n}"${n === cur ? ' aria-current="page"' : ''}>${n}</button>`).join('')}
    <button type="button" class="icon-btn" data-page="${cur + 1}" aria-label="Halaman berikutnya"${cur === pages ? ' disabled' : ''}>${icon('mdi:chevron-down').replace('class="ico"', 'class="ico pg-next"')}</button>`;
}
$('#evSearch').addEventListener('input', () => { evPage = 1; renderEvList(); });
$('#evPager').addEventListener('click', (e) => {
  const b = e.target.closest('[data-page]');
  if (b && !b.disabled) { evPage = +b.dataset.page; renderEvList(); }
});
renderEvList();

$('#homeTabs').addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (!tab) return;
  document.querySelectorAll('#homeTabs .htab').forEach((t) => t.setAttribute('aria-selected', t === tab));
  document.querySelectorAll('.hpanel').forEach((p) => { p.hidden = p.id !== `tab-${tab.dataset.tab}`; });
  tab.classList.remove('dot'); // titik merah = belum dibuka
});

function renderNotif() {
  const list = notifs.filter((n) => notifTab === 'all' || n.type === notifTab);
  $('#notifTabs').hidden = !notifs.length;
  $('#notifTabs').innerHTML = NTABS.map((t) => `<button type="button" role="tab" class="ntab" data-ntab="${t.id}" aria-selected="${t.id === notifTab}">${t.label}<span class="count">${t.id === 'all' ? 99 : notifs.filter((n) => n.type === t.id).length}</span></button>`).join('');
  if (!list.length) {
    $('#notifList').innerHTML = `<div class="notif-empty"><img src="assets/notif-empty.svg" alt="" width="158" height="203"><b>Tidak Ada Notifikasi<br>yang Tersedia</b><small class="muted">Silakan untuk menutup kembali<br>notifikasi ini</small></div>`;
    return;
  }
  const groups = [...new Set(list.map((n) => n.group))];
  $('#notifList').innerHTML = groups.map((g) => `
    <h3>${g}</h3>
    ${list.filter((n) => n.group === g).map((n) => `
      <button type="button" class="notif-item" data-n="${notifs.indexOf(n)}">
        ${n.photo ? `<img class="avatar" src="assets/${n.photo}" alt="" width="32" height="32">` : `<span class="avatar file">${icon('mdi:file-report-outline')}</span>`}
        <span><b>${n.title}</b><small>${n.text}</small></span>
      </button>`).join('')}`).join('');
}
$('#notifTabs').addEventListener('click', (e) => {
  const t = e.target.closest('[data-ntab]');
  if (t) { notifTab = t.dataset.ntab; renderNotif(); }
});
// shortcut: klik notifikasi menandainya terbaca (hilang dari daftar) karena halaman tujuannya belum ada; sampai kosong → empty state.
$('#notifList').addEventListener('click', (e) => {
  const n = e.target.closest('[data-n]');
  if (n && notifs[+n.dataset.n].href) location.href = notifs[+n.dataset.n].href;
  else if (n) { notifs.splice(+n.dataset.n, 1); renderNotif(); }
});

// Popover notifikasi: buka/tutup lewat tombolnya, tutup saat klik di luar atau Esc.
function popover(btn, pop) {
  const set = (open) => { pop.hidden = !open; btn.setAttribute('aria-expanded', open); };
  btn.addEventListener('click', () => set(pop.hidden));
  document.addEventListener('click', (e) => { if (!pop.hidden && e.target.isConnected && !pop.contains(e.target) && !btn.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
}
popover($('#bellBtn'), $('#notifPop'));
$('#navKinerja').addEventListener('click', () => {
  const open = $('#subKinerja').hidden;
  $('#subKinerja').hidden = !open;
  $('#navKinerja').setAttribute('aria-expanded', open);
});

document.querySelectorAll('[data-role]').forEach((r) => r.addEventListener('click', () => {
  role = r.dataset.role;
  document.querySelectorAll('[data-role]').forEach((x) => x.setAttribute('aria-checked', x === r));
  $('#roleNext').disabled = false;
}));
// Evaluee lanjut ke Individual Goal; Evaluator ke Pilih Evaluee (hanya akun yang punya evaluee).
$('#roleNext').addEventListener('click', () => {
  if (role === 'evaluee') location.href = IG;
  else if (ME.evaluees.length) location.hash = '#pwtt-evaluator';
  else notReady();
});

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-missing]')) { e.preventDefault(); notReady(); }
});
// Jalur Evaluator (data-review) membuka halaman Heru dalam mode review; tautan lain membuka milik user sendiri.
// Dicek saat klik (bukan saat load) supaya tetap benar setelah tombol Back (bfcache).
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]:not([data-missing])');
  if (!a) return;
  try { 'review' in a.dataset ? sessionStorage.setItem('pr-review', 'heru') : sessionStorage.removeItem('pr-review'); } catch {}
});
$('#roleNext').addEventListener('click', () => { try { sessionStorage.removeItem('pr-review'); } catch {} });
$('#ubahEval').addEventListener('click', notReady);

function route() {
  let view = { '#pwtt': 'role', '#pwtt-evaluator': 'evaluee', '#pwtt-rekap': 'rekap', '#pwtt-approval': 'approval',
    '#pwtt-persetujuan': 'persetujuan', '#pwtt-berita-acara': 'ba' }[location.hash] || 'home';
  if (['evaluee', 'rekap', 'approval', 'persetujuan', 'ba'].includes(view) && !ME.evaluees.length) view = 'role';
  if (view === 'persetujuan' && !ME.chairman) view = 'evaluee';
  const pwtt = view !== 'home';
  const eypr = ['rekap', 'approval', 'persetujuan', 'ba'].includes(view);
  const crumbs = ['Pengelolaan Kinerja', 'PWTT'];
  if (eypr ? view !== 'approval' : view === 'evaluee') crumbs.push('Evaluator');
  const tab = { evaluee: 'Penilaian Evaluee', rekap: 'Rekapitulasi Sintesis Evaluator' }[view];
  if (tab) crumbs.push(tab);
  $('#pwttHead').innerHTML = `${crumbs.slice(0, -1).join(' • ')} • <span>${crumbs.at(-1)}</span>`;
  $('#viewHome').hidden = pwtt; $('#homeHead').hidden = pwtt;
  $('#viewPwtt').hidden = view !== 'role'; $('#viewEvaluee').hidden = view !== 'evaluee';
  $('#viewRekap').hidden = $('#rkFoot').hidden = view !== 'rekap'; $('#viewApproval').hidden = view !== 'approval';
  $('#viewPersetujuan').hidden = view !== 'persetujuan';
  $('#viewBA').hidden = $('#baFoot').hidden = view !== 'ba';
  document.querySelectorAll('[data-chairman]').forEach((t) => { t.hidden = !ME.chairman; });
  // Figma End Year People Review (Rekapitulasi, Approval, Persetujuan, Berita Acara) tidak menampilkan pill PWTT.
  $('#pwttHead').hidden = !pwtt; $('#pwttPill').hidden = !pwtt || eypr;
  $('#navHome').classList.toggle('active', !pwtt);
  $('#navKinerja').classList.toggle('active', pwtt);
  $('#navPwtt').classList.toggle('active', pwtt);
  if (pwtt) { $('#subKinerja').hidden = false; $('#navKinerja').setAttribute('aria-expanded', true); }
  document.body.classList.toggle('is-home', !pwtt);
  document.title = `${pwtt ? 'PWTT' : 'Beranda'} – People Review`;
}

hydrateIcons();
renderNotif();
window.addEventListener('hashchange', route);
route();
