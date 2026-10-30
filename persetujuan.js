// Dari desain Figma section "Rekapitulasi Sintesis Evaluator - Tanpa ada tabel distribusi & kalibrasi - Alt 2 - POV Chairman" (Redesign-Evaluator).
// Rute: #pwtt-persetujuan = kelompok per Evaluator + Setuju / Tidak Setuju (Desktop 1667–1676, 1779), khusus akun Chairman;
// #pwtt-berita-acara = Pembuatan Berita Acara (Chairman 1777–1778, Evaluator 1774–1776) setelah kelompok disetujui.
// Memakai $, esc, icon, ME, PEOPLE dari app.js dan RK_DATA, rkLoad, rkSaveOf, plain dari rekap.js.

const userOf = (p) => Object.keys(PEOPLE).find((id) => PEOPLE[id] === p);
// Kelompok = Evaluator yang atasannya Chairman ini dan sudah mengajukan Rekapitulasi (status terisi).
const groups = () => Object.entries(PEOPLE)
  .filter(([, p]) => p.evaluator?.nip === ME.nip && rkLoad(userOf(p))?.status)
  .map(([id, p]) => ({ id, p, rk: rkLoad(id), list: p.evaluees.map((e) => ({ ...e, ...RK_DATA[e.nip] })) }));
const PJ_CHIP = { pending: ['chip-warn', 'Belum Disetujui'], approved: ['chip-ok', 'Disetujui'], rejected: ['chip-bad', 'Tidak Disetujui'] };
const BA_TIP = 'Berita Acara dapat dibuat apabila semua kelompok di bawah list Evaluator sudah disetujui';
const pjOpen = new Set();
let pjAction = null; // { id, kind: 'setuju' | 'tolak' } selama dialog terbuka

const evalTable = (list, rewards) => `
  <table class="rk-table pj-table">
    <thead><tr><th>Nomor Pekerja</th><th>Nama Pekerja</th><th>Jabatan</th><th>Individual Goal</th><th>Behavior Survey</th><th>Rating Development</th><th>Rating Reward</th></tr></thead>
    <tbody>${list.map((e) => `<tr><td>${e.nip}</td><td>${esc(e.name)}</td><td>${e.title}</td><td>${e.ig} %</td><td>${e.bs} %</td><td>${e.dev}</td><td>${rewards[e.nip] || '-'}</td></tr>`).join('')}</tbody>
  </table>`;

function pjGroup(g, i) {
  const st = g.rk.status, open = pjOpen.has(g.id);
  const decide = st === 'pending'
    ? `<button type="button" class="btn-outline danger" data-act="tolak">${icon('material-symbols:close-rounded')}Tidak Setuju</button>
       <button type="button" class="btn-outline ok" data-act="setuju">${icon('material-symbols:check-rounded')}Setuju</button>`
    // Figma 1676: setelah dikembalikan untuk revisi, Ubah Persetujuan nonaktif sampai Evaluator mengajukan ulang.
    : `<button type="button" class="btn-outline danger" data-act="ubah"${st === 'rejected' ? ' disabled' : ''}>${icon('material-symbols:close-rounded')}Ubah Persetujuan</button>`;
  return `
  <div class="box pj-group" data-u="${g.id}">
    <div class="pj-head">
      <div><b class="name">${esc(g.p.name)}</b><small>${g.p.nip} • ${g.p.title}</small></div>
      <span class="chip ${PJ_CHIP[st][0]}">${PJ_CHIP[st][1]}</span>
      ${st === 'approved' ? `<a class="btn" href="#pwtt-berita-acara" data-ba="${g.id}">${icon('mdi:file-report-outline')}Buat Berita Acara</a>`
        : `<span class="pj-tipwrap" data-tip="${BA_TIP}"><button type="button" class="btn" disabled>${icon('mdi:file-report-outline')}Buat Berita Acara</button></span>`}
      <button type="button" class="pj-toggle" data-toggle aria-expanded="${open}">Evaluator ${i + 1}${icon('mdi:chevron-down')}</button>
    </div>
    <div class="pj-detail"${open ? '' : ' hidden'}>
      <div class="rk-table-wrap">${evalTable(g.list, g.rk.rewards)}</div>
      <div class="pj-decide"><b>Keputusan Anda</b>${decide}</div>
    </div>
  </div>`;
}

