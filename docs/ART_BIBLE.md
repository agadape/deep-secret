> **Asal dokumen:** jawaban AI lain atas [DESIGN_BRIEF_PROMPT.md](DESIGN_BRIEF_PROMPT.md), disimpan apa adanya di bawah garis.
> **Status:** diadopsi sebagai sumber arahan visual untuk Deep Secret pada 17 November 2026, **dengan koreksi di Addendum ini**.
> Kalau isi dokumen bertentangan dengan Addendum atau dengan [GAME_SPEC.md](../GAME_SPEC.md), yang berlaku adalah Addendum, lalu GAME_SPEC.

## Addendum — koreksi wajib supaya cocok dengan mekanik dan kerahasiaan

| # | Bagian dokumen | Masalah | Keputusan |
|---|---|---|---|
| A1 | §9.3 Beat 2 (banner "SECRET FOUND" ke server) dan storyboard §16 ("Secret found → reveal → pamerkan") | Saat ikan Secret **ditangkap**, tidak ada yang boleh tahu, termasuk server: sisa kuota Secret itu rahasia dan pemegangnya boleh menyimpan diam-diam. Banner saat tangkap akan membocorkan keduanya. | Dua momen terpisah. **(1) Reveal pribadi** saat tangkap: urutan efek §9.3 hanya di layar pemilik, tanpa sinyal apa pun ke server. **(2) Pengumuman server** hanya saat pemilik menekan **Pamerkan** dan event `Flexed` sudah terkonfirmasi di chain. |
| A2 | §6.3 animasi "Hold catch / victory", §8.3 | Status animasi dikirim lewat WebSocket. Pose menang khusus Secret, atau durasi reveal yang lebih panjang, akan memberi tahu pemain lain bahwa itu Secret. | Status animasi yang disiarkan **sama untuk semua hasil** (tarik → angkat siluet → selesai, durasi tetap). Pose dan efek khusus hanya diputar lokal. Avatar boleh berpose spesial di depan umum hanya saat Pamerkan. |
| A3 | §8.2 ukuran siluet boleh bervariasi | Berat ikan rahasia; ukuran siluet akan membocorkannya. | **Satu ukuran siluet** untuk semua tangkapan pemain lain, dan satu ukuran karung "???" untuk Sambar. |
| A4 | §4.4 palet rarity (5 tier + Secret) | Game punya 4 tier + Secret: Biasa, Langka, Epik, Legenda, Secret. | Biasa = netral/aqua lembut, Langka = biru, Epik = ungu, Legenda = gold/oranye, Secret = identitas Void + Cosmic + Energy + Gold. Hijau dipakai untuk status positif saja. |
| A5 | §3.1 resolusi | Spec v0.3 menulis 320×180. | Pakai **480×270** sesuai dokumen ini; spec ikut diperbarui. |
| A6 | §11.2 font (Nunito, Pixelify Sans, Silkscreen) | Halaman memakai COEP `require-corp`; aset lintas origin bisa terblokir. | Font **di-host sendiri** di origin yang sama (lisensi OFL), bukan dari CDN. Berlaku juga untuk audio dan gambar. |
| A7 | §16 storyboard (bukti blockchain hanya 10 detik, Sambar di 1:30) | Dua dari enam kriteria juri adalah desain kerahasiaan dan fairness; Sambar Lite masih bergerbang 30 Nov. | Pakai pembuka 10 detik dari dokumen ini (§16.3), tapi bagian bukti ±30 detik seperti naskah GAME_SPEC §15. Segmen Sambar hanya kalau fiturnya jadi. |
| A8 | Bahasa UI (teks contoh berbahasa Inggris: "Casting...", "SECRET FOUND", "Sleepy Sardine") | Spec memakai nama ikan bahasa Indonesia; juri Zama internasional. | **Keputusan terbuka** (GAME_SPEC §17): usulan default UI bahasa Inggris, nama ikan Indonesia dengan terjemahan kecil di kartu (contoh: "Teri Ngantuk — Sleepy Anchovy"). |
| A9 | §12.4 "Mystery Current" (bayangan besar lewat di air) | Aman selama acak dan kosmetik. | Jadwal kemunculan **tidak boleh** dikaitkan dengan lemparan pemain atau event chain mana pun. |
| A10 | §16.2 "sesi yang sudah disiapkan / seeded demo path" | Tidak boleh ada jalur palsu. | Demo memakai Musim Demo sungguhan (peluang Secret 1/40, dinyatakan terbuka). Tidak ada hasil yang diatur. |

---

# DEEP SECRET

## Visual Direction, Art Bible & Production Design Directives

**Dokumen induk untuk AI coding agent, game designer, developer, dan
asset-generation workflow**

-   **Status:** Working Art Bible / Implementation Brief
-   **Platform:** Browser (desktop + mobile)
-   **Genre:** Casual multiplayer fishing / collection / social mystery
-   **Target server:** Hingga ±30 pemain
-   **Art direction utama:** Chunky stylized pixel art, top-down 2D,
    tropical arcade
-   **Engine target:** Phaser 3 untuk game world; React untuk HUD dan
    menu
-   **Production constraint:** 1 developer, ±4 minggu tersisa; waktu
    khusus art/client ±1,5 minggu
-   **Dokumen ini:** Sumber arahan visual dan presentasi. Jika ada
    konflik, prioritaskan batasan teknis, keamanan data, dan integritas
    hasil blockchain.

------------------------------------------------------------------------

# 0. Cara Menggunakan Dokumen Ini

Dokumen ini sengaja ditulis sebagai **design directive**, bukan sekadar
moodboard. AI agent atau developer yang mengimplementasikannya harus
menerjemahkan setiap arahan menjadi keputusan visual dan teknis yang
konsisten.

## 0.1 Aturan interpretasi

1.  Jangan mengubah game menjadi 3D, isometrik, atau platformer.
2.  Jangan meniru aset, map, karakter, UI, nama, ikon, atau komposisi
    khas game komersial tertentu.
3.  Gunakan referensi game hanya untuk memahami prinsip desain, bukan
    untuk menyalin hasil akhirnya.
4.  Pertahankan mekanik, smart contract, wallet flow, API, dan aturan
    blockchain yang sudah ada kecuali diminta secara eksplisit.
5.  Jangan membuat hasil tangkapan pemain lain terlihat atau dapat
    ditebak. Hasil pemain lain selalu direpresentasikan sebagai siluet
    `???` sampai ada mekanisme publikasi yang sah.
6.  Jangan mengirim private fish metadata ke client pemain lain lalu
    menyembunyikannya dengan CSS. Data yang tidak boleh diketahui pemain
    lain tidak boleh dikirim ke client mereka.
7.  Jangan memalsukan status transaksi, progress konfirmasi, rarity,
    jumlah Secret tersisa, atau keberhasilan aksi.
8.  Hindari menambahkan dependency besar hanya untuk efek kosmetik.
9.  Mobile readability dan performa lebih penting daripada detail
    dekoratif.
10. Bila waktu tidak cukup, kurangi dekorasi dan variasi kosmetik;
    jangan mengorbankan fishing loop, silhouette identity, Secret
    reveal, dan public aquarium.

