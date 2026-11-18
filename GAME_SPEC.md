# Deep Secret — Spesifikasi Game

> Nama kerja, boleh diganti. Aturan submission: nama proyek **tidak boleh** mengandung kata "Zama".
>
> Disclaimer wajib (di aplikasi dan README): *"This project is not audited, endorsed or operated by Zama. Use at your own risk."*

| | |
|---|---|
| Bounty | Zama Developer Program Mainnet Season 5 — Confidential Gaming |
| Jaringan | Ethereum Sepolia |
| Deadline | 14 Desember 2026, 23:59 AOE |
| Status dokumen | Draf v0.3 — 17 November 2026 (v0.2 + Sambar Lite bergerbang + pitch baru tanpa janji fitur tukar) |
| Dokumen pendamping | [docs/SAMBAR_EMBER.md](docs/SAMBAR_EMBER.md) (rancangan lengkap Sambar Ember) · [docs/ART_BIBLE.md](docs/ART_BIBLE.md) (sumber arahan visual, berlaku dengan Addendum-nya) |
| Dasar teknis | [SPIKE_LOG.md](SPIKE_LOG.md) (semua primitif kriptografi inti sudah terbukti di Sepolia) |
| Dasar riset | [reports/Web3 hackathon gaming winners 2026.md](reports/Web3%20hackathon%20gaming%20winners%202026.md) |

---

## 1. Ringkasan

**Satu kalimat:** game mancing pixel art multiplayer di mana kamu bisa melihat pemain lain memancing di sebelahmu, tapi tidak pernah tahu apa yang mereka tangkap — ikan "Secret" benar-benar rahasia sampai pemiliknya memutuskan untuk memamerkannya.

**Pitch 10 detik:** "Kamu lihat orang memancing di sebelahmu — tapi kamu tidak pernah tahu dia dapat teri atau ikan Secret. Di game mancing biasa, bot bisa mengintip dan mengulang lemparan sampai dapat yang langka, dan kamu harus percaya developer soal peluangnya. Di Deep Secret, peluangnya tertulis di kontrak, hasil tangkapanmu dienkripsi oleh chain, dan ikan Secret-mu jadi NFT 1-dari-1 yang bisa dibuktikan keasliannya."

Catatan pitch: kasus scam rekber ikan langka dipakai sebagai **motivasi rencana berikutnya** (Tukar Langsung, §6.11), bukan janji fitur, selama fitur itu belum dibangun.

**Inspirasi genre:** game mancing santai ala Roblox (lempar → tangkap → jual → upgrade, dunia bersama dengan pemain lain) dan kasta "Secret" ala game brainrot. Ini **game orisinal**: semua nama ikan, gambar, peta, karakter dan teks dibuat sendiri. Tidak menyalin nama, karakter, aset, peta, atau tampilan game mana pun.

---

## 2. Apa yang dinilai juri dan bagaimana game ini menjawabnya

| Kriteria juri | Jawaban Deep Secret |
|---|---|
| Gameplay & UX | Dunia pixel art yang bisa dijelajahi bersama pemain lain. Loop 20 detik: jalan ke air, lempar 5 kail, tarik satu per satu, jual, upgrade. Starter pack gratis, tanpa cari faucet token. |
| Desain kerahasiaan | Hasil tangkapan, saldo koin, dan sisa ikan Secret musim ini dienkripsi. Di dunia bersama, tangkapan pemain lain tampil sebagai siluet "???". Lihat matriks di §7. |
| Fairness | Tabel peluang publik dan terkunci selama musim berjalan. Angka acak dari chain (`FHE.randEuint32`). Setiap ikan yang dipamerkan membawa bukti dekripsi yang diverifikasi kontrak. Total ikan Secret dibuka di akhir musim. Server multiplayer tidak memegang kunci apa pun. |
| Functionality | Satu putaran penuh (klaim starter → lempar → buka → jual → upgrade → tangkap Secret → pamerkan → NFT di akuarium) jalan end-to-end di Sepolia, dengan dua pemain terlihat di dunia yang sama. |
| Demo | Momen wow: dua layar berdampingan, pemain B melihat pemain A menarik ikan sebagai siluet "???"; A memamerkan Secret, seluruh server menerima pengumuman, ikan itu berenang di Akuarium Publik. |
| Code quality | Kontrak kecil per tanggung jawab, test di mock + skrip end-to-end Sepolia, README dengan tabel "kenapa bukan commit-reveal / server / ZK", pemisahan tegas antara state on-chain (nilai) dan state realtime (kosmetik). |

---

## 3. Pilar desain

1. **Sederhana dan cepat dimengerti.** Pemain baru paham dalam 10 detik tanpa membaca apa pun.
2. **Rahasia adalah inti keseruan, bukan hiasan.** Kalau state-nya dibuat publik, kelangkaan dan rasa penasaran hilang.
3. **Ramai bersama, rahasia sendiri.** Kamu melihat semua orang memancing; kamu tidak melihat apa yang mereka dapat.
4. **Jeda chain disamarkan oleh animasi.** Setiap tunggu transaksi diisi animasi yang memang bagian dari permainan.
5. **Semua yang bernilai bisa dibuktikan.** Semua yang bernilai ada di chain; semua yang di server realtime hanya kosmetik.

---

## 4. Dunia dan multiplayer

### 4.1 Gaya: pixel art 2D, sudut pandang top-down

Keputusan (bisa dibalik di §17): **pixel art 2D top-down**, bukan 3D.

| | Pixel art 2D | 3D |
|---|---|---|
| Waktu membuat aset | Sprite 32–48 px bisa dibuat/diedit cepat; paket CC0 tersedia | Model, rig, animasi; jauh lebih lama |
| Beban di browser | Ringan; penting karena SDK Zama sudah memuat WASM besar | Berat, terutama di HP |
| Cocok dengan vibe "brainrot" | Ya, lucu dan ekspresif | Ya, tapi butuh kualitas tinggi supaya tidak terlihat murahan |
| Risiko jadwal 4 minggu | Rendah–sedang | Tinggi |

Engine: **Phaser 3** (tilemap, animasi sprite, kamera, input keyboard dan sentuh) di dalam shell React untuk HUD, dompet, dan panel.

### 4.2 Peta

Satu pulau kecil, bisa dijelajahi dalam ±30 detik jalan kaki:

