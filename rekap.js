// Dari desain Figma section "Rekapitulasi Sintesis Evaluator - Tanpa ada tabel distribusi & kalibrasi - Alt 2 - POV Evaluator" (Redesign-Evaluator).
// Rute: #pwtt-rekap = kartu evaluee + Rating Reward (Desktop 1624–1648, 1633–1646, 1644); #pwtt-approval = Approval Chairman (1789–1797).
// Status setelah submit: Menunggu Persetujuan (1631), Sudah Disetujui (1773), Tidak Disetujui + pesan Chairman (1641–1642).
// Memakai $, esc, icon, ME, renderPager dari app.js.

// shortcut: angka Realisasi IG, Behavior Survey & Rating Development masih contoh Figma; ganti dengan hasil perhitungan saat ada sumber datanya.
const RK_DATA = {
  19050193: { fungsi: 'Penunjang Bisnis • Human Capital • Performance & Competency Mgt', ig: 106, bs: 106, dev: 'A+' },
  752579: { fungsi: 'Penunjang Bisnis • Internal Audit • Audit Relation', ig: 98, bs: 102, dev: 'B' },
  754933: { fungsi: 'Penunjang Bisnis • Human Capital • Performance & Competency Mgt', ig: 104, bs: 100, dev: 'A' },
  1905416: { fungsi: 'Penunjang Bisnis • Human Capital • Performance & Competency Mgt', ig: 108, bs: 104, dev: 'A' },
};
const RK_LIST = ME.evaluees.map((p) => ({ ...p, ...RK_DATA[p.nip] }));
const DEV = ['A+', 'A', 'B', 'C', 'D'];
const REWARD = ['8.5x', '7.5x', '6.5x', '5.5x', '4.5x'];
const SORTS = [
  ['fungsi', 1, 'Fungsi dari alfabet awal (A-Z)'], ['fungsi', -1, 'Fungsi dari alfabet akhir (Z-A)'],
  ['title', 1, 'Jabatan dari alfabet awal (A-Z)'], ['title', -1, 'Jabatan dari alfabet akhir (Z-A)'],
  ['name', 1, 'Nama Pekerja dari alfabet awal (A-Z)'], ['name', -1, 'Nama Pekerja dari alfabet akhir (Z-A)'],
];
const FILTERS = [{ id: 'dev', label: 'Rating Development', opts: DEV }, { id: 'reward', label: 'Rating Reward', opts: REWARD }];
const RK_PAGE = 8; // Figma: 4 kolom × 2 baris

// shortcut: tanpa backend, Rating Reward & status approval disimpan di localStorage browser ini; ganti dengan API saat ada.
// Keputusan Chairman (persetujuan.js) ditulis ke data yang sama: status approved/rejected + reason.
const rkLoad = (user) => { try { return JSON.parse(localStorage.getItem(`pr-rekap-${user}`)); } catch { return null; } };
const rkSaveOf = (user, data) => { try { localStorage.setItem(`pr-rekap-${user}`, JSON.stringify(data)); } catch {} };
const rk = rkLoad(window.PR_USER) || { rewards: {}, status: null };
const rkPersist = () => rkSaveOf(window.PR_USER, rk);

let rkPage = 1;
let sortIdx = null, sortDraft = null;
const filter = { dev: new Set(), reward: new Set() };
let filterDraft, filterTab = 'dev';
const locked = () => rk.status === 'pending' || rk.status === 'approved';
const allRated = () => RK_LIST.every((p) => rk.rewards[p.nip]);
const plain = (s) => new DOMParser().parseFromString(s, 'text/html').body.textContent; // title dari app.js sudah berupa HTML

function rkVisible() {
  const q = $('#rkSearch').value.trim().toLowerCase();
  const list = RK_LIST.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.nip.includes(q))
    && (!filter.dev.size || filter.dev.has(p.dev))
    && (!filter.reward.size || filter.reward.has(rk.rewards[p.nip])));
  if (sortIdx === null) return list;
  const [key, dir] = SORTS[sortIdx];
  return list.sort((a, b) => dir * plain(a[key]).localeCompare(plain(b[key]), 'id'));
}

const rkCard = (p) => `
  <div class="box rk-card">
    <p class="rk-name"><b>${esc(p.name)}</b> • ${p.nip}</p>
    <small class="rk-fungsi">${esc(p.fungsi)}</small>
    <b class="rk-title">${p.title}</b>
    <dl class="rk-stats">
      <dt>Realisasi Individual Goal</dt><dd>${p.ig}<small>%</small></dd>
      <dt>Behavior Survey</dt><dd>${p.bs}<small>%</small></dd>
      <dt>Rating Development
        <button type="button" class="icon-btn rk-info" data-tip aria-label="Info Rating Development" aria-expanded="false">${icon('material-symbols:info-outline-rounded')}</button>
        <span class="rk-tip" role="tooltip" hidden>Penilaian ini berdasarkan hasil perhitungan dari Realisasi Individual Goal dan Behavior Survey<button type="button" class="icon-btn" data-tip-close aria-label="Tutup">${icon('material-symbols:close-rounded')}</button></span>
      </dt><dd>${p.dev}</dd>
    </dl>
    <label class="rk-reward">Rating Reward
      ${locked() ? `<span class="rk-locked">${rk.rewards[p.nip] || '-'}</span>`
        : `<select data-nip="${p.nip}"><option value="">Pilih Rating</option>${REWARD.map((r) => `<option${rk.rewards[p.nip] === r ? ' selected' : ''}>${r}</option>`).join('')}</select>`}
    </label>
    <button type="button" class="btn-outline wide" data-missing>${icon('material-symbols:download-rounded')}Self Review Evidence</button>
  </div>`;