## 0.2 Urutan prioritas ketika harus mengambil keputusan

**P0 --- wajib benar** - Game loop bisa dimainkan. - Blockchain state
dan UI state tidak saling berbohong. - Pemain dapat memahami cara
melempar kail dan mengambil hasil. - Hasil pemain lain tetap
misterius. - Secret reveal memiliki presentasi yang jelas. - Tidak ada
private metadata yang bocor.

**P1 --- wajib terlihat** - Pulau mudah dibaca. - Avatar dan animasi
dasar jelas. - Siluet `???` mudah dikenali. - Kartu hasil tangkapan
terbaca di desktop dan mobile. - Akuarium publik terlihat sebagai
landmark.

**P2 --- polish** - Ambient fish, bubbles, NPC idle, dekorasi, emote
tambahan. - Variasi kosmetik. - Detail partikel dan secondary animation.

**P3 --- nice-to-have** - Efek cuaca, variasi langit, kapal lewat,
dekorasi musiman, animasi kosmetik tambahan.

------------------------------------------------------------------------

# 1. Product & Experience Definition

## 1.1 Elevator pitch

**Deep Secret adalah game mancing multiplayer santai tentang mengejar
tangkapan yang tidak bisa dilihat orang lain.** Pemain berbagi pulau,
memancing bersama, mengumpulkan ikan, meningkatkan joran, dan sesekali
menyaksikan seseorang memperoleh ikan Secret yang sangat langka. Hasil
tangkapan pemain lain selalu menjadi siluet misterius `???`, kecuali
ketika pemilik secara sadar memamerkan Secret ke seluruh server.

## 1.2 Fantasi pemain

Pemain harus merasakan:

-   **Curiosity:** "Dia dapat apa?"
-   **Anticipation:** "Kail gue sudah dapat sesuatu belum?"
-   **Reward:** "Akhirnya dapat ikan bagus."
-   **Progression:** "Joran gue makin kuat; zona baru terbuka."
-   **Social presence:** "Ada pemain lain di pulau yang sama."
-   **FOMO / prestige:** "Seseorang baru saja mendapatkan Secret."
-   **Ownership:** "Ikan ini milik gue; gue bisa simpan atau pamerkan."

## 1.3 Pilar desain

### Pillar A --- Mystery is the identity

Ketidaktahuan harus terlihat dan terasa. Jangan membocorkan jenis,
berat, aura, atau rarity hasil tangkapan pemain lain.

### Pillar B --- Friendly tropical world

Dunia harus terasa aman, cerah, santai, dan menyenangkan. Misteri datang
dari laut dan sistem Secret, bukan dari membuat seluruh game gelap atau
horor.

### Pillar C --- Absurd fish, readable silhouettes

Ikan boleh absurd dan lucu, tetapi bentuknya harus mudah dibedakan saat
kecil. Humor tidak boleh mengorbankan keterbacaan.

### Pillar D --- Reward moments matter

Momen memperoleh ikan, melihat rarity, dan terutama memamerkan Secret
harus punya presentasi yang terasa bernilai.

### Pillar E --- Multiplayer without visual noise

Pulau boleh ramai, tetapi pemain harus tetap bisa menemukan avatar
sendiri, tepi air, tombol aksi, dan landmark penting.

------------------------------------------------------------------------

# 2. Final Art Direction

## 2.1 Keputusan utama

Gunakan **2D top-down stylized pixel art dengan chunky pixel clusters
dan modern arcade UI**.

Formula visual:

> **Tropical pixel world + expressive absurd fish + absolute black
> mystery silhouettes + spectacular rarity presentation + clean modern
> HUD.**

Jangan membuat game tampak seperti RPG pixel retro generik. Jangan pula
membuatnya seperti UI Web3 dashboard yang kebetulan memiliki karakter
pixel.

Dunia game harus terasa seperti game browser yang punya karakter visual
sendiri.

## 2.2 Mengapa bukan 3D / isometric

Dengan satu developer dan waktu art/client sekitar 1,5 minggu, 3D atau
isometrik menambah risiko pada: - pembuatan dan konsistensi model; -
rigging dan animasi; - lighting dan material; - kamera dan depth
sorting; - optimasi mobile; - collision dan navigasi; - integrasi dengan
HUD dan sistem multiplayer.

Biaya tersebut tidak meningkatkan keunikan inti game sebanyak investasi
pada silhouette, reveal, dan aquarium.

## 2.3 Batas gaya

**DO** - Bentuk chunky dan mudah dibaca. - Outline konsisten. - Warna
cerah tetapi terkontrol. - Bentuk ikan lucu, sedikit aneh, dan punya
karakter. - Dunia tropis dengan landmark yang jelas. - UI modern yang
mudah dibaca.

**DON'T** - Pixel noise berlebihan. - Dithering di semua permukaan. -
Gradien halus yang bertentangan dengan pixel world. - Neon di seluruh
map. - Outline dengan ketebalan berbeda-beda tanpa alasan. - Sprite AI
yang tampak seperti gambar biasa diberi filter pixel. - UI pixel font
untuk semua teks. - Terlalu banyak dekorasi kecil yang membuat map
ramai.

## 2.4 Perspektif dan kamera

-   Perspektif: top-down 2D.
-   Hindari perspektif isometrik.
-   Karakter dilihat dari atas dengan sedikit tampilan wajah/badan
    sesuai kebutuhan readability.
-   Kamera mengikuti pemain lokal dengan smoothing ringan.
-   Kamera tidak boleh bergerak liar saat pemain berjalan.
-   Zona interaksi dan tepi air harus mudah dikenali.
-   Pastikan avatar tidak tertutup bangunan atau UI.
-   Untuk mobile, pertahankan framing yang menunjukkan karakter, tepi
    air, dan area interaksi.

------------------------------------------------------------------------

# 3. Visual System & Technical Art Specs

## 3.1 Logical resolution

Rekomendasi awal: - Logical resolution target: **480 × 270**. -
Alternatif bila pipeline pixel-perfect lebih cocok: **384 × 216**. -
Jangan mengunci 320 × 180 jika hasilnya membuat UI, 30 pemain, dan
landmark terlalu sesak. - Render harus mempertahankan rasio aspek dan
tidak meregangkan sprite. - Gunakan nearest-neighbor scaling untuk pixel
art. - HUD React tetap menggunakan CSS pixel independen dari logical
game resolution.

Jangan menganggap 480 × 270 sebagai ukuran semua asset. Itu adalah
referensi area render, bukan ukuran sprite.

## 3.2 Ukuran sprite awal

  ------------------------------------------------------------------------
  Asset                                  Ukuran awal Catatan
  --------------------- ---------------------------- ---------------------
  Avatar                            24--32 px tinggi Siluet harus jelas
                                                     saat ramai

  Ikan umum                                32--48 px Ukuran bergantung
                                                     bentuk

  Ikan besar /                             48--64 px Beri ruang untuk aura
  Legendary                                          

  Ikan Secret                 64--96 px untuk reveal Boleh ditampilkan
                                                     lebih besar pada
                                                     overlay

  Pelampung                                 8--12 px Harus terlihat di air

  NPC                                      24--40 px Jangan lebih dominan
                                                     dari pemain

  Dekorasi kecil                            8--24 px Gunakan hemat

  Pohon / objek besar                      48--96 px Landmark dan framing

  Bangunan                                64--160 px Bergantung fungsi dan
                                                     footprint
  ------------------------------------------------------------------------

