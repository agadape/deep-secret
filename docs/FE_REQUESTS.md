# Permintaan frontend ke sisi kontrak dan server

Ditulis oleh sesi frontend. Setiap butir memuat apa yang dibutuhkan, alasannya, dan apa yang dilakukan frontend sambil menunggu.

## 1. Presence: kenali kunci sesi sebagai pemainnya

**Butuh:** saat `auth`, server menerima `{ address: <pemain>, key: <kunci sesi>, signature }`. Server memeriksa bahwa tanda tangan berasal dari `key` dan bahwa `playerOfKey(key) == address`.

**Kenapa:** server sekarang memverifikasi tanda tangan login terhadap `address`. Di mode MetaMask + kunci sesi, yang menandatangani adalah kunci sesi (supaya tanpa pop-up). Akibatnya frontend terpaksa masuk presence dengan alamat kunci, bukan alamat pemain. Pemain yang sama di dua tab atau dua sesi bisa muncul sebagai dua avatar, dan "satu avatar per alamat" tidak berlaku untuk dompet aslinya.

**Sementara ini:** `frontend/src/actions.ts` (`enterIsland`) masuk presence dengan alamat kunci sesi, sedangkan nama yang tampil tetap nama pemain dari `names(player)`. Begitu server siap, cukup ubah satu baris itu.

## 2. Drip gas untuk demo yang di-host

**Butuh:** server presence yang di-host dengan `DRIP_PRIVATE_KEY` terisi (dompet Sepolia khusus drip), dan `ALLOWED_ORIGIN` diisi origin demo.

**Kenapa:** mode Play now meminta gas ke `POST {RT}/drip`. Di server lokal tanpa kunci, jawabannya `503 drip_disabled`.

**Sementara ini:** frontend menampilkan pesan jujur ("The free gas tap is closed on this server…") beserta alamat tamu untuk diisi dari faucet. Pemain tetap bisa berjalan di pulau. Alamat server dibaca dari `VITE_RT_URL`, dan alamat drip diturunkan darinya (`wss://host/ws` jadi `https://host/drip`).

## 3. ART_BIBLE: tiga aturan untuk gaya Inotia (butuh "ya")

Teknik gambar sekarang mengikuti permintaan Dave (seperti Inotia 4). Alasan dan ukurannya ada di `frontend/DESIGN.md`. Tiga aturan ART_BIBLE yang sengaja dilonggarkan:

| Bagian | Bunyi sekarang | Usulan |
|---|---|---|
| §3.4 | 16 sampai 24 warna inti, shading 1 sampai 2 tingkat | ramp 4 sampai 6 tingkat per bahan, ±60 sampai 90 warna per adegan |
| §2.3 | tanpa dithering atau noise | tekstur klaster yang tertata boleh dipakai di permukaan besar (air, pasir, rumput) |
| §3.2 | avatar 24 sampai 32 px | avatar 34 px |

## Sudah dikerjakan di frontend (info, tidak butuh aksi)

- `frontend/scripts/sync-contracts.mjs` sekarang memakai ABI dari `contracts/deployments/sepolia/*.json` kalau `contracts/artifacts` tidak ada. Akibatnya `npm run dev` jalan di klon baru tanpa harus mengompilasi kontrak dulu, dan hasilnya identik dengan berkas yang sudah di-commit.
