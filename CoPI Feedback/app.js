// Dari desain Figma section "CoPI Feedback + Survey" (Redesign-Evaluee): Heru membaca Dialog Day dari Evaluator, lalu mengisi survei.
// Alur: Dialog Day (Desktop 1821, Diskusi 1828/1829) → Survei CoPI Feedback (1822/1823) → Survei People Review: tabel (1830)
// + soal centang (1826/1824, 1827/1832) → Konfirmasi CoPI Feedback (1835/1834/1833) → Submit (1836) → terkirim (1772).
// Setelah terkirim survei read-only (1837/1838). Rute: # = Dialog Day, #survei-copi, #survei-pr-1..3, #konfirmasi, #terkirim.
const SCALE = ['Tidak Setuju', 'Netral', 'Setuju']; // nilai 1–3
const COPI = [
  'Saya mempercayai penilaian atasan terhadap saya',
  'Saya memahami apa dampak rating saya terhadap diri saya/fungsi/lingkungan',
  'Saya dapat mengungkapkan perasaan, pemikiran, kekhawatiran dan harapan saya',
  'Saya percaya rencana pengembangan saya telah sesuai dengan apa yang diharapkan dari saya',
  'Saya memahami target kinerja yang dibebankan kepada saya',
];
const USAGE = [
  'Penggunaan Sistem People Review meningkatkan produktivitas dalam bekerja',
  'Penggunaan Sistem People Review meningkatkan engagement Pekerja terhadap Perusahaan',
  'Sistem People Review memiliki semua fungsi dan kemampuan yang saya harapkan dari Sistem Pengelolaan Kinerja Pekerja',
  'Secara keseluruhan, saya puas dengan Sistem People Review ini',
];
// Catatan Figma: dasar survei = form sistem lama, "untuk ALL USER saja" → opsi "as All User" (Evaluator memakai opsi "as Evaluator").
const SURVEY = ['Menurut saya, sistem People Review yang sudah baik adalah', 'Menurut saya, sistem People Review yang masih harus dikuatkan adalah'];
const OPTIONS = ['Perumusan Individual Goal (IG) berdasarkan cascading KPI', 'Penggunaan HSSE, Community, Development di Ind. Contributory',
  'Interface aplikasi People Review Online', 'Lain-Lain'];
const PAGES = ['', 'survei-copi', 'survei-pr-1', 'survei-pr-2', 'survei-pr-3', 'konfirmasi'];

const $ = (s) => document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name) => `<i class="ico">${ICONS[name]}</i>`;
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };

// shortcut: tanpa backend, survei & status kirim disimpan di localStorage browser ini; ganti dengan API saat ada.
const STORE_KEY = `pr-copi-${LOGIN}`;
const blank = () => ({ status: 'draft', copi: COPI.map(() => null), usage: USAGE.map(() => null), survey: SURVEY.map(() => ({ picks: [], note: '' })) });
const state = { ...blank(), ...read(STORE_KEY) };
if (state.copi?.length !== COPI.length || state.usage?.length !== USAGE.length || state.survey?.length !== SURVEY.length) Object.assign(state, blank());
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} };
const sent = () => state.status === 'sent';

// Tahapan sebelumnya dicentang sesuai datanya (seperti Self Review): Realisasi Target disetujui, Self Review terkirim.
const selfReview = read(`pr-selfreview-${LOGIN}`);
[['#stepRealisasi', read(`pr-realisasi-${LOGIN}`)?.status === 'approved'], ['#stepSelf', !!(selfReview?.submitted && selfReview.notes)]].forEach(([sel, done]) => {
  $(sel).classList.toggle('done', done);
  $(`${sel} .check`).hidden = !done;
});

// Dialog Day dari Evaluator: ditulis halaman Sintesis Evaluator Final saat Submit (pr-sintesis-<evaluee>).
// shortcut: sebelum Evaluator submit, tampil contoh isian; ganti dengan data API saat ada.
const DAY_DEMO = {
  feedback: 'Komunikasi dengan tim lintas fungsi sudah efektif dan analisis data kinerja tajam. Tingkatkan manajemen waktu dan prioritas proyek, serta mulai mendelegasikan pekerjaan ke anggota tim.',
  plan: { assignment: ['Pembuatan SK Mutasi'], learning: ['POLS (12 kali dalam setahun)'], period: 'Semester',
    coaching: [['Ketentuan/filosofi pengembangan karir'], ['Ketentuan/filosofi pengembangan karir']] },
};
const sintesis = read(`pr-sintesis-${LOGIN}`);
const day = sintesis?.status === 'sent' ? sintesis : DAY_DEMO;
renderHasilKinerja();
initDiskusi($('#discussBtn'), LOGIN);
$('#feedback').value = day.feedback;
const items = (list, label) => list.map((v, i) => `<div class="sx-item"><textarea rows="1" readonly aria-label="${label} ${i + 1}">${esc(v)}</textarea></div>`).join('');
$('#planAssignment').innerHTML = items(day.plan.assignment, 'Assignment');
$('#planLearning').innerHTML = items(day.plan.learning, 'Learning');
$('#coachPeriod').textContent = day.plan.period;
$('#planCoaching').innerHTML = day.plan.coaching.map((g, i) => `<h3>Coaching ${esc(day.plan.period)} ${i + 1}</h3>${items(g, 'Coaching')}`).join('');

