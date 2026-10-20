// Dari desain Figma section "Halaman Utama", "Notification", "Log Out" dan "Flow Start".
// Rute: #  = Beranda, #pwtt = Pengelolaan Kinerja → PWTT (Pilih Role).
const IG = '../Individual%20Goal/index.html';
const steps = [
  { label: 'Settings Evaluator', icon: 'material-symbols-light:frame-person-rounded' },
  { label: 'Individual Goal Setting', icon: 'tabler:award-filled' },
  { label: 'CSB', icon: 'tabler:award-filled', hidden: true }, // disembunyikan atas permintaan
  { label: 'Nominate 360', icon: 'streamline-flex:user-collaborate-group-solid' },
  { label: 'Realisasi Target', icon: 'mingcute:target-fill', href: IG },
  { label: 'Self Review', icon: 'material-symbols:person-rounded' },
  { label: 'Survey', icon: 'ri:survey-fill' },
  { label: 'CoPI Feedback', icon: 'mdi:speak' },
];
const contributory = [
  { name: 'HSSE Objective', value: 20, max: 150, unit: 'Poin', href: '../HSSE%20Objective/index.html' },
  { name: 'Development Commitment', value: 20, max: 150, unit: '%', href: '../Development%20Commitment/index.html' },
  { name: 'Project & Community Involvement', value: 20, max: 150, unit: 'Poin', href: '../Project%20Community%20Involvement/index.html' },
];
const nominees = [
  { name: 'Jamaludin Ahmad', nip: '29231284', done: false },
  { name: 'Fariz Nur', nip: '29231284', done: false },
  { name: 'Bakrie Muh', nip: '29231284', done: true },
];
const besTargets = [
  { name: 'Zahara', nip: '1905416', done: false },
  { name: 'Dani Zulfah', nip: '1905416', done: true },
];
const notifs = [
  { group: 'Terkini', type: 'nominate', title: 'Arjuna menambahkan Anda sebagai Nominee 360', text: 'Segera lakukan penilaian agar melancarkan proses rating sintesis' },
  { group: 'Terkini', type: 'rating', title: 'Evaluator Anda telah memberikan penilaian rating sintesis', text: 'Klik notifikasi ini untuk membuka ke rating sintesis' },
  { group: '11 September 2025', type: 'nominate', title: 'Arjuna menambahkan Anda sebagai Nominee 360', text: 'Segera lakukan penilaian agar melancarkan proses rating sintesis' },
  { group: '11 September 2025', type: 'rating', title: 'Evaluator Anda telah memberikan penilaian rating sintesis', text: 'Klik notifikasi ini untuk membuka ke rating sintesis' },
];
const NTABS = [{ id: 'all', label: 'Semua' }, { id: 'nominate', label: 'Nominate 360' }, { id: 'rating', label: 'Rating Sintesis' }];
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
    <span><b class="big">${c.value}</b><small class="muted">/${c.max} ${c.unit}</small></span>
    ${icon('tabler:arrow-right')}
    <span class="ic-bar" role="progressbar" aria-label="${c.name}" aria-valuenow="${c.value}" aria-valuemin="0" aria-valuemax="${c.max}"><i style="width:${Math.min(100, (c.value / c.max) * 100)}%"></i></span>
  </a>`).join('');

const person = (p, action) => `
  <div class="box person-card">
    <div class="pc-head"><div><b class="name">${p.name}</b><span class="muted">${p.nip}</span></div>${status(p.done)}</div>
    ${action ? `<button type="button" class="btn-outline wide" data-missing>${p.done ? 'Lihat Penilaian' : 'Mulai Penilaian'}${icon('tabler:arrow-right')}</button>` : ''}
  </div>`;
$('#tab-nominee').innerHTML = nominees.map((p) => person(p, false)).join('');
$('#tab-bes').innerHTML = besTargets.map((p) => person(p, true)).join('');
// shortcut: Project Progress masih angka tetap 0 (kondisi awal Figma), belum ada sumber data proyek.
$('#pTotal').textContent = 0; $('#pDone').textContent = 0; $('#pProg').textContent = 0;

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
        ${n.type === 'nominate' ? '<img class="avatar" src="assets/avatar.png" alt="" width="32" height="32">' : `<span class="avatar file">${icon('mdi:file-report-outline')}</span>`}
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
  if (n) { notifs.splice(+n.dataset.n, 1); renderNotif(); }
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

document.querySelectorAll('.role').forEach((r) => r.addEventListener('click', () => {
  role = r.dataset.role;
  document.querySelectorAll('.role').forEach((x) => x.setAttribute('aria-checked', x === r));
  $('#roleNext').disabled = false;
}));
// Evaluee lanjut ke alur End Year People Review (Individual Goal); alur Evaluator belum ada.
$('#roleNext').addEventListener('click', () => { if (role === 'evaluee') location.href = IG; else notReady(); });

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-missing]')) { e.preventDefault(); notReady(); }
});
$('#ubahEval').addEventListener('click', notReady);

function route() {
  const pwtt = location.hash === '#pwtt';
  $('#viewHome').hidden = pwtt; $('#homeHead').hidden = pwtt;
  $('#viewPwtt').hidden = !pwtt; $('#pwttHead').hidden = !pwtt; $('#pwttPill').hidden = !pwtt;
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
