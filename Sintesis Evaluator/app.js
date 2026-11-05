// Dari desain Figma section "Sintesis Evaluator Final" (Redesign-Evaluator): Oka memberi feedback akhir untuk Heru.
// Alur: Dialog Day (Desktop 1854/1857/1853) → Survei People Review (1867/1866) → Konfirmasi (1868/1869) → Submit (1870) → terkirim (1871).
// Setelah terkirim semuanya read-only: Dialog Day (1862), survei (1874/1875), Konfirmasi + Edit (1872/1873).
// Rute: # = Dialog Day, #survei-N, #konfirmasi, #terkirim, #belum-rekap = edge case (574).
// Hasil Kinerja & Diskusi Dialog Day dari ../dialog-day.js (sama dengan CoPI Feedback milik Evaluee).
// Catatan Figma: dasar survei = form sistem lama "Anda dapat memilih lebih dari satu pada A. dan B.", "untuk EVALUATOR saja"
// → opsi "as Evaluator" (Evaluee di CoPI Feedback memakai opsi "as All User"). Satu soal = centang opsi + penjelasan.
const SURVEY = ['Menurut saya, sistem People Review yang sudah baik adalah', 'Menurut saya, sistem People Review yang masih harus dikuatkan adalah'];
const OPTIONS = [
  'Penggunaan Akhlak Behaviour Survey untuk menilai perilaku',
  'Pembagian Kelompok Penilaian untuk sintesis dan kalibrasi',
  'Alokasi dan besaran (%) target distribusi di tiap rating kinerja',
  'Basis target distribusi mengacu KPI yang dimulai dari Manager',
];

const $ = (s) => document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name) => `<i class="ico">${ICONS[name]}</i>`;

// shortcut: tanpa backend, isian, survei & status kirim disimpan di localStorage browser ini; ganti dengan API saat ada.
const STORE_KEY = 'pr-sintesis-heru';
const blank = () => ({ status: 'draft', feedback: '', plan: { assignment: [], learning: [], period: 'Semester', coaching: [[], []] },
  survey: SURVEY.map(() => ({ picks: [], note: '' })) });
const state = { ...blank(), ...(() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })() };
if (state.survey?.length !== SURVEY.length) state.survey = blank().survey; // simpanan versi lama belum punya survei
state.survey.forEach((a) => { a.picks = a.picks.filter((p) => p < OPTIONS.length); }); // simpanan dari daftar opsi lama (8 opsi)
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} };
const sent = () => state.status === 'sent';

renderHasilKinerja();
initDiskusi($('#discussBtn'), 'heru'); // 1862: utas yang sama dengan CoPI Feedback milik Heru

// Figma 1853–1859: Rencana Pengembangan. Coaching dibagi per periode (Semester 2, Triwulan 4, Bulan 12 kelompok).
const COUNT = { Semester: 2, Triwulan: 4, Bulan: 12 };
const plan = state.plan;
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
  onChange();
}

