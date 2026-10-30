// Soal Behavior Survey bersama: dipakai Self Review dan Penilaian 360 (Nominate 360) supaya soalnya sama persis.
// Sumber: Form_LBS_Servant_Leadership_v2 (sheet Form_Penilaian & Kunci_PG): 20 soal situasi, 2 per prinsip Servant Leadership.
// Urutan opsi A-D mengikuti form; scores = bobot 1-4 tiap opsi (4 = servant leadership penuh), untuk perhitungan nanti.
const QUESTIONS = [
  ['MDG-01', 'Mendengarkan', "Saat sedang sibuk menyelesaikan laporan yang mendesak, seorang rekan/anggota tim datang menyampaikan keluhan tentang beban kerjanya.",
    ["Meminta yang bersangkutan menyampaikannya lain kali tanpa menjadwalkan waktu.", "Menghentikan pekerjaan sejenak atau menjadwalkan waktu khusus, mendengarkan sepenuhnya, menggali akar masalah, lalu menindaklanjutinya bersama.", "Mendengarkan sambil tetap mengerjakan laporan dan memberi tanggapan singkat.", "Mendengarkan keluhan dengan saksama hingga selesai, lalu memberikan tanggapan."],
    [1, 4, 2, 3]],
  ['MDG-02', 'Mendengarkan', "Dalam rapat, seorang anggota tim junior menyampaikan ide yang berbeda dari rencana yang sudah disusun.",
    ["Mendengarkan hingga selesai dan meminta ide tersebut dibahas lebih lanjut setelah rapat.", "Memotong pembicaraan karena rencana dianggap sudah final.", "Mengapresiasi, menggali alasan dan manfaat idenya, lalu mempertimbangkannya secara serius untuk menyempurnakan rencana.", "Mendengarkan sekilas lalu kembali ke rencana awal tanpa membahasnya."],
    [3, 1, 4, 2]],
  ['EMP-01', 'Empati', "Kinerja seorang rekan kerja yang biasanya baik menurun drastis dalam dua minggu terakhir.",
    ["Mengingatkan agar kinerjanya segera kembali sesuai target.", "Menanyakan kabarnya dan menawarkan bantuan bila diperlukan.", "Langsung melaporkan penurunan kinerja tersebut tanpa mencari tahu penyebabnya.", "Mengajak bicara secara pribadi, memahami kondisi yang dialaminya, lalu bersama-sama mencari solusi atau dukungan yang dibutuhkan."],
    [2, 3, 1, 4]],
  ['EMP-02', 'Empati', "Tim terdiri dari anggota dengan latar belakang, generasi, dan gaya kerja yang berbeda-beda.",
    ["Mengenali kebutuhan masing-masing, lalu menyesuaikan cara komunikasi dan penugasan agar setiap orang dapat berkontribusi optimal.", "Menerapkan satu cara kerja yang sama untuk semua orang tanpa mempertimbangkan perbedaan.", "Menghargai perbedaan dan bersikap terbuka terhadap gaya kerja masing-masing.", "Menganggap perbedaan sebagai hambatan dan meminta semua orang menyesuaikan diri."],
    [4, 2, 3, 1]],
  ['HEA-01', 'Healing', "Sebuah proyek gagal mencapai target dan tim terlihat kehilangan semangat.",
    ["Mengajak refleksi tanpa saling menyalahkan, mengakui usaha tim, memulihkan semangat, dan menyusun rencana perbaikan bersama.", "Mencari pihak yang paling bertanggung jawab atas kegagalan tersebut.", "Memberikan kata-kata penyemangat dan mengajak tim fokus pada pekerjaan berikutnya.", "Membiarkan tim pulih dengan sendirinya seiring waktu."],
    [4, 1, 3, 2]],
  ['HEA-02', 'Healing', "Terjadi ketegangan antara dua anggota tim yang mulai mengganggu suasana kerja.",
    ["Tidak ikut campur selama pekerjaan masih berjalan.", "Memfasilitasi dialog terbuka antara keduanya, membantu memulihkan hubungan, dan memastikan kesepakatan dijalankan.", "Memihak salah satu pihak atau membicarakan konflik tersebut dengan orang lain.", "Berbicara dengan masing-masing pihak secara terpisah untuk meredakan ketegangan."],
    [2, 4, 1, 3]],
  ['AWR-01', 'Awareness', "Menerima umpan balik bahwa cara berkomunikasinya terkesan kurang menghargai orang lain.",
    ["Menerima masukan tersebut dan berusaha lebih berhati-hati dalam berkomunikasi.", "Mendengarkan masukan, tetapi menganggapnya hanya persepsi sebagian orang.", "Merefleksikan diri, meminta contoh konkret, menyusun langkah perbaikan, dan meminta umpan balik lanjutan secara berkala.", "Membela diri dan menolak masukan tersebut."],
    [3, 2, 4, 1]],
  ['AWR-02', 'Awareness', "Tim mendapat tugas baru yang membutuhkan keahlian yang belum sepenuhnya dikuasai.",
    ["Tetap mengerjakan sendiri meskipun belum menguasai, tanpa melibatkan pihak lain.", "Mengakui keterbatasan yang ada dan meminta bantuan pihak yang lebih ahli.", "Membagi tugas secara merata tanpa mempertimbangkan kemampuan masing-masing.", "Memetakan kekuatan dan keterbatasan diri maupun tim, lalu mengatur pembagian peran, pembelajaran, atau dukungan ahli sesuai kebutuhan."],
    [1, 3, 2, 4]],
  ['PRS-01', 'Persuasi', "Perlu mengajak tim menerapkan sistem kerja baru yang awalnya ditolak sebagian anggota.",
    ["Menjelaskan alasan dan manfaat perubahan dengan jelas kepada tim.", "Menjelaskan alasan dan manfaat dengan data, mendengarkan keberatan, dan melibatkan tim dalam penyesuaian hingga tim mendukung secara sukarela.", "Memerintahkan penerapan dan memberikan konsekuensi bagi yang tidak mengikuti.", "Menyampaikan bahwa perubahan merupakan arahan manajemen yang harus diikuti."],
    [3, 4, 1, 2]],
  ['PRS-02', 'Persuasi', "Membutuhkan dukungan dari fungsi/entitas lain yang tidak memiliki hubungan struktural.",
    ["Meminta atasan menekan fungsi tersebut agar segera membantu.", "Menyampaikan kebutuhan secara jelas disertai alasan dan urgensinya.", "Mengirim permintaan resmi dan menunggu tanggapan.", "Membangun hubungan, memahami kepentingan mereka, dan menawarkan solusi yang saling menguntungkan sehingga tercipta komitmen bersama."],
    [1, 3, 2, 4]],
  ['KON-01', 'Konseptualisasi', "Unit mendapatkan target kerja tahunan yang baru.",
    ["Mengaitkan target dengan strategi perusahaan (RJPP), menjelaskan gambaran besarnya kepada tim, dan menyusun rencana jangka panjang yang terukur.", "Membagi target menjadi tugas harian tanpa menjelaskan tujuan besarnya.", "Menyusun rencana kerja untuk mencapai target dan menjelaskannya kepada tim.", "Menjalankan pekerjaan rutin seperti biasa sambil menunggu arahan lebih lanjut."],
    [4, 2, 3, 1]],
  ['KON-02', 'Konseptualisasi', "Dalam rutinitas pekerjaan ditemukan proses yang berulang dan kurang efisien.",
    ["Mencatat masalah tersebut tetapi tidak menindaklanjutinya.", "Tetap menjalankan proses seperti biasa karena sudah menjadi kebiasaan.", "Menganalisis akar masalah, merancang perbaikan sistemik yang sejalan dengan arah transformasi perusahaan, dan mengusulkannya untuk diterapkan lebih luas.", "Memperbaiki proses tersebut di lingkup pekerjaan sendiri."],
    [2, 1, 4, 3]],
  ['PJD-01', 'Pandangan Jauh ke Depan', "Merencanakan kegiatan yang mirip dengan proyek sebelumnya yang pernah mengalami kendala.",
    ["Menggunakan rencana lama tanpa evaluasi.", "Mempelajari lessons learned, memetakan risiko ke depan, dan menyiapkan rencana mitigasi serta alternatif sejak awal.", "Menyusun rencana seperti biasa dan menangani kendala jika muncul.", "Mengingat kendala sebelumnya dan berhati-hati agar tidak terulang."],
    [1, 4, 2, 3]],
  ['PJD-02', 'Pandangan Jauh ke Depan', "Ada tren perubahan bisnis/teknologi (mis. transisi energi, AI) yang berpotensi memengaruhi pekerjaan unit.",
    ["Mempelajari tren tersebut dan membagikan informasinya kepada tim.", "Menunggu sampai perubahan benar-benar terjadi baru menyesuaikan diri.", "Menganalisis dampaknya, menyiapkan kompetensi dan strategi adaptasi tim lebih awal, serta mengomunikasikannya kepada pemangku kepentingan.", "Mengikuti perkembangan tren sekilas tanpa tindak lanjut."],
    [3, 1, 4, 2]],
  ['STW-01', 'Stewardship', "Menemukan kesalahan pada pekerjaan yang sudah diserahkan dan berpotensi merugikan perusahaan.",
    ["Memperbaiki diam-diam tanpa melaporkan.", "Melaporkan kesalahan tersebut dan memperbaikinya.", "Membiarkannya sambil menunggu ada pihak lain yang menyadari.", "Segera melaporkan secara terbuka, mengambil tanggung jawab penuh, memperbaiki, dan memastikan langkah pencegahan agar tidak terulang."],
    [2, 3, 1, 4]],
  ['STW-02', 'Stewardship', "Dipercaya mengelola anggaran, aset, atau sumber daya perusahaan.",
    ["Mengelola secara transparan, efisien, dan sesuai tata kelola, serta memastikan pemanfaatannya memberi nilai tambah maksimal bagi perusahaan.", "Menggunakan sesuai kebutuhan tanpa pencatatan dan evaluasi yang memadai.", "Mengelola sesuai ketentuan dan melaporkannya tepat waktu.", "Menggunakan untuk keperluan yang kurang terkait dengan tujuan pekerjaan."],
    [4, 2, 3, 1]],
  ['KPP-01', 'Komitmen pada Pengembangan', "Seorang rekan/anggota tim menunjukkan potensi, tetapi belum percaya diri mengambil tanggung jawab lebih besar.",
    ["Memberikan tugas yang biasa saja karena dianggap belum siap.", "Memberikan kesempatan penugasan yang lebih menantang.", "Menyarankannya untuk mengikuti pelatihan.", "Menyusun rencana pengembangan bersama, memberikan penugasan menantang secara bertahap, serta melakukan coaching dan umpan balik rutin."],
    [1, 3, 2, 4]],
  ['KPP-02', 'Komitmen pada Pengembangan', "Seorang rekan kerja meminta pendapat atas hasil pekerjaannya.",
    ["Memberikan umpan balik spesifik disertai contoh, lalu menawarkan pendampingan atau berbagi pengetahuan untuk perbaikannya.", "Memberikan komentar umum seperti \"sudah cukup bagus\".", "Memberikan umpan balik yang jelas mengenai kekuatan dan hal yang perlu diperbaiki.", "Hanya menunjukkan kesalahan tanpa saran perbaikan."],
    [4, 2, 3, 1]],
  ['MBK-01', 'Membangun Komunitas', "Menjalankan proyek lintas fungsi dengan tenggat waktu yang ketat.",
    ["Berkoordinasi rutin dan berbagi informasi yang dibutuhkan pihak lain.", "Menahan informasi agar unit sendiri terlihat lebih unggul.", "Membangun rasa kepemilikan bersama, berbagi informasi dan sumber daya secara terbuka, serta memastikan semua pihak merasa dilibatkan (ONE Pertamina).", "Fokus menyelesaikan bagian sendiri dan berkoordinasi hanya bila diperlukan."],
    [3, 1, 4, 2]],
  ['MBK-02', 'Membangun Komunitas', "Tim berhasil mencapai target penting.",
    ["Menyampaikan apresiasi kepada tim secara umum.", "Mengapresiasi kontribusi setiap anggota secara spesifik, merayakan bersama, dan memperkuat kebersamaan untuk tantangan berikutnya.", "Menonjolkan peran pribadi atas keberhasilan tersebut.", "Langsung beralih ke target berikutnya tanpa apresiasi."],
    [3, 4, 1, 2]],
].map(([code, principle, text, options, scores]) => ({ code, principle, text, options, scores }));
const LETTERS = ['A', 'B', 'C', 'D'];
// Definisi prinsip (Pocket Book Beyond HC), tampil di chip atas soal (Figma Desktop 1722).
const PRINCIPLES = {
  'Mendengarkan': 'Mendengarkan dengan aktif untuk memahami tim secara mendalam.',
  'Empati': 'Memahami dan menerima keunikan setiap individu dalam tim.',
  'Healing': 'Membangun lingkungan kerja yang mendukung proses pemulihan emosional.',
  'Awareness': 'Mengenali kekuatan dan kelemahan diri serta tim.',
  'Persuasi': 'Meyakinkan, bukan memerintah, untuk membangun kepercayaan.',
  'Konseptualisasi': 'Berpikir jangka panjang melampaui rutinitas harian.',
  'Pandangan Jauh ke Depan': 'Memprediksi dampak masa depan dari pengalaman masa lalu.',
  'Stewardship': 'Bertanggung jawab atas amanah dan dampaknya.',
  'Komitmen pada Pengembangan': 'Fokus pada pengembangan personal dan profesional tim.',
  'Membangun Komunitas': 'Menciptakan rasa kebersamaan dan kepercayaan.',
};

// Rumus Form_Penilaian E140/E141: skor prinsip = jumlah skor 2 soalnya; Kekuatan Utama = tertinggi,
// Perlu Pengembangan = terendah; bila seri ambil prinsip yang muncul lebih dulu (seperti MATCH di Excel).
function principleResult(answers) {
  const sum = {};
  QUESTIONS.forEach((q, i) => { sum[q.principle] = (sum[q.principle] || 0) + q.scores[answers[i]]; });
  const pick = (f) => Object.keys(sum).find((n) => sum[n] === f(...Object.values(sum)));
  return { top: pick(Math.max), low: pick(Math.min) };
}
console.assert(principleResult(QUESTIONS.map((q, i) => q.scores.indexOf(i === 2 ? 4 : i === 4 ? 1 : 3))).top === 'Empati'
  && principleResult(QUESTIONS.map((q, i) => q.scores.indexOf(i === 2 ? 4 : i === 4 ? 1 : 3))).low === 'Healing', 'principleResult');
