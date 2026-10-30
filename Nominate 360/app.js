// Tampilan dari desain Figma section "Nominate 360 - alternative":
// - Pemilihan Nominee 360: Evaluee memilih 4–6 Penilai 360 lalu submit ke Evaluator.
// - Penilaian 360 (Survei Leadership - Alternatif 2): menilai pekerja yang memilih Anda; soal, Catatan Penilai &
//   summary sama dengan Behavior Survey Self Review (QUESTIONS & LETTERS dari ../behavior-survey.js).

// Hubungan kerja (Figma Desktop 1388) — tiap jenis wajib minimal 1 penilai.
const REL = ['Fungsi/Unit yang Sama', 'Direktorat yang Sama', 'Direktorat yang Berbeda', 'Entitas yang Berbeda'];
const MIN_PICK = 4, MAX_PICK = 6;
// shortcut: data pekerja contoh (nama dari Figma), ganti dengan API master pekerja saat ada. Evaluator (Oka Fitrio) sengaja tidak ada.
const CANDIDATES = [
  ['Heru Joe', '0081382371', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru F', '00813726432', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru H', '00813726433', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru Juan', '00813726434', 'Sr Analyst X', 'Pertamina', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru FA', '00813726435', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru Zain', '00813726436', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Heru K', '00813726437', 'Sr Analyst X', 'LNG Business Commeralization', 'Pertamina', 'PT Pertamina (Persero)'],
  ['Andry Yudo', '777777', 'Sr Analyst III Performance & Competency Mgt', 'Human Capital Management', 'Human Capital', 'PT Pertamina (Persero)'],
  ['Siti Rahmawati', '752580', 'Analyst I Talent Development', 'Talent Development & Recruitment', 'Human Capital', 'PT Pertamina (Persero)'],
  ['Bagus Pratama', '752581', 'Sr Officer Supply Chain', 'Shared Services Procurement', 'Logistic Infrastructure', 'PT Pertamina Patra Niaga'],
  ['Dewi Lestari', '752582', 'Analyst II Culture & Change', 'Culture & Change Management', 'Human Capital', 'PT Kilang Pertamina Internasional'],
].map(([name, nopek, title, dept, dir, company]) => ({ id: nopek, name, nopek, title, dept, dir, company }));
// Pekerja yang memilih Anda sebagai Penilai 360 — sama dengan tab "Penilaian BeS 360" di Beranda (besTargets di ../app.js).
// done = status awal (Beranda: Completed); Beranda membaca status terkini dari penyimpanan halaman ini.
const RATEES = [
  ['Zahara', '1905416', 'Sr Expert', 'Upstream Development', 'Logistic Infrastructure', false],
  ['Dani Zulfah', '1905416', 'Sr Expert', 'Upstream Development', 'Logistic Infrastructure', true],
].map(([name, nopek, title, dept, dir, done]) => ({ name, nopek, title, dept, dir, done }));

