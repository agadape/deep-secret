# DESIGN — Deep Secret, gaya F

## Konsep
Laut yang makin gelap ke bawah menyembunyikan isinya, sama seperti FHE menyembunyikan hasil tangkapan. Di dekat pantai airnya terang dan jernih, sedangkan di ujung dermaga dan di Palung warnanya turun ke biru baja lalu navy hampir hitam. Pemain melihat permukaan, dan yang ada di dalam tetap rahasia.

## Teknik (rujukan: Inotia 4, diminta Dave 18 Nov 2026)
Dunia Inotia 4 digambar di 480×320 lalu diperbesar. Kesan halusnya tidak datang dari piksel yang lebih kecil, tapi dari cara piksel dipakai. Kita memakai tekniknya saja, tanpa menyalin aset, karakter, tileset, atau UI-nya.

1. **Ramp 4 sampai 6 tingkat per bahan, dengan hue shift.** Bayangan bergeser ke dingin dan sorotan ke hangat.
2. **Tekstur klaster yang tertata.** Air memakai pola sel kaustik yang memudar di laut dalam, pasir punya riak, kayu punya serat dan paku, rumput punya rumpun kecil.
3. **Tepi organik bertingkat.** Garis pantai dibulatkan dari grid tile dan punya cincin buih plus garis ombak kedua.
4. **Outline selektif.** Garis tepi memakai warna tinta hangat `#2b1d1c` atau versi gelap warna benda itu sendiri, bukan hitam rata (ART_BIBLE §3.3).
5. **Cahaya dan bayangan transparan yang tetap di grid.** Bayangan elips bertangga di bawah avatar dan properti, kolam cahaya lentera ber-blend ADD dalam 4 cincin keras, bayangan dermaga di air.
6. **Kamera 3/4 overhead.** Bangunan memperlihatkan atap dan dinding depan, dan urutan tumpuknya mengikuti posisi kaki (`depthAt`).
7. **Campuran resolusi.** Dunia ada di grid piksel, sedangkan HUD React tetap tajam di resolusi layar.

## Ukuran
| Aset | Ukuran asli | Catatan |
|---|---|---|
| Resolusi logis | ±480×270 | zoom kamera bulat (×3 di 1440×900, ×2 di HP) |
| Avatar | 16×34 px, 3 arah (depan, belakang, samping + flip), 2 frame langkah | 6 ramp baju (hijau daun untuk pemain lokal, koral, biru, putih doff, hitam doff, mawar); ungu dan emas tidak dipakai karena milik Secret (§4.3) |
| Siluet ??? | 22×11 px, satu ukuran | isi near-black `#0c0a16` + tepi terang 1 px `#b6f1f2` supaya terbaca di air navy (A3, §8.2) |
| Teri Ngantuk | 40×22 px | kartu: ×3 |
| Raja Abyss | 128/96/64/48 px lebar | reveal: 128 ×2; akuarium 64; ember 48; outline indigo `#170f45` |
| Bangunan | 52 sampai 136 px lebar | dijangkar di tepi bawah footprint `map.ts` |
| Kelapa | 64×76 px | 2 arah condong, bayangan mahkota di pasir |
| Tiang lentera | 14×26 px | cahaya ADD 4 cincin + pantulan putus-putus di air |

## Palet
- Laut (13 tingkat): `#f2fcff` buih, `#6fe3e2` dangkal, `#14b8ec` deep sky, `#0b6eaa` biru baja, `#06162d` paling dalam (juga latar kanvas).
- Pasir (7): `#fff4d8` sampai `#8f653e`. Rumput (6): `#c8ee8a` sampai `#356b32`. Kayu (6): `#f3c88f` sampai `#4b2f20`.
- Aksen: `#00bfff` deep sky di pita atap akuarium. Rarity tetap A4.
- Satu adegan memakai ±60 sampai 90 warna. Ini sengaja melewati §3.4 ART_BIBLE (16 sampai 24) dan menunggu persetujuan Dave.

## Huruf
Belum berubah: Nunito, Pixelify Sans, dan Silkscreen dari sistem. Hosting font sendiri (A6) masuk ITM-05.

## Di mana kodenya
- `src/game/terrainArt.ts`: pelukis tanah per piksel (laut, pasir, rumput, dermaga). Hasilnya dipanggang ke `public/terrain.png` dengan `npm run bake` (deterministik), dan kalau berkas itu tidak ada, scene melukis ulang saat jalan.
- `src/game/sprites.ts`: avatar, siluet, pelampung, lentera, bayangan, dan cahaya, digambar dari peta karakter.
- `src/game/props.ts`: bangunan, kelapa, batu, dan semak, dilukis piksel di kode.
- `public/sprites/*.png`: dua ikan pengunci gaya. Asal-usulnya dicatat di `ASSETS.md`.
- Gerak hiasan (kilau air, napas lentera) dimatikan bila `prefers-reduced-motion: reduce`. Label zona disembunyikan saat masuk pita HUD bawah.

## Bagian lemah (jujur)
- Pose lempar dan angkat masih memakai sprite diam. Animasi langkahnya baru 2 frame.
- Baru 2 dari 19 ikan punya sprite. Sisanya masih SVG placeholder (sesuai HANDOFF §9: buktikan satu ikan dulu).
- Kedua ikan berasal dari frame konsep, lalu dikecilkan dan dikuantisasi. Mata, kumis, dan outline-nya sudah dirapikan tangan, tapi sirip dan mahkota belum sebersih piksel yang digambar dari nol.
- Rumput masih punya bercak besar dua nada. Rumpun kecil sudah dikelompokkan di tepi bercak.
- Label dunia masih memakai font sistem sampai ITM-05.
- 3 aturan ART_BIBLE (§3.4 palet, §2.3 dithering, §3.2 ukuran avatar) belum disetujui Dave.
