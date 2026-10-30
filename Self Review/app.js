// Tampilan dari desain Figma section "Self Review" (Behavior Survey).
// Soal (QUESTIONS, LETTERS) dari ../behavior-survey.js, sama dengan Penilaian 360.

/* ---------- Penyimpanan di localStorage (per user login) ---------- */
// shortcut: tanpa backend, isian & catatan disimpan di localStorage browser ini; ganti dengan API saat ada.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
const STORE_KEY = `pr-selfreview-${LOGIN}`;
const stored = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();
const validStore = Array.isArray(stored?.answers) && stored.answers.length === QUESTIONS.length;

const answers = validStore ? stored.answers : QUESTIONS.map(() => null); // index pilihan per soal
let current = 0;
// Submit dari alur lama (Upload Evidence, tanpa notes) tidak dihitung: Catatan Penilai harus bisa diisi lalu submit ulang.
let submitted = validStore && !!stored.submitted && !!stored.notes;  // penilaian sudah dikirim ke Evaluator
// Catatan Penilai (Figma Desktop 1726/1727): dua isian opsional.
const notes = { keep: '', change: '', ...(validStore && stored.notes) };

// true bila tersimpan; false bila localStorage penuh/diblokir.
function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ answers, submitted, notes }));
    return true;
  } catch { return false; }
}
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
document.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });

// Tahapan Realisasi Target dicentang hanya bila sudah disetujui Evaluator.
// Status ditulis halaman Individual Goal ke localStorage `pr-realisasi-<user login>` (waiting / approved / revision).
const realisasiApproved = (() => {
  try { return JSON.parse(localStorage.getItem(`pr-realisasi-${LOGIN}`))?.status === 'approved'; } catch { return false; }
})();
const realisasiStep = $('#stepper a[href*="Individual"]').parentElement;
realisasiStep.classList.toggle('done', realisasiApproved);
realisasiStep.querySelector('.check').hidden = !realisasiApproved;

const answeredCount = () => answers.filter((a) => a !== null).length;
const allAnswered = () => answeredCount() === QUESTIONS.length;
const isLast = () => current === QUESTIONS.length - 1;
console.assert(QUESTIONS.length === 20 && QUESTIONS.every((q) => q.options.length === 4), '20 soal, masing-masing 4 pilihan');

/* ---------- Dialog (jawaban dibaca dari submit; event close tidak selalu terpicu ulang di Chrome) ---------- */
let answerResolve = null;
const answerDialog = (v) => { answerResolve?.(v); answerResolve = null; };
function ask(dialog) {
  answerDialog(null);
  dialog.showModal();
  return new Promise((resolve) => { answerResolve = resolve; });
}
document.querySelectorAll('dialog').forEach((d) => {
  d.querySelector('form').addEventListener('submit', (e) => answerDialog(e.submitter?.value));
  d.addEventListener('cancel', () => answerDialog(null));
});
function confirmBox(title, text) {
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  return ask($('#confirmDialog')).then((v) => v === 'yes');
}

/* ---------- Soal ---------- */
function renderSoal() {
  const q = QUESTIONS[current];
  $('#qText').textContent = q.text;
  $('#qPrinciple').textContent = q.principle;
  $('#qDef').textContent = PRINCIPLES[q.principle];
  $('#qOptions').innerHTML = q.options.map((o, i) => `
    <button type="button" class="option" role="radio" aria-checked="${answers[current] === i}" data-opt="${i}" ${submitted ? 'disabled' : ''}>
      <b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`).join('');

  $('#navPos').textContent = answeredCount(); // jumlah soal yang sudah dijawab, bukan nomor halaman
  $('#navTotal').textContent = QUESTIONS.length;
  $('#navBar').style.width = `${(answeredCount() / QUESTIONS.length) * 100}%`;
  $('#navGrid').innerHTML = QUESTIONS.map((_, i) => `
    <button type="button" data-go="${i}" class="${answers[i] !== null ? 'answered' : ''}"${i === current ? ' aria-current="step"' : ''}
      aria-label="Soal ${i + 1}${answers[i] !== null ? ', sudah dijawab' : ''}">${i + 1}${answers[i] !== null ? icon('material-symbols:check-rounded') : ''}</button>`).join('');

  const prev = current > 0 ? `<a class="btn-outline" href="#soal-${current}">${icon('tabler:arrow-left')}Sebelumnya</a>` : '';
  let right;
  if (!isLast()) right = `<a class="btn" href="#soal-${current + 2}">Selanjutnya ${icon('tabler:arrow-right')}</a>`;
  // Figma Desktop 1725: tanpa langkah Simpan; Catatan Penilai aktif setelah semua soal terjawab.
  else if (allAnswered()) right = `<a class="btn" href="#catatan">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</a>`;
  else right = `<button type="button" class="btn" disabled title="Jawab semua soal terlebih dahulu">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</button>`;
  $('#qFoot').innerHTML = `${prev}<span class="spacer"></span>${right}`;
}

