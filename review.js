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
    ['tabler:award-filled', 'Approve Individual Goal Setting'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', '../Nominate%20360/index.html'],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', '../Individual%20Goal/index.html'],
    ['ri:survey-fill', 'Behaviour Survey'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', '../Sintesis%20Evaluator/index.html'],
  ];
  const at = steps.findIndex(([, label]) => label === current);
  q('#stepper').innerHTML = steps.map(([ic, label, href], i) => {
    const body = `<i class="ico">${ICONS[ic]}</i>${label}`;
    if (i === at) return `<li class="current">${body}</li>`;
    return href ? `<li${i < at ? ' class="done"' : ''}><a href="${href}">${body}</a></li>` : `<li class="${i < at ? 'done' : 'disabled'}">${body}</li>`;
  }).join('');
}
