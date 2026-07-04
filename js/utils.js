/* ============================================================
   TUNTASIN — Utilities
   ============================================================ */

const Utils = (() => {

  const STORAGE_KEYS = {
    saldo: "tuntasin_saldo",
    transactions: "tuntasin_transactions",
    theme: "tuntasin_theme",
    profile: "tuntasin_profile"
  };

  function rupiah(num) {
    return "Rp" + Number(num || 0).toLocaleString("id-ID");
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  }

  function formatDateTime(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  }

  function pad(num, len) {
    return String(num).padStart(len, "0");
  }

  function randomDigits(len) {
    let s = "";
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  function generateVA(bankCode) {
    const prefixMap = { bca: "3901", bni: "8808", mandiri: "8960", bri: "2622" };
    return (prefixMap[bankCode] || "0000") + randomDigits(12);
  }

  function generateTellerCode() {
    return "TL-" + randomDigits(3) + "-" + randomDigits(4);
  }

  function generateTrxId() {
    const now = new Date();
    return "TRX" + now.getFullYear() + pad(now.getMonth() + 1, 2) + pad(now.getDate(), 2) +
      "-" + randomDigits(6);
  }

  function detectProvider(phone) {
    const prefix = phone.slice(0, 4);
    return providers.find(p => p.prefixes.includes(prefix)) || null;
  }

  // ---------- Validation ----------
  function isNumeric(str) { return /^[0-9]+$/.test(str); }
  function isAlnum(str) { return /^[a-zA-Z0-9]+$/.test(str); }

  function validateCustomerId(value, category) {
    if (!value) return "Nomor pelanggan wajib diisi.";
    if (category === "seminar") {
      if (!isAlnum(value)) return "Kode registrasi hanya boleh huruf dan angka.";
      if (value.length < 8 || value.length > 14) return "Kode registrasi harus 8–14 karakter.";
      return null;
    }
    if (!isNumeric(value.replace(/^PD|^INET/i, ""))) {
      // pdam/internet have letter prefixes by design; check the rest is numeric handled loosely
    }
    if (value.length < 8 || value.length > 14) return "Nomor pelanggan harus 8–14 karakter.";
    return null;
  }

  function validatePhone(value) {
    if (!value) return "Nomor HP wajib diisi.";
    if (!isNumeric(value)) return "Nomor HP hanya boleh angka.";
    if (!value.startsWith("08")) return "Nomor HP harus diawali 08.";
    if (value.length < 10 || value.length > 13) return "Nomor HP harus 10–13 digit.";
    return null;
  }

  function validateNIM(value) {
    if (!value) return "NIM wajib diisi.";
    if (!isNumeric(value)) return "NIM hanya boleh berisi angka.";
    if (value.length !== 9) return "NIM harus terdiri dari 9 digit angka.";
    return null;
  }

  // ---------- Storage ----------
  function getSaldo() {
    const v = localStorage.getItem(STORAGE_KEYS.saldo);
    return v === null ? 1500000 : Number(v);
  }
  function setSaldo(val) {
    localStorage.setItem(STORAGE_KEYS.saldo, String(val));
  }

  function getTransactions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions)) || [];
    } catch (e) { return []; }
  }
  function saveTransaction(trx) {
    const list = getTransactions();
    list.unshift(trx);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(list));
  }
  function clearTransactions() {
    localStorage.removeItem(STORAGE_KEYS.transactions);
  }

  function getTheme() {
    return localStorage.getItem(STORAGE_KEYS.theme) || "light";
  }
  function setTheme(t) {
    localStorage.setItem(STORAGE_KEYS.theme, t);
  }

  function getProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.profile)) || {
        name: "Raka Pratama", email: "raka.pratama@email.com", phone: "081234567890"
      };
    } catch (e) {
      return { name: "Raka Pratama", email: "raka.pratama@email.com", phone: "081234567890" };
    }
  }
  function saveProfile(p) {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(p));
  }

  // ---------- Toast ----------
  function toast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const el = document.createElement("div");
    el.className = `toast toast--${type}`;
    const icons = { success: "fa-circle-check", error: "fa-circle-exclamation", info: "fa-circle-info" };
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(el);
    requestAnimationFrame(() => el.classList.add("toast--show"));
    setTimeout(() => {
      el.classList.remove("toast--show");
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  // simple deterministic "QR-like" pattern generator (visual simulation only)
  function generateQrPattern(seedStr, size = 21) {
    let seed = 0;
    for (let i = 0; i < seedStr.length; i++) seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
    function rand() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isFinder = (r < 7 && c < 7) || (r < 7 && c > size - 8) || (r > size - 8 && c < 7);
        if (isFinder) continue;
        if (rand() > 0.55) cells.push([r, c]);
      }
    }
    return { cells, size };
  }

  return {
    STORAGE_KEYS, rupiah, formatDate, formatDateTime, randomDigits,
    generateVA, generateTellerCode, generateTrxId, detectProvider,
    validateCustomerId, validatePhone, validateNIM,
    getSaldo, setSaldo, getTransactions, saveTransaction, clearTransactions,
    getTheme, setTheme, getProfile, saveProfile, toast, generateQrPattern
  };
})();