let page = 0;
const answered = (a) => a.picks.length > 0 && !!a.note.trim();
// Halaman pertama yang masih ada isian kosong ('' = lengkap); Konfirmasi baru bisa dibuka bila lengkap.
const firstGap = (s = state) => (s.copi.includes(null) ? 'survei-copi' : s.usage.includes(null) ? 'survei-pr-1'
  : !answered(s.survey[0]) ? 'survei-pr-2' : !answered(s.survey[1]) ? 'survei-pr-3' : '');
console.assert(firstGap(blank()) === 'survei-copi' && firstGap({ ...blank(), copi: [3, 3, 3, 2, 1], usage: [3, 1, 3, 2] }) === 'survei-pr-2', 'urutan isian yang kurang');

// Figma 1822/1830: satu baris per pernyataan, pilihan 1–3.
function renderLikert() {
  const copi = page === 1, values = copi ? state.copi : state.usage;
  $('#lkTitle').textContent = copi ? 'Berikan Penilaian Anda saat Dialog Day' : 'Berikan Penilaian Anda saat Penggunaan People Review';
  $('#lkHead').textContent = copi ? 'Pengalaman Dialog Day' : 'Penggunaan People Review';
  $('#lkRows').innerHTML = (copi ? COPI : USAGE).map((text, r) => `<tr><th scope="row" id="lk${r}">${esc(text)}</th>${SCALE.map((label, v) => `<td><label>
    <input type="radio" name="r${r}" value="${v + 1}"${values[r] === v + 1 ? ' checked' : ''}${sent() ? ' disabled' : ''} aria-label="${v + 1} ${label}" aria-describedby="lk${r}">
    <span>${v + 1}</span></label></td>`).join('')}</tr>`).join('');
}
$('#lkRows').addEventListener('change', (e) => {
  (page === 1 ? state.copi : state.usage)[+e.target.name.slice(1)] = +e.target.value;
  save(); renderNav(); renderFoot();
});

// Figma 1826/1824, 1827/1832: soal centang + penjelasan (sama dengan survei di Sintesis Evaluator Final).
const q = () => state.survey[page - 3];
function renderCheck() {
  $('#qText').textContent = SURVEY[page - 3];
  $('#qOpts').innerHTML = OPTIONS.map((o, i) => `<label class="sx-opt"><input type="checkbox" value="${i}"${q().picks.includes(i) ? ' checked' : ''}${sent() ? ' disabled' : ''}><span>${esc(o)}</span></label>`).join('');
  $('#qNote').value = q().note;
  $('#qNote').readOnly = sent() || !q().picks.length; // Figma 1826: kotak penjelasan aktif setelah ada opsi dicentang
}
$('#qOpts').addEventListener('change', () => {
  q().picks = [...$('#qOpts').querySelectorAll('input:checked')].map((c) => +c.value);
  $('#qNote').readOnly = !q().picks.length;
  save(); renderNav(); renderFoot();
});
$('#qNote').addEventListener('input', (e) => { q().note = e.target.value; save(); renderNav(); renderFoot(); });

// Panel survei: satu nomor = satu halaman, yaitu satu paket tabel Likert (maks 5 pernyataan) atau satu soal centang.
// shortcut: tiap survei baru punya satu paket Likert; bila pernyataan > 5, pecah tabelnya jadi beberapa halaman & nomor.
console.assert(COPI.length <= 5 && USAGE.length <= 5, 'satu paket Likert maksimal 5 pernyataan');
function renderNav() {
  const copi = page === 1;
  const list = copi ? [[1, !state.copi.includes(null)]] // [halaman, sudah terisi]
    : [[2, !state.usage.includes(null)], [3, answered(state.survey[0])], [4, answered(state.survey[1])]];
  const done = list.filter(([, d]) => d).length;
  $('#navTitle').textContent = copi ? 'Survei CoPI Feedback' : 'Survei People Review';
  $('#navPos').textContent = done;
  $('#navTotal').textContent = list.length;
  $('#navBar').style.width = `${(done / list.length) * 100}%`;
  $('#navGrid').innerHTML = list.map(([p, d], i) => `<button type="button" data-page="${p}" class="${d ? 'answered' : ''}"${p === page ? ' aria-current="step"' : ''}
    aria-label="Survei ${i + 1}${d ? ', sudah diisi' : ''}">${i + 1}${d ? icon('material-symbols:check-rounded') : ''}</button>`).join('');
}
$('#navGrid').addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) location.hash = PAGES[+b.dataset.page]; });

