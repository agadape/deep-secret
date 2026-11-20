import Phaser from "phaser";

// Small leftover textures and the ART_BIBLE §4 base palette. Ground is painted in terrainArt.ts, sprites live in sprites.ts.
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

export function makeTextures(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  const tex = (key: string, w: number, h: number, draw: () => void) => {
    g.clear();
    draw();
    g.generateTexture(key, w, h);
  };

  tex("sparkle", 3, 3, () => g.fillStyle(0xf2fcff).fillRect(1, 0, 1, 3).fillRect(0, 1, 3, 1));
  g.destroy();
}