/* ---------- Penyimpanan di localStorage (per user login) ---------- */
// shortcut: tanpa backend, pilihan & penilaian disimpan di localStorage browser ini; ganti dengan API saat ada.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
// Mode Evaluator (Figma Redesign-Evaluator "Approve Nominee 360"): Oka membuka pilihan Heru dari jalur review Beranda
// (sessionStorage 'pr-review', sama dengan ../review.js) lalu menyetujui atau meminta revisi.
const APPROVE = (() => { try { return LOGIN !== 'heru' && sessionStorage.getItem('pr-review') === 'heru'; } catch { return false; } })();
const STORE_KEY = `pr-nominate-${APPROVE ? 'heru' : LOGIN}`;
const stored = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();
const newRating = () => ({ answers: QUESTIONS.map(() => null), notes: { keep: '', change: '' }, submitted: false });
// shortcut: jawaban contoh untuk pekerja yang sudah dinilai sejak awal (done), ganti dengan data API saat ada.
const doneRating = () => ({ ...newRating(), answers: QUESTIONS.map((q, i) => q.scores.indexOf(i === 2 ? 4 : i === 4 ? 1 : 3)), submitted: true });
const validRating = (r) => Array.isArray(r?.answers) && r.answers.length === QUESTIONS.length;
const state = {
  // hanya pilihan yang pekerjanya masih ada di daftar
  picks: (Array.isArray(stored?.picks) ? stored.picks : []).filter((p) => CANDIDATES.some((c) => c.id === p.id) && REL.includes(p.rel)),
  submitted: !!stored?.submitted, // pilihan sudah dikirim ke Evaluator
  approval: ['approved', 'revision'].includes(stored?.approval) ? stored.approval : null, // keputusan Evaluator
  reason: typeof stored?.reason === 'string' ? stored.reason : '', // alasan revisi dari Evaluator
  ratings: RATEES.map((p, i) => (validRating(stored?.ratings?.[i]) ? { ...newRating(), ...stored.ratings[i] } : p.done ? doneRating() : newRating())),
};
// Pilihan terkunci: Evaluee sesudah submit, Evaluator sesudah memberi keputusan.
const locked = () => (APPROVE ? !!state.approval : state.submitted);
// true bila tersimpan; false bila localStorage penuh/diblokir.
function persist() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); return true; } catch { return false; }
}

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
document.querySelectorAll('[data-icon]').forEach((el) => { el.classList.add('ico'); el.innerHTML = ICONS[el.dataset.icon]; });
// Header Evaluator: langkah sama dengan initReviewUI di ../review.js (file itu tidak dimuat di sini karena
// mendeklarasikan LOGIN juga dan menulis ulang tautan Realisasi Target di stepper Evaluee).
if (APPROVE) {
  document.title = 'Approve Nominee 360 – People Review';
  $('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • <span>Evaluator</span>';
  $('.flow-pill').firstChild.textContent = 'Alur Evaluator ';
  $('.topbar-right').insertAdjacentHTML('afterbegin', '<span class="flow-pill evaluee-pill">Heru Kautsar - 19050193</span>');
  $('#stepper').innerHTML = [
    ['tabler:award-filled', 'Approve Individual Goal Setting', null, 'done'],
    ['streamline-flex:user-collaborate-group-solid', 'Approve Nominee 360', null, 'current'],
    ['mingcute:target-fill', 'Review & Approve Realisasi Target', '../Individual%20Goal/index.html'],
    ['ri:survey-fill', 'Behaviour Survey', '../Behavior%20Survey/index.html'],
    ['mdi:graph-box-multiple', 'Sintesis Evaluator Final', '../Sintesis%20Evaluator/index.html'],
  ].map(([ic, label, href, cls]) => `<li${cls ? ` class="${cls}"` : ''}>${href ? `<a href="${href}">${icon(ic)}${label}</a>` : `${icon(ic)}${label}`}</li>`).join('');
  // Judul tanpa dropdown (Evaluator tidak punya tampilan Penilaian 360 di sini).
  $('[data-switch]').outerHTML = '<h1 class="view-switch">Pemilihan Nominee 360</h1>';
  $('#lihatBtn').lastChild.textContent = 'Lihat Pilihan Penilai 360';
  $('#pilihSubmit').hidden = true;
}
const person = (id) => CANDIDATES.find((c) => c.id === id);
const match = (p, q) => !q || p.name.toLowerCase().includes(q) || p.nopek.includes(q);
const query = (el) => el.value.trim().toLowerCase();

/* ---------- Validasi pilihan (Syarat Pemilihan) ---------- */
const relCount = (picks, rel) => picks.filter((p) => p.rel === rel).length;
const validPicks = (picks) => picks.length >= MIN_PICK && picks.length <= MAX_PICK && REL.every((r) => relCount(picks, r) > 0);
console.assert(!validPicks([]), 'kosong tidak valid');
console.assert(validPicks(REL.map((rel, i) => ({ id: i, rel }))), '4 pekerja, 1 per hubungan kerja');
console.assert(!validPicks([0, 1, 2, 3].map((id) => ({ id, rel: REL[0] }))), 'tiap hubungan kerja wajib ada');
console.assert(!validPicks([...REL, ...REL].map((rel, id) => ({ id, rel }))), 'maksimal 6');

/* ---------- Dialog (jawaban dibaca dari submit; event close tidak selalu terpicu ulang di Chrome) ---------- */
let answerResolve = null;
const answerDialog = (v) => { answerResolve?.(v); answerResolve = null; };
function ask(dialog) {
  answerDialog(null);
  dialog.showModal();
  return new Promise((resolve) => { answerResolve = resolve; });
}
document.querySelectorAll('dialog.confirm').forEach((d) => {
  d.querySelector('form').addEventListener('submit', (e) => answerDialog(e.submitter?.value));
  d.addEventListener('cancel', () => answerDialog(null));
});
// danger: tombol Ya merah & Tidak biru (Figma Desktop 1352, hapus pekerja).
function confirmBox(title, text, danger = false, yes = 'Ya', no = 'Tidak') {
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  $('#confirmYes').textContent = yes;
  $('#confirmNo').textContent = no;
  $('#confirmYes').className = danger ? 'btn-outline danger' : 'btn';
  $('#confirmNo').className = danger ? 'btn' : 'btn-outline';
  return ask($('#confirmDialog')).then((v) => v === 'yes');
}
function infoBox(title, text) {
  $('#infoTitle').textContent = title;
  $('#infoText').textContent = text;
  return ask($('#infoDialog'));
}
function successBox(title, text, go, stay = 'Tetap di halaman ini') {
  $('#successTitle').textContent = title;
  $('#successStay').textContent = stay;
  $('#successText').textContent = text;
  $('#successGo').textContent = go;
  return ask($('#successDialog')).then((v) => v === 'go');
}

/* ---------- Popover (top layer, jadi tetap di atas dialog Penilai 360) ---------- */
function place(pop, anchor, alignRight = false) {
  const r = anchor.getBoundingClientRect();
  const left = alignRight ? r.right - pop.offsetWidth : r.left;
  pop.style.left = `${Math.max(8, Math.min(left, innerWidth - pop.offsetWidth - 8))}px`;
  const below = r.bottom + 6;
  pop.style.top = `${below + pop.offsetHeight > innerHeight - 8 ? Math.max(8, r.top - pop.offsetHeight - 6) : below}px`;
}
const visible = (sel) => [...document.querySelectorAll(sel)].find((el) => el.offsetParent);
$('#switchPop').addEventListener('toggle', (e) => e.newState === 'open' && place(e.target, visible('[data-switch]')));
$('#syaratPop').addEventListener('toggle', (e) => e.newState === 'open' && place(e.target, $('#syaratBtn')));
document.querySelectorAll('[data-switch]').forEach((b) => b.setAttribute('popovertarget', 'switchPop'));
$('#syaratBtn').setAttribute('popovertarget', 'syaratPop');

// Pilih hubungan kerja: untuk pekerja baru (Pilih) atau mengganti kategori (pensil di Penilai 360).
let relFor = null;
function openRel(anchor, id) {
  relFor = id;
  const cur = state.picks.find((p) => p.id === id)?.rel;
  $('#relOptions').innerHTML = REL.map((r) => `<button type="button" data-rel="${esc(r)}"${r === cur ? ' aria-pressed="true"' : ''}>${esc(r)}</button>`).join('');
  // Di luar dialog modal semua elemen inert (tak bisa diklik), jadi popover ikut masuk ke dialog pemicunya.
  (anchor.closest('dialog') || document.body).append($('#relPop'));
  $('#relPop').showPopover();
  place($('#relPop'), anchor, true);
}
$('#relOptions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rel]');
  if (!b || relFor == null || locked()) return;
  const pick = state.picks.find((p) => p.id === relFor);
  if (pick) pick.rel = b.dataset.rel;
  else state.picks.push({ id: relFor, rel: b.dataset.rel });
  persist();
  $('#relPop').hidePopover();
  renderPilih();
  if ($('#pickDialog').open) renderPicks();
});