Ukuran ini adalah target awal. Sesuaikan setelah prototype terlihat pada
layar desktop dan HP sungguhan.

## 3.3 Pixel density dan outline

-   Gunakan satu pixel density yang konsisten.
-   Outline karakter dan ikan umumnya 1--2 logical pixels.
-   Jangan mencampur sprite 16 px yang sangat detail dengan sprite 64 px
    yang blur.
-   Jangan upscale gambar raster dengan smoothing.
-   Hindari garis outline yang terlalu hitam dan berat pada semua objek;
    gunakan warna gelap dari palet masing-masing.
-   Siluet `???` adalah pengecualian: gunakan hitam/near-black yang
    sangat gelap dan konsisten.

## 3.4 Palette discipline

Target: - 16--24 warna inti untuk keseluruhan world palette. - Setiap
ikan boleh memiliki palet aksen sendiri, tetapi harus mengikuti aturan
outline dan shading. - Batasi shading dasar menjadi 1--2 tingkat. -
Simpan warna paling terang untuk highlight, rarity, aura, dan action
feedback.

Jangan membuat setiap ikan memiliki warna neon yang sama kuat. Jika
semuanya mencolok, tidak ada yang terasa langka.

------------------------------------------------------------------------

# 4. Color Art Direction

## 4.1 Base palette

  Nama       Hex         Penggunaan
  ---------- ----------- ----------------------------------
  Deep Sea   `#163B42`   Air dalam, bayangan laut
  Ocean      `#277C78`   Air utama
  Aqua       `#65C9B5`   Highlight air, elemen interaktif
  Sand       `#F2D38D`   Pantai
  Coral      `#F18D5B`   CTA, aksen, penanda penting
  Foam       `#F4EFD9`   Busa, teks terang
  Ink        `#26343B`   Outline dan teks gelap
  Lime       `#B5D96B`   Progress, aksen positif

## 4.2 Penggunaan warna

-   **Ocean / Aqua:** lingkungan dan feedback ringan.
-   **Coral:** tombol utama seperti LEMPAR, aksi yang perlu perhatian.
-   **Sand:** pantai dan permukaan hangat.
-   **Lime:** status positif, keberhasilan, progress yang benar-benar
    terukur.
-   **Gold:** rarity tinggi dan Secret prestige.
-   **Purple / cosmic:** Legendary atau aura tertentu.
-   **Near-black:** mystery silhouette.

Jangan menggunakan gold pada setiap elemen UI. Gold harus tetap memiliki
nilai simbolis.

## 4.3 Secret palette

  Nama     Hex         Fungsi
  -------- ----------- -------------------------
  Void     `#0C0A16`   Latar reveal
  Cosmic   `#A77BFF`   Energi misterius
  Energy   `#48F0DB`   Cahaya inti
  Gold     `#F8D77B`   Prestige / announcement

Secret palette boleh tampil jauh lebih kontras daripada world palette,
tetapi gunakan hanya pada reveal dan display khusus.

## 4.4 Rarity palette

Tentukan warna rarity yang konsisten dan dokumentasikan: - Common:
netral / aqua lembut. - Uncommon: hijau. - Rare: biru. - Epic: ungu. -
Legendary: gold/orange. - Secret: bukan sekadar warna rarity; gunakan
identitas Void + Cosmic + Energy + Gold.

Jangan mengubah warna rarity per layar. Warna yang sama harus berarti
hal yang sama di kartu ikan, inventory, shop, dan announcement.

------------------------------------------------------------------------

# 5. World Design: Pulau Deep Secret

## 5.1 Tujuan layout

Pulau harus: - dapat dipahami dalam 5--10 detik; - memiliki jalur yang
mudah dibaca; - menempatkan landmark penting dalam jangkauan visual; -
menyediakan beberapa spot memancing; - menghindari bottleneck untuk 30
pemain; - tetap terbaca pada layar HP.

Jangan membuat map besar hanya agar terasa luas. Map kecil yang hidup
lebih baik daripada map luas yang kosong.

## 5.2 Struktur zona

Zona progression: 1. **Dermaga** --- zona awal, aman, mudah ditemukan.
2. **Karang** --- zona kedua, visual air lebih kaya dan warna lebih
berani. 3. **Palung** --- zona terdalam, atmosfer lebih misterius dan
gelap, tetapi tetap readable.

Zona boleh terhubung melalui pantai, dermaga, jembatan, atau jalur yang
jelas. Jangan membuat pemain tersesat mencari spot.

## 5.3 Landmark dan bangunan

### Pasar Ikan

Fungsi visual: - tempat menjual ikan; - harus terlihat ramah dan
ramai; - gunakan papan harga, keranjang, peti, dan dekorasi hasil
laut; - signage harus terbaca.

### Toko Joran

Fungsi visual: - tempat upgrade; - tampilkan beberapa joran sebagai
display; - gunakan siluet joran besar sebagai identitas bangunan; -
jangan membuat toko terlalu mirip pasar.

### Akuarium Publik

Fungsi visual: - landmark paling penting; - harus menjadi salah satu
objek terbesar dan paling mudah dikenali; - kaca tangki berwarna
aqua/cyan; - ikan Secret menjadi pusat perhatian; - nama pemilik dan
nomor seri dapat dibaca dari dekat; - jangan mengisi tangki dengan
terlalu banyak dekorasi yang menutupi ikan.

### Papan Verifikasi

Fungsi visual: - menjelaskan aspek verifikasi/on-chain; - tampilkan
status yang ringkas dan manusiawi; - hindari tampilan terminal atau
dashboard developer; - jangan menjanjikan verifikasi yang belum
benar-benar selesai.

## 5.4 Environment props minimum

Prioritas: - pasir dan variasinya; - air dangkal dan air dalam; - tepi
pantai; - dermaga kayu; - batu; - rumput dan semak; - pohon kelapa; -
peti/barrel; - pelampung atau buoy; - papan penunjuk arah; - lampu atau
tiang; - dekorasi pasar; - dekorasi toko; - aquarium.

Buat beberapa variasi dari aset dasar dengan rotasi, flip, dan perubahan
warna yang aman. Jangan membuat puluhan objek unik.

## 5.5 Water design

Air adalah permukaan terbesar dan paling sering terlihat. Air harus
hidup, tetapi jangan menghabiskan banyak draw calls atau partikel.

Gunakan: - 2--3 frame tile animation atau shader ringan bila sudah
tersedia; - highlight ombak sederhana; - bubble kecil yang muncul
sesekali; - bayangan ikan ambient yang tidak mengungkap hasil
tangkapan; - pelampung yang bergoyang; - ripple ketika kail masuk air.

