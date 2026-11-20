# Integrasi frontend: Sambar Ember (Lite)

Untuk sesi frontend. Kontrak Sambar Lite sudah selesai, teruji di mock (34 tes) dan di Sepolia 18 Nov (SPIKE_LOG S23, S24: jaring, sambar berhasil, sambar kena jaring, Pak Kumis). Desain lengkap: [SAMBAR_EMBER.md](SAMBAR_EMBER.md). Bagian ini hanya berisi yang dibutuhkan UI.

> Frontend tidak disentuh dari sesi kontrak. Alamat dan ABI di bawah **belum** disinkronkan ke `frontend/src/generated/contracts.ts`; jalankan `npm run sync` di `frontend/` saat siap memakai deployment baru.

## Deployment baru (Sepolia, 18 Nov 2026)

Kontrak game berubah (konstruktor menerima `SambarConfig`), jadi ketiga kontrak di-deploy ulang. Data di deployment sesi-kunci (`0x6da1…799d`) tidak terbawa.

| Kontrak | Alamat |
|---|---|
| DeepSecretGame | `0x7316ba642A6BB9966d6e713726Ac01EA148E96Eb` |
| PearlCoin | `0x192529E31a9f1B104b65bcda023EE3AFD101A79A` |
| SecretFishNFT | `0x7d55BBC19477784A10840AF58a6108e59a7416e7` |

Server presence/drip (`rt-spike/server.mjs`) membaca alamat game dari env `GAME_ADDRESS` (bawaan sudah alamat baru).

Semua fungsi lama dan alur kunci sesi ([FE_INTEGRATION_SESSIONS.md](FE_INTEGRATION_SESSIONS.md)) tetap sama. `snatch` dan `setNet` juga bisa dikirim oleh kunci sesi, atas nama pemain.

## Aturan main (yang perlu tampil di UI)

- **Sambar**: bayar umpan 5 Mutiara, pilih satu ikan di ember pemain lain, lalu dapat satu "karung". Isinya ikan itu, atau Sandal Jepit kalau ikan itu dijaga Jaring Rahasia pemiliknya, ikan itu Secret (kebal), atau saldo penyambar kurang. **Tidak ada yang tahu hasilnya kecuali penyambar**; transaksi tidak pernah gagal karena hasil.
- **Jaring Rahasia**: bayar 3 Mutiara, sembunyikan jaring di bawah satu id ikan (terenkripsi). Kalau ada yang menyambar ikan itu, penyambar dapat Sandal Jepit dan umpannya (5) masuk ke pemilik jaring. Jaring boleh dipasang di id mana saja (bisa gertakan). Pasang ulang = pindah jaring.
- **Pak Kumis** (NPC, alamat `PAK_KUMIS()` = `0x00000000000000000000000000000000F15A0001`): ember latihan berisi 6 ikan tanpa Secret dan satu jaring acak. Siapa saja bisa mengisi ulang (`restockNpc`) saat sisa ikan segarnya < 3 dan jeda 3 menit lewat. Menyambar Pak Kumis tidak memecah perisai dan tidak kena aturan korban.

Parameter musim demo (baca dari `sambarConfig()` supaya UI selalu cocok dengan kontrak):

| Field | Demo | Arti |
|---|---|---|
| `snatchBait` | 5 | Umpan per sambaran |
| `netCost` | 3 | Biaya pasang/pindah jaring |
| `thiefCooldown` | 45 s | Jeda antar-sambaran oleh penyambar yang sama |
| `pairCooldown` | 180 s | Jeda penyambar A → korban B yang sama |
| `victimCooldown` | 60 s | Jeda korban setelah diincar siapa pun |
| `wetSeconds` | 20 s | Ikan yang baru ditangkap/disambar belum bisa disambar |
| `npcRestockCooldown` | 180 s | Jeda isi ulang Pak Kumis |
| `maxTargetedPerHour` | 4 | Maks. diincar per korban per jam |
| `minThiefCasts` | 2 | Penyambar minimal sudah melempar 2× |
| `shieldCasts` | 3 | Pemain dengan < 3 lemparan dilindungi perisai pemula (pecah kalau dia sendiri menyambar pemain) |
| `minEmber` | 3 | Korban minimal punya 3 ikan di ember |

## Fungsi baru di `DeepSecretGame`