/* ---------- Pemilihan Nominee 360 ---------- */
const th = (cols) => `<thead><tr>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead>`;
const baseCells = (p) => `<td>${esc(p.name)}</td><td>${esc(p.nopek)}</td><td>${esc(p.title)}</td><td>${esc(p.dept)}</td><td>${esc(p.dir)}</td>`;
const BASE_COLS = ['Nama Pekerja', 'Nomor Pekerja', 'Nama Jabatan', 'Departemen', 'Direktorat'];
// Tabel pilihan + Hubungan Kerja (Figma Desktop 1394 konfirmasi / 1396 sesudah submit).
const pickedTable = (picks) => th([...BASE_COLS, 'Hubungan Kerja'])
  + `<tbody>${picks.map((p) => `<tr>${baseCells(person(p.id))}<td>${esc(p.rel)}</td></tr>`).join('')
    || `<tr><td colspan="6" class="none">Tidak ada pekerja yang cocok</td></tr>`}</tbody>`;

function renderPilih() {
  const q = query($('#pilihSearch'));
  const done = !APPROVE && state.submitted;
  // Status: Disetujui / Revisi dari Evaluator (Figma Desktop 1485 / 1583), atau menunggu keputusan.
  const st = { approved: ['ok', 'Disetujui'], revision: ['rev', 'Revisi'] }[state.approval] || (done ? ['waiting', 'Menunggu Persetujuan'] : null);
  $('#pilihStatus').hidden = !st;
  if (st) [$('#pilihStatus').className, $('#pilihStatus').textContent] = [`badge ${st[0]}`, st[1]];
  $('#pilihStatus').title = state.approval === 'revision' && state.reason ? `Alasan Evaluator: ${state.reason}` : '';
  $('#pilihFoot').hidden = done;
  $('#pilihDoneFoot').hidden = !done;
  $('#pilihDoneText').textContent = state.approval === 'approved' ? 'Pilihan Anda sudah disetujui oleh Evaluator' : 'Pilihan Anda sedang dilakukan proses approval dari Evaluator';
  // Evaluator sebelum Evaluee submit pertama kali: halaman nonaktif, hanya pesan menunggu.
  const waiting = APPROVE && !state.submitted && !state.approval;
  if (APPROVE) {
    // Setuju/Tidak Setuju baru bisa setelah Evaluee submit; Ubah Persetujuan nonaktif selama menunggu revisi Evaluee.
    ['#lihatBtn', '#tolakBtn', '#setujuBtn'].forEach((s) => { $(s).hidden = !!state.approval; });
    $('#tolakBtn').disabled = $('#setujuBtn').disabled = !state.submitted;
    $('#lihatBtn').disabled = $('#pilihSearch').disabled = waiting;
    $('#ubahBtn').hidden = !state.approval;
    $('#ubahBtn').disabled = state.approval === 'revision';
    if (waiting) {
      $('#pilihEmpty h2').textContent = 'Evaluee Belum Submit Penilai 360';
      $('#pilihEmpty p').textContent = 'Halaman ini bisa digunakan setelah Evaluee melakukan submit pemilihan Penilai 360';
    }
  }
  // Evaluee sebelum mencari: empty state "Cari Penilai Anda dengan Tepat"; sesudah submit: daftar pilihan (read-only).
  // Evaluator: selalu daftar semua pekerja dengan Terpilih/Pilih (Figma Desktop 1476), kecuali saat waiting.
  $('#pilihEmpty').hidden = (APPROVE && !waiting) || done || !!q;
  $('#pilihTableWrap').hidden = waiting || (!APPROVE && !done && !q);
  if (done) {
    $('#pilihTable').innerHTML = pickedTable(state.picks.filter((p) => match(person(p.id), q)));
  } else if (APPROVE || q) {
    const rows = CANDIDATES.filter((c) => match(c, q));
    $('#pilihTable').innerHTML = th([...BASE_COLS, 'Aksi']) + `<tbody>${rows.map((c) => {
      const picked = state.picks.some((p) => p.id === c.id);
      return `<tr${picked ? ' class="picked"' : ''}>${baseCells(c)}<td>${picked
        ? `<button type="button" class="btn-dark unpick" data-picked="${c.id}"${locked() ? ' disabled' : ''} aria-label="Hapus ${esc(c.name)}"><span class="on">${icon('material-symbols:check-rounded')}Terpilih</span><span class="off">${icon('material-symbols:close-rounded')}Hapus</span></button>`
        : `<button type="button" class="btn-outline" data-pick="${c.id}"${locked() ? ' disabled' : ''}>${icon('akar-icons:plus')}Pilih</button>`}</td></tr>`;
    }).join('') || '<tr><td colspan="6" class="none">Pekerja tidak ditemukan</td></tr>'}</tbody>`;
  }
  $('#catCounts').innerHTML = REL.map((r) => {
    return `<p><span><b>${relCount(state.picks, r)}</b> Penilai</span><small>${esc(r)}</small></p>`;
  }).join('');
  syncStep();
}
$('#pilihSearch').addEventListener('input', renderPilih);
$('#pilihTable').addEventListener('click', async (e) => {
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    if (state.picks.length >= MAX_PICK) return infoBox('Nominee 360 sudah maksimal', `Penilai 360 maksimal ${MAX_PICK} pekerja. Hapus pekerja lain di "Lihat Pilihan 360 Saya" untuk mengganti.`);
    return openRel(pick, pick.dataset.pick);
  }
  const unpick = e.target.closest('[data-picked]');
  if (!unpick || locked()) return;
  if (!await confirmBox('Apakah Anda ingin menghapus pekerja yang sudah terpilih?', 'Penghapusan ini akan menghilangkan pekerja dalam list terpilih penilaian 360', true)) return;
  state.picks = state.picks.filter((p) => p.id !== unpick.dataset.picked);
  persist();
  renderPilih();
});
const incomplete = () => infoBox('Nominee 360 Anda belum lengkap', `Pastikan nominee 360 Anda terpenuhi dengan min. ${MIN_PICK} Pekerja (maks. ${MAX_PICK}) terdiri dari 1 Fungsi yang sama, 1 Direktorat yang sama, 1 Direktorat lain, dan 1 Entitas yang berbeda`);
$('#pilihSubmit').addEventListener('click', () => (validPicks(state.picks) ? openKonfPilih() : incomplete()));

