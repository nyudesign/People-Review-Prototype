// Dimuat sebelum app.js halaman Realisasi Target; butuh ICONS dari icons.js halaman itu.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
// Mode evaluator: Oka me-review Realisasi Target milik Heru secara read-only. Aktif hanya bila halaman dibuka
// dari jalur Evaluator di beranda (link data-review → sessionStorage 'pr-review'); jalur Evaluee membuka milik sendiri.
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
