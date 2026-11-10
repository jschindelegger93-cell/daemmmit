// Dämm-Mit – Client-Skript (Menü, Modal, Warenkorb, Rechner, Filter, Tracking)
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const eur = (n) => n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

/* ---------- Tracking ---------- */
const TRACKING_PANEL = document.body.dataset.trackingPanel === '1';
const tlog = $('[data-tlog]');
let tcount = 0;
export function track(event, data = {}) {
  window.dataLayer.push({ event, ...data });
  if (!TRACKING_PANEL || !tlog) return;
  tlog.hidden = false;
  tcount++;
  $('b', tlog).textContent = tcount;
  const li = document.createElement('li');
  li.textContent = `${new Date().toLocaleTimeString('de-AT')} ${event}${data.label ? ' · ' + data.label : ''}${data.step ? ' · ' + data.step : ''}`;
  $('.tlog__l', tlog).prepend(li);
}
if (tlog) $('.tlog__p', tlog).addEventListener('click', (e) => {
  const l = $('.tlog__l', tlog); l.hidden = !l.hidden; e.currentTarget.setAttribute('aria-expanded', String(!l.hidden));
});
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-track]');
  if (t && t.tagName !== 'DETAILS') track(t.dataset.track, { label: t.dataset.label || t.textContent.trim().slice(0, 40) });
});
$$('details[data-track]').forEach((d) => d.addEventListener('toggle', () => d.open && track('faq_open', { label: d.dataset.label })));
const depths = [25, 50, 75, 100]; const seen = new Set();
addEventListener('scroll', () => {
  const p = ((scrollY + innerHeight) / document.documentElement.scrollHeight) * 100;
  depths.forEach((d) => { if (p >= d && !seen.has(d)) { seen.add(d); track('scroll_depth', { label: d + '%' }); } });
}, { passive: true });

/* ---------- Announcement ---------- */
const ann = $('[data-ann]');
if (ann) {
  const until = store.get('dm_ann_closed', 0);
  if (until > Date.now()) ann.hidden = true;
  $('[data-ann-x]', ann).addEventListener('click', () => { ann.hidden = true; store.set('dm_ann_closed', Date.now() + 7 * 864e5); });
  const msgs = $$('.ann__msg', ann); let i = 0, paused = false;
  ann.addEventListener('mouseenter', () => (paused = true)); ann.addEventListener('mouseleave', () => (paused = false));
  ann.addEventListener('focusin', () => (paused = true)); ann.addEventListener('focusout', () => (paused = false));
  if (msgs.length > 1 && !matchMedia('(prefers-reduced-motion: reduce)').matches)
    setInterval(() => { if (paused) return; msgs[i].classList.remove('is-on'); i = (i + 1) % msgs.length; msgs[i].classList.add('is-on'); }, 5000);
}

/* ---------- Header / Menü ---------- */
const hdr = $('[data-hdr]');
const sticky = $('[data-sticky]');
const onScroll = () => {
  hdr?.classList.toggle('is-small', scrollY > 40);
  if (sticky) { const on = scrollY > 520; sticky.classList.toggle('is-on', on); document.body.classList.toggle('has-sticky', on); }
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();
const mnav = $('#mnav'), burger = $('[data-burger]');
const menu = (open) => { mnav.hidden = !open; burger.setAttribute('aria-expanded', String(open)); document.body.classList.toggle('lock', open); if (open) $('[data-burger-x]').focus(); else burger.focus(); };
burger?.addEventListener('click', () => menu(true));
$('[data-burger-x]')?.addEventListener('click', () => menu(false));

/* ---------- Formulare (Netlify, AJAX) ---------- */
const encode = (form) => new URLSearchParams(new FormData(form)).toString();
async function send(form) {
  const r = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encode(form) });
  if (!r.ok && r.status !== 404) throw new Error('Senden fehlgeschlagen'); // 404 = lokale Vorschau ohne Netlify
}
$$('form[data-ajax]').forEach((form) => form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const btn = $('[type=submit]', form); const err = $('[data-err]', form);
  btn.disabled = true;
  try { form.dispatchEvent(new CustomEvent('dm:before')); await send(form); track('generate_lead', { label: form.name }); form.dispatchEvent(new CustomEvent('dm:sent')); location.href = '/danke/?form=' + form.name; }
  catch { btn.disabled = false; if (err) err.textContent = 'Das hat leider nicht geklappt. Bitte rufen Sie uns an oder versuchen Sie es erneut.'; }
}));

