// Tampilan dari desain Figma section "Development Commitment" (frame "Desktop - 978"). Halaman hanya menampilkan data, tanpa isian.
// KPI Budget Holder (BUDGET di ../review.js, tipe jabatan pemilik data) melihat Talent Development di halaman ini (Figma Desktop 1839–1841):
// tab IDP Saya, tab IDP Subordinate (5 Evaluee per halaman, sticky note Figma) dan ringkasan Talent Development di footer.
// Data IDP, TEAM, OWNER & rumus teamDev ada di ../review.js.
const $ = (s) => document.querySelector(s);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
const num = (n) => n.toLocaleString('id-ID', { maximumFractionDigits: 2 }); // 44.75 → "44,75"
document.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});

const rowsHTML = (rows) => rows.map(([skor, plan, real], i) => {
  const [name, bobot] = IDP_PARTS[i];
  return `
  <div class="dev-row">
    <div class="dev-row-head">
      <div><span>${name} (${bobot}%)</span><span><b class="big">${skor}</b><small class="muted">/100 %</small></span></div>
      <div class="dev-chips"><span class="dev-chip">Plan <b>${plan}</b></span><span class="dev-chip">Real <b>${real}</b></span></div>
    </div>
    <div class="dev-bar" role="progressbar" aria-label="${name}" aria-valuenow="${skor}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, skor)}%"></i></div>
  </div>`;
}).join('');

// Donut: keliling lingkaran r=42 ≈ 263.9, panjang busur = persentase dari keliling.
const C = 2 * Math.PI * 42;
const totalHTML = (value, max) => {
  const pct = Math.min(100, value);
  return `
  <div class="donut">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" class="donut-track"/>
      <circle cx="50" cy="50" r="42" class="donut-fill" stroke-dasharray="${(C * pct) / 100} ${C}"/>
    </svg>
    <b>${pct}%</b>
  </div>
  <div class="dev-legend"><span class="dot"></span>Realisasi Development <span><b class="big">${value}</b><small class="muted">/${max} %</small></span></div>`;
};

// Kartu Hasil Realisasi (Figma 978 Development Commitment = 1839 Talent Development): IDP milik akun login, atau milik Heru di mode review.
const mine = IDP[TEAM[OWNER].nip];
document.body.classList.add('idp'); // ukuran mengikuti Figma (lihat .idp di style.css)
$('#devRows').innerHTML = rowsHTML(mine.rows);
$('#devTotal').innerHTML = totalHTML(mine.dev, PERF_MAX);

// Mode evaluator: halaman sama (read-only), hanya header evaluator.
if (REVIEW) { initReviewUI('Review Development Commitment'); $('#foot').hidden = false; }
else {
  // Evaluee (Figma 978 & 1839): header End Year People Review, kembali lewat tombol di footer.
  $('.crumbs').innerHTML = 'Pengelolaan Kinerja • PWTT • End Year People Review • <span>Evaluee</span>';
  $('.flow-pill').firstChild.textContent = 'Evaluee - End Year People Review ';
  $('.board-head .back').hidden = true;
  $('#idpFoot').hidden = false;
  $('#idpFoot').innerHTML = `<a class="btn-outline" href="${BACK.url}">${icon('tabler:arrow-left')}Kembali ke ${BACK.label}</a>`;
}
if (BUDGET) initTalentDev();

// Sama dengan pageNumbers di ../app.js: 1, sekitar halaman aktif (minimal sampai 3), dan halaman terakhir; celahnya jadi "…".
function pageNumbers(cur, last) {
  const nums = [1, last];
  for (let n = Math.max(1, cur - 1); n <= Math.min(last, Math.max(cur + 1, 3)); n++) nums.push(n);
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? ['…', n] : [n]));
}