| Area | Fungsi |
|---|---|
| **Dermaga** (spawn) | Zona mancing 1, terbuka untuk semua |
| **Karang** | Zona mancing 2, butuh joran level 2; peluang Langka–Legenda lebih tinggi |
| **Palung** | Zona mancing 3, butuh joran level 4; peluang Secret tertinggi |
| **Pasar Ikan** (bangunan) | Jual ikan ke NPC pedagang |
| **Toko Joran** (bangunan) | Upgrade joran, beli umpan, klaim starter pack |
| **Akuarium Publik** (bangunan besar) | Tangki raksasa berisi semua ikan Secret yang sudah dipamerkan, berenang dengan aura masing-masing, beserta nama pemilik |
| **Papan Verifikasi** | Tabel peluang dari kontrak, statistik musim, tombol "Coba intip ikan orang lain" |

Zona mancing hanya mengubah tabel peluang, bukan jenis ikan, supaya jumlah aset tetap kecil. Zona dikirim sebagai parameter transaksi `cast(zoneId)` dan kontrak mengecek level joran; posisi avatar di peta tidak dipercaya.

### 4.3 Yang dilihat pemain lain

| Aksi pemain A | Yang dilihat pemain B |
|---|---|
| Berjalan, berdiri, emote | Avatar A bergerak, nama di atas kepala, level joran (kosmetik) |
| Melempar kail | Animasi lempar, pelampung di air |
| Menarik ikan | Animasi tarik; ikan yang muncul tampil sebagai **siluet hitam "???"** |
| Membuka ember | Tidak terlihat |
| Menjual ke pasar | A masuk ke Pasar Ikan; nilai transaksi tidak terlihat |
| Memamerkan Secret | Avatar A mengangkat ikan dengan efek aura; banner ke seluruh server: "🔔 [Nama] memamerkan Raja Abyss! (Secret #3 — Musim 1)"; ikan muncul di Akuarium Publik |
| Menyambar ember orang (Sambar Lite) | A jongkok di depan ember, kail dicelup, lalu membawa **karung "???"**; feed: "🪝 A menyambar ember Sari — hasilnya ???". Tidak ada yang tahu berhasil atau tidak |
| Memasang jaring (Sambar Lite) | Ikon 🕸️ di bibir ember A, tanpa menunjuk slot mana pun |

Siluet "???" adalah gambar ikonik untuk video dan thumbnail: kerahasiaan yang langsung terlihat mata.

### 4.4 Server dan kapasitas

- Satu "pulau" = satu room realtime, maksimum ±30 pemain; room baru dibuka otomatis kalau penuh.
- Server realtime hanya menyinkronkan hal kosmetik: posisi, arah, status animasi, nama, emote.
- Server **tidak** memegang izin dekripsi, kunci, atau data ikan apa pun. Pengumuman pamer diambil dari event kontrak yang memang publik.
- Supaya dunia tidak terlihat kosong saat juri masuk sendirian: **NPC nelayan** berlabel jelas "NPC" yang ikut berjalan dan memancing secara kosmetik (tidak memanggil kontrak).
- Pengecualian (Sambar Lite): **Pak Kumis** punya ember sungguhan di kontrak (alamat cadangan tanpa kunci), diisi lewat `restockNpc` yang bisa dipanggil siapa pun. Skrip keeper kecil hanya membayar gas untuk restock; ia tidak memegang kunci dekripsi dan tunduk pada aturan publik yang sama.

### 4.5 Identitas pemain

- Masuk dengan dompet; server realtime memverifikasi tanda tangan pesan login (tanpa biaya gas) untuk mengaitkan avatar dengan alamat.
- Nama panggilan disimpan on-chain (`setName`) supaya sama di Akuarium Publik dan NFT.
- Emote berupa daftar pilihan (tanpa chat bebas) untuk menghindari kebutuhan moderasi.

---

## 5. Loop utama

```
 [Masuk pulau, klaim starter pack di Toko Joran] ──► punya Koin Mutiara (terenkripsi)
          │
          ▼
 [Jalan ke zona mancing, Lempar 5 kail]  1 transaksi, ±12 s  ── bayar umpan dengan Koin
          │                                                   chain mengocok 5 ikan terenkripsi
          ▼
 [Tarik satu per satu]  ±6 s untuk buka 5 ikan (hanya pemilik yang bisa lihat;
          │              pemain lain melihat siluet "???")
          │
          ├──► Ikan biasa ──► [Jual di Pasar Ikan] ──► Koin bertambah (jumlahnya rahasia)
          │                                            │
          │                                            ▼
          │                                   [Upgrade joran di Toko] ──► buka Karang / Palung
          │
          └──► Ikan SECRET ──► pilih:
                    ├── [Simpan diam-diam]   tidak ada yang tahu kamu punya
                    └── [Pamerkan]           dibuka publik → NFT 1-dari-1 → banner server
                                             → berenang di Akuarium Publik
```

Satu putaran lempar-tarik ±20 detik. Satu sesi demo (masuk, 5 lemparan, jual, upgrade, pamer) ±3 menit.

---

## 6. Mekanik detail

### 6.1 Mata uang: Koin Mutiara

- Token **ERC-7984** (confidential token, OpenZeppelin `ERC7984`), saldo terenkripsi, hanya pemilik yang bisa melihat.
- Hanya kontrak game yang boleh mencetak (`mint`) dan membakar (`burn`).
- **Starter pack:** setiap alamat bisa klaim sekali, mendapat 100 Mutiara. Juri bisa langsung main tanpa faucet token.
- Opsi lanjutan (Should): tukar cUSDT ke Mutiara, supaya game memakai token resmi dari registry.

### 6.2 Tingkatan ikan (rarity)

| Tier | Jumlah jenis | Contoh nama (orisinal, bebas diganti) | Harga dasar |
|---|---|---|---|
| Biasa | 4 | Teri Ngantuk, Lele Galau, Mujair Kantoran, Bandeng Rebahan | 2 |
| Langka | 4 | Kakap Sultan, Kerapu Bucin, Tongkol Turbo, Gurame Glamor | 8 |
| Epik | 4 | Hiu Kalkulator, Pari Pesulap, Belut Listrik Kosan, Napoleon Ngamuk | 30 |
| Legenda | 4 | Naga Arwana, Paus Disko, Marlin Kilat, Kraken Kecil | 150 |
| **Secret** | 2 | Raja Abyss, Ratu Palung | — (tidak dijual ke pasar; disimpan, dipamerkan, atau ditukar) |
| Sampah | 1 | Sandal Jepit | 0 (hasil kalau umpan tidak terbayar) |

Jumlah jenis per tier sengaja 4 dan 2 karena kontrak bisa mengocok angka acak berbatas pangkat dua dengan murah (`FHE.randEuint8(4)`, `FHE.randEuint8(2)`), lihat SPIKE_LOG S2.

### 6.3 Atribut tambahan setiap ikan