/* ---------- Beratungs-Modal ---------- */
const modal = $('#modal');
if (modal) {
  const form = $('[data-mform]', modal), steps = $$('.step[data-step]', form), done = $('[data-done]', form);
  const next = $('[data-next]', modal), prev = $('[data-prev]', modal), foot = $('[data-mfoot]', modal), prog = $('[data-prog]', modal);
  let cur = 0, lastFocus = null;
  const valid = () => {
    const s = steps[cur];
    if (cur === 0) return !!$('input[name=kundentyp]:checked', s);
    if (cur === 1) return !!$('input:checked', s);
    if (cur === 4) return $$('[required]', s).every((i) => (i.type === 'checkbox' ? i.checked : i.value.trim().length > 1));
    return true;
  };
  const show = (n) => {
    cur = n; steps.forEach((s, i) => (s.hidden = i !== n)); done.hidden = true; foot.hidden = false; prog.hidden = false;
    $('[data-prog-n]', modal).textContent = steps[n].dataset.step;
    $('[data-prog-c]', modal).textContent = `Schritt ${n + 1} von ${steps.length}`;
    $('.prog__b i', modal).style.width = ((n + 1) / steps.length) * 100 + '%';
    prev.hidden = n === 0;
    next.firstChild.textContent = n === steps.length - 1 ? 'Anfrage senden ' : 'Weiter ';
    next.disabled = !valid(); form.scrollTop = 0;
    track('modal_step', { step: `${n + 1} ${steps[n].dataset.step}` });
  };
  const open = (t) => {
    lastFocus = document.activeElement; if (!mnav.hidden) { mnav.hidden = true; }
    modal.hidden = false; document.body.classList.add('lock');
    form.quelle.value = (t?.dataset.label || 'direkt') + ' | ' + location.pathname;
    if (t?.dataset.leistung) $$('input[name="anliegen[]"]', form).forEach((i) => { if (i.value === t.dataset.leistung) i.checked = true; });
    if (t?.dataset.variante) $$('input[name=variante]', form).forEach((i) => { if (i.value.startsWith(t.dataset.variante)) i.checked = true; });
    if (t?.dataset.kundentyp) $$('input[name=kundentyp]', form).forEach((i) => { if (i.value === t.dataset.kundentyp) i.checked = true; });
    if (t?.hasAttribute('data-from-calc') && window.__calc) { form.rechner.value = window.__calc.text; form.menge.value = window.__calc.menge; }
    track('modal_open', { label: t?.dataset.label || '' });
    show(done.hidden ? cur : 0); $('.modal__x', modal).focus();
  };
  const close = () => { modal.hidden = true; document.body.classList.remove('lock'); lastFocus?.focus?.(); };
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-modal]'); if (t) { e.preventDefault(); open(t); }
    if (e.target.closest('[data-modal-x]') || e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!modal.hidden) close(); else if (!mnav.hidden) menu(false); }
    if (e.key === 'Tab' && !modal.hidden) {
      const f = $$('button:not([hidden]):not([disabled]),a[href],input:not([type=hidden]),textarea,select', modal).filter((el) => el.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  });
  form.addEventListener('input', () => (next.disabled = !valid()));
  form.addEventListener('change', (e) => { next.disabled = !valid(); if (e.target.closest('[data-auto]') && valid()) setTimeout(() => show(cur + 1), 180); });
  form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); if (!next.disabled) next.click(); } });
  prev.addEventListener('click', () => show(cur - 1));
  next.addEventListener('click', async () => {
    if (!valid()) return;
    if (cur < steps.length - 1) return show(cur + 1);
    next.disabled = true;
    try {
      await send(form); track('generate_lead', { label: 'beratung' });
      steps.forEach((s) => (s.hidden = true)); done.hidden = false; foot.hidden = true; prog.hidden = true; form.reset(); cur = 0;
    } catch { $('[data-err]', form).textContent = 'Senden fehlgeschlagen. Bitte rufen Sie uns kurz an.'; next.disabled = false; }
  });
}

