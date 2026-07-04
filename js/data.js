/* ============================================================
   TUNTASIN — Data Simulasi
   Semua data di bawah ini adalah data dummy (hardcoded) untuk
   keperluan simulasi frontend. Tidak ada koneksi ke server nyata.
   ============================================================ */

const billData = {
  listrik: {
    "112233445566": { name: "Raka Pratama",      period: "Juni 2026",  amount: 245000, fine: 0,     due: "2026-07-20" },
    "223344556677": { name: "Siti Nurhaliza",     period: "Juni 2026",  amount: 189500, fine: 15000, due: "2026-07-15" },
    "334455667788": { name: "Budi Santoso",       period: "Juni 2026",  amount: 512000, fine: 0,     due: "2026-07-22" },
    "445566778899": { name: "Dewi Lestari",       period: "Mei 2026",   amount: 98000,  fine: 5000,  due: "2026-07-10" },
    "556677889900": { name: "Ahmad Fauzi",        period: "Juni 2026",  amount: 302750, fine: 0,     due: "2026-07-25" }
  },
  pdam: {
    "PD10023344": { name: "Raka Pratama",   period: "Juni 2026", amount: 87000,  fine: 0,    due: "2026-07-18" },
    "PD10088221": { name: "Nina Kartika",   period: "Juni 2026", amount: 112500, fine: 8000, due: "2026-07-12" },
    "PD10077310": { name: "Fajar Nugroho",  period: "Mei 2026",  amount: 65000,  fine: 0,    due: "2026-07-14" }
  },
  internet: {
    "INET8801122": { name: "Raka Pratama",  period: "Juli 2026", amount: 385000, fine: 0,     due: "2026-07-28" },
    "INET8804456": { name: "Clara Amelia",  period: "Juli 2026", amount: 450000, fine: 25000, due: "2026-07-05" },
    "INET8809981": { name: "Yusuf Hidayat", period: "Juni 2026", amount: 299000, fine: 0,     due: "2026-07-19" }
  },
  seminar: {
    "SEM2026WEB01": { name: "Workshop UI/UX Nasional",     period: "Sesi 1 - 20 Juli 2026", amount: 150000, fine: 0, due: "2026-07-18" },
    "SEM2026DEV02": { name: "Bootcamp Frontend Developer", period: "Batch 4 - 25 Juli 2026", amount: 275000, fine: 0, due: "2026-07-20" },
    "SEM2026AI003": { name: "Seminar AI & Masa Depan Kerja", period: "26 Juli 2026",         amount: 100000, fine: 0, due: "2026-07-24" }
  }
};

const categoryLabels = {
  listrik:  { title: "Listrik (PLN)",      icon: "fa-bolt",       placeholder: "Contoh: 112233445566", hint: "Nomor Meter / ID Pelanggan, 12 digit angka" },
  pdam:     { title: "PDAM (Air)",         icon: "fa-faucet-drip",placeholder: "Contoh: PD10023344",   hint: "Nomor Pelanggan PDAM" },
  internet: { title: "Internet & TV Kabel",icon: "fa-wifi",       placeholder: "Contoh: INET8801122",  hint: "Nomor Pelanggan / ID Layanan" },
  seminar:  { title: "Seminar / Event",    icon: "fa-people-group",placeholder:"Contoh: SEM2026WEB01",  hint: "Kode Registrasi Event (alfanumerik)" }
};

