import Phaser from "phaser";

// Placeholder pixel textures drawn in code, using the ART_BIBLE §4 palette. Real sprites replace these later.
export const PAL = {
  deep: 0x163b42,
  ocean: 0x277c78,
  aqua: 0x65c9b5,
  sand: 0xf2d38d,
  coral: 0xf18d5b,
  foam: 0xf4efd9,
  ink: 0x26343b,
  lime: 0xb5d96b,
  void: 0x0c0a16,
  trench: 0x10233a,
  reef: 0x2f8f8a,
  wood: 0x9a6a3c,
  grass: 0x7fbf6a,
};

export const SHIRTS = [0xf18d5b, 0x4f8fe8, 0xb5d96b, 0xa77bff, 0xf8d77b, 0xe85d75];

export function makeTextures(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  const tex = (key: string, w: number, h: number, draw: () => void) => {
    g.clear();
    draw();
    g.generateTexture(key, w, h);
  };

  tex("t-deep", 16, 16, () => g.fillStyle(PAL.deep).fillRect(0, 0, 16, 16));
  tex("t-water", 16, 16, () => {
    g.fillStyle(PAL.ocean).fillRect(0, 0, 16, 16);
    g.fillStyle(PAL.aqua).fillRect(3, 4, 4, 1).fillRect(10, 11, 3, 1);
  });
  tex("t-reef", 16, 16, () => {
    g.fillStyle(PAL.reef).fillRect(0, 0, 16, 16);
    g.fillStyle(PAL.coral).fillRect(4, 6, 2, 2).fillRect(11, 3, 2, 3);
    g.fillStyle(PAL.aqua).fillRect(8, 12, 4, 1);
  });
  tex("t-trench", 16, 16, () => {
    g.fillStyle(PAL.trench).fillRect(0, 0, 16, 16);
    g.fillStyle(0x2a4a7a).fillRect(5, 9, 3, 1);
  });
  tex("t-sand", 16, 16, () => {
    g.fillStyle(PAL.sand).fillRect(0, 0, 16, 16);
    g.fillStyle(0xe2bf72).fillRect(3, 3, 1, 1).fillRect(11, 9, 1, 1).fillRect(7, 13, 1, 1);
  });
  tex("t-grass", 16, 16, () => {
    g.fillStyle(PAL.grass).fillRect(0, 0, 16, 16);
    g.fillStyle(0x6aa858).fillRect(4, 5, 1, 2).fillRect(12, 10, 1, 2);
  });
  tex("t-dock", 16, 16, () => {
    g.fillStyle(PAL.wood).fillRect(0, 0, 16, 16);
    g.fillStyle(0x7a5230).fillRect(0, 5, 16, 1).fillRect(0, 11, 16, 1);
  });

  SHIRTS.forEach((shirt, i) =>
    tex(`avatar${i}`, 12, 16, () => {
      g.fillStyle(PAL.ink).fillRect(1, 0, 10, 16);
      g.fillStyle(0xf5c9a0).fillRect(2, 1, 8, 6); // head
      g.fillStyle(PAL.ink).fillRect(4, 3, 1, 2).fillRect(7, 3, 1, 2); // eyes
      g.fillStyle(shirt).fillRect(2, 7, 8, 5);
      g.fillStyle(0x3b4a8a).fillRect(2, 12, 3, 3).fillRect(7, 12, 3, 3);
      g.fillStyle(0xf8d77b).fillRect(1, 0, 10, 2); // straw hat brim
    }),
  );

  tex("bobber", 6, 6, () => {
    g.fillStyle(PAL.foam).fillRect(1, 0, 4, 3);
    g.fillStyle(PAL.coral).fillRect(1, 3, 4, 3);
  });
  tex("silhouette", 20, 11, () => {
    g.fillStyle(PAL.void).fillEllipse(8, 5.5, 16, 9).fillTriangle(14, 5.5, 20, 0, 20, 11);
  });
  tex("sparkle", 3, 3, () => g.fillStyle(PAL.foam).fillRect(1, 0, 1, 3).fillRect(0, 1, 3, 1));
  g.destroy();
}
