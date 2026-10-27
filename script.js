/* ===== LifeDrop script (vanilla JS) ===== */
(function () {
  "use strict";
  // Pages share one script: missing elements resolve to a harmless stand-in
  const NOOP = new Proxy(() => NOOP, { get: (t, k) => k === Symbol.toPrimitive ? () => "" : NOOP, set: () => true });
  const $ = (s, r = document) => r.querySelector(s) || NOOP;
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Toast helper ---------- */
  const toast = $("#toast");
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn"), links = $("#links");
  function setMenu(open) {
    links.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  menuBtn.addEventListener("click", () => setMenu(!links.classList.contains("open")));
  $$("a", links).forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Nav border + back-to-top ---------- */
  const nav = $("#nav"), toTop = $("#toTop");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 10);
    toTop.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); revealObs.unobserve(en.target); } });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => revealObs.observe(el));

  /* ---------- Animated counters ---------- */
  function runCounter(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || "";
    if (reduce) { el.textContent = target + suffix; return; }
    const start = performance.now(), dur = 1400;
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { runCounter(en.target); countObs.unobserve(en.target); } });
  }, { threshold: 0.5 });
  $$("[data-count]").forEach(el => countObs.observe(el));

  /* ---------- Mouse-following glow (desktop only) ---------- */
  const glow = $(".glow-cursor");
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("mousemove", e => {
      glow.style.opacity = "1";
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    }, { passive: true });
  }

  /* ---------- Hero particles (canvas) ---------- */
  const canvas = $("#particles"), ctx = canvas.getContext("2d");
  let pts = [], W = 0, H = 0, raf;
  function sizeCanvas() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    const n = Math.min(60, Math.floor(W / 24));
    pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .3, vy: (Math.random() - .5) * .3, r: Math.random() * 1.8 + .6 }));
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "rgba(34,211,238,.7)";
    pts.forEach(p => {
      p.x = (p.x + p.vx + W) % W; p.y = (p.y + p.vy + H) % H;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });
    raf = requestAnimationFrame(draw);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  if (reduce) { draw(); cancelAnimationFrame(raf); } else { draw(); }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) draw();
  });

  /* ===== Catalogue (all simulated): id|name|category|brand|price|mrp|inStock|substituteId|rating|plasticGrams|emoji ===== */
  const RAW = `milk|Toned milk 1 L|Groceries|FreshFarm|62|66|1||4.5|8|🥛
bread|Brown bread|Groceries|Bakewell|45|50|1||4.2|5|🍞
tea|Tea and sugar set|Groceries|ChaiMate|180|199|1||4.6|10|🍵
chips|Potato chips family pack|Groceries|Crunchy|120|130|0|namkeen|4.3|14|🥔
namkeen|Namkeen mix|Groceries|Haldi|110|120|1||4.4|12|🥜
cola|Cold drinks 2 L x2|Groceries|FizzUp|190|210|1||4.1|40|🥤
biscuits|Biscuits assorted|Groceries|CrispyJoy|100|110|1||4.3|9|🍪
snacks|Ready-to-eat snacks|Groceries|BiteBox|150|165|1||4.2|11|🍱
chart|Chart paper (5)|School|PaperPro|60|70|1||4.4|3|📄
pens|Sketch pens set|School|ColorKid|120|135|1||4.5|6|🖍️
glue|Glue stick|School|StickIt|40|45|0|fevicol|4.2|4|🧴
fevicol|Fevicol tube|School|Fevi|35|38|1||4.6|3|🧪
scissors|Scissors|School|CutRight|70|80|1||4.3|5|✂️
colours|Poster colours|School|ColorKid|140|150|1||4.4|7|🎨
torch|LED torch|Emergency|BrightLite|249|299|1|headlamp|4.5|10|🔦
headlamp|LED headlamp|Emergency|BrightLite|179|220|1||4.3|8|💡
bank10|Power bank 10,000 mAh|Emergency|VoltGo|899|1099|0|bank5|4.4|15|🔋
bank5|Power bank 5,000 mAh|Emergency|VoltGo|549|699|1||4.2|12|🔋
candles|Candles (12)|Emergency|GlowWax|99|110|1||4.3|6|🕯️
matches|Matchboxes (4)|Emergency|FireSafe|20|24|1||4.1|2|🔥
water|Packaged water 5 L|Emergency|AquaPure|90|100|1||4.4|60|💧
lantern|Rechargeable lantern|Emergency|BrightLite|599|749|1||4.6|14|🏮
ors|ORS sachets (10)|Emergency|HydraPlus|80|90|1||4.7|3|🧂
thermo|Digital thermometer|Emergency|CareTemp|199|240|1||4.5|6|🌡️
balloons|Balloons (30)|Celebrations|PartyPop|99|120|1||4.2|8|🎈
cups|Paper cups and plates|Celebrations|EcoServe|130|150|1||4.3|9|🥳
icepack|Ice pack 2 kg|Celebrations|ChillBox|80|90|1||4.0|18|🧊
fruit|Fresh fruit box|Celebrations|OrchardDirect|320|350|1||4.5|10|🍎
umbrella|Compact umbrella|Travel|DryDay|349|399|1||4.4|12|☂️
raincoat|Raincoat|Travel|DryDay|499|599|0|poncho|4.3|30|🧥
poncho|Rain poncho|Travel|DryDay|199|249|1||4.0|35|🌧️
pouch|Waterproof phone pouch|Travel|SafeSeal|149|180|1||4.3|9|📱
bottle|Reusable water bottle|Travel|SipGreen|299|349|1||4.7|0|🍶
wipes|Wet wipes|Travel|FreshUp|80|90|1||4.2|16|🧻
cloth|Cleaning cloths (5)|Home|SparkHome|99|120|1||4.3|6|🧽
bags|Garbage bags (30)|Home|BinBuddy|90|100|1||4.1|22|🗑️
towel|Towel set|Home|SoftHome|399|470|1||4.4|4|🛁
sanitiser|Hand sanitiser|Home|FreshUp|99|110|1||4.3|14|🧴
jute|Reusable jute bag|Home|SipGreen|79|99|1||4.6|0|👜`;
  const P = {};
  RAW.split("\n").forEach(l => { const [id, n, cat, brand, p, mrp, st, alt, r, g, e] = l.split("|"); P[id] = { id, n, cat, brand, p: +p, mrp: +mrp, st: +st, alt, r: +r, g: +g, e }; });
  const CATS = [...new Set(Object.values(P).map(x => x.cat))];
  // Product images live in the images/ folder, one file per product id (images/<id>.svg).
  // To use your own photos, put them there with the same names and change IMG_EXT (for example "jpg").
  const IMG_EXT = "svg";
  const imgSrc = p => "images/" + p.id + "." + IMG_EXT;
  // If an image is missing, the product's emoji is shown instead
  // Set USE_IMAGES to true after adding the images folder; until then each product shows its emoji
  const USE_IMAGES = false;
  const imgTag = (p, alt) => USE_IMAGES ? `<img class="pi" src="${imgSrc(p)}" alt="${alt || ""}" loading="lazy" onerror="this.outerHTML='${p.e}'">` : `<span class="pe" aria-hidden="true">${p.e}</span>`;
  // Situation kits: product id and 1 = essential / 0 = optional
  const KITS = {
    "Power cut": "torch:1,bank10:1,candles:1,matches:1,water:1,snacks:0,lantern:0",
    "Unexpected guests": "tea:1,chips:1,cola:1,cups:1,biscuits:0,icepack:0,fruit:0",
    "Rain emergency": "umbrella:1,raincoat:1,pouch:1,towel:0,wipes:0",
    "School project rescue": "chart:1,pens:1,glue:1,scissors:1,colours:0",
    "Birthday in a hurry": "balloons:1,cups:1,candles:1,cola:1,biscuits:0",
    "Last-minute travel": "bottle:1,wipes:1,bank10:1,pouch:0,snacks:0",
    "Home cleaning rescue": "cloth:1,bags:1,sanitiser:1,towel:0"
  };
  const KW = {
    "Power cut": ["power", "light", "electric", "blackout"], "Unexpected guests": ["guest", "visitor", "hosting", "company"],
    "Rain emergency": ["rain", "monsoon", "storm"], "School project rescue": ["school", "project", "homework", "craft"],
    "Birthday in a hurry": ["birthday", "party", "celebrat"], "Last-minute travel": ["travel", "trip", "journey"],
    "Home cleaning rescue": ["clean", "mop", "dust"]
  };
  const names = Object.keys(KITS);
  const kitList = n => KITS[n].split(",").map(s => { const [id, e] = s.split(":"); return { id, e: +e }; });
  const rupee = n => "₹" + Math.round(n).toLocaleString("en-IN");

  /* ---------- Safe local storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("ld_" + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem("ld_" + k, JSON.stringify(v)); } catch (_) { /* storage blocked: ignore */ } }
  };
  let cart = store.get("cart", {});           // id -> { q, e, kit }
  Object.keys(cart).forEach(id => { if (!P[id]) delete cart[id]; });
  let wish = store.get("wish", []), recent = store.get("recent", []), searches = store.get("searches", []);
  let coupon = "", pinOk = null, delay = 0;

  /* ---------- Ratings and reviews ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let pdpStar = 0;
  const SAMPLES = [["Aarav", "Good quality and it arrived on time."], ["Meera", "Worth the price. Would order again."], ["Kabir", "Works as described."], ["Isha", "Neatly packed, no complaints."]];
  const userRev = id => store.get("reviews", {})[id] || [];
  // The catalogue rating counts as two ratings; every review you post is averaged in
  const rate = p => { const u = userRev(p.id); return (p.r * 2 + u.reduce((s, x) => s + x.s, 0)) / (2 + u.length); };
  const starLine = p => "⭐ " + rate(p).toFixed(1) + " (" + (2 + userRev(p.id).length) + ")";
  function sampleRev(p) {
    let h = 0; for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const a = SAMPLES[h % 4], b = SAMPLES[(h + 2) % 4];
    return [{ n: a[0], t: a[1], s: Math.max(1, Math.min(5, Math.round(p.r))), sample: true }, { n: b[0], t: b[1], s: Math.max(1, Math.min(5, Math.round(p.r - .4))), sample: true }];
  }
  const stars = n => "★".repeat(n) + "☆".repeat(5 - n);
  function reviewsHTML(p) {
    const list = [...userRev(p.id), ...sampleRev(p)], avg = rate(p);
    return `<section class="reviews" aria-label="Ratings and reviews"><h4>Ratings and reviews</h4>
<p class="rev-sum"><b>${stars(Math.round(avg))}</b> ${avg.toFixed(1)} out of 5 · ${2 + userRev(p.id).length} ratings</p>
<ul class="rev-list">${list.slice(0, 6).map(x => `<li><span class="st" aria-label="${x.s} out of 5">${stars(x.s)}</span> <b>${esc(x.n)}</b>${x.sample ? " <small>Sample review</small>" : ""}${x.t ? "<br>" + esc(x.t) : ""}</li>`).join("")}</ul>
<form class="rev-form" id="revForm" novalidate><p class="lbl" id="revLbl">Rate this product</p>
<div class="starpick" role="radiogroup" aria-labelledby="revLbl">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-act="star" data-s="${n}" role="radio" aria-checked="false" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`).join("")}</div>
<label class="sr" for="revTxt">Your review</label><textarea id="revTxt" rows="2" maxlength="300" placeholder="Tell others what you think (optional)"></textarea>
<small class="err" id="revErr"></small><button class="btn btn-glow small" type="submit">Post review</button></form></section>`;
  }

  /* ---------- Flash deal (simulated 10-minute timer) ---------- */
  const DEALS = { bottle: 0.15, torch: 0.10, cups: 0.12 }; let dealEnd = Date.now() + 10 * 60000;
  const dealOn = () => Date.now() < dealEnd;
  const price = p => (DEALS[p.id] && dealOn()) ? Math.round(p.p * (1 - DEALS[p.id])) : p.p;
  setInterval(() => {
    const left = dealEnd - Date.now(), el = $("#dealTimer");
    if (!document.getElementById("dealTimer")) return;
    if (left <= 0) { if (el.textContent !== "Deal ended") { el.textContent = "Deal ended"; renderShop(); renderCart(); } return; }
    el.textContent = "Ends in " + Math.floor(left / 60000) + ":" + String(Math.floor(left / 1000) % 60).padStart(2, "0");
  }, 1000);

  /* ---------- Delivery estimate ---------- */
  const rush = () => { const h = new Date().getHours(); return (h >= 8 && h <= 10) || (h >= 17 && h <= 20); };
  const eta = n => 12 + Math.min(n, 10) * 2 + (rush() ? 8 : 0) + delay + zoneEta();

  /* ================= SITUATION-TO-CART ENGINE ================= */
  let current = null;
  const removed = new Set(), extras = new Set(), prefs = { urgency: "today", prio: "price", eco: false, brands: new Set() };
  const chips = $("#chips"), kitEl = $("#kit"), budget = $("#budget"), hint = $("#hint");
  names.forEach(n => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = n;
    b.setAttribute("role", "radio"); b.setAttribute("aria-checked", "false");
    b.addEventListener("click", () => selectSituation(n));
    chips.appendChild(b);
  });

  // Build the kit: swap out-of-stock items, then drop optional items until the budget fits
  function buildKit(name, limit) {
    let items = kitList(name).map(k => {
      const p = P[k.id];
      if (p.st) return { id: p.id, e: k.e, swap: "" };
      return p.alt && P[p.alt].st ? { id: p.alt, e: k.e, swap: p.n } : null;
    }).filter(Boolean);
    const sum = () => items.reduce((t, i) => t + price(P[i.id]), 0), dropped = [];
    while (sum() > limit) {
      const opt = items.filter(i => !i.e).sort((a, b) => price(P[b.id]) - price(P[a.id]))[0];
      if (!opt) break;
      items = items.filter(i => i !== opt); dropped.push(P[opt.id].n);
    }
    return { items, dropped, total: sum() };
  }
  function renderKit() {
    if (!current) return;
    const limit = +budget.value, k = kitView();
    kitEl.innerHTML = k.items.length ? "" : '<li class="empty">Your kit is empty. Add items from the add-ons below.</li>';
    k.items.forEach(i => {
      const p = P[i.id], li = document.createElement("li");
      if (i.swap) li.className = "swap";
      const left = document.createElement("span");
      left.insertAdjacentHTML("beforeend", imgTag(p) + " "); left.append(p.n);
      if (i.swap) { const t = document.createElement("span"); t.className = "tag"; t.textContent = "Substitute"; left.appendChild(t); }
      const sm = document.createElement("small");
      sm.textContent = i.swap ? i.swap + " is out of stock" : (i.e ? "Essential, in stock" : "Optional, in stock");
      left.appendChild(sm);
      const b = document.createElement("b"); b.textContent = rupee(price(p));
      li.dataset.id = i.id; li.draggable = true;
      const x = document.createElement("button"); x.type = "button"; x.className = "kit-x"; x.textContent = "✕"; x.setAttribute("aria-label", "Remove " + p.n);
      x.addEventListener("click", () => { removed.add(i.id); extras.delete(i.id); renderKit(); });
      li.append(left, b, x); kitEl.appendChild(li);
    });
    $("#total").textContent = rupee(k.total);
    $("#kitTitle").textContent = current + " kit";
    $("#eta").textContent = "Delivery in about " + eta(k.items.length) + " min";
    let msg = k.dropped.length ? "Removed to fit your budget: " + k.dropped.join(", ") + ". " : "";
    if (k.total > limit) msg += "This kit costs " + rupee(k.total) + ", above your budget. Remove items or raise it.";
    $("#note").textContent = msg;
    renderTray();
  }
  function selectSituation(n) {
    current = n; removed.clear(); extras.clear(); store.set("lastSit", n);
    $$(".chip", chips).forEach(c => c.setAttribute("aria-checked", String(c.textContent === n)));
    hint.textContent = "Showing the " + n + " kit. Add it to your cart, then try “My Situation Changed”.";
    renderKit();
  }
  budget.addEventListener("input", () => { $("#budgetVal").textContent = rupee(+budget.value); renderKit(); });

  // Replace only the previous kit's items; everything else in the cart stays
  function addKit() {
    if (!current) { showToast("Pick a situation first."); return false; }
    Object.keys(cart).forEach(id => { if (cart[id].kit) delete cart[id]; });
    kitView().items.forEach(i => {
      if (cart[i.id]) { cart[i.id].kit = current; cart[i.id].e = i.e; } else cart[i.id] = { q: 1, e: i.e, kit: current };
    });
    saveCart(); bump();
    return true;
  }
  $("#addKitBtn").addEventListener("click", () => { if (addKit()) { showToast(current + " kit added to cart"); openCart(); } });
  $("#changeBtn").addEventListener("click", () => {
    if (!current) { showToast("Pick a situation first."); return; }
    const had = Object.values(cart).some(c => c.kit), from = current;
    const others = names.filter(n => n !== current);
    selectSituation(others[Math.floor(Math.random() * others.length)]);
    if (had) { addKit(); showToast("Cart rebuilt: " + from + " → " + current + ". Other items kept."); }
    else showToast("Switched to " + current + ". Add a kit to see the cart rebuild.");
  });

  // Natural-language and voice requests
  function parseRequest(text) {
    const t = text.toLowerCase(), bm = t.match(/(?:under|below|within|upto|up to|₹|rs\.?)\s*(\d{2,5})/);
    let best = null, score = 0;
    names.forEach(n => { const c = KW[n].filter(k => t.includes(k)).length; if (c > score) { score = c; best = n; } });
    if (!best) { hint.textContent = "Try words like power cut, guests, rain, school project, birthday, travel or cleaning."; showToast("No matching situation found"); return; }
    if (bm) { budget.value = Math.min(3000, Math.max(100, +bm[1])); $("#budgetVal").textContent = rupee(+budget.value); }
    selectSituation(best);
    showToast("Built: " + best + (bm ? " under " + rupee(+budget.value) : ""));
  }
  $("#nlBtn").addEventListener("click", () => parseRequest($("#nl").value));
  $("#nl").addEventListener("keydown", e => { if (e.key === "Enter") parseRequest(e.target.value); });
  $("#micBtn").addEventListener("click", () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast("Voice input isn't supported in this browser. Type your request instead."); return; }
    const r = new SR(); r.lang = "en-IN";
    r.onresult = e => { const t = e.results[0][0].transcript; $("#nl").value = t; parseRequest(t); };
    r.onerror = () => showToast("Couldn't hear that. Check microphone permission or type instead.");
    r.start(); showToast("Listening…");
  });

  /* ================= SHOP: search, filters, products ================= */
  const q = $("#q"), sugg = $("#sugg"), grid = $("#products");
  const fCat = $("#fCat"), fSort = $("#fSort"), fStock = $("#fStock"), fWish = $("#fWish"), fEco = $("#fEco"), fPrice = $("#fPrice");
  CATS.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; fCat.appendChild(o); });
  const lev = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  };
  function matches(p, s, need) {
    if (!s || need.has(p.id)) return true;
    const hay = (p.n + " " + p.brand + " " + p.cat).toLowerCase();
    if (hay.includes(s)) return true;
    return s.length > 3 && hay.split(/\W+/).some(w => w.length > 2 && lev(w, s) <= 1);   // spelling tolerant
  }
  function renderShop() {
    renderPopular();
    if (!document.getElementById("products")) return;
    const s = q.value.trim().toLowerCase(), need = new Set();
    const words = s.split(/\W+/);
    if (s) needIds(s).forEach(id => need.add(id));
    if (s) names.forEach(n => { if (KW[n].some(k => s.includes(k) || words.some(w => w.length > 3 && lev(w, k) <= 1))) kitList(n).forEach(i => need.add(i.id)); });   // search by need
    let list = Object.values(P).filter(p => matches(p, s, need) && (!fCat.value || p.cat === fCat.value) && (!fStock.checked || p.st) && (!fWish.checked || wish.includes(p.id)) && (!fEco.checked || p.g <= 8) && price(p) <= +fPrice.value);
    const sort = fSort.value;
    if (sort === "lo") list.sort((a, b) => price(a) - price(b)); else if (sort === "hi") list.sort((a, b) => price(b) - price(a)); else if (sort === "rt") list.sort((a, b) => rate(b) - rate(a));
    grid.innerHTML = list.length ? list.map(card).join("") : '<div class="empty-state"><div class="illus" aria-hidden="true">🔍</div><p>No products match. Try another word, a bigger price limit, or a need like “rain”.</p><button class="btn btn-glow small" data-act="clear" type="button">Clear all filters</button></div>';
  }
  function card(p) {
    const alt = p.alt && P[p.alt], w = wish.includes(p.id), pr = price(p), off = Math.round((1 - pr / p.mrp) * 100), deal = DEALS[p.id] && dealOn();
    return `<article class="pcard card glass" data-id="${p.id}"><div class="pimg">${imgTag(p, p.n)}</div><h3>${p.n}</h3>
<p class="meta">${p.brand} – ${starLine(p)}</p>
<p class="pr"><b>${rupee(pr)}</b><s>${rupee(p.mrp)}</s>${off > 0 ? '<span class="tag">−' + off + "%</span>" : ""}${deal ? '<span class="tag">Deal</span>' : ""}${p.g <= 5 ? '<span class="tag eco">🌱 Eco</span>' : ""}</p>
${p.st ? '<span class="ok">In stock – delivery in about ' + eta(1) + " min</span>" : '<span class="oos">Out of stock' + (alt ? " – try " + alt.n : "") + "</span>"}
<div class="pact"><span class="cq"><button type="button" data-act="qm" aria-label="Fewer">−</button><b>1</b><button type="button" data-act="qp" aria-label="More">+</button></span><button class="btn btn-glow small" data-act="add" ${p.st ? "" : "disabled"}>Add</button><button class="btn btn-ghost small" data-act="view">Details</button><button class="btn btn-ghost small qa" data-act="cmp">Compare</button>
<button class="heart" data-act="wish" aria-pressed="${w}" aria-label="${w ? "Remove" : "Save"} ${p.n}">${w ? "♥" : "♡"}</button></div></article>`;
  }
  function toggleWish(id) { wish = wish.includes(id) ? wish.filter(x => x !== id) : [id, ...wish]; store.set("wish", wish); renderShop(); renderFavs(); }
  const onCard = e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "clear") { clearFilters(); return; }
    const c = b.closest(".pcard"), id = c.dataset.id, qb = c.querySelector(".cq b");
    if (b.dataset.act === "qm") qb.textContent = Math.max(1, +qb.textContent - 1);
    else if (b.dataset.act === "qp") qb.textContent = Math.min(20, +qb.textContent + 1);
    else if (b.dataset.act === "add") addItem(id, +qb.textContent);
    else if (b.dataset.act === "wish") toggleWish(id);
    else if (b.dataset.act === "cmp") openCompare(id);
    else openPdp(id);
  };
  grid.addEventListener("click", onCard);
  ["popular", "dealZone", "rails"].forEach(i => { const el = document.getElementById(i); if (el) el.addEventListener("click", onCard); });
  [fCat, fSort, fStock, fWish, fEco].forEach(el => el.addEventListener("change", renderShop));
  fPrice.addEventListener("input", () => { $("#fPriceVal").textContent = rupee(+fPrice.value); renderShop(); });

  // Autocomplete + recent searches
  function showSugg() {
    const s = q.value.trim().toLowerCase();
    let opts = s ? [...names.filter(n => n.toLowerCase().includes(s) || KW[n].some(k => s.includes(k))), ...Object.values(P).filter(p => matches(p, s, new Set())).map(p => p.n), ...CATS.filter(c => c.toLowerCase().includes(s))] : searches;
    opts = [...new Set(opts)].slice(0, 6);
    sugg.innerHTML = opts.map(o => `<li role="option" data-v="${o}">${sIcon(o)} ${o}</li>`).join("");
    sugg.hidden = !opts.length;
  }
  function remember(s) { if (!s) return; searches = [s, ...searches.filter(x => x !== s)].slice(0, 5); store.set("searches", searches); }
  q.addEventListener("input", () => { showSugg(); renderShop(); });
  q.addEventListener("focus", showSugg);
  q.addEventListener("keydown", e => { if (e.key === "Enter") { remember(q.value.trim()); sugg.hidden = true; } if (e.key === "Escape") sugg.hidden = true; });
  sugg.addEventListener("mousedown", e => { const li = e.target.closest("li"); if (li) { q.value = li.dataset.v; remember(q.value); sugg.hidden = true; renderShop(); } });
  document.addEventListener("click", e => { if (!e.target.closest(".search")) sugg.hidden = true; });

  // Delivery PIN check (demo rule: pin codes starting with 1 are served)
  $("#pinBtn").addEventListener("click", () => {
    const v = $("#pin").value.trim(), m = $("#pinMsg");
    if (!/^\d{6}$/.test(v)) { pinOk = null; m.textContent = "Enter a 6-digit PIN code."; return; }
    pinOk = v[0] === "1";
    m.textContent = pinMessage(v, pinOk);
    renderCart();
  });
  $("#reorderBtn").addEventListener("click", () => {
    const o = store.get("orders", [])[0];
    if (!o) { showToast("No previous order yet. Place an order first."); return; }
    Object.entries(o.items).forEach(([id, c]) => { if (P[id] && P[id].st) addItem(id, c.q, true); });
    showToast("Last basket added to your cart"); openCart();
  });
  function renderRecent() {
    renderForYou();
    $("#recent").hidden = !recent.length;
    $("#recentList").innerHTML = recent.map(id => `<button type="button" data-id="${id}">${P[id].n}</button>`).join("");
  }
  $("#recentList").addEventListener("click", e => { const b = e.target.closest("button"); if (b) openPdp(b.dataset.id); });

  /* ---------- Product detail dialog ---------- */
  const pdp = $("#pdp");
  let pdpQty = 1;
  function openPdp(id) {
    const p = P[id]; pdpQty = 1; pdpStar = 0;
    recent = [id, ...recent.filter(x => x !== id)].slice(0, 5); store.set("recent", recent); renderRecent();
    const sim = Object.values(P).filter(x => x.cat === p.cat && x.id !== id).slice(0, 3);
    $("#pdpBody").innerHTML = `<div class="pdp-img">${imgTag(p, p.n)}</div><h3>${p.n}</h3><p class="meta">${p.brand} – ${starLine(p)}</p>
<p class="pr"><b>${rupee(price(p))}</b><s>${rupee(p.mrp)}</s></p>
<p>${p.st ? '<span class="ok">In stock</span> – delivery in about ' + eta(1) + " min" : '<span class="oos">Out of stock</span>' + (p.alt ? " – substitute: " + P[p.alt].n + " (" + rupee(price(P[p.alt])) + ")" : "")}</p>
<p class="hint">Packaging plastic: about ${p.g} g (estimate). Replacement within 48 hours if damaged.</p>
<div class="qty"><button type="button" data-act="qm" aria-label="Decrease">−</button><b id="pdpQ">1</b><button type="button" data-act="qp" aria-label="Increase">+</button>
<button class="btn btn-glow small" type="button" data-act="add" ${p.st ? "" : "disabled"}>Add to cart</button>
<button class="btn btn-ghost small" type="button" data-act="wish">${wish.includes(id) ? "Saved ♥" : "Save ♡"}</button>${p.alt ? '<button class="btn btn-ghost small" type="button" data-act="cmp">Compare swap</button>' : ""}</div>
<p class="similar">Similar: ${sim.map(x => `<button class="chip" type="button" data-act="sim" data-id="${x.id}">${x.n}</button>`).join(" ")}</p>`;
    pdp.dataset.id = id; $("#pdpBody").insertAdjacentHTML("beforeend", reviewsHTML(p)); if (!pdp.open) pdp.showModal();
  }
  pdp.addEventListener("click", e => {
    const b = e.target.closest("[data-act],[data-close]"), id = pdp.dataset.id;
    if (!b) return;
    if (b.hasAttribute("data-close")) pdp.close();
    else if (b.dataset.act === "qm") { pdpQty = Math.max(1, pdpQty - 1); $("#pdpQ").textContent = pdpQty; }
    else if (b.dataset.act === "qp") { pdpQty = Math.min(20, pdpQty + 1); $("#pdpQ").textContent = pdpQty; }
    else if (b.dataset.act === "add") { addItem(id, pdpQty); pdp.close(); }
    else if (b.dataset.act === "wish") { toggleWish(id); openPdp(id); }
    else if (b.dataset.act === "star") { pdpStar = +b.dataset.s; $$("#revForm .starpick button").forEach(x => { x.classList.toggle("on", +x.dataset.s <= pdpStar); x.setAttribute("aria-checked", String(+x.dataset.s === pdpStar)); }); $("#revErr").textContent = ""; }
    else if (b.dataset.act === "sim") openPdp(b.dataset.id);
    else if (b.dataset.act === "cmp") openCompare(id);
    else if (b.dataset.act === "use") useAlt(id, b.dataset.id);
  });

  pdp.addEventListener("submit", e => {
    if (!e.target.matches("#revForm")) return;
    e.preventDefault();
    const id = pdp.dataset.id;
    if (!pdpStar) { $("#revErr").textContent = "Choose a star rating first."; return; }
    const all = store.get("reviews", {}); (all[id] = all[id] || []).unshift({ s: pdpStar, t: $("#revTxt").value.trim(), n: (store.get("profile", {}).name || "You").split(" ")[0] });
    store.set("reviews", all); showToast("Thanks for your review!");
    openPdp(id); renderShop(); if (curOrder && trkStep === 3) renderRate();
  });

  /* ================= CART ================= */
  const drawer = $("#drawer"), overlay = $("#overlay");
  const saveCart = () => { store.set("cart", cart); renderAll(); };
  function addItem(id, qty, quiet) {
    const p = P[id];
    if (!p.st) { showToast(p.n + " is out of stock" + (p.alt ? ". Try " + P[p.alt].n : "")); return; }
    if (cart[id]) cart[id].q = Math.min(20, cart[id].q + qty); else cart[id] = { q: qty, e: 0, kit: "" };
    saveCart(); bump(); if (!quiet) showToast(p.n + " added to cart");
  }
  function bump() { const b = $("#cartBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  function openCart() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false"); overlay.hidden = false; $("#closeCart").focus(); }
  function closeCart() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true"); overlay.hidden = true; }
  $("#cartBtn").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

  function totals() {
    let sub = 0, n = 0, g = 0;
    Object.entries(cart).forEach(([id, c]) => { sub += price(P[id]) * c.q; n += c.q; g += P[id].g * c.q; });
    const disc = discountFor(sub);
    const del = !sub || coupon === "FREEDEL" || coupon === "FREESHIP" || sub >= 499 ? 0 : 30;
    return { sub, n, g, disc, del, tot: sub - disc + del };
  }
  function renderCart() {
    const ids = Object.keys(cart), t = totals();
    $("#cartCount").textContent = t.n; $("#bnCount").textContent = t.n;
    const list = $("#cartList");
    list.innerHTML = ids.length ? ids.map(id => {
      const p = P[id], c = cart[id], alt = p.alt && P[p.alt];
      if (!p.st) return `<li class="warn" data-id="${id}"><div class="top"><span>${imgTag(p)} ${p.n}</span><b>Unavailable</b></div><p>Out of stock.${alt && alt.st ? " Suggested: " + alt.n + " at " + rupee(price(alt)) + "." : ""}</p>${alt && alt.st ? '<button class="swap" data-act="swap">Approve swap</button> <button class="swap" data-act="cmp">Compare</button>' : ""}<div class="ctl"><button class="rm" data-act="rm">Remove</button></div></li>`;
      return `<li data-id="${id}"><div class="top"><span>${imgTag(p)} ${p.n}${c.kit ? ' <span class="tag">' + c.kit + "</span>" : ""}</span><b>${rupee(price(p) * c.q)}</b></div>
<div class="ctl"><button data-act="dec" aria-label="Decrease ${p.n}">−</button><b>${c.q}</b><button data-act="inc" aria-label="Increase ${p.n}">+</button><button class="rm" data-act="rm">Remove</button></div></li>`;
    }).join("") : '<li class="empty-state"><div class="illus" aria-hidden="true">🛒</div><p>Your cart is empty.</p><p><a class="btn btn-glow small" href="situations.html">Build a kit</a> <a class="btn btn-ghost small" href="shop.html">Browse the shop</a></p></li>';
    $("#sSub").textContent = rupee(t.sub); $("#sDisc").textContent = "−" + rupee(t.disc);
    $("#sDel").textContent = t.del ? rupee(t.del) : "Free"; $("#sTot").textContent = rupee(t.tot);
    renderCartExtras(t);
    const eco = ecoCalc(t);
    $("#green").textContent = t.n ? "EcoDrop score: " + eco.score + "/100 (about " + t.g + " g of packaging plastic, estimated). Everything ships together in one delivery. You will earn " + eco.pts + " points" + (eco.score >= 70 ? ", including an eco bonus." : ".") + (cart.water && !cart.bottle ? " Tip: a reusable bottle cuts packaging." : "") : "";
    $("#cartEta").textContent = t.n ? "Estimated delivery: about " + eta(t.n) + " min." + (pinOk === false ? " We don't deliver to your PIN code yet." : "") : "";
    $("#checkoutBtn").disabled = !t.n;
  }
  $("#cartList").addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const id = b.closest("li").dataset.id, c = cart[id], a = b.dataset.act;
    if (a === "inc") c.q = Math.min(20, c.q + 1);
    else if (a === "dec") { c.q -= 1; if (c.q < 1) delete cart[id]; }
    else if (a === "rm") delete cart[id];
    else if (a === "cmp") { openCompare(id); return; }
    else if (a === "swap") {
      const alt = P[id].alt, old = cart[id]; delete cart[id];
      if (cart[alt]) cart[alt].q += old.q; else cart[alt] = { q: old.q, e: old.e, kit: old.kit };
      showToast("Swapped to " + P[alt].n + ". Total updated.");
    }
    saveCart();
  });
  $("#couponBtn").addEventListener("click", () => {
    const v = $("#coupon").value.trim().toUpperCase(), n = $("#cartNote");
    if (v === "LIFE10") { coupon = v; n.textContent = "LIFE10: 10% off orders of ₹300 or more."; }
    else if (v === "FREEDEL") { coupon = v; n.textContent = "FREEDEL: free delivery."; }
    else if (v === "SURPRISE10" && store.get("surpriseDay", "") === dayKey()) { coupon = v; n.textContent = "SURPRISE10: 10% off orders of ₹200 or more, today only."; }
    else if (WALLET[v] && wallet().includes(v)) { coupon = v; n.textContent = v + ": " + WALLET[v].label + "."; }
    else { coupon = ""; n.textContent = "That coupon isn't valid. Try LIFE10 or FREEDEL, or redeem points for more."; }
    renderCart();
  });
  // Budget Rescue: use cheaper in-stock alternatives first, then drop optional items
  $("#rescueBtn").addEventListener("click", () => {
    const lim = +$("#cartBudget").value, n = $("#cartNote");
    if (!lim) { n.textContent = "Enter the most you want to spend."; return; }
    const notes = [];
    Object.keys(cart).forEach(id => {
      const a = P[id].alt && P[P[id].alt];
      if (totals().sub > lim && a && a.st && price(a) < price(P[id])) { const o = cart[id]; delete cart[id]; cart[a.id] = cart[a.id] || { q: 0, e: o.e, kit: o.kit }; cart[a.id].q += o.q; notes.push("swapped " + P[id].n + " for " + a.n); }
    });
    while (totals().sub > lim) {
      const ids = Object.keys(cart).filter(i => !cart[i].e && !cart[i].kit || (cart[i].kit && !cart[i].e));
      if (!ids.length) break;
      ids.sort((a, b) => price(P[b]) * cart[b].q - price(P[a]) * cart[a].q);
      notes.push("removed " + P[ids[0]].n); delete cart[ids[0]];
    }
    const sub = totals().sub;
    n.textContent = (notes.length ? "Rescue: " + notes.join(", ") + ". " : "") + (sub <= lim ? "Subtotal is now " + rupee(sub) + "." : "Essentials still cost " + rupee(sub) + ", above your budget.");
    saveCart();
  });

  /* ================= CHECKOUT + SIMULATED TRACKING ================= */
  const co = $("#co"), track = $("#track"), STEPS = ["Order placed", "Packing your kit", "Out for delivery", "Delivered"];
  let trkTimer, trkStep = 0, trkBase = 20, trkHold = false, curOrder = null;
  function setErr(id, msg) {
    const input = $("#" + id), err = $("#" + id + "Err");
    err.textContent = msg; input.classList.toggle("bad", !!msg); input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  $("#checkoutBtn").addEventListener("click", () => {
    const t = totals(); if (!t.n) return;
    if (Object.keys(cart).some(i => !P[i].st)) { $("#cartNote").textContent = "Resolve unavailable items (approve a swap or remove them) before checkout."; return; }
    const a = store.get("addr", {}); $("#coName").value = a.name || ""; $("#coPin").value = a.pin || $("#pin").value; $("#coAddr").value = a.addr || "";
    $("#coSummary").textContent = t.n + " items, total " + rupee(t.tot) + " (taxes included).";
    fillSummary(); resetCheckout(); closeCart(); co.showModal();
  });
  co.addEventListener("click", e => { if (e.target.closest("[data-close]")) co.close(); });
  $("#coForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#coName").value.trim(), pin = $("#coPin").value.trim(), addr = $("#coAddr").value.trim();
    const a = setErr("coName", name.length < 2 ? "Enter your name." : ""),
      b = setErr("coPin", !/^\d{6}$/.test(pin) ? "Enter a 6-digit PIN code." : (pin[0] !== "1" ? "We don't deliver to this PIN code yet (we serve PIN codes starting with 1)." : "")),
      c = setErr("coAddr", addr.length < 8 ? "Enter your full address." : "");
    const later = $('input[name="coWhen"]:checked').value === "later", sc = later ? schedCheck() : { date: "", time: "" };
    const d = setErr("coDate", sc.date), tm = setErr("coTime", sc.time);
    if (!(a && b && c && d && tm)) { $(".bad", co).focus(); return; }
    store.set("addr", { name, pin, addr });
    const t = totals(), order = { id: "LD" + Math.floor(1000 + Math.random() * 9000), items: cart, total: t.tot, n: t.n, eta: eta(t.n), pts: ecoCalc(t).pts, at: Date.now(), saved: savedOf(t), sched: later ? { date: $("#coDate").value, time: $("#coTime").value, label: $("#coTime").selectedOptions[0].textContent } : null };
    addPoints(order.pts, "Order " + order.id);
    if (ecoCalc(t).score >= 70) store.set("ecoN", store.get("ecoN", 0) + 1);
    const orders = store.get("orders", []); orders.unshift(order); store.set("orders", orders.slice(0, 20));
    useCoupon(); cart = {}; coupon = ""; saveCart(); store.set("lastOrder", order); store.set("fresh", order.id);
    showConfirm(order); setTimeout(() => { location.href = "tracking.html"; }, reduce ? 300 : 1700);
  });
  function ymd(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function schedText(s) { return new Date(s.date + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) + ", " + s.label; }
  function renderTrack() {
    const fin = trkStep === 3 && !trkHold;
    $("#timeline").innerHTML = STEPS.map((s, i) => { const d = trkHold ? i === 0 : (fin || i < trkStep), now = !trkHold && !fin && i === trkStep; return `<li class="${d ? "done" : now ? "now" : ""}">${d ? "✓ " : ""}${s}</li>`; }).join("");
    const pct = trkHold ? 0 : trkStep / 3 * 100;
    $("#routeBar").style.width = pct + "%"; $("#rider").style.left = pct + "%"; drawMap();
    const left = Math.max(0, trkBase + delay - trkStep * Math.round(trkBase / 3));
    $("#trkEta").textContent = trkHold ? "Booked for " + schedText(curOrder.sched) + ". Live tracking starts close to your delivery time." : fin ? "Delivered. Thank you for shopping with LifeDrop." : "Estimated arrival in about " + left + " min.";
    $("#trkDelivered").hidden = !fin; $("#trkSched").hidden = !trkHold; $("#trkPreview").hidden = !trkHold; $("#trkRate").hidden = !fin;
    if (fin) { $("#trkDelTxt").textContent = "Order " + curOrder.id + " reached your door."; renderRate(); }
  }
  function renderRate() {
    const ids = Object.keys(curOrder.items || {}).filter(id => P[id]);
    $("#trkRateList").innerHTML = ids.map(id => `<li><span>${imgTag(P[id])} ${P[id].n}</span><button class="btn btn-ghost small" type="button" data-id="${id}">${userRev(id).length ? "Reviewed ✓" : "Rate and review"}</button></li>`).join("");
  }
  $("#trkRateList").addEventListener("click", e => {
    const b = e.target.closest("[data-id]"); if (!b) return;
    openPdp(b.dataset.id); setTimeout(() => { const f = document.getElementById("revForm"); if (f) f.scrollIntoView({ block: "center" }); }, 60);
  });
  $("#trkPreview").addEventListener("click", () => { if (curOrder) startTracking(curOrder, true); });
  function startTracking(o, live) {
    curOrder = o; trkHold = !!o.sched && !live; trkStep = 0; delay = 0; trkBase = o.eta;
    $("#trkCard").hidden = false; $("#trkEmpty").hidden = true;
    $("#trkTitle").textContent = "Order " + o.id + ": " + o.n + " items, " + rupee(o.total);
    if (o.sched) $("#trkSched").innerHTML = "<b>📅 Booked for " + schedText(o.sched) + "</b><small>We will pack your kit in time. This is a prototype, so use the preview button to watch the delivery journey.</small>";
    renderTrack(); clearInterval(trkTimer);
    if (trkHold) return;
    trkTimer = setInterval(() => { if (trkStep < 3) trkStep++; renderTrack(); if (trkStep === 3) { clearInterval(trkTimer); showToast("Order " + o.id + " delivered ✓"); } }, reduce ? 1500 : 3500);
  }

  /* ---------- Shared re-render ---------- */
  function renderAll() { renderCart(); renderShop(); renderKit(); }

  /* ---------- FAQ accordion ---------- */
  $$(".faq-q").forEach(btn => btn.addEventListener("click", () => btn.setAttribute("aria-expanded", String(btn.getAttribute("aria-expanded") !== "true"))));

  /* ---------- Contact form (front-end only) ---------- */
  const form = $("#form"), status = $("#status");
  form.addEventListener("submit", e => {
    e.preventDefault(); status.textContent = "";
    const name = $("#name").value.trim(), email = $("#email").value.trim(), msg = $("#msg").value.trim();
    const a = setErr("name", name.length < 2 ? "Enter your name (at least 2 characters)." : ""),
      b = setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email, like name@example.com."),
      c = setErr("msg", msg.length < 10 ? "Write a message of at least 10 characters." : "");
    if (a && b && c) { const sb = $(".btn", form); sb.classList.add("loading"); sb.disabled = true; setTimeout(() => { sb.classList.remove("loading"); sb.disabled = false; form.reset(); status.textContent = "Thank you, " + name + "! We've got your message."; showToast("Message sent"); }, 700); }
    else $(".bad", form).focus();
  });
  $$("[data-social]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); showToast("Our " + a.dataset.social + " page is coming soon."); }));

  /* ===== Need-It-Now search, availability by PIN code, assistant baskets ===== */
  const NEEDS = [
    [/charg|phone|battery|power ?bank/, ["bank5", "bank10", "pouch"]],
    [/breakfast|morning/, ["milk", "bread", "tea", "biscuits"]],
    [/rain|monsoon|wet/, ["umbrella", "raincoat", "poncho", "pouch", "towel"]],
    [/movie|snack|netflix/, ["chips", "namkeen", "cola", "snacks", "biscuits"]],
    [/light|dark|torch|lamp/, ["torch", "lantern", "headlamp", "candles"]],
    [/clean|dust|mop/, ["cloth", "bags", "sanitiser"]],
    [/bag|reusable|eco/, ["jute", "bottle"]]
  ];
  function needIds(t) { const ids = new Set(); NEEDS.forEach(([re, list]) => { if (re.test(t)) list.forEach(id => ids.add(id)); }); return [...ids].filter(id => P[id]); }
  function recCards(ids) {
    const w = document.createElement("div"); w.className = "rec";
    w.innerHTML = ids.map(id => `<div class="rc">${imgTag(P[id])}<span>${P[id].n}</span><b>${rupee(price(P[id]))}</b></div>`).join("");
    return w;
  }
  function sayBasket(ids, limit) {
    const lim = limit || 99999, pick = []; let total = 0;
    [...new Set(ids.map(id => P[id].st ? id : P[id].alt).filter(Boolean))].sort((a, b) => rate(P[b]) - rate(P[a])).forEach(id => { if (total + price(P[id]) <= lim) { pick.push(id); total += price(P[id]); } });
    if (!pick.length) { say("Nothing matching fits " + rupee(lim) + ". Try a slightly higher budget.", "bot"); return; }
    const d = say("Suggested basket: " + pick.length + " items, total " + rupee(total) + (limit ? " (budget " + rupee(limit) + ")" : "") + ".", "bot");
    const a = document.createElement("button"); a.className = "chip"; a.type = "button"; a.textContent = "Add basket to my cart";
    a.addEventListener("click", () => { pick.forEach(id => addItem(id, 1, true)); showToast("Basket added to your cart"); openCart(); });
    d.append(recCards(pick), a);
  }
  // Service areas: delivery time and the products available for each PIN code area
  const ZONES = { "110": ["Delhi", 0, []], "121": ["Faridabad", 4, ["icepack", "fruit"]], "122": ["Gurugram", 6, ["lantern"]], "201": ["Noida", 8, ["cloth"]], "default": ["your area", 12, ["icepack", "fruit", "lantern"]] };
  const zoneOf = pin => ZONES[pin.slice(0, 3)] || ZONES["default"];
  const validPin = pin => /^\d{6}$/.test(pin) && pin[0] === "1";
  function zoneEta() { const p = store.get("pin", ""); return validPin(p) ? zoneOf(p)[1] : 0; }
  function applyZone() { const p = store.get("pin", ""); if (validPin(p)) zoneOf(p)[2].forEach(id => { if (P[id]) P[id].st = 0; }); }
  function refreshStock() {
    RAW.split("\n").forEach(l => { const a = l.split("|"); P[a[0]].st = +a[6]; });
    Object.entries(store.get("ovr", {})).forEach(([id, o]) => { if (P[id] && o.st !== undefined) P[id].st = o.st; });
    applyZone();
  }
  function pinMessage(v, ok) {
    if (!ok) return "Sorry, we don't deliver to this PIN code yet. We currently serve PIN codes starting with 1.";
    store.set("pin", v); refreshStock(); renderAll(); $("#navEta").textContent = navChip();
    const z = zoneOf(v), n = Object.values(P).filter(p => p.st).length;
    return "Delivering to " + z[0] + " (" + v + "): " + n + " of " + Object.keys(P).length + " products available, about " + eta(5) + " min.";
  }
  function navChip() { const p = store.get("pin", ""); return "📍 " + (validPin(p) ? zoneOf(p)[0] + ": about " + eta(5) + " min" : "Delivery in about " + eta(5) + " min"); }
  if (store.get("pin", "")) { $("#pin").value = store.get("pin", ""); pinOk = validPin(store.get("pin", "")); }
  const savedOf = t => Math.max(0, Object.entries(cart).reduce((s, [id, c]) => s + P[id].mrp * c.q, 0) - t.sub) + t.disc;
  function drawSavings() {
    const os = store.get("orders", []), tot = os.reduce((t, o) => t + (o.saved || 0), 0);
    $("#savedTotal").textContent = rupee(tot);
    $("#savedList").innerHTML = os.filter(o => o.saved).map(o => `<li>Order ${o.id}: saved ${rupee(o.saved)}</li>`).join("") || "<li>Your savings will appear here after your first order.</li>";
  }

  /* ===== Smart Combo Builder ===== */
  const COMBOS = {
    "Movie night": [["chips", 3], ["cola", 4], ["namkeen", 4], ["biscuits", 5], ["cups", 6]],
    "Breakfast": [["milk", 2], ["bread", 3], ["tea", 4], ["biscuits", 4], ["fruit", 6]],
    "Birthday party": [["balloons", 10], ["cups", 6], ["cola", 4], ["snacks", 4], ["candles", 12]],
    "Rainy day": [["umbrella", 2], ["towel", 2], ["tea", 4], ["snacks", 4]],
    "Study session": [["chart", 3], ["pens", 3], ["glue", 4], ["scissors", 4], ["snacks", 4]],
    "Power cut": [["torch", 3], ["candles", 6], ["water", 3], ["bank5", 2], ["matches", 8]]
  };
  let cb = [];
  function buildCombo() {
    const people = +$("#cbPeople").value, limit = +$("#cbBudget").value;
    $("#cbPeopleVal").textContent = people; $("#cbBudgetVal").textContent = rupee(limit);
    cb = COMBOS[$("#cbOcc").value].map(([id, per]) => { const p = P[id], u = p.st ? id : (p.alt && P[p.alt].st ? p.alt : null); return u ? { id: u, q: Math.ceil(people / per) } : null; }).filter(Boolean);
    const sum = () => cb.reduce((t, i) => t + price(P[i.id]) * i.q, 0);
    while (sum() > limit) {
      const big = cb.filter(i => i.q > 1).sort((a, b) => price(P[b.id]) * b.q - price(P[a.id]) * a.q)[0];
      if (big) big.q--; else { const d = cb.slice().sort((a, b) => price(P[b.id]) - price(P[a.id]))[0]; if (!d) break; cb = cb.filter(i => i !== d); }
    }
    renderCombo();
  }
  function renderCombo() {
    if (!document.getElementById("cbList")) return;
    const total = cb.reduce((t, i) => t + price(P[i.id]) * i.q, 0), limit = +$("#cbBudget").value;
    $("#cbList").innerHTML = cb.length ? cb.map(i => `<li data-id="${i.id}"><span>${imgTag(P[i.id])} ${P[i.id].n}<small>${rupee(price(P[i.id]))} each</small></span><span class="cq"><button type="button" data-d="-1" aria-label="Fewer ${P[i.id].n}">−</button><b>${i.q}</b><button type="button" data-d="1" aria-label="More ${P[i.id].n}">+</button></span><b>${rupee(price(P[i.id]) * i.q)}</b></li>`).join("") : '<li class="empty">Nothing fits that budget. Raise it a little.</li>';
    $("#cbTotal").textContent = rupee(total);
    $("#cbNote").textContent = total > limit ? "Over budget by " + rupee(total - limit) + ". Reduce quantities or raise the budget." : "Within your " + rupee(limit) + " budget. Edit quantities if you like.";
  }
  if (document.getElementById("cbOcc")) {
    Object.keys(COMBOS).forEach(o => { const op = document.createElement("option"); op.textContent = o; $("#cbOcc").appendChild(op); });
    ["cbOcc", "cbPeople", "cbBudget"].forEach(id => $("#" + id).addEventListener("input", buildCombo));
    $("#cbList").addEventListener("click", e => {
      const b = e.target.closest("[data-d]"); if (!b) return;
      const it = cb.find(i => i.id === b.closest("li").dataset.id); it.q += +b.dataset.d;
      if (it.q < 1) cb = cb.filter(i => i !== it);
      renderCombo();
    });
    $("#cbAdd").addEventListener("click", () => { if (!cb.length) return; cb.forEach(i => addItem(i.id, i.q, true)); showToast("Combo added to your cart"); openCart(); });
    buildCombo();
  }

  /* ===== Surprise Drop (daily bundle) ===== */
  const BUNDLES = [["Movie Night Bundle", ["chips", "cola", "namkeen", "biscuits"]], ["Rainy Day Bundle", ["umbrella", "towel", "tea", "snacks"]], ["Power-Safe Bundle", ["torch", "candles", "water", "bank5"]], ["Study Sprint Bundle", ["chart", "pens", "glue", "scissors"]], ["Fresh Start Breakfast", ["milk", "bread", "tea", "fruit"]]];
  function dayKey() { return new Date().toISOString().slice(0, 10); }
  if (store.get("surpriseDay", "") === dayKey() && store.get("coupon", "") === "SURPRISE10") coupon = "SURPRISE10";
  $("#dropBtn").addEventListener("click", () => {
    const [name, ids] = BUNDLES[Math.floor(Date.now() / 86400000) % BUNDLES.length], items = ids.map(id => P[id].st ? id : P[id].alt).filter(Boolean);
    const sum = items.reduce((t, id) => t + price(P[id]), 0), claimed = store.get("surpriseDay", "") === dayKey();
    $("#dropBody").innerHTML = `<h3>${name}</h3><div id="dropRec"></div><p>Regular price <s>${rupee(sum)}</s>, with today's drop <b>${rupee(Math.round(sum * 0.9))}</b>.</p><p class="hint">Conditions: 10% off your cart with code SURPRISE10, for orders of ₹200 or more, today only. One claim per day.</p><button class="btn btn-glow" type="button" id="dropAdd" ${claimed ? "disabled" : ""}>${claimed ? "Claimed today" : "Add bundle and claim 10% off"}</button>`;
    $("#dropRec").replaceWith(Object.assign(recCards(items), { id: "dropRec" }));
    $("#dropAdd").addEventListener("click", () => { items.forEach(id => addItem(id, 1, true)); store.set("surpriseDay", dayKey()); store.set("coupon", "SURPRISE10"); coupon = "SURPRISE10"; renderCart(); showToast("Bundle added. 10% off applied"); openCart(); });
    $("#dropBody").hidden = false; $("#dropBtn").hidden = true;
  });

  /* ===== Home page: featured product, parallax, cinematic banner, scroll colours ===== */
  if (document.getElementById("featAdd")) {
    const fp = P.lantern;
    $("#featPrice").textContent = rupee(price(fp)); $("#featMrp").textContent = rupee(fp.mrp);
    $("#featOff").textContent = Math.round((1 - price(fp) / fp.mrp) * 100) + "% OFF";
    $("#featAdd").addEventListener("click", () => addItem("lantern", 1));
  }
  const hv = document.querySelector(".hero-visual"), heroEl = document.querySelector(".hero");
  if (heroEl && hv && !reduce) heroEl.addEventListener("mousemove", e => {
    const r = heroEl.getBoundingClientRect();
    hv.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 2);
    hv.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  const slides = $$(".cine-slide");
  if (slides.length) {
    const dots = $$(".cine-dots button"); let si = 0;
    const showSlide = i => { si = (i + slides.length) % slides.length; slides.forEach((s, k) => s.classList.toggle("on", k === si)); dots.forEach((d, k) => d.setAttribute("aria-current", String(k === si))); };
    dots.forEach((d, k) => d.addEventListener("click", () => showSlide(k)));
    if (!reduce) setInterval(() => { if (!document.querySelector(".cine:hover")) showSlide(si + 1); }, 5000);
    showSlide(0);
  }
  let hueTick = false;
  window.addEventListener("scroll", () => {
    if (hueTick) return; hueTick = true;
    requestAnimationFrame(() => { const m = document.documentElement.scrollHeight - window.innerHeight; document.documentElement.style.setProperty("--hue", String(200 + (m > 0 ? window.scrollY / m : 0) * 160)); hueTick = false; });
  }, { passive: true });

  /* ===== Live Mission Control map ===== */
  function drawMap() {
    const p = $("#mcPath"); if (!p.getTotalLength) return;
    const len = p.getTotalLength(), f = trkStep / 3, pt = p.getPointAtLength(len * f);
    $("#mcRider").setAttribute("transform", `translate(${pt.x} ${pt.y})`);
    $("#mcDone").style.strokeDasharray = len; $("#mcDone").style.strokeDashoffset = len * (1 - f);
    const left = Math.max(0, trkBase + delay - trkStep * Math.round(trkBase / 3));
    const fin = trkStep === 3 && !trkHold;
    $("#mcStatus").textContent = trkHold ? "Scheduled" : fin ? "✓ Delivered" : STEPS[trkStep];
    $("#mcEta").textContent = trkHold && curOrder && curOrder.sched ? schedText(curOrder.sched) : fin ? "Arrived" : left + " min";
    $("#mcStatus").parentElement.classList.toggle("ok", fin); $("#mcTick").style.display = fin ? "" : "none";
    $("#mcDist").textContent = trkHold ? "–" : trkStep === 3 ? "0 km" : (4.2 * (1 - f)).toFixed(1) + " km";
  }

  /* ===== Favourites ===== */
  function renderFavs() {
    $("#favCount").textContent = wish.length;
    const ul = $("#favList"), ids = wish.filter(id => P[id]);
    ul.innerHTML = ids.length ? '<li class="fav-top"><button class="btn btn-glow small" type="button" data-fav="all">Add all to cart</button></li>' + ids.map(id => { const p = P[id]; return `<li class="card glass" data-id="${id}"><span>${imgTag(p)} <b>${p.n}</b><small>${rupee(price(p))}${p.st ? "" : " – out of stock"}</small></span><span class="fav-act"><button class="btn btn-glow small" type="button" data-fav="add" ${p.st ? "" : "disabled"}>Add</button><button class="btn btn-ghost small" type="button" data-fav="view">Details</button><button class="heart" type="button" data-fav="rm" aria-label="Remove ${p.n} from favourites">♥</button></span></li>`; }).join("")
      : '<li class="empty-state"><div class="illus" aria-hidden="true">♡</div><p>No favourites yet. Tap the heart on any product to save it here.</p><p><a class="btn btn-glow small" href="shop.html">Browse the shop</a></p></li>';
  }
  $("#favBtn").addEventListener("click", () => { renderFavs(); $("#favs").showModal(); });
  $("#favs").addEventListener("click", e => {
    const b = e.target.closest("[data-close],[data-fav]"); if (!b) return;
    if (b.hasAttribute("data-close")) { $("#favs").close(); return; }
    const li = b.closest("li"), id = li && li.dataset.id, a = b.dataset.fav;
    if (a === "all") { wish.filter(i => P[i] && P[i].st).forEach(i => addItem(i, 1, true)); showToast("Favourites added to your cart"); $("#favs").close(); openCart(); }
    else if (a === "add") addItem(id, 1);
    else if (a === "view") { $("#favs").close(); openPdp(id); }
    else if (a === "rm") toggleWish(id);
  });
  renderFavs();
  $$(".cnt[data-cat]").forEach(el => { el.textContent = Object.values(P).filter(p => p.cat === el.dataset.cat).length + " products"; });

  /* ===== Situation Builder Studio, control panel, rails, filter chips, rewards dashboard ===== */
  const CAT_ICON = { Groceries: "🛒", School: "✏️", Emergency: "🔦", Celebrations: "🎈", Travel: "☂️", Home: "🧽" };
  const sIcon = o => names.includes(o) ? "✦" : CATS.includes(o) ? CAT_ICON[o] : ((Object.values(P).find(p => p.n === o) || {}).e || "🕘");

  // The kit as shown: engine result minus removed items plus items added from the tray
  function kitView() {
    const k = buildKit(current, +budget.value);
    const items = k.items.filter(i => !removed.has(i.id) && (prefs.urgency !== "now" || i.e));
    extras.forEach(id => { if (P[id].st && !items.some(i => i.id === id)) items.push({ id, e: 0, swap: "" }); });
    return { items, dropped: k.dropped, total: items.reduce((t, i) => t + price(P[i.id]), 0) };
  }
  function renderTray() {
    const tray = document.getElementById("tray"); if (!tray || !current) return;
    const inKit = new Set(kitView().items.map(i => i.id));
    const list = Object.values(P).filter(p => p.st && !inKit.has(p.id) && (!prefs.eco || p.g <= 10));
    list.sort((a, b) => (prefs.brands.has(b.brand) - prefs.brands.has(a.brand)) || (prefs.prio === "price" ? price(a) - price(b) : prefs.prio === "rating" ? rate(b) - rate(a) : a.g - b.g));
    tray.innerHTML = list.slice(0, 8).map(p => `<li class="tray-item" draggable="true" data-id="${p.id}"><span>${imgTag(p)} ${p.n}<small>${p.brand} – ${rupee(price(p))}</small></span><button type="button" class="chip" data-add="${p.id}" aria-label="Add ${p.n} to your kit">Add</button></li>`).join("");
  }
  $("#tray").addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) { extras.add(b.dataset.add); removed.delete(b.dataset.add); renderKit(); } });
  $("#tray").addEventListener("dragstart", e => { const li = e.target.closest("[data-id]"); if (li) e.dataTransfer.setData("text/plain", "add:" + li.dataset.id); });
  kitEl.addEventListener("dragstart", e => { const li = e.target.closest("[data-id]"); if (li) e.dataTransfer.setData("text/plain", "rm:" + li.dataset.id); });
  [[kitEl, "add"], [$("#tray"), "rm"]].forEach(([zone, mode]) => {
    zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drop"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("drop"));
    zone.addEventListener("drop", e => {
      e.preventDefault(); zone.classList.remove("drop");
      const [m, id] = (e.dataTransfer.getData("text/plain") || "").split(":");
      if (!current || !P[id]) return;
      if (mode === "add" && m === "add") { extras.add(id); removed.delete(id); }
      else if (mode === "rm" && m === "rm") { removed.add(id); extras.delete(id); } else return;
      renderKit();
    });
  });

  // Smart Shopping Control Panel: urgency, priority, eco toggle and preferred brands
  const URG = [["now", "Right now (essentials only)"], ["hour", "Within the hour"], ["today", "Today (full kit)"]];
  const PRIO = [["price", "Lowest price"], ["rating", "Top rated"], ["eco", "Least packaging"]];
  function radioChips(el, list, key) {
    el.innerHTML = "";
    list.forEach(([v, t]) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = t;
      b.setAttribute("role", "radio"); b.setAttribute("aria-checked", String(prefs[key] === v));
      b.addEventListener("click", () => { prefs[key] = v; radioChips(el, list, key); renderKit(); });
      el.appendChild(b);
    });
  }
  if (document.getElementById("urgency")) {
    radioChips($("#urgency"), URG, "urgency"); radioChips($("#prio"), PRIO, "prio");
    [...new Set(Object.values(P).map(p => p.brand))].slice(0, 10).forEach(br => {
      const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = br; b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => { if (prefs.brands.has(br)) prefs.brands.delete(br); else prefs.brands.add(br); b.setAttribute("aria-pressed", String(prefs.brands.has(br))); renderKit(); });
      $("#brands").appendChild(b);
    });
    $("#ctlEco").addEventListener("change", e => { prefs.eco = e.target.checked; renderKit(); });
  }

  // Carousels and removable filter chips
  function railHTML(title, ids, empty) {
    return `<h3 class="rail-title">${title}</h3>` + (ids.length ? `<div class="rail" tabindex="0" role="region" aria-label="${title}">${ids.map(id => card(P[id])).join("")}</div>` : `<p class="hint">${empty}</p>`);
  }
  function renderRails() {
    const el = document.getElementById("rails"); if (!el) return;
    const sl = [...el.querySelectorAll(".rail")].map(r => r.scrollLeft);
    const sit = store.get("lastSit", ""), has = !!KITS[sit], kit = has ? kitList(sit).map(i => i.id) : [];
    const chips = `<div class="chips" role="group" aria-label="Choose your situation">${names.map(n => `<button class="chip" type="button" data-sit="${n}" aria-pressed="${n === sit}">${n}</button>`).join("")}</div>`;
    el.innerHTML = '<h3 class="rail-title">Your situation</h3>' + chips
      + (has ? railHTML("Picked for your situation: " + sit, kit.map(id => P[id].st ? id : P[id].alt).filter(Boolean), "")
           + railHTML("Complete your kit", kit.filter(id => !cart[id] && P[id].st), "Your cart already has everything from the " + sit + " kit.")
         : '<p class="hint">Select a situation above to see picks for it and what is missing from your kit.</p>')
      + railHTML("Recently viewed", recent, "Products you open will appear here.");
    el.querySelectorAll(".rail").forEach((r, i) => { r.scrollLeft = sl[i] || 0; });
  }
  $("#rails").addEventListener("click", e => {
    const b = e.target.closest("[data-sit]"); if (!b) return;
    store.set("lastSit", store.get("lastSit", "") === b.dataset.sit ? "" : b.dataset.sit); renderRails();
  });
  function renderChips() {
    const el = document.getElementById("fChips"); if (!el) return;
    const f = [];
    if (q.value.trim()) f.push(["q", "Search: " + q.value.trim()]);
    if (fCat.value) f.push(["cat", fCat.value]);
    if (fStock.checked) f.push(["stock", "In stock only"]);
    if (fWish.checked) f.push(["wish", "Saved only"]);
    if (fEco.checked) f.push(["eco", "Low packaging"]);
    if (+fPrice.value < 1000) f.push(["price", "Up to " + rupee(+fPrice.value)]);
    el.innerHTML = f.length ? f.map(([k, t]) => `<button class="chip" type="button" data-f="${k}" aria-label="Remove filter: ${t}">${t} ✕</button>`).join(" ") + ' <button class="chip" type="button" data-f="all">Clear all</button>' : "";
  }
  function clearFilters(k) {
    const all = !k || k === "all";
    if (all || k === "q") q.value = "";
    if (all || k === "cat") fCat.value = "";
    if (all || k === "stock") fStock.checked = false;
    if (all || k === "wish") fWish.checked = false;
    if (all || k === "eco") fEco.checked = false;
    if (all || k === "price") { fPrice.value = 1000; $("#fPriceVal").textContent = rupee(1000); }
    renderShop();
  }
  $("#fChips").addEventListener("click", e => { const b = e.target.closest("[data-f]"); if (b) clearFilters(b.dataset.f); });

  // Cart extras: savings, free-delivery progress, animated total; checkout summary
  function renderCartExtras(t) {
    const mrp = Object.entries(cart).reduce((s, [id, c]) => s + P[id].mrp * c.q, 0);
    $("#sSave").textContent = rupee(Math.max(0, mrp - t.sub) + t.disc);
    const free = coupon === "FREEDEL" || coupon === "FREESHIP" || t.sub >= 499;
    $("#fbFill").style.width = (t.sub ? (free ? 100 : Math.min(100, t.sub / 499 * 100)) : 0) + "%";
    $("#fbText").textContent = !t.sub ? "" : free ? "You've unlocked free delivery." : rupee(499 - t.sub) + " more to unlock free delivery.";
    const tot = $("#sTot"); tot.classList.remove("tot-pop"); void tot.offsetWidth; tot.classList.add("tot-pop");
  }
  function fillSummary() {
    const t = totals();
    $("#coItems").innerHTML = Object.entries(cart).map(([id, c]) => `<li>${imgTag(P[id])} ${P[id].n} × ${c.q}<b>${rupee(price(P[id]) * c.q)}</b></li>`).join("")
      + `<li>Delivery<b>${t.del ? rupee(t.del) : "Free"}</b></li>` + (t.disc ? `<li>Discount<b>−${rupee(t.disc)}</b></li>` : "") + `<li class="big">Total<b>${rupee(t.tot)}</b></li>`;
  }

  // Rewards dashboard: animated count, circular progress, achievements
  function countTo(el, n) {
    if (reduce || n < 1) { el.textContent = n; return; }
    const t0 = performance.now();
    (function f(now) { const p = Math.min((now - t0) / 900, 1); el.textContent = Math.round(n * p); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  function drawRewards() {
    const p = getPts(); countTo($("#ptsNow"), p);
    const next = Object.values(WALLET).map(w => w.cost).sort((a, b) => a - b).find(c => c > p);
    $("#ringFill").style.strokeDashoffset = String(327 * (1 - (next ? Math.min(1, p / next) : 1)));
    $("#nextReward").textContent = next ? (next - p) + " points to your next reward" : "You can redeem every reward";
    const orders = store.get("orders", []), log = store.get("ptlog", []);
    const A = [["🏁", "First order", orders.length > 0], ["🌱", "Eco shopper", store.get("ecoN", 0) > 0], ["🙋", "Profile complete", store.get("profDone", false)], ["🎟️", "Coupon collector", log.some(l => /Redeemed/.test(l.why))]];
    $("#achv").innerHTML = A.map(([i, t, ok]) => `<li class="card glass ach ${ok ? "on" : ""}"><span aria-hidden="true">${i}</span><b>${t}</b><small>${ok ? "Unlocked" : "Locked"}</small></li>`).join("");
  }

  /* ===== Theme, header, bottom navigation, hero text ===== */
  const root = document.documentElement;
  const THEMES = [["dark", "🌙", "Dark"], ["light", "☀️", "Light"], ["editorial", "📰", "Editorial"], ["pastel", "🌸", "Pastel"]];
  function setTheme(t) {
    const i = Math.max(0, THEMES.findIndex(x => x[0] === t)), cur = THEMES[i], nxt = THEMES[(i + 1) % THEMES.length];
    root.dataset.theme = cur[0] === "dark" ? "dark" : "light"; root.dataset.skin = cur[0]; store.set("theme", cur[0]);
    const b = $("#themeBtn"); b.textContent = cur[1]; b.setAttribute("aria-label", "Theme: " + cur[2] + ". Switch to " + nxt[2]);
  }
  setTheme(store.get("theme", "dark"));
  $("#themeBtn").addEventListener("click", () => { const i = THEMES.findIndex(x => x[0] === root.dataset.skin); setTheme(THEMES[(i + 1) % THEMES.length][0]); });
  $("#navEta").textContent = navChip();
  $("#bnCart").addEventListener("click", openCart);
  $$("[data-open-budget]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); openCart(); $("#cartBudget").focus(); }));
  const rot = document.querySelector(".hero h1 .grad");
  if (rot && !reduce) {
    const ph = [rot.textContent, "Power cut. Guests. Rain.", "Your situation. Your basket."]; let pi = 0;
    rot.style.transition = "opacity .4s";
    setInterval(() => { rot.style.opacity = 0; setTimeout(() => { pi = (pi + 1) % ph.length; rot.textContent = ph[pi]; rot.style.opacity = 1; }, 400); }, 3800);
  }
  ["Build an emergency kit", "Help me stay under ₹300", "Find a replacement"].forEach(txt => {
    const b = document.createElement("button"); b.type = "button"; b.className = "chip"; b.textContent = txt;
    b.addEventListener("click", () => { say(txt, "me"); reply(txt); });
    $("#botChips").appendChild(b);
  });

  /* ===== Store overrides (set from the admin page) ===== */
  Object.entries(store.get("ovr", {})).forEach(([id, o]) => { if (P[id]) { if (o.p) P[id].p = o.p; if (o.st !== undefined) P[id].st = o.st; } });
  applyZone();

  /* ===== Rewards, EcoDrop and coupon wallet ===== */
  const WALLET = {
    SAVE50: { cost: 150, off: 50, min: 400, label: "₹50 off orders of ₹400 or more" },
    SAVE100: { cost: 280, off: 100, min: 800, label: "₹100 off orders of ₹800 or more" },
    FREESHIP: { cost: 60, label: "Free delivery on one order" }
  };
  const getPts = () => store.get("pts", 0), wallet = () => store.get("wallet", []);
  function addPoints(n, why) {
    if (!n) return;
    store.set("pts", getPts() + n);
    const h = store.get("ptlog", []); h.unshift({ n, why }); store.set("ptlog", h.slice(0, 15));
  }
  function ecoCalc(t) { const score = Math.max(0, 100 - Math.round(t.g / 3)); return { score, pts: Math.floor(t.tot / 10) + (t.n && score >= 70 ? 20 : 0) }; }
  function discountFor(sub) {
    if (coupon === "SURPRISE10") return store.get("surpriseDay", "") === dayKey() && sub >= 200 ? Math.round(sub * 0.1) : 0;
    if (coupon === "LIFE10" && sub >= 300) return Math.round(sub * 0.1);
    const w = WALLET[coupon]; return w && w.off && sub >= w.min ? w.off : 0;
  }
  function useCoupon() { if (coupon === "SURPRISE10") store.set("coupon", ""); const w = wallet(), i = w.indexOf(coupon); if (i > -1) { w.splice(i, 1); store.set("wallet", w); } }
  function renderRewards() {
    if (!document.getElementById("rewardList")) return;
    drawRewards(); drawSavings();
    $("#rewardList").innerHTML = Object.entries(WALLET).map(([c, w]) => `<li class="card glass"><b>${c}</b><span>${w.label}</span><button class="btn btn-glow small" type="button" data-code="${c}" ${getPts() < w.cost ? "disabled" : ""}>Redeem for ${w.cost} points</button></li>`).join("");
    const wl = wallet();
    $("#walletList").innerHTML = wl.length ? wl.map(c => `<li class="card glass"><b>${c}</b><span>${WALLET[c].label}. Enter it in your cart.</span></li>`).join("") : '<li class="card glass">No coupons yet. Redeem your points above.</li>';
    const log = store.get("ptlog", []);
    $("#ptsLog").innerHTML = log.length ? log.map(l => `<li>${l.n > 0 ? "+" : ""}${l.n} points: ${l.why}</li>`).join("") : "<li>Your points history will appear here.</li>";
  }
  $("#rewardList").addEventListener("click", e => {
    const b = e.target.closest("[data-code]"); if (!b) return;
    const c = b.dataset.code, w = WALLET[c];
    if (getPts() < w.cost) return;
    addPoints(-w.cost, "Redeemed " + c); const wl = wallet(); wl.push(c); store.set("wallet", wl);
    showToast(c + " added to your coupons"); renderRewards();
  });

  /* ===== Smart Swap comparison ===== */
  const pack = p => (p.n.match(/\(([^)]+)\)/) || p.n.match(/(\d[\d,.]*\s?(?:L|kg|g|mAh|ml)\b.*)$/) || [0, "Standard"])[1];
  function openCompare(id) {
    const o = P[id], cols = [o];
    if (o.alt && P[o.alt]) cols.push(P[o.alt]);
    Object.values(P).filter(x => x.cat === o.cat && x.st && !cols.includes(x)).slice(0, 2).forEach(x => cols.push(x));
    const row = (k, f) => `<tr><th scope="row">${k}</th>${cols.map(c => `<td>${f(c)}</td>`).join("")}</tr>`;
    $("#pdpBody").innerHTML = `<h3>Compare and swap</h3><div class="tbl-wrap"><table class="tbl"><thead><tr><th></th>${cols.map((c, i) => `<th scope="col">${imgTag(c)} ${c.n}${i ? "" : " (original)"}</th>`).join("")}</tr></thead><tbody>
${row("Price", c => rupee(price(c)))}${row("Price difference", c => c === o ? "–" : (price(c) - price(o) >= 0 ? "+" : "−") + rupee(Math.abs(price(c) - price(o))))}${row("Pack", pack)}${row("Rating", c => "⭐ " + rate(c).toFixed(1))}${row("Packaging plastic", c => c.g + " g")}${row("Availability", c => c.st ? "In stock" : "Out of stock")}
<tr><th scope="row"></th>${cols.map((c, i) => `<td>${i && c.st ? `<button class="btn btn-glow small" type="button" data-act="use" data-id="${c.id}">Replace item</button>` : ""}</td>`).join("")}</tr></tbody></table></div>`;
    pdp.dataset.id = id; if (!pdp.open) pdp.showModal();
  }
  function useAlt(orig, alt) {
    if (cart[orig]) { const o = cart[orig]; delete cart[orig]; if (cart[alt]) cart[alt].q += o.q; else cart[alt] = { q: o.q, e: o.e, kit: o.kit }; saveCart(); showToast("Swapped to " + P[alt].n); }
    else addItem(alt, 1);
    pdp.close(); openCart();
  }

  /* ===== Home page: popular products, Quick Deal Zone, personalised section ===== */
  function renderPopular() {
    const pop = document.getElementById("popular"), dz = document.getElementById("dealZone");
    if (pop) pop.innerHTML = Object.values(P).filter(p => p.st).sort((a, b) => rate(b) - rate(a)).slice(0, 4).map(card).join("");
    if (dz) dz.innerHTML = Object.keys(DEALS).map(id => card(P[id])).join("");
    renderRails(); renderChips();
  }
  function reorderLast() {
    const o = store.get("orders", [])[0];
    if (!o) { showToast("No previous order yet. Place an order first."); return; }
    Object.entries(o.items).forEach(([id, c]) => { if (P[id] && P[id].st) addItem(id, c.q, true); });
    showToast("Last basket added to your cart"); openCart();
  }
  function renderForYou() {
    const el = document.getElementById("forYou"); if (!el) return;
    const orders = store.get("orders", []);
    if (!store.get("pers", true)) { el.innerHTML = '<p class="hint">Personalisation is off. You can turn it on in your account.</p>'; return; }
    el.innerHTML = (recent.length ? "<p>Recently viewed</p>" + recent.map(id => `<button class="chip" type="button" data-id="${id}">${P[id].n}</button>`).join(" ") : '<p class="hint">Products you view will show up here.</p>')
      + (orders.length ? `<p><button class="btn btn-ghost small" type="button" id="fyReorder">Reorder last basket (${orders[0].n} items)</button></p>` : "")
      + "<p>Popular kits</p>" + ["Power cut", "Unexpected guests", "Rain emergency"].map(n => `<a class="chip" href="situations.html?s=${encodeURIComponent(n)}">${n}</a>`).join(" ")
      + '<p class="hint">Based on your activity on this device. <button class="chip" type="button" id="fyClear">Clear my activity</button></p>';
  }
  $("#forYou").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.id) openPdp(b.dataset.id);
    else if (b.id === "fyReorder") reorderLast();
    else if (b.id === "fyClear") { recent = []; searches = []; store.set("recent", recent); store.set("searches", searches); renderRecent(); showToast("Your activity was cleared"); }
  });
  $("#heroSearch").addEventListener("submit", e => {
    e.preventDefault(); const v = $("#heroQ").value.trim();
    if (v && (/(?:under|below|within|upto|₹|rs\.?)\s*\d/i.test(v) || v.split(/\s+/).length >= 5)) { toggleBot(true); say(v, "me"); reply(v); return; }
    location.href = "shop.html" + (v ? "?q=" + encodeURIComponent(v) : "");
  });
  $("#heroEta").textContent = eta(5);

  /* ===== Checkout progress and confirmation ===== */
  function stepsBar(a) { $$("#coSteps li").forEach((li, i) => { li.className = i < a ? "done" : i === a ? "now" : ""; }); }
  function resetCheckout() { stepsBar(1); $("#coForm").style.display = ""; $("#coDone").style.display = "none"; initSchedule(); }
  function toggleWhen() { const later = $('input[name="coWhen"]:checked').value === "later"; $("#coNow").hidden = later; $("#coLater").hidden = !later; }
  function fillTimes() {
    const now = new Date(), today = $("#coDate").value === ymd(now), min = now.getHours() * 60 + now.getMinutes() + 30, sel = $("#coTime"), keep = sel.value;
    let h = ""; for (let hr = 8; hr <= 21; hr++) h += `<option value="${String(hr).padStart(2, "0")}:00"${today && hr * 60 < min ? " disabled" : ""}>${(hr + 11) % 12 + 1}:00 ${hr < 12 ? "AM" : "PM"}</option>`;
    sel.innerHTML = '<option value="">Select a time</option>' + h; if (keep) sel.value = keep;
  }
  function initSchedule() {
    const now = new Date(), tom = new Date(Date.now() + 864e5);
    $("#coDate").min = ymd(now); $("#coDate").max = ymd(new Date(Date.now() + 7 * 864e5));
    $("#coDate").value = now.getHours() >= 20 ? ymd(tom) : ymd(now);
    $('input[name="coWhen"][value="now"]').checked = true; toggleWhen(); fillTimes();
    ["coDate", "coTime"].forEach(id => setErr(id, ""));
  }
  function schedCheck() {
    const d = $("#coDate").value, t = $("#coTime").value, now = new Date(), r = { date: "", time: "" };
    if (!d) r.date = "Pick a delivery day."; else if (d < ymd(now)) r.date = "Choose today or a later day.";
    if (!t) r.time = "Pick a delivery time."; else if (d === ymd(now) && +t.slice(0, 2) * 60 < now.getHours() * 60 + now.getMinutes() + 30) r.time = "Choose a time at least 30 minutes from now.";
    return r;
  }
  $$('input[name="coWhen"]').forEach(r => r.addEventListener("change", toggleWhen));
  $("#coDate").addEventListener("change", fillTimes);
  function showConfirm(o) {
    stepsBar(3); $("#coForm").style.display = "none"; $("#coDone").style.display = "block";
    $("#coDoneTxt").textContent = "Order " + o.id + ". " + (o.sched ? "Booked for " + schedText(o.sched) + ". " : "") + "You earned " + o.pts + " reward points.";
  }

  /* ===== LifeDrop assistant (rule-based) ===== */
  const bot = $("#bot"), botLog = $("#botLog");
  function say(text, who) { const d = document.createElement("div"); d.className = "msg from-" + who; d.textContent = text; botLog.appendChild(d); botLog.scrollTop = botLog.scrollHeight; return d; }
  function addKitFor(name, limit) {
    Object.keys(cart).forEach(id => { if (cart[id].kit) delete cart[id]; });
    buildKit(name, limit).items.forEach(i => { if (cart[i.id]) { cart[i.id].kit = name; cart[i.id].e = i.e; } else cart[i.id] = { q: 1, e: i.e, kit: name }; });
    saveCart(); bump();
  }
  function sayKit(name, limit) {
    const lim = limit || 99999, k = buildKit(name, lim);
    const d = say(name + ": " + k.items.map(i => P[i.id].n).join(", ") + ". Total " + rupee(k.total) + (limit ? " (budget " + rupee(limit) + ")" : "") + ".", "bot");
    const a = document.createElement("button"); a.className = "chip"; a.type = "button"; a.textContent = "Add this kit to my cart";
    a.addEventListener("click", () => { addKitFor(name, lim); showToast(name + " kit added to your cart"); openCart(); });
    const l = document.createElement("a"); l.className = "chip"; l.href = "situations.html?s=" + encodeURIComponent(name); l.textContent = "Customise it";
    d.append(recCards(k.items.map(i => i.id)), a, " ", l);
  }
  function reply(text) {
    const t = text.toLowerCase(), bm = t.match(/(?:under|below|within|upto|up to|₹|rs\.?)\s*(\d{2,5})/), mins = t.match(/(\d+)\s*min/);
    let best = null, score = 0;
    names.forEach(n => { const c = KW[n].filter(k => t.includes(k)).length; if (c > score) { score = c; best = n; } });
    if (/emergency kit/.test(t)) { say("Here is an emergency kit for a power cut.", "bot"); sayKit("Power cut", bm ? +bm[1] : 0); return; }
    if (/replace|substitut|swap/.test(t)) {
      const ids = Object.keys(cart).filter(i => P[i].alt && P[P[i].alt]);
      if (!ids.length) { say("Nothing in your cart needs a replacement right now. If an item sells out, I will suggest an alternative.", "bot"); return; }
      const id = ids.find(i => !P[i].st) || ids[0], alt = P[P[id].alt];
      const d = say(P[id].n + (P[id].st ? " has an alternative: " : " is out of stock. Suggested: ") + alt.n + " (" + rupee(price(alt)) + ").", "bot");
      const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.textContent = "Compare and replace";
      b.addEventListener("click", () => openCompare(id)); d.append(document.createElement("br"), b); return;
    }
    if (bm && !best && !needIds(t).length && /under|below|within|budget|stay/.test(t)) {
      if (!Object.keys(cart).length) { say("Your cart is empty. Tell me the situation too, for example “power cut under ₹" + bm[1] + "”.", "bot"); return; }
      $("#cartBudget").value = bm[1]; $("#rescueBtn").click(); openCart(); say("I ran Budget Rescue for " + rupee(+bm[1]) + ". Check your cart.", "bot"); return;
    }
    if (best) { say(mins ? "In " + mins[1] + " minutes every minute counts, so here is a quick kit." : "Here is what I would suggest.", "bot"); sayKit(best, bm ? +bm[1] : 0); return; }
    const nid = needIds(t);
    if (nid.length) { say("Here is what I found for that.", "bot"); sayBasket(nid, bm ? +bm[1] : 0); return; }
    const words = t.split(/\W+/).filter(w => w.length > 3);
    const hit = Object.values(P).filter(p => words.some(w => p.n.toLowerCase().includes(w))).slice(0, 3);
    if (hit.length) { say("I found " + hit.map(p => p.n + " (" + rupee(price(p)) + ")").join(", ") + ". You can add them from the shop.", "bot"); return; }
    say("I can build a kit for a power cut, guests, rain, a school project, a birthday, travel or cleaning. Tell me what happened, and add a budget like “under ₹500” if you like.", "bot");
  }
  function toggleBot(open) {
    if (!open && vr) stopVoice(false);
    bot.hidden = !open; $("#botBtn").setAttribute("aria-expanded", String(open));
    if (open) { if (!botLog.children.length) say("Hi! Tell me what happened, for example “guests arriving in 20 minutes”, and I will build your basket.", "bot"); $("#botIn").focus(); }
  }
  $("#botBtn").addEventListener("click", () => toggleBot(bot.hidden));
  $("#botClose").addEventListener("click", () => toggleBot(false));
  $$("[data-open-bot]").forEach(b => b.addEventListener("click", () => toggleBot(true)));
  $("#botForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#botIn").value.trim(); if (!v) return; say(v, "me"); $("#botIn").value = ""; reply(v); });

  /* ===== Voice recorder in the assistant ===== */
  let vr = null;
  const botMic = $("#botMic");
  botMic.addEventListener("click", () => { if (vr) stopVoice(true); else startVoice(); });
  async function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition, canRec = !!(navigator.mediaDevices && window.MediaRecorder);
    if (!SR && !canRec) { say("Voice recording isn't supported in this browser. Please type your message.", "bot"); return; }
    const s = vr = { text: "", chunks: [], t0: Date.now(), stream: null, mr: null, sr: null };
    if (canRec) {
      try {
        s.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        s.mr = new MediaRecorder(s.stream); s.mr.ondataavailable = e => { if (e.data && e.data.size) s.chunks.push(e.data); }; s.mr.start();
      } catch (_) { s.mr = null; if (!SR) { vr = null; say("I couldn't reach your microphone. Allow microphone access and try again.", "bot"); return; } }
    }
    if (SR) {
      try { const r = new SR(); r.lang = "en-IN"; r.interimResults = true; r.continuous = true; r.onresult = e => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; s.text = t.trim(); }; r.onerror = () => { }; r.start(); s.sr = r; } catch (_) { s.sr = null; }
    }
    if (vr !== s) return;
    botMic.classList.add("on"); botMic.textContent = "⏹"; botMic.setAttribute("aria-label", "Stop and send voice message"); $("#botRec").hidden = false;
    const tick = () => { const sec = Math.floor((Date.now() - s.t0) / 1000); $("#botRecTxt").textContent = "Recording " + Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0") + ". Tap ⏹ to send."; };
    tick(); s.tick = setInterval(tick, 500);
  }
  function stopVoice(send) {
    const s = vr; if (!s) return; vr = null; clearInterval(s.tick);
    botMic.classList.remove("on"); botMic.textContent = "🎙️"; botMic.setAttribute("aria-label", "Record a voice message"); $("#botRec").hidden = true;
    let pending = (s.mr ? 1 : 0) + (s.sr ? 1 : 0), finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      if (s.stream) s.stream.getTracks().forEach(t => t.stop());
      if (!send) return;
      const blob = s.chunks.length ? new Blob(s.chunks, { type: s.mr.mimeType || "audio/webm" }) : null;
      if (!blob && !s.text) { say("I didn't catch anything. Please try again.", "bot"); return; }
      const d = say(s.text || "🎙️ Voice message", "me");
      if (blob) { const au = document.createElement("audio"); au.controls = true; au.src = URL.createObjectURL(blob); d.appendChild(au); }
      botLog.scrollTop = botLog.scrollHeight;
      if (s.text) reply(s.text); else say("I saved your voice note, but this browser can't turn speech into text. Please type what you need, or try Chrome or Edge.", "bot");
    };
    const done = () => { if (--pending <= 0) finish(); };
    if (s.mr && s.mr.state !== "inactive") { s.mr.onstop = done; try { s.mr.stop(); } catch (_) { done(); } } else if (s.mr) done();
    if (s.sr) { s.sr.onend = done; try { s.sr.stop(); } catch (_) { done(); } }
    if (!pending) finish(); else setTimeout(finish, 1800);
  }

  /* ===== Account page ===== */
  function renderAccount() {
    if (!document.getElementById("profileForm")) return;
    const pr = store.get("profile", {}), os = store.get("orders", []);
    $("#pName").value = pr.name || ""; $("#pEmail").value = pr.email || ""; $("#persOn").checked = store.get("pers", true);
    $("#orderHist").innerHTML = os.length ? os.map((o, i) => `<li class="card glass"><div><b>Order ${o.id}</b>: ${o.n} items, ${rupee(o.total)}${o.sched ? "<br><small>Booked for " + schedText(o.sched) + "</small>" : ""}<br><small>${o.at ? new Date(o.at).toLocaleDateString("en-IN") : ""} ${o.pts || 0} points earned</small></div><button class="btn btn-ghost small" type="button" data-i="${i}">Reorder</button></li>`).join("") : '<li class="card glass">No orders yet. <a href="shop.html">Start shopping</a></li>';
  }
  $("#profileForm").addEventListener("submit", e => {
    e.preventDefault();
    const name = $("#pName").value.trim(), email = $("#pEmail").value.trim();
    const a = setErr("pName", name.length < 2 ? "Enter your name." : ""), b = setErr("pEmail", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Enter a valid email address.");
    if (!(a && b)) return;
    store.set("profile", { name, email }); let msg = "Profile saved.";
    if (!store.get("profDone", false)) { store.set("profDone", true); addPoints(50, "Completed your profile"); msg += " You earned 50 reward points."; }
    $("#pStatus").textContent = msg; showToast(msg);
  });
  $("#persOn").addEventListener("change", e => store.set("pers", e.target.checked));
  $("#orderHist").addEventListener("click", e => {
    const b = e.target.closest("[data-i]"); if (!b) return;
    Object.entries(store.get("orders", [])[+b.dataset.i].items).forEach(([id, c]) => { if (P[id] && P[id].st) addItem(id, c.q, true); });
    showToast("Basket added to your cart"); openCart();
  });
  const prof = store.get("profile", null);
  if (prof && prof.name) $("#acctBtn").textContent = "👤 " + prof.name.split(" ")[0];

  /* ===== Admin page ===== */
  function adminStats() {
    const os = store.get("orders", []), sales = os.reduce((t, o) => t + o.total, 0), qty = {};
    os.forEach(o => Object.entries(o.items).forEach(([id, c]) => { qty[id] = (qty[id] || 0) + c.q; }));
    const best = Object.entries(qty).sort((a, b) => b[1] - a[1]).slice(0, 3).filter(([id]) => P[id]).map(([id, n]) => P[id].n + " (" + n + ")").join(", ") || "No orders yet";
    $("#adminStats").innerHTML = [["Orders", os.length], ["Sales", rupee(sales)], ["Average order", os.length ? rupee(sales / os.length) : "₹0"], ["Out of stock", Object.values(P).filter(p => !p.st).length], ["Best sellers", best]]
      .map(([k, v]) => `<div class="card stat glass"><strong class="sm">${v}</strong><span>${k}</span></div>`).join("");
  }
  function renderAdmin() {
    if (!document.getElementById("adminBody")) return;
    adminStats();
    $("#adminBody").innerHTML = Object.values(P).map(p => `<tr><td>${imgTag(p)} ${p.n}</td><td>${p.cat}</td><td><input type="number" min="1" value="${p.p}" data-id="${p.id}" data-f="p" aria-label="Price of ${p.n}"></td><td><select data-id="${p.id}" data-f="st" aria-label="Stock of ${p.n}"><option value="1" ${p.st ? "selected" : ""}>In stock</option><option value="0" ${p.st ? "" : "selected"}>Out of stock</option></select></td></tr>`).join("");
  }
  $("#adminBody").addEventListener("change", e => {
    const el = e.target; if (!el.dataset.f) return;
    const id = el.dataset.id, o = store.get("ovr", {}); o[id] = o[id] || {};
    if (el.dataset.f === "p") { const v = Math.max(1, +el.value || P[id].p); P[id].p = v; o[id].p = v; } else { P[id].st = +el.value; o[id].st = +el.value; }
    store.set("ovr", o); showToast("Saved. The change applies across the store."); adminStats();
  });
  $("#adminReset").addEventListener("click", () => { store.set("ovr", {}); location.reload(); });

  /* ===== Links with ?s= (situation), ?q= (search), ?cat= (category) ===== */
  const qs = new URLSearchParams(location.search);
  if (qs.get("s") && KITS[qs.get("s")]) selectSituation(qs.get("s"));
  if (qs.get("q")) q.value = qs.get("q");
  if (qs.get("cat")) fCat.value = qs.get("cat");
  renderRewards(); renderAccount(); renderAdmin(); renderPopular(); renderForYou();

  /* ---------- Start: skeletons first, then products ---------- */
  grid.innerHTML = '<div class="skel"></div>'.repeat(8);
  grid.classList.add("stagger"); setTimeout(renderShop, reduce ? 0 : 500); setTimeout(() => grid.classList.remove("stagger"), 2200);
  renderCart(); renderRecent();

  // Tracking page: show the latest demo order
  if (document.getElementById("trkCard")) {
    const o = store.get("lastOrder", null);
    if (o) { startTracking(o); if (store.get("fresh", "")) { showToast("Order " + o.id + " placed. You earned " + (o.pts || 0) + " points!"); store.set("fresh", ""); } }
  }
  // Highlight the current page in the navigation
  const here = location.pathname.split("/").pop() || "index.html";
  $$(".links a, .bottom-nav a").forEach(a => { if (a.getAttribute("href") === here && !a.classList.contains("btn")) a.setAttribute("aria-current", "page"); });
})();
