// Dari desain Figma section "Sintesis Evaluator Final" (Redesign-Evaluator): Oka memberi feedback akhir untuk Heru.
// Rute: # = form (Desktop 1822–1824), selesai = layar terkirim (1825), #belum-rekap = edge case (574).
// shortcut: isi tabel & list masih contoh (Figma "xxx"); ganti dengan hasil Rekapitulasi Sintesis Evaluator saat halamannya ada.
const GOALS = [
  ['Cascading KPI', 'Remodelling Business Flow People Review', '100 %'],
  ['Cascading KPI', 'Finance Efficiency', '15.000 USD'],
  ['Project Control', 'Proyek Optimasi RDMP', '100 %'],
  ['Extramiles', 'Remodelling Business Flow People Review', '100 %'],
];
const STRENGTHS = ['Komunikasi efektif dengan tim lintas fungsi', 'Analisis data kinerja yang tajam'];
const GROWTH = ['Manajemen waktu dan prioritas proyek', 'Delegasi pekerjaan ke anggota tim'];
const BES = [['Behavior Survey 360', '4 Pekerja', '100%'], ['Behavior Survey Evaluator', '1 Pekerja', '100%']];
const RATINGS = [['Rating Development', '7'], ['Rating Rewards', '5.5x']];
const MAX = 200;

const $ = (s) => document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// shortcut: tanpa backend, feedback & status kirim disimpan di localStorage browser ini; ganti dengan API saat ada.
const STORE_KEY = 'pr-sintesis-heru';
const saved = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();

$('#goalRows').innerHTML = GOALS.map(([jenis, nama, real]) => `<tr><td>${esc(jenis)}</td><td>${esc(nama)}</td><td>${esc(real)}</td>
  <td><button type="button" class="btn-outline" data-file="${esc(nama)}"><i class="ico">${ICONS['mdi:eye']}</i>Lihat File</button></td></tr>`).join('');
const rows = (list) => list.map((cells) => `<tr>${[cells].flat().map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
$('#besRows').innerHTML = rows(BES);
$('#strengthRows').innerHTML = rows(STRENGTHS);
$('#growRows').innerHTML = rows(GROWTH);
$('#ratingRows').innerHTML = rows(RATINGS);
$('#goalRows').addEventListener('click', (e) => {
  const name = e.target.closest('[data-file]')?.dataset.file;
  if (name) window.open(URL.createObjectURL(new Blob([`Evidence: ${name} (contoh prototype)`], { type: 'text/plain' })), '_blank');
});

const fb = $('#feedback');
function onInput() {
  $('#fbCount').textContent = `${fb.value.length}/${MAX}`;
  $('#fbCount').classList.toggle('max', fb.value.length >= MAX);
  $('#submitBtn').disabled = !fb.value.trim();
}
fb.addEventListener('input', onInput);
$('#submitBtn').addEventListener('click', () => $('#submitDialog').showModal());
$('#submitDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  try { localStorage.setItem(STORE_KEY, JSON.stringify({ status: 'sent', feedback: fb.value.trim() })); } catch {}
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
onInput();
window.addEventListener('hashchange', route);
route();
