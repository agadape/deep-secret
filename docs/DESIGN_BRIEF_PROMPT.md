# Gambaran Proyek + Prompt Konsultasi Desain Visual

Dokumen ini untuk dilempar ke AI lain (atau desainer) supaya dapat saran soal **gaya visual dan presentasi game**: pixel art, 3D, 2.5D, atau yang lain. Bagian "Prompt siap tempel" di bawah bisa langsung disalin apa adanya. Detail lengkap ada di [GAME_SPEC.md](../GAME_SPEC.md).

---

## Gambaran singkat proyek (untuk dibaca manusia)

- **Nama kerja:** Deep Secret (belum final).
- **Apa:** game mancing santai multiplayer di browser. Lempar kail, tarik ikan, jual, upgrade joran, kejar ikan super langka "Secret".
- **Kenapa spesial:** hasil tangkapan dienkripsi oleh blockchain (teknologi FHE dari Zama). Pemain lain melihat kamu memancing, tapi ikan yang kamu tarik tampil sebagai **siluet hitam "???"**. Jumlah ikan Secret yang tersisa di musim ini juga rahasia ("Secret tersisa: ???"). Ikan Secret bisa "dipamerkan" jadi NFT 1-dari-1 yang berenang di Akuarium Publik.
- **Untuk apa:** lomba Zama Developer Program Season 5 "Confidential Gaming", deadline 14 Desember 2026. Dinilai dari keseruan/UX, desain kerahasiaan, keadilan, fungsi end-to-end, video demo 3 menit, dan kualitas kode.
- **Status:** inti kriptografinya sudah terbukti jalan di testnet. Visual dan game client belum dibuat sama sekali.
- **Pilihan sementara di spec:** pixel art 2D top-down dengan Phaser 3. Ini yang ingin divalidasi atau ditantang.

---

## Prompt siap tempel