- **Berat:** 1–255 (acak), menambah harga jual dan ukuran sprite.
- **Aura:** peluang 1/16 per ikan; ikan beraura bernilai 2× dan tampil dengan efek partikel. Empat aura (contoh: Neon, Galaksi, Api, Hantu).
- Kombinasi jenis + berat + aura + nomor seri membuat setiap ikan Secret unik.

### 6.4 Peluang (tabel publik, terkunci per musim)

Peluang ditulis sebagai ambang angka acak 32-bit di kontrak dan ditampilkan apa adanya di Papan Verifikasi ("1 dari X").

| Tier | Musim Demo, Dermaga | Musim Normal, Dermaga (contoh) |
|---|---|---|
| Secret | 1 dari 40 per ikan | 1 dari 20.000 per ikan |
| Legenda | 1 dari 25 | 1 dari 500 |
| Epik | 1 dari 8 | 1 dari 60 |
| Langka | 1 dari 3 | 1 dari 5 |
| Biasa | sisanya | sisanya |

- **Joran** menggandakan ambang Legenda dan Secret per level (maksimum level 4). Level joran publik.
- **Zona** menambah pengali: Karang ×2 untuk Langka–Legenda, Palung ×2 untuk Secret.
- Peluang Musim Demo sengaja tinggi supaya juri yang mencoba 5–10 lemparan punya peluang realistis melihat ikan Secret. Ini dinyatakan terang-terangan di UI dan README.

### 6.5 Kuota Secret per musim (rahasia)

- Setiap musim punya kuota tetap, misalnya **10 ikan Secret** (Musim Demo: 5).
- Sisa kuota disimpan sebagai angka terenkripsi. Tidak ada yang bisa melihat berapa yang tersisa: HUD hanya menampilkan **"Secret tersisa: ???"**.
- Kalau kuota habis, hasil Secret otomatis turun menjadi Legenda. Ini terjadi di dalam enkripsi, jadi tidak ada yang tahu kapan kuota habis.
- Di akhir musim, siapa pun bisa memanggil `endSeason()`: sisa kuota dan total tangkapan dibuka ke publik beserta bukti, sehingga semua orang bisa memverifikasi bahwa batas suplai dihormati.

### 6.6 Lemparan (`cast(zoneId)`)

1. Pemain berdiri di tepi air zona mana pun dan menekan **Lempar**. Satu transaksi.
2. Kontrak mengecek level joran untuk zona itu, lalu membakar biaya umpan (misalnya 5 Mutiara) dari saldo terenkripsi. Hasil pembakaran dibandingkan dengan harga secara terenkripsi → bit `paid`.
3. Kontrak mengocok 5 ikan: tier dari angka acak 32-bit vs ambang (sudah dikalikan joran dan zona), jenis, berat, aura, dan harga jual. Semua terenkripsi.
4. Kalau `paid` salah, kelima ikan menjadi "Sandal Jepit" tanpa membocorkan apa pun. UI mengecek saldo dulu, jadi pemain normal tidak mengalaminya.
5. Pemain mendapat izin dekripsi atas 5 ikannya. Event `Cast(player, zoneId, castId)` tidak memuat isi ikan.

Catatan: perilaku "transfer kurang saldo = 0, bukan revert" sudah terbukti di SPIKE_LOG S10; desain ini memanfaatkannya.

### 6.7 Menarik ikan (sisi klien)

- Saat transaksi menunggu konfirmasi (±12 s), avatar duduk memancing dan pelampung bergoyang; pemain lain melihat hal yang sama.
- Setelah terkonfirmasi, frontend membuka 5 ikan dalam satu panggilan dekripsi (±6 s, SPIKE_LOG S13) sambil pemain "menarik" ikan satu per satu dengan tap/klik.
- Mini-game tarik ini **kosmetik**, tidak mempengaruhi hasil, dan dinyatakan begitu.
- Atribut tiap ikan dipadatkan ke satu nilai terenkripsi 32-bit (jenis, berat, aura, tier) supaya cukup 5 dekripsi per lemparan.

### 6.8 Menjual di Pasar Ikan

- Tombol utama adalah **"Jual Semua"** (semua ikan di ember kecuali Secret). Kontrak mencetak Mutiara sebesar total harga terenkripsi. Harga jual tidak pernah publik.
- Jual ikan pilihan tersedia sebagai opsi lanjutan.
- Kontrak tidak bisa memaksa lokasi, jadi jual bisa dilakukan dari panel ember di mana saja; Pasar Ikan tetap ada sebagai tempat dan NPC.
- Ikan Secret tidak bisa dijual ke pasar. Record Sandal Jepit (harga 0) aman dijual.
- **Keterbatasan yang diakui:** `sell(fishIds)` membuka ikan *mana* yang dijual (bukan isinya). Pemain yang menjual sebagian meninggalkan sinyal bahwa sisanya bagus. Ini didokumentasikan di README dan dibingkai sebagai ruang gertakan; jual bermasker terenkripsi ditunda (§17).

### 6.9 Upgrade joran

- Biaya naik per level (misalnya 50 / 150 / 400 / 1.000 Mutiara; lebih murah di Musim Demo).
- Karena level joran publik sementara pembayaran terenkripsi, upgrade memakai pola dua langkah yang sudah terbukti (SPIKE_LOG S5): bayar → bit "terbayar" dibuka publik → finalisasi menaikkan level. Total ±20 s, dan hanya terjadi sesekali.
- Joran baru langsung terlihat di tangan avatar oleh semua pemain.

### 6.10 Ikan Secret: simpan atau pamerkan

- **Simpan diam-diam:** ikan tetap terenkripsi, hanya pemilik yang tahu. Tidak ada yang bisa mengincar pemiliknya.
- **Pamerkan:**
  1. `flex(fishId)` menandai atribut ikan itu bisa didekripsi publik.
  2. Frontend mengambil hasil dekripsi publik beserta bukti (±4 s).
  3. `finalizeFlex(fishId, nilai, bukti)` memverifikasi bukti dengan `FHE.checkSignatures`, lalu mencetak **NFT ERC-721** dan memancarkan event `Flexed`.
  4. NFT memuat jenis, berat, aura, musim, dan nomor seri ("Secret #3 — Musim 1"). Nomor seri adalah urutan pamer, bukan urutan tangkap, jadi tidak membocorkan kapan ikan itu ditangkap.
- Server realtime mendengar event `Flexed` dan menyiarkan banner ke semua room; ikan langsung muncul di tangki Akuarium Publik.
- Kegunaan NFT di luar game (pasca-hackathon): umpan acara bos, tiket musim berikutnya, atau dipajang di marketplace NFT biasa.

