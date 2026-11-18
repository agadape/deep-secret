# Integrasi frontend: main tanpa pop-up (mode tamu + kunci sesi)

Untuk sesi frontend. Bagian kontrak dan server sudah selesai dan teruji di Sepolia (18 Nov 2026); yang tersisa adalah alur masuk di UI. Keputusan pengguna: **bangun dua-duanya**.

## Ringkas

| Mode | Untuk siapa | Pop-up dompet | Pemilik ikan, koin, NFT | Gas dibayar oleh |
|---|---|---|---|---|
| **Play now** (tamu) | Juri dan pemain tanpa dompet | **0** | Dompet tamu di browser | Server (endpoint `/drip`) |
| **Connect MetaMask** + kunci sesi | Pemain yang mau aset di dompetnya sendiri | **1 transaksi** (`authorizeSession`) per sesi | Dompet MetaMask pemain | Kunci sesi, diisi ETH oleh pemain di transaksi yang sama |

Di kedua mode, semua aksi game (klaim, lempar, buka ikan, jual, upgrade joran, pamer) dikirim oleh kunci lokal dari browser, tanpa pop-up.

## Kontrak baru (Sepolia)

Alamat dan ABI sudah disinkronkan ke `frontend/src/generated/contracts.ts` (`npm run sync`, otomatis saat `npm run dev`).

| Kontrak | Alamat |
|---|---|
| DeepSecretGame | `0x6da1646B1cA6f41Ee163b77E290482d6B055799d` |
| PearlCoin | `0xdE587F7D525B015654e8922FDB49C6A753D7aDc6` |
| SecretFishNFT | `0x4FB9b6Dc3d861b01AaBd714DbBA0A0AD001698Fb` |

Deployment lama (`0x2C25…`) ditinggalkan; data di sana tidak terbawa.

Fungsi baru di `DeepSecretGame`:

| Fungsi | Dipanggil oleh | Isi |
|---|---|---|
| `authorizeSession(address key, uint64 expiresAt)` payable | Dompet pemain (MetaMask) | Mendaftarkan kunci sesi (maks. 7 hari). ETH yang dikirim diteruskan ke kunci untuk gas. Kunci langsung bisa membaca 40 ikan terbaru di ember dan saldo Mutiara pemain. |
| `revokeSession()` | Dompet pemain | Mencabut kunci. |
| `sessionOf(address player)` view | Siapa saja | `{ key, expiresAt }` |
| `activeKeyOf(address player)` view | Siapa saja | Kunci yang masih berlaku, atau `0x0`. |
| `playerOfKey(address key)` view | Siapa saja | Pemain pemilik kunci. |

Semua aksi lama (`claimStarter`, `setName`, `cast`, `sell`, `requestRodUpgrade`, `flex`) sekarang otomatis bertindak **atas nama pemain** kalau dipanggil oleh kunci sesinya: ikan dicatat milik pemain, koin dipotong dan ditambahkan ke saldo pemain, event memuat alamat pemain. `finalizeRodUpgrade` dan `finalizeFlex` memang sudah bisa dikirim siapa saja.

Error baru: `SessionExpired(address key)` saat kunci yang kedaluwarsa dipakai (minta otorisasi ulang), `BadSession()` saat parameter tidak aman.

## Alur 1 — Play now (tamu)

1. Buat atau muat kunci tamu: `generatePrivateKey()` dari `viem/accounts`, simpan di `localStorage` (contoh kunci: `deepsecret.guestKey`). Tampilkan peringatan singkat: "Dompet tamu tersimpan di browser ini. Menghapus data situs = kehilangan ikan." Tawarkan tombol "Export key".
2. `startSession(privateKeyToAccount(key), account.address)` — jalur akun lokal ini sudah ada di `src/chain/game.ts` (dipakai mode kunci dev).
3. Minta gas: `POST {RT_HTTP}/drip` dengan body `{"address": "0x…"}`. `RT_HTTP` = `RT_URL` dengan `ws` → `http` dan tanpa `/ws` (contoh `http://localhost:8787`). Jawaban:
   - `{"status":"sent","tx":"0x…"}` — tunggu sampai saldo > 0 (poll `getBalance` tiap 2–3 s, maks. ±60 s).
   - `{"status":"pending","tx":…}` — permintaan sebelumnya masih diproses; tunggu saja.
   - `{"status":"enough"}` — saldo sudah cukup.
   - `429 address_limit / ip_limit`, `503 daily_budget_spent / drip_disabled` — tampilkan pesan ramah + tautan faucet.