const fb = $('#feedback');
fb.value = state.feedback;
const filled = (arr) => arr.length > 0 && arr.every((v) => v.trim());
console.assert(!filled([]) && !filled(['a', ' ']) && filled(['a']), 'minimal 1 item, tanpa item kosong');
// Catatan Figma: Selanjutnya menyala setelah Feedback terisi, minimal 1 item Assignment & Learning, dan semua Coaching terisi
// (tiap kelompok periode minimal 1 item); item kosong menahan tombol (1857).
const formValid = () => !!state.feedback.trim() && filled(plan.assignment) && filled(plan.learning) && plan.coaching.every(filled);
function onChange() {
  state.feedback = fb.value;
  save();
  if ($('#dayNext') && !sent()) $('#dayNext').disabled = !formValid();
}
fb.addEventListener('input', onChange);
const closeMenus = (except) => document.querySelectorAll('.sx-menu').forEach((m) => { if (m !== except) m.hidden = true; });
let pendingDel = null;
$('#plan').addEventListener('input', (e) => {
  const t = e.target.closest('textarea[data-key]');
  if (t) { listOf(t.dataset.key)[+t.dataset.i] = t.value; onChange(); }
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
const period = $('#coachPeriod');
period.value = plan.period;
period.dispatchEvent(new Event('change', { bubbles: true })); // tombol dropdown kustom ikut menampilkan periode tersimpan
period.addEventListener('change', (e) => {
  // shortcut: ganti periode mengosongkan isi coaching; simpan per periode bila pengguna perlu bolak-balik.
  plan.period = e.target.value;
  plan.coaching = Array.from({ length: COUNT[plan.period] }, () => []);
  renderPlan();
});

// Survei People Review (Evaluator). Terisi = minimal 1 opsi dicentang + penjelasan.
let current = 0;
const answered = (a) => a.picks.length > 0 && !!a.note.trim();
console.assert(!answered({ picks: [], note: 'x' }) && !answered({ picks: [0], note: ' ' }) && answered({ picks: [0], note: 'x' }), 'survei terisi = centang + penjelasan');
const allAnswered = () => state.survey.every(answered);
function renderNav() {
  const done = state.survey.filter(answered).length;
  // Figma: judul panel "(Evaluator)" sebelum terkirim (1867), tanpa itu sesudahnya (1874).
  $('#navTitle').textContent = sent() ? 'Survei People Review' : 'Survei People Review (Evaluator)';
  $('#navPos').textContent = done;
  $('#navTotal').textContent = SURVEY.length;
  $('#navBar').style.width = `${(done / SURVEY.length) * 100}%`;
  $('#navGrid').innerHTML = state.survey.map((a, i) => `<button type="button" data-go="#survei-${i + 1}" class="${answered(a) ? 'answered' : ''}"${i === current ? ' aria-current="step"' : ''}
    aria-label="Survei ${i + 1}${answered(a) ? ', sudah diisi' : ''}">${i + 1}${answered(a) ? icon('material-symbols:check-rounded') : ''}</button>`).join('');
}
function renderSurvey() {
  const a = state.survey[current];
  $('#qText').textContent = SURVEY[current];
  $('#qOpts').innerHTML = OPTIONS.map((o, i) => `<label class="sx-opt"><input type="checkbox" value="${i}"${a.picks.includes(i) ? ' checked' : ''}${sent() ? ' disabled' : ''}><span>${esc(o)}</span></label>`).join('');
  $('#qNote').value = a.note;
  $('#qNote').readOnly = sent() || !a.picks.length; // Figma 1867: kotak penjelasan aktif setelah ada opsi dicentang
  renderNav();
}
$('#qOpts').addEventListener('change', () => {
  const a = state.survey[current];
  a.picks = [...$('#qOpts').querySelectorAll('input:checked')].map((c) => +c.value);
  $('#qNote').readOnly = !a.picks.length;
  save(); renderNav(); renderFoot();
});
$('#qNote').addEventListener('input', (e) => { state.survey[current].note = e.target.value; save(); renderNav(); renderFoot(); });
$('#navGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) location.hash = b.dataset.go; });

// Konfirmasi: tab Dialog Day (1868) / Survei (1869, hanya opsi yang dicentang).
function setTab(tab) {
  $('#tabDay').setAttribute('aria-selected', tab === 'day');
  $('#tabSurvey').setAttribute('aria-selected', tab === 'survey');
  $('#formView').hidden = tab !== 'day';
  $('#summary').hidden = tab !== 'survey';
  if (tab === 'survey') {
    $('#summary').innerHTML = SURVEY.map((q, i) => `<h2>${esc(q)}</h2>
      ${state.survey[i].picks.map((p) => `<label class="sx-opt"><input type="checkbox" checked disabled><span>${esc(OPTIONS[p])}</span></label>`).join('')}
      <h3>Jelaskan pilihan Anda</h3><div class="sx-note">${esc(state.survey[i].note)}</div>`).join('');
  }
}
$('#tabs').addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) setTab(t.id === 'tabSurvey' ? 'survey' : 'day'); });