### 6.11 Tukar langsung tanpa rekber (prioritas "Should", setelah Sambar Lite)

Menjawab masalah nyata: penjualan ikan langka lewat rekber yang berujung scam. Dikerjakan hanya kalau Sambar Lite selesai lebih cepat dari jadwal; kalau tidak, disebut di video dan README sebagai rencana musim berikutnya.

- Penjual memasang ikan (tersembunyi atau NFT) dengan harga dalam Mutiara.
- **Intip sebelum beli:** penjual bisa memberi izin dekripsi ikan itu kepada satu calon pembeli tertentu. Hanya pembeli itu yang bisa melihat isinya, tanpa membukanya ke publik. Fitur ini hanya mungkin dengan FHE.
- Pembeli membayar; ikan dan koin berpindah lewat kontrak (pola dua langkah dengan bit "terbayar"). Tidak ada pihak ketiga.
- Fee pasar kecil (misalnya 2%) dibakar atau masuk kas.

### 6.12 Sambar Ember — versi Lite (prioritas "Should", bergerbang 30 Nov)

Rancangan lengkap: [docs/SAMBAR_EMBER.md](docs/SAMBAR_EMBER.md). Ringkasannya:

**Satu kalimat:** kamu bisa menyambar satu ikan dari ember pemain lain, tapi kamu tidak tahu isinya, tidak tahu di mana jaringnya, dan orang lain tidak tahu kamu berhasil atau cuma dapat Sandal Jepit.

| | |
|---|---|
| Aksi | Datangi ember pemain atau NPC → pilih satu siluet "???" → **Sambar** (1 transaksi, ±12 s) |
| Biaya | Umpan Sambar 10 Mutiara (Musim Demo: 5) |
| Hasil | Penyambar selalu dapat satu **karung "???"**: ikan curian atau Sandal Jepit. Hanya penyambar yang bisa membukanya. Korban yang kehilangan ikan mendapat Sandal Jepit di slot itu. |
| Pertahanan | Jual Semua, **Jaring Rahasia** (posisinya input terenkripsi), ikan Secret kebal otomatis, ikan baru "masih basah" 30 s, satu ikan hanya bisa diincar sekali, batas per korban, perisai pemula |
| Kena jaring | Umpan penyambar pindah ke pemilik ember (zero-sum, tidak ada koin baru). Penyambar hanya melihat "Sandal Jepit" — tidak bisa membedakan kena jaring atau mengincar ikan Secret |
| Jejak di chain | Seragam: setiap sambaran yang lolos cek selalu membakar, mencetak (bisa 0), membuat satu record baru, dan memancarkan event yang sama, berhasil atau gagal |
| Solo untuk juri | **Ember Pak Kumis** di ujung Dermaga: ember NPC on-chain berisi 6 ikan dan jaring acak dari chain. Tugas tutorial: "Coba sambar ember Pak Kumis!" |

Aturan plaintext yang dicek kontrak (angka Musim Normal; Musim Demo lebih longgar, lihat dokumen pendamping §1.7): penyambar sudah 2 lemparan, korban sudah 5 lemparan (perisai pemula, pecah kalau ia sendiri menyambar pemain), jeda penyambar 120 s, jeda pasangan A→B 10 menit, korban aman 90 s setelah diincar dan maksimal 3 kali per jam, ember korban ≥ 3 record.

Keseimbangan: nilai harapan Sambar per koin selalu lebih kecil daripada Lempar per koin. Sambar adalah bumbu dan jackpot, bukan cara utama mencari koin.

Status: **kait kontrak masuk Must** (dikerjakan minggu 1–2). Fitur penuh Sambar Lite dibangun 1–5 Desember **hanya kalau** alur Must sudah jalan end-to-end di Sepolia dengan dua pemain per 30 November. Kalau gerbang gagal, Sambar ditunda ke pasca-hackathon dan disebut di README sebagai fitur musim berikutnya.

---

## 7. Matriks kerahasiaan

| Data | Siapa yang bisa melihat | Kapan dibuka publik | Kenapa dirahasiakan / dibuka |
|---|---|---|---|
| Hasil lemparan (jenis, berat, aura) | Pemilik saja; pemain lain melihat siluet "???" | Hanya jika dipamerkan | Mencegah bot mensimulasikan lemparan lalu membatalkan yang jelek; melindungi pemegang ikan langka dari incaran |
| Harga jual ikan dan saldo Mutiara | Pemilik saja | Tidak pernah | Kekayaan pemain tidak jadi target; pasar tidak bisa dimanipulasi dari luar |
| Sisa kuota Secret musim ini | Tidak ada | Akhir musim, dengan bukti | Menjaga rasa penasaran dan FOMO; tidak ada yang bisa menunggu sampai "pasti dapat" |
| Ikan Secret yang dipamerkan | Semua orang | Saat pemilik memilih pamer | Kebanggaan, identitas unik NFT, momen sosial di server |
| Ikan yang sedang ditawarkan | Penjual, plus pembeli yang diberi izin intip | Tidak, kecuali dipamerkan | Pembeli bisa memeriksa barang tanpa menyebarkannya |
| Tabel peluang, level joran, zona, nomor musim | Semua orang | Selalu publik | Keadilan harus bisa dicek |
| Posisi avatar, animasi, nama, emote | Semua pemain di room yang sama | Selalu (off-chain, kosmetik) | Tidak bernilai dan tidak mempengaruhi hasil apa pun, jadi tidak perlu dipercaya |
| Posisi Jaring Rahasia (Sambar) | Pemilik ember saja | Tidak pernah | Kalau terlihat, penyambar tinggal menghindarinya; jaring tetap bekerja saat pemilik offline |
| Hasil sambaran dan alasan gagal (Sambar) | Penyambar melihat isi karungnya; korban melihat slotnya sendiri | Tidak pernah | Penonton dan bot tidak bisa belajar ember mana yang berharga; "kena jaring" dan "itu Secret" tidak bisa dibedakan |
| Target sambaran (siapa, ikan mana) | Semua orang | Selalu | Diperlukan supaya aturan anti-grief bisa dicek dan diverifikasi di kontrak |

Tidak ada fungsi admin yang bisa membaca data pemain, mengubah peluang, atau mencetak ikan di tengah musim. Server realtime tidak memegang izin dekripsi.

---

## 8. Kenapa harus FHE (bahan README dan video)