Hindari: - simulasi air realistis; - shader berat; - partikel
terus-menerus di seluruh laut; - efek transparansi bertumpuk yang mahal
di HP.

------------------------------------------------------------------------

# 6. Character Design

## 6.1 Avatar direction

Avatar harus: - kecil, chibi, dan mudah dibedakan; - memiliki kepala
sedikit lebih besar dari badan; - memiliki bentuk tubuh sederhana; -
punya outfit tropis / fishing-adventure; - memiliki warna dasar yang
bisa divariasikan; - tidak memiliki detail wajah berlebihan.

Jangan membuat avatar terlalu mirip karakter game lain. Hindari kostum
atau siluet ikonik milik IP tertentu.

## 6.2 Sistem variasi murah

Gunakan satu base body dan variasi: - warna baju; - warna topi; - warna
celana; - satu atau dua aksesori sederhana.

Jangan membuat setiap pemain membutuhkan sprite sheet unik.

## 6.3 Animasi minimum

1.  Idle.
2.  Walk.
3.  Cast.
4.  Fishing / seated.
5.  Pull / reel.
6.  Hold catch / victory.
7.  Emote sederhana.

Jika waktu terbatas, gunakan frame sedikit dan timing yang enak. Jangan
mengejar animasi 8 arah penuh jika hanya 4 arah sudah cukup untuk
prototype.

## 6.4 Readability multiplayer

Untuk server hingga ±30 pemain: - avatar lokal harus paling mudah
dikenali; - gunakan outline atau marker lokal yang tidak berlebihan; -
jangan membuat nama pemain menumpuk terus-menerus; - tampilkan nama saat
dekat, hover, atau selection; - batasi emote dan efek layar yang bisa
menutupi area; - gunakan culling untuk objek di luar kamera; - jangan
menjalankan animasi mahal untuk pemain yang jauh.

------------------------------------------------------------------------

# 7. Fish Design System

## 7.1 Prinsip desain ikan

Setiap ikan harus punya: - siluet yang unik; - satu gagasan humor atau
karakter; - palet terbatas; - ekspresi yang terbaca; - satu detail
pengenal; - ukuran sprite yang konsisten; - tampilan side-view untuk
kartu/reveal jika itu paling jelas.

Nama harus singkat, mudah dibaca, dan terasa lucu dalam bahasa
Indonesia.

Contoh arah nama: - Teri Ngantuk - Lele Galau - Hiu Kalkulator - Paus
Disko - Sandal Jepit

Hindari nama yang terlalu panjang sehingga kartu ikan menjadi sulit
dibaca.

## 7.2 19 jenis ikan

Konten yang direncanakan: - 16 ikan reguler: 4 tier × 4 jenis. - 2 ikan
Secret. - 1 Sandal Jepit sebagai sampah lucu.

Jangan mendesain 19 ikan dengan tingkat detail yang sama. Prioritaskan
4--6 ikan untuk demo awal, lalu lengkapi sisanya dengan template yang
sama.

## 7.3 Template visual ikan

Setiap ikan harus mengikuti template: - tampilan side view; - menghadap
ke arah yang konsisten; - transparent background; - outline konsisten; -
1--2 tingkat shading; - ekspresi atau detail unik; - tidak ada teks di
dalam sprite; - tidak ada background yang ikut terbawa; - tidak ada drop
shadow baked-in kecuali memang menjadi bagian style.

## 7.4 Sandal Jepit

Sandal Jepit adalah comic relief. Buat bentuknya langsung terbaca
sebagai sandal, bukan ikan yang kebetulan aneh. - warna sederhana; -
bentuk sol dan strap jelas; - animasi bisa sedikit mengambang; - kartu
hasil harus menyebutnya sebagai sampah / junk sesuai sistem game; -
jangan memberi efek Secret atau aura prestige.

## 7.5 Aura

Empat aura: - Neon - Galaksi - Api - Hantu

Aura harus berupa layer terpisah dari sprite ikan. Jangan bake aura ke
semua sprite ikan karena akan memperbanyak aset dan menyulitkan
kombinasi.

Aturan: - aura tidak boleh menutupi bentuk ikan; - intensitas aura
mengikuti rarity dan konteks; - efek harus tetap ringan; - jangan
gunakan terlalu banyak particle emitter; - pastikan kontras teks dan
kartu tetap terbaca.

------------------------------------------------------------------------

# 8. The Unknown Catch --- Core Identity System

## 8.1 Prinsip mutlak

**Hasil tangkapan pemain lain selalu tampil sebagai siluet hitam
`???`.**

Ini bukan opsi kosmetik. Ini aturan identitas game.

Jangan pernah: - memperlihatkan warna ikan asli; - memperlihatkan aura
asli; - memperlihatkan ukuran yang terlalu akurat jika itu membocorkan
atribut; - menampilkan rarity; - menampilkan nama ikan; - menampilkan
berat; - membocorkan isi ember pemain lain.

## 8.2 Bentuk visual

Gunakan: - fill near-black yang hampir solid; - tidak ada mata, sisik,
atau tekstur internal; - outline boleh sedikit lebih gelap atau sedikit
lebih terang, tetapi jangan menambahkan detail yang mengungkap
spesies; - tanda `???` di atas atau di dekat objek; - animasi float
ringan; - sedikit distortion / shadow ripple jika performa memungkinkan.

Bentuk siluet boleh berbeda untuk memberi kesan ikan kecil, sedang, atau
besar hanya jika perbedaan tersebut tidak mengungkap informasi yang
seharusnya rahasia. Jika ukuran juga rahasia, gunakan ukuran visual yang
dinormalisasi.

## 8.3 Penggunaan dalam situasi berbeda

### Pemain lain sedang memancing

-   tampilkan avatar dalam fishing pose;
-   pelampung bergerak;
-   bila ada hasil yang dibawa, tampilkan silhouette `???`;
-   jangan tampilkan ikan sebenarnya.

### Pemain lain mengangkat ikan

-   objek yang diangkat adalah silhouette;
-   label `???`;
-   animasi tetap ekspresif;
-   jangan tampilkan atribut.

### Sambar Ember

-   ember pemain lain tidak memperlihatkan isi;
-   pemain penyambar membawa karung dengan tulisan `???`;
-   hasil hanya diketahui oleh pihak yang berhak menurut aturan game;
-   jangan membuat penonton dapat menebak hasil dari warna, bentuk, atau
    efek.

### HUD

-   `Secret tersisa: ???`
-   jangan tampilkan jumlah aktual jika jumlah tersebut memang harus
    dirahasiakan;
-   bila sistem membutuhkan angka untuk operasional internal, jangan
    render angka itu ke UI publik.

## 8.4 Prinsip teknis privasi

Data yang boleh dikirim ke pemain lain hanya: - player identifier
publik; - posisi; - arah / animation state; - emote; - status fishing
yang aman dipublikasikan; - representasi unknown catch; - informasi
publik lain yang memang disetujui desain.

Data yang tidak boleh dikirim: - fish type; - weight; - aura; -
rarity; - Secret attributes; - bucket contents; - private result
metadata.