function renderPersetujuan() {
  const q = $('#pjSearch').value.trim().toLowerCase();
  const hit = (n, nip) => n.toLowerCase().includes(q) || nip.includes(q);
  const list = groups().filter((g) => !q || hit(g.p.name, g.p.nip) || g.list.some((e) => hit(e.name, e.nip)));
  $('#pjList').innerHTML = list.map(pjGroup).join('')
    || `<p class="rk-empty">${q ? 'Data pekerja tidak ditemukan' : 'Belum ada Rekapitulasi Sintesis yang diajukan Evaluator'}</p>`;
}

$('#pjSearch').addEventListener('input', renderPersetujuan);
$('#pjList').addEventListener('click', (e) => {
  const grp = e.target.closest('[data-u]');
  if (!grp) return;
  const id = grp.dataset.u;
  if (e.target.closest('[data-ba]')) { try { sessionStorage.setItem('pr-ba-for', id); } catch {} return; }
  if (e.target.closest('[data-toggle]')) { pjOpen.has(id) ? pjOpen.delete(id) : pjOpen.add(id); renderPersetujuan(); return; }
  const act = e.target.closest('[data-act]')?.dataset.act;
  if (act === 'ubah') { decide(id, 'pending'); return; }
  if (!act) return;
  pjAction = { id, kind: act };
  const setuju = act === 'setuju';
  $('#pjConfirmTitle').textContent = setuju ? 'Anda yakin untuk menyetujui hasil penilaian dari Evaluator ini?' : 'Anda yakin untuk tidak menyetujui hasil penilaian dari Evaluator ini?';
  $('#pjConfirmText').textContent = setuju ? 'Pastikan Anda sudah yakin dari penilaian pekerja sudah benar' : 'Penilaian ini akan dikembalikan kepada Evaluator yang bersangkutan untuk direvisi';
  // Figma: tombol utama mengikuti arah aman — Setuju menonjolkan "Ya", Tidak Setuju menonjolkan "Tidak".
  $('#pjYes').className = setuju ? 'btn' : 'btn-outline danger';
  $('#pjYes').textContent = setuju ? 'Ya, ajukan persetujuan' : 'Ya, ajukan revisi';
  $('#pjNo').className = setuju ? 'btn-outline' : 'btn';
  $('#pjNo').textContent = setuju ? 'Tidak, Saya Ingin Cek Kembali' : 'Tidak';
  $('#pjConfirmDlg').showModal();
});

function decide(id, status, reason) {
  const data = rkLoad(id);
  data.status = status;
  if (reason !== undefined) data.reason = reason; else delete data.reason;
  rkSaveOf(id, data);
  renderPersetujuan();
}
function done(title) { $('#pjDoneTitle').textContent = title; $('#pjDoneDlg').showModal(); }
$('#pjConfirmDlg').addEventListener('close', () => {
  if ($('#pjConfirmDlg').returnValue !== 'yes' || !pjAction) return;
  if (pjAction.kind === 'setuju') { decide(pjAction.id, 'approved'); done('Penilaian sudah disetujui!'); return; }
  $('#pjReason').value = ''; $('#pjCount').textContent = '0/200';
  $('#pjReasonDlg').showModal();
});
$('#pjReason').addEventListener('input', () => { $('#pjCount').textContent = `${$('#pjReason').value.length}/200`; });
$('#pjReasonDlg').addEventListener('close', () => {
  if ($('#pjReasonDlg').returnValue !== 'send') return;
  decide(pjAction.id, 'rejected', $('#pjReason').value.trim());
  done('Revisi hasil penilaian Evaluator sudah terkirim!');
});
// returnValue dialog lama terbawa bila ditutup lewat Esc; kosongkan setiap kali dibuka.
['#pjConfirmDlg', '#pjReasonDlg'].forEach((id) => $(id).addEventListener('cancel', () => { $(id).returnValue = ''; }));