/* ---------- Approve Nominee 360 (Evaluator, Figma Desktop 1476–1485 & edge case Tidak Setuju 1480–1583) ---------- */
const REALISASI = '../Individual%20Goal/index.html';
function decide(approval) {
  state.approval = approval;
  persist();
  renderPilih();
}
$('#setujuBtn').addEventListener('click', async () => {
  if (!validPicks(state.picks)) return incomplete();
  if (!await confirmBox('Anda yakin untuk menyetujui pemilihan penilai 360?', 'Penilai yang terpilih akan terkunci dan tidak bisa diubah kembali', false, 'Ya, ajukan persetujuan', 'Tidak, Saya Ingin Cek Kembali')) return;
  decide('approved');
  if (await successBox('Pemilihan Nominee 360 telah disetujui!', 'Silakan untuk melanjutkan ke halaman Approval Realisasi Target', 'Lanjut ke Realisasi Target')) location.href = REALISASI;
});
$('#reasonInput').addEventListener('input', (e) => { $('#reasonCount').textContent = `${e.target.value.length}/200`; });
$('#tolakBtn').addEventListener('click', async () => {
  if (!await confirmBox('Anda yakin untuk tidak menyetujui pemilihan penilai 360 dari Evaluee?', 'Revisi pemilihan penilai 360 ini akan disampaikan kepada Evaluee', true, 'Ya, ajukan revisi', 'Tidak')) return;
  $('#reasonInput').value = '';
  $('#reasonCount').textContent = '0/200';
  if (await ask($('#reasonDialog')) !== 'send') return;
  state.reason = $('#reasonInput').value.trim();
  state.submitted = false; // Evaluee bisa mengubah pilihan lalu submit ulang
  decide('revision');
  if (await successBox('Revisi Nominee 360 sudah terkirim!', 'Silakan untuk melanjutkan ke halaman Realisasi Target', 'Lanjut ke Approval Realisasi Target')) location.href = REALISASI;
});
$('#ubahBtn').addEventListener('click', () => decide(null));