| Alternatif | Masalahnya untuk game ini |
|---|---|
| State publik di chain biasa | Bot mensimulasikan transaksi dan hanya mengirim lemparan yang menghasilkan Secret (re-roll gratis). Inventaris dan sisa kuota terlihat semua orang. |
| Commit-reveal | Butuh langkah reveal yang bisa ditinggalkan pemain; kuota rahasia lintas pemain tidak bisa dihitung tanpa dibuka. |
| Server game (seperti Roblox) | Pemain harus percaya developer soal peluang dan suplai; jual-beli di luar game rawan scam. |
| ZK saja | Bisa membuktikan, tapi tidak bisa menyimpan dan menghitung angka acak bersama yang tidak diketahui siapa pun, termasuk penghitung kuota lintas pemain. |
| TEE (enclave) | Kerahasiaan bergantung pada vendor perangkat keras; riset menunjukkan pemenang lain mengakui keterbatasan ini sendiri. |
| Jaring di ember (Sambar), dengan commit-reveal | Pemilik harus online untuk membuka jaringnya di setiap sambaran; dengan server, server tahu posisi jaring. Dengan FHE, jaring dicek buta oleh kontrak walau pemiliknya offline. |

---

## 9. Visual dan aset

### 9.1 Arah visual

- Pixel art top-down, palet cerah, gaya lucu ala "brainrot" (ikan dengan ekspresi konyol, nama lucu).
- Resolusi logis 480×270, diskalakan nearest-neighbor supaya piksel tajam (diputuskan di [ART_BIBLE](docs/ART_BIBLE.md) Addendum A5).
- **Sumber arahan visual:** [docs/ART_BIBLE.md](docs/ART_BIBLE.md) — palet, ukuran sprite, desain ikan, siluet "???", urutan reveal Secret, akuarium, HUD, pipeline aset. Addendum di bagian atasnya mengoreksi beberapa hal supaya tidak membocorkan rahasia (misalnya pengumuman server hanya saat Pamerkan, animasi yang disiarkan sama untuk semua hasil, satu ukuran siluet).
- Palet dunia 16–24 warna inti plus palet khusus Secret (Void, Cosmic, Energy, Gold), detail di ART_BIBLE §4.

### 9.2 Daftar aset

| Kelompok | Isi | Ukuran / jumlah |
|---|---|---|
| Ikan | 16 jenis Biasa–Legenda, 2 Secret, 1 Sandal Jepit | sprite 32×32 (Secret 48×48); versi besar 128×128 untuk kartu ikan dan NFT |
| Siluet "???" | Satu siluet generik per ukuran | 3 sprite |
| Aura | Neon, Galaksi, Api, Hantu sebagai efek partikel/shader di atas sprite, bukan gambar terpisah per ikan | 4 efek |
| Avatar | Badan dasar dengan 4–6 variasi warna; animasi idle, jalan (4 arah), lempar, tarik, angkat ikan, emote | ±8 animasi |
| Joran | 5 level, terlihat di tangan avatar | 5 sprite |
| Tileset | Air (animasi), pasir, dermaga kayu, karang, palung gelap, rumput | 1 tileset |
| Bangunan | Pasar Ikan, Toko Joran, Akuarium Publik (tangki besar), Papan Verifikasi | 4 bangunan |
| NPC | Pedagang pasar, penjaga toko, 2–3 NPC nelayan | 5 karakter |
| UI | Tombol lempar, panel ember, kartu ikan, banner pengumuman, HUD saldo dan "Secret tersisa: ???" | set UI |
| Sambar Lite | Ember 3 tingkat isi (siluet seragam, ukuran tidak membocorkan berat), karung "???", ikon jaring 🕸️, gelembung perisai, animasi kail ke ember, Pak Kumis + animasi sapu, emote 😎 😭 🤫 | ±10 sprite/animasi |
| Audio (Stretch) | Cipratan, tarik, koin, fanfare Secret, lonceng ember | ±7 efek |

### 9.3 Sumber aset

- Tahap 1 (minggu 1–2): placeholder sederhana supaya game bisa dimainkan.
- Tahap 2 (minggu 3): aset final, dibuat sendiri (Aseprite/Piskel), dibantu generator AI lalu dirapikan, dan/atau paket berlisensi **CC0** (misalnya tileset air dan pasir). Semua sumber dan lisensi dicatat di `ASSETS.md`.
- Tidak memakai aset, model, atau tangkapan layar dari game Roblox mana pun.

### 9.4 Gambar NFT

- Komposisi otomatis: sprite besar jenis ikan + efek aura + bingkai musim + nomor seri.
- Metadata on-chain (jenis, berat, aura, musim, nomor seri); gambar disajikan dari aset statis aplikasi atau disematkan sebagai data URI kecil (diputuskan saat build, §17).

---

## 10. Arsitektur teknis

```
 Browser (React + Phaser + @zama-fhe/sdk)
   │                     │
   │ transaksi &         │ WebSocket (posisi, animasi,
   │ dekripsi            │ emote, banner)
   ▼                     ▼
 Sepolia: kontrak game   Server realtime (room per pulau)
   │                         ▲
   └── event publik ─────────┘  (Cast, Flexed, RodUpgraded)
```

### 10.1 Kontrak (Solidity, `@fhevm/solidity` 0.11.1, Hardhat)

| Kontrak | Tanggung jawab |
|---|---|
| `PearlCoin` | ERC-7984 Koin Mutiara. `mint`/`burn` hanya oleh `DeepSecretGame`. |
| `DeepSecretGame` | Musim, starter pack, nama panggilan, lempar per zona, jual, upgrade joran, kuota Secret, pamer. |
| `SecretFishNFT` | ERC-721 untuk ikan yang dipamerkan; metadata on-chain. |
| `FishMarket` (Should) | Daftar tukar, izin intip, penyelesaian dua langkah. |

Struktur data ikan:

```solidity
struct Fish {
    address owner;
    uint32  season;
    uint64  caughtAt; // kait Sambar: aturan "masih basah" (waktu tangkap memang publik dari event Cast)
    euint32 packed;   // jenis (5 bit) | aura (3 bit) | berat (8 bit) | tier (3 bit); 0 = Sandal Jepit
    euint64 price;    // harga jual terenkripsi, dihitung saat lempar; 0 untuk Sandal Jepit
    ebool   isSecret;
    uint8   state;    // 0 = di ember, 1 = terjual, 2 = dipamerkan, 3 = sedang ditawarkan
    uint8   origin;   // kait Sambar: 0 = lempar, 1 = hasil sambar, 2 = ikan NPC
    bool    targeted; // kait Sambar: sudah pernah diincar → kebal selamanya
}

struct PlayerState {
    uint16 castCount;  // kait Sambar: dinaikkan di cast()
    uint32 emberCount; // kait Sambar: jumlah record state 0 (publik)
    // Field Sambar Lite (ditambah kalau gerbang 30 Nov lolos):
    // shieldBroken, lastSnatchAt, lastTargetedAt, windowStart, targetedInWindow, euint32 netFish
}
```

