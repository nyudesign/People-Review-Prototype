// Tampilan dari desain Figma section "Development Commitment" (frame "Desktop - 978"). Halaman hanya menampilkan data, tanpa isian.
// shortcut: angka masih contoh dari Figma; nantinya diambil dari Capability Development Plan (lihat frame "Referensi Data").
const components = [
  { name: 'Assignment', bobot: 70, skor: 100, plan: 3, real: 3 },
  { name: 'Coaching', bobot: 20, skor: 100, plan: 3, real: 3 },
  { name: 'Training', bobot: 5, skor: 100, plan: 3, real: 3 },
];
const realisasi = { value: 100, max: 100 };

const $ = (s) => document.querySelector(s);
document.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});

$('#devRows').innerHTML = components.map((c) => `
  <div class="dev-row">
    <div class="dev-row-head">
      <div><span>${c.name} (${c.bobot}%)</span><span><b class="big">${c.skor}</b><small class="muted">/100 %</small></span></div>
      <div class="dev-chips"><span class="dev-chip">Plan <b>${c.plan}</b></span><span class="dev-chip">Real <b>${c.real}</b></span></div>
    </div>
    <div class="dev-bar" role="progressbar" aria-label="${c.name}" aria-valuenow="${c.skor}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.min(100, c.skor)}%"></i></div>
  </div>`).join('');

// Donut: keliling lingkaran r=42 ≈ 263.9, panjang busur = persentase dari keliling.
const pct = Math.min(100, realisasi.value);
const C = 2 * Math.PI * 42;
$('#devTotal').innerHTML = `
  <div class="donut">
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" class="donut-track"/>
      <circle cx="50" cy="50" r="42" class="donut-fill" stroke-dasharray="${(C * pct) / 100} ${C}"/>
    </svg>
    <b>${pct}%</b>
  </div>
  <div class="dev-legend"><span class="dot"></span>Realisasi Development <span><b class="big">${realisasi.value}</b><small class="muted">/${realisasi.max} %</small></span></div>`;

$('#toggleFlow').addEventListener('click', () => {
  const hidden = $('#stepper').classList.toggle('hidden');
  $('#toggleFlow i').innerHTML = ICONS[hidden ? 'mdi:eye' : 'mdi:eye-off'];
  $('#toggleFlow span').textContent = hidden ? 'Tampilkan Alur' : 'Sembunyikan Alur';
});
