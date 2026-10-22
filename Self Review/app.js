// Tampilan dari desain Figma section "Self Review" (Behavior Survey).
// Soal 1-2 dari Figma; soal 3-10 di Figma masih salinan soal 1/2.
// shortcut: soal 3-10 adalah contoh sementara, ganti dengan daftar soal resmi saat tersedia.
const QUESTIONS = [
  ['Ketika anggota tim menyampaikan keluhan mengenai pekerjaan, saya biasanya',
    ['Memberikan solusi', 'Mengarahkan ke prosedur', 'Mendengarkan hingga memahami situasi', 'Meminta menyelesaikan sendiri']],
  ['Saat rekan kerja terlihat mengalami tekanan kerja tinggi',
    ['Fokus pekerjaan masing-masing', 'Menanyakan kondisi dan membantu', 'Menunggu diminta', 'Menghindari keterlibatan']],
  ['Ketika target tim tidak tercapai, saya biasanya',
    ['Mencari siapa yang bertanggung jawab', 'Mengevaluasi bersama dan mencari perbaikan', 'Menyerahkan evaluasi ke atasan', 'Melanjutkan pekerjaan tanpa evaluasi']],
  ['Saat menerima masukan kritis dari rekan kerja',
    ['Menerima dan menindaklanjuti', 'Menjelaskan alasan tindakan saya', 'Mengabaikan bila tidak sesuai', 'Meminta bukti terlebih dahulu']],
  ['Ketika ada anggota tim baru bergabung',
    ['Membiarkan belajar sendiri', 'Memberikan dokumen panduan', 'Mendampingi hingga dapat bekerja mandiri', 'Menyerahkan pengenalan ke HR']],
  ['Saat terjadi perbedaan pendapat dalam rapat',
    ['Mempertahankan pendapat saya', 'Mendengarkan semua pihak lalu mencari titik temu', 'Mengikuti suara terbanyak', 'Diam agar tidak memperpanjang']],
  ['Ketika menemukan kondisi tidak aman di area kerja',
    ['Melaporkan dan menghentikan pekerjaan bila perlu', 'Menunggu orang lain melapor', 'Memberi tahu rekan terdekat saja', 'Melanjutkan pekerjaan dengan hati-hati']],
  ['Saat beban kerja tim tidak merata',
    ['Membiarkan sesuai pembagian awal', 'Menawarkan bantuan kepada yang kewalahan', 'Melaporkan ke atasan', 'Menyelesaikan bagian sendiri lebih dulu']],
  ['Ketika keberhasilan tim mendapat apresiasi',
    ['Menyebutkan kontribusi setiap anggota', 'Menerima apresiasi atas nama saya', 'Tidak menanggapi', 'Menyebutkan kontribusi utama saya']],
  ['Saat diminta membantu pekerjaan di luar tanggung jawab saya',
    ['Menolak karena bukan tugas saya', 'Membantu sesuai kemampuan tanpa mengganggu tugas utama', 'Membantu bila diperintah atasan', 'Menunda sampai tugas saya selesai']],
].map(([text, options]) => ({ text, options }));
const LETTERS = ['A', 'B', 'C', 'D'];
// Batas 500KB: localStorage ±5 juta karakter dipakai bersama semua tahapan; file base64 ±1,37× ukuran asli.
const MAX_FILE = 500 * 1024;

/* ---------- Penyimpanan di localStorage (per user login) ---------- */
// shortcut: tanpa backend, isian & file evidence (base64) disimpan di localStorage browser ini; ganti dengan API saat ada.
const LOGIN = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
const STORE_KEY = `pr-selfreview-${LOGIN}`;
const stored = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; } })();
const validStore = Array.isArray(stored?.answers) && stored.answers.length === QUESTIONS.length;

const answers = validStore ? stored.answers : QUESTIONS.map(() => null); // index pilihan per soal
let current = 0;
let saved = validStore && !!stored.saved;          // jawaban sudah disimpan (terkunci)
let submitted = validStore && !!stored.submitted;  // penilaian sudah dikirim ke Evaluator
let file = (validStore && stored.file) || null;    // { name, size, type, data (data URL) }
let fileUrl = null;

