// Dari desain Figma section "Sintesis Evaluator Final" (Redesign-Evaluator): Oka memberi feedback akhir untuk Heru.
// Rute: # = form (Desktop 1853–1860), selesai = layar terkirim (1825), #belum-rekap = edge case (574).
// shortcut: isi tabel & list masih contoh (Figma "xxx"); ganti dengan hasil Rekapitulasi Sintesis Evaluator saat halamannya ada.
// Figma 1823: Individual Goal = Jenis, Weighted Performance, Evidence — satu baris per Jenis, sampai Development Commitment.
// Nilai = Σ weighted performance item per Jenis, ditulis halaman Realisasi Target (saveSummary di ../Individual Goal/app.js).
// Cadangan bila halaman itu belum pernah dibuka: data demo Realisasi Target (semua item performa 110%).
const GOAL_DEMO = { 'Cascading KPI': 77, 'Project Control': 11, Extramiles: 0, 'HSSE Objective': 8.8, 'Community Involvement': 7.7, 'Development Commitment': 5.5 };
const goalSummary = (() => { try { return JSON.parse(localStorage.getItem('pr-realisasi-summary-heru')); } catch { return null; } })() || GOAL_DEMO;
const GOALS = Object.keys(GOAL_DEMO).map((jenis) => [jenis, goalSummary[jenis] || 0]);
const pct = (n) => `${(+n.toFixed(2)).toLocaleString('id-ID')}%`;
const STRENGTHS = ['Komunikasi efektif dengan tim lintas fungsi', 'Analisis data kinerja yang tajam'];
const GROWTH = ['Manajemen waktu dan prioritas proyek', 'Delegasi pekerjaan ke anggota tim'];
const BES = [['Behaviour Survey 360°', '4 Pekerja', '90%', '50%', '45%'], ['Behaviour Survey Evaluator', '1 Pekerja', '100%', '50%', '50%']];
const RATINGS = [['Rating Development', '7'], ['Rating Rewards', '5.5x']];

const $ = (s) => document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// shortcut: tanpa backend, feedback & status kirim disimpan di localStorage browser ini; ganti dengan API saat ada.
const STORE_KEY = 'pr-sintesis-heru';
const saved = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();

$('#goalRows').innerHTML = GOALS.map(([jenis, wp]) => `<tr><td>${esc(jenis)}</td><td>${pct(wp)}</td>
  <td><button type="button" class="btn-outline" data-file="${esc(jenis)}"><i class="ico">${ICONS['mdi:eye']}</i>Lihat File</button></td></tr>`).join('');
