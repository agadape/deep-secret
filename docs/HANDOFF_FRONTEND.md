# Handoff Frontend — Deep Secret

> Untuk: **Dex** (pemegang frontend)
> Dari: tim Deep Secret, 18 November 2026
> Lampiran wajib: [`docs/ART_BIBLE.md`](ART_BIBLE.md), arahan visual. **Baca Addendum di bagian atasnya dulu.**

---

## 1. Proyeknya apa

**Deep Secret** adalah game mancing multiplayer pixel art 2D top-down yang jalan di browser. Dunia game pakai **Phaser 3**, HUD dan menu pakai **React**.

Hal yang bikin beda: **hasil tangkapan, saldo koin, dan sisa kuota ikan Secret dienkripsi di blockchain** (FHEVM, Ethereum Sepolia).

- Pemain lain cuma melihat hasil tangkapanmu sebagai **siluet hitam "???"**.
- Ikan **Secret** yang super langka bisa dipilih untuk **dipamerkan**. Ikan itu lalu jadi NFT 1-dari-1 dan tampil di **Akuarium Publik**.

Ini entri untuk **Zama Developer Program Mainnet Season 5, "Confidential Gaming"**.

| | |
|---|---|
| Deadline | **14 Desember 2026** |
| Hadiah | 5.000 cUSDT |
| Dinilai dari | gameplay/UX, desain kerahasiaan, fairness, fungsi end-to-end di Sepolia, video demo 3 menit dengan orang sungguhan, kualitas kode |

**Aturan lomba yang berlaku juga di frontend:**
- Nama proyek **tidak boleh** mengandung kata "Zama".
- Disclaimer ini **wajib tampil** di app: *"This project is not audited, endorsed or operated by Zama. Use at your own risk."* Teksnya ada di `frontend/src/config.ts` (`DISCLAIMER`).
- Game harus **orisinal**. Boleh terinspirasi game mancing Roblox dan gaya "brainrot", tapi **jangan meniru** nama, karakter, aset, atau tampilan game tertentu.

---

## 2. Pembagian kerja

| Siapa | Pegang apa |
|---|---|
| **Dex (frontend)** | `frontend/`: kode, aset, gaya, animasi, HUD, mobile. Aset baru masuk ke `frontend/public/` atau folder baru di dalam `frontend/`. |
| **Sesi utama** (pemilik repo + Claude lain) | Gameplay, smart contract, server realtime, hal teknis lain |

**Jangan diubah dari sisi frontend:** `contracts/`, `rt-spike/`, `spike-ws/`, `web-spike/`, `GAME_SPEC.md`, `SPIKE_LOG.md`, `docs/SAMBAR_EMBER.md`.

**Butuh sesuatu dari kontrak, server, atau data baru dari chain?** Tulis permintaannya di **`docs/FE_REQUESTS.md`** (buat file-nya kalau belum ada), lalu kabari pemilik repo. Sesi utama yang mengerjakannya.

**Aturan keras:** UI **tidak boleh berbohong** soal blockchain. Tidak boleh ada status palsu, hasil palsu, progress konfirmasi palsu, atau angka "Secret tersisa" palsu.

---

## 3. Bacaan wajib, berurutan

1. **[`docs/ART_BIBLE.md`](ART_BIBLE.md).** Kalau isinya bertentangan dengan Addendum di bagian atas, yang berlaku Addendum. Ringkasan Addendum ada di §4 di bawah.
2. **[`frontend/README.md`](../frontend/README.md):** cara menjalankan, peta kode, mode kunci tes.
3. **[`GAME_SPEC.md`](../GAME_SPEC.md):** §1–§4 (ringkasan, penilaian, pilar, dunia), §6 (mekanik), §7 (**matriks kerahasiaan**), §9 (visual dan aset), §12 (cakupan), §15 (naskah video demo).
4. **[`SPIKE_LOG.md`](../SPIKE_LOG.md)** S12, S13, S19, S20, S22 untuk batas performa (dirangkum di §6 di bawah).

---

## 4. Aturan kerahasiaan yang wajib diikuti di visual (Addendum ART_BIBLE)

