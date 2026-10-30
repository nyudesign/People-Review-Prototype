// Dari desain Figma Redesign-Evaluator "Behaviour Survey": Oka (Evaluator) menilai Behavior Survey Heru dan melihat hasil Penilai 360.
// Soal, Catatan Penilai & Konfirmasi sama dengan Penilaian Behavior Survey 360 (QUESTIONS dari ../behavior-survey.js, tampilan dari Nominate 360).
// Rute: # = pilihan, #soal-N, #catatan, #konfirmasi, #penilai-360, #penilai-360-K (hasil read-only Penilai 360 ke-K).
const EVALUEE = { name: 'Heru Kautsar', nopek: '19050193', title: 'Sr Analyst II Performance & Competency Mgt' };
// shortcut: hasil Penilai 360 masih contoh (nama dari Figma Nominate 360); ganti dengan hasil Penilaian 360 dari API saat ada.
const RATERS = [
  ['Heru Joe', '0081382371', 'Sr Analyst X', 'Fungsi/Unit yang Sama', 0],
  ['Andry Yudo', '777777', 'Sr Analyst III Performance & Competency Mgt', 'Direktorat yang Sama', 1],
  ['Bagus Pratama', '752581', 'Sr Officer Supply Chain', 'Direktorat yang Berbeda', 2],
  ['Dewi Lestari', '752582', 'Analyst II Culture & Change', 'Entitas yang Berbeda', 3],
].map(([name, nopek, title, rel, seed]) => ({
  name, nopek, title, rel,
  rating: {
    answers: QUESTIONS.map((q, i) => q.scores.indexOf([4, 3, 4, 2][(i + seed) % 4])),
    notes: { keep: 'Konsisten mendengarkan masukan tim sebelum mengambil keputusan.', change: 'Mulai lebih sering mendelegasikan pekerjaan ke anggota tim.' },
    submitted: true,
  },
}));

// shortcut: tanpa backend, penilaian Evaluator disimpan di localStorage browser ini; ganti dengan API saat ada.
const STORE_KEY = 'pr-bs-evaluator-heru';
const stored = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();
const mine = Array.isArray(stored?.answers) && stored.answers.length === QUESTIONS.length
  ? { notes: { keep: '', change: '' }, ...stored } : { answers: QUESTIONS.map(() => null), notes: { keep: '', change: '' }, submitted: false };
const persist = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(mine)); } catch {} };

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name) => `<i class="ico">${ICONS[name]}</i>`;
document.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });
initReviewUI('Behaviour Survey', 'Behaviour Survey');
document.querySelectorAll('.ratee-info').forEach((el) => { el.innerHTML = `<b>${esc(EVALUEE.name)}</b> • ${esc(EVALUEE.nopek)} • <b>${esc(EVALUEE.title)}</b>`; });

let current = 0;
const answered = () => mine.answers.filter((a) => a !== null).length;
const allAnswered = () => answered() === QUESTIONS.length;

function renderHome() {
  $('#startCard').dataset.href = mine.submitted ? '#konfirmasi' : `#soal-${Math.max(1, mine.answers.findIndex((a) => a === null) + 1)}`;
}
// Kartu dipilih dulu (Figma Desktop 1831); Selanjutnya nonaktif sampai ada pilihan.
const cards = document.querySelectorAll('.choice-card');
cards.forEach((c) => c.addEventListener('click', () => {
  cards.forEach((x) => x.setAttribute('aria-pressed', x === c));
  $('#homeNext').disabled = false;
  $('#homeNext').removeAttribute('title');
}));
$('#homeNext').addEventListener('click', () => { location.hash = $('.choice-card[aria-pressed="true"]').dataset.href; });

function render360() {
  $('#raterTable').innerHTML = `<thead><tr><th>Nama</th><th>Nopek</th><th>Jabatan</th><th>Hubungan Kerja</th><th>Kekuatan Utama</th><th>Perlu Pengembangan</th><th>Aksi</th></tr></thead>
    <tbody>${RATERS.map((p, i) => { const res = principleResult(p.rating.answers); return `<tr>
      <td>${esc(p.name)}</td><td>${esc(p.nopek)}</td><td>${esc(p.title)}</td><td>${esc(p.rel)}</td>
      <td><b class="pill ok">${esc(res.top)}</b></td><td><b class="pill dev">${esc(res.low)}</b></td>
      <td><a class="btn-outline" href="#penilai-360-${i + 1}">Lihat Penilaian${icon('tabler:arrow-right')}</a></td></tr>`; }).join('')}</tbody>`;
}