```
Kamu adalah art director dan game designer senior yang berpengalaman dengan game web/browser, game Roblox populer, dan game Web3. Saya butuh saran gaya visual dan presentasi untuk game yang sedang saya bangun. Tolong kritis dan jujur; tantang pilihan saya kalau menurutmu salah.

## Tentang game

Nama kerja: "Deep Secret". Game mancing santai multiplayer yang dimainkan di browser (desktop dan HP).

Loop utama (±20–30 detik per putaran):
1. Pemain berjalan di sebuah pulau kecil bersama pemain lain (sampai ±30 orang per server).
2. Berdiri di tepi air, tekan "Lempar": 5 kail dilempar sekaligus.
3. Menunggu ±12–25 detik (ini waktu konfirmasi blockchain, tidak bisa dipercepat). Selama itu avatar duduk memancing, pelampung bergoyang.
4. Menarik ikan satu per satu dengan tap (kosmetik), lalu ikan muncul dengan kartu atribut: jenis, berat, aura.
5. Jual ikan di Pasar, upgrade joran di Toko, buka zona baru (Dermaga → Karang → Palung).
6. Ikan super langka "Secret" (hanya beberapa ekor per musim di seluruh server). Kalau dapat, pemain bisa menyimpannya diam-diam, atau "Pamerkan": ikan dibuka ke publik, banner muncul ke seluruh server, dan ikan berenang di tangki raksasa "Akuarium Publik" lengkap dengan nama pemilik dan nomor seri.
7. Fitur opsional "Sambar Ember": pemain bisa menyambar satu ikan dari ember pemain lain secara buta (isinya tidak kelihatan), tapi pemilik ember bisa memasang jaring rahasia. Hasilnya tetap rahasia; penonton cuma melihat si penyambar membawa karung "???".

Inti tema dan keunikan visual:
- Hasil tangkapan pemain lain SELALU tampil sebagai siluet hitam "???". Ini gambar ikonik game: "kamu lihat orang mancing, tapi nggak tahu dia dapat apa".
- HUD menampilkan "Secret tersisa: ???".
- Momen paling penting untuk video demo: seseorang memamerkan ikan Secret → efek aura besar, banner ke semua pemain, ikan pindah ke Akuarium Publik.

Jumlah konten:
- 19 jenis ikan: 16 biasa sampai legenda (4 tier × 4 jenis), 2 ikan Secret, 1 "Sandal Jepit" (sampah lucu).
- 4 efek aura (contoh: Neon, Galaksi, Api, Hantu) yang bisa menempel di ikan mana pun.
- Avatar pemain dengan variasi warna; animasi jalan, lempar, tarik, angkat ikan, emote.
- 1 pulau dengan 3 zona mancing + 4 bangunan (Pasar Ikan, Toko Joran, Akuarium Publik besar, Papan Verifikasi) + beberapa NPC.
- Gaya humor "brainrot" ala game Roblox yang lagi viral: nama ikan lucu bahasa Indonesia (contoh: Teri Ngantuk, Lele Galau, Hiu Kalkulator, Paus Disko), cepat, rame, gampang dipahami dalam 10 detik.

## Batasan nyata (wajib dipertimbangkan)

- Tim: 1 developer, sekitar 4 minggu tersisa, dan sebagian besar waktu habis untuk smart contract dan integrasi kriptografi. Waktu untuk aset dan client game paling banyak ±1,5 minggu.
- Berjalan di browser yang sudah memuat library kriptografi WASM yang berat; halaman harus tetap ringan dan bisa jalan di HP kelas menengah.
- Setiap aksi penting punya jeda 12–25 detik dari blockchain, plus 4–7 detik untuk membuka hasil. Visual dan animasi harus bisa "menyembunyikan" jeda ini supaya terasa seru, bukan lambat.
- Multiplayer realtime hanya untuk hal kosmetik (posisi, animasi, emote) lewat server WebSocket; semua nilai game ada di blockchain.
- Game harus ORISINAL. Terinspirasi genre game mancing Roblox (misalnya loop seperti "Fish It") dan kasta "Secret" ala game brainrot, tapi tidak boleh meniru nama, karakter, aset, peta, atau tampilan game tertentu.
- Aset boleh dibuat sendiri, dibantu generator gambar AI lalu dirapikan, atau memakai paket berlisensi CC0. Tidak ada budget untuk menyewa artist.
- Juri lomba akan menilai dari video 3 menit dan mencoba game sendirian dengan satu dompet, jadi 30 detik pertama harus langsung terlihat menarik dan jelas.

## Pilihan sementara saya

Pixel art 2D top-down (resolusi dasar 320×180 diskalakan ×4, sprite ikan 32–48 px), engine Phaser 3 di dalam React. Alasan: aset cepat dibuat, ringan, cocok dengan humor brainrot, risiko jadwal rendah. Alternatif yang saya pertimbangkan: 3D low-poly (Three.js / React Three Fiber), 2.5D isometrik, atau 2D vektor/kartun (bukan pixel).

## Yang saya minta darimu

1. Rekomendasi gaya visual utama (pixel 2D, 2D kartun/vektor, isometrik 2.5D, 3D low-poly, atau lainnya) beserta alasannya, dikaitkan dengan batasan di atas. Bandingkan minimal 3 opsi dalam tabel: waktu pembuatan aset, beban di browser/HP, daya tarik di video, kecocokan dengan humor brainrot, risiko jadwal.
2. Engine/library yang kamu sarankan untuk gaya itu, dan kenapa.
3. Cara membuat siluet "???" dan momen "Pamerkan Secret" terlihat ikonik dan mudah diingat (komposisi, warna, animasi, efek, suara).
4. Cara menyamarkan jeda 12–25 detik blockchain lewat animasi dan desain UI supaya terasa seperti bagian dari permainan.
5. Arah art: palet warna, ukuran sprite/model, gaya karakter, gaya UI, font. Sertakan 3–5 referensi game atau gaya yang bisa saya pelajari (sebutkan sebagai referensi gaya saja, bukan untuk ditiru).
6. Pipeline aset tercepat untuk 1 orang: apa yang dibuat manual, apa yang dibantu generator AI, apa yang ambil dari paket CC0, dan cara menjaga semuanya konsisten. Kalau menyarankan generator AI, beri contoh prompt untuk 2 ikan (satu biasa, satu Secret) dan untuk avatar.
7. Daftar aset minimum yang benar-benar dibutuhkan untuk demo 3 menit yang meyakinkan, diurutkan dari yang paling penting.
8. Risiko terbesar dari rekomendasimu dan cara menguranginya.

Jawab dalam bahasa Indonesia, ringkas tapi lengkap, pakai tabel dan poin.
```

---

## Cara pakai

1. Salin seluruh isi blok "Prompt siap tempel" ke AI lain.
2. Kalau AI itu bisa membaca file, lampirkan juga `GAME_SPEC.md` supaya jawabannya lebih tepat.
3. Bawa jawabannya kembali ke sini; nanti kita bandingkan dengan pilihan di spec (§4.1 dan §9) dan putuskan.