function renderRekap() {
  const list = rkVisible();
  const pages = Math.max(1, Math.ceil(list.length / RK_PAGE));
  rkPage = Math.min(rkPage, pages);
  $('#rkGrid').innerHTML = list.length ? list.slice((rkPage - 1) * RK_PAGE, rkPage * RK_PAGE).map(rkCard).join('')
    : '<p class="rk-empty">Data pekerja tidak ditemukan</p>';
  renderPager($('#rkPager'), rkPage, pages);

  const st = { pending: ['chip-warn', 'Menunggu Persetujuan'], approved: ['chip-ok', 'Sudah Disetujui'], rejected: ['chip-bad', 'Tidak Disetujui'] }[rk.status];
  $('#rkStatus').innerHTML = st ? `
    ${rk.status === 'approved' ? `<a class="btn rk-ba" href="#pwtt-berita-acara">${icon('mdi:file-report-outline')}Buat Berita Acara</a>`
      : `<button type="button" class="btn rk-ba" disabled>${icon('mdi:file-report-outline')}Buat Berita Acara</button>`}
    ${rk.status === 'rejected' ? '<button type="button" class="btn-outline" id="msgBtn">Lihat Pesan Chairman</button>' : ''}
    <span class="chip ${st[0]}">${st[1]}</span>` : '';
  // Figma: sebelum dinilai semua Simpan = tombol utama; sesudahnya Simpan jadi outline & Approval Chairman menyala.
  // Setelah submit (menunggu/disetujui): rating terkunci, Simpan diganti Cetak Hasil Penilaian.
  $('#rkSave').hidden = locked(); $('#rkPrint').hidden = !locked();
  $('#rkSave').className = allRated() ? 'btn-outline' : 'btn';
  $('#rkNext').disabled = locked() || !allRated();
}