// Tombol bawah per tampilan; data-go = pindah rute.
let view = 'day';
const go = (href, html, cls = 'btn', attrs = '') => `<button type="button" class="${cls}" data-go="${href}"${attrs}>${html}</button>`;
function renderFoot() {
  const n = SURVEY.length, back = icon('tabler:arrow-left'), next = `Selanjutnya ${icon('tabler:arrow-right')}`;
  let left = '', right;
  if (view === 'day') right = go('#survei-1', next, 'btn', ` id="dayNext"${!sent() && !formValid() ? ' disabled' : ''}`);
  else if (view === 'survey') {
    // Figma: soal pertama kembali ke Dialog Day ("Sebelumnya" di 1867, "Kembali ke Dialog Day" setelah terkirim di 1875).
    left = current ? go(`#survei-${current}`, `${back}Sebelumnya`, 'btn-outline') : go('#', `${back}${sent() ? 'Kembali ke Dialog Day' : 'Sebelumnya'}`, 'btn-outline');
    const last = current === n - 1;
    right = go(last ? '#konfirmasi' : `#survei-${current + 2}`, next, 'btn', last && !sent() && !allAnswered() ? ' disabled title="Isi semua survei terlebih dahulu"' : '');
  } else {
    left = go(`#survei-${n}`, `${back}Kembali ke Survei People Review`, 'btn-outline');
    const submit = (attrs) => `<button type="button" class="btn"${attrs}>${icon('material-symbols:send-rounded')}Submit</button>`;
    right = sent() ? `<button type="button" class="btn-outline" id="editBtn">${icon('mdi:pencil')}Edit</button>${submit(' disabled')}` : submit(' id="submitBtn"');
  }
  $('#foot').innerHTML = `${left}<span class="sx-acts">${right}</span>`;
}
$('#foot').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.go) location.hash = b.dataset.go;
  else if (b.id === 'submitBtn') $('#submitDialog').showModal();
  else if (b.id === 'editBtn') { state.status = 'draft'; save(); location.hash = ''; } // 1872: Edit membuka lagi Dialog Day yang bisa diubah
});
$('#submitDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  state.status = 'sent';
  save();
  location.hash = 'terkirim';
});

// shortcut: halaman Rekapitulasi Sintesis Evaluator belum ada, jadi rekap dianggap sudah dilakukan; edge case dibuka lewat #belum-rekap.
function route() {
  const h = location.hash.slice(1), q = +(/^survei-(\d+)$/.exec(h)?.[1] || 0);
  if (h === 'belum-rekap') view = 'empty';
  else if (h === 'terkirim' && sent()) view = 'done';
  else if (h === 'konfirmasi' || (q >= 1 && q <= SURVEY.length)) {
    // Sebelum terkirim: survei butuh Dialog Day lengkap, Konfirmasi butuh semua survei terisi.
    if (!sent() && !formValid()) return location.replace('#');
    const gap = state.survey.findIndex((a) => !answered(a));
    if (!q && !sent() && gap >= 0) return location.replace(`#survei-${gap + 1}`);
    view = q ? 'survey' : 'konfirmasi';
    if (q) current = q - 1;
  } else if (h) return location.replace('#');
  else view = 'day';

  const ro = sent() || view === 'konfirmasi';
  $('#formView').classList.toggle('ro', ro);
  $('#formView').querySelectorAll('textarea').forEach((t) => { t.readOnly = ro; });
  period.disabled = ro;
  $('#dayTitle').textContent = view === 'konfirmasi' ? 'Konfirmasi Sintesis Evaluator Final' : 'Dialog Day';
  $('#discussBtn').hidden = !(sent() && view === 'day');
  $('#sentChip').hidden = !sent();
  $('#tabs').hidden = view !== 'konfirmasi';
  setTab('day');
  if (view === 'survey') renderSurvey();
  $('#dayView').hidden = view !== 'day' && view !== 'konfirmasi';
  $('#surveyView').hidden = view !== 'survey';
  $('#doneView').hidden = view !== 'done';
  $('#emptyView').hidden = view !== 'empty';
  $('#foot').hidden = view === 'done' || view === 'empty';
  if (!$('#foot').hidden) renderFoot();
  scrollTo(0, 0);
}

initReviewUI('Sintesis Evaluator Final', 'Sintesis Evaluator Final');
$('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • End Year People Review • <span>Evaluator</span>'; // Figma 1853 dst.
renderPlan();
window.addEventListener('hashchange', route);
route();