Kait Sambar di atas masuk **Must** (±0,5 hari) supaya kontrak inti tidak perlu dirombak dan di-deploy ulang kalau Sambar Lite jadi dibangun.

Fungsi utama `DeepSecretGame`:

| Fungsi | Isi |
|---|---|
| `claimStarter()` | Sekali per alamat, cetak 100 Mutiara terenkripsi. |
| `setName(string)` | Nama panggilan publik (dibatasi panjangnya). |
| `cast(uint8 zoneId)` | Cek level joran untuk zona, bayar umpan, kocok 5 ikan, beri izin dekripsi ke pemain; isi `caughtAt`, naikkan `castCount` dan `emberCount`. |
| `sell(uint256[] fishIds)` | Cetak Mutiara sebesar harga terenkripsi; tandai terjual; kurangi `emberCount`; aman untuk Sandal Jepit. |
| `snatch(address victim, uint256 fishId)` (Sambar Lite) | Cek aturan plaintext, bakar umpan, cek jaring dan Secret secara terenkripsi, buat record baru untuk penyambar, ganti handle record korban, cetak hadiah jaring ke korban (bisa 0). ±27–30 operasi, kedalaman ±9–10. |
| `setNet(externalEuint32 encFishId, bytes proof)` (Sambar Lite) | Pasang atau pindahkan jaring; ID boleh ID mana pun (gertakan sah). |
| `restockNpc(uint8 npcId)` (Sambar Lite) | Permissionless; isi ulang ember Pak Kumis dengan 6 ikan dari tabel NPC (tanpa Secret) dan jaring acak. |
| `requestRodUpgrade()` / `finalizeRodUpgrade(bool paid, bytes proof)` | Upgrade dua langkah. |
| `flex(uint256 fishId)` / `finalizeFlex(uint256 fishId, uint32 packedClear, bytes proof)` | Pamerkan dan cetak NFT. |
| `endSeason()` / `finalizeSeason(...)` | Buka sisa kuota dan statistik musim dengan bukti. |

Event publik: `StarterClaimed`, `NameSet`, `Cast(player, zoneId, castId)`, `Sold(player, count)`, `RodUpgraded(player, level)`, `Flexed(player, tokenId, species, aura, weight, serial)`. Sambar Lite menambah `Snatched(thief, victim, targetFishId, newFishId)`, `NetSet(owner)`, `NpcRestocked(npcId, firstFishId, count)`, `ShieldBroken(player)`. Tidak ada event yang memuat isi ikan yang belum dipamerkan, posisi jaring, atau hasil sambaran.

Sambar ditulis sebagai modul `abstract contract SambarModule` yang diwarisi `DeepSecretGame` (satu alamat, ACL sederhana). Kalau ukuran kontrak melewati 24 KB, logika dipindah ke library eksternal (perilaku ACL lewat `delegatecall` diuji di S24).

### 10.2 Rancangan sirkuit `cast()` (perlu dispike, lihat §13)

Untuk menjaga kedalaman operasi berurutan di bawah batas (±25 langkah berantai, SPIKE_LOG S7):

1. `secretAllowed = gt(remaining, 0)` dihitung sekali.
2. Untuk 5 ikan secara paralel: `r = randEuint32()`, bandingkan `r` dengan 4 ambang (sudah dikalikan joran dan zona sebagai angka publik), pilih tier lewat rangkaian `select`, `isSecret_i = and(lt(r, tSecret), secretAllowed)`.
3. `n = jumlah isSecret` (penjumlahan pohon, kedalaman 3).
4. Kalau `n > remaining` (kasus sangat jarang di ujung kuota), semua Secret di lemparan ini turun menjadi Legenda; `remaining -= n` hanya jika tidak meluap.
5. Jenis: `select(isSecret, randEuint8(2), randEuint8(4))` ditambah offset tier; berat `randEuint8()`; aura `lt(randEuint8(), 16)`.
6. Harga: harga dasar per tier lewat `select`, ditambah berat, digandakan bila beraura (`shl` 1 bit).
7. Kalau `paid` salah, `packed` dan `price` menjadi 0 (Sandal Jepit).

**Terbukti (SPIKE_LOG S17, 17 Nov):** sirkuit ini jalan di Sepolia dalam satu transaksi tanpa kena batas HCU, dengan gas ±10,56 juta per lemparan. Kuota tidak pernah terlampaui (mock: kuota 5, 150 lemparan → tepat 5 Secret), dan distribusi 5.000 ikan di mock cocok dengan tabel peluang (chi² 2,38). Cadangan "3 ikan per lemparan" tidak diperlukan untuk Sepolia; untuk mainnet nanti, gas ini perlu dikurangi atau dipindah ke L2.

### 10.3 Server realtime

- Room-based WebSocket server **Node `ws` + viem** (±170 baris, terbukti di S21; Colyseus/PartyKit tidak diperlukan untuk 30 pemain per room). Hosting dipilih saat deploy, dengan syarat tidak ada cold start lama (juri tidak boleh menunggu server bangun).
- Sinkronisasi 10 Hz untuk posisi dan status animasi; interpolasi di klien.
- Login: verifikasi tanda tangan pesan dompet; satu alamat satu avatar per room.
- Mendengar event kontrak lewat RPC untuk Akuarium. Untuk banner pamer, jalur cepat: klien pemamer mengirim hash transaksi `finalizeFlex`, server memverifikasi resi dan event `Flexed`-nya sendiri, lalu menyiarkan (polling event saja terlambat ±11 s di S21).
- Stateless terhadap nilai: kalau server mati, pemain tetap bisa memancing (mode solo tanpa avatar lain) karena semua yang bernilai ada di chain.
- Sambar Lite menambah status animasi `snatch_start` / `snatch_end` dan meneruskan event publik `Snatched`. Server tidak pernah tahu hasil sambaran.
- Proses **keeper** terpisah (skrip cron dengan dompet biasa) memanggil `restockNpc` saat ember Pak Kumis tipis. Ada tombol cadangan "Bangunkan Pak Kumis" untuk pemain.

### 10.4 Frontend

- Vite + React + TypeScript, viem/wagmi, `@zama-fhe/sdk` 3.7.2 (terbukti di browser, SPIKE_LOG S12–S13), Phaser 3 untuk dunia.
- Header **COOP/COEP** di hosting karena memotong waktu enkripsi lebih dari separuh. Semua aset disajikan dari origin yang sama. Risiko: pop-up dompet berbasis iframe; uji MetaMask dan wallet injeksi lain, atau pakai mode `credentialless` (spike S20). Koneksi WebSocket tidak terpengaruh COEP.
- Satu tanda tangan izin dekripsi per sesi (±1,8 s); setelah itu melihat ikan sendiri tanpa pop-up.
- Bacaan setelah transaksi dipatok ke blok resi plus retry (SPIKE_LOG S14); gas price Sepolia dipatok (S16).
- Kontrol: WASD/panah di desktop, joystick virtual di HP.

