/* ============================================================
   TUNTASIN — App Logic (Vanilla JS, client-side simulation only)
   ============================================================ */

(() => {
  "use strict";

  const state = {
    currentPage: "beranda",
    tagihan: { category: null, bill: null, refId: null },
    kuliah: { nim: null, data: null, selected: new Set() },
    pulsa: { provider: null, phone: "", mode: "pulsa", nominal: null, paket: null, custom: null },
    pendingTx: null, // draft built before opening payment modal
    payment: { method: null, bank: null, va: null, qr: null, teller: null, qrSecondsLeft: 300 },
    qrTimerHandle: null
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const els = {
    topbarTitle: $("#topbarTitle"),
    topbarEyebrow: $("#topbarEyebrow"),
    appContent: $("#appContent"),
    saldoAmount: $("#saldoAmount"),
    modalOverlay: $("#modalOverlay"),
    modalBox: $("#modalBox")
  };

  const pageMeta = {
    beranda: { eyebrow: "Tuntasin", title: "Selamat datang kembali" },
    tagihan: { eyebrow: "BAYAR TAGIHAN", title: "Pilih layanan" },
    kuliah:  { eyebrow: "KAMPUS", title: "Biaya Kuliah" },
    pulsa:   { eyebrow: "ISI ULANG", title: "Pulsa & Paket Data" },
    riwayat: { eyebrow: "HISTORI", title: "Riwayat Transaksi" },
    profil:  { eyebrow: "AKUN", title: "Profil Saya" },
    bantuan: { eyebrow: "PUSAT BANTUAN", title: "Pertanyaan Umum" }
  };

  /* ============================================================
     NAVIGATION
     ============================================================ */
  function navigateTo(page) {
    state.currentPage = page;
    $all(".page").forEach(p => p.hidden = p.dataset.page !== page);
    $all(".bottom-nav button").forEach(b => {
      const active = b.dataset.nav === page;
      b.classList.toggle("nav-active", active);
      if (active) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
    });
    const meta = pageMeta[page] || pageMeta.beranda;
    els.topbarEyebrow.textContent = meta.eyebrow;
    els.topbarTitle.textContent = meta.title;
    els.appContent.scrollTop = 0;

    if (page === "beranda") renderBeranda();
    if (page === "riwayat") renderRiwayat();
    if (page === "profil") renderProfil();
  }

  $all("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
  });

  $all("[data-quick]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [target, sub] = btn.dataset.quick.split(":");
      navigateTo(target);
      if (target === "tagihan" && sub) openTagihanCategory(sub);
    });
  });

  /* ============================================================
     THEME
     ============================================================ */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = $("#themeToggleBtn i");
    icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
  }
  applyTheme(Utils.getTheme());
  $("#themeToggleBtn").addEventListener("click", () => {
    const next = Utils.getTheme() === "dark" ? "light" : "dark";
    Utils.setTheme(next);
    applyTheme(next);
  });

  /* ============================================================
     BERANDA
     ============================================================ */
  function renderBeranda() {
    els.saldoAmount.textContent = Utils.rupiah(Utils.getSaldo());
    const list = Utils.getTransactions().slice(0, 3);
    const wrap = $("#beranda-riwayat");
    if (!list.length) {
      wrap.innerHTML = `<p class="empty-state">Belum ada transaksi.</p>`;
      return;
    }
    wrap.innerHTML = list.map(trxRowHtml).join("");
  }

  function trxRowHtml(trx) {
    const icons = { listrik: "fa-bolt", pdam: "fa-faucet-drip", internet: "fa-wifi", seminar: "fa-people-group", kuliah: "fa-graduation-cap", pulsa: "fa-signal" };
    return `
      <div class="mini-item">
        <div class="mini-item__icon"><i class="fa-solid ${icons[trx.category] || "fa-receipt"}"></i></div>
        <div class="mini-item__body">
          <div class="mini-item__title">${trx.description}</div>
          <div class="mini-item__sub">${Utils.formatDateTime(trx.timestamp)}</div>
        </div>
        <div class="mini-item__amount">${Utils.rupiah(trx.amount)}</div>
      </div>`;
  }

  $("#topupBtn").addEventListener("click", () => {
    const input = prompt("Masukkan nominal top up (Rp):", "100000");
    if (input === null) return;
    const val = Number(input.replace(/[^0-9]/g, ""));
    if (!val || val < 10000) { Utils.toast("Nominal top up minimal Rp10.000.", "error"); return; }
    Utils.setSaldo(Utils.getSaldo() + val);
    renderBeranda();
    Utils.toast(`Top up ${Utils.rupiah(val)} berhasil.`, "success");
  });

  /* ============================================================
     TAGIHAN
     ============================================================ */
  const tagihanGrid = $("#tagihan-kategori-grid");
  const tagihanFormWrap = $("#tagihan-form-wrap");
  const tagihanInput = $("#tagihanInput");
  const tagihanError = $("#tagihanError");
  const tagihanResult = $("#tagihan-result");

  function openTagihanCategory(cat) {
    state.tagihan.category = cat;
    const meta = categoryLabels[cat];
    tagihanGrid.classList.add("hidden-block");
    tagihanFormWrap.classList.remove("hidden-block");
    $("#tagihanFormIcon").className = "fa-solid " + meta.icon;
    $("#tagihanFormTitle").textContent = meta.title;
    $("#tagihanFormHint").textContent = meta.hint;
    tagihanInput.value = "";
    tagihanInput.placeholder = meta.placeholder;
    tagihanInput.classList.remove("invalid");
    tagihanError.textContent = "";
    tagihanResult.classList.add("hidden-block");
    tagihanResult.innerHTML = "";
    tagihanInput.focus();
  }

  $all(".cat-card").forEach(btn => btn.addEventListener("click", () => openTagihanCategory(btn.dataset.cat)));

  $("#tagihanBackBtn").addEventListener("click", () => {
    tagihanGrid.classList.remove("hidden-block");
    tagihanFormWrap.classList.add("hidden-block");
    state.tagihan.category = null;
  });

  tagihanInput.addEventListener("input", () => {
    tagihanInput.value = tagihanInput.value.toUpperCase();
    const err = Utils.validateCustomerId(tagihanInput.value.trim(), state.tagihan.category);
    tagihanInput.classList.toggle("invalid", !!err && tagihanInput.value.length > 0);
    tagihanError.textContent = tagihanInput.value.length > 0 ? (err || "") : "";
  });

  $("#tagihanCekBtn").addEventListener("click", () => {
    const cat = state.tagihan.category;
    const val = tagihanInput.value.trim();
    const err = Utils.validateCustomerId(val, cat);
    if (err) { tagihanError.textContent = err; tagihanInput.classList.add("invalid"); return; }

    setBtnLoading("#tagihanCekBtn", true);
    tagihanResult.classList.add("hidden-block");
    setTimeout(() => {
      setBtnLoading("#tagihanCekBtn", false);
      const bill = billData[cat][val];
      if (!bill) {
        tagihanError.textContent = "Nomor pelanggan tidak ditemukan. Periksa kembali nomor Anda.";
        return;
      }
      tagihanError.textContent = "";
      state.tagihan.bill = bill;
      state.tagihan.refId = val;
      renderTagihanResult(cat, val, bill);
    }, 1000 + Math.random() * 400);
  });

  function renderTagihanResult(cat, refId, bill) {
    const total = bill.amount + (bill.fine || 0);
    tagihanResult.classList.remove("hidden-block");
    tagihanResult.innerHTML = `
      <div class="result-card">
        <div class="result-card__row"><span>Nama Pelanggan</span><span>${bill.name}</span></div>
        <div class="result-card__row"><span>Periode</span><span>${bill.period}</span></div>
        <div class="result-card__row"><span>Tagihan Pokok</span><span>${Utils.rupiah(bill.amount)}</span></div>
        ${bill.fine ? `<div class="result-card__row"><span>Denda</span><span>${Utils.rupiah(bill.fine)}</span></div>` : ""}
        <div class="result-card__row"><span>Jatuh Tempo</span><span>${Utils.formatDate(bill.due)}</span></div>
        <div class="result-card__total"><span>Total Bayar</span><strong>${Utils.rupiah(total)}</strong></div>
        <button class="btn btn--primary btn--block" id="tagihanLanjutBtn">Lanjut Bayar</button>
      </div>`;
    $("#tagihanLanjutBtn").addEventListener("click", () => {
      openPaymentModal({
        category: cat,
        description: `${categoryLabels[cat].title} — ${refId}`,
        customerName: bill.name,
        amount: total,
        refId
      });
    });
  }

  /* ============================================================
     KULIAH / SPP
     ============================================================ */
  const nimInput = $("#nimInput");
  const nimError = $("#nimError");
  const kuliahResult = $("#kuliah-result");

  nimInput.addEventListener("input", () => {
    nimInput.value = nimInput.value.replace(/[^0-9]/g, "");
    const err = Utils.validateNIM(nimInput.value);
    nimInput.classList.toggle("invalid", !!err && nimInput.value.length > 0);
    nimError.textContent = nimInput.value.length > 0 ? (err || "") : "";
  });

  $("#nimCekBtn").addEventListener("click", () => {
    const nim = nimInput.value.trim();
    const err = Utils.validateNIM(nim);
    if (err) { nimError.textContent = err; nimInput.classList.add("invalid"); return; }

    setBtnLoading("#nimCekBtn", true);
    kuliahResult.classList.add("hidden-block");
    setTimeout(() => {
      setBtnLoading("#nimCekBtn", false);
      const data = sppData[nim];
      if (!data) {
        nimError.textContent = "NIM tidak terdaftar dalam sistem.";
        return;
      }
      nimError.textContent = "";
      state.kuliah.nim = nim;
      state.kuliah.data = data;
      state.kuliah.selected = new Set();
      renderKuliahResult(nim, data);
    }, 1000 + Math.random() * 400);
  });

  function renderKuliahResult(nim, data) {
    kuliahResult.classList.remove("hidden-block");
    const rows = data.cicilan.map(item => {
      const paid = item.status === "paid";
      return `
        <div class="spp-item">
          <input type="checkbox" class="spp-checkbox" data-id="${item.id}" ${paid ? "checked disabled" : ""}>
          <div class="spp-item__body">
            <div class="spp-item__desc">${item.desc}</div>
            <div class="spp-item__amount">${Utils.rupiah(item.amount)}</div>
          </div>
          ${paid ? '<span class="badge badge--success">Lunas</span>' : '<span class="badge badge--warn">Belum Lunas</span>'}
        </div>`;
    }).join("");

    kuliahResult.innerHTML = `
      <div class="result-card">
        <div class="result-card__row"><span>Nama</span><span>${data.nama}</span></div>
        <div class="result-card__row"><span>Program Studi</span><span>${data.prodi}</span></div>
        <div class="result-card__row"><span>Semester</span><span>${data.semester}</span></div>
      </div>
      <h2 class="section-heading">Daftar cicilan</h2>
      <div class="result-card">${rows}</div>
      <div class="sticky-total">
        <span>Total dipilih</span>
        <strong id="sppTotal">${Utils.rupiah(0)}</strong>
      </div>
      <button class="btn btn--primary btn--block" id="sppBayarBtn" disabled>Bayar Pilihan</button>
    `;

    $all(".spp-checkbox", kuliahResult).forEach(cb => {
      cb.addEventListener("change", () => {
        const id = Number(cb.dataset.id);
        if (cb.checked) state.kuliah.selected.add(id); else state.kuliah.selected.delete(id);
        updateSppTotal(data);
      });
    });

    $("#sppBayarBtn").addEventListener("click", () => {
      const items = data.cicilan.filter(c => state.kuliah.selected.has(c.id));
      if (!items.length) { Utils.toast("Pilih minimal satu cicilan terlebih dahulu.", "error"); return; }
      const total = items.reduce((s, c) => s + c.amount, 0);
      openPaymentModal({
        category: "kuliah",
        description: `Cicilan SPP a.n. ${data.nama} (${items.length} item)`,
        customerName: data.nama,
        amount: total,
        items
      });
    });
  }

  function updateSppTotal(data) {
    const items = data.cicilan.filter(c => state.kuliah.selected.has(c.id));
    const total = items.reduce((s, c) => s + c.amount, 0);
    $("#sppTotal").textContent = Utils.rupiah(total);
    $("#sppBayarBtn").disabled = items.length === 0;
  }

  /* ============================================================
     PULSA & PAKET DATA
     ============================================================ */
  const providerGrid = $("#providerGrid");
  const phoneInput = $("#phoneInput");
  const phoneError = $("#phoneError");
  const phoneDetected = $("#phoneDetected");
  const pulsaNominalWrap = $("#pulsaNominalWrap");
  const paketDataWrap = $("#paketDataWrap");
  const customLabel = $("#customLabel");
  const customNominal = $("#customNominal");
  const pulsaResult = $("#pulsa-result");

  providerGrid.innerHTML = providers.map(p => `
    <button class="provider-card" data-provider="${p.code}">
      <span class="provider-card__dot" style="background:${p.color}"></span>
      <span>${p.name}</span>
    </button>`).join("");

  pulsaNominalWrap.innerHTML = pulsaNominal.map(n => `
      <button class="nominal-card" data-nominal="${n}">${Utils.rupiah(n)}</button>`
    ).join("") + `<button class="nominal-card" data-nominal="custom">Custom</button>`;

  paketDataWrap.innerHTML = paketData.map(p => `
    <button class="paket-item" data-paket="${p.id}">
      <div>
        <div class="paket-item__name">${p.name}</div>
        <div class="paket-item__sub">Masa aktif ${p.validity}</div>
      </div>
      <div class="paket-item__price">${Utils.rupiah(p.price)}</div>
    </button>`).join("");

  $all(".provider-card", providerGrid).forEach(btn => {
    btn.addEventListener("click", () => {
      state.pulsa.provider = btn.dataset.provider;
      $all(".provider-card", providerGrid).forEach(b => b.classList.toggle("active", b === btn));
    });
  });

  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "");
    const val = phoneInput.value;
    const err = Utils.validatePhone(val);
    phoneInput.classList.toggle("invalid", !!err && val.length > 0);
    phoneError.textContent = val.length > 0 ? (err || "") : "";
    if (!err) {
      const detected = Utils.detectProvider(val);
      if (detected) {
        state.pulsa.provider = detected.code;
        $all(".provider-card", providerGrid).forEach(b => b.classList.toggle("active", b.dataset.provider === detected.code));
        phoneDetected.textContent = `Terdeteksi: ${detected.name}`;
      } else {
        phoneDetected.textContent = "Provider tidak terdeteksi otomatis — silakan pilih manual di atas.";
      }
    } else {
      phoneDetected.textContent = "";
    }
  });

  $all(".tab-switch__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $all(".tab-switch__btn").forEach(b => b.classList.toggle("active", b === btn));
      state.pulsa.mode = btn.dataset.tab;
      const isPulsa = btn.dataset.tab === "pulsa";
      pulsaNominalWrap.classList.toggle("hidden-block", !isPulsa);
      paketDataWrap.classList.toggle("hidden-block", isPulsa);
      if (!isPulsa) { customLabel.style.display = "none"; customNominal.style.display = "none"; }
    });
  });

  $all(".nominal-card", pulsaNominalWrap).forEach(btn => {
    btn.addEventListener("click", () => {
      $all(".nominal-card", pulsaNominalWrap).forEach(b => b.classList.toggle("active", b === btn));
      if (btn.dataset.nominal === "custom") {
        state.pulsa.nominal = "custom";
        customLabel.style.display = "block";
        customNominal.style.display = "block";
        customNominal.focus();
      } else {
        state.pulsa.nominal = Number(btn.dataset.nominal);
        customLabel.style.display = "none";
        customNominal.style.display = "none";
      }
    });
  });

  $all(".paket-item", paketDataWrap).forEach(btn => {
    btn.addEventListener("click", () => {
      $all(".paket-item", paketDataWrap).forEach(b => b.classList.toggle("active", b === btn));
      state.pulsa.paket = btn.dataset.paket;
    });
  });

  $("#pulsaLanjutBtn").addEventListener("click", () => {
    const phone = phoneInput.value.trim();
    const err = Utils.validatePhone(phone);
    if (err) { phoneError.textContent = err; phoneInput.classList.add("invalid"); return; }
    if (!state.pulsa.provider) { Utils.toast("Pilih provider terlebih dahulu.", "error"); return; }

    let desc, amount;
    if (state.pulsa.mode === "pulsa") {
      let nominal = state.pulsa.nominal;
      if (nominal === "custom") {
        nominal = Number(customNominal.value.replace(/[^0-9]/g, ""));
        if (!nominal || nominal < 10000 || nominal > 1000000) {
          Utils.toast("Nominal custom harus antara Rp10.000 – Rp1.000.000.", "error");
          return;
        }
      }
      if (!nominal) { Utils.toast("Pilih nominal pulsa terlebih dahulu.", "error"); return; }
      amount = nominal;
      desc = `Pulsa ${providers.find(p => p.code === state.pulsa.provider).name} ${Utils.rupiah(nominal)} — ${phone}`;
    } else {
      const paket = paketData.find(p => p.id === state.pulsa.paket);
      if (!paket) { Utils.toast("Pilih paket data terlebih dahulu.", "error"); return; }
      amount = paket.price;
      desc = `${paket.name} ${providers.find(p => p.code === state.pulsa.provider).name} — ${phone}`;
    }

    pulsaResult.classList.remove("hidden-block");
    pulsaResult.innerHTML = `
      <div class="result-card">
        <div class="result-card__row"><span>Nomor Tujuan</span><span>${phone}</span></div>
        <div class="result-card__row"><span>Provider</span><span>${providers.find(p => p.code === state.pulsa.provider).name}</span></div>
        <div class="result-card__row"><span>Detail</span><span>${desc.split("—")[0].trim()}</span></div>
        <div class="result-card__total"><span>Total Bayar</span><strong>${Utils.rupiah(amount)}</strong></div>
        <button class="btn btn--primary btn--block" id="pulsaBayarBtn">Lanjut Bayar</button>
      </div>`;
    $("#pulsaBayarBtn").addEventListener("click", () => {
      openPaymentModal({ category: "pulsa", description: desc, customerName: phone, amount });
    });
  });

  /* ============================================================
     PAYMENT MODAL FLOW
     ============================================================ */
  function openPaymentModal(draft) {
    state.pendingTx = draft;
    state.payment = { method: null, bank: null, va: null, qr: null, teller: null, qrSecondsLeft: 300 };
    renderMethodStage();
    showModal();
  }

  function showModal() { els.modalOverlay.hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal() {
    els.modalOverlay.hidden = true;
    document.body.style.overflow = "";
    if (state.qrTimerHandle) { clearInterval(state.qrTimerHandle); state.qrTimerHandle = null; }
  }
  els.modalOverlay.addEventListener("click", (e) => {
    if (e.target === els.modalOverlay && !els.modalOverlay.dataset.locked) closeModal();
  });

  function renderMethodStage() {
    const tx = state.pendingTx;
    const pay = state.payment;
    els.modalOverlay.dataset.locked = "";
    els.modalBox.innerHTML = `
      <button class="modal-close" id="modalCloseBtn"><i class="fa-solid fa-xmark"></i></button>
      <h3>Pilih Metode Pembayaran</h3>
      <div class="result-card" style="margin-top:0;">
        <div class="result-card__row"><span>Untuk</span><span>${tx.customerName}</span></div>
        <div class="result-card__row"><span>Deskripsi</span><span>${tx.description}</span></div>
        <div class="result-card__total"><span>Total</span><strong>${Utils.rupiah(tx.amount)}</strong></div>
      </div>

      <div style="margin-top:16px;">
        <div class="method-option ${pay.method === "va" ? "active" : ""}" data-method="va">
          <i class="fa-solid fa-building-columns"></i><span class="method-option__label">Virtual Account</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
        <div id="vaDetail"></div>

        <div class="method-option ${pay.method === "qris" ? "active" : ""}" data-method="qris">
          <i class="fa-solid fa-qrcode"></i><span class="method-option__label">QRIS</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
        <div id="qrisDetail"></div>

        <div class="method-option ${pay.method === "teller" ? "active" : ""}" data-method="teller">
          <i class="fa-solid fa-store"></i><span class="method-option__label">Bayar di Teller / Kasir</span>
          <i class="fa-solid fa-chevron-right"></i>
        </div>
        <div id="tellerDetail"></div>
      </div>

      <button class="btn btn--primary btn--block" id="bayarSekarangBtn">Bayar Sekarang</button>
    `;
    $("#modalCloseBtn").addEventListener("click", closeModal);
    $all(".method-option", els.modalBox).forEach(opt => {
      opt.addEventListener("click", () => selectMethod(opt.dataset.method));
    });
    $("#bayarSekarangBtn").addEventListener("click", handleBayarSekarang);

    // if a method was already chosen (re-render), restore its detail block
    if (pay.method) selectMethod(pay.method, true);
  }

  function selectMethod(method, silent) {
    state.payment.method = method;
    $all(".method-option", els.modalBox).forEach(o => o.classList.toggle("active", o.dataset.method === method));
    ["vaDetail", "qrisDetail", "tellerDetail"].forEach(id => { $("#" + id).innerHTML = ""; });

    if (method === "va") {
      $("#vaDetail").innerHTML = `
        <div class="detail-box">
          <p style="margin:0 0 10px;font-weight:600;">Pilih bank tujuan:</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${bankList.map(b => `<button class="btn btn--outline" data-bank="${b.code}" style="padding:8px 14px;font-size:12.5px;">${b.name}</button>`).join("")}
          </div>
          <div id="vaNumberWrap"></div>
        </div>`;
      $all("[data-bank]", els.modalBox).forEach(b => b.addEventListener("click", () => {
        state.payment.bank = b.dataset.bank;
        state.payment.va = Utils.generateVA(b.dataset.bank);
        $all("[data-bank]", els.modalBox).forEach(x => x.style.background = x === b ? "var(--teal-light)" : "");
        $("#vaNumberWrap").innerHTML = `
          <p style="margin:12px 0 4px;color:var(--muted);font-size:12px;">Nomor Virtual Account (${bankList.find(x=>x.code===b.dataset.bank).name})</p>
          <div class="va-number">${state.payment.va}</div>
          <p style="margin:8px 0 0;font-size:12px;color:var(--muted);">Transfer sesuai nominal tagihan melalui ATM, m-Banking, atau internet banking sebelum melanjutkan.</p>`;
      }));
      if (!silent) { state.payment.bank = null; state.payment.va = null; }
      else if (state.payment.bank) {
        const b = document.querySelector(`[data-bank="${state.payment.bank}"]`);
        if (b) b.click();
      }
    }

    if (method === "qris") {
      const qr = Utils.generateQrPattern(JSON.stringify(state.pendingTx));
      const cell = 200 / qr.size;
      const rects = qr.cells.map(([r, c]) => `<rect x="${c * cell}" y="${r * cell}" width="${cell}" height="${cell}" fill="var(--ink)"/>`).join("");
      $("#qrisDetail").innerHTML = `
        <div class="detail-box qr-wrap">
          <svg width="160" height="160" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#fff"/>
            ${rects}
            <rect x="0" y="0" width="46" height="46" fill="none" stroke="var(--ink)" stroke-width="8"/>
            <rect x="154" y="0" width="46" height="46" fill="none" stroke="var(--ink)" stroke-width="8"/>
            <rect x="0" y="154" width="46" height="46" fill="none" stroke="var(--ink)" stroke-width="8"/>
          </svg>
          <span style="font-size:12px;color:var(--muted);">Scan QRIS ini menggunakan aplikasi e-wallet atau m-Banking</span>
          <span class="qr-timer" id="qrTimer">05:00</span>
        </div>`;
      startQrTimer();
    } else if (state.qrTimerHandle) {
      clearInterval(state.qrTimerHandle); state.qrTimerHandle = null;
    }

    if (method === "teller") {
      const code = Utils.generateTellerCode();
      state.payment.teller = code;
      $("#tellerDetail").innerHTML = `
        <div class="detail-box">
          <p style="margin:0 0 4px;color:var(--muted);font-size:12px;">Kode Pembayaran</p>
          <div class="va-number">${code}</div>
          <p style="margin:12px 0 6px;font-weight:600;font-size:12.5px;">Tunjukkan kode ini di salah satu lokasi berikut:</p>
          ${tellerLocations.map(l => `<p style="margin:0 0 6px;font-size:12.5px;"><strong>${l.name}</strong><br><span style="color:var(--muted);">${l.address}</span></p>`).join("")}
        </div>`;
    }
  }

  function startQrTimer() {
    if (state.qrTimerHandle) clearInterval(state.qrTimerHandle);
    state.payment.qrSecondsLeft = 300;
    const timerEl = () => $("#qrTimer");
    state.qrTimerHandle = setInterval(() => {
      state.payment.qrSecondsLeft--;
      const m = Math.floor(state.payment.qrSecondsLeft / 60);
      const s = state.payment.qrSecondsLeft % 60;
      const el = timerEl();
      if (el) el.textContent = `${Utils.pad ? Utils.pad(m,2) : String(m).padStart(2,"0")}:${String(s).padStart(2, "0")}`;
      if (state.payment.qrSecondsLeft <= 0) {
        clearInterval(state.qrTimerHandle);
        state.qrTimerHandle = null;
        if (el) el.textContent = "Kedaluwarsa";
        Utils.toast("Kode QRIS kedaluwarsa, silakan pilih metode lain.", "error");
      }
    }, 1000);
  }

  function handleBayarSekarang() {
    const pay = state.payment;
    if (!pay.method) { Utils.toast("Pilih metode pembayaran terlebih dahulu.", "error"); return; }
    if (pay.method === "va" && !pay.va) { Utils.toast("Pilih bank tujuan Virtual Account terlebih dahulu.", "error"); return; }
    if (pay.method === "qris" && pay.qrSecondsLeft <= 0) { Utils.toast("Kode QRIS kedaluwarsa. Ulangi pemilihan metode.", "error"); return; }

    const tx = state.pendingTx;
    if (Utils.getSaldo() < tx.amount) {
      Utils.toast("Saldo tidak mencukupi. Silakan Top Up saldo terlebih dahulu.", "error");
      return;
    }
    renderProcessingStage();
    setTimeout(() => finalizeTransaction(), 1300 + Math.random() * 500);
  }

  function renderProcessingStage() {
    els.modalOverlay.dataset.locked = "1";
    els.modalBox.innerHTML = `
      <div class="loading-box">
        <div class="loading-spinner"></div>
        <h3 style="margin-bottom:6px;">Memproses pembayaran...</h3>
        <p style="color:var(--muted);font-size:13px;">Mohon tunggu sebentar, jangan tutup halaman ini.</p>
      </div>`;
  }

  function finalizeTransaction() {
    const tx = state.pendingTx;
    const pay = state.payment;
    const trx = {
      id: Utils.generateTrxId(),
      timestamp: Date.now(),
      category: tx.category,
      description: tx.description,
      amount: tx.amount,
      method: pay.method === "va" ? `Virtual Account ${(bankList.find(b=>b.code===pay.bank)||{}).name || ""}` : pay.method === "qris" ? "QRIS" : "Teller / Kasir",
      status: "success",
      customerName: tx.customerName
    };
    Utils.saveTransaction(trx);
    Utils.setSaldo(Utils.getSaldo() - tx.amount);

    // mark SPP items paid in-memory for this session
    if (tx.category === "kuliah" && tx.items && state.kuliah.data) {
      tx.items.forEach(item => {
        const found = state.kuliah.data.cicilan.find(c => c.id === item.id);
        if (found) found.status = "paid";
      });
      renderKuliahResult(state.kuliah.nim, state.kuliah.data);
    }

    renderReceiptStage(trx);
    renderBeranda();
  }

  function renderReceiptStage(trx) {
    els.modalOverlay.dataset.locked = "";
    els.modalBox.innerHTML = `
      <div class="receipt">
        <div class="receipt__icon"><i class="fa-solid fa-check"></i></div>
        <h3 class="receipt__title">Pembayaran Berhasil</h3>
        <p class="receipt__sub">${Utils.formatDateTime(trx.timestamp)}</p>
        <table>
          <tr><td>ID Transaksi</td><td>${trx.id}</td></tr>
          <tr><td>Deskripsi</td><td>${trx.description}</td></tr>
          <tr><td>Metode</td><td>${trx.method}</td></tr>
          <tr><td>Status</td><td>Sukses</td></tr>
          <tr><td>Total Dibayar</td><td>${Utils.rupiah(trx.amount)}</td></tr>
        </table>
        <div class="receipt-actions">
          <button class="btn btn--outline" id="printReceiptBtn"><i class="fa-solid fa-print"></i> Cetak</button>
          <button class="btn btn--primary" id="doneReceiptBtn">Selesai</button>
        </div>
      </div>`;
    $("#printReceiptBtn").addEventListener("click", () => printReceipt(trx));
    $("#doneReceiptBtn").addEventListener("click", () => {
      closeModal();
      if (state.currentPage === "riwayat") renderRiwayat();
    });
  }

  function printReceipt(trx) {
    $("#printArea").innerHTML = `
      <h2>TUNTASIN — Bukti Pembayaran</h2>
      <p>ID Transaksi: ${trx.id}</p>
      <p>Tanggal: ${Utils.formatDateTime(trx.timestamp)}</p>
      <hr>
      <p>Deskripsi: ${trx.description}</p>
      <p>Metode: ${trx.method}</p>
      <p>Status: Sukses</p>
      <h3>Total: ${Utils.rupiah(trx.amount)}</h3>
      <hr>
      <p>Terima kasih telah menggunakan Tuntasin.</p>`;
    window.print();
  }

  /* ============================================================
     RIWAYAT
     ============================================================ */
  const riwayatList = $("#riwayatList");
  const riwayatEmpty = $("#riwayatEmpty");
  const riwayatFilter = $("#riwayatFilter");

  function renderRiwayat() {
    const filter = riwayatFilter.value;
    let list = Utils.getTransactions();
    if (filter !== "all") list = list.filter(t => t.category === filter);
    riwayatEmpty.hidden = list.length > 0;
    riwayatList.innerHTML = list.map(trx => `
      <div class="riwayat-item">
        <div class="riwayat-item__top">
          <div>
            <div class="riwayat-item__desc">${trx.description}</div>
            <div class="riwayat-item__meta">${Utils.formatDateTime(trx.timestamp)} · ${trx.method}</div>
          </div>
          <div class="riwayat-item__amount">${Utils.rupiah(trx.amount)}</div>
        </div>
        <div class="riwayat-item__footer">
          <span class="badge badge--success">Sukses</span>
          <button class="link-btn" data-print="${trx.id}">Cetak ulang <i class="fa-solid fa-print"></i></button>
        </div>
      </div>`).join("");

    $all("[data-print]", riwayatList).forEach(btn => {
      btn.addEventListener("click", () => {
        const trx = Utils.getTransactions().find(t => t.id === btn.dataset.print);
        if (trx) printReceipt(trx);
      });
    });
  }
  riwayatFilter.addEventListener("change", renderRiwayat);

  $("#clearHistoryBtn").addEventListener("click", () => {
    if (!Utils.getTransactions().length) { Utils.toast("Riwayat sudah kosong.", "info"); return; }
    if (confirm("Hapus seluruh riwayat transaksi? Tindakan ini tidak dapat dibatalkan.")) {
      Utils.clearTransactions();
      renderRiwayat();
      renderBeranda();
      Utils.toast("Riwayat transaksi berhasil dihapus.", "success");
    }
  });

  /* ============================================================
     PROFIL
     ============================================================ */
  function renderProfil() {
    const p = Utils.getProfile();
    $("#profileName").textContent = p.name;
    $("#profileNameInput").value = p.name;
    $("#profileEmailInput").value = p.email;
    $("#profilePhoneInput").value = p.phone;
  }
  $("#saveProfileBtn").addEventListener("click", () => {
    const name = $("#profileNameInput").value.trim();
    const email = $("#profileEmailInput").value.trim();
    const phone = $("#profilePhoneInput").value.trim();
    if (!name || !email || !phone) { Utils.toast("Semua kolom profil wajib diisi.", "error"); return; }
    Utils.saveProfile({ name, email, phone });
    renderProfil();
    Utils.toast("Profil berhasil diperbarui.", "success");
  });

  /* ============================================================
     BANTUAN / FAQ
     ============================================================ */
  const faqData = [
    { q: "Apakah aplikasi ini terhubung ke rekening bank sungguhan?", a: "Tidak. Tuntasin adalah simulasi frontend untuk keperluan pembelajaran — tidak ada transaksi uang nyata maupun koneksi ke server atau bank." },
    { q: "Kenapa nomor pelanggan saya tidak ditemukan?", a: "Aplikasi ini menggunakan data simulasi terbatas. Gunakan salah satu contoh nomor pelanggan pada dokumentasi/README untuk mencoba fitur cek tagihan." },
    { q: "Apakah data transaksi saya tersimpan?", a: "Ya, riwayat transaksi disimpan di localStorage browser Anda sehingga tetap ada walau halaman ditutup, kecuali Anda menghapusnya secara manual." },
    { q: "Bagaimana cara mencetak bukti pembayaran?", a: "Setelah pembayaran berhasil, klik tombol \"Cetak\" pada struk, atau buka halaman Riwayat dan pilih \"Cetak ulang\" pada transaksi yang diinginkan." },
    { q: "Apa yang terjadi jika saldo saya tidak mencukupi?", a: "Sistem akan menampilkan notifikasi bahwa saldo tidak mencukupi dan menyarankan Anda melakukan Top Up terlebih dahulu dari halaman Beranda." }
  ];
  $("#faqList").innerHTML = faqData.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-q"><span>${f.q}</span><i class="fa-solid fa-chevron-down"></i></button>
      <div class="faq-a">${f.a}</div>
    </div>`).join("");
  $all(".faq-item").forEach(item => {
    $(".faq-q", item).addEventListener("click", () => item.classList.toggle("open"));
  });

  /* ============================================================
     HELPERS
     ============================================================ */
  function setBtnLoading(selector, loading) {
    const btn = $(selector);
    btn.disabled = loading;
    $(".btn-label", btn).style.visibility = loading ? "hidden" : "visible";
    const spinner = $(".btn-spinner", btn);
    spinner.hidden = !loading;
    if (loading) spinner.style.position = "absolute";
    btn.style.position = "relative";
  }

  /* ============================================================
     INIT
     ============================================================ */
  navigateTo("beranda");
})();