function renderSoal() {
  const q = QUESTIONS[current];
  $('#qText').textContent = q.text;
  $('#qPrinciple').textContent = q.principle;
  $('#qDef').textContent = PRINCIPLES[q.principle];
  $('#qOptions').innerHTML = q.options.map((o, i) => `
    <button type="button" class="option" role="radio" aria-checked="${mine.answers[current] === i}" data-opt="${i}" ${mine.submitted ? 'disabled' : ''}>
      <b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`).join('');
  $('#navPos').textContent = answered();
  $('#navTotal').textContent = QUESTIONS.length;
  $('#navBar').style.width = `${(answered() / QUESTIONS.length) * 100}%`;
  $('#navGrid').innerHTML = QUESTIONS.map((_, i) => `
    <button type="button" data-go="${i}" class="${mine.answers[i] !== null ? 'answered' : ''}"${i === current ? ' aria-current="step"' : ''}
      aria-label="Soal ${i + 1}${mine.answers[i] !== null ? ', sudah dijawab' : ''}">${i + 1}${mine.answers[i] !== null ? icon('material-symbols:check-rounded') : ''}</button>`).join('');
  const prev = current > 0 ? `<a class="btn-outline" href="#soal-${current}">${icon('tabler:arrow-left')}Sebelumnya</a>`
    : `<a class="btn-outline" href="#">${icon('tabler:arrow-left')}Kembali ke Behavior Survey</a>`;
  let next;
  if (current < QUESTIONS.length - 1) next = `<a class="btn" href="#soal-${current + 2}">Selanjutnya ${icon('tabler:arrow-right')}</a>`;
  else if (allAnswered()) next = `<a class="btn" href="#catatan">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</a>`;
  else next = `<button type="button" class="btn" disabled title="Jawab semua soal terlebih dahulu">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</button>`;
  $('#qFoot').innerHTML = `${prev}<span class="spacer"></span>${next}`;
}
$('#qOptions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-opt]');
  if (!b || mine.submitted) return;
  mine.answers[current] = Number(b.dataset.opt);
  persist();
  renderSoal();
});
$('#navGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) location.hash = `soal-${Number(b.dataset.go) + 1}`;
});

const noteFields = { keep: $('#noteKeep'), change: $('#noteChange') };
function renderCatatan() {
  Object.entries(noteFields).forEach(([k, el]) => { el.value = mine.notes[k]; el.readOnly = mine.submitted; });
  $('#ctBack').href = `#soal-${QUESTIONS.length}`;
}
Object.entries(noteFields).forEach(([k, el]) => el.addEventListener('input', () => { mine.notes[k] = el.value; persist(); }));

// r = penilaian yang ditampilkan; rater = Penilai 360 (read-only) atau null untuk penilaian Evaluator sendiri.
function renderKonfirmasi(r, rater = null) {
  $('#answerList').innerHTML = QUESTIONS.map((q, i) => `
    <li><span class="num">${i + 1}</span><span class="q">${esc(q.text)}</span>
      ${r.answers[i] === null ? '<span class="empty">Belum dijawab</span>'
        : `<span class="option"><b>${LETTERS[r.answers[i]]}</b><span>${esc(q.options[r.answers[i]])}</span></span>`}</li>`).join('');
  $('#viewKeep').textContent = r.notes.keep.trim() || '-';
  $('#viewChange').textContent = r.notes.change.trim() || '-';
  $('#resultBox').hidden = !r.submitted;
  if (r.submitted) { const res = principleResult(r.answers); $('#viewTop').textContent = res.top; $('#viewLow').textContent = res.low; }
  $('#kfTitle').textContent = rater ? `Penilaian dari ${rater.name}` : r.submitted ? 'Konfirmasi Penilaian Behavior Survey' : 'Konfirmasi Penilaian';
  $('#kfBack').href = rater ? '#penilai-360' : '#catatan';
  $('#kfBack span').textContent = rater ? 'Kembali ke Penilaian dari Penilai 360' : 'Kembali ke Catatan Penilai';
  $('#kfActions').innerHTML = rater ? '' : r.submitted
    ? `<a class="btn" href="../Sintesis%20Evaluator/index.html">Menuju Sintesis Evaluator Final ${icon('tabler:arrow-right')}</a>`
    : `<button type="button" class="btn" data-submit>${icon('material-symbols:send-rounded')}Submit</button>`;
}

function ask(dialog) {
  dialog.returnValue = '';
  dialog.showModal();
  return new Promise((resolve) => dialog.addEventListener('close', () => resolve(dialog.returnValue), { once: true }));
}
$('#kfActions').addEventListener('click', async (e) => {
  if (!e.target.closest('[data-submit]') || mine.submitted) return;
  if (await ask($('#confirmDialog')) !== 'yes') return;
  mine.submitted = true;
  persist();
  renderKonfirmasi(mine);
  if (await ask($('#successDialog')) === 'go') location.href = '../Sintesis%20Evaluator/index.html';
});

const VIEWS = ['#viewHome', '#view360', '#viewSoal', '#viewCatatan', '#viewKonfirmasi'];
function route() {
  const h = location.hash.slice(1);
  const soal = h.match(/^soal-(\d+)$/), rater = h.match(/^penilai-360-(\d+)$/);
  let view = '#viewHome';
  if (soal && soal[1] >= 1 && soal[1] <= QUESTIONS.length) { view = '#viewSoal'; current = soal[1] - 1; renderSoal(); }
  else if (rater && rater[1] >= 1 && rater[1] <= RATERS.length) { view = '#viewKonfirmasi'; const p = RATERS[rater[1] - 1]; renderKonfirmasi(p.rating, p); }
  else if (h === 'penilai-360') { view = '#view360'; render360(); }
  // Catatan & Konfirmasi baru bisa dibuka setelah semua soal terjawab.
  else if (h === 'catatan' || h === 'konfirmasi') {
    if (!allAnswered()) return location.replace(`#soal-${mine.answers.findIndex((a) => a === null) + 1}`);
    view = h === 'catatan' ? '#viewCatatan' : '#viewKonfirmasi';
    if (h === 'catatan') renderCatatan(); else renderKonfirmasi(mine);
  } else if (h) return location.replace('#');
  else renderHome();
  VIEWS.forEach((sel) => { $(sel).hidden = sel !== view; });
  scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
