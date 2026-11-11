// Dialog Day bersama halaman Sintesis Evaluator Final (Evaluator) dan CoPI Feedback (Evaluee):
// isi kolom Hasil Kinerja + Diskusi Dialog Day. Butuh ICONS dari icons.js halaman; nama & foto dari ../profile.js (PR_USERS).
const DD_ROOT = new URL('.', document.currentScript.src).href; // folder root, untuk foto profil di assets/

// shortcut: isi tabel & list masih contoh (Figma "xxx"); ganti dengan hasil Rekapitulasi Sintesis Evaluator saat halamannya ada.
// Figma 1823: Individual Goal = Jenis, Weighted Performance, Evidence — satu baris per Jenis, sampai Development Commitment.
// Nilai = Σ weighted performance item per Jenis, ditulis halaman Realisasi Target (saveSummary di Individual Goal/app.js).
// Cadangan bila halaman itu belum pernah dibuka: data demo Realisasi Target (semua item performa 110%).
// Jenis ikut tipe jabatan Heru (kartu Data Diri di Beranda; bawaan Non-Budget Holder), sama dengan Realisasi Target:
// Budget Holder → KPI Bisnis/Fungsi 80% (ganti Cascading KPI & Project Control), Talent Development 7%, Community Involvement 5%.
function renderHasilKinerja() {
  const bh = (() => { try { return localStorage.getItem('pr-jabatan-heru') === 'bh'; } catch { return false; } })();
  const GOAL_DEMO = bh
    ? { 'KPI Bisnis/Fungsi': 88, Extramiles: 0, 'HSSE Objective': 8.8, 'Community Involvement': 5.5, 'Talent Development': 7.7 }
    : { 'Cascading KPI': 77, 'Project Control': 11, Extramiles: 0, 'HSSE Objective': 8.8, 'Community Involvement': 7.7, 'Development Commitment': 5.5 };
  const summary = (() => { try { return JSON.parse(localStorage.getItem('pr-realisasi-summary-heru')); } catch { return null; } })() || GOAL_DEMO;
  const goals = Object.keys(GOAL_DEMO).map((jenis) => [jenis, summary[jenis] || 0]);
  const STRENGTHS = ['Komunikasi efektif dengan tim lintas fungsi', 'Analisis data kinerja yang tajam'];
  const GROWTH = ['Manajemen waktu dan prioritas proyek', 'Delegasi pekerjaan ke anggota tim'];
  const BES = [['Behaviour Survey 360°', '4 Pekerja', '90%', '50%', '45%'], ['Behaviour Survey Evaluator', '1 Pekerja', '100%', '50%', '50%']];
  const RATINGS = [['Rating Development', '7'], ['Rating Rewards', '5.5x']];
  const q = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const pct = (n) => `${(+n.toFixed(2)).toLocaleString('id-ID')}%`;
  const rows = (list) => list.map((cells) => `<tr>${[cells].flat().map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');
  q('#goalRows').innerHTML = goals.map(([jenis, wp]) => `<tr><td>${esc(jenis)}</td><td>${pct(wp)}</td>
    <td><button type="button" class="btn-outline" data-file="${esc(jenis)}"><i class="ico">${ICONS['mdi:eye']}</i>Lihat File</button></td></tr>`).join('');
  q('#goalTotal').textContent = (+goals.reduce((t, [, wp]) => t + wp, 0).toFixed(2)).toLocaleString('id-ID');
  q('#besRows').innerHTML = rows(BES);
  q('#strengthRows').innerHTML = rows(STRENGTHS);
  q('#growRows').innerHTML = rows(GROWTH);
  q('#ratingRows').innerHTML = rows(RATINGS);
  q('#goalRows').addEventListener('click', (e) => {
    const name = e.target.closest('[data-file]')?.dataset.file;
    if (name) window.open(URL.createObjectURL(new Blob([`Evidence: ${name} (contoh prototype)`], { type: 'text/plain' })), '_blank');
  });
}

// Figma Evaluee "CoPI Feedback + Survey" Desktop 1828/1829: tanggapan Evaluee & Evaluator dalam satu utas per Evaluee.
// shortcut: utas disimpan di localStorage browser ini (pr-diskusi-<evaluee>); ganti dengan API saat ada.
const ddAgo = (t, now = Date.now()) => {
  const s = Math.max(0, (now - t) / 1000);
  const [unit, size] = [['day', 86400], ['hour', 3600], ['minute', 60]].find(([, n]) => s >= n) || ['second', 1];
  return new Intl.RelativeTimeFormat('id', { numeric: 'auto' }).format(-Math.floor(s / size), unit);
};
console.assert(ddAgo(0, 5 * 3600e3) === '5 jam yang lalu' && ddAgo(0, 0) === 'sekarang', 'waktu relatif seperti Figma "5 jam yang lalu"');
function initDiskusi(btn, evaluee) {
  const key = `pr-diskusi-${evaluee}`;
  const me = (() => { try { return sessionStorage.getItem('pr-login') || 'heru'; } catch { return 'heru'; } })();
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  document.body.insertAdjacentHTML('beforeend', `<dialog class="chat" aria-labelledby="chatTitle">
    <div class="chat-head"><h2 id="chatTitle">Diskusi Dialog Day</h2>
      <button type="button" class="x" aria-label="Tutup"><i class="ico">${ICONS['material-symbols:close-rounded']}</i></button></div>
    <p class="chat-hint">Isilah tanggapan Anda (Evaluee/Evaluator) mengenai hasil kinerja periode ini. Gunakan kalimat yang bijak.</p>
    <div class="chat-body"><ol class="chat-list"></ol>
      <form class="chat-form"><input name="msg" placeholder="Isi tanggapan Anda" aria-label="Tanggapan Anda" autocomplete="off" autofocus>
        <button class="chat-send" aria-label="Kirim tanggapan"><i class="ico">${ICONS['material-symbols:send-rounded']}</i></button></form></div>
  </dialog>`);
  const dlg = document.body.lastElementChild, list = dlg.querySelector('.chat-list'), form = dlg.querySelector('form');
  const load = () => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
  const render = () => {
    list.innerHTML = load().map((m) => {
      const u = window.PR_USERS?.[m.who] || { name: m.who, photo: 'avatar.png' };
      return `<li><img class="avatar" src="${DD_ROOT}assets/${u.photo}" alt="" width="24" height="24">
        <div><p class="chat-meta"><b>${esc(u.name)}</b> • ${ddAgo(m.at)}</p><p>${esc(m.text)}</p></div></li>`;
    }).join('');
    list.scrollTop = list.scrollHeight;
  };
  btn.addEventListener('click', () => { dlg.showModal(); render(); }); // render setelah terbuka: gulir ke pesan terbaru hanya jalan saat terlihat
  dlg.querySelector('.x').addEventListener('click', () => dlg.close());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = form.msg.value.trim();
    if (!text) return;
    try { localStorage.setItem(key, JSON.stringify([...load(), { who: me, text, at: Date.now() }])); } catch {}
    form.reset();
    render();
  });
}