Jangan mengandalkan CSS untuk menyembunyikan data. Jangan mengirim data
rahasia ke browser lalu berharap pengguna tidak memeriksa DevTools atau
network traffic.

------------------------------------------------------------------------

# 9. Secret Reveal --- Hero Moment

## 9.1 Tujuan

Secret reveal adalah momen paling penting dalam video demo. Ia harus
terasa seperti event server, bukan notifikasi inventory biasa.

Pemain harus langsung mengerti: - sesuatu yang sangat langka terjadi; -
siapa pemiliknya; - ikan tersebut benar-benar berbeda; - pemilik memilih
memamerkannya; - ikan sekarang berada di akuarium publik.

## 9.2 Visual hierarchy

Urutan perhatian: 1. Announcement. 2. Siluet / ikan Secret. 3. Nama
ikan. 4. Pemilik. 5. Status publikasi / nomor seri. 6. Detail tambahan.

Jangan menampilkan semua informasi sekaligus dalam ukuran sama.

## 9.3 Sequence yang direkomendasikan

### Beat 1 --- Silence (±0,5 detik)

-   hentikan atau turunkan ambient sound secara singkat;
-   jangan freeze seluruh game terlalu lama;
-   beri jeda untuk membangun antisipasi.

### Beat 2 --- Server announcement (±1 detik)

Banner besar: `!!! SECRET FOUND !!!` Subtext:
`SOMEONE FOUND THE IMPOSSIBLE.`

Banner harus terbaca dalam satu pandangan. Jangan menutupi seluruh layar
selama terlalu lama.

### Beat 3 --- Reveal (±1,5--2 detik)

-   silhouette pecah menjadi partikel;
-   ikan muncul di tengah;
-   scale-up ringan;
-   aura menyala;
-   gunakan satu impact visual dan satu sound cue;
-   jangan menumpuk screen shake, flash putih, blur, dan partikel
    sekaligus.

### Beat 4 --- Public display (±2 detik)

-   kamera / transisi memperlihatkan aquarium;
-   ikan masuk ke dalam tangki;
-   ikan mulai berenang;
-   nama pemilik dan nomor seri tampil;
-   beri ruang agar pemain membaca informasi.

### Beat 5 --- Social reaction (±1 detik)

-   pemain lain bisa emote;
-   banner tidak terus-menerus menutupi game;
-   event selesai dan kontrol kembali normal.

Target total: sekitar 6--7 detik. Durasi dapat disesuaikan dengan
performa dan kebutuhan transaksi, tetapi jangan memalsukan timing atau
status.

## 9.4 Efek visual

Gunakan secara terkontrol: - dark vignette atau dimming; - ring / radial
pulse; - sparkle terbatas; - particle burst; - aura layer; - scale and
settle; - small camera shake pada impact; - UI banner slide-in.

Jangan gunakan: - flash putih yang menyakitkan; - screen shake
berkepanjangan; - partikel ribuan; - glow yang menutupi ikan; - animasi
panjang yang membuat pemain kehilangan kontrol.

## 9.5 Sound design

Minimum sound set: - ambient sea loop; - cast sound; - bobber splash; -
subtle tension cue; - catch reveal; - rarity hit; - Secret announcement
impact; - Secret reveal shimmer; - aquarium placement cue; - UI click /
sell / upgrade.

Secret sound harus punya identitas tersendiri. Gunakan: 1. ambient duck
/ silence; 2. low impact; 3. short resonant tone; 4. shimmer /
choir-like accent.

Tidak perlu musik orkestral panjang. Sound cue pendek dan konsisten
lebih mudah diproduksi dan lebih mudah diingat.

## 9.6 Accessibility dan user control

-   sediakan volume control;
-   jangan mengandalkan warna saja untuk membedakan rarity;
-   jangan membuat efek flash berulang;
-   beri opsi mengurangi screen shake / motion bila memungkinkan;
-   event penting harus tetap dapat dipahami tanpa audio.

------------------------------------------------------------------------

# 10. Aquarium Public Display

## 10.1 Fungsi emosional

Akuarium adalah bukti sosial dan landmark. Ia harus membuat pemain ingin
melihat apa yang dipamerkan orang lain.

## 10.2 Visual rules

-   tangki besar, bentuk sederhana;
-   kaca aqua/cyan;
-   ikan menjadi pusat komposisi;
-   nama pemilik dan serial number terbaca;
-   latar tidak terlalu ramai;
-   ikan berenang dengan gerakan halus;
-   gunakan satu atau dua dekorasi interior, bukan banyak objek.

## 10.3 Public display card

Informasi: - nama ikan; - pemilik; - nomor seri; - status publikasi; -
atribut yang memang boleh dipublikasikan.

Jangan tampilkan private metadata yang tidak seharusnya menjadi publik.

## 10.4 Aquarium composition

Pada layar utama: - aquarium menjadi landmark yang terlihat dari area
pusat pulau; - signage harus jelas; - pemain bisa mendekat untuk melihat
detail; - ikan tidak boleh terlalu kecil; - jangan membuat tangki
terlalu transparan sampai ikan bercampur dengan background.

------------------------------------------------------------------------

# 11. UI / HUD Design Directives

## 11.1 Prinsip UI

UI harus terasa seperti arcade game modern, bukan dashboard crypto.

-   jelas;
-   kontras tinggi;
-   sedikit teks;
-   tombol besar;
-   label konsisten;
-   hierarchy yang kuat;
-   mobile-first untuk kontrol sentuh.

## 11.2 Typography

Rekomendasi: - **Nunito:** body, label, tombol, informasi. - **Pixelify
Sans:** heading, judul, display text. - **Silkscreen:** label kecil /
serial number secara terbatas.

Aturan: - jangan gunakan font pixel untuk paragraf; - hindari font
tipis; - gunakan ukuran teks yang nyaman di HP; - jangan membuat label
penting dalam uppercase kecil; - angka saldo dan berat harus mudah
dibaca.

## 11.3 HUD hierarchy

### Top-left

-   player identity;
-   wallet / balance bila relevan;
-   status koneksi hanya jika diperlukan.

### Top-center

-   `Secret tersisa: ???`;
-   status event penting.

### Top-right

-   jumlah pemain online;
-   menu / settings.

### Bottom-center

-   tombol utama `LEMPAR`;
-   status aksi;
-   jumlah kail bila relevan.

### Bottom navigation

-   Inventory;
-   Pasar;
-   Toko;
-   Map / zone;
-   Settings bila diperlukan.

Jangan menampilkan semua panel sekaligus di layar kecil. Gunakan modal
atau drawer untuk panel sekunder.

## 11.4 CTA

Tombol `LEMPAR` harus menjadi tombol paling jelas ketika pemain berada
di spot mancing yang valid.

-   warna Coral;
-   ukuran sentuh minimal sekitar 48 CSS px;
-   label singkat;
-   state disabled harus jelas;
-   state pending harus berbeda dari state ready;
-   jangan membuat tombol terlihat aktif ketika transaksi belum bisa
    dimulai.

## 11.5 Fish result card

