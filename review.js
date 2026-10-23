// Dimuat sebelum app.js halaman Realisasi Target; butuh ICONS dari icons.js halaman itu.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
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
  q('.flow-pill').firstChild.textContent = 'Evaluator - Tahapan Utama People Review ';
  q('.topbar-right').insertAdjacentHTML('afterbegin', '<span class="flow-pill evaluee-pill">Heru Kautsar - 19050193</span>');
  q('#stepper').innerHTML = [
    ['tabler:award-filled', 'Approve Individual Goal Setting', 'done'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', 'done'],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', 'current'],
    ['ri:survey-fill', 'Behaviour Survey', 'disabled'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', 'disabled'],
  ].map(([ic, label, st]) => `<li class="${st}"><i class="ico">${ICONS[ic]}</i>${label}</li>`).join('');
}