// Lihat Pilihan 360 Saya (Figma Desktop 1350): ubah hubungan kerja / hapus pekerja.
function renderPicks() {
  const q = query($('#pickSearch'));
  const list = state.picks.filter((p) => match(person(p.id), q));
  $('#pickList').innerHTML = list.map((p) => {
    const c = person(p.id);
    return `<article class="pick-card">
      <span class="tag company">${esc(c.company)}</span>
      <h3>${esc(c.name)}</h3><p class="muted">${esc(c.nopek)}</p>
      <p class="meta">${[c.company.replace(/^PT /, '').replace(/ \(Persero\)$/, ''), c.dir, c.dept].map(esc).join(' • ')}</p>
      <p class="title">${esc(c.title)}</p>
      <button type="button" class="tag rel" data-edit-rel="${c.id}" aria-label="Ubah hubungan kerja ${esc(c.name)}"${locked() ? ' disabled' : ''}>${esc(p.rel)}${icon('mdi:pencil')}</button>
      <div class="pick-foot"><button type="button" class="btn-outline danger" data-del="${c.id}"${locked() ? ' disabled' : ''}>${icon('mdi:trash')}Hapus Pekerja</button></div>
    </article>`;
  }).join('') || `<p class="none">${state.picks.length ? 'Pekerja tidak ditemukan' : 'Belum ada pekerja yang dipilih sebagai Penilai 360'}</p>`;
}
function openPicks() {
  $('#pickSearch').value = '';
  renderPicks();
  $('#pickDialog').showModal();
}
$('#lihatBtn').addEventListener('click', openPicks);
$('#pickSearch').addEventListener('input', renderPicks);
$('#pickList').addEventListener('click', async (e) => {
  if (locked()) return;
  const edit = e.target.closest('[data-edit-rel]');
  if (edit) return openRel(edit, edit.dataset.editRel);
  const del = e.target.closest('[data-del]');
  if (!del) return;
  // Dialog konfirmasi tampil di atas dialog Penilai 360 (keduanya modal).
  if (!await confirmBox('Apakah Anda ingin menghapus pekerja yang sudah terpilih?', 'Penghapusan ini akan menghilangkan pekerja dalam list terpilih penilaian 360', true)) return;
  state.picks = state.picks.filter((p) => p.id !== del.dataset.del);
  persist();
  renderPicks();
  renderPilih();
});
$('#pickDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

// Konfirmasi pemilihan (Figma "Konfirmasi Pemilihan - Alternatif 3", Desktop 1430–1432)
const renderKonfPilih = () => { $('#konfPilihTable').innerHTML = pickedTable(state.picks.filter((p) => match(person(p.id), query($('#konfPilihSearch'))))); };
function openKonfPilih() {
  $('#konfPilihSearch').value = '';
  renderKonfPilih();
  $('#konfPilihDialog').showModal();
}
$('#konfPilihSearch').addEventListener('input', renderKonfPilih);
$('#konfPilihDialog').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
$('#konfPilihSubmit').addEventListener('click', async () => {
  if (!validPicks(state.picks) || state.submitted) return;
  if (!await confirmBox('Apakah Anda sudah selesai dengan pemilihan Nominee 360?', 'Pekerja yang terpilih akan diberitahukan setelah submit pemilihan ini', false, 'Submit', 'Tidak, Saya Ingin Cek Kembali')) return;
  state.submitted = true;
  state.approval = null; // submit ulang sesudah revisi menunggu keputusan baru
  persist();
  $('#konfPilihDialog').close();
  renderPilih();
  const go = await successBox('Nominee 360 sudah tersubmit!', 'Silakan menunggu approval dari Evaluator Anda dan Anda bisa melihat progress pengisian di Rating Nominee', 'Lanjut ke Rating Nominee');
  location.hash = go ? 'penilaian' : 'pilih';
});

/* ---------- Penilaian 360 ---------- */
function renderPenilaian() {
  const q = query($('#nilaiSearch'));
  $('#nilaiTable').innerHTML = th([...BASE_COLS, 'Status', 'Aksi']) + `<tbody>${RATEES.map((p, i) => [p, i]).filter(([p]) => match(p, q)).map(([p, i]) => {
    const done = state.ratings[i].submitted;
    const first = state.ratings[i].answers.findIndex((a) => a === null);
    return `<tr>${baseCells(p)}
      <td><span class="badge ${done ? 'ok' : 'waiting'}">${done ? 'Selesai' : 'Menunggu Penilaian'}</span></td>
      <td><a class="btn-outline" href="#nilai-${i + 1}-${done ? 'konfirmasi' : `soal-${first < 0 ? 1 : first + 1}`}">${done ? 'Lihat Penilaian' : 'Mulai Penilaian'}${icon('tabler:arrow-right')}</a></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="none">Pekerja tidak ditemukan</td></tr>'}</tbody>`;
}
$('#nilaiSearch').addEventListener('input', renderPenilaian);

/* ---------- Survei (logika sama dengan Self Review) ---------- */
let ri = 0;      // index pekerja yang dinilai
let current = 0; // index soal
const rating = () => state.ratings[ri];
const answeredCount = () => rating().answers.filter((a) => a !== null).length;
const allAnswered = () => answeredCount() === QUESTIONS.length;
const base = () => `nilai-${ri + 1}`;

function renderRatee() {
  const p = RATEES[ri];
  document.querySelectorAll('.ratee-info').forEach((el) => { el.innerHTML = `<b>${esc(p.name)}</b> • ${esc(p.nopek)} • <b>${esc(p.title)}</b>`; });
}

function renderSoal() {
  const q = QUESTIONS[current], r = rating();
  $('#qText').textContent = q.text;
  $('#qPrinciple').textContent = q.principle;
  $('#qDef').textContent = PRINCIPLES[q.principle];
  $('#qOptions').innerHTML = q.options.map((o, i) => `
    <button type="button" class="option" role="radio" aria-checked="${r.answers[current] === i}" data-opt="${i}" ${r.submitted ? 'disabled' : ''}>
      <b>${LETTERS[i]}</b><span>${esc(o)}</span></button>`).join('');

  $('#navPos').textContent = answeredCount();
  $('#navTotal').textContent = QUESTIONS.length;
  $('#navBar').style.width = `${(answeredCount() / QUESTIONS.length) * 100}%`;
  $('#navGrid').innerHTML = QUESTIONS.map((_, i) => `
    <button type="button" data-go="${i}" class="${r.answers[i] !== null ? 'answered' : ''}"${i === current ? ' aria-current="step"' : ''}
      aria-label="Soal ${i + 1}${r.answers[i] !== null ? ', sudah dijawab' : ''}">${i + 1}${r.answers[i] !== null ? icon('material-symbols:check-rounded') : ''}</button>`).join('');

  const prev = current > 0 ? `<a class="btn-outline" href="#${base()}-soal-${current}">${icon('tabler:arrow-left')}Sebelumnya</a>`
    : `<a class="btn-outline" href="#penilaian">${icon('tabler:arrow-left')}Kembali ke List Penilaian 360</a>`;
  let right;
  if (current < QUESTIONS.length - 1) right = `<a class="btn" href="#${base()}-soal-${current + 2}">Selanjutnya ${icon('tabler:arrow-right')}</a>`;
  else if (allAnswered()) right = `<a class="btn" href="#${base()}-catatan">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</a>`;
  else right = `<button type="button" class="btn" disabled title="Jawab semua soal terlebih dahulu">Menuju Catatan Penilai ${icon('tabler:arrow-right')}</button>`;
  $('#qFoot').innerHTML = `${prev}<span class="spacer"></span>${right}`;
}
$('#qOptions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-opt]');
  if (!b || rating().submitted) return;
  rating().answers[current] = Number(b.dataset.opt);
  persist();
  renderSoal();
});
$('#navGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) location.hash = `${base()}-soal-${Number(b.dataset.go) + 1}`;
});