$('#qOptions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-opt]');
  if (!b || submitted) return;
  answers[current] = Number(b.dataset.opt);
  persist();
  renderSoal();
});
$('#navGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) location.hash = `soal-${Number(b.dataset.go) + 1}`;
});

/* ---------- Catatan Penilai ---------- */
const noteFields = { keep: $('#noteKeep'), change: $('#noteChange') };
function renderCatatan() {
  Object.entries(noteFields).forEach(([k, el]) => { el.value = notes[k]; el.readOnly = submitted; });
}
Object.entries(noteFields).forEach(([k, el]) => el.addEventListener('input', () => { notes[k] = el.value; persist(); }));

/* ---------- Konfirmasi & submit ---------- */
function renderKonfirmasi() {
  $('#answerList').innerHTML = QUESTIONS.map((q, i) => `
    <li><span class="num">${i + 1}</span><span class="q">${esc(q.text)}</span>
      ${answers[i] === null ? '<span class="empty">Belum dijawab</span>'
        : `<span class="option"><b>${LETTERS[answers[i]]}</b><span>${esc(q.options[answers[i]])}</span></span>`}</li>`).join('');
  $('#viewKeep').textContent = notes.keep.trim() || '-';
  $('#viewChange').textContent = notes.change.trim() || '-';
  // Kekuatan Utama & Perlu Pengembangan hanya tampil setelah submit (Figma Desktop 1773).
  $('#resultBox').hidden = !submitted;
  if (submitted) { const res = principleResult(answers); $('#viewTop').textContent = res.top; $('#viewLow').textContent = res.low; }
  $('#kfActions').innerHTML = `${submitted ? `<button type="button" class="btn-outline" data-edit>${icon('mdi:pencil')}Edit</button>` : ''}
    <button type="button" class="btn" data-submit ${submitted ? 'disabled' : ''}>${icon('material-symbols:send-rounded')}Submit</button>`;
  syncSelfStep();
}

// Tahapan Self Review di alur dicentang setelah penilaian di-submit (hilang lagi bila dibuka untuk Edit).
const syncSelfStep = () => { $('#selfStep .check').hidden = !submitted; };

$('#kfActions').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('edit' in b.dataset) {
    submitted = false;
    persist();
    location.hash = 'soal-1';
    return;
  }
  if (!('submit' in b.dataset) || submitted) return;
  if (!await confirmBox('Apakah Anda yakin ingin mengirimkan penilaian?', 'Penilaian ini akan dikirimkan kepada Evaluator sebagai bahan pertimbangan rating.')) return;
  submitted = true;
  persist();
  renderKonfirmasi();
  // shortcut: halaman CoPI Feedback belum dibuat, jadi "Menuju ke CoPI Feedback" hanya menutup dialog.
  await ask($('#successDialog'));
});

/* ---------- Routing: #intro (kosong), #soal-N, #catatan, #konfirmasi ---------- */
function route() {
  const h = location.hash.slice(1);
  const n = Number(h.match(/^soal-(\d+)$/)?.[1]);
  let view = 'intro';
  if (n >= 1 && n <= QUESTIONS.length) { view = 'soal'; current = n - 1; }
  // Catatan opsional: konfirmasi cukup butuh semua soal terjawab.
  if (h === 'catatan' || h === 'konfirmasi') view = allAnswered() ? h : 'soal';
  // Halaman yang belum boleh dibuka diarahkan ke langkah yang masih harus diselesaikan.
  if (h && view !== h.replace(/-\d+$/, '')) return location.replace(view === 'soal' ? `#soal-${QUESTIONS.length}` : `#${view}`);

  $('#viewIntro').hidden = view !== 'intro';
  $('#viewSoal').hidden = view !== 'soal';
  $('#viewCatatan').hidden = view !== 'catatan';
  $('#viewKonfirmasi').hidden = view !== 'konfirmasi';
  if (view === 'soal') renderSoal();
  if (view === 'catatan') renderCatatan();
  if (view === 'konfirmasi') renderKonfirmasi();
  syncSelfStep();
  scrollTo(0, 0);
}

const backToLast = (e) => { e.preventDefault(); location.hash = `soal-${QUESTIONS.length}`; };
$('#ctBack').addEventListener('click', backToLast);

// Tombol Tampilkan/Sembunyikan Alur: lihat ../profile.js (pilihan diingat lintas halaman).

window.addEventListener('hashchange', route);
route();