/* ---------- Warenkorb ---------- */
const cart = {
  items: store.get('dm_cart', []),
  save() { store.set('dm_cart', this.items); this.badge(); document.dispatchEvent(new CustomEvent('dm:cart')); },
  add(it) { const k = it.id + '|' + it.variant; const f = this.items.find((i) => i.id + '|' + i.variant === k); if (f) f.qty += it.qty; else this.items.push(it); this.save(); },
  badge() { const n = this.items.reduce((a, i) => a + i.qty, 0); $$('[data-cart-count]').forEach((b) => { b.textContent = n; b.hidden = n === 0; }); },
  text() { return this.items.map((i) => `${i.qty} × ${i.title}${i.variant ? ' (' + i.variant + ')' : ''} [${i.unit}]${i.price ? ' à ' + eur(i.price) : ' – Preis auf Anfrage'}`).join('\n'); },
};
cart.badge();
const toast = $('[data-toast]'); let tt;
const say = (html) => { toast.innerHTML = html; toast.classList.add('is-on'); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove('is-on'), 4200); };
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]'); if (!b) return;
  const box = b.closest('[data-buy]');
  const variant = box ? $('[data-variant]', box)?.value || '' : b.dataset.variant || '';
  const qty = box ? Math.max(1, parseInt($('[data-qty]', box).value) || 1) : 1;
  cart.add({ id: b.dataset.id, title: b.dataset.title, variant, qty, unit: b.dataset.unit, price: parseFloat(b.dataset.price) || 0 });
  track('add_to_cart', { label: b.dataset.title });
  say(`Im Warenkorb: ${b.dataset.title} <a href="/warenkorb/">Zum Warenkorb →</a>`);
});
document.addEventListener('click', (e) => {
  const q = e.target.closest('[data-q]'); if (!q) return;
  const inp = $('input', q.parentElement); inp.value = Math.max(1, (parseInt(inp.value) || 1) + parseInt(q.dataset.q)); inp.dispatchEvent(new Event('change', { bubbles: true }));
});
const cartEl = $('[data-cart]');
if (cartEl) {
  const list = $('[data-cart-list]', cartEl), empty = $('[data-cart-empty]'), full = $('[data-cart-full]');
  const render = () => {
    const has = cart.items.length > 0; empty.hidden = has; full.hidden = !has;
    list.innerHTML = cart.items.map((i, n) => `<div class="citem"><div><b>${i.title}</b><small>${i.variant ? i.variant + ' · ' : ''}${i.price ? eur(i.price) + ' / ' + i.unit : 'Preis auf Anfrage'}</small></div>
      <div class="citem__r"><span class="qty"><button type="button" data-ci="${n}" data-d="-1" aria-label="Weniger">−</button><input type="number" min="1" value="${i.qty}" data-ci="${n}" aria-label="Menge ${i.title}"><button type="button" data-ci="${n}" data-d="1" aria-label="Mehr">+</button></span>
      <button class="citem__x" type="button" data-rm="${n}" aria-label="${i.title} entfernen"><svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg></button></div></div>`).join('');
    const sum = cart.items.reduce((a, i) => a + i.price * i.qty, 0); const open = cart.items.some((i) => !i.price);
    $('[data-cart-sum]').textContent = sum ? eur(sum) + (open ? ' + Positionen auf Anfrage' : '') : 'Preis auf Anfrage';
    $('textarea[name=bestellung]').value = cart.text(); $('[name=summe_bekannt]').value = sum ? eur(sum) : '–';
  };
  list.addEventListener('click', (e) => {
    const d = e.target.closest('[data-d]'), r = e.target.closest('[data-rm]');
    if (d) { const it = cart.items[d.dataset.ci]; it.qty = Math.max(1, it.qty + parseInt(d.dataset.d)); cart.save(); render(); }
    if (r) { cart.items.splice(r.dataset.rm, 1); cart.save(); render(); }
  });
  list.addEventListener('change', (e) => { const i = e.target.closest('input[data-ci]'); if (i) { cart.items[i.dataset.ci].qty = Math.max(1, parseInt(i.value) || 1); cart.save(); render(); } });
  $('form[name=bestellung]').addEventListener('dm:sent', () => { cart.items = []; cart.save(); });
  render();
}