const noteFields = { keep: $('#noteKeep'), change: $('#noteChange') };
function renderCatatan() {
  Object.entries(noteFields).forEach(([k, el]) => { el.value = rating().notes[k]; el.readOnly = rating().submitted; });
  $('#ctBack').href = `#${base()}-soal-${QUESTIONS.length}`;
  $('#ctNext').href = `#${base()}-konfirmasi`;
}
Object.entries(noteFields).forEach(([k, el]) => el.addEventListener('input', () => { rating().notes[k] = el.value; persist(); }));

function renderKonfirmasi() {
  const r = rating();
  $('#answerList').innerHTML = QUESTIONS.map((q, i) => `
    <li><span class="num">${i + 1}</span><span class="q">${esc(q.text)}</span>
      ${r.answers[i] === null ? '<span class="empty">Belum dijawab</span>'
        : `<span class="option"><b>${LETTERS[r.answers[i]]}</b><span>${esc(q.options[r.answers[i]])}</span></span>`}</li>`).join('');
  $('#viewKeep').textContent = r.notes.keep.trim() || '-';
  $('#viewChange').textContent = r.notes.change.trim() || '-';
  // Kekuatan Utama & Perlu Pengembangan hanya tampil setelah submit (Figma Desktop 1773).
  $('#resultBox').hidden = !r.submitted;
  if (r.submitted) { const res = principleResult(r.answers); $('#viewTop').textContent = res.top; $('#viewLow').textContent = res.low; }
  $('#kfTitle').textContent = r.submitted ? 'Konfirmasi Penilaian Behavior Survey' : 'Konfirmasi Penilaian';
  $('#kfBackFoot').href = `#${base()}-catatan`;
  // Figma Desktop 1789: setelah submit tidak ada Edit, hanya kembali ke list.
  $('#kfActions').innerHTML = `${r.submitted ? '<a class="btn" href="#penilaian">Kembali ke List Penilaian 360</a>' : ''}
    <button type="button" class="btn" data-submit ${r.submitted ? 'disabled' : ''}>${icon('material-symbols:send-rounded')}Submit</button>`;
}
$('#kfActions').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b || !('submit' in b.dataset) || rating().submitted) return;
  if (!await confirmBox('Apakah Anda ingin mengirimkan hasil survey Anda?', `Penilaian ini akan dikirimkan sebagai Penilaian 360 untuk ${RATEES[ri].name}.`)) return;
  rating().submitted = true;
  persist();
  renderKonfirmasi();
  syncStep();
  const stay = 'Tetap di halaman ini dan lihat hasil penilaian';
  // Figma Desktop 1793: penilaian terakhir langsung diarahkan ke Realisasi Target.
  if (state.ratings.every((x) => x.submitted)) {
    if (await successBox('Survey Anda sudah tersubmit', 'Semua penilaian 360 sudah selesai. Silakan untuk melanjutkan ke Realisasi Target', 'Menuju Realisasi Target', stay)) location.href = '../Individual%20Goal/index.html';
  } else if (await successBox('Survey Anda sudah tersubmit', 'Silakan untuk kembali ke pemilihan pekerja untuk diberikan nilai 360', 'Kembali ke Penilaian 360', stay)) location.hash = 'penilaian';
});