// Berita Acara: satu dokumen per kelompok (Evaluator). Penandatangan = Chairman + Evaluator kelompok itu.
// shortcut: tanda tangan (stempel / gambar unggahan) disimpan di localStorage browser ini; ganti dengan API e-sign saat ada.
const baKey = (u) => `pr-ba-${u}`;
const baLoad = (u) => { try { return JSON.parse(localStorage.getItem(baKey(u))) || {}; } catch { return {}; } };
let baFor = null, baPage = 0, baUpload = false;
const signed = (s) => !!(s?.stamp || s?.img);
const signers = (u) => [userOf(Object.values(PEOPLE).find((p) => p.nip === PEOPLE[u].evaluator.nip)), u].filter(Boolean);
const ROLE = ['Chairman', 'Evaluator1']; // urutan sama dengan signers()
const stampHTML = (p) => `<div class="ba-stamp"><small>PERTAMINA</small><span>${plain(p.title)}</span><b>${esc(p.name.toUpperCase())}</b></div>`;
const sigHTML = (s, p) => (s?.img ? `<img src="${s.img}" alt="Tanda tangan ${esc(p.name)}">` : s?.stamp ? stampHTML(p) : '');

function baPages(u) {
  const sig = baLoad(u), rk = rkLoad(u);
  const d = new Date(), f = (o) => d.toLocaleDateString('id-ID', o);
  const rows = signers(u).map((id, i) => {
    const p = PEOPLE[id];
    return `<tr><td><b>${ROLE[i]}</b></td><td>${esc(p.name)}</td><td>${p.title}</td><td class="ba-sig">${sigHTML(sig[id], p) || '…………………………'}</td></tr>`;
  }).join('');
  const blank = (r) => `<tr><td>${r}</td><td>…………………………</td><td>…………………………</td><td class="ba-sig">…………………………</td></tr>`;
  const head = '<header class="ba-brand">PERTAMINA</header>';
  return [`${head}
    <h1>BERITA ACARA</h1>
    <h2>TENTANG<br>PELAKSANAAN DISKUSI KALIBRASI<br>PERIODE END OF YEAR PEOPLE REVIEW (EYPR) TAHUN ${d.getFullYear()}</h2>
    <p>Pada hari ini ${f({ weekday: 'long' })}, Tanggal ${d.getDate()} Bulan ${f({ month: 'long' })} Tahun ${d.getFullYear()}, telah dilakukan Diskusi People Review (Kalibrasi) dan telah diperoleh rating kinerja akhir untuk tiap Pekerja dalam kelompok penilaiannya sebagaimana terlampir.</p>
    <p>Demikian Berita Acara ini dibuat dan disetujui Peserta Diskusi People Review untuk dipergunakan sesuai ketentuan.</p>
    <table class="ba-roles"><thead><tr><th>Peran</th><th>Nama</th><th>Jabatan</th><th>Tanda Tangan</th></tr></thead>
      <tbody>${rows}${blank('Lead<br>Facilitator')}${blank('Assisting<br>Facilitator')}</tbody></table>`,
  `${head}
    <h1>LAMPIRAN</h1>
    <h2>HASIL RATING KINERJA AKHIR<br>KELOMPOK PENILAIAN ${esc(PEOPLE[u].name.toUpperCase())}</h2>
    ${evalTable(PEOPLE[u].evaluees.map((e) => ({ ...e, ...RK_DATA[e.nip] })), rk.rewards)}`];
}