/* ---------- Kostenrechner ---------- */
$$('[data-calc]').forEach((c) => {
  const pk = +c.dataset.kg, pkm = +c.dataset.km, pm = +c.dataset.misch / 100;
  const dens = { glas: 20, stein: 50, misch: 35 };
  const out = (k, v) => ($(`[data-out=${k}]`, c).textContent = v);
  const calc = () => {
    const mat = $('input[name=c-mat]:checked', c).value, vr = $('input[name=c-var]:checked', c).value;
    const m2 = +$('#c-m2', c).value || 0, cm = +$('#c-cm', c).value || 0, direct = +$('#c-kg', c).value || 0;
    const kg = direct || Math.round(m2 * (cm / 100) * dens[mat]);
    const ent = kg * pk, misch = mat === 'misch' ? ent * pm : 0, km = +$('#c-km', c).value || 0, fahrt = vr === 'abholung' ? km * 2 * pkm : 0;
    $('[data-kmfield]', c).hidden = vr !== 'abholung'; $('[data-row=km]', c).hidden = vr !== 'abholung'; $('[data-row=misch]', c).hidden = mat !== 'misch';
    const sum = ent + misch + fahrt;
    out('kg', kg ? `ca. ${kg.toLocaleString('de-AT')} kg` : '–'); out('ent', eur(ent)); out('misch', eur(misch)); out('fahrt', eur(fahrt));
    out('vgl', kg ? `${eur(kg * 2)} – ${eur(kg * 4)}` : '–'); out('sum', kg ? 'ca. ' + eur(sum) : '–');
    window.__calc = { menge: `ca. ${kg} kg`, text: `Rechner: ${mat}, ${direct ? direct + ' kg direkt' : m2 + ' m² × ' + cm + ' cm'}, ${vr}${vr === 'abholung' ? ' ' + km + ' km' : ''} → ca. ${eur(sum)}` };
  };
  c.addEventListener('input', calc);
  $$('[data-ex]', c).forEach((b) => b.addEventListener('click', () => {
    const [a, d, m] = b.dataset.ex.split(','); $('#c-m2', c).value = a; $('#c-cm', c).value = d; $('#c-kg', c).value = ''; $(`input[name=c-mat][value=${m}]`, c).checked = true; calc(); track('calc_example', { label: b.textContent });
  }));
  let used = false; c.addEventListener('change', () => { if (!used) { used = true; track('calc_use', {}); } });
  calc();
});

/* ---------- Shop-Filter ---------- */
const shop = $('[data-shop]');
if (shop) {
  const cards = $$('.pcard', shop), chips = $$('[data-f]'), sort = $('[data-sort]'), empty = $('[data-empty]'), grid = $('[data-grid]', shop);
  const q = new URLSearchParams(location.search); let kat = q.get('kat') || 'alle';
  const apply = (push) => {
    let n = 0; cards.forEach((c) => { const on = kat === 'alle' || c.dataset.kat === kat; c.hidden = !on; if (on) n++; });
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.f === kat)));
    empty.hidden = n > 0;
    const s = sort.value; [...cards].sort((a, b) => s === 'preis' ? a.dataset.preis - b.dataset.preis : a.dataset.sort - b.dataset.sort).forEach((c) => grid.append(c));
    if (push) { const u = new URL(location.href); kat === 'alle' ? u.searchParams.delete('kat') : u.searchParams.set('kat', kat); history.replaceState(null, '', u); track('filter_use', { label: kat + ' / ' + s }); }
  };
  chips.forEach((c) => c.addEventListener('click', () => { kat = c.dataset.f; apply(true); }));
  sort.addEventListener('change', () => apply(true));
  $('[data-reset]')?.addEventListener('click', () => { kat = 'alle'; apply(true); });
  apply(false);
}

/* ---------- FAQ-Suche ---------- */
const fs = $('[data-faq-search]');
if (fs) fs.addEventListener('input', () => {
  const v = fs.value.toLowerCase().trim(); let n = 0;
  $$('[data-faq-group]').forEach((g) => { let gn = 0; $$('details', g).forEach((d) => { const on = !v || d.textContent.toLowerCase().includes(v); d.hidden = !on; if (on) gn++; }); g.hidden = gn === 0; n += gn; });
  $('[data-faq-none]').hidden = n > 0;
});

/* ---------- Countdown Deponieverbot ---------- */
$$('[data-countdown]').forEach((el) => {
  const days = Math.max(0, Math.ceil((new Date(el.dataset.countdown) - Date.now()) / 864e5));
  $('[data-days]', el).textContent = days; if (days === 0) el.hidden = true;
});

/* ---------- Cookie-Banner ---------- */
const ck = $('[data-cookie]');
if (ck) {
  if (!store.get('dm_cookie', null)) setTimeout(() => (ck.hidden = false), 1500);
  $$('[data-cookie-set]').forEach((b) => b.addEventListener('click', () => { store.set('dm_cookie', { v: b.dataset.cookieSet, t: Date.now() }); ck.hidden = true; track('cookie_consent', { label: b.dataset.cookieSet }); }));
  $$('[data-cookie-open]').forEach((b) => b.addEventListener('click', () => (ck.hidden = false)));
}

/* ---------- Einblenden ---------- */
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));
} else $$('.reveal').forEach((el) => el.classList.add('is-in'));