Urutan informasi: 1. fish art; 2. nama; 3. rarity; 4. berat; 5. aura; 6.
aksi: simpan / jual / lanjut, sesuai aturan game.

Jangan membuat kartu terlalu padat. Gunakan ikon + label pendek.

## 11.6 Mobile layout

-   target sentuh minimal ±48 CSS px;
-   hindari kontrol yang terlalu dekat satu sama lain;
-   pastikan tombol utama tidak tertutup jempol;
-   jangan memaksa hover;
-   inventory bisa berupa bottom sheet;
-   kartu hasil harus tetap terbaca pada lebar layar kecil;
-   jangan mengandalkan tooltip untuk informasi penting.

------------------------------------------------------------------------

# 12. Blockchain Waiting Time as Game Presentation

## 12.1 Masalah

Konfirmasi blockchain memerlukan sekitar 12--25 detik dan membuka hasil
memerlukan sekitar 4--7 detik. Ini lebih lama daripada feedback instan
yang biasanya diharapkan dari game casual.

Jangan menyamarkan waktu dengan progress palsu. Desainlah waiting state
sebagai bagian dari aktivitas.

## 12.2 Waiting state

Gunakan copy yang tematik: - `Casting...` - `Waiting for the tide...` -
`Your hooks are beneath the surface...` - `Confirming your catch...` -
`Your catch is ready!`

Status harus sesuai dengan status sistem yang sebenarnya.

## 12.3 Aktivitas ambient selama pending

-   bobber bobbing;
-   ripple;
-   bubbles;
-   ikan ambient melintas;
-   bayangan misterius lewat di bawah air;
-   pemain lain berjalan / emote;
-   NPC idle;
-   kapal lewat sesekali bila mudah dibuat.

Semua ini bersifat kosmetik. Jangan memberi kesan bahwa pemain dapat
memengaruhi hasil blockchain melalui aksi ambient.

## 12.4 Mystery Current

Ide visual tambahan: - sesekali bayangan besar melintas di bawah air; -
bentuknya tetap misterius; - tidak mengindikasikan hasil pemain; - tidak
menjanjikan bahwa Secret sedang mendekat; - hanya menjadi ambient event.

## 12.5 Progress UI

-   Jangan tampilkan progress bar yang mengklaim persentase konfirmasi
    jika tidak ada data akurat.
-   Gunakan status teks dan animasi looping.
-   Jika sistem memiliki transaction stage yang nyata, tampilkan stage
    tersebut secara jujur.
-   Bedakan pending, confirmed, failed, dan retry.
-   Jangan mengunci seluruh game jika aktivitas lain dapat dilakukan
    dengan aman.
-   Jangan mengizinkan aksi duplikat yang berpotensi membuat transaksi
    ganda.

## 12.6 Reveal phase

Setelah hasil benar-benar tersedia: - tampilkan hasil satu per satu; -
gunakan delay pendek dan konsisten; - berikan animasi flip / pop; -
jangan menambahkan waktu tunggu yang tidak perlu; - jika hasil sudah
tersedia tetapi animasi berlangsung, beri cara skip atau percepat jika
sesuai desain.

**Prinsip:** animasi boleh memperindah hasil, tetapi tidak boleh
menyembunyikan error atau menunda akses pemain secara tidak perlu.

------------------------------------------------------------------------

# 13. Engine, Runtime & Implementation Boundaries

## 13.1 Recommended stack

  Area                         Rekomendasi
  ---------------------------- ------------------------------------------
  Game world                   Phaser 3
  UI / HUD                     React
  Rendering                    Phaser Canvas / WebGL
  Multiplayer cosmetic state   Existing WebSocket
  Blockchain state             Existing smart contracts and integration
  Audio                        Web Audio API atau Howler.js
  Map authoring                Tiled atau data map sederhana
  Sprite authoring             Aseprite / LibreSprite

## 13.2 Responsibility split

**Phaser** - map; - camera; - player sprites; - remote avatars; -
fishing animations; - bobbers; - fish reveal animation; - environmental
animation; - particles; - world interactions.

**React** - HUD; - inventory; - shop; - market; - fish result card; -
wallet connection UI; - transaction status; - aquarium detail panel; -
settings.

**Existing blockchain layer** - authoritative values; - transaction
submission; - confirmation; - fish ownership; - rarity / attributes; -
Secret rules; - public reveal state.

**WebSocket** - position; - facing; - animation state; - emote; -
cosmetic presence; - safe public fishing state.

## 13.3 Do not do

-   Jangan render setiap avatar sebagai React component yang terus
    re-render.
-   Jangan mengirim semua fish attributes lewat WebSocket.
-   Jangan membuat client menentukan hasil blockchain.
-   Jangan membuat animasi lokal mengubah nilai game.
-   Jangan membuat server kosmetik menjadi sumber kebenaran ownership.
-   Jangan menambahkan physics engine kompleks bila collision sederhana
    cukup.
-   Jangan menambahkan framework 3D.

## 13.4 Performance budget principles

-   Gunakan sprite atlas.
-   Gabungkan texture yang kompatibel.
-   Hindari asset besar yang tidak dibutuhkan.
-   Gunakan object pooling untuk particle dan objek yang sering dibuat.
-   Batasi jumlah particle aktif.
-   Culling objek di luar viewport.
-   Kurangi update remote player yang jauh.
-   Gunakan animation frame rate yang cukup, bukan berlebihan.
-   Kompres audio.
-   Lazy-load asset zona yang belum dibuka bila arsitektur memungkinkan.
-   Uji pada HP kelas menengah, bukan hanya desktop developer.

Target performa harus divalidasi pada perangkat nyata. Jangan
menjanjikan angka FPS tanpa pengujian.

------------------------------------------------------------------------

# 14. Asset Production Pipeline

## 14.1 Pembagian sumber aset

### Manual

Wajib dibuat atau dikontrol manual: - logo; - silhouette `???`; - Secret
fish final; - Secret reveal composition; - UI components; - fish
cards; - aquarium composition; - rarity iconography; - final palette
cleanup.

Alasan: aset ini membentuk identitas dan harus konsisten.

### AI-generated concepts

Boleh dibantu AI: - konsep ikan biasa; - variasi ikan; - konsep
avatar; - variasi aksesori; - ide dekorasi.

AI output harus dibersihkan. Jangan menganggap hasil AI otomatis siap
menjadi spritesheet.

### CC0 / licensed assets

Gunakan untuk: - batu; - tanaman; - pohon; - peti; - barrel; -
dekorasi; - tile dasar; - props lingkungan.

Periksa lisensi setiap paket. Jangan menganggap semua aset di
marketplace gratis berarti CC0.

## 14.2 Asset pipeline

1.  Buat style guide satu halaman.
2.  Buat 1 avatar final.
3.  Buat 1 ikan biasa final.
4.  Buat 1 Secret final.
5.  Uji ketiganya dalam game scene.
6.  Kunci outline, palette, pixel density, dan skala.
7.  Baru produksi variasi ikan dan dekorasi.
8.  Bersihkan semua asset AI.
9.  Export spritesheet / atlas.
10. Uji scaling pada desktop dan HP.
11. Simpan source file dan export secara terpisah.