function initTalentDev() {
  const SUB_PAGE = 5; // sticky note Figma: "1 Page isi 5 Evaluee"
  const { mine: myDev, avg, td } = teamDev(OWNER);
  let tab = 'me', page = 1;

  document.title = `${REVIEW ? 'Review ' : ''}Talent Development – People Review`;
  $('.head-title').textContent = 'Talent Development';
  $('#tdTabs').hidden = false;
  // Mode review: ringkasan di footer yang tampil (#foot, di kiri tombol Kembali ke Realisasi Target).
  (REVIEW ? $('#foot') : $('#idpFoot')).insertAdjacentHTML(REVIEW ? 'afterbegin' : 'beforeend', `
    <div class="td-stats">
      <div class="td-stat"><span class="td-num">${num(myDev)} <small>%</small></span>Realisasi Development Saya</div>
      <div class="td-stat"><span class="td-num">${num(avg)} <small>%</small></span>Rata-Rata Realisasi Development Subordinate</div>
      <div class="td-stat"><span class="td-num">${num(td)}<small class="muted">/100 %</small><span class="td-tipwrap">
          <button type="button" class="info-btn" id="tdInfo" aria-label="Info Talent Development" aria-controls="tdTip" aria-expanded="false">${icon('material-symbols:info-outline-rounded')}</button>
          <span class="tip td-tip" id="tdTip" role="tooltip" hidden><span><b>Talent Development</b><br>(Realisasi Development x 50%) + (Rata-rata Realisasi Development Subordinate x 50%)</span><button type="button" class="x" aria-label="Tutup info">${icon('material-symbols:close-rounded')}</button></span>
        </span></span>Talent Development</div>
    </div>`);

  function render() {
    document.querySelectorAll('#tdTabs [data-tab]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
    $('#tabMe').hidden = tab !== 'me';
    $('#tabSub').hidden = $('#tdSearchBox').hidden = tab !== 'sub';
    const q = $('#tdSearch').value.trim().toLowerCase();
    const list = TEAM[OWNER].subs.filter((nip) => !q || nip.includes(q) || IDP[nip].name.toLowerCase().includes(q));
    const pages = Math.max(1, Math.ceil(list.length / SUB_PAGE));
    page = Math.min(page, pages);
    $('#tabSub').innerHTML = list.slice((page - 1) * SUB_PAGE, page * SUB_PAGE).map((nip) => `
      <article class="td-card">
        <div class="td-card-head"><h2>Hasil Realisasi</h2><span class="td-who">${nip} • ${IDP[nip].name}</span></div>
        <div class="td-card-body"><div class="dev-main">${rowsHTML(IDP[nip].rows)}</div><div class="dev-side">${totalHTML(IDP[nip].dev, PERF_MAX)}</div></div>
      </article>`).join('') || '<p class="muted td-empty">Pekerja tidak ditemukan.</p>';
    $('#tdPager').hidden = tab !== 'sub' || pages === 1;
    $('#tdPager').innerHTML = `
      <button type="button" class="icon-btn" data-page="${page - 1}" aria-label="Halaman sebelumnya"${page === 1 ? ' disabled' : ''}>${icon('mdi:chevron-down', 'pg-prev')}</button>
      ${pageNumbers(page, pages).map((n) => n === '…' ? '<span class="pg-gap">…</span>'
        : `<button type="button" class="pg" data-page="${n}"${n === page ? ' aria-current="page"' : ''}>${n}</button>`).join('')}
      <button type="button" class="icon-btn" data-page="${page + 1}" aria-label="Halaman berikutnya"${page === pages ? ' disabled' : ''}>${icon('mdi:chevron-down', 'pg-next')}</button>`;
  }
  $('#tdTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (b) { tab = b.dataset.tab; render(); }
  });
  $('#tdSearch').addEventListener('input', () => { page = 1; render(); });
  $('#tdPager').addEventListener('click', (e) => {
    const b = e.target.closest('[data-page]');
    if (b && !b.disabled) { page = +b.dataset.page; render(); $('#tabSub').scrollTop = 0; }
  });
  render();

  // Tooltip rumus (Figma 1841): buka lewat ikon info, tutup lewat ×, klik di luar, atau Esc.
  const tip = $('#tdTip'), info = $('#tdInfo');
  const setTip = (open) => { tip.hidden = !open; info.setAttribute('aria-expanded', open); };
  info.addEventListener('click', () => setTip(tip.hidden));
  tip.querySelector('.x').addEventListener('click', () => setTip(false));
  document.addEventListener('click', (e) => { if (!e.target.closest('.td-tipwrap')) setTip(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setTip(false); });
}

// Tombol Tampilkan/Sembunyikan Alur: lihat ../profile.js (pilihan diingat lintas halaman).
