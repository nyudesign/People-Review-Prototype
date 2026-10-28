// Dimuat sebelum app.js halaman Realisasi Target (butuh ICONS dari icons.js halaman itu) dan Beranda (YEAR_END_TARGET & performa).
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
// Target Year End poin Individual Contributory (sistem lama): dipakai kartu Realisasi Target & label "/target Poin" HSSE / PCI.
const YEAR_END_TARGET = { hsse: 300, pci: 80 };
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
  const target = ps.reduce((x, p) => x + p.target, 0);
  return filled.length && target ? Math.min(PERF_MAX, Math.round((got.reduce((x, y) => x + y, 0) / target) * 100)) : 0;
}
console.assert(performa({ periods: [{ target: 50, value: 80 }, { target: 50, value: 20 }] }) === 70, 'kelebihan periode tidak menutup periode lain');
console.assert(performa({ periods: [{ target: 50, value: 60 }, { target: 100, value: 115 }] }) === 100, 'maks 100%');
console.assert(performa({ periods: [{ target: 50, value: 50 }, { target: 50, value: null }] }) === 50, 'periode kosong dihitung 0');
console.assert(performa({ periods: [{ target: 50, value: 40 }, { target: 100, value: 60 }] }) === 67, 'Σ realisasi ÷ Σ target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 20 }, { target: 10, value: null }] }) === 50, 'MIN: target ÷ realisasi periode terisi');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 50, value: 60 }, { target: 50, value: 40 }] }) === 92, 'MIN per periode (maks 100%), rata-rata tertimbang target');
console.assert(performa({ polarity: 'MIN', periods: [{ target: 10, value: 0 }] }) === 100 && performa({ polarity: 'MIN', periods: [{ target: 10, value: null }] }) === 0, 'MIN: realisasi 0 = 100%, kosong = 0');
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

// Header evaluator sesuai Figma section "Review & Approve Realisasi Target".
function initReviewUI(title) {
  const q = (s) => document.querySelector(s);
  document.title = `${title} – People Review`;
  q('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • <span>Evaluator</span>';
  q('.flow-pill').firstChild.textContent = 'Alur Evaluator ';
  q('.topbar-right').insertAdjacentHTML('afterbegin', '<span class="flow-pill evaluee-pill">Heru Kautsar - 19050193</span>');
  q('#stepper').innerHTML = [
    ['tabler:award-filled', 'Approve Individual Goal Setting', 'done'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', 'done'],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', 'current'],
    ['ri:survey-fill', 'Behaviour Survey', 'disabled'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', 'disabled'],
  ].map(([ic, label, st]) => `<li class="${st}"><i class="ico">${ICONS[ic]}</i>${label}</li>`).join('');
}