// Tahapan Nominate 360 dicentang setelah pilihan di-submit dan semua Penilaian 360 terkirim (Figma Desktop 1414).
const syncStep = () => { $('#nomStep .check').hidden = !(state.submitted && state.ratings.every((r) => r.submitted)); };

/* ---------- Routing: #pilih (kosong), #penilaian, #nilai-N-soal-M, #nilai-N-catatan, #nilai-N-konfirmasi ---------- */
const VIEWS = { pilih: '#viewPilih', penilaian: '#viewPenilaian', soal: '#viewSoal', catatan: '#viewCatatan', konfirmasi: '#viewKonfirmasi' };
function route() {
  const h = APPROVE ? 'pilih' : location.hash.slice(1) || 'pilih';
  document.querySelectorAll('[popover]').forEach((p) => p.matches(':popover-open') && p.hidePopover());
  let view = VIEWS[h] && !['soal', 'catatan', 'konfirmasi'].includes(h) ? h : null;
  const m = h.match(/^nilai-(\d+)-(soal-(\d+)|catatan|konfirmasi)$/);
  if (m && m[1] >= 1 && m[1] <= RATEES.length) {
    ri = m[1] - 1;
    const n = Number(m[3]);
    if (m[3] && n >= 1 && n <= QUESTIONS.length) { view = 'soal'; current = n - 1; }
    // Catatan & konfirmasi baru bisa dibuka setelah semua soal terjawab.
    else if (!m[3]) view = allAnswered() ? m[2] : 'soal';
    if (view === 'soal' && !m[3]) return location.replace(`#${base()}-soal-${QUESTIONS.length}`);
  }
  if (!view) return location.replace('#pilih');

  Object.entries(VIEWS).forEach(([k, sel]) => { $(sel).hidden = k !== view; });
  document.querySelectorAll('#switchPop a').forEach((a) => a.toggleAttribute('aria-current', a.dataset.view === view));
  if (view === 'pilih') renderPilih();
  if (view === 'penilaian') renderPenilaian();
  if (['soal', 'catatan', 'konfirmasi'].includes(view)) renderRatee();
  if (view === 'soal') renderSoal();
  if (view === 'catatan') renderCatatan();
  if (view === 'konfirmasi') renderKonfirmasi();
  syncStep();
  scrollTo(0, 0);
}

// Tombol Tampilkan/Sembunyikan Alur: lihat ../profile.js (pilihan diingat lintas halaman).

window.addEventListener('hashchange', route);
route();