| # | Aturan |
|---|---|
| **A1** | **Dua momen terpisah untuk Secret.** (1) *Reveal pribadi* saat tangkap: efek heboh **hanya di layar pemilik**, tanpa sinyal apa pun ke server. (2) *Pengumuman ke semua pemain* **hanya** saat pemilik menekan **Pamerkan** dan event `Flexed` sudah terkonfirmasi di chain. |
| **A2** | Animasi yang dikirim lewat WebSocket **sama untuk semua hasil**: tarik → angkat siluet → selesai, dengan durasi tetap. Pose atau efek khusus Secret hanya diputar lokal. Avatar boleh berpose spesial di depan umum hanya saat Pamerkan. |
| **A3** | **Satu ukuran siluet "???"** untuk semua tangkapan pemain lain, karena ukuran bisa membocorkan berat. Karung "???" fitur Sambar juga cuma satu ukuran. |
| A4 | Rarity: Biasa = netral/aqua lembut, Langka = biru, Epik = ungu, Legenda = gold/oranye, Secret = identitas Void + Cosmic + Energy + Gold. Hijau dipakai hanya untuk status positif. |
| A5 | Resolusi logis **480×270**, diskalakan nearest-neighbor. |
| **A6** | **Font, audio, dan gambar di-host sendiri** di origin yang sama, jangan dari CDN. Header COEP `require-corp` bisa memblokir aset lintas origin. Font pilihan (Nunito, Pixelify Sans, Silkscreen) berlisensi OFL, jadi aman di-host sendiri. |
| A8 | Bahasa UI masih **keputusan terbuka**. Default sementara: UI bahasa Inggris, nama ikan bahasa Indonesia dengan terjemahan kecil di kartu, misalnya "Teri Ngantuk — Sleepy Anchovy". |
| A9 | Efek "Mystery Current" (bayangan besar lewat di air) boleh, asal acak dan kosmetik. **Jangan** kaitkan dengan lemparan pemain atau event chain. |
| A10 | Tidak ada jalur demo palsu. Demo memakai Musim Demo sungguhan (peluang Secret 1/40). |

**Prinsip teknis:** data yang tidak boleh diketahui pemain lain **tidak boleh dikirim** ke client mereka. Jangan cuma menyembunyikannya pakai CSS. Phaser **tidak pernah** menerima data ikan; lihat komentar di `src/game/bus.ts`.

---