const sppData = {
  "202410001": {
    nama: "Raka Pratama",
    prodi: "Teknik Informatika",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2500000, status: "unpaid" },
      { id: 2, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2500000, status: "unpaid" },
      { id: 3, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2500000, status: "paid"   },
      { id: 4, desc: "Dana Pengembangan Fasilitas",                  amount: 1200000, status: "unpaid" },
      { id: 5, desc: "Biaya Praktikum Lab RPL",                      amount: 450000,  status: "unpaid" },
      { id: 6, desc: "Biaya UKM & Kemahasiswaan",                    amount: 150000,  status: "paid"   },
      { id: 7, desc: "Asuransi Kesehatan Mahasiswa",                 amount: 200000,  status: "unpaid" }
    ]
  },
  "202410002": {
    nama: "Nabila Zahra",
    prodi: "Sistem Informasi",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2300000, status: "paid"   },
      { id: 2, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2300000, status: "unpaid" },
      { id: 3, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-3", amount: 2300000, status: "unpaid" },
      { id: 4, desc: "Dana Pengembangan Fasilitas",                  amount: 1000000, status: "unpaid" },
      { id: 5, desc: "Biaya Praktikum Basis Data",                   amount: 350000,  status: "unpaid" },
      { id: 6, desc: "Biaya UKM & Kemahasiswaan",                    amount: 150000,  status: "unpaid" },
      { id: 7, desc: "Asuransi Kesehatan Mahasiswa",                 amount: 200000,  status: "paid"   },
      { id: 8, desc: "Wisuda & Legalisir Berkas",                    amount: 500000,  status: "unpaid" }
    ]
  },
  "202410003": {
    nama: "Yusuf Hidayat",
    prodi: "Desain Komunikasi Visual",
    semester: "Ganjil 2025/2026",
    cicilan: [
      { id: 1, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-1", amount: 2100000, status: "unpaid" },
      { id: 2, desc: "SPP Semester Ganjil 2025/2026 - Cicilan ke-2", amount: 2100000, status: "unpaid" },
      { id: 3, desc: "Biaya Studio & Alat Gambar",                   amount: 600000,  status: "unpaid" },
      { id: 4, desc: "Dana Pengembangan Fasilitas",                  amount: 950000,  status: "paid"   },
      { id: 5, desc: "Biaya UKM & Kemahasiswaan",                    amount: 150000,  status: "unpaid" },
      { id: 6, desc: "Asuransi Kesehatan Mahasiswa",                 amount: 200000,  status: "unpaid" }
    ]
  }
};

const providers = [
  { code: "telkomsel", name: "Telkomsel", color: "#E4002B", prefixes: ["0811","0812","0813","0821","0822","0823","0852","0853"] },
  { code: "xl",         name: "XL Axiata", color: "#1C3F94", prefixes: ["0817","0818","0819","0859","0877","0878"] },
  { code: "indosat",    name: "Indosat Ooredoo", color: "#FDB913", prefixes: ["0814","0815","0816","0855","0856","0857","0858"] },
  { code: "tri",        name: "Tri (3)", color: "#8A2BE2", prefixes: ["0895","0896","0897","0898","0899"] },
  { code: "smartfren",  name: "Smartfren", color: "#DA1F3D", prefixes: ["0881","0882","0883","0884","0885","0886","0887","0888","0889"] },
  { code: "axis",       name: "Axis", color: "#7A1FA2", prefixes: ["0831","0832","0833","0838"] }
];

const pulsaNominal = [10000, 25000, 50000, 100000, 150000, 200000];

const paketData = [
  { id: "pd1", name: "Paket Harian 1GB",   validity: "1 Hari",  price: 5000 },
  { id: "pd2", name: "Paket Mingguan 5GB", validity: "7 Hari",  price: 25000 },
  { id: "pd3", name: "Paket Bulanan 15GB", validity: "30 Hari", price: 65000 },
  { id: "pd4", name: "Paket Bulanan 30GB", validity: "30 Hari", price: 110000 }
];

const bankList = [
  { code: "bca", name: "BCA" },
  { code: "bni", name: "BNI" },
  { code: "mandiri", name: "Mandiri" },
  { code: "bri", name: "BRI" }
];

const tellerLocations = [
  { name: "Indomaret Terdekat", address: "Jl. Raya Pajajaran No. 12, Bogor" },
  { name: "Alfamart Terdekat",  address: "Jl. Pandu Raya No. 45, Bogor" },
  { name: "Kantor Bank Mitra",  address: "Jl. Sudirman No. 8, Bogor (Senin–Jumat 08.00–15.00)" }
];
