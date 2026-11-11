// Dimuat sebelum app.js halaman Realisasi Target (butuh ICONS dari icons.js halaman itu) dan Beranda (YEAR_END_TARGET & performa).
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
// Target Year End poin Individual Contributory (sistem lama): dipakai kartu Realisasi Target & label "/target Poin" HSSE / PCI.
const YEAR_END_TARGET = { hsse: 300, pci: 80 };
// Performa (rumus sistem lama, per periode): realisasi tiap periode dihitung maksimal 110% targetnya (kelebihan di satu
// periode tidak menutup kekurangan periode lain), lalu Σ ÷ Σ target × 100%, maksimal 110%.
// Polaritas MIN (makin kecil makin baik): skor tiap periode = Target ÷ Realisasi (maks 110%; realisasi 0 = 110%),
// dihitung dari periode yang sudah diisi, dirata-rata tertimbang target.
const PERF_MAX = 110;
function performa(it) {
  const min = it.polarity === 'MIN';
  const filled = it.periods.filter((p) => p.value != null);
  const ps = min ? filled : it.periods;
  // realisasi yang dihitung per periode, dalam satuan target (maks PERF_MAX% target)
  const cap = PERF_MAX / 100;
  const got = ps.map((p) => (min ? (p.value ? Math.min(cap, p.target / p.value) : cap) * p.target : Math.min(p.value || 0, cap * p.target)));
  const target = ps.reduce((x, p) => x + p.target, 0);
  return filled.length && target ? Math.min(PERF_MAX, Math.round((got.reduce((x, y) => x + y, 0) / target) * 100)) : 0;
}
console.assert(performa({ periods: [{ target: 50, value: 80 }, { target: 50, value: 20 }] }) === 75, 'kelebihan periode (maks 110% target) tidak menutup periode lain');
console.assert(performa({ periods: [{ target: 50, value: 60 }, { target: 100, value: 115 }] }) === 110, 'maks 110%');
console.assert(performa({ periods: [{ target: 50, value: 50 }, { target: 50, value: null }] }) === 50, 'periode kosong dihitung 0');
console.assert(performa({ periods: [{ target: 50, value: 40 }, { target: 100, value: 60 }] }) === 67, 'Σ realisasi ÷ Σ target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 20 }, { target: 10, value: null }] }) === 50, 'MIN: target ÷ realisasi periode terisi');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 50, value: 60 }, { target: 50, value: 40 }] }) === 97, 'MIN per periode (maks 110%), rata-rata tertimbang target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 0 }] }) === 110 && performa({ polarity: 'MIN', periods: [{ target: 10, value: null }] }) === 0, 'MIN: realisasi 0 = 110%, kosong = 0');
// Mode evaluator: Oka me-review Realisasi Target milik Heru secara read-only. Aktif hanya bila halaman dibuka
// dari jalur Evaluator di beranda (link data-review → sessionStorage 'pr-review'); jalur Evaluee membuka milik sendiri.
// Halaman Individual Contributory: tombol kembali ke asal (Beranda bila dibuka dari kartu Beranda, selain itu Realisasi Target).
const BACK = new URLSearchParams(location.search).get('from') === 'beranda'
  ? { url: '../index.html', label: 'Beranda' } : { url: '../Individual%20Goal/index.html', label: 'Realisasi Target' };
document.querySelectorAll('a[href="../Individual%20Goal/index.html"]').forEach((a) => {
  a.href = BACK.url;
  if (a.ariaLabel) a.ariaLabel = `Kembali ke ${BACK.label}`;
  if (a.textContent.trim()) a.textContent = `Kembali ke ${BACK.label}`;
});
const REVIEW = (() => { try { return LOGIN !== 'heru' && sessionStorage.getItem('pr-review') === 'heru'; } catch { return false; } })();

