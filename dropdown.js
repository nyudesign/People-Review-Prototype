// Dropdown standar People Review: setiap <select> tampil sebagai tombol + daftar opsi kustom (bukan dropdown bawaan browser).
// <select> tetap sumber nilai (disembunyikan): memilih opsi = set value + event 'change', jadi logika halaman tidak berubah.
// Opsi: teks = judul, data-desc = deskripsi (opsional), data-label = teks di tombol (opsional), value "" = placeholder.
// Select baru (hasil render ulang) otomatis ikut lewat MutationObserver. Opt-out: <select data-native>.
// Selama daftar terbuka: scroll di luar daftar dikunci, klik di luar hanya menutup dropdown (tidak memicu elemen di bawahnya).
(() => {
  let uid = 0;
  const all = () => document.querySelectorAll('.dd');

  function close(except) {
    all().forEach((dd) => {
      if (dd === except) return;
      dd.querySelector('.dd-list').hidden = true;
      dd.querySelector('.dd-list').style.maxHeight = '';
      dd.classList.remove('dd-up');
      dd.querySelector('.dd-btn').setAttribute('aria-expanded', 'false');
    });
    unlockScroll();
  }

  // Area scroll terdekat + batas atas yang aman (di bawah header sticky, mis. kepala kartu HSSE yang menempel).
  function scroller(dd) {
    for (let el = dd.parentElement; el && el !== document.body; el = el.parentElement) {
      if (/auto|scroll/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight) return el;
    }
    return document.scrollingElement;
  }
  function visibleBox(dd, sc) {
    const page = sc === document.scrollingElement;
    const r = page ? { top: 0, bottom: innerHeight } : sc.getBoundingClientRect();
    const scs = getComputedStyle(sc), stickTop = r.top + parseFloat(scs.borderTopWidth) + parseFloat(scs.paddingTop); // sticky diukur dari tepi dalam padding
    const d = dd.getBoundingClientRect();
    let top = r.top;
    for (let el = dd; el && el !== sc; el = el.parentElement) {
      for (let sib = el.previousElementSibling; sib; sib = sib.previousElementSibling) {
        const cs = getComputedStyle(sib), sr = sib.getBoundingClientRect();
        const overHead = sr.left < d.right && sr.right > d.left; // hanya yang di atas dropdown, bukan di sampingnya (mis. sidebar)
        if (cs.position === 'sticky' && cs.top !== 'auto' && overHead) top = Math.max(top, stickTop + parseFloat(cs.top) + sib.offsetHeight);
      }
    }
    return { top: top + GAP, bottom: Math.min(r.bottom, innerHeight) - GAP };
  }
  const GAP = 12; // jarak daftar dari tepi area / header sticky
  const MIN_H = 160; // di bawah ini daftar lebih baik dibuka ke atas (kalau di atas lebih lega)

  // Daftar menyesuaikan ruang: gulir area seperlunya tanpa menyembunyikan tombol, lalu batasi tinggi daftar
  // (sisanya di-scroll di dalam daftar); buka ke atas bila ruang bawah sempit.
  function place(dd) {
    const btn = dd.querySelector('.dd-btn'), list = dd.querySelector('.dd-list'), sc = scroller(dd);
    const listH = list.offsetHeight;
    let box = visibleBox(dd, sc), b = btn.getBoundingClientRect();
    const need = b.bottom + 6 + listH - box.bottom;
    const head = (dd.closest('label') || btn).getBoundingClientRect().top; // label ikut terlihat, tidak hanya tombol
    if (need > 0) sc.scrollTop += Math.max(0, Math.min(need, head - box.top));
    box = visibleBox(dd, sc); b = btn.getBoundingClientRect();
    const below = box.bottom - b.bottom - 6, above = b.top - 6 - box.top;
    const up = below < Math.min(listH, MIN_H) && above > below;
    dd.classList.toggle('dd-up', up);
    if ((up ? above : below) < listH) list.style.maxHeight = `${Math.max(up ? above : below, 80)}px`;
  }

  // Kunci semua area scroll di atas dropdown (overflow: hidden; posisi scroll tetap). scrollbar-gutter: stable
  // hanya untuk area yang memang sedang punya scrollbar, supaya lebarnya tidak berubah (tidak ada lompatan tata letak).
  let locked = [];
  function lockScroll(dd) {
    place(dd); // atur posisi & tinggi daftar dulu, baru scroll luar dikunci
    for (let el = dd.parentElement; el; el = el.parentElement) {
      if (el !== document.documentElement && !/auto|scroll/.test(getComputedStyle(el).overflowY)) continue;
      locked.push([el, el.style.overflow, el.style.scrollbarGutter]);
      if (el.scrollHeight > el.clientHeight) el.style.scrollbarGutter = 'stable';
      el.style.overflow = 'hidden';
    }
  }
  function unlockScroll() {
    locked.forEach(([el, overflow, gutter]) => { el.style.overflow = overflow; el.style.scrollbarGutter = gutter; });
    locked = [];
  }

  // Tombol & daftar mengikuti keadaan <select>: nilai, disabled, aria-invalid.
  function sync(sel) {
    const dd = sel.closest('.dd');
    if (!dd) return;
    const btn = dd.querySelector('.dd-btn');
    const opt = sel.selectedOptions[0];
    if (opt && opt.value !== '') btn.textContent = opt.dataset.label || opt.text;
    else {
      const ph = document.createElement('span');
      ph.className = 'dd-ph';
      ph.textContent = sel.querySelector('option[value=""]')?.text || 'Pilih';
      btn.replaceChildren(ph);
    }
    btn.disabled = sel.disabled;
    if (sel.getAttribute('aria-invalid') === 'true') btn.setAttribute('aria-invalid', 'true');
    else btn.removeAttribute('aria-invalid');
    dd.querySelectorAll('[role="option"]').forEach((o) => o.setAttribute('aria-selected', o.dataset.value === sel.value));
  }

  function enhance(sel) {
    if (sel.closest('.dd') || sel.hasAttribute('data-native')) return;
    const dd = document.createElement('div');
    dd.className = 'dd';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dd-btn';
    btn.setAttribute('aria-haspopup', 'listbox');
    btn.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div');
    list.className = 'dd-list';
    list.id = `dd-list-${++uid}`;
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    btn.setAttribute('aria-controls', list.id);
    list.append(...[...sel.options].filter((o) => o.value !== '').map((o) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('role', 'option');
      item.dataset.value = o.value;
      const title = document.createElement('b');
      title.textContent = o.text;
      item.append(title);
      if (o.dataset.desc) {
        const desc = document.createElement('span');
        desc.textContent = o.dataset.desc;
        item.append(desc);
      }
      return item;
    }));
    sel.before(dd);
    dd.append(btn, list, sel); // tombol jadi kontrol pertama di <label> → label tetap memberi nama & membuka dropdown
    sync(sel);
  }

  const enhanceIn = (root) => {
    if (root.nodeType !== 1) return;
    if (root.matches('select')) enhance(root);
    root.querySelectorAll('select').forEach(enhance);
  };
  enhanceIn(document.body);
  new MutationObserver((records) => records.forEach((r) => {
    if (r.type === 'attributes') return r.target.matches('select') && sync(r.target);
    r.addedNodes.forEach(enhanceIn);
  })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'aria-invalid'] });

  document.addEventListener('change', (e) => { if (e.target.matches?.('.dd select')) sync(e.target); });

  // Selama terbuka, klik di luar dropdown hanya menutupnya: ditutup saat pointerdown (tetap terkirim walau yang diklik
  // tombol disabled, beda dengan click), lalu mousedown & click lanjutannya ditahan di fase capture.
  let swallow = false;
  document.addEventListener('pointerdown', (e) => {
    swallow = !!locked.length && !e.target.closest?.('.dd-list:not([hidden]), .dd-btn[aria-expanded="true"]');
    if (swallow) { e.preventDefault(); close(); }
  }, true);
  ['mousedown', 'click'].forEach((t) => document.addEventListener(t, (e) => {
    if (!swallow) return;
    e.preventDefault();
    e.stopPropagation();
    if (t === 'click') swallow = false;
  }, true));

  document.addEventListener('click', (e) => {
    const dd = e.target.closest('.dd');
    if (!dd) return close();
    const btn = dd.querySelector('.dd-btn'), list = dd.querySelector('.dd-list'), sel = dd.querySelector('select');
    const opt = e.target.closest('[role="option"]');
    if (opt) {
      if (sel.value !== opt.dataset.value) {
        sel.value = opt.dataset.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
      sync(sel);
      close();
      return btn.focus();
    }
    if (e.target.closest('.dd-btn') && !btn.disabled) {
      e.preventDefault(); // tombol di dalam <label>: jangan ikut memicu klik kedua
      const open = list.hidden;
      close(dd);
      list.hidden = !open;
      btn.setAttribute('aria-expanded', open);
      if (open) {
        lockScroll(dd);
        (list.querySelector('[aria-selected="true"]') || list.querySelector('[role="option"]'))?.focus({ preventScroll: true });
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    const dd = e.target.closest?.('.dd');
    if (!dd) return;
    const btn = dd.querySelector('.dd-btn'), list = dd.querySelector('.dd-list');
    const opts = [...list.querySelectorAll('[role="option"]')], i = opts.indexOf(document.activeElement);
    if (e.key === 'Escape' && !list.hidden) { close(); btn.focus(); }
    else if (e.key === 'Tab' && !list.hidden) { // fokus tetap di daftar selama terbuka
      e.preventDefault();
      opts[(i + (e.shiftKey ? -1 : 1) + opts.length) % opts.length]?.focus();
    }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) return btn.click();
      opts[(i + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length]?.focus();
    }
  });
})();
