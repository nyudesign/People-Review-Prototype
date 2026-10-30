// Kartu profil + dialog Log Out (Figma section "Log Out"), dipakai semua halaman lewat
// <script src="./profile.js">. Menempel pada tombol ••• di blok .user sidebar.
(() => {
  const base = new URL('.', document.currentScript.src).href;
  // Akun demo; login.html menyimpan id-nya di sessionStorage 'pr-login'.
  const USERS = {
    heru: { name: 'Heru Kautsar', nip: '19050193', photo: 'avatar.png', title: 'Sr Analyst II Performance &amp; Competency Mgt' },
    oka: { name: 'Oka Fitrio', nip: '1905416', photo: 'avatar-oka.png', title: 'Manager Performance &amp; Competency Mgt' },
    aryo: { name: 'Aryomekka Firdaus', nip: '777777', photo: 'avatar.png', title: 'VP Talent Development &amp; Recruitment' },
  };
  // Belum login → mulai dari halaman login. Storage diblokir → biarkan masuk sebagai Heru.
  let id = 'heru';
  try {
    id = sessionStorage.getItem('pr-login');
    if (!id) return location.replace(`${base}login.html`);
  } catch {}
  const me = USERS[id] || USERS.heru;
  window.PR_USER = USERS[id] ? id : 'heru';
  const EXIT = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 4.001H5v14a2 2 0 0 0 2 2h8m1-5l3-3m0 0l-3-3m3 3H9"/></svg>';
  const WARN = '<svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="currentColor" d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zm1.725-2h15.1L12 6zm8.263-1.287Q13 17.425 13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18t.713-.288m0-3Q13 14.425 13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15t.713-.288M12 12.5"/></svg>';

  const user = document.querySelector('.sidebar .user');
  const btn = user?.querySelector('.more');
  if (!btn) return;
  const photo = document.createElement('img');
  Object.assign(photo, { className: 'avatar', src: `${base}assets/${me.photo}`, alt: '', width: 32, height: 32 });
  user.querySelector('.avatar')?.replaceWith(photo);
  user.querySelector('b').textContent = me.name;
  user.querySelector('small').textContent = me.nip;

  user.insertAdjacentHTML('beforeend', `
    <div class="pf-pop" id="pfPop" hidden>
      <img class="pf-photo" src="${base}assets/${me.photo}" alt="" width="84" height="84">
      <h2>${me.name}</h2>
      <p class="pf-muted">${me.nip} • PT Pertamina (Persero)</p>
      <p class="pf-small">Human Capital Management<br>Talent Development &amp; Recruitment<br>SDM</p>
      <p><b>${me.title}</b></p>
      <button type="button" class="pf-logout-btn"><i class="pf-ico">${EXIT}</i>Log Out</button>
    </div>`);
  document.body.insertAdjacentHTML('beforeend', `
    <dialog class="pf-dialog" aria-labelledby="pfTitle">
      <form method="dialog">
        <i class="pf-warn">${WARN}</i>
        <h2 id="pfTitle">Apakah Anda yakin<br>ingin log out?</h2>
        <p>Pastikan pengerjaan dalam People Review ini selesai sebelum Anda log out</p>
        <button class="pf-yes" value="yes">Ya, log out</button>
        <button class="pf-no" value="no" autofocus>Tidak, saya ingin kembali</button>
      </form>
    </dialog>`);

  const pop = user.querySelector('.pf-pop');
  const dlg = document.querySelector('.pf-dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'pfPop');
  const set = (open) => { pop.hidden = !open; btn.setAttribute('aria-expanded', open); };
  // Seluruh kartu profil bisa diklik; tombol ••• tetap jadi kontrol untuk keyboard/pembaca layar.
  user.addEventListener('click', (e) => { if (!pop.contains(e.target)) set(pop.hidden); });
  document.addEventListener('click', (e) => { if (!pop.hidden && !user.contains(e.target)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  pop.querySelector('.pf-logout-btn').addEventListener('click', () => { set(false); dlg.showModal(); });
  dlg.querySelector('form').addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'yes') return;
    try { sessionStorage.removeItem('pr-login'); } catch {}
    location.href = `${base}login.html`;
  });

  const css = document.createElement('link');
  Object.assign(css, { rel: 'stylesheet', href: `${base}profile.css` });
  document.head.append(css);
})();

// Tampilkan/Sembunyikan Alur (stepper): satu pilihan untuk semua halaman, diingat di localStorage 'pr-hide-flow'.
(() => {
  const btn = document.getElementById('toggleFlow'), stepper = document.getElementById('stepper');
  if (!btn || !stepper) return;
  const apply = (hidden) => {
    stepper.classList.toggle('hidden', hidden);
    btn.querySelector('i').innerHTML = ICONS[hidden ? 'mdi:eye' : 'mdi:eye-off'];
    btn.querySelector('span').textContent = hidden ? 'Tampilkan Alur' : 'Sembunyikan Alur';
  };
  let hidden = false;
  try { hidden = localStorage.getItem('pr-hide-flow') === '1'; } catch {}
  apply(hidden);
  btn.addEventListener('click', () => {
    hidden = !hidden;
    apply(hidden);
    try { localStorage.setItem('pr-hide-flow', hidden ? '1' : '0'); } catch {}
  });
})();
