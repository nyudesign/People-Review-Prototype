// Soal Behavior Survey bersama: dipakai Self Review dan Penilaian 360 (Nominate 360) supaya soalnya sama persis.
// Soal 1-2 dari Figma; soal 3-10 di Figma masih salinan soal 1/2.
// shortcut: soal 3-10 adalah contoh sementara, ganti dengan daftar soal resmi saat tersedia.
const QUESTIONS = [
  ['Ketika anggota tim menyampaikan keluhan mengenai pekerjaan, saya biasanya',
    ['Memberikan solusi', 'Mengarahkan ke prosedur', 'Mendengarkan hingga memahami situasi', 'Meminta menyelesaikan sendiri']],
  ['Saat rekan kerja terlihat mengalami tekanan kerja tinggi',
    ['Fokus pekerjaan masing-masing', 'Menanyakan kondisi dan membantu', 'Menunggu diminta', 'Menghindari keterlibatan']],
  ['Ketika target tim tidak tercapai, saya biasanya',
    ['Mencari siapa yang bertanggung jawab', 'Mengevaluasi bersama dan mencari perbaikan', 'Menyerahkan evaluasi ke atasan', 'Melanjutkan pekerjaan tanpa evaluasi']],
  ['Saat menerima masukan kritis dari rekan kerja',
    ['Menerima dan menindaklanjuti', 'Menjelaskan alasan tindakan saya', 'Mengabaikan bila tidak sesuai', 'Meminta bukti terlebih dahulu']],
  ['Ketika ada anggota tim baru bergabung',
    ['Membiarkan belajar sendiri', 'Memberikan dokumen panduan', 'Mendampingi hingga dapat bekerja mandiri', 'Menyerahkan pengenalan ke HR']],
  ['Saat terjadi perbedaan pendapat dalam rapat',
    ['Mempertahankan pendapat saya', 'Mendengarkan semua pihak lalu mencari titik temu', 'Mengikuti suara terbanyak', 'Diam agar tidak memperpanjang']],
  ['Ketika menemukan kondisi tidak aman di area kerja',
    ['Melaporkan dan menghentikan pekerjaan bila perlu', 'Menunggu orang lain melapor', 'Memberi tahu rekan terdekat saja', 'Melanjutkan pekerjaan dengan hati-hati']],
  ['Saat beban kerja tim tidak merata',
    ['Membiarkan sesuai pembagian awal', 'Menawarkan bantuan kepada yang kewalahan', 'Melaporkan ke atasan', 'Menyelesaikan bagian sendiri lebih dulu']],
  ['Ketika keberhasilan tim mendapat apresiasi',
    ['Menyebutkan kontribusi setiap anggota', 'Menerima apresiasi atas nama saya', 'Tidak menanggapi', 'Menyebutkan kontribusi utama saya']],
  ['Saat diminta membantu pekerjaan di luar tanggung jawab saya',
    ['Menolak karena bukan tugas saya', 'Membantu sesuai kemampuan tanpa mengganggu tugas utama', 'Membantu bila diperintah atasan', 'Menunda sampai tugas saya selesai']],
].map(([text, options]) => ({ text, options }));
const LETTERS = ['A', 'B', 'C', 'D'];