## 5. Cara menjalankan

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173 (sinkron ABI + alamat kontrak dulu)
node ../rt-spike/server.mjs      # server presence di :8787 (opsional, game tetap jalan solo)
npm run typecheck                # cek tipe
```

- Buka di **Chrome dengan MetaMask atau Rabby** di jaringan **Sepolia**. Dompet perlu sedikit ETH Sepolia untuk gas.
- Halaman disajikan dengan header COOP `same-origin` + COEP `require-corp` (lihat `vite.config.ts` dan `vercel.json`). **Hanya dompet ekstensi browser** yang didukung; WalletConnect/QR tidak jalan di bawah header ini.

**Uji otomatis:**
- `node frontend/scripts/e2e-ui.mjs` memainkan satu ronde penuh di Chrome headless: connect → jalan ke dermaga → lempar → buka 5 ikan → jual semua. Screenshot tersimpan di `frontend/test-shots/` (di-ignore git).
- `MOBILE=1 LOOK=1` menjalankan versi ukuran HP tanpa transaksi.
- Butuh `frontend/.env.development.local` berisi `VITE_DEV_PRIVATE_KEY`, yaitu kunci Sepolia **sekali pakai** yang sudah diisi sedikit ETH tes. Minta ke pemilik repo atau buat sendiri. **Jangan pernah commit file `.env`.**

---

## 6. Batas performa (dari spike)

| Hal | Angka | Akibat ke desain |
|---|---|---|
| Enkripsi | jalan di **Web Worker**, dunia tetap 60 fps. Dingin ±15 s, hangat ±6 s | Panaskan encryptor di latar setelah dunia tampil |
| Dekripsi 5 ikan | ±7 s, dengan **satu sendatan ±240 ms** | Jadwalkan dekripsi di dalam animasi tarik, supaya sendatannya tidak terasa |
| Izin dekripsi | satu tanda tangan per sesi (±1,8 s) | Setelah itu melihat ikan sendiri tanpa pop-up |
| Header COOP/COEP | wajib | Semua aset dari origin sendiri (A6) |
| Dompet | hanya ekstensi browser | Tidak ada QR/WalletConnect |

**Waktu tunggu blockchain** (lempar, konfirmasi, dekripsi) harus terasa seperti bagian dari permainan, misalnya animasi menunggu yang hidup. Tapi progress-nya **tidak boleh dipalsukan**. Lihat ART_BIBLE §12.

---

## 7. Peta kode `frontend/src/`

| File | Isi |
|---|---|
| `App.tsx` | Layar connect, HUD, overlay reveal kartu ikan, tombol arah HP |
| `ui/Panels.tsx` | Panel ember, toko joran, akuarium, papan verifikasi |
| `ui/FishArt.tsx` | Gambar ikan **placeholder** (digambar dari kode) |
| `game/IslandScene.ts` | Scene Phaser: pulau, avatar, pemain lain, siluet "???" |
| `game/textures.ts` | Tekstur **placeholder** yang digambar dari kode |
| `game/map.ts` | Peta pulau dan zona (tile 16 px) |
| `game/bus.ts` | Event bus React ↔ Phaser. Phaser tidak pernah melihat data ikan |
| `actions.ts` | Semua aksi pemain, dengan teks status yang jujur per tahap transaksi |
| `chain/game.ts` | Semua panggilan ke kontrak, plus retry untuk RPC dan propagasi izin dekripsi |
| `chain/wallet.ts` | Deteksi dompet (EIP-6963) dan kunci dev |
| `net/presence.ts` | Presence multiplayer: posisi, arah, animasi saja, **tidak pernah data ikan** |
| `store.ts` | State global kecil plus toast |
| `fish.ts` | Tier, nama spesies, decode atribut ikan |
| `config.ts` | Alamat RPC, gas, zona, disclaimer |
| `generated/contracts.ts` | ABI dan alamat, **dibuat otomatis** oleh `npm run sync`. Jangan diedit manual |

---

## 8. Kondisi sekarang

**Sudah jalan end-to-end di Sepolia:**
- Masuk dengan dompet, jalan ke dermaga, lempar 5 kail, kartu ikan muncul satu per satu.
- Ember dan Jual Semua, toko joran, akuarium (masih berupa panel).
- Papan verifikasi dengan tombol "Peek", yang membuktikan kita tidak bisa mengintip ikan orang lain.
- Multiplayer dengan siluet "???", dan tampilan HP dengan tombol arah.

**Celah yang diketahui:**
- Semua grafis masih **placeholder dari kode**. Belum ada sprite asli, font yang di-host sendiri, atau suara.
- **Momen reveal Secret** masih sederhana; ART_BIBLE §9 belum dibuat. Ingat A1: reveal saat tangkap hanya di layar pemilik.
- **Akuarium belum tampil di dalam dunia game**, baru di panel. Padahal ART_BIBLE §10 menjadikannya landmark utama.
- Daftar ember baru ter-update **±10 s** setelah lempar, dan belum ada indikator "memperbarui…".
- **Alur Pamerkan dari UI belum pernah dicoba di Sepolia.** Kontraknya sudah lulus tes di mock.

---

## 9. Prioritas yang disarankan

Urutannya usulan; sepakati dulu dengan pemilik repo.

1. **Art pass** (ART_BIBLE §14.2). Kunci gaya dulu dengan **1 avatar, 1 ikan biasa, 1 ikan Secret, dan siluet "???"** di dalam game. Setelah outline, palet, densitas piksel, dan skala terkunci, baru produksi sisanya. Jangan bikin 19 ikan sebelum satu ikan terbukti cocok di game.
2. **Hero moment reveal Secret** di layar pemilik (ART_BIBLE §9), plus **banner Pamerkan** ke semua pemain setelah `Flexed` terkonfirmasi.
3. **Akuarium sebagai landmark** di dalam dunia game (ART_BIBLE §10).
4. **Polish HUD dan mobile:** target sentuh minimal 48 px, indikator "memperbarui…" di ember.
5. *(Belum disetujui)* Mode **"Main langsung"** tanpa pop-up MetaMask: dompet game di browser plus gas dari server. Butuh endpoint dari sesi utama. **Jangan dikerjakan** sebelum pemilik repo bilang ya.

Daftar aset minimum demo dan definisi "selesai" ada di ART_BIBLE §15. Jadwal sprint 10 hari ada di §17.

**Tanggal penting:**
- **30 Nov:** gerbang fitur Sambar Ember (Lite). Sesi utama yang memutuskan; frontend menyusul kalau fiturnya jadi.
- **14 Des:** deadline submit. Sisakan waktu untuk merekam video demo 3 menit (naskah di GAME_SPEC §15).

---

## 10. Cara kerja dan git

- Repo: https://github.com/agadape/deep-secret
- Kerja di **branch sendiri**, lalu buka pull request ke `main`. Jangan push langsung ke `main`.
- Aset dari AI atau paket CC0: catat sumber dan lisensinya di `ASSETS.md` di root repo (file-nya belum ada, buat saat aset pertama masuk). **Jangan** pakai aset, model, atau screenshot dari game Roblox mana pun.
- Sebelum PR: `npm run typecheck` dan, kalau bisa, `node scripts/e2e-ui.mjs`. Lampirkan screenshot perubahan visual.
- Kalau ragu soal kerahasiaan ("apakah ini membocorkan sesuatu?"), cek **GAME_SPEC §7**. Kalau masih ragu, tanya dulu.