$('#goalTotal').textContent = (+GOALS.reduce((t, [, wp]) => t + wp, 0).toFixed(2)).toLocaleString('id-ID');
const rows = (list) => list.map((cells) => `<tr>${[cells].flat().map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
$('#besRows').innerHTML = rows(BES);
$('#strengthRows').innerHTML = rows(STRENGTHS);
$('#growRows').innerHTML = rows(GROWTH);
$('#ratingRows').innerHTML = rows(RATINGS);
$('#goalRows').addEventListener('click', (e) => {
  const name = e.target.closest('[data-file]')?.dataset.file;
  if (name) window.open(URL.createObjectURL(new Blob([`Evidence: ${name} (contoh prototype)`], { type: 'text/plain' })), '_blank');
});

// Figma 1853–1859: Rencana Pengembangan. Coaching dibagi per periode (Semester 2, Triwulan 4, Bulan 12 kelompok).
const COUNT = { Semester: 2, Triwulan: 4, Bulan: 12 };
const plan = { assignment: [], learning: [], period: 'Semester', coaching: [[], []] };
const listOf = (key) => (/^c\d+$/.test(key) ? plan.coaching[+key.slice(1)] : plan[key]);
// Figma 1853 terbaru: tanpa nomor urut; nomor tetap ada di aria-label untuk pembaca layar.
const listHTML = (key, label) => listOf(key).map((v, i) => `<div class="sx-item">
  <textarea rows="1" data-key="${key}" data-i="${i}" placeholder="Isi nama" aria-label="${label} ${i + 1}">${esc(v)}</textarea>
  <div class="sx-more"><button type="button" class="icon-btn" data-more aria-label="Opsi ${label} ${i + 1}"><i class="ico">${ICONS['ri:more-fill']}</i></button>
  <div class="sx-menu" hidden><button type="button" class="btn-outline danger" data-del="${key}" data-i="${i}"><i class="ico">${ICONS['mdi:trash']}</i>Hapus</button></div></div></div>`).join('')
  + `<button type="button" class="sx-add" data-add="${key}"><i class="ico">${ICONS['akar-icons:plus']}</i>Tambah ${label}</button>`;
function renderPlan(focusKey) {
  $('#planAssignment').innerHTML = listHTML('assignment', 'Assignment');
  $('#planLearning').innerHTML = listHTML('learning', 'Learning');
  $('#planCoaching').innerHTML = plan.coaching.map((_, g) => `<h3>Coaching ${plan.period} ${g + 1}</h3>${listHTML(`c${g}`, 'Coaching')}`).join('');
  if (focusKey) [...document.querySelectorAll(`textarea[data-key="${focusKey}"]`)].pop()?.focus();
  onInput();
}

const fb = $('#feedback');
const filled = (arr) => arr.length > 0 && arr.every((v) => v.trim());
// Figma 1854/1857: Submit aktif bila feedback & tiap kolom punya minimal 1 item, tanpa item kosong.
function onInput() {
  $('#submitBtn').disabled = !fb.value.trim() || !filled(plan.assignment) || !filled(plan.learning) || !filled(plan.coaching.flat());
}
fb.addEventListener('input', onInput);
const closeMenus = (except) => document.querySelectorAll('.sx-menu').forEach((m) => { if (m !== except) m.hidden = true; });
let pendingDel = null;
$('#plan').addEventListener('input', (e) => {
  const t = e.target.closest('textarea[data-key]');
  if (t) { listOf(t.dataset.key)[+t.dataset.i] = t.value; onInput(); }
});
$('#plan').addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]');
  if (add) { listOf(add.dataset.add).push(''); renderPlan(add.dataset.add); return; }
  const more = e.target.closest('[data-more]');
  if (more) { const m = more.nextElementSibling; closeMenus(m); m.hidden = !m.hidden; return; }
  const del = e.target.closest('[data-del]');
  if (del) { closeMenus(); pendingDel = [del.dataset.del, +del.dataset.i]; $('#delDialog').showModal(); }
});
document.addEventListener('click', (e) => { if (!e.target.closest('.sx-more')) closeMenus(); });
$('#delDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value === 'yes' && pendingDel) { listOf(pendingDel[0]).splice(pendingDel[1], 1); renderPlan(); }
  pendingDel = null;
});
$('#coachPeriod').addEventListener('change', (e) => {
  // shortcut: ganti periode mengosongkan isi coaching; simpan per periode bila pengguna perlu bolak-balik.
  plan.period = e.target.value;
  plan.coaching = Array.from({ length: COUNT[plan.period] }, () => []);
  renderPlan();
});
$('#submitBtn').addEventListener('click', () => $('#submitDialog').showModal());
$('#submitDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ status: 'sent', feedback: fb.value.trim(), plan })); } catch {}
  show('done');
  // Figma: layar terkirim (1825) → kembali ke Pilih Evaluee (1826).
  setTimeout(() => { location.href = '../index.html#pwtt-evaluator'; }, 3000);
});

function show(view) {
  $('#formView').hidden = $('#formFooter').hidden = view !== 'form';
  $('#doneView').hidden = view !== 'done';
  $('#emptyView').hidden = view !== 'empty';
}
// shortcut: halaman Rekapitulasi Sintesis Evaluator belum ada, jadi rekap dianggap sudah dilakukan; edge case dibuka lewat #belum-rekap.
function route() {
  show(location.hash === '#belum-rekap' ? 'empty' : saved?.status === 'sent' ? 'done' : 'form');
}

initReviewUI('Sintesis Evaluator Final', 'Sintesis Evaluator Final');
renderPlan();
window.addEventListener('hashchange', route);
route();