function renderBA() {
  const u = baFor, sig = baLoad(u), me = window.PR_USER;
  const pages = baPages(u);
  baPage = Math.min(baPage, pages.length - 1);
  $('#baDoc').innerHTML = pages.map((h, i) => `<section class="ba-page${i === baPage ? '' : ' off'}">${h}</section>`).join('');
  $('#baPage').textContent = `${baPage + 1} / ${pages.length}`;
  $('#baPrev').disabled = baPage === 0; $('#baNext').disabled = baPage === pages.length - 1;
  $('#baEvaluator').textContent = `Evaluator ${PEOPLE[u].name} (${PEOPLE[u].nip})`;
  $('#baStatus').innerHTML = signers(u).map((id) => `
    <div class="ba-person"><img class="avatar" src="assets/${id === 'oka' ? 'avatar-oka.png' : 'avatar.png'}" alt="" width="32" height="32">
      <div><b>${esc(PEOPLE[id].name)}</b><small>${PEOPLE[id].nip}</small></div>
      ${signed(sig[id]) ? '<span class="chip chip-ok">Sudah Disetujui</span>' : '<span class="chip chip-warn">Menunggu Tanda Tangan</span>'}</div>`).join('');
  const mine = sig[me] || {}, isSigner = signers(u).includes(me);
  $('#baSign').previousElementSibling.hidden = $('#baSign').hidden = !isSigner;
  // Figma: dua cara tanda tangan — stempel nama (dibuat sistem) dan gambar tanda tangan (diunggah).
  $('#baSign').innerHTML = [['stamp', mine.stamp ? stampHTML(PEOPLE[me]) : '<span class="muted">Belum ada stempel tanda tangan</span>'],
    ['img', mine.img ? `<img src="${mine.img}" alt="Tanda tangan Anda">` : '<span class="muted">Belum ada gambar tanda tangan</span>']]
    .map(([k, view]) => `<div class="ba-slot"><div class="ba-slot-view">${view}</div>
      <button type="button" class="btn-outline" data-add="${k}"${mine[k] ? ' disabled' : ''}>${icon('ic:round-plus')}Tambah Tanda Tangan</button>
      <button type="button" class="btn-outline danger" data-del="${k}"${mine[k] ? '' : ' disabled'}>${icon('mdi:trash')}Hapus Tanda Tangan</button></div>`).join('');
  $('#baPrint').disabled = !signers(u).every((id) => signed(sig[id]));
}
function baSet(k, v) {
  const sig = baLoad(baFor);
  sig[window.PR_USER] = { ...sig[window.PR_USER], [k]: v };
  if (!v) delete sig[window.PR_USER][k];
  try { localStorage.setItem(baKey(baFor), JSON.stringify(sig)); } catch { alert('Tanda tangan gagal disimpan: penyimpanan browser penuh.'); }
  renderBA();
}
$('#baSign').addEventListener('click', (e) => {
  const add = e.target.closest('[data-add]')?.dataset.add, del = e.target.closest('[data-del]')?.dataset.del;
  if (add === 'stamp') baSet('stamp', true);
  if (add === 'img') $('#baFile').click();
  if (del) baSet(del, null);
});
$('#baFile').addEventListener('change', () => {
  const file = $('#baFile').files[0];
  $('#baFile').value = '';
  if (!file) return;
  if (!file.type.startsWith('image/')) { alert('File tanda tangan harus berupa gambar.'); return; }
  if (file.size > 1024 * 1024) { alert('Ukuran gambar tanda tangan maksimal 1 MB.'); return; }
  const r = new FileReader();
  r.onload = () => baSet('img', r.result);
  r.readAsDataURL(file);
});
$('#baPrev').addEventListener('click', () => { baPage--; renderBA(); });
$('#baNext').addEventListener('click', () => { baPage++; renderBA(); });
$('#baPrint').addEventListener('click', () => window.print());

function pjRoute() {
  if (location.hash === '#pwtt-persetujuan') renderPersetujuan();
  if (location.hash !== '#pwtt-berita-acara') return;
  // Chairman membuka kelompok yang dipilih (data-ba); Evaluator membuka kelompoknya sendiri.
  let pick = null;
  try { pick = sessionStorage.getItem('pr-ba-for'); } catch {}
  baFor = ME.chairman ? (groups().find((g) => g.id === pick && g.rk.status === 'approved') || groups().find((g) => g.rk.status === 'approved'))?.id : window.PR_USER;
  if (!baFor || rkLoad(baFor)?.status !== 'approved') { location.hash = ME.chairman ? '#pwtt-persetujuan' : '#pwtt-rekap'; return; }
  $('#baBack').href = ME.chairman ? '#pwtt-persetujuan' : '#pwtt-rekap';
  baPage = 0;
  renderBA();
}
window.addEventListener('hashchange', pjRoute);
pjRoute();
