# Sambar Ember — Rancangan Fitur

> Dokumen pendamping [GAME_SPEC.md](../GAME_SPEC.md) §6.12. Status: **draf v0.1 — 16 November 2026**, digabung ke GAME_SPEC v0.3 pada 17 November 2026 (keputusan terbuka #1 diputuskan: Sambar Lite dulu).
> Dasar teknis: [SPIKE_LOG.md](../SPIKE_LOG.md) (S3, S5, S7, S9, S10, S14). Dasar pola pemenang: [laporan riset](../reports/Web3%20hackathon%20gaming%20winners%202026.md), bagian "Winners share one legible secret".

---

## 0. Ringkasan satu layar

**Satu kalimat:** kamu bisa nyolong satu ikan dari ember pemain lain, tapi kamu nggak tahu isinya, nggak tahu di mana jaringnya, dan orang lain nggak tahu kamu berhasil atau cuma dapat sandal jepit.

| | |
|---|---|
| Aksi | Datangi ember pemain/NPC → pilih satu siluet "???" → **Sambar** (1 transaksi, ±12 s) |
| Biaya | Umpan Sambar 10 Mutiara (Musim Demo: 5) |
| Hasil | Penyambar selalu dapat satu "karung ???". Isinya ikan curian **atau** Sandal Jepit. Cuma penyambar yang bisa buka. |
| Pertahanan | Jual cepat, **Jaring Rahasia** (posisi terenkripsi), ikan Secret kebal otomatis, ikan baru "masih basah", satu ikan cuma bisa diincar sekali, batas per korban, perisai pemula |
| Kalau kena jaring | Umpan penyambar pindah ke pemilik ember. Penyambar cuma lihat "Sandal Jepit" — nggak tahu itu jaring atau ikan Secret. |
| Kenapa butuh FHE | Jaring tetap bekerja walau pemiliknya offline, tanpa server yang tahu posisinya. Hasil sambar memindahkan nilai tanpa ada yang tahu nilainya pindah atau tidak. |
| Rekomendasi | **Bukan MVP.** Pasang "kait" kecil di kontrak Must sekarang (±0,5 hari), lalu bangun **Sambar Lite** 1–5 Des **hanya kalau** alur Must sudah jalan end-to-end di Sepolia per 30 Nov. Detail di §9. |

Beda dengan inspirasi (game brainrot mencuri): di sana kamu lihat barangnya lalu lari bawa pulang. Di sini justru kebalikannya — **kamu buta**, korbannya punya jebakan tak terlihat, dan hasilnya tetap rahasia setelah terjadi. Intinya taruhan dan gertakan, bukan kejar-kejaran.

---

## 1. Aturan main

### 1.1 Isi ember

- **Ember** = semua ikan milik pemain yang belum dijual, belum dipamerkan, dan tidak sedang ditawarkan (`Fish.state == 0`, sama dengan spec §10.1).
- Jumlah record di ember itu publik (memang sudah publik dari event `Cast`). Isinya tidak.
- Karena Sambar selalu membuat record baru untuk penyambar (bisa berisi Sandal Jepit) dan bisa mengosongkan slot korban menjadi Sandal Jepit, **jumlah record di ember tidak lagi mencerminkan kekayaan**. Ini efek samping yang bagus untuk kerahasiaan.

### 1.2 Siapa bisa menyambar siapa

Semua dicek **plaintext di kontrak** (supaya adil dan bisa diverifikasi). Jarak antar-avatar di dunia **tidak** dicek di kontrak (posisi tidak dipercaya, spec §4.2); jarak hanya aturan UI.

| Syarat | Penyambar | Korban |
|---|---|---|
| Sudah klaim starter | ✔ | ✔ |
| Jumlah lemparan | ≥ 2 (belajar mancing dulu) | ≥ 5, kecuali perisai sudah pecah (§1.6) |
| Bukan diri sendiri | ✔ | — |
| Jeda pribadi | 1 sambaran per 120 s | Setelah diincar, aman 90 s |
| Jeda pasangan A→B | 10 menit (searah: B boleh langsung balas dendam ke A) | — |
| Batas per jam | — | Maksimal 3 kali diincar per jendela 60 menit |
| Isi ember | — | ≥ 3 record |
| Ikan sasaran | — | `state == 0`, milik korban, umur ≥ 30 s ("masih basah"), belum pernah diincar |

NPC (§5) dikecualikan dari jeda pasangan, batas per jam, dan syarat jumlah lemparan korban.

### 1.3 Biaya dan hasil

1. Penyambar memilih korban dan **satu `fishId`** dari embernya. Pilihan ini publik (wajib, karena aturan di atas dicek plaintext), tapi isinya tetap "???".
2. Kontrak membakar Umpan Sambar dari saldo terenkripsi penyambar. Pola S10: transfer kurang saldo jadi 0, bukan revert → bit `paid`.
3. Kontrak menghitung secara terenkripsi:
   - `hit` = jaring korban ada di ikan ini
   - `success` = `paid` **dan** bukan `hit` **dan** ikan bukan Secret
4. Kontrak **selalu** membuat record ikan baru milik penyambar:
   - isi = `success ? ikan korban : Sandal Jepit`
5. Record korban diganti handle baru:
   - isi = `success ? Sandal Jepit : ikan semula` (lucu: si maling ninggalin sandal di embermu)
6. Kontrak **selalu** mencetak Mutiara ke korban sejumlah `(paid && hit) ? umpan : 0`. Umpan penyambar yang kena jaring pindah ke korban; dalam kasus lain umpan terbakar.
7. Ikan sasaran ditandai `targeted = true`: tidak bisa diincar lagi selamanya.

Hasil: total nilai **zero-sum** (tidak ada koin baru dicetak dari Sambar), jadi tidak bisa dipakai farming lewat akun kedua (§7).

### 1.4 Ikan Secret: kebal, dan kebalnya tidak kelihatan

**Keputusan: ikan Secret tidak bisa disambar.** Alasannya:

- Secret itu mahkota game. Kehilangan Secret gara-gara sambaran buta seharga 10 koin rasanya terlalu jahat, terutama untuk juri yang baru dapat Secret di Musim Demo lalu belum sempat pamer.
- Secret terhubung ke kuota musim dan NFT bernomor seri. Kalau bisa pindah tangan lewat curian, alur pamer dan provenance jadi rumit.
- Spec §6.10 menjanjikan "Simpan diam-diam: tidak ada yang bisa mengincar pemiliknya." Sambar tidak boleh mematahkan janji itu.

Tapi kekebalan ini **tidak boleh jadi detektor Secret**. Karena itu:

- Sambaran ke ikan Secret menghasilkan hal yang **persis sama** dengan kena jaring: penyambar dapat Sandal Jepit. Penyambar tidak bisa membedakan "kena jaring" dan "itu ikan Secret".
- Umpan dalam kasus Secret terbakar (tidak ke korban). Penyambar tidak bisa melihat saldo korban, jadi tetap tidak bisa membedakan.
- Satu ikan cuma bisa diincar sekali (§1.2), jadi tidak bisa "diuji berkali-kali" sampai ketahuan (lihat serangan probing di §7).
- Kontrak tidak pernah revert berdasarkan data terenkripsi (memang tidak bisa di FHEVM). Kalau kita pakai flag Secret publik lalu revert, `eth_call` akan jadi alat deteksi Secret gratis.

### 1.5 Pertahanan pemilik ember

| Pertahanan | Cara kerja | Biaya | Catatan |
|---|---|---|---|
| **Jual cepat** | Tombol "Jual Semua" di panel ember, bisa dipakai di mana saja (bukan cuma di Pasar Ikan) | Gratis | Kontrak memang tidak bisa memaksa pemain berada di pasar, jadi lebih jujur kalau UI-nya juga membolehkan. Pasar Ikan tetap ada sebagai tempat dan NPC. |
| **Jaring Rahasia** | Pemilik memilih satu ikan di embernya; ID ikan itu dikirim sebagai **input terenkripsi** (S3). Kontrak menyimpan `netFish` terenkripsi. | 5 Mutiara per pasang (Demo: 3) | Satu jaring per pemain. Jaring bisa dipindah kapan saja. Boleh dipasang di ID mana pun, termasuk Sandal Jepit atau ID ngawur, untuk **gertakan**. |
| **Secret kebal** | Otomatis, tak terlihat (§1.4) | — | — |
| **Ikan masih basah** | Ikan berumur < 30 s tidak bisa diincar | — | Memberi waktu melihat hasil tarikan (±6 s) dan menjual sebelum ada yang menyambar. |
| **Satu ikan, satu kali** | Setelah diincar (berhasil atau gagal), ikan itu kebal selamanya | — | Mematikan probing dan membatasi kerugian. |
| **Batas korban** | Jeda 90 s setelah diincar, maksimal 3 per jam | — | Kerugian saat offline paling banyak 3 ikan per jam. |

Transaksi `setNet` itu sendiri publik (siapa pun bisa lihat alamat pengirim dan fungsinya). Daripada disembunyikan, kita jadikan bagian permainan: ember yang pernah dipasangi jaring menampilkan ikon jaring **"🕸️ ada jaring... di mana ya?"** — padahal bisa saja jaringnya dipasang di sandal.

### 1.6 Perisai pemula

- Pemain dengan kurang dari 5 lemparan tidak bisa diincar.
- Perisai **pecah lebih awal** kalau pemain itu menyambar pemain lain (menyambar NPC tidak memecahkan perisai). Ini menutup celah "akun baru kebal tapi boleh mencuri".
- Status perisai publik dan tampil sebagai gelembung tipis di sekitar ember.

### 1.7 Parameter per musim (publik, terkunci, tampil di Papan Verifikasi)

| Parameter | Musim Demo | Musim Normal |
|---|---|---|
| Umpan Sambar | 5 | 10 |
| Biaya Jaring Rahasia | 3 | 5 |
| Jeda penyambar | 45 s | 120 s |
| Jeda pasangan A→B | 3 menit | 10 menit |
| Jeda korban setelah diincar | 60 s | 90 s |
| Maksimal diincar per jam | 4 | 3 |
| Ikan masih basah | 20 s | 30 s |
| Lemparan minimum penyambar | 2 | 2 |
| Perisai pemula (lemparan) | < 3 | < 5 |
| Isi ember minimum korban | 3 | 3 |

Aturan keseimbangan yang dipegang saat menyetel angka: **nilai harapan Sambar per koin harus selalu lebih kecil daripada nilai harapan Lempar per koin** (§7.1). Sambar itu bumbu dan jackpot, bukan cara utama cari duit.

---

## 2. Matriks kerahasiaan khusus Sambar

| Data | Siapa yang bisa lihat | Kapan dibuka publik | Kenapa |
|---|---|---|---|
| Isi tiap ikan di ember (jenis, berat, aura, harga, `isSecret`) | Pemilik | Hanya kalau Secret dipamerkan | Kalau publik, semua orang langsung nyambar ikan termahal; taruhan buta hilang |
| Jumlah record di ember | Semua | Selalu | Perlu untuk UI; sudah publik dari `Cast`. Tidak akurat sebagai ukuran kekayaan karena ada record Sandal Jepit |
| Posisi Jaring Rahasia (`netFish`) | Pemilik | Tidak pernah | Jaring yang kelihatan tidak akan pernah diinjak |
| Fakta bahwa pemain pernah memasang jaring | Semua | Selalu (tx publik) | Tidak bisa disembunyikan; dijadikan gertakan |
| Target sambaran (korban + `fishId`) | Semua | Saat transaksi | Perlu supaya aturan anti-grief bisa dicek publik |
| Hasil sambaran (dapat ikan atau sandal) | Penyambar (record barunya), korban (slotnya sendiri + saldo) | Tidak pernah | Penonton tidak tahu siapa untung; penyambar bisa menggertak |
| Alasan gagal (jaring / Secret / umpan tidak terbayar) | Korban saja | Tidak pernah | Supaya Sambar bukan detektor Secret dan bukan detektor jaring |
| Umpan yang pindah ke korban | Korban (lewat saldo terenkripsi) | Tidak pernah | Event mint tetap dipancarkan setiap kali, nilainya bisa 0 |
| Jeda, perisai, hitungan diincar, flag `targeted` | Semua | Selalu | Keadilan dan anti-grief harus bisa dicek |
| Emote reaksi setelah sambar (😎 / 😭 / 🤫) | Semua di room | Kosmetik, tidak terverifikasi | Lapisan gertakan sosial; server tidak tahu hasilnya |

### 2.1 Kenapa fitur ini rusak kalau state-nya publik

1. **Isi ember publik** → semua orang menyambar Legenda yang sama, pemegang ikan langka jadi sasaran keroyokan, dan ember berisi ikan biasa tidak pernah disentuh. Bukan taruhan lagi, cuma antre ngambil barang.
2. **Posisi jaring publik** → tidak ada yang menginjaknya. Jaring jadi hiasan.
3. **Hasil sambaran publik** → setiap kegagalan membocorkan "di sini ada jaring atau Secret". Ditambah beberapa percobaan, ikan Secret dan jaring bisa dipetakan.
4. **Commit-reveal untuk jaring** → pemilik harus online untuk me-reveal posisi jaring saat diserang. Pemilik offline = tanpa pertahanan, atau reveal-nya bisa ditinggalkan. Dengan FHE, kontrak mengecek jaring **secara buta** walau pemiliknya sedang tidur.
5. **Server game yang tahu isi dan jaring** → server (atau orang dalam) bisa membocorkan ember gemuk ke temannya. Di Deep Secret, server realtime cuma tahu "Budi sedang berdiri di depan ember Sari".

Kalimat untuk README dan video: **"Jaringmu tetap bekerja waktu kamu offline, dan tidak ada satu pun — termasuk kami — yang tahu di mana kamu memasangnya."**

---

## 3. Rancangan kontrak

### 3.1 Tempat kode

- Sambar butuh akses ke handle ikan (`packed`, `price`, `isSecret`). Kalau dibuat kontrak terpisah, setiap `cast()` harus memanggil `FHE.allow(handle, sambarContract)` untuk 5 ikan × 3 handle — boros gas dan rumit.
- **Rekomendasi:** modul `abstract contract SambarModule` yang diwarisi `DeepSecretGame` (satu alamat, ACL sederhana).
- Kalau `DeepSecretGame` melewati batas ukuran 24 KB: pindahkan logika ke library eksternal yang dipanggil lewat `delegatecall`, sehingga konteks ACL tetap alamat kontrak game. Perilaku ACL di `delegatecall` perlu diverifikasi (spike S24, §10).

### 3.2 Perubahan struktur data (kait yang dipasang di Must)

```solidity
struct Fish {
    address owner;
    uint32  season;
    uint64  caughtAt;   // BARU: untuk aturan "masih basah" (waktu tangkap sudah publik dari event Cast)
    euint32 packed;     // jenis | aura | berat | tier; 0 = Sandal Jepit
    euint64 price;      // 0 untuk Sandal Jepit
    ebool   isSecret;
    uint8   state;      // 0 ember, 1 terjual, 2 dipamerkan, 3 ditawarkan
    uint8   origin;     // BARU: 0 lempar, 1 hasil sambar, 2 ikan NPC (publik)
    bool    targeted;   // BARU: sudah pernah diincar → kebal selamanya
}

struct PlayerState {
    uint16  castCount;        // BARU: dinaikkan di cast()
    uint32  emberCount;       // BARU: jumlah record state 0 (publik)
    bool    shieldBroken;     // pecah kalau pemain menyambar pemain lain
    uint64  lastSnatchAt;     // sebagai penyambar
    uint64  lastTargetedAt;   // sebagai korban
    uint64  windowStart;      // awal jendela 60 menit sebagai korban
    uint8   targetedInWindow;
    euint32 netFish;          // fishId yang dijaring; 0 = tidak ada (terenkripsi)
}

mapping(address => PlayerState) public players;          // handle netFish hanya bisa didekripsi pemilik
mapping(address => mapping(address => uint64)) public lastPairSnatch; // penyambar → korban
```

Catatan:
- `fishId` disimpan dan dibandingkan sebagai `uint32` di dalam FHE (cukup untuk 4 miliar ikan).
- `sell()` harus aman menerima record Sandal Jepit (harga 0). Ini juga kait yang perlu ada di Must.
- NPC memakai alamat cadangan yang tidak punya kunci, misalnya `address(uint160(0xF15A0001))` untuk Pak Kumis.

### 3.3 Fungsi

| Fungsi | Isi |
|---|---|
| `snatch(address victim, uint256 fishId)` | Cek semua aturan plaintext (§1.2), bakar umpan, hitung `hit`/`success` terenkripsi, buat record baru untuk penyambar, ganti handle record korban, cetak umpan ke korban (nilai bisa 0), tandai `targeted`, perbarui jeda. Satu transaksi. |
| `setNet(externalEuint32 encFishId, bytes proof)` | Bakar biaya jaring; `netFish = select(paid, inputBaru, netFishLama)`. Tidak memvalidasi bahwa ID itu milik pemanggil (jaring di ID asing = gertakan yang sah, tidak merugikan siapa pun). |
| `restockNpc(uint8 npcId)` | Permissionless. Hanya jalan kalau ember NPC < 3 record dan jeda restock lewat. Kocok 6 ikan dari tabel NPC (tanpa Secret, tidak menyentuh kuota), lalu pasang jaring NPC acak. |
| `sell(uint256[] fishIds)` (sudah ada) | Ditambah: kurangi `emberCount`; aman untuk Sandal Jepit. |
| `cast(uint8 zoneId)` (sudah ada) | Ditambah: `castCount++`, `emberCount += 5`, isi `caughtAt`. |

### 3.4 Sirkuit `snatch()`

```
 bait  = asEuint64(UMPAN)                                   [trivial]
 sent  = PearlCoin._burn(thief, bait)   ──► ge, sub, select, select, sub   (kedalaman ≤3)
 paid  = eq(sent, UMPAN)                                     (4)
 hit   = eq(netFish[victim], fishId)                         (1)
 safe  = and(not(hit), not(isSecret))                        (2–3)
 ok    = and(paid, safe)                  = success          (5)
 caught= and(paid, hit)                                      (5)
 thief.packed = select(ok, packed, 0)  │
 thief.price  = select(ok, price, 0)   │ 4 select paralel    (6)
 vict.packed  = select(ok, 0, packed)  │ (handle baru → ACL bersih)
 vict.price   = select(ok, 0, price)   │
 thief.isSecret = asEbool(false)                             [trivial]
 reward = select(caught, bait, 0)                            (6)
 PearlCoin._mint(victim, reward)        ──► add, ge, select, select, add   (≤9–10)
 ACL: allowThis × semua handle baru; allow(thief, record baru); allow(victim, record korban)
```

| Ukuran | Perkiraan |
|---|---|
| Operasi FHE | ±27–30 (termasuk ±10 di dalam `_burn`/`_mint` ERC-7984 dan 3–4 enkripsi trivial) |
| Kedalaman berurutan | **±9–10** dari batas ±25 (S7) |
| Gas | ±2,0–2,8 juta (pembanding: S4 1,14 jt untuk ±16 operasi; S9 stake 1,54 jt). Dengan `gasPrice` dipatok (S16) biayanya sepele di Sepolia |
| Waktu yang dirasakan | ±12 s konfirmasi + ±4 s dekripsi 1 nilai (S13) |

Perkiraan isi `_burn`/`_mint` didasarkan pada pola `FHESafeMath.tryDecrease/tryIncrease` di OpenZeppelin confidential-contracts 0.5.3; angka pastinya diukur di spike S23.

**Jejak yang seragam.** Setiap `snatch()` yang lolos cek plaintext selalu: membakar, mencetak (bisa 0), membuat satu record baru, mengganti dua handle korban, dan memancarkan event yang sama. Eksekusi FHE di chain bersifat simbolik, jadi gas juga tidak bergantung nilai terenkripsi. Penonton yang membaca explorer tidak bisa membedakan berhasil dan gagal. Ini perlu test khusus (§3.7). (Pengecualian: kalau korbannya NPC, mint tidak pernah dipanggil sama sekali — konsisten untuk semua sambaran ke NPC, jadi tetap tidak membocorkan hasil.)

### 3.5 Sirkuit `setNet()` dan `restockNpc()`

| Fungsi | Operasi FHE | Kedalaman | Gas (perkiraan) | Catatan |
|---|---|---|---|---|
| `setNet` | ±8 (verifikasi input, ±5 burn, `eq`, `select`) | ±5 | ±1,2–1,6 jt (S3: input terenkripsi 566 rb) | Waktu terasa ±7 s enkripsi di browser dengan COOP/COEP + ±12 s konfirmasi (S12). Jarang dilakukan, jadi masih wajar |
| `restockNpc` | ±55–65 (6 ikan × logika kocok `cast` tanpa kuota dan tanpa bayar, + 3 untuk jaring) | ±8 | ±3–5 jt | Jaring NPC: `netFish = firstId + asEuint32(randEuint8(8))` → 6 dari 8 nilai mengenai ikan, jadi 75% kemungkinan ember NPC berjaring. Kalau gas terlalu mahal, turunkan ke 4 ikan dengan `randEuint8(8)` (50% berjaring) |

`restockNpc` memakai ulang fungsi internal pengocok ikan dari `cast()` dengan tabel NPC (ambang Secret = 0), jadi tidak menambah logika baru yang perlu diuji terpisah.

### 3.6 Event publik

| Event | Isi | Tidak memuat |
|---|---|---|
| `Snatched(address thief, address victim, uint256 targetFishId, uint256 newFishId)` | Siapa, ke siapa, ikan mana, record baru mana | Hasil, isi ikan, alasan gagal |
| `NetSet(address owner)` | Pemain memasang/memindah jaring | Posisi jaring |
| `NpcRestocked(uint8 npcId, uint256 firstFishId, uint8 count)` | NPC dapat ikan baru | Isi ikan, posisi jaring NPC |
| `ShieldBroken(address player)` | Perisai pemula pecah | — |
| `ConfidentialTransfer` dari PearlCoin (sudah ada di ERC-7984) | Burn dan mint selalu terjadi | Jumlah |

### 3.7 Test yang wajib ada

1. Aturan plaintext: setiap syarat di §1.2 punya test revert sendiri.
2. Kebenaran hasil di mock: 4 kombinasi (`paid`, `hit`, `isSecret`) × hasil yang diharapkan untuk record penyambar, record korban, dan saldo kedua pihak.
3. **Keseragaman jejak:** untuk sambaran berhasil vs gagal, daftar event, jumlah record baru, dan handle yang berubah identik.
4. **ACL:** korban tidak bisa mendekripsi record baru penyambar; penyambar tidak bisa mendekripsi `netFish` korban atau record korban (dipakai juga untuk tombol "Coba intip" di demo).
5. Zero-sum: total suplai Mutiara setelah sambaran = sebelum dikurangi umpan yang terbakar.
6. Simulasi keseimbangan: 10.000 sambaran di mock untuk memeriksa nilai harapan di §7.1.

---

## 4. Tampilan di dunia pixel art

### 4.1 Objek baru

| Objek | Wujud |
|---|---|
| Ember pemain | Sprite ember di samping avatar yang sedang mancing, 3 tingkat isi (sedikit / sedang / penuh) dari `emberCount`. Ekor ikan yang menyembul semuanya siluet hitam yang sama, ukurannya seragam (berat tidak boleh bocor lewat ukuran sprite). |
| Ikon jaring | 🕸️ kecil di bibir ember kalau pemiliknya pernah `setNet`. Tidak menunjuk slot mana pun. |
| Gelembung perisai | Lingkaran tipis di sekitar ember pemain baru. |
| Ember Pak Kumis | Ember NPC besar di ujung Dermaga, dengan papan "Ember Pak Kumis — sambar kalau berani". |
| Karung "???" | Sprite karung goni dengan tanda tanya, dibawa penyambar setelah transaksi selesai. |

### 4.2 Alur satu sambaran

| Tahap | Penyambar | Korban | Penonton |
|---|---|---|---|
| Mendekat | Jalan ke ember (UI hanya mengaktifkan tombol kalau dekat) dan tekan **E: Sambar (10 🦪)**. Panel ember terbuka: deretan siluet "???", ikan basah bertanda tetes air 💧 dan terkunci, ikan yang pernah diincar bertanda mata 👁️ dan tidak bisa dipilih. | Tanda **"!"** di atas kepala + suara lonceng ember (sinyal kosmetik dari server, dikirim saat penyambar mengirim transaksi). | Lihat penyambar jongkok di depan ember. |
| Menunggu ±12 s | Animasi kail dicelup ke ember, ember bergoyang, meteran tegang. | Ada kesempatan refleks: tekan **Jual Semua** di panel ember. Kalau transaksi jual masuk lebih dulu, sambaran revert dan umpan penyambar tidak terbakar. Ini balapan, bukan jaminan. | Kail di ember, ember bergoyang. |
| Terkonfirmasi | Avatar menarik **karung "???"** — animasinya sama persis apa pun hasilnya. Klien mendekripsi record baru (±4 s), lalu menampilkan kartu ikan atau **"SANDAL JEPIT 🩴"** dengan efek terompet sedih, hanya di layar penyambar. | Klien membaca event `Snatched`, mendekripsi slot sendiri dan saldo, lalu menampilkan salah satu: "Kakap Sultan-mu disambar Budi! Dia ninggalin sandal jepit." / "JARINGMU KENA! Umpan Budi jadi milikmu (+10 🦪)." / "Budi gagal nyambar embermu." | Feed kecil: "🪝 Budi menyambar ember Sari — hasilnya ???". Karung "???" di punggung Budi. |
| Setelahnya | Pilih emote: 😎 / 😭 / 🤫. Bebas menggertak — server tidak tahu yang sebenarnya. | Tombol cepat: "Pindahkan jaring", "Jual Semua", "Balas dendam" (jeda pasangan berlaku searah, jadi balasan boleh langsung). | Lihat emote, menebak-nebak sendiri. |

Server realtime cuma menyiarkan status animasi (`snatch_start`, `snatch_end`) dan meneruskan event publik `Snatched`. Server tidak pernah tahu hasil, sesuai spec §4.4 dan §10.3.

### 4.3 Supaya tetap seru untuk juri yang main sendirian

Pola pemenang: juri harus bisa main sendiri (laporan riset, "A judge can play alone"). Rencananya:

1. **Ember Pak Kumis (on-chain, masuk Sambar Lite).** NPC dengan ember sungguhan di kontrak: 6 ikan dari tabel NPC (dicetak di Papan Verifikasi, tanpa Secret) dan jaring acak dari chain. Setelah 2 lemparan, juri mendapat tugas: **"Coba sambar ember Pak Kumis!"** Satu transaksi, karung "???", dibuka: dapat ikan, atau Sandal Jepit sambil Pak Kumis mengacungkan sapu dan mengejar sebentar (animasi lokal dipicu hasil dekripsi juri sendiri).
   - Restock: `restockNpc` bisa dipanggil siapa pun. Keeper kecil (skrip cron dengan dompet biasa) memanggilnya kalau ember NPC tipis; ada juga tombol cadangan "Bangunkan Pak Kumis" untuk pemain.
   - Ini pengecualian dari spec §4.4 ("NPC nelayan tidak memanggil kontrak"): Pak Kumis tidak memanggil apa pun, tapi embernya on-chain. Keeper tidak memegang kunci dekripsi dan tunduk pada aturan publik yang sama.
2. **Kucing Garong (Stretch).** Bot keeper yang sesekali mencoba menyambar ember pemain yang **mengaktifkan** "Mode Kucing Garong" di pengaturan (opt-in disimpan di server; kontrak tidak berubah, aturan publik tetap berlaku). Ikan curian si kucing ada di embernya, jadi bisa disambar balik. Gunanya: juri bisa merasakan sisi korban dan melihat jaringnya bekerja tanpa pemain kedua.
3. **Tutorial jaring.** Setelah sambaran pertama juri, muncul tips: "Pasang jaring di embermu sendiri — kamu yang pilih ikannya, tidak ada yang tahu."

### 4.4 Usulan potongan demo (opsional, ±20 s)

Kalau Sambar Lite jadi, ganti sebagian 2:00–2:35 di naskah §15 spec:

> A memasang jaring di ikan terbaiknya (input terenkripsi). B datang, memilih slot yang sama → karung "???". Layar B: **Sandal Jepit**. Layar A: "Jaringmu kena! +5 🦪". Penonton (layar ketiga atau explorer) cuma melihat `Snatched(B, A, …)` tanpa hasil.

Potongan ini memamerkan tiga primitif dalam 20 detik: input terenkripsi (jaring), komputasi buta (cek jaring + kekebalan Secret), dan perpindahan nilai tanpa ada yang tahu nilainya berpindah.

---

## 5. NPC ember

| | Pak Kumis (Lite) | Kucing Garong (Stretch) |
|---|---|---|
| Peran | Korban NPC, latihan menyambar | Penyambar NPC, latihan bertahan |
| On-chain | Ember di alamat cadangan, diisi `restockNpc` | Dompet biasa yang dijalankan keeper |
| Siapa bayar gas | Keeper atau pemain yang menekan tombol | Keeper |
| Rahasia | Isi 6 ikan + posisi jaring acak, terenkripsi | Isi embernya (hasil curian) |
| Batas | Jeda restock 10 menit (Demo: 3 menit); tidak ada batas per jam sebagai korban | Mengikuti semua aturan penyambar; hanya mengincar pemain yang opt-in |
| Hadiah jaring | Tidak dicetak (umpan penyambar terbakar); tidak ada saldo NPC yang perlu dirahasiakan | — |

---

## 6. Pengaruh ke bagian lain spec

- **Kebocoran yang sudah ada di §6.8:** `sell(uint256[] fishIds)` membuka ikan mana yang dijual. Pemain yang "Jual semua yang biasa" meninggalkan sinyal bahwa sisa embernya bagus. Tanpa Sambar ini kebocoran kecil; dengan Sambar ini jadi petunjuk sasaran. Rekomendasi: tombol utama UI adalah **"Jual Semua"** (semua kecuali Secret — Secret memang tidak bisa dijual), sedangkan jual pilihan jadi opsi lanjutan. Sisa kebocoran dicatat di README sebagai keterbatasan yang diakui, dan dibingkai sebagai gertakan (orang bisa sengaja menyisakan Teri). Solusi penuh (jual dengan masker terenkripsi) ditunda; lihat keputusan terbuka #5.
- **Ikan Sandal Jepit** sekarang punya tiga asal: lemparan tak terbayar, sisa di ember korban, dan hasil sambar gagal. Satu sprite, satu harga (0).
- **Pasar tukar (§6.11):** ikan yang sedang ditawarkan (`state 3`) tidak ada di ember, jadi tidak bisa disambar.

---

## 7. Risiko keseimbangan dan mitigasi

### 7.1 Nilai harapan (ilustrasi dengan harga dasar §6.2, tanpa berat)

| Situasi | Nilai satu ikan acak | Peluang berhasil | Nilai harapan Sambar | Bandingkan dengan Lempar |
|---|---|---|---|---|
| Musim Normal, ember campur | ±4,3 | ±0,9 | ±3,9 untuk umpan 10 → **rugi** | 5 koin → 5 ikan ≈ 21 |
| Musim Normal, sisa setelah ikan Biasa dijual | ±11,7 | ±0,67–0,9 | ±7,8–10,5 untuk umpan 10 → **kira-kira impas**, sesekali jackpot Legenda (150) | sama |
| Musim Demo, ember Pak Kumis | ±13 | ±0,875 | ±11 untuk umpan 5 → untung, sengaja supaya tutorial terasa enak | 5 koin → 5 ikan ≈ 67 |

Di semua baris, Lempar per koin jauh lebih menguntungkan daripada Sambar. Angka ini harus dihitung ulang setelah rumus harga final dari spike S17 (spec §10.2 menambahkan berat ke harga, yang bisa mengubah skala).

### 7.2 Daftar risiko

| Risiko | Mitigasi |
|---|---|
| **Griefing** (satu orang terus-menerus menyasar korban yang sama) | Jeda pasangan 10 menit, jeda korban 90 s, maksimal 3 per jam, satu ikan satu kali, umpan berbayar |
| **Kehilangan saat offline** | Maksimal 3 ikan per jam; Secret kebal; ikan basah aman 30 s; peringatan saat keluar ("Embermu berisi 7 ikan. Jual dulu?"); UI Lite hanya menampilkan ember pemain yang online di room yang sama + NPC |
| **Pemain baru dirugikan** | Perisai sampai 5 lemparan; tidak pernah kehilangan koin, hanya maksimal 1 ikan per sambaran; korban selalu diberi tahu persis apa yang hilang dan oleh siapa |
| **Akun baru kebal yang mencuri** | Perisai pecah begitu dia menyambar pemain |
| **Probing untuk menemukan Secret** (incar ikan yang sama berkali-kali; kalau selalu sandal berarti Secret) | Satu ikan hanya bisa diincar sekali; hasil kena jaring dan kena Secret identik untuk penyambar |
| **Bot** | Sambaran buta: membaca chain tidak memberi keuntungan, simulasi `eth_call` tidak membocorkan apa-apa (tidak ada revert yang bergantung data terenkripsi). Bot tetap bisa memanfaatkan kebocoran jual (§6) dan waktu offline korban; dibatasi jeda dan batas per korban |
| **Kolusi akun kedua untuk farming koin** | Hadiah jaring zero-sum (umpan pindah, tidak ada koin baru); biaya jaring membuat siklus kolusi rugi |
| **Akun kedua "melindungi" ikan** (sambaran tanpa saldo untuk menandai `targeted` dan menghabiskan kuota korban) | Dampaknya cuma mengurangi PvP untuk pemain itu; dibatasi jeda penyambar. Diterima dan dicatat |
| **Pabrik sandal sebagai umpan palsu** (lempar tanpa saldo → 5 Sandal Jepit gratis) | Dianggap sah dan lucu; hanya pemain tanpa koin yang bisa melakukannya, dan menurunkan nilai harapan penyambar yang menyerang embernya |
| **Front-running oleh korban** (melihat transaksi sambar lalu menjual duluan) | Dianggap fitur "refleks". Sambaran revert sebelum ada yang terbakar, penyambar hanya rugi gas |
| **Bekas pemilik masih bisa mendekripsi handle lama** | Semua record diganti lewat `select`, sehingga handle baru hanya diizinkan ke pemilik baru. Korban memang boleh tahu ikan yang hilang (sudah pernah dia lihat) |
| **Terasa seperti judi** | Tidak ada uang sungguhan; umpan adalah koin game dari starter pack; aturan dan tabel NPC publik |
| **Melewati batas HCU / ukuran kontrak** | ±27–30 operasi, kedalaman ±9–10; spike S23. Modul diwarisi, pindah ke library kalau ukuran kontrak melewati 24 KB |
| **Cakupan membengkak** | Gerbang tanggal (§9), Sambar Lite tanpa Kucing Garong dan tanpa Rak Ember offline |

---

## 8. Varian yang dipertimbangkan dan ditolak

| Varian | Kenapa ditolak |
|---|---|
| Hasil sambar dibuka publik lewat satu bit (pola S5) | Dua transaksi (±30 s), ada risiko macet kalau tidak ada yang finalisasi, dan setiap kegagalan membocorkan "jaring atau Secret di sini" |
| Bidik dulu, sambar kemudian (dua transaksi, korban diberi jendela pasti untuk bertahan) | Lebih adil untuk korban, tapi penyambar menunggu ±25 s dan alurnya lebih rumit. Disimpan sebagai opsi kalau uji coba menunjukkan korban merasa tak berdaya (keputusan terbuka #3) |
| Secret boleh disambar | Lihat §1.4 |
| Jaring dipasang acak oleh chain (tanpa input terenkripsi) | Lebih cepat (tanpa enkripsi 7 s), tapi pemain kehilangan pilihan strategis dan demo kehilangan contoh input terenkripsi. Disimpan sebagai cadangan kalau enkripsi di browser bermasalah |
| Brankas/lemari untuk mengunci ikan per ikan | Memindahkan ikan tertentu ke brankas secara publik membocorkan ikan mana yang dihargai; menambah satu konsep lagi |
| Diskon "Jual Kilat" di luar pasar | Lokasi tidak bisa dicek kontrak, jadi `sell()` biasa selalu bisa dipanggil dari mana saja; diskon hanya menghukum pemain yang memakai UI |
| Hadiah jaring 2× umpan (koin baru dicetak) | Membuka farming lewat akun kedua |

---

## 9. Perkiraan waktu dan rekomendasi

### 9.1 Perkiraan kerja (satu developer)

| Pekerjaan | Lite | Penuh |
|---|---|---|
| Kait di Must: `caughtAt`, `origin`, `targeted`, `castCount`, `emberCount`, `sell` aman untuk sandal, alamat NPC cadangan | 0,5 hari (dikerjakan minggu 1–2) | sama |
| Kontrak: `snatch`, `setNet`, `restockNpc`, aturan, event | 2 hari | 2,5 hari |
| Test mock (§3.7) + simulasi keseimbangan | 1,5 hari | 2 hari |
| Spike S23/S24 + deploy Sepolia | 0,5 hari | 0,5 hari |
| Frontend: panel ember, pemilih slot, dekripsi karung, notifikasi korban, alur jaring | 1,5 hari | 2 hari |
| Phaser: sprite ember, karung, animasi kail, ikon jaring, Pak Kumis, feed | 1 hari | 2 hari |
| Kucing Garong (keeper + opt-in) | — | 1 hari |
| Rak Ember untuk pemain offline | — | 0,5 hari |
| **Total setelah kait** | **±6,5 hari** | **±10,5 hari** |

### 9.2 Rekomendasi

**Jangan masuk MVP. Bangun Sambar Lite setelah Must selesai, dengan gerbang tanggal.**

1. **Minggu 1–2 (17–30 Nov):** pasang kait kontrak (±0,5 hari) sekarang, supaya kontrak Must tidak perlu dirombak dan di-deploy ulang nanti. Tidak ada UI Sambar.
2. **Gerbang 30 Nov malam:** lanjut hanya kalau alur Must (starter → lempar → jual → upgrade → Secret → pamer → NFT) sudah jalan end-to-end di Sepolia dengan dua pemain.
3. **1–5 Des:** Sambar Lite (snatch + jaring + Secret kebal + aturan + Pak Kumis). Bekukan fitur 6 Des, supaya minggu 4 tetap untuk uji, README, dan video (rekam paling lambat 10 Des).
4. **Gerbang gagal → tunda** ke pasca-hackathon. Kait di kontrak tidak merugikan apa pun, dan bisa disebut di README sebagai fitur musim berikutnya.
5. Kucing Garong dan Rak Ember offline: Stretch / pasca-hackathon.

**Kalau minggu 3 cuma muat satu fitur Should**, saya sarankan Sambar Lite didahulukan sebelum Tukar Langsung (§6.11), karena:
- Tanpa Sambar, pemain di dunia multiplayer hanya bisa saling melihat, belum bisa berinteraksi. Itu kelemahan yang akan terasa oleh juri di kriteria Gameplay & UX.
- Sambar memamerkan tiga primitif sekaligus (input terenkripsi, komputasi buta tanpa reveal, perpindahan nilai rahasia), ditambah argumen "jaring bekerja saat kamu offline" yang tidak bisa ditiru commit-reveal atau server.
- Tapi Tukar Langsung langsung menjawab masalah "rekber dan scam" di pitch pembuka. Jadi ini keputusan pengguna (keputusan terbuka #1).

---

## 10. Spike tambahan

| # | Target | Kriteria lulus |
|---|---|---|
| S23 | `snatch()` di Sepolia dengan burn + mint ERC-7984 dan 4 kombinasi hasil | Tidak kena `HCUTransactionDepthLimitExceeded`; gas tercatat; event, jumlah record, dan gas identik untuk berhasil vs gagal |
| S24 | ACL setelah perpindahan | Korban gagal mendekripsi record baru penyambar; penyambar gagal mendekripsi `netFish` dan record korban; kalau memakai library `delegatecall`, ACL tetap atas nama kontrak game |
| S25 | `setNet` dari browser di bawah COOP/COEP | Enkripsi `euint32` + transaksi ≤ 25 s total |

---

## 11. Keputusan terbuka

1. **Urutan prioritas minggu 3:** Sambar Lite dulu atau Tukar Langsung (§6.11) dulu. Rekomendasi: Sambar Lite.
2. **Angka final** umpan, biaya jaring, jeda, dan batas, setelah rumus harga dari S17 dan simulasi keseimbangan.
3. **Korban butuh jendela bertahan yang pasti?** (varian "bidik dulu" di §8). Default: tidak, satu transaksi.
4. **Siapa yang bisa disasar lewat UI:** hanya pemain online di room yang sama + NPC (default Lite), atau juga ember pemain offline lewat Rak Ember.
5. **Kebocoran `sell(fishIds)`:** terima dan dokumentasikan (default), atau ganti dengan jual bermasker terenkripsi (butuh input terenkripsi per jual, ±7 s lebih lambat).
6. **Hadiah jaring:** umpan pindah ke korban (default, zero-sum), atau dibakar saja.
7. **Jumlah jaring per pemain:** 1 (default), atau 2 sebagai upgrade kosmetik/berbayar nanti.
8. **Nama fitur** di UI: "Sambar Ember" atau nama lain yang lebih brainrot.

---

## 12. Usulan perubahan untuk `GAME_SPEC.md`

Hanya usulan; sesi utama yang memutuskan dan menulis.

1. **§6.12** — ganti isi dengan ringkasan §0 dokumen ini + tautan ke `docs/SAMBAR_EMBER.md`; status "dirancang, menunggu gerbang 30 Nov".
2. **§10.1 struktur `Fish`** — tambah `uint64 caughtAt`, `uint8 origin`, `bool targeted`. Tambah `PlayerState` dengan `castCount`, `emberCount` (dan field Sambar kalau gerbang lolos).
3. **§10.1 fungsi `cast` dan `sell`** — `cast` menaikkan `castCount`/`emberCount` dan mengisi `caughtAt`; `sell` mengurangi `emberCount` dan aman untuk record Sandal Jepit.
4. **§10.1 daftar fungsi dan event** — (kalau gerbang lolos) tambah `snatch`, `setNet`, `restockNpc`; event `Snatched`, `NetSet`, `NpcRestocked`, `ShieldBroken`.
5. **§7 matriks kerahasiaan** — tambah baris: posisi jaring, hasil sambaran, alasan gagal, target sambaran, aturan anti-grief (ringkasan dari §2).
6. **§6.8 jual** — catat kebocoran `sell(fishIds)`; jadikan "Jual Semua" tombol utama; boleh dipanggil dari panel ember di mana saja (kontrak memang tidak bisa memaksa lokasi).
7. **§4.3 yang dilihat pemain lain** — tambah baris "Menyambar ember" (penonton lihat karung "???", tidak tahu hasil) dan "Memasang jaring" (ikon jaring tanpa posisi).
8. **§4.4 NPC** — catat pengecualian: Pak Kumis punya ember on-chain yang diisi `restockNpc` permissionless; keeper hanya membayar gas dan tidak memegang kunci dekripsi.
9. **§8 kenapa harus FHE** — tambah argumen: jaring dicek buta walau pemilik offline (commit-reveal butuh pemilik online; server akan tahu posisinya).
10. **§10.3 server** — tambah status animasi `snatch_start`/`snatch_end` dan proses keeper terpisah (cron) untuk restock NPC.
11. **§12 cakupan** — Must: kait kontrak. Should (bergerbang): Sambar Lite. Stretch: Kucing Garong, Rak Ember offline.
12. **§13 spike** — tambah S23, S24, S25.
13. **§14 jadwal** — minggu 1–2: kait; gerbang 30 Nov; minggu 3: Sambar Lite 1–5 Des, bekukan 6 Des.
14. **§15 naskah demo** — opsi potongan 20 detik (§4.4 dokumen ini).
15. **§16 risiko** — tambah baris griefing/offline, probing Secret, dan cakupan Sambar.
16. **§17 keputusan terbuka** — ganti butir 9 dengan keputusan terbuka #1–#8 di atas.
17. **§9.2 aset** — tambah: ember 3 tingkat isi, karung "???", ikon jaring, gelembung perisai, animasi kail ke ember, Pak Kumis + animasi sapu, emote 😎😭🤫.