Jangan membuat 19 ikan sebelum satu ikan benar-benar terbukti cocok di
game.

## 14.3 Prompt AI --- ikan biasa: Teri Ngantuk

``` text
Create an original pixel art game sprite of a tiny
sleepy sardine fish named "Sleepy Sardine".

Style: colorful 16-bit pixel art, chunky pixels,
humorous character design.

The fish has half-closed sleepy eyes, a tiny
exhausted expression, and a slightly drooping tail.

Orthographic side view, facing right.
Compact silhouette, readable at 48x48 pixels.

Limited color palette, clean pixel clusters,
consistent dark outline.

Transparent background. Single character only.
No text, no shadows, no scenery, no watermark.
```

## 14.4 Prompt AI --- ikan Secret: The Forgotten One

``` text
Create an original legendary secret fish for a
pixel art multiplayer fishing game.

Name: The Forgotten One.

A mysterious ancient deep-sea creature with a
celestial body, floating golden fragments,
glowing cyan fins, and subtle cosmic patterns.

Its silhouette must be immediately recognizable.
It should feel extremely rare and otherworldly,
but still cute and compatible with a humorous game.

16-bit pixel art, chunky pixel clusters,
strong readable outline, limited color palette.

Side view, facing right, designed for a 64x64 sprite.
Transparent background.

No text, no scenery, no watermark.
```

## 14.5 Prompt AI --- avatar

``` text
Create an original small chibi player character
for a colorful top-down pixel art fishing game.

Oversized round head, tiny body, simple facial
features, short legs, wearing a casual tropical
fishing outfit and a small fishing hat.

16-bit pixel art, consistent dark outline,
chunky readable pixels, limited palette.

Front-facing orthographic view.
Character centered, transparent background.

Designed to work at 32x32 pixels.
No text, no scenery, no watermark.
```

## 14.6 Quality checklist untuk AI output

Sebelum masuk game: - \[ \] Background benar-benar transparan. - \[ \]
Tidak ada watermark atau teks acak. - \[ \] Pixel grid konsisten. - \[
\] Tidak ada blur / anti-aliasing yang tidak diinginkan. - \[ \] Outline
konsisten. - \[ \] Bentuk terbaca pada ukuran target. - \[ \] Tidak ada
bagian sprite yang terpotong. - \[ \] Arah hadap konsisten. - \[ \]
Warna sesuai palette. - \[ \] Tidak meniru karakter atau desain berhak
cipta.

## 14.7 Tools

-   Aseprite: sprite editing dan animation.
-   LibreSprite: alternatif gratis.
-   Tiled: map authoring.
-   Krita: concept cleanup.
-   TexturePacker atau workflow atlas bawaan: sprite packing.
-   Kenney: asset CC0 / free asset packs, tetap periksa lisensi paket.
-   OpenGameArt: sumber tambahan, periksa lisensi per asset.
-   itch.io: filter CC0, periksa lisensi setiap asset.

------------------------------------------------------------------------

# 15. Minimum Asset List & Production Priority

## 15.1 Demo-first asset list

    Prioritas Aset                     Minimum demo
  ----------- ------------------------ -------------------------------------------
            1 Secret reveal sequence   1 sequence lengkap
            2 Player avatar            1 base + 4--6 warna
            3 Island environment       1 area yang terasa selesai
            4 Fishing animation        cast, idle, pull
            5 Unknown silhouette       3 ukuran atau variasi aman
            6 Fish collection          4--6 fish biasa
            7 Secret fish              1--2 desain
            8 Public aquarium          1 tank dengan swim animation
            9 HUD and inventory        1 set lengkap
           10 Buildings                pasar, toko, aquarium, verification board
           11 NPC                      2
           12 Emotes                   3--4
           13 Aura                     4 efek
           14 Audio                    8--12 cue
           15 Remaining fish           melengkapi 16 reguler

## 15.2 Jangan salah mengartikan minimum demo

Minimum demo bukan berarti konten produksi boleh berhenti pada 4--6 ikan
jika sistem game menjanjikan 16 ikan reguler. Ini hanya urutan prioritas
visual agar demo dapat meyakinkan lebih awal.

## 15.3 Definition of Done --- demo visual

Demo visual dianggap cukup ketika: - pemain bisa masuk pulau; - avatar
lokal bergerak; - remote player terlihat; - pemain bisa menuju spot; -
tombol Lempar jelas; - animasi cast berjalan; - waiting state terlihat
hidup; - hasil muncul setelah state benar; - hasil pemain lain tetap
`???`; - inventory / market / shop bisa diperlihatkan; - Secret reveal
dapat didemonstrasikan dengan status yang sah; - aquarium menampilkan
Secret; - UI terbaca pada desktop dan HP.

------------------------------------------------------------------------

# 16. Demo Video --- 3 Minute Storyboard

Tujuan video bukan hanya memperlihatkan fitur. Video harus membangun
rasa penasaran, menunjukkan loop, lalu memberikan payoff Secret.

## 16.1 Storyboard

  -----------------------------------------------------------------------
  Waktu                   Adegan                  Pesan yang harus
                                                  dipahami
  ----------------------- ----------------------- -----------------------
  0:00--0:15              Pulau, avatar, pemain   Ini multiplayer fishing
                          lain, silhouette `???`  dengan misteri

  0:15--0:40              Pemain melempar 5 kail  Mekanik inti

  0:40--1:05              Waiting state, ambient, Waktu tunggu terasa
                          pemain berinteraksi     sebagai bagian dunia

  1:05--1:30              Hasil ikan, atribut,    Reward dan progression
                          jual                    

  1:30--1:50              Sambar Ember            Fitur sosial / risiko

  1:50--2:35              Secret found → reveal → Hero moment
                          pamerkan                

  2:35--2:50              Aquarium publik         Prestige dan permanensi

  2:50--3:00              Verifikasi blockchain   Nilai Web3 dan trust
  -----------------------------------------------------------------------

## 16.2 Recording direction

-   Rekam pada resolusi yang cukup untuk teks terbaca.
-   Jangan mempercepat animasi hingga terlihat palsu.
-   Hindari kamera terlalu jauh.
-   Jangan menampilkan layar developer / console.
-   Pastikan HUD tidak menutupi avatar.
-   Gunakan sesi yang sudah disiapkan untuk Secret reveal.
-   Jika menggunakan seeded/demo path, beri label yang jujur dan jangan
    mengklaim itu transaksi produksi.
-   Pastikan suara game tidak clipping.
-   Jangan menggunakan musik yang menenggelamkan sound cue Secret.

## 16.3 Opening 10 seconds

Dalam 10 detik pertama, penonton harus memahami: 1. ini game mancing; 2.
ada pemain lain; 3. hasil tangkapan pemain lain misterius; 4. ada
sesuatu bernama Secret.

Jangan membuka video dengan logo selama 10 detik atau penjelasan
blockchain panjang.

------------------------------------------------------------------------

# 17. Schedule: 10-Day Art Sprint