$('#rkSearch').addEventListener('input', () => { rkPage = 1; renderRekap(); });
$('#rkPager').addEventListener('click', (e) => {
  const b = e.target.closest('[data-page]');
  if (b && !b.disabled) { rkPage = +b.dataset.page; renderRekap(); }
});
$('#rkGrid').addEventListener('change', (e) => {
  const sel = e.target.closest('select[data-nip]');
  if (!sel) return;
  if (sel.value) rk.rewards[sel.dataset.nip] = sel.value; else delete rk.rewards[sel.dataset.nip];
  renderRekap();
});
$('#rkGrid').addEventListener('click', (e) => {
  const open = e.target.closest('[data-tip]'), close = e.target.closest('[data-tip-close]');
  if (!open && !close) return;
  const dt = e.target.closest('dt');
  const show = !!open && dt.querySelector('.rk-tip').hidden;
  document.querySelectorAll('.rk-tip').forEach((t) => { t.hidden = true; });
  document.querySelectorAll('[data-tip]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  dt.querySelector('.rk-tip').hidden = !show;
  dt.querySelector('[data-tip]').setAttribute('aria-expanded', show);
});
$('#rkSave').addEventListener('click', () => { rkPersist(); $('#savedDlg').showModal(); });
$('#rkNext').addEventListener('click', () => { rkPersist(); location.hash = '#pwtt-approval'; });
$('#rkStatus').addEventListener('click', (e) => {
  if (!e.target.closest('#msgBtn')) return;
  $('#msgName').textContent = plain(ME.evaluator.name);
  $('#msgNip').textContent = ME.evaluator.nip;
  $('#msgText').textContent = rk.reason || 'Chairman tidak menuliskan alasan.';
  $('#msgDlg').showModal();
});

// Popover Sortir & Filter: pilihan baru berlaku setelah Terapkan; tutup tanpa Terapkan = batal.
function rkPopover(btn, pop, onOpen) {
  const set = (open) => {
    if (open) onOpen();
    pop.hidden = !open;
    btn.setAttribute('aria-expanded', open);
  };
  btn.addEventListener('click', () => set(pop.hidden));
  document.addEventListener('click', (e) => { if (!pop.hidden && e.target.isConnected && !pop.contains(e.target) && !btn.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  return set;
}
const optRow = (val, label, on) => `<button type="button" role="option" class="rk-opt" data-v="${esc(val)}" aria-selected="${on}">${esc(label)}${on ? icon('material-symbols:check-rounded') : ''}</button>`;

const renderSort = () => { $('#sortOpts').innerHTML = SORTS.map((s, i) => optRow(i, s[2], i === sortDraft)).join(''); };
const setSort = rkPopover($('#sortBtn'), $('#sortPop'), () => { sortDraft = sortIdx; renderSort(); });
$('#sortOpts').addEventListener('click', (e) => {
  const o = e.target.closest('[data-v]');
  if (o) { sortDraft = +o.dataset.v === sortDraft ? null : +o.dataset.v; renderSort(); }
});
$('#sortApply').addEventListener('click', () => { sortIdx = sortDraft; rkPage = 1; setSort(false); renderRekap(); });

function renderFilter() {
  $('#filterTabs').innerHTML = FILTERS.map((f) => `<button type="button" role="tab" class="ntab" data-ftab="${f.id}" aria-selected="${f.id === filterTab}">${f.label}${filterDraft[f.id].size ? `<span class="count">${filterDraft[f.id].size}</span>` : ''}</button>`).join('');
  const q = $('#filterSearch').value.trim().toLowerCase();
  const opts = FILTERS.find((f) => f.id === filterTab).opts.filter((o) => o.toLowerCase().includes(q));
  $('#filterOpts').innerHTML = opts.map((o) => optRow(o, o, filterDraft[filterTab].has(o))).join('') || '<p class="muted rk-none">Pilihan tidak ditemukan</p>';
}
const setFilter = rkPopover($('#filterBtn'), $('#filterPop'), () => {
  filterDraft = { dev: new Set(filter.dev), reward: new Set(filter.reward) };
  $('#filterSearch').value = '';
  renderFilter();
});
$('#filterTabs').addEventListener('click', (e) => {
  const t = e.target.closest('[data-ftab]');
  if (t) { filterTab = t.dataset.ftab; $('#filterSearch').value = ''; renderFilter(); }
});
$('#filterSearch').addEventListener('input', renderFilter);
$('#filterOpts').addEventListener('click', (e) => {
  const o = e.target.closest('[data-v]');
  if (!o) return;
  const set = filterDraft[filterTab];
  set.has(o.dataset.v) ? set.delete(o.dataset.v) : set.add(o.dataset.v);
  renderFilter();
});
$('#filterClear').addEventListener('click', () => { filterDraft.dev.clear(); filterDraft.reward.clear(); renderFilter(); });
$('#filterApply').addEventListener('click', () => {
  FILTERS.forEach((f) => { filter[f.id] = filterDraft[f.id]; });
  $('#filterBtn').classList.toggle('on', filter.dev.size + filter.reward.size > 0);
  rkPage = 1; setFilter(false); renderRekap();
});

// Approval Chairman: Nama Atasan hanya untuk "Approval oleh Atasan Evaluator".
const needBoss = () => $('#apvType').value === 'atasan';
function apvValid() {
  $('#apvBoss').disabled = !needBoss();
  $('#apvSubmit').disabled = !$('#apvType').value || (needBoss() && !$('#apvBoss').value) || !$('#apvAgree').checked;
}
$('#apvForm').addEventListener('change', apvValid);
$('#apvForm').addEventListener('submit', (e) => e.preventDefault());
$('#apvSubmit').addEventListener('click', () => $('#confirmDlg').showModal());
$('#confirmDlg form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'yes') return;
  rk.status = 'pending';
  delete rk.reason; // alasan penolakan sebelumnya tidak berlaku untuk pengajuan ulang
  rk.approval = { type: $('#apvType').value, boss: needBoss() ? $('#apvBoss').value : null };
  rkPersist();
  setTimeout(() => $('#sentDlg').showModal()); // tunggu dialog konfirmasi selesai menutup
});
$('#sentDlg').addEventListener('close', () => { location.hash = '#pwtt-rekap'; });

function renderList() {
  const q = $('#listSearch').value.trim().toLowerCase();
  $('#listRows').innerHTML = RK_LIST.filter((p) => !q || p.name.toLowerCase().includes(q) || p.nip.includes(q))
    .map((p) => `<tr><td>${esc(p.name)}</td><td>${p.nip}</td><td>${p.bs} %</td><td>${p.ig} %</td><td>${p.dev}</td><td>${rk.rewards[p.nip] || '-'}</td></tr>`).join('')
    || '<tr><td colspan="6" class="muted">Data pekerja tidak ditemukan</td></tr>';
}
$('#apvList').addEventListener('click', () => { $('#listSearch').value = ''; renderList(); $('#listDlg').showModal(); });
$('#listSearch').addEventListener('input', renderList);
$('#listClose').addEventListener('click', () => $('#listDlg').close());
// Klik di backdrop menutup dialog informasi (bukan dialog konfirmasi).
['#savedDlg', '#listDlg', '#msgDlg'].forEach((id) => $(id).addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }));

function rkRoute() {
  if (location.hash === '#pwtt-rekap') renderRekap();
  if (location.hash === '#pwtt-approval') {
    // Approval hanya bisa dibuka bila semua sudah dinilai dan belum dikirim.
    if (locked() || !allRated()) { location.hash = '#pwtt-rekap'; return; }
    $('#apvForm').reset();
    $('#apvForm').querySelectorAll('select').forEach((s) => s.dispatchEvent(new Event('change', { bubbles: true })));
    apvValid();
  }
}
window.addEventListener('hashchange', rkRoute);
rkRoute();