---

## 11. Ekonomi dan pemasukan (pasca-hackathon)

- Penyerap koin: umpan dan upgrade joran.
- Biaya mint NFT saat pamer.
- Fee pasar untuk tukar antar pemain.
- Kosmetik avatar (warna, topi, efek joran) — tidak mempengaruhi peluang.
- Musim baru dengan ikan Secret baru menjaga pemain kembali; NFT musim lama menjadi koleksi terbatas.
- Tidak butuh likuiditas besar: koin dicetak dan dibakar oleh game, bukan dari kolam likuiditas.

---

## 12. Cakupan

| Prioritas | Fitur |
|---|---|
| **Must** (wajib untuk submit) | Kontrak: Mutiara ERC-7984, starter pack, nama, lempar 5 kail per zona, Jual Semua, upgrade joran, kuota Secret terenkripsi, pamer → NFT, **kait Sambar** (§10.1). Dunia: pulau pixel art, gerak avatar, pemain lain terlihat, siluet "???", banner pamer, Akuarium Publik, Papan Verifikasi, NPC nelayan. Musim Demo, disclaimer, README, test. |
| **Should** (urut prioritas) | 1. **Sambar Lite** (snatch, jaring, Secret kebal, aturan anti-grief, Pak Kumis + keeper) — bergerbang 30 Nov. 2. `endSeason` dengan bukti. 3. Emote. 4. Tukar langsung tanpa rekber dengan izin intip. 5. Tukar cUSDT → Mutiara |
| **Stretch** | Kucing Garong (NPC penyambar opt-in), Rak Ember untuk pemain offline, auto-fish dengan session key, acara bos, audio, kosmetik |
| **Tidak dikerjakan** | 3D, chat teks bebas, aplikasi mobile native, pertarungan PvP real-time |

---

## 13. Spike yang masih perlu sebelum coding

| # | Target | Kriteria lulus |
|---|---|---|
| S17 | `cast()` 5 ikan dengan kuota Secret dalam satu transaksi di Sepolia | Tidak kena `HCUTransactionDepthLimitExceeded`; gas tercatat; distribusi tier di mock (10.000 lemparan) sesuai tabel peluang — **✅ lulus 17 Nov** |
| S18 | Mint/burn ERC-7984 oleh kontrak game, termasuk bit `paid` saat saldo kurang | Saldo kurang menghasilkan Sandal Jepit tanpa revert — **✅ lulus 17 Nov** |
| S19 | Dekripsi 5 nilai `euint32` padat di browser | ≤ 7 s, nilai cocok dengan perhitungan referensi — **✅ lulus 17 Nov: 6,7 s, cocok dengan hasil Node** |
| S20 | Header COOP/COEP di hosting + MetaMask | Pop-up dompet dan tanda tangan berjalan normal — **✅ lulus lokal 17 Nov** (MetaMask: connect, izin dekripsi, 2 transaksi, buka 5 ikan dalam 8,9 s); header di hosting Vercel diuji saat deploy pertama |
| S21 | Server realtime (Colyseus atau PartyKit) dengan 2 klien + login tanda tangan | Dua browser saling melihat gerak dengan jeda < 200 ms; server membaca event kontrak — **✅ lulus lokal 17 Nov** dengan server Node `ws` sederhana (p50 109 ms, login palsu ditolak, room ke-2 terbuka di pemain ke-31, event Cast diteruskan); jeda lewat hosting diuji saat deploy |
| S22 | Phaser + SDK Zama dalam satu bundle di bawah COOP/COEP | Halaman siap main < 5 s di laptop; enkripsi tidak membekukan animasi — **✅ lulus 17 Nov**: build produksi tampil 1,34 s; enkripsi berjalan di Web Worker, dunia tetap 60 fps; dekripsi menyisakan satu jeda ±240 ms (sembunyikan di animasi tarik); enkripsi pertama 15–21 s, jadi dipanaskan di latar belakang saat halaman terbuka |
| S23 | `snatch()` di Sepolia dengan burn + mint ERC-7984 dan 4 kombinasi hasil (dijalankan sebelum 1 Des) | Tidak kena `HCUTransactionDepthLimitExceeded`; event, jumlah record, dan gas identik untuk berhasil vs gagal |
| S24 | ACL setelah perpindahan record | Korban gagal mendekripsi record baru penyambar; penyambar gagal mendekripsi jaring dan record korban; ACL tetap atas nama kontrak game bila memakai library |
| S25 | `setNet` dari browser di bawah COOP/COEP | Enkripsi `euint32` + transaksi ≤ 25 s total |

---

## 14. Jadwal (4 minggu)

Cakupan bertambah karena dunia multiplayer; jadwal sengaja memotong fitur Should lebih dulu kalau tertinggal.

| Minggu | Tanggal | Target |
|---|---|---|
| 1 | 17–23 Nov | Spike S17–S22; kontrak `PearlCoin` dan `DeepSecretGame` (starter, cast, sell) **termasuk kait Sambar**; test mock; prototipe Phaser: avatar bergerak di tilemap placeholder, dua klien saling terlihat |
| 2 | 24–30 Nov | Upgrade joran, kuota, pamer + `SecretFishNFT`; deploy Sepolia; alur lempar-tarik-jual dari dalam dunia; siluet "???" dan banner pamer; spike S23–S25 |
| **Gerbang** | **30 Nov malam** | Lanjut ke Sambar Lite hanya kalau alur Must (starter → lempar → jual → upgrade → Secret → pamer → NFT) jalan end-to-end di Sepolia dengan dua pemain. Kalau tidak, minggu 3 dipakai untuk menyelesaikan Must dan polish. |
| 3 | 1–7 Des | 1–5 Des: Sambar Lite (snatch, jaring, Secret kebal, aturan, Pak Kumis, keeper). Paralel: aset final, animasi, Akuarium Publik, Papan Verifikasi, NPC nelayan. **Bekukan fitur 6 Des.** |
| 4 | 8–14 Des | Uji dengan dompet baru dan dua pemain, bug bash, README, **rekam video paling lambat 10 Des**, posting X, submit 13 Des |

---

## 15. Naskah demo (3 menit, orang sungguhan, bukan AI)