Asumsi waktu khusus art/client sekitar 1,5 minggu. Ini jadwal agresif
dan perlu dipangkas jika integrasi blockchain mengambil waktu lebih
banyak.

  Hari     Fokus                  Deliverable
  -------- ---------------------- -----------------------------------------
  Day 1    Visual prototype       palette, avatar test, fish test, camera
  Day 2    Island                 map dasar, pantai, air, dermaga
  Day 3    Player                 idle, walk, cast, fishing
  Day 4    Fish                   4--8 fish awal, silhouette
  Day 5    Fishing presentation   bobber, pull, result card
  Day 6    Secret reveal          banner, aura, reveal sequence, sound
  Day 7    Aquarium               tank, fish swim, owner, serial
  Day 8    HUD                    inventory, market, shop, status
  Day 9    Polish                 emote, ambient, performance, mobile
  Day 10   Demo rehearsal         bug fixing, recording test, final pass

## 17.1 Daily acceptance gate

Setiap hari harus menghasilkan sesuatu yang bisa dilihat di game, bukan
hanya file aset yang belum terintegrasi.

-   Day 1: sprite terlihat di Phaser.
-   Day 2: pemain bisa berjalan di map.
-   Day 3: avatar punya animasi inti.
-   Day 4: ikan dan silhouette muncul.
-   Day 5: fishing loop bisa diperlihatkan.
-   Day 6: Secret reveal berjalan.
-   Day 7: aquarium menampilkan ikan.
-   Day 8: HUD berfungsi.
-   Day 9: mobile/performance pass.
-   Day 10: demo dapat direkam tanpa improvisasi.

------------------------------------------------------------------------

# 18. Risk Register & Mitigation

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Terlihat seperti clone  Identitas lemah         Jadikan unknown catch
  game fishing populer                            dan public Secret
                                                  sebagai pusat visual

  Waiting 12--25 detik    Retensi buruk           Ambient world, social
  terasa membosankan                              presence, honest status

  Pixel art generik       Sulit diingat           Kunci silhouette,
                                                  palette, dan reveal
                                                  language

  AI asset tidak          Dunia berantakan        Style guide dan manual
  konsisten                                       cleanup

  Browser / HP berat      FPS turun               Atlas, culling,
                                                  pooling, batasi
                                                  particle

  30 avatar membuat layar Readability turun       Nameplate proximity,
  ramai                                           remote update
                                                  throttling

  Secret tidak muncul     Highlight hilang        Siapkan sesi
  saat demo                                       demonstrasi yang valid

  Private data bocor      Mekanik rusak           Jangan kirim private
                                                  attributes ke client
                                                  lain

  Scope creep             Deadline gagal          P0/P1/P2/P3 dan
                                                  demo-first

  UI terlalu              Game terasa seperti     Game-first
  dashboard-like          dApp                    presentation,
                                                  blockchain detail
                                                  sebagai secondary UI

  Reveal terlalu ramai    Ikan tidak terbaca      Hierarchy, kontras,
                                                  efek terkontrol

  Mobile touch buruk      Pemain sulit bermain    48 CSS px target, no
                                                  hover dependency
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 19. Reference Direction

Referensi berikut adalah **referensi prinsip**, bukan target untuk
disalin.

## Stardew Valley

Pelajari: - dunia pixel yang nyaman; - readability; - aktivitas
sederhana yang terasa rewarding; - penggunaan tile dan sprite.

Jangan menyalin: - karakter; - tile set; - layout map; - UI; - komposisi
spesifik.

## Dave the Diver

Pelajari: - presentasi ikan; - reward feedback; - humor; - cara
menampilkan hasil tangkapan.

Jangan menyalin: - desain ikan; - UI; - karakter; - layout.

## DREDGE

Pelajari: - misteri laut; - rasa penasaran; - penggunaan siluet dan
suasana; - kontras antara dunia dan sesuatu yang tidak diketahui.

Deep Secret tetap harus lebih cerah dan santai, bukan menjadi horror
fishing game.

## WEBFISHING

Pelajari: - social fishing; - multiplayer presence; - aktivitas
sederhana yang menjadi alasan berkumpul; - interaksi pemain.

Jangan meniru identitas visual atau sistem presentasi spesifik.

## WarioWare

Pelajari: - pacing; - humor absurd; - reaksi cepat; - visual gag yang
terbaca dalam waktu singkat.

------------------------------------------------------------------------

# 20. Final Non-Negotiable Directives

AI agent / developer harus mengikuti keputusan ini kecuali ada instruksi
eksplisit yang lebih baru:

1.  **2D top-down chunky pixel art.**
2.  **Tropical arcade world, bukan dark horror world.**
3.  **Modern, readable UI; jangan pixel-font untuk semua teks.**
4.  **Semua tangkapan pemain lain adalah silhouette `???`.**
5.  **Tidak ada private fish metadata di client pemain lain.**
6.  **Secret reveal adalah hero moment nomor satu.**
7.  **Akuarium publik adalah landmark utama dan bukti sosial.**
8.  **Waiting state harus hidup, tetapi status blockchain harus jujur.**
9.  **Phaser menangani world; React menangani HUD.**
10. **Jangan menambah scope 3D atau isometrik.**
11. **Gunakan AI untuk ide/concept, bukan final asset tanpa cleanup.**
12. **Gunakan CC0 / lisensi yang jelas untuk environment props.**
13. **Optimasi mobile sejak awal.**
14. **Kurangi dekorasi sebelum mengurangi kualitas reveal.**
15. **Jangan meniru IP atau game tertentu.**

## Brand line

**THE SEA KEEPS SECRETS. SO DO YOU.**

## One-sentence art direction

> Deep Secret is a bright, tropical, chunky-pixel multiplayer fishing
> world where ordinary catches are playful and expressive, every other
> player's catch remains an absolute black mystery, and a publicly
> revealed Secret becomes a spectacular server-wide event.

------------------------------------------------------------------------

# Appendix A --- Short Prompt for an AI Coding Agent

Use this document as the visual and presentation source of truth for
Deep Secret.

Before implementing: 1. Inspect the existing repository and identify the
current game architecture. 2. Do not replace existing blockchain,
wallet, contract, API, or WebSocket logic. 3. Report the existing
structure and propose the smallest integration plan. 4. Build a small
visual prototype first: island, one avatar, one fish, one unknown
silhouette, and the main fishing button. 5. Validate the prototype at
desktop and mobile sizes before producing all assets. 6. Keep the game
world in Phaser and UI in React unless the existing architecture makes
this impractical. 7. Do not add large dependencies without explaining
why they are necessary. 8. Do not use placeholder gradients, generic
crypto-dashboard UI, or random AI-generated art as final visuals. 9.
Implement the Secret reveal and aquarium as the highest-priority
presentation moments. 10. Preserve the privacy rule: other players' fish
attributes must not be sent to their clients.

After implementation, report: - files changed; - assets created or
reused; - dependencies added; - mobile/performance considerations; -
features still using placeholders; - known deviations from this art
bible.

Do not silently invent game mechanics or alter blockchain behavior. If a
requirement is ambiguous, choose the smallest implementation consistent
with this document and flag the assumption.