// Talent Development (Figma "Talent Development – Khusus Evaluator yang ingin Realisasi Target", Desktop 1839–1841)
// menggantikan Development Commitment untuk KPI Budget Holder: Beranda, Realisasi Target & halaman Development Commitment.
// IDP (Individual Development Plan) per NIP: [skor %, plan, real] tiap IDP_PARTS + Realisasi Development (%).
// Dipakai juga oleh Development Commitment Evaluee (Figma 978): komponen & kartunya sama.
// shortcut: angka contoh (Oka, Putri, Fitria dari Figma 1839–1840, Platto 1841; Heru 100 = angka Development Commitment
// di Beranda & Realisasi Target); nantinya dari Capability Development Plan.
const IDP_PARTS = [['Assignment', 70], ['Coaching', 20], ['Training', 5], ['Self Learning', 5]];
const IDP = {
  19050193: { name: 'Heru Kautsar', rows: [[100, 3, 3], [100, 3, 3], [100, 3, 3], [100, 3, 3]], dev: 100 },
  752579: { name: 'Roehim Nuranas', rows: [[60, 5, 3], [50, 2, 1], [40, 5, 2], [8, 4, 1]], dev: 54 },
  754933: { name: 'Muhamad Fadlin Ananta', rows: [[40, 5, 2], [25, 4, 1], [20, 5, 1], [0, 2, 0]], dev: 34 },
  748958: { name: 'Putri Rizqiandini', rows: [[10, 3, 3], [30, 3, 3], [5, 3, 3], [5, 3, 3]], dev: 20 },
  749285: { name: 'Fitria Lisdiyanti', rows: [[81, 5, 5], [22, 4, 1], [14, 5, 0], [5, 3, 3]], dev: 62 },
  749291: { name: 'Platto Mutaqin', rows: [[28, 3, 1], [24, 5, 4], [60, 1, 1], [60, 1, 1]], dev: 27 },
  1905416: { name: 'Oka Fitrio', rows: [[10, 3, 3], [30, 3, 3], [5, 3, 3], [5, 3, 3]], dev: 20 },
  751806: { name: 'Reni Oktavia', rows: [[80, 5, 4], [50, 2, 1], [60, 5, 3], [9, 3, 1]], dev: 69 },
  753120: { name: 'Hendra Prabowo', rows: [[60, 5, 3], [75, 4, 3], [40, 5, 2], [6, 5, 2]], dev: 59 },
  777777: { name: 'Aryomekka Firdaus', rows: [[90, 5, 4], [70, 3, 2], [80, 5, 4], [4, 2, 1]], dev: 81 },
};
console.assert(IDP_PARTS.reduce((s, [, w]) => s + w, 0) === 100 && Object.values(IDP).every((p) => p.rows.length === IDP_PARTS.length), 'IDP: bobot 100% & satu baris per komponen');
// NIP tiap akun demo + Evaluee-nya (urutan halaman Pilih Evaluee); harus sama dengan PEOPLE[...].evaluees di app.js.
const TEAM = {
  heru: { nip: '19050193', subs: [] },
  oka: { nip: '1905416', subs: ['19050193', '752579', '754933', '748958', '749285', '749291'] },
  aryo: { nip: '777777', subs: ['1905416', '751806', '753120'] },
};
// Tipe jabatan KPI (kartu Data Diri di Beranda, localStorage 'pr-jabatan-<user>'): 'bh' Budget Holder / 'nbh' Non-Budget Holder.
// Bawaan sesuai tabel IG: Managerial Up (akun yang punya Evaluee) = Pemilik KPI/Budget Holder. Individual Goal Setting/app.js
// memakai aturan bawaan yang sama (halaman itu tidak memuat file ini).
const jabatanOf = (user) => {
  let v = null;
  try { v = localStorage.getItem(`pr-jabatan-${user}`); } catch {}
  return v === 'bh' || v === 'nbh' ? v : TEAM[user]?.subs.length ? 'bh' : 'nbh';
};
// Pemilik data yang tampil: mode review (Oka membuka milik Heru) = Heru, jadi Individual Contributory ikut tipe jabatan Evaluee.
const OWNER = REVIEW ? 'heru' : LOGIN;
// Budget Holder → Talent Development 7% & Community Involvement 5%; Non-Budget Holder → Development Commitment 5% & 7%.
const BUDGET = jabatanOf(OWNER) === 'bh';
// Rumus tooltip Figma 1841: (Realisasi Development × 50%) + (Rata-rata Realisasi Development Subordinate × 50%).
// Tanpa subordinate (mis. Heru sebagai Budget Holder) rata-ratanya dihitung 0, seperti periode kosong di performa().
function talentDev(mine, subs) {
  const avg = subs.length ? subs.reduce((s, d) => s + d, 0) / subs.length : 0;
  return { mine, avg, td: mine * 0.5 + avg * 0.5 };
}
console.assert(talentDev(20, [20, 62, 27, 70]).avg === 44.75 && talentDev(20, [20, 62, 27, 70]).td === 32.375, 'Figma 1840–1841: 44,75 & 32,38');
console.assert(talentDev(100, []).avg === 0 && talentDev(100, []).td === 50, 'tanpa subordinate: rata-rata 0');
const teamDev = (user) => talentDev(IDP[TEAM[user].nip].dev, TEAM[user].subs.map((nip) => IDP[nip].dev));

// Header evaluator sesuai Figma section "Review & Approve Realisasi Target"; langkah sebelum `current` = done, sesudahnya disabled.
// Langkah yang sudah punya halaman jadi tautan (semua halaman evaluator ada satu folder di bawah root).
// shortcut: Sintesis Evaluator Final dinyalakan dulu tanpa menunggu Behaviour Survey (permintaan user); matikan bila alur sudah lengkap.
function initReviewUI(title, current = 'Review & Approve Realisasi Target') {
  const q = (s) => document.querySelector(s);
  document.title = `${title} – People Review`;
  q('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • <span>Evaluator</span>';
  q('.flow-pill').firstChild.textContent = 'Alur Evaluator ';
  q('.topbar-right').insertAdjacentHTML('afterbegin', '<span class="flow-pill evaluee-pill">Heru Kautsar - 19050193</span>');
  const steps = [
    ['tabler:award-filled', 'Approve Individual Goal Setting', '../Individual%20Goal%20Setting/index.html'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', '../Nominate%20360/index.html'],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', '../Individual%20Goal/index.html'],
    ['ri:survey-fill', 'Behaviour Survey', '../Behavior%20Survey/index.html'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', '../Sintesis%20Evaluator/index.html'],
  ];
  const at = steps.findIndex(([, label]) => label === current);
  q('#stepper').innerHTML = steps.map(([ic, label, href], i) => {
    const body = `<i class="ico">${ICONS[ic]}</i>${label}`;
    if (i === at) return `<li class="current">${body}</li>`;
    return href ? `<li${i < at ? ' class="done"' : ''}><a href="${href}">${body}</a></li>` : `<li class="${i < at ? 'done' : 'disabled'}">${body}</li>`;
  }).join('');
}