4. Lanjutkan seperti biasa (izin dekripsi dan login presence ditandatangani diam-diam oleh kunci lokal).

Server mengisi 0,0002 ETH per alamat (cukup untuk puluhan lemparan), maksimal 3× per alamat dan 5× per IP per hari, dengan anggaran harian 0,02 ETH.

## Alur 2 — Connect MetaMask + kunci sesi

1. Hubungkan MetaMask seperti sekarang (`requestAccount`).
2. Muat kunci sesi untuk pemain ini dari `localStorage` (contoh `deepsecret.session.<player>`). Baca `sessionOf(player)`:
   - Kalau `key` sama dengan kunci tersimpan dan `expiresAt` masih > sekarang + 10 menit → pakai langsung, **tanpa pop-up**.
   - Kalau tidak → buat kunci baru, lalu kirim **satu** transaksi dari MetaMask: `authorizeSession(key, now + 24 jam)` dengan `value` 0,0003 ETH. Tampilkan teks: "Satu konfirmasi untuk sesi 24 jam — setelah itu main tanpa pop-up."
3. Buat sesi dengan **akun kunci** untuk mengirim transaksi dan menandatangani izin dekripsi, tapi **alamat pemain** untuk semua bacaan: `player(player)`, `fishIdsOf(player)`, `confidentialBalanceOf(player)`, `names(player)`. Di `src/chain/game.ts` ini berarti `startSession(keyAccount, playerAddress)` dengan `session.address = playerAddress` (sudah begitu bentuknya) dan `session.account = keyAccount`.
4. Dekripsi lewat SDK yang dibangun dengan wallet client kunci: kontrak sudah memberi kunci izin ACL atas ikan baru, 40 ikan terbaru di ember, dan saldo. Ikan yang lebih lama dari itu masih bisa dibuka dengan izin dari MetaMask (tanda tangan, bukan transaksi) — kasus langka.
5. Tangani `SessionExpired`: tawarkan "Perpanjang sesi" (ulangi langkah 2).

## Angka teknis yang perlu dipakai

| Hal | Nilai | Catatan |
|---|---|---|
| Gas `cast` | **15.000.000** (sudah di `config.ts`) | Lemparan oleh kunci sesi terukur 12,5–13,2 juta di Sepolia |
| Fee | `maxFeePerGas` 200.000 wei, `maxPriorityFeePerGas` 100.000 wei | Base fee Sepolia ±20 wei; biaya per lemparan < 0,000003 ETH |
| Nonce kunci lokal | Simpan dan naikkan sendiri di klien | RPC publik bisa melaporkan nonce lama tepat setelah transaksi |
| Saldo kunci baru | Tunggu sampai terlihat > 0 sebelum transaksi pertama | Node RPC yang tertinggal bisa menjawab 0 |
| Dekripsi tepat setelah transaksi | Sudah di-retry (`not entitled`) | Jaringan dekripsi butuh beberapa detik untuk melihat izin baru |

Catatan Sepolia hari ini: membuat akun baru atau slot storage baru jauh lebih mahal daripada dulu (kirim ETH ke alamat baru ±207 ribu gas, bukan 21 ribu). Jangan memakai `gas: 21000` untuk transfer ke kunci baru; biarkan diestimasi.

## Bukti di Sepolia

- `authorizeSession`: tx `0x162950b34c28e704ec5b5b140234c977f743d1c4d02247de681e533c1d3d350e`
- Lemparan oleh kunci sesi: tx `0x770d45b004c0feac8778512c243f898bf8e7f5cd905a86c372b7de5970401978` — event `Cast` memuat alamat pemain, kunci berhasil membuka kelima ikan
- Jual oleh kunci sesi: tx `0x7e420e9747ff39afb46f3c5bec42a844288fd8aaccb3411eb4395f895f624e8f`; kunci membaca saldo pemain (677)
- Pamerkan Secret pertama di Sepolia: `flex` `0x6958ccfd6ead0b3251a9dfd079a1530c3113fc1f52d0351da5109293ed40f030`, `finalizeFlex` `0x6fd9680effb4f0cb5b8fd336724088053e2c8d258cd0c49b38bef3e450ae9d84` → NFT #1 "Ratu Palung - Secret #1"
- Drip ke alamat tamu baru: tx `0xe717168897bd255048da74ae0eeae967af9b82c68c80e27776ddbbfd5c9be81d` (dua permintaan bersamaan hanya dibayar sekali)
