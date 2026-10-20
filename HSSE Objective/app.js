// Tampilan dari desain Figma section "HSSE Objective - New Alternative UI - March 2026 - 4"; daftar aktivitas dari Excel (lihat di bawah).
const MAX_MANDATORY = 100;
const MAX_NON_MANDATORY = 100;
const MAX_MANDATORY_ACTS = 1; // batas aktivitas Mandatory sudah standar, jadi Tambah & Hapus Aktivitas di-disable
const MAX_FILE = 2 * 1024 * 1024;
const IG_URL = '../Individual%20Goal/index.html';

const newAct = () => ({ jenis: '', periode: '2025', tanggal: '', lokasi: '', ket: '', file: null, url: null });
const mandatoryItem = (o) => ({ type: 'mandatory', max: MAX_MANDATORY_ACTS, acts: [newAct()], open: false, poin: null, editing: false, dirty: false, ...o });

// Sumber: Excel "All Stream_List Aktivitas pada Item Individual Contributory HSSE Objectives 2026", sheet "2026 (Rev)".
const mandatory = [
  mandatoryItem({ id: "mcu", kategori: "Health", name: "Melakukan Pemeriksaan kesehatan (MCU Berkala)",
    evidence: "Print Screen kesimpulan Hasil MCU tahun berjalan / Medical certificate dari dokter perusahaan",
    jenis: [
      { label: "Melakukan Pemeriksaan kesehatan (MCU Berkala) pada TW I", poin: 25, desc: "Melakukan Pemeriksaan kesehatan (MCU Berkala) pada TW I" },
      { label: "Melakukan Pemeriksaan kesehatan (MCU Berkala) pada TW II", poin: 15, desc: "Melakukan Pemeriksaan kesehatan (MCU Berkala) pada TW II" },
      { label: "Melakukan Pemeriksaan kesehatan (MCU Berkala) namun tidak tepat waktu", poin: 5, desc: "Melakukan Pemeriksaan kesehatan (MCU Berkala) namun tidak tepat waktu" },
    ] }),
  mandatoryItem({ id: "followup", kategori: "Health", name: "Follow Up Medical Check-Up (MCU) sampai Temuan MCU terkontrol sampai dengan rujukan parameter yang ada",
    evidence: "Surat Keterangan dokter perusahaan",
    jenis: [
      { label: "Tidak diperlukan follow up MCU", poin: 20, desc: "Menyampaikan hasil MCU bahwa tidak memeprlukan follow up kesehatan" },
      { label: "TW III atau maks 3 Bulan setelah MCU", poin: 15, desc: "Menyampaikan hasil Follow Up Medical Check-Up (MCU) dan menunjukkan Temuan MCU terkontrol sampai dengan rujukan parameter yang ada dengan jangka waktu lebih dari 3 Bulan setelah MCU" },
      { label: "FU > 3 Bulan setelah MCU", poin: 5, desc: "Menyampaikan hasil Follow Up Medical Check-Up (MCU) dan menunjukkan Temuan MCU terkontrol sampai dengan rujukan parameter yang ada dengan jangka waktu lebih dari 3 Bulan setelah MCU" },
    ] }),
  mandatoryItem({ id: "observasi", kategori: "HSSE Participation", name: "Melakukan observasi HSSE (unsafe act / unsafe condition) dan/atau Near Miss",
    evidence: "Dibuktikan dengan bukti pelaporan dalam aplikasi P- HORSE",
    jenis: [
      { label: "Kurang dari 12 setahun", poin: 5, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
      { label: "Sebanyak 12-24 observasi setahun", poin: 10, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
      { label: "25-48 observasi setahun", poin: 15, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
      { label: "Lebih dari 48 setahun", poin: 20, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
      { label: "Lebih dari 24 setahun, dengan adanya kelengkapan penilaian risk impact terhadap temuan, causes/penyebab, CLSR, dll (minimal 25% dari temuan yang dilaporkan)", poin: 20, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
      { label: "Lebih dari 48 setahun, dengan adanya kelengkapan penilaian risk impact terhadap temuan, causes/penyebab, CLSR, dll (minimal 25% dari temuan yang dilaporkan)", poin: 30, desc: "Melaporkan observasi aspek HSSE melalui mekanisme pelaporan P-HORSE" },
    ] }),
  mandatoryItem({ id: "training", kategori: "HSSE Participation", name: "Ikut serta pada HSSE Mandatory Training",
    evidence: "Dibuktikan dengan sertifikat pelatihan/daftar kehadiran pelatihan",
    jenis: [
      { label: "Menghadiri HSSE Mandatory Training (realisasi 50% atau lebih dari training yang direncanakan)", poin: 25, desc: "Menghadiri HSSE Mandatory Training (realisasi 50% atau lebih dari training yang direncanakan)" },
      { label: "Menghadiri HSSE Mandatory Training (realisasi < 50% dari training yang direncanakan)", poin: 10, desc: "Menghadiri HSSE Mandatory Training (realisasi < 50% dari training yang direncanakan)" },
      { label: "Tidak Menghadiri HSSE Mandatory Training pada tahun berjalan atau tidak memiliki rencana HSSE Mandatory Training", poin: 0, desc: "Tidak Menghadiri HSSE Mandatory Training pada tahun berjalan atau tidak memiliki rencana HSSE Mandatory Training" },
    ] }),
];

const KATEGORI = ['HSSE Participation', 'Health', 'Safety', 'Security', 'IT Security', 'Environment', 'ERCM'];
// group: aktivitas dengan group yang sama hanya boleh dipilih salah satu (Catatan Khusus di Excel).
const cat = (id, kategori, name, desc, evidence, poin, max, kriteria, group) => ({ id, kategori, name, desc, evidence, poin, max, kriteria, group });
const catalog = [
  cat("nm-5", "HSSE Participation", "Terlibat dalam Tim Task Force terkait aspek HSSE: Tim Investigasi Insiden HSSE/Integrity, Tim Audit HSSE, Tim PROPER, PERCA, Tim CSMS, Tim SUPREME, Tim Efisiensi Energi dll.",
    "Berpartisipasi dalam Tim Task Force terkait HSSE", "Dibuktikan dengan Surat Perintah Tim Task Force", 25, 3, "Jumlah Keikutsertaan", null),
  cat("nm-6", "HSSE Participation", "Terlibat dalam kompetisi HSSE (Lomba Bulan K3, Fire Rescue Challenge, HSSE Challenge)",
    "Berpartisipasi atau keikutsertaan melaksanakan kegiatan kompetisi HSSE berupa foto dan hasil program", "Dibuktikan dengan adanya dokumentasi kegiatan", 25, 3, "Jumlah keikutsertaan", null),
  cat("nm-7", "HSSE Participation", "Management Walkthrough (MWT) Leader",
    "Melaksanakan MWT ke lokasi kerja/MWT secara Virtual & menyampaikan pesan HSSE", "Dibuktikan dengan laporan pelaksanaan MWT/hasil observasi", 25, 3, "Jumlah Pelaksanaan", null),
  cat("nm-8", "HSSE Participation", "Management Walktrough (MWT) Member",
    "Ikut serta sebagai bagian dari Tim Manajemen saat pelaksanaan MWT/ MWT Virtual", "Dibuktikan dengan laporan pelaksanaan MWT/hasil observasi", 15, 3, "Jumlah Pelaksanaan", null),
  cat("nm-9", "HSSE Participation", "Penyelenggaraan HSSE Committee Meeting / HSSE Meeting / HSSE Sharing / SSD",
    "Menyelenggarakan meeting yang agenda utamanya membahas aspek HSSE", "Dibuktikan dengan daftar hadir dan notulen rapat", 15, 5, "Jumlah Penyelenggaraan", null),
  cat("nm-10", "HSSE Participation", "Presenter pada HSSE Meeting / Sharing / SSD / Toolbox meeting / Coaching rutin HSSE",
    "Menyampaikan materi terkait aspek K3L pada saat HSSE Meeting / Tool Box Meeting / Safety Stand Down atau pesan keselamatan sebelum bekerja, sebagai bagian dari rutinitas sebelum berkerja", "Dibuktikan dengan daftar hadir dan notulen rapat", 15, 5, "Jumlah Pelaksanaan", null),
  cat("nm-11", "HSSE Participation", "Hadir pada HSSE Meeting / Sharing / SSD / Webinar",
    "Menghadiri HSSE Meeting / Tool Box Meeting / Safety Stand Down sebagai peserta", "Dibuktikan dengan daftar hadir", 5, 8, "Jumlah Kehadiran", null),
  cat("nm-12", "HSSE Participation", "Ikut serta pada HSSE Training - Non Mandatory",
    "Menghadiri HSSE Training - Non Mandatory (bukan e-learning)", "Dibuktikan dengan sertifikat pelatihan", 15, 3, "Jumlah Keikutsertaan", null),
  cat("nm-13", "HSSE Participation", "Penyelesaian modul e-learning HSSE",
    "Menyelesaikan modul E-Learning HSSE Safe Work Practice (seperti melalui link https://apps.pertamina.com/lms)", "Dibuktikan dengan sertifikat e-learning HSSE", 15, 3, "Jumlah Modul Diselesaikan", null),
  cat("nm-14", "HSSE Participation", "Instruktur Pelatihan HSSE / Safe Operation Practice",
    "Menyampaikan materi pada pelatihan HSSE / Safe Operation Practice sebagai pengajar", "Dibuktikan dengan daftar hadir", 25, 3, "Jumlah Pelaksanaan", null),
  cat("nm-15", "HSSE Participation", "Melakukan Stop Work Authority (SWA) aspek HSSE",
    "Melaporkan SWA aspek HSSE melalui mekanisme pelaporan P-HORSE", "Dibuktikan dengan bukti pelaporan dalam aplikasi P- HORSE", 10, 5, "Jumlah Pelaksanaan", null),
  cat("nm-16a", "Health", "Perbaikan derajat kesehatan (berdasarkan health category hasil MCU) dibanding tahun sebelumnya",
    "Melaksanakan MCU dan hasil derajat kesehatan (Health Category (P1-P7) membaik dibanding MCU tahun sebelumnya (misal MCU tahun berjalan P4, MCU tahun sebelumnya P5)", "Dibuktikan dengan hasil MCU tahun berjalan dan hasil MCU tahun sebelumnya", 25, 1, "Hasil kesimpulan Health Cathegory MCU tahun berjalan dibanding MCU sebelumnya", 'g16'),
  cat("nm-16b", "Health", "Mempertahankan derajat kesehatan (berdasarkan health category hasil MCU) dibandingkan dengan tahun sebelumnya",
    "Melaksanakan MCU dan hasil derajat kesehatan (Health Category (P1-P7) sama dibanding MCU tahun sebelumnya (misal MCU tahun berjalan P4, MCU tahun sebelumnya P4)", "Dibuktikan dengan hasil MCU tahun berjalan dan hasil MCU tahun sebelumnya", 15, 1, "Hasil kesimpulan Health Cathegory MCU tahun berjalan dibanding MCU sebelumnya", 'g16'),
  cat("nm-17", "Health", "Berhasil mencapai target (menjadi Achiever) dalam Wellness Program atau berperan sebagai duta /coach/edukator/konselor program Health Promotion yang diselenggarakan perusahaan",
    "Ikut serta dalam Program Wellness/Aktifitas Health Promotion yang diselenggarakan oleh perusahaan, dan berhasil mencapai target, atau berperan sebagai duta/coach/edukator/konselor Program Health Promotion di Perusahan pada tahun berjalan", "Dibuktikan dengan adanya dokumentasi kegiatan", 25, 1, "Keikutsertaan pada Program", null),
  cat("nm-18a", "Health", "Tidak Merokok",
    "Tidak merokok sebagai gaya hidup, baik di kantor atau di luar kantor selama 1 tahun terakhir (tidak termasuk Vape/Shisha). (dan hanya bisa diisi sekali)", "Dibuktikan dari catatan hasil MCU atau validasi oleh atasan langsung", 15, 1, "1x setahun", 'g18'),
  cat("nm-18b", "Health", "Berhenti Merokok",
    "Berhenti dari aktifitas merokok selama 6 bulan terakhir (dan hanya bisa diisi sekali)", "Dibuktikan dengan validasi dari Pimpinan langsung", 10, 1, "hanya bisa diklaim 1x selama bekerja", 'g18'),
  cat("nm-19", "Health", "Donor Darah",
    "Ikut serta dalam aktifitas donor darah yang kegiatannya diselenggarakan oleh perusahaan", "Dibuktikan dengan adanya dokumentasi kegiatan", 15, 3, "Jumlah Pelaksanaan", null),
  cat("nm-20", "Health", "Mengikuti skrining Voluntary Counseling and Testing (VCT) HIV/AIDS",
    "Ikut serta dalam aktifitas VCT HIV/AIDS yang kegiatannya diselenggarakan oleh perusahaan", "Dibuktikan dengan adanya dokumentasi kegiatan", 15, 3, "Jumlah Pelaksanaan", null),
  cat("nm-21", "Health", "Ikut serta dalam aktifitas olahraga, seperti senam / lari / gym yang difasilitasi perusahaan",
    "Maksimum 30 poin", "Dibuktikan dengan adanya dokumentasi kegiatan", 15, 2, "3 - 5 kali seminggu (150 menit) selama 3 minggu berturut-turut", null),
  cat("nm-22", "Health", "Mencapai atau mempertahankan berat badan normal sesuai IMT",
    "Berat bandan normal sesuai IMT", "Surat Keterangan dokter perusahaan", 15, 1, "hanya bisa diklaim 1x setahun", null),
  cat("nm-23", "Health", "Keikutsertaan dalam Program Vaksinasi",
    "Ikut serta dalam Program Vaksinasi yang diselenggarakan Pemerintah/Perusahaan", "Dibuktikan dengan adanua Sertifikat Vaksinasi", 25, 2, "Keikutsertaan pada Program", null),
  cat("nm-24", "Health", "Menjadi petugas First Aider",
    "Menjadi petugas First Aider", "SK Penunjukan petugas First Aider", 10, 1, "1x setahun", null),
  cat("nm-25", "Health", "Mengikuti Pelatihan petugas First Aider",
    "Mengikuti Pelatihan petugas First Aider", "SK Penunjukan petugas First Aider & bukti partisipasi pelatihan", 10, 1, "Mengikuti pelatihan atau refreshment", null),
  cat("nm-26", "Health", "Partisipasi Survey Mental Health",
    "Mengikuti Survey Mental Health", "Bukti Partisipasi", 10, 1, "Jumlah Pelaksanaan", null),
  cat("nm-27", "Health", "Memberikan feedback terhadap program kesehatan pada perusahaan",
    "Dapat berupa partisipasi survey layanan kesehatan ataupun kesan pesan (feedback) program /event kesehatan", "Bukti Partisipasi", 10, 2, "Jumlah Pelaksanaan", null),
  cat("nm-28", "Health", "Partisipasi dalam Respectful Workplace Training",
    "Pelatihan dapat diakses oleh seluruh Pekerja melalui Traco/Media lainnya sesuai undangan dari PCU", "Dibuktikan dengan foto/ dokumentasi kegiatan CSCD", 5, 2, "1x per 3 tahun (atau sampai ada modul baru)", null),
  cat("nm-29", "Safety", "Terlibat dalam Tim Pengembangan/Revalidasi Process Safety Information",
    "Berpartisipasi dalam Tim Pengembangan/Revalidasi Process Safety Information (P&ID, PFD, data sheet, dsb.)", "Dibuktikan dengan Surat Perintah/Charter Initiative/Bukti revalidasi dokumen", 20, 3, "Jumlah Keikutsertaan", null),
  cat("nm-30", "Safety", "Terlibat sebagai PHA leader dalam Tim Pengembangan/Revalidasi Process Hazard Analysis",
    "Berpartisipasi sebagai PHA leader dalam Tim Pengembangan/Revalidasi Process Hazard Analysis (HAZOP, HAZID, LOPA)", "Dibuktikan dengan Surat Perintah/Charter Initiative/Daftar Hadir/Notulen", 25, 3, "Jumlah Keikutsertaan", null),
  cat("nm-31", "Safety", "Terlibat sebagai anggota dalam Tim Pengembangan/Revalidasi Process Hazard Analysis",
    "Berpartisipasi sebagai anggota dalam Tim Pengembangan/Revalidasi Process Hazard Analysis (HAZOP, HAZID, LOPA)", "Dibuktikan dengan Surat Perintah/Charter Initiative/Daftar Hadir/Notulen", 20, 3, "Jumlah Keikutsertaan", null),
  cat("nm-32", "Safety", "Terlibat dalam Tim Pengembangan/Revalidasi Prosedur Operasi, Perawatan, atau Asset Integrity",
    "Berpartisipasi dalam Tim Pengembangan/Revalidasi Prosedur Operasi, Perawatan, atau Asset Integrity", "Dibuktikan dengan Surat Perintah/Charter Initiative/Daftar Hadir/Notulen/Bukti Prosedur", 20, 3, "Jumlah Keikutsertaan", null),
  cat("nm-33", "Safety", "Ikut serta pada program Operasi, Perawatan, atau Asset Integrity",
    "Berpartisipasi atau keikutsertaan dalam program Operasi, Perawatan, atau Asset Integrity", "Dibuktikan dengan laporan kegiatan", 5, 12, "Jumlah Keikutsertaan", null),
  cat("nm-34", "Safety", "Ikut serta pada program Management of Change (MoC)",
    "Berpartisipasi atau keikutsertaan dalam program Management of Change (MoC)", "Dibuktikan dengan laporan kegiatan/Daftar Hadir", 10, 12, "Jumlah Keikutsertaan", null),
  cat("nm-35", "Safety", "Ikut serta pada program Pre-Startup Safety Review (PSSR)",
    "Berpartisipasi atau keikutsertaan dalam program Pre-Startup Safety Review (PSSR)", "Dibuktikan dengan laporan kegiatan/Daftar Hadir PSSR", 15, 12, "Jumlah Keikutsertaan", null),
  cat("nm-36", "Safety", "Mendapat penghargaan Best Housekeeeping Award atau lomba HSSE sejenisnya",
    "Mendapat penghargaan Best Housekeeeping Award” atau lomba HSSE sejenisnya", "Dibuktikan dengan dokumentasi program dan penerimaan award", 20, 2, "Jumlah Penghargaan", null),
  cat("nm-37", "Security", "Partisipasi dalam menjaga situasi tetap dalam kondisi aman",
    "Kontribusi Terhadap Penggagalan Security Incident", "Dibuktikan dengan dokumen kegiatan pengagalan/laporan penggagalan", 15, 3, "Jumlah Pelaksanaan", null),
  cat("nm-38", "IT Security", "Penyelesaian e-Learning iSEC",
    "Menyelesaikan seluruh modul e-Learning iSEC melalui link https://ptm.id/iSEC-training", "Dibuktikan dengan sertifikat e-Learning iSEC", 15, 1, "Jumlah Pelaksanaan", null),
  cat("nm-39", "IT Security", "Melaporkan email phishing",
    "Melaporkan phishing email (real/simulasi) melalui report phishing Add-Ins Ms Outlook. Maksimum kumulai 30 point", "Dibuktikan dengan email laporan phishing yang diterima", 15, 2, "Jumlah Pelaksanaan", null),
  cat("nm-40", "IT Security", "Clear Screen Clean Desk (CSCD)",
    "Ikut serta dalam kegiatan Clear Screen Clean Desk (CSCD). Maksimum kumulasi 30 point", "Dibuktikan dengan email laporan phishing yang diterima", 5, 1, "Jumlah Pelaksanaan", null),
  cat("nm-41", "Environment", "Terlibat dalam tim Reduce Reuse Recycle Recovery (4R) limbah B3 dan limbah non B3 Perusahaan",
    "Berpartisipasi dalam Tim Task Force 4R Limbah B3 dan Non B3", "Dibuktikan dengan Surat Perintah/Charter Initiative atau Dokumentasi Kegiatan", 25, 1, "Jumlah Keikutsertaan", null),
  cat("nm-42", "Environment", "Terlibat dalam tim Efisiensi Penggunaan Air Bersih",
    "Berpartisipasi dalam Tim Task Force Efisiensi Penggunaan Air Bersih", "Dibuktikan dengan Surat Perintah/Charter Initiative", 25, 1, "Jumlah Keikutsertaan", null),
  cat("nm-43", "Environment", "Terlibat dalam tim/project Dekarbonisasi yang dicatatkan dalam daftar project Dekarbonisasi ke Holding pada tahun berjalan",
    "Berpartisipasi dalam Tim/Project Dekarbonisasi yang tercatat di Holding", "Dibuktikan dengan Surat Perintah/Charter Initiative", 25, 1, "Jumlah Keikutsertaan", null),
  cat("nm-44", "Environment", "Ikut serta melaksanakan program 4R limbah (bank sampah, donasi pakaian, UCO, composting, biopori, dll) di keluarga, komunitas atau masyarakat",
    "Berpartisipasi atau keikutsertaan dalam program 4R limbah berupa foto dan hasil program. Maksimal akumulasi 30 poin.", "Dibuktikan dengan adanya dokumentasi kegiatan", 5, 6, "Jumlah keikutsertaan", null),
  cat("nm-45", "Environment", "Menggunakan transportasi umum dan/atau kendaraan pribadi rendah emisi (mobil listrik, motor listrik, sepeda) dan/atau berjalan kaki ke tempat kerja",
    "Menggunakan transportasi umum dan/atau kendaraan pribadi rendah emisi ke tempat kerja berupa foto dan hasil program. Dapat diklaim sekali.", "Dibuktikan dengan adanya dokumentasi kegiatan", 15, 1, "Jumlah keikutsertaan", null),
  cat("nm-46", "Environment", "Mengikuti program/gerakan global hemat energi Earth Hour (mematikan lampu) di lingkungan perusahaan, keluarga, komunitas atau masyarakat",
    "Berpartisipasi atau keikutsertaan dalam program/gerakan global hemat energi Earth Hour berupa foto dan hasil program", "Dibuktikan dengan adanya dokumentasi kegiatan", 25, 1, "Jumlah keikutsertaan", null),
  cat("nm-47", "Environment", "Ikut serta melaksanakan penanaman pohon atau penghijauan di lingkungan perusahaan, keluarga, komunitas atau masyarakat",
    "Berpartisipasi atau keikutsertaan dalam melaksanakan penanaman pohon atau penghijauan berupa foto dan hasil program. Maksimal akumulasi 30 poin.", "Dibuktikan dengan adanya dokumentasi kegiatan", 5, 6, "Jumlah keikutsertaan", null),
  cat("nm-48", "ERCM", "Penyelenggara Simulasi Emergency & Crisis di salah satu tingkat pengelolaan kondisi darurat (SERT, IMT, BST, CMT, EST)",
    "Tim penyelenggara dan/atau Tim Tanggap Darurat dalam Simulasi Emergency & Crisis di salah satu tingkat pengelolaan kondisi darurat (SERT, IMT, BST, CMT, EST)", "Dobuktikan dengan Laporan Kegiatan Simulasi/dokumentasi kegiatan", 15, 3, "Jumlah Keikutsertaan", null),
  cat("nm-49", "ERCM", "Terlibat dalam pelaksanaan Emergency & Crisis yang sebenarnya di salah satu tingkat pengelolaan kondisi darurat (SERT, IMT, BST, CMT, EST)",
    "Terlibat dalam pelaksanaan Real - Emergency & Crisis di salah satu tingkat pengelolaan kondisi darurat (SERT, IMT, BST, CMT, EST)", "Dibuktikan dengan Laporan Penanganan Kondisi Emergency/dokumentasi", 20, 2, "Jumlah Keikutsertaan", null),
  cat("nm-50", "ERCM", "Sertifikasi Kompetensi Pengelolaan Emergency & Crisis",
    "Mendapatkan sertifikat kompetensi pengelolaan Emergency & Crisis", "Dibuktikan dengan sertifikat", 20, 2, "Jumlah Keikutsertaan", null),
];

let nonMandatory = []; // item Non-Mandatory yang dipilih user (dibuat dari katalog)
let picks = {};        // draft jumlah aktivitas di layar Pemilihan: { catalogId: jumlah }
let rekapSaved = false;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const sum = (a) => a.reduce((x, y) => x + y, 0);
const icon = (name, cls = '') => `<i class="ico ${cls}">${ICONS[name]}</i>`;
const hydrateIcons = (root) => root.querySelectorAll('[data-icon]').forEach((el) => {
  el.classList.add('ico');
  el.innerHTML = ICONS[el.dataset.icon];
});
hydrateIcons(document);

// Pilihan alternatif UI disimpan per browser (kenyamanan saja, aman bila storage diblokir).
const store = {
  get(k, fallback) { try { return localStorage.getItem(k) ?? fallback; } catch { return fallback; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* abaikan */ } },
};
let pilihAlt = store.get('hsse.pilihAlt', '2');
let rekapAlt = store.get('hsse.rekapAlt', 'dropdown');

/* ---------- Aturan poin & kelengkapan ---------- */
const findCatalog = (id) => catalog.find((c) => c.id === id);
const allItems = () => [...mandatory, ...nonMandatory];
const findItem = (id) => allItems().find((i) => i.id === id);
const isMandatory = (it) => it.type === 'mandatory';
const jenisOf = (it, a) => (a.jenis === '' ? null : it.jenis[Number(a.jenis)]);

// Poin item dari isian saat ini: Mandatory = jumlah poin Jenis, Non-Mandatory = poin per aktivitas × jumlah aktivitas.
function poinNow(it) {
  return isMandatory(it) ? sum(it.acts.map((a) => jenisOf(it, a)?.poin || 0)) : it.poin_per * it.acts.length;
}
const locked = (it) => it.poin !== null && !it.editing;
const complete = (it) => locked(it) && !it.dirty && it.acts.length > 0;
const missingFields = (it, a) => [isMandatory(it) && a.jenis === '' && 'jenis', !a.tanggal && 'tanggal', !a.lokasi.trim() && 'lokasi', !a.file && 'file'].filter(Boolean);

function totals() {
  const m = Math.min(MAX_MANDATORY, sum(mandatory.map((i) => i.poin || 0)));
  const n = Math.min(MAX_NON_MANDATORY, sum(nonMandatory.map((i) => i.poin || 0)));
  return { m, n, all: m + n };
}
const mandatoryDone = () => mandatory.every(complete);
const nonMandatoryDone = () => nonMandatory.length > 0 && nonMandatory.every(complete);

console.assert(poinNow({ type: 'mandatory', jenis: [{ poin: 25 }, { poin: 15 }], acts: [{ jenis: '0' }, { jenis: '1' }, { jenis: '' }] }) === 40, 'poin mandatory = jumlah poin jenis');
console.assert(poinNow({ type: 'non', poin_per: 10, acts: [{}, {}] }) === 20, 'poin non-mandatory = poin × aktivitas');
console.assert(!complete({ poin: 25, editing: false, dirty: true, acts: [{}] }), 'belum simpan = belum lengkap');

/* ---------- Komponen bersama ---------- */
function makeFilter(wrap, tabs, onApply) {
  wrap.append($('#filterTpl').content.cloneNode(true));
  hydrateIcons(wrap);
  const btn = wrap.querySelector('.filter-btn');
  const pop = wrap.querySelector('.filter-pop');
  const search = pop.querySelector('input');
  const list = pop.querySelector('.filter-list');
  const tabBar = pop.querySelector('.filter-tabs');
  // `applied` berlaku di halaman; `picked` hanya pilihan di popup sampai Terapkan. Set kosong = tampilkan semua.
  const f = { applied: tabs.map(() => new Set()) };
  let picked = [];
  let tab = 0;

  const draw = () => {
    tabBar.innerHTML = tabs.map((t, i) => `<button type="button" class="filter-tab${i === tab ? ' active' : ''}" data-tab="${i}">${t.name}${
      picked[i].size ? ` <span class="count">${picked[i].size}</span>` : ''}</button>`).join('');
    const q = search.value.trim().toLowerCase();
    list.innerHTML = tabs[tab].options().filter((o) => o.toLowerCase().includes(q)).map((o) =>
      `<li><button type="button" data-opt="${esc(o)}" aria-pressed="${picked[tab].has(o)}">${esc(o)}${icon('material-symbols:check-rounded', 'check')}</button></li>`).join('');
  };
  const setOpen = (isOpen) => {
    pop.hidden = !isOpen;
    btn.setAttribute('aria-expanded', isOpen);
    if (!isOpen) return;
    picked = f.applied.map((s) => new Set(s));
    tab = 0;
    search.value = '';
    draw();
  };
  const label = () => { const n = sum(f.applied.map((s) => s.size)); btn.querySelector('span').textContent = n ? `Filter (${n})` : 'Filter'; };

  btn.addEventListener('click', () => setOpen(pop.hidden));
  search.addEventListener('input', draw);
  tabBar.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]');
    if (!t) return;
    tab = Number(t.dataset.tab);
    search.value = '';
    draw();
  });
  list.addEventListener('click', (e) => {
    const o = e.target.closest('[data-opt]')?.dataset.opt;
    if (o == null) return;
    picked[tab].has(o) ? picked[tab].delete(o) : picked[tab].add(o);
    draw();
  });
  pop.querySelector('[data-clear]').addEventListener('click', () => { picked.forEach((s) => s.clear()); draw(); });
  pop.querySelector('[data-apply]').addEventListener('click', () => { f.applied = picked; label(); setOpen(false); onApply(); });
  // composedPath, bukan target.closest: klik item me-render ulang list sehingga target sudah terlepas dari DOM.
  document.addEventListener('click', (e) => { if (!e.composedPath().includes(wrap)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  f.reset = () => { f.applied = tabs.map(() => new Set()); label(); };
  return f;
}

// Jawaban dibaca dari event submit (pasti terpicu & sinkron), bukan event close yang bisa tidak terpicu ulang di Chrome.
let confirmResolve = null;
const answerConfirm = (yes) => { confirmResolve?.(yes); confirmResolve = null; };
function confirmBox(title, text) {
  $('#confirmTitle').textContent = title;
  $('#confirmText').textContent = text;
  answerConfirm(false);
  $('#confirmDialog').showModal();
  return new Promise((resolve) => { confirmResolve = resolve; });
}
$('#confirmDialog form').addEventListener('submit', (e) => answerConfirm(e.submitter?.value === 'yes'));
$('#confirmDialog').addEventListener('cancel', () => answerConfirm(false));
$('#confirmDialog').addEventListener('click', (e) => {
  if (e.target !== e.currentTarget) return;
  e.currentTarget.close();
  answerConfirm(false);
});

// Pilihan alternatif UI ditaruh di tengah footer.
const FOOT_ALT = '<div class="alt-switch" id="footAlt" role="group" aria-label="Alternatif UI"></div>';
function altSwitch(el, options, current, onPick) {
  el.innerHTML = `<span>Alternatif UI</span>${options.map(([v, label]) =>
    `<button type="button" data-alt="${v}" aria-pressed="${v === current}">${label}</button>`).join('')}`;
  el.onclick = (e) => { const v = e.target.closest('[data-alt]')?.dataset.alt; if (v) onPick(v); };
}

const totalsHTML = ({ m, n, all }) => `
  <div class="totals">
    <div><span><b class="big">${m}</b><small> Poin</small></span><span>Total Realisasi Mandatory</span></div>
    <div><span><b class="big">${n}</b><small> Poin</small></span><span>Total Realisasi Non-Mandatory</span></div>
    <div><span><b class="big">${all}</b><small>/200 Poin</small></span><span>Total Realisasi Semua</span></div>
  </div>`;
const nextLink = (href, enabled) => enabled
  ? `<a class="btn" href="${href}">Selanjutnya ${icon('tabler:arrow-right')}</a>`
  : `<button class="btn" disabled>Selanjutnya ${icon('tabler:arrow-right')}</button>`;

/* ---------- 1. Pengisian realisasi ---------- */
let tab = 'mandatory';
const tabItems = () => (tab === 'mandatory' ? mandatory : nonMandatory);
const realFilter = makeFilter($('#realFilter'), [
  { name: 'Kategori', options: () => [...new Set(tabItems().map((i) => i.kategori))] },
], () => renderReal());

const jenisText = (it, a) => { const j = jenisOf(it, a); return j ? esc(`${j.label} — ${j.poin} Poin`) : ''; };

function actHTML(it, a, i) {
  const dis = locked(it) ? 'disabled' : '';
  const miss = it.showErrors ? missingFields(it, a) : [];
  const inv = (f) => (miss.includes(f) ? ' aria-invalid="true"' : '');
  // Label opsi dari Excel bisa sangat panjang: dropdown dibuat selebar kartu + teks lengkap pilihan ditampilkan di bawahnya.
  const jenisRow = isMandatory(it)
    ? `<label class="full">Jenis <select data-field="jenis" ${dis}${inv('jenis')}>
        <option value="">Pilih Jenis</option>
        ${it.jenis.map((j, ji) => `<option value="${ji}"${String(ji) === a.jenis ? ' selected' : ''}>${esc(j.label)} (${j.poin} Poin)</option>`).join('')}
      </select><small class="jenis-full" data-jenis-full>${jenisText(it, a)}</small></label>`
    : '';
  const file = a.file
    ? `<div class="file-box">${icon('line-md:file-twotone', 'file-ico')}
        <div class="file-meta"><b>${esc(a.file.name)}</b><small>${(a.file.size / 1024 / 1024).toFixed(1)} MB</small></div>
        <button type="button" class="btn" data-view>${icon('mdi:eye')}Lihat File</button>
        ${locked(it) ? '' : `<button type="button" class="btn-outline" data-pick>${icon('iconamoon:swap-bold')}Ubah File</button>
        <button type="button" class="btn-outline danger" data-del-file>${icon('mdi:trash')}Hapus File</button>`}
      </div>`
    : `<div class="drop-inline${miss.includes('file') ? ' invalid' : ''}" data-drop>
        <img src="assets/upload-illustration.svg" alt="" width="40" height="39">
        <span class="link">Tarik dan lepaskan file yang Anda ingin unggah</span><span class="muted">atau</span>
        <button type="button" class="btn" data-pick ${dis}>Pilih File</button>
      </div>`;
  return `
    <div class="act" data-act="${i}">
      <div class="act-head"><span class="chip chip-blue">Aktivitas ${i + 1}</span>${isMandatory(it) ? '' : `<span class="chip chip-blue">${it.poin_per} Poin</span>`}
        <button type="button" class="link-danger" data-del-act ${dis || (isMandatory(it) ? 'disabled' : '')}>${icon('ic:round-delete')}Hapus</button></div>
      ${jenisRow}
      <div class="act-grid">
        <label>Periode<select data-field="periode" ${dis}>${['2025', '2024'].map((y) => `<option${y === a.periode ? ' selected' : ''}>${y}</option>`).join('')}</select></label>
        <label>Tanggal Pelaksanaan<input type="date" data-field="tanggal" value="${esc(a.tanggal)}" ${dis}${inv('tanggal')}></label>
        <label>Lokasi<input data-field="lokasi" value="${esc(a.lokasi)}" placeholder="Isi Lokasi Kegiatan" ${dis}${inv('lokasi')}></label>
      </div>
      <label class="full">Keterangan<textarea data-field="ket" rows="3" placeholder="Isi Keterangan" ${dis}>${esc(a.ket)}</textarea></label>
      <div class="upload-label"><b>Upload Evidence</b> <small>PDF (maks. ukuran file 2MB)</small></div>
      ${file}
    </div>`;
}

function itemHTML(it) {
  const lock = locked(it);
  const ribbon = isMandatory(it) ? (it.poin ?? 0) : poinNow(it);
  const canAdd = !lock && it.acts.length < it.max;
  return `
    <article class="hsse-item" data-item="${it.id}">
      <span class="ribbon">${ribbon} Poin</span>
      <div class="hi-head">
        <div class="chips">
          <span class="chip chip-blue">${esc(it.kategori)}</span>
          <span class="chip chip-blue">Evidence: ${esc(it.evidence)}</span>
          ${isMandatory(it) ? '' : `<span class="chip chip-blue">Maksimal Aktivitas: ${it.max}</span>
          <span class="menu-wrap">
            <button type="button" class="icon-btn dots" data-menu aria-label="Menu aktivitas" aria-expanded="false" ${lock ? 'disabled' : ''}>${icon('ri:more-fill')}</button>
            <span class="menu" hidden>
              <button type="button" data-add-act ${canAdd ? '' : 'disabled'}>${icon('ic:round-plus')}Tambah Aktivitas</button>
              <button type="button" class="danger" data-del-all ${it.acts.length ? '' : 'disabled'}>${icon('ic:round-delete')}Hapus Semua Aktivitas</button>
            </span>
          </span>`}
        </div>
        <div class="hi-title">
          <div><h3>${esc(it.name)}</h3>${isMandatory(it) ? '' : `<p class="muted small">${esc(it.desc)}</p>`}</div>
          <div class="hi-actions">
            ${lock ? `<button type="button" class="btn-outline" data-edit>${icon('mdi:pencil')}Edit</button>` : ''}
            <button type="button" class="btn" data-save ${lock || !it.dirty ? 'disabled' : ''}>${icon('fa-solid:save')}Simpan</button>
            <button type="button" class="icon-btn caret" data-toggle aria-expanded="${it.open}" aria-label="${it.open ? 'Tutup' : 'Buka'} aktivitas">${icon(it.open ? 'tabler:chevron-up' : 'mdi:chevron-down')}</button>
          </div>
        </div>
        ${it.showErrors && it.error ? `<p class="error" role="alert">${it.error}</p>` : ''}
      </div>
      ${it.open ? `<div class="acts">${it.acts.map((a, i) => actHTML(it, a, i)).join('')}
        ${canAdd || isMandatory(it) ? `<button type="button" class="add-tile" data-add-act ${canAdd ? '' : 'disabled title="Batas aktivitas Mandatory sudah sesuai standar"'}>${icon('ic:round-plus')}Tambah Aktivitas</button>` : ''}</div>` : ''}
    </article>`;
}

function renderReal() {
  document.querySelectorAll('#viewReal [data-tab]').forEach((t) => t.setAttribute('aria-selected', t.dataset.tab === tab));
  $('#addActivity').hidden = tab !== 'non-mandatory' || !nonMandatory.length;
  const q = $('#realSearch').value.trim().toLowerCase();
  const [kats] = realFilter.applied;
  const items = tabItems().filter((i) => (!kats.size || kats.has(i.kategori)) && i.name.toLowerCase().includes(q));
  if (tab === 'non-mandatory' && !nonMandatory.length) {
    $('#realList').innerHTML = `
      <div class="empty-state">
        <img src="assets/empty-illustration.svg" alt="" width="158" height="203">
        <h2>Kategori Aktivitas Anda Kosong</h2>
        <p class="muted">Silakan untuk memilih kategori aktivitas Anda di bawah ini</p>
        <a class="btn" href="#pilih">Mulai Mencari ${icon('tabler:arrow-right')}</a>
      </div>`;
  } else {
    $('#realList').innerHTML = items.map(itemHTML).join('') || '<p class="empty">Tidak ada aktivitas yang cocok</p>';
  }
  renderRealFoot();
}

function renderRealFoot() {
  const done = tab === 'mandatory' ? mandatoryDone() : nonMandatoryDone();
  $('#foot').innerHTML = totalsHTML(totals()) + nextLink(tab === 'mandatory' ? '#non-mandatory' : '#rekap', done);
}

let fileTarget = null;

function setFile(it, a, f) {
  if (!f) return;
  if (!/\.pdf$/i.test(f.name) || f.size > MAX_FILE) return alert('File harus berformat PDF dan maksimal 2MB');
  if (a.url) URL.revokeObjectURL(a.url);
  a.file = f;
  a.url = URL.createObjectURL(f);
  it.dirty = true;
  renderReal();
}

function removeItemIfEmpty(it) {
  if (isMandatory(it) || it.acts.length) return;
  nonMandatory = nonMandatory.filter((i) => i !== it);
}

$('#realList').addEventListener('click', async (e) => {
  const card = e.target.closest('[data-item]');
  const btn = e.target.closest('button');
  if (!card || !btn) return;
  const it = findItem(card.dataset.item);
  const actEl = btn.closest('[data-act]');
  const a = actEl && it.acts[Number(actEl.dataset.act)];

  if ('toggle' in btn.dataset) { it.open = !it.open; return renderReal(); }
  if ('menu' in btn.dataset) {
    const menu = btn.nextElementSibling;
    menu.hidden = !menu.hidden;
    return btn.setAttribute('aria-expanded', !menu.hidden);
  }
  if ('edit' in btn.dataset) { it.editing = true; it.open = true; return renderReal(); }
  if ('addAct' in btn.dataset) {
    if (it.acts.length >= it.max) return;
    it.acts.push(newAct());
    it.open = true;
    it.dirty = true;
    return renderReal();
  }
  if ('pick' in btn.dataset) { fileTarget = { it, a }; return $('#fileInput').click(); }
  if ('view' in btn.dataset) return window.open(a.url, '_blank');
  if ('delFile' in btn.dataset) {
    if (!await confirmBox('Apakah Anda ingin menghapus file evidence?', 'File Evidence dalam aktivitas tersebut akan dihapus setelah Anda konfirmasi')) return;
    URL.revokeObjectURL(a.url);
    a.file = a.url = null;
    it.dirty = true;
    return renderReal();
  }
  if ('delAct' in btn.dataset || 'delAll' in btn.dataset) {
    const all = 'delAll' in btn.dataset;
    const ok = await confirmBox(all ? 'Apakah Anda ingin menghapus semua aktivitas?' : 'Apakah Anda ingin menghapus aktivitas?',
      'Jika semua list realisasi dihapus, maka akan menghilangkan kelompok aktivitas');
    if (!ok) return;
    const removed = all ? it.acts.splice(0) : it.acts.splice(it.acts.indexOf(a), 1);
    removed.forEach((r) => r.url && URL.revokeObjectURL(r.url));
    it.dirty = true;
    removeItemIfEmpty(it);
    return renderReal();
  }
  if ('save' in btn.dataset) {
    const incomplete = it.acts.some((x) => missingFields(it, x).length);
    it.showErrors = incomplete || !it.acts.length;
    it.error = !it.acts.length ? 'Tambahkan minimal 1 aktivitas sebelum menyimpan.'
      : 'Lengkapi isian yang ditandai merah (Jenis, Tanggal Pelaksanaan, Lokasi, dan Upload Evidence) pada setiap aktivitas.';
    if (it.showErrors) { it.open = true; return renderReal(); }
    if (!await confirmBox('Apakah Anda ingin menyimpan data realisasi?', 'Data realisasi akan berubah menjadi yang terbaru')) return;
    it.poin = poinNow(it);
    it.editing = it.dirty = false;
    rekapSaved = false;
    return renderReal();
  }
});

// Ketik di isian: simpan ke state tanpa render ulang (supaya fokus tidak hilang), cukup perbarui tombol & footer.
function onField(e) {
  const field = e.target.dataset.field;
  if (!field) return;
  const it = findItem(e.target.closest('[data-item]').dataset.item);
  const a = it.acts[Number(e.target.closest('[data-act]').dataset.act)];
  a[field] = e.target.value;
  it.dirty = true;
  if (e.target.value.trim()) e.target.removeAttribute('aria-invalid');
  if (field === 'jenis') e.target.parentElement.querySelector('[data-jenis-full]').innerHTML = jenisText(it, a);
  e.target.closest('[data-item]').querySelector('[data-save]').disabled = false;
  renderRealFoot();
}
$('#realList').addEventListener('input', onField);
$('#realList').addEventListener('change', onField);

$('#realList').addEventListener('dragover', (e) => { const z = e.target.closest('[data-drop]'); if (z) { e.preventDefault(); z.classList.add('over'); } });
$('#realList').addEventListener('dragleave', (e) => e.target.closest('[data-drop]')?.classList.remove('over'));
$('#realList').addEventListener('drop', (e) => {
  const z = e.target.closest('[data-drop]');
  if (!z) return;
  e.preventDefault();
  const it = findItem(z.closest('[data-item]').dataset.item);
  if (!locked(it)) setFile(it, it.acts[Number(z.closest('[data-act]').dataset.act)], e.dataTransfer.files[0]);
});
$('#fileInput').addEventListener('change', (e) => {
  if (fileTarget) setFile(fileTarget.it, fileTarget.a, e.target.files[0]);
  e.target.value = '';
});
document.addEventListener('click', (e) => {
  document.querySelectorAll('.menu:not([hidden])').forEach((m) => {
    if (!e.composedPath().includes(m.parentElement)) {
      m.hidden = true;
      m.previousElementSibling.setAttribute('aria-expanded', 'false');
    }
  });
});
$('#realSearch').addEventListener('input', () => renderReal());

/* ---------- 2. Pemilihan aktivitas (Alt. 1 kartu, Alt. 2 dropdown/tabel, Alt. 3 dua panel) ---------- */
const openKat = new Set([KATEGORI[0]]);
const pilihFilter = makeFilter($('#pilihFilter'), [{ name: 'Kategori', options: () => KATEGORI }], () => renderPilih());
const pickedPoin = () => sum(Object.entries(picks).map(([id, n]) => findCatalog(id).poin * n));

// Aktivitas lain di group yang sama yang sudah dipilih (aturan "pilih 1 dari 2" di Excel).
const blockedBy = (c) => c.group && catalog.find((o) => o.group === c.group && o.id !== c.id && picks[o.id]);

function stepperHTML(c) {
  const n = picks[c.id] || 0;
  const block = blockedBy(c);
  return `<div class="num-stepper">
    <button type="button" data-dec="${c.id}" aria-label="Kurangi ${esc(c.name)}" ${n <= 0 ? 'disabled' : ''}>${icon('ic:round-minus')}</button>
    <output aria-live="polite">${n}</output>
    <button type="button" data-inc="${c.id}" aria-label="Tambah ${esc(c.name)}" ${n >= c.max || block ? 'disabled' : ''}>${icon('ic:round-plus')}</button>
  </div>${block ? `<small class="group-note">Hanya boleh pilih salah satu dengan "${esc(block.name)}"</small>` : ''}`;
}

function pickCardHTML(c, { removable = false } = {}) {
  return `
    <article class="pick-card${picks[c.id] && !removable ? ' selected' : ''}">
      <span class="ribbon">${c.poin} Point</span>
      <span class="chip chip-blue">${esc(c.kategori)}</span>
      <h3>${esc(c.name)}</h3>
      <p class="muted small">${esc(c.desc)}</p>
      <div class="pick-foot">
        <div><b class="ev-label">Evidence</b><p class="small">${esc(c.evidence)}</p></div>
        <div class="pick-count"><b>${esc(c.kriteria)}</b>${stepperHTML(c)}<small class="muted">Maks. ${c.max} aktivitas</small>
          ${removable ? `<button type="button" class="btn-outline danger" data-unpick="${c.id}">${icon('ic:round-delete')}Hapus</button>` : ''}</div>
      </div>
    </article>`;
}

function renderPilih() {
  const q = $('#pilihSearch').value.trim().toLowerCase();
  const [kats] = pilihFilter.applied;
  const list = catalog.filter((c) => (!kats.size || kats.has(c.kategori)) && `${c.name} ${c.kategori} ${c.desc}`.toLowerCase().includes(q));
  const empty = '<p class="empty">Tidak ada aktivitas yang cocok</p>';

  if (pilihAlt === '1') {
    $('#pilihList').innerHTML = list.length ? `<div class="pick-grid">${list.map((c) => pickCardHTML(c)).join('')}</div>` : empty;
  } else if (pilihAlt === '2') {
    const groups = KATEGORI.map((k) => [k, list.filter((c) => c.kategori === k)]).filter(([, cs]) => cs.length);
    $('#pilihList').innerHTML = groups.map(([k, cs]) => `
      <details class="period" data-kat="${esc(k)}"${openKat.has(k) ? ' open' : ''}>
        <summary><b>${esc(k)}</b><span><span class="big">${sum(cs.map((c) => c.poin * (picks[c.id] || 0)))}</span><small> Poin</small></span>${icon('tabler:chevron-up', 'caret')}</summary>
        <div class="table-scroll"><table class="hsse-table">
          <thead><tr><th>Nama Aktivitas</th><th>Poin per Aktivitas</th><th>Maksimal Aktivitas</th><th>Kriteria Perhitungan</th><th>Keterangan</th><th>Evidence</th><th>Jumlah Aktivitas</th></tr></thead>
          <tbody>${cs.map((c) => `<tr class="${picks[c.id] ? 'selected' : ''}"><td>${esc(c.name)}</td><td>${c.poin}</td><td>${c.max}</td><td>${esc(c.kriteria)}</td>
            <td>${esc(c.desc)}</td><td>${esc(c.evidence)}</td><td>${stepperHTML(c)}</td></tr>`).join('')}</tbody>
        </table></div>
      </details>`).join('') || empty;
  } else {
    const chosen = catalog.filter((c) => picks[c.id]);
    $('#pilihList').innerHTML = `
      <div class="two-col">
        <section><h2 class="col-title">Pilih Aktivitas</h2><div class="pick-stack">${list.map((c) => pickCardHTML(c)).join('') || empty}</div></section>
        <section><h2 class="col-title">Aktivitas Terpilih</h2><div class="pick-stack chosen">${chosen.map((c) => pickCardHTML(c, { removable: true })).join('')
          || '<p class="empty">Aktivitas Anda masih kosong<br>Silakan untuk memilih terlebih dahulu</p>'}</div></section>
      </div>`;
  }
  const n = pickedPoin();
  $('#foot').innerHTML = FOOT_ALT + `
    <div class="totals"><div><span><b class="big">${n}</b><small> Poin</small></span><span>Total Poin Aktivitas Terpilih</span></div></div>
    <button type="button" class="btn" data-commit ${n ? '' : 'disabled'}>Selanjutnya ${icon('tabler:arrow-right')}</button>`;
  altSwitch($('#footAlt'), [['1', 'Alt. 1 Kartu'], ['2', 'Alt. 2 Dropdown'], ['3', 'Alt. 3 Two Menus']], pilihAlt, (v) => {
    pilihAlt = v;
    store.set('hsse.pilihAlt', v);
    renderPilih();
  });
}

$('#pilihList').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const id = b.dataset.inc || b.dataset.dec || b.dataset.unpick;
  if (!id) return;
  const c = findCatalog(id);
  const n = picks[id] || 0;
  if (b.dataset.inc && blockedBy(c)) return;
  picks[id] = b.dataset.unpick ? 0 : Math.max(0, Math.min(c.max, n + (b.dataset.inc ? 1 : -1)));
  if (!picks[id]) delete picks[id];
  renderPilih();
});
$('#pilihList').addEventListener('toggle', (e) => {
  const k = e.target.dataset.kat;
  if (k) e.target.open ? openKat.add(k) : openKat.delete(k);
}, true);
$('#pilihSearch').addEventListener('input', () => renderPilih());

// Terapkan pilihan: item yang sudah ada dipertahankan (isian tidak hilang), jumlah aktivitas disesuaikan.
function commitPicks() {
  nonMandatory = catalog.filter((c) => picks[c.id]).map((c) => {
    const it = nonMandatory.find((i) => i.id === c.id)
      || { ...c, type: 'non', poin_per: c.poin, acts: [], open: true, poin: null, editing: false, dirty: false };
    const want = picks[c.id];
    if (it.acts.length !== want) {
      while (it.acts.length < want) it.acts.push(newAct());
      it.acts.splice(want).forEach((r) => r.url && URL.revokeObjectURL(r.url));
      it.dirty = true;
      if (it.poin !== null) it.editing = true;
    }
    return it;
  });
  rekapSaved = false;
  location.hash = 'non-mandatory';
}
$('#foot').addEventListener('click', async (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if ('commit' in b.dataset) return commitPicks();
  if ('rekapSave' in b.dataset) {
    if (!await confirmBox('Apakah Anda ingin menyimpan data realisasi?', 'Data realisasi akan berubah menjadi yang terbaru')) return;
    rekapSaved = true;
    return renderRekap();
  }
  if ('rekapEdit' in b.dataset) { rekapSaved = false; location.hash = 'mandatory'; }
});

/* ---------- 3. Rekap realisasi (Alt. 1 tabel, Alt. 2 dropdown) ---------- */
const GROUPS = [['Mandatory', () => mandatory], ['Non Mandatory', () => nonMandatory]];
const rekapFilter = makeFilter($('#rekapFilter'), [
  { name: 'Jenis HSSE Objective', options: () => GROUPS.map(([g]) => g) },
  { name: 'Kategori', options: () => [...new Set(allItems().map((i) => i.kategori))] },
], () => renderRekap());

function rekapRows(items) {
  return items.filter((i) => i.poin !== null && i.acts.length).map((i) => `
    <tr>
      <td>${esc(i.kategori)}</td>
      <td>${esc(i.name)}</td>
      <td>${esc(isMandatory(i) ? [...new Set(i.acts.map((a) => jenisOf(i, a)?.desc).filter(Boolean))].join('; ') : i.desc)}</td>
      <td>${esc(i.evidence)}</td>
      <td><div class="file-btns">${i.acts.map((a, ai) => (a.url
        ? `<button type="button" class="btn-outline" data-open="${i.id}:${ai}">${icon('mdi:eye')}Lihat File${i.acts.length > 1 ? ` ${ai + 1}` : ''}</button>` : '')).join('')}</div></td>
      <td>${i.acts.length}</td>
      <td>${i.poin} Poin</td>
    </tr>`).join('');
}

function renderRekap() {
  const q = $('#rekapSearch').value.trim().toLowerCase();
  const [jenis, kats] = rekapFilter.applied;
  const groups = GROUPS.filter(([g]) => !jenis.size || jenis.has(g)).map(([g, items]) =>
    [g, items().filter((i) => (!kats.size || kats.has(i.kategori)) && i.name.toLowerCase().includes(q))]);
  const head = (ketLabel) => `<thead><tr><th>Kategori</th><th>Daftar Aktivitas</th><th>${ketLabel}</th><th>Evidence</th><th>File Lampiran Evidence</th><th>Jumlah Aktivitas Terisi</th><th>Total Poin</th></tr></thead>`;
  const none = '<tr><td colspan="7" class="empty">Belum ada aktivitas tersimpan</td></tr>';

  $('#rekapList').innerHTML = rekapAlt === 'tabel'
    ? `<div class="table-scroll"><table class="hsse-table rekap">${head('Keterangan')}<tbody>
        ${groups.map(([g, items]) => `<tr class="group"><td colspan="7">${g === 'Mandatory' ? 'Mandatory' : 'Non-Mandatory'}</td></tr>${rekapRows(items) || none}`).join('')}
      </tbody></table></div>`
    : groups.map(([g, items]) => `
      <details class="period" open>
        <summary><b>${g === 'Mandatory' ? 'Mandatory' : 'Non-Mandatory'}</b>${icon('tabler:chevron-up', 'caret')}</summary>
        <div class="table-scroll"><table class="hsse-table">${head('Jenis/Keterangan')}<tbody>${rekapRows(items) || none}</tbody></table></div>
      </details>`).join('');

  $('#foot').innerHTML = FOOT_ALT + totalsHTML(totals()) + `<span class="foot-actions">
    ${rekapSaved ? `<button type="button" class="btn-outline" data-rekap-edit>${icon('mdi:pencil')}Edit</button>
      <a class="btn" href="${IG_URL}">Kembali ke Realisasi Target</a>` : ''}
    <button type="button" class="btn" data-rekap-save ${rekapSaved ? 'disabled' : ''}>Simpan Data Realisasi</button></span>`;
  altSwitch($('#footAlt'), [['tabel', 'Alt. 1 Tabel'], ['dropdown', 'Alt. 2 Dropdown']], rekapAlt, (v) => {
    rekapAlt = v;
    store.set('hsse.rekapAlt', v);
    renderRekap();
  });
}

$('#rekapList').addEventListener('click', (e) => {
  const [id, ai] = (e.target.closest('[data-open]')?.dataset.open || '').split(':');
  if (id) window.open(findItem(id).acts[Number(ai)].url, '_blank');
});
$('#rekapSearch').addEventListener('input', () => renderRekap());

/* ---------- Routing: #mandatory, #non-mandatory, #pilih, #rekap ---------- */
function route() {
  const h = location.hash.slice(1) || 'mandatory';
  if (h === 'rekap' && !(mandatoryDone() && nonMandatoryDone())) return location.replace('#non-mandatory');
  const view = h === 'pilih' ? 'pilih' : h === 'rekap' ? 'rekap' : 'real';
  $('#viewReal').hidden = view !== 'real';
  $('#viewPilih').hidden = view !== 'pilih';
  $('#viewRekap').hidden = view !== 'rekap';
  if (view === 'real') {
    const next = h === 'non-mandatory' ? 'non-mandatory' : 'mandatory';
    if (next !== tab) { tab = next; realFilter.reset(); $('#realSearch').value = ''; }
    renderReal();
  } else if (view === 'pilih') {
    picks = Object.fromEntries(nonMandatory.map((i) => [i.id, i.acts.length]));
    renderPilih();
  } else {
    renderRekap();
  }
  scrollTo(0, 0);
}

$('#toggleFlow').addEventListener('click', () => {
  const hidden = $('#stepper').classList.toggle('hidden');
  $('#toggleFlow i').innerHTML = ICONS[hidden ? 'mdi:eye' : 'mdi:eye-off'];
  $('#toggleFlow span').textContent = hidden ? 'Tampilkan Alur' : 'Sembunyikan Alur';
});

window.addEventListener('hashchange', route);
route();