// Konfirmasi: tab Dialog Day (1835) / Survei CoPI Feedback (1834) / Survei People Review (1833).
const TABS = { tabDay: '#formView', tabCopi: '#sumCopi', tabUsage: '#sumUsage' };
const answersHTML = (list, values) => list.map((t, i) => `<li><span class="cp-num">${i + 1}</span><div><p>${esc(t)}</p>
  <p class="cp-pick"><b>${values[i]}</b><span>${SCALE[values[i] - 1]}</span></p></div></li>`).join('');
function setTab(id) {
  Object.entries(TABS).forEach(([t, sel]) => { $(`#${t}`).setAttribute('aria-selected', t === id); $(sel).hidden = t !== id; });
  if (id === 'tabCopi') $('#copiAnswers').innerHTML = answersHTML(COPI, state.copi);
  if (id === 'tabUsage') {
    $('#usageAnswers').innerHTML = answersHTML(USAGE, state.usage);
    $('#usageChecks').innerHTML = SURVEY.map((s, i) => `<h2>${esc(s)}</h2>
      ${state.survey[i].picks.map((p) => `<label class="sx-opt"><input type="checkbox" checked disabled><span>${esc(OPTIONS[p])}</span></label>`).join('')}
      <h3>Jelaskan pilihan Anda</h3><div class="sx-note">${esc(state.survey[i].note)}</div>`).join('');
  }
}
$('#tabs').addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (t) setTab(t.id); });

// Tombol bawah per halaman; data-go = pindah rute.
function renderFoot() {
  const back = icon('tabler:arrow-left'), next = `Selanjutnya ${icon('tabler:arrow-right')}`;
  const go = (to, html, cls = 'btn', attrs = '') => `<button type="button" class="${cls}" data-go="#${to}"${attrs}>${html}</button>`;
  // Figma: dari survei pertama "Kembali ke Dialog Day" (1822), dari Konfirmasi "Kembali ke Survei People Review" (1835).
  const backLabel = page === 1 ? 'Kembali ke Dialog Day' : page === 5 ? 'Kembali ke Survei People Review' : 'Sebelumnya';
  const left = page ? go(PAGES[page - 1], `${back}${backLabel}`, 'btn-outline') : '';
  const right = page < 5 ? go(PAGES[page + 1], next, 'btn', page === 4 && !sent() && firstGap() ? ' disabled title="Isi semua survei terlebih dahulu"' : '')
    : `<button type="button" class="btn" id="submitBtn"${sent() ? ' disabled' : ''}>${icon('material-symbols:send-rounded')}Submit</button>`;
  $('#foot').innerHTML = `${left}<span class="sx-acts">${right}</span>`;
}
$('#foot').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.go) location.hash = b.dataset.go;
  else if (b.id === 'submitBtn') $('#submitDialog').showModal();
});
$('#submitDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#submitDialog form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  state.status = 'sent';
  save();
  location.hash = 'terkirim';
});

function route() {
  const h = location.hash.slice(1), done = h === 'terkirim' && sent();
  page = PAGES.indexOf(h);
  if (!done && page < 0) return location.replace('#');
  // Konfirmasi baru bisa dibuka setelah semua survei terisi (sebelum terkirim).
  if (h === 'konfirmasi' && !sent() && firstGap()) return location.replace(`#${firstGap()}`);
  const survey = page >= 1 && page <= 4;
  $('#dayView').hidden = done || survey;
  $('#surveyView').hidden = done || !survey;
  $('#doneView').hidden = !done;
  $('#foot').hidden = done;
  $('#copiStep .check').hidden = !sent(); // seperti Self Review: tahap ini dicentang setelah terkirim
  if (!done && !survey) {
    $('#dayTitle').textContent = page ? 'Konfirmasi CoPI Feedback' : 'Dialog Day';
    $('#discussBtn').hidden = !!page;
    $('#tabs').hidden = !page;
    setTab('tabDay');
  }
  if (survey) {
    $('#likertCard').hidden = page > 2;
    $('#checkCard').hidden = page <= 2;
    if (page <= 2) renderLikert(); else renderCheck();
    renderNav();
  }
  if (!done) renderFoot();
  scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