// true bila tersimpan; false bila localStorage penuh/diblokir.
function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ answers, saved, submitted, file }));
    return true;
  } catch { return false; }
}
// Data URL → blob URL, karena browser memblokir membuka data URL langsung di tab baru.
function blobUrlFrom(dataUrl) {
  const [head, b64] = dataUrl.split(',');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: head.match(/^data:([^;]*)/)[1] }));
}
const fmtSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);
console.assert(fmtSize(500 * 1024) === '500 KB' && fmtSize(1.5 * 1024 * 1024) === '1.5 MB', 'format ukuran file');
if (file) { try { fileUrl = blobUrlFrom(file.data); } catch { file = null; } }

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
console.assert(QUESTIONS.length === 10 && QUESTIONS.every((q) => q.options.length === 4), '10 soal, masing-masing 4 pilihan');

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
  $('#qOptions').innerHTML = q.options.map((o, i) => `
    <button type="button" class="option" role="radio" aria-checked="${answers[current] === i}" data-opt="${i}" ${saved ? 'disabled' : ''}>
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
  else if (saved) {
    // Setelah submit, Edit di sini disabled; membuka kembali penilaian hanya lewat Edit di layar Konfirmasi.
    right = `<button type="button" class="btn-outline" data-edit ${submitted ? 'disabled title="Penilaian sudah dikirim. Gunakan Edit di halaman Konfirmasi."' : ''}>${icon('mdi:pencil')}Edit</button>
      <button type="button" class="btn" disabled>${icon('fa-solid:save')}Simpan</button>
      <a class="btn" href="#evidence">Menuju Upload Evidence ${icon('tabler:arrow-right')}</a>`;
  } else {
    right = `<button type="button" class="btn" data-save ${allAnswered() ? '' : 'disabled title="Jawab semua soal terlebih dahulu"'}>${icon('fa-solid:save')}Simpan</button>`;
  }
  $('#qFoot').innerHTML = `${prev}<span class="spacer"></span>${right}`;
}

$('#qOptions').addEventListener('click', (e) => {
  const b = e.target.closest('[data-opt]');
  if (!b || saved) return;
  answers[current] = Number(b.dataset.opt);
  persist();
  renderSoal();
});
$('#navGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) location.hash = `soal-${Number(b.dataset.go) + 1}`;
});
$('#qFoot').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('edit' in b.dataset && !submitted) { saved = false; persist(); return renderSoal(); }
  if ('save' in b.dataset && allAnswered()) {
    if (!await confirmBox('Apakah Anda ingin menyimpan jawaban ini?', 'Jawaban akan tersimpan dan Anda dapat melanjutkan ke tahap lampiran evidence')) return;
    saved = true;
    persist();
    renderSoal();
  }
});

/* ---------- Upload evidence ---------- */
function fileHTML(editable) {
  if (!file) {
    return `<img src="assets/upload-illustration.svg" alt="" width="66" height="64">
      <p class="link">Tarik dan lepaskan file yang Anda ingin unggah<br>(.pdf/.jpg max. 500KB)</p>
      <p class="muted">atau</p>
      <button type="button" class="btn" data-pick>Pilih File</button>`;
  }
  return `${icon('line-md:file-twotone', 'file-ico')}
    <p class="file-name">${esc(file.name)}</p><p class="muted">${fmtSize(file.size)}</p>
    <div class="file-actions">
      <button type="button" class="btn-outline" data-view>${icon('mdi:eye')}Lihat File</button>
      ${editable ? `<button type="button" class="btn-outline" data-pick>${icon('iconamoon:swap-bold')}Ubah File</button>
      <button type="button" class="btn-outline danger" data-remove>${icon('mdi:trash')}Hapus File</button>` : ''}
    </div>`;
}

function renderEvidence() {
  $('#drop').innerHTML = fileHTML(!submitted);
  $('#evNext').innerHTML = file
    ? `<a class="btn" href="#konfirmasi">Selanjutnya ${icon('tabler:arrow-right')}</a>`
    : `<button class="btn" disabled>Selanjutnya ${icon('tabler:arrow-right')}</button>`;
}

const showFileError = (msg) => { $('#fileError').textContent = msg; $('#fileError').hidden = false; };

async function setFile(f) {
  $('#fileError').hidden = true;
  if (!f || submitted) return;
  if (!/\.(pdf|jpe?g)$/i.test(f.name) || f.size > MAX_FILE) return showFileError('File harus .pdf/.jpg dan maksimal 500KB');
  const data = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = r.onabort = () => reject(r.error);
    r.readAsDataURL(f);
  }).catch(() => null);
  if (!data) return showFileError('File gagal dibaca, silakan coba lagi');
  const prev = file;
  file = { name: f.name, size: f.size, type: f.type, data };
  if (!persist()) {
    file = prev; // jangan pasang file yang tidak ikut tersimpan
    return showFileError('Penyimpanan browser penuh. Gunakan file yang lebih kecil atau hapus data tahapan lain.');
  }
  if (fileUrl) URL.revokeObjectURL(fileUrl);
  fileUrl = URL.createObjectURL(f);
  renderEvidence();
}

const drop = $('#drop');
drop.addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('pick' in b.dataset) $('#fileInput').click();
  if ('view' in b.dataset) window.open(fileUrl, '_blank');
  if ('remove' in b.dataset) {
    if (!await confirmBox('Apakah Anda ingin menghapus file evidence?', 'File Evidence akan dihapus setelah Anda konfirmasi')) return;
    URL.revokeObjectURL(fileUrl);
    file = fileUrl = null;
    persist();
    renderEvidence();
  }
});
drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
drop.addEventListener('dragleave', () => drop.classList.remove('over'));
drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); setFile(e.dataTransfer.files[0]); });
// Kosongkan input setelah file selesai dibaca; mengosongkan lebih awal bisa membatalkan FileReader di Chrome.
$('#fileInput').addEventListener('change', async (e) => { await setFile(e.target.files[0]); e.target.value = ''; });
$('#evidenceView').addEventListener('click', (e) => { if (e.target.closest('[data-view]')) window.open(fileUrl, '_blank'); });

/* ---------- Konfirmasi & submit ---------- */
function renderKonfirmasi() {
  $('#answerList').innerHTML = QUESTIONS.map((q, i) => `
    <li><span class="num">${i + 1}</span><span class="q">${esc(q.text)}</span>
      ${answers[i] === null ? '<span class="empty">Belum dijawab</span>'
        : `<span class="option"><b>${LETTERS[answers[i]]}</b><span>${esc(q.options[answers[i]])}</span></span>`}</li>`).join('');
  $('#evidenceView').innerHTML = fileHTML(false);
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
    submitted = saved = false;
    persist();
    location.hash = 'soal-1';
    return;
  }
  if (!('submit' in b.dataset) || submitted) return;
  if (!await confirmBox('Apakah Anda yakin ingin mengirimkan penilaian?', 'Penilaian ini akan dikirimkan kepada Evaluator sebagai bahan pertimbangan rating.')) return;
  submitted = true;
  persist();
  renderKonfirmasi();
  // shortcut: halaman Survey belum dibuat, jadi "Menuju ke Survey" hanya menutup dialog.
  await ask($('#successDialog'));
});

/* ---------- Routing: #intro (kosong), #soal-N, #evidence, #konfirmasi ---------- */
function route() {
  const h = location.hash.slice(1);
  const n = Number(h.match(/^soal-(\d+)$/)?.[1]);
  let view = 'intro';
  if (n >= 1 && n <= QUESTIONS.length) { view = 'soal'; current = n - 1; }
  if (h === 'evidence') view = saved ? 'evidence' : 'soal';
  if (h === 'konfirmasi') view = saved && file ? 'konfirmasi' : (saved ? 'evidence' : 'soal');
  // Halaman yang belum boleh dibuka diarahkan ke langkah yang masih harus diselesaikan.
  if (h && view !== h.replace(/-\d+$/, '')) return location.replace(view === 'soal' ? `#soal-${QUESTIONS.length}` : `#${view}`);

  $('#viewIntro').hidden = view !== 'intro';
  $('#viewSoal').hidden = view !== 'soal';
  $('#viewEvidence').hidden = view !== 'evidence';
  $('#viewKonfirmasi').hidden = view !== 'konfirmasi';
  if (view === 'soal') renderSoal();
  if (view === 'evidence') renderEvidence();
  if (view === 'konfirmasi') renderKonfirmasi();
  syncSelfStep();
  scrollTo(0, 0);
}

const backToLast = (e) => { e.preventDefault(); location.hash = `soal-${QUESTIONS.length}`; };
$('#evBack').addEventListener('click', backToLast);
$('#evBack2').addEventListener('click', backToLast);

$('#toggleFlow').addEventListener('click', () => {
  const hidden = $('#stepper').classList.toggle('hidden');
  $('#toggleFlow i').innerHTML = ICONS[hidden ? 'mdi:eye' : 'mdi:eye-off'];
  $('#toggleFlow span').textContent = hidden ? 'Tampilkan Alur' : 'Sembunyikan Alur';
});

window.addEventListener('hashchange', route);
route();