| Fungsi | Isi |
|---|---|
| `snatch(address victim, uint256 fishId) → newFishId` | Sambar. Selalu membuat record baru milik penyambar (`origin` = 1 SNATCHED). Gas: lihat tabel angka di bawah. |
| `setNet(externalEuint32 encFishId, bytes proof)` | Pasang jaring. Input dibuat dengan `sdk.relayer.encryptValues` untuk kontrak game dan **alamat pemain** sebagai pengguna (atau alamat kunci yang mengirim — lihat catatan). |
| `restockNpc() → firstFishId` | Isi ulang ember Pak Kumis. |
| `sambarConfig()` view | Parameter di atas. |
| `npcFresh()` view | Ikan Pak Kumis yang belum diincar. |
| `lastPairSnatch(thief, victim)` view | Waktu sambaran terakhir A → B (untuk hitung mundur). |
| `player(addr)` view | Field baru: `shieldBroken`, `hasNet`, `targetedInWindow`, `lastSnatchAt`, `lastTargetedAt`, `windowStart`, `netFish` (handle). |
| `getFish(id)` view | Field baru: `origin` (0 CAST, 1 SNATCHED, 2 NPC) dan `targeted` (sudah pernah diincar → tidak bisa disambar lagi). |

Event: `Snatched(thief, victim, targetFishId, newFishId)`, `NetSet(owner)`, `NpcRestocked(npc, firstFishId, count)`, `ShieldBroken(player)`.

Error: `SambarBlocked(uint8 reason)` — cek aturan di klien sebelum mengirim supaya tombol bisa dinonaktifkan dengan alasan yang jelas:

| Kode | Arti | Teks UI usulan |
|---|---|---|
| 1 | Penyambar belum 2× melempar | "Lempar dulu 2× sebelum menyambar" |
| 2 | Jeda penyambar | "Tunggu 45 s" (hitung dari `lastSnatchAt`) |
| 3 | Korban masih pemula (perisai) | "Pemain ini masih dilindungi perisai pemula" |
| 4 | Jeda pasangan | "Kamu baru saja menyambar dia" |
| 5 | Jeda korban | "Dia baru saja diincar" |
| 6 | Korban sudah diincar 4× jam ini | "Ember ini sudah cukup diganggu jam ini" |
| 7 | Ember korban < 3 ikan | "Embernya terlalu sepi" |
| 8 | Ikan bukan milik korban, sudah dijual/dipamerkan, sudah pernah diincar, atau masih basah (< 20 s) | "Ikan ini tidak bisa disambar" |
| 9 | Menyambar diri sendiri | — |
| 10 | Pak Kumis belum perlu diisi ulang / masih jeda | "Pak Kumis masih punya ikan" |

## Membaca hasil (tanpa membocorkan apa-apa)

- **Penyambar**: setelah transaksi, dekripsi `getFish(newFishId).packed`. `0` = Sandal Jepit, selain itu ikan biasa (format packed sama seperti hasil lempar). Kunci sesi penyambar langsung punya izin baca.
- **Korban**: event `Snatched` memberi tahu *bahwa* ikan `targetFishId` diincar dan oleh siapa (publik). Dekripsi ulang `getFish(targetFishId).packed`: kalau sekarang `0`, ikannya hilang (UI tahu isinya sebelumnya dari cache lokal); kalau masih sama, jaring atau kekebalan Secret menyelamatkannya. Saldo naik 5 = jaring kena. Kunci sesi korban juga diberi izin baca ulang.
- **Orang lain**: hanya melihat event publik. UI mereka **tidak boleh** menampilkan hasil; animasi "karung" sama untuk semua kasus (Art Bible Addendum: animasi siaran identik).
- **Jaring**: handle `player(addr).netFish` hanya bisa didekripsi oleh dompet pemain (bukan kunci sesi). Simpan id yang dipilih di `localStorage` saat memasang supaya UI bisa menampilkan ikon jaring tanpa dekripsi.

## Catatan teknis

| Hal | Nilai |
|---|---|
| Gas `snatch` | terukur 2,8–3,9 juta (estimasi 3,4–4,7 juta); pakai `estimateGas` + 20 % atau batas tetap 6.000.000 |
| Gas `setNet` | terukur 1,48 juta (estimasi 1,79 juta); batas 2.500.000 |
| Gas `restockNpc` | terukur 11,84 juta (estimasi 14,3 juta); batas 16.000.000 (cap per transaksi Sepolia 16.777.216) |
| Input terenkripsi `setNet` | Bukti input terikat pada pasangan (kontrak, pengirim transaksi). Kalau `setNet` dikirim oleh kunci sesi, buat input dengan alamat **kunci**. |
| S25 (belum) | Ukur enkripsi `euint32` + transaksi `setNet` dari browser di bawah COOP/COEP; target ≤ 25 s total |