| Waktu | Isi |
|---|---|
| 0:00–0:25 | Hook: "Orang di sebelahmu baru narik ikan. Teri, atau Secret satu-dari-sepuluh? Kamu nggak akan pernah tahu." Masalah di game mancing biasa: bot bisa mengintip dan mengulang lemparan, dan pemain harus percaya developer soal peluang. |
| 0:25–1:15 | Dua layar berdampingan (pemain A dan B di pulau yang sama). A klaim starter, jalan ke Dermaga, lempar 5 kail. B melihat A menarik ikan sebagai siluet "???". Explorer menunjukkan transaksi hanya berisi ciphertext. |
| 1:15–2:00 | A menangkap Secret. HUD tetap "Secret tersisa: ???". A memamerkan → banner muncul di layar B → ikan berenang di Akuarium Publik dengan nomor seri. |
| 2:00–2:35 | Kalau Sambar Lite jadi (±20 s): A memasang jaring di ikan terbaiknya; B menyambar slot yang sama → karung "???" → layar B "Sandal Jepit", layar A "Jaringmu kena! +5 🦪"; explorer cuma menunjukkan `Snatched(B, A, …)` tanpa hasil. Lalu bukti: Papan Verifikasi, tabel peluang, bukti dekripsi NFT, tombol "Coba intip ikan orang lain" yang ditolak. Kalau Sambar tidak jadi: seluruh segmen untuk bukti. |
| 2:35–3:00 | Kenapa hanya mungkin dengan FHE; rencana musim berikutnya (Tukar Langsung tanpa rekber, menjawab kasus scam jual-beli ikan langka); ajakan mencoba. |

---

## 16. Risiko dan mitigasi

| Risiko | Mitigasi |
|---|---|
| Cakupan multiplayer + pixel art + kontrak FHE dalam 4 minggu | Kontrak dan dunia dikerjakan paralel sejak minggu 1; fitur Should dipotong lebih dulu; aset placeholder dulu |
| `cast()` melewati batas HCU | Spike S17 dulu; cadangan 3 ikan per lemparan |
| Terasa lambat dibanding Roblox (±20 s per lemparan) | 5 ikan per lemparan, animasi memancing menutupi jeda, COOP/COEP, satu izin dekripsi per sesi |
| Dunia terlihat kosong saat juri main sendirian | NPC nelayan berlabel jelas; Akuarium Publik sudah berisi ikan dari sesi uji; demo video memakai dua pemain |
| Server realtime mati atau mahal | Server hanya kosmetik; game tetap bisa dimainkan solo; tier gratis platform cukup untuk skala hackathon |
| Juri tidak sempat melihat Secret | Musim Demo dengan peluang tinggi yang dinyatakan terbuka |
| Dianggap judi | Tidak ada uang sungguhan dipertaruhkan di MVP; koin dari starter pack; peluang transparan |
| Testnet atau relayer Zama down menjelang deadline | Rekam video lebih awal; simpan rekaman cadangan |
| RPC publik membaca state basi | Bacaan dipatok ke blok resi plus retry |
| Sambar: griefing dan kehilangan saat offline | Jeda pasangan, jeda korban, maksimal 3 per jam, satu ikan satu kali, perisai pemula, Secret kebal, peringatan saat keluar; UI Lite hanya menampilkan ember pemain online di room yang sama + NPC |
| Sambar: probing untuk menemukan ikan Secret | Satu ikan hanya bisa diincar sekali; hasil "kena jaring" dan "itu Secret" identik untuk penyambar; tidak ada revert yang bergantung data terenkripsi |
| Sambar membuat cakupan membengkak | Hanya kait yang masuk Must; fitur penuh di belakang gerbang 30 Nov; bekukan fitur 6 Des |

---

## 17. Keputusan terbuka

1. Nama final game dan nama koin.
2. Gaya visual: pixel art 2D (dipilih di v0.2) atau beralih ke 3D.
3. ~~Platform server realtime~~ — **diputuskan 17 Nov: Node `ws` sendiri** (S21). Yang tersisa: tempat hosting tanpa cold start lama.
4. Sumber gambar ikan dan avatar: digambar sendiri, generator AI yang dirapikan, paket CC0, atau campuran.
5. NFT hanya untuk Secret, atau Legenda juga boleh dipamerkan.
6. Angka final kuota Secret dan peluang Musim Demo.
7. Perlu tidaknya cUSDT di MVP.
8. Gambar NFT: data URI on-chain atau aset statis aplikasi.
9. ~~Urutan minggu 3: Sambar Lite atau Tukar Langsung dulu~~ — **diputuskan 17 Nov: Sambar Lite dulu.**
10. Angka final umpan Sambar, biaya jaring, jeda, dan batas, setelah rumus harga dari S17 dan simulasi keseimbangan.
11. Korban butuh jendela bertahan yang pasti (varian "bidik dulu, sambar kemudian")? Default: tidak, satu transaksi.
12. Siapa yang bisa disasar lewat UI: hanya pemain online di room yang sama + NPC (default), atau juga pemain offline lewat Rak Ember.
13. Kebocoran `sell(fishIds)`: terima dan dokumentasikan (default), atau jual bermasker terenkripsi (±7 s lebih lambat).
14. Hadiah jaring: umpan pindah ke korban (default, zero-sum), atau dibakar saja.
15. Jumlah jaring per pemain: 1 (default) atau 2.
16. Nama fitur di UI: "Sambar Ember" atau nama lain yang lebih brainrot.
17. Bahasa UI: usulan default bahasa Inggris (juri internasional) dengan nama ikan bahasa Indonesia plus terjemahan kecil di kartu, misalnya "Teri Ngantuk — Sleepy Anchovy" (ART_BIBLE Addendum A8).

---

## 18. Checklist submission

- [ ] Kontrak ter-deploy dan terverifikasi di Sepolia
- [ ] Demo website live dengan disclaimer terlihat di aplikasi
- [ ] Server realtime live dan bisa menampung minimal 10 pemain
- [ ] Kalau Sambar Lite jadi: keeper Pak Kumis berjalan dan ember NPC terisi
- [ ] Repo publik: kontrak + frontend + server + README (dengan disclaimer) + SPIKE_LOG + ASSETS.md (lisensi aset)
- [ ] Video pitch ≤ 3 menit, orang sungguhan, diunggah ke X (atau YouTube/Loom)
- [ ] Posting/thread X menandai @zama dengan #ZamaDeveloperProgram
- [ ] Nama proyek tanpa kata "Zama"
- [ ] Email submission sama dengan email pendaftaran program
- [ ] Diuji dengan dompet baru dari nol, dan dengan dua pemain bersamaan
- [ ] Form submission diisi sekali (tidak bisa diedit)
