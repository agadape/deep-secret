import Phaser from "phaser";
import { emit, on, pad, type Anim, type Dir, type RemotePlayer } from "./bus";
import { BUILDINGS, GRID, SPAWN, TILE, WORLD_H, WORLD_W, fishingZoneAt, nearestBuilding, terrainAt, walkable } from "./map";
import { PAL, makeTextures } from "./textures";
import { SHIRT_RAMPS, WALK_FRAMES, avatarKey, makeSprites } from "./sprites";
import { makeBuildings, makeBush, makePalm, makeRock } from "./props";
import { PAINT_OX, PAINT_OY, paintTerrain } from "./terrainArt";

const SPEED = 72; // px per second
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const FISHING: Anim[] = ["cast", "fishing", "reel"];

const AVATAR_H = 34; // DESIGN.md: avatars are 32-36 px tall
/** Depth by feet position, so whoever stands lower on screen is drawn in front (3/4 overhead view). */
export const depthAt = (y: number) => 10 + y / 1000;

/** One avatar as everyone sees it. Catches are always a black "???" silhouette (ART_BIBLE §8, Addendum A2-A3). */
class AvatarView {
  sprite: Phaser.GameObjects.Image;
  shadow: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  line: Phaser.GameObjects.Graphics;
  bobber: Phaser.GameObjects.Image;
  ripple: Phaser.GameObjects.Graphics;
  silhouette: Phaser.GameObjects.Image;
  mystery: Phaser.GameObjects.Text;
  anim: Anim = "idle";
  dir: Dir = "down";
  private bob = 0;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    private shirt: number,
    name: string,
    isLocal: boolean,
  ) {
    this.shadow = scene.add.image(x, y, "shadow").setOrigin(0.5, 0.6).setAlpha(0.32).setDepth(4);
    this.ripple = scene.add.graphics().setDepth(5);
    this.line = scene.add.graphics().setDepth(9);
    this.sprite = scene.add.image(x, y, avatarKey(shirt, "front")).setOrigin(0.5, 1).setDepth(depthAt(y));
    this.label = scene.add
      .text(x, y - AVATAR_H - 1, name, {
        fontFamily: "Nunito, system-ui",
        fontSize: "8px",
        color: isLocal ? "#ffe08a" : "#f2fcff",
        stroke: "#06162d",
        strokeThickness: 2,
        resolution: 3,
      })
      .setOrigin(0.5, 1)
      .setDepth(20);
    this.bobber = scene.add.image(x, y, "bobber").setDepth(6).setVisible(false);
    // The silhouette and "???" sit above the name so they never cover it (tour finding 18 Nov).
    this.silhouette = scene.add.image(x, y, "silhouette").setOrigin(0.5, 1).setDepth(21).setVisible(false);
    this.mystery = scene.add
      .text(x, y, "???", { fontFamily: "Silkscreen, monospace", fontSize: "8px", color: "#f2fcff", stroke: "#06162d", strokeThickness: 2, resolution: 3 })
      .setOrigin(0.5, 1)
      .setDepth(21)
      .setVisible(false);
  }

  setName(name: string) {
    this.label.setText(name);
  }

  update(time: number) {
    const { x, y } = this.sprite;
    const walking = this.anim === "walk";
    const view = this.dir === "up" ? "back" : this.dir === "down" ? "front" : "side";
    const frame = walking ? WALK_FRAMES[Math.floor(time / 140) % WALK_FRAMES.length] : "";
    this.sprite.setTexture(avatarKey(this.shirt, view) + frame).setFlipX(this.dir === "left");
    // a 1 px bob on the lifted-foot frames instead of rotating the sprite, which would break the pixel grid
    const step = frame ? 1 : 0;
    this.sprite.setOrigin(0.5, 1 + step / AVATAR_H).setDepth(depthAt(y));
    this.shadow.setPosition(x, y);
    this.label.setPosition(x, y - AVATAR_H - 1);
    const fishing = FISHING.includes(this.anim);
    this.bobber.setVisible(fishing);
    this.line.clear();
    this.ripple.clear();
    if (fishing) {
      const [dx, dy] = DIRS[this.dir];
      this.bob = Math.sin(time / (this.anim === "reel" ? 60 : 300)) * (this.anim === "reel" ? 2 : 1);
      const hx = x + dx * 5;
      const hy = y - 14;
      const tx = hx + dx * 10;
      const ty = hy - 9 + dy * 6;
      const bx = x + dx * 30;
      const by = y - 4 + dy * 30 + this.bob;
      this.bobber.setPosition(Math.round(bx), Math.round(by));
      this.line.lineStyle(1, 0x96623b, 1).lineBetween(hx, hy, tx, ty); // rod
      this.line.lineStyle(1, 0xf2fcff, 0.7).lineBetween(tx, ty, bx, by - 2); // line
      const r = 5 + ((time / 120) % 4);
      this.ripple.lineStyle(1, 0xf2fcff, 0.45 - (r - 5) * 0.1).strokeEllipse(Math.round(bx), Math.round(by) + 3, r * 2, r);
    }
    const holding = this.anim === "hold_unknown";
    const top = y - AVATAR_H - 11;
    this.silhouette.setVisible(holding).setPosition(x, Math.round(top + Math.sin(time / 250)));
    this.mystery.setVisible(holding).setPosition(x, top - 10);
  }

  destroy() {
    [this.sprite, this.shadow, this.label, this.line, this.ripple, this.bobber, this.silhouette, this.mystery].forEach((o) => o.destroy());
  }
}

export class IslandScene extends Phaser.Scene {
  private me!: AvatarView;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private remotes = new Map<number, { view: AvatarView; tx: number; ty: number }>();
  private myId: number | undefined;
  private lastNear = "";
  private lastPos = 0;
  private offs: (() => void)[] = [];

  constructor() {
    super("island");
  }

  create() {
    makeTextures(this);
    makeSprites(this);
    this.drawTerrain();
    this.drawBuildings();
    this.addAmbient();
    this.addLantern();

    this.me = new AvatarView(this, SPAWN.x, SPAWN.y, 0, "you", true);
    // Margin around the island so the avatar can stay above the HUD even at the end of the dock (ART_BIBLE §2.4).
    this.cameras.main
      .setBounds(-160, -120, WORLD_W + 320, WORLD_H + 240)
      .startFollow(this.me.sprite, true, 0.12, 0.12)
      .setFollowOffset(0, -36)
      .setRoundPixels(true);
    const applyZoom = () => {
      const { width, height } = this.scale;
      this.cameras.main.setZoom(Math.max(2, Math.floor(Math.min(width, height) / 240)));
    };
    applyZoom();
    this.scale.on("resize", applyZoom);

    const kb = this.input.keyboard!;
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT") as Record<string, Phaser.Input.Keyboard.Key>;
    kb.disableGlobalCapture(); // let the HUD's inputs receive typing

    this.offs.push(
      on("local-anim", (a) => {
        if (a === "cast") this.me.dir = this.waterDir() ?? this.me.dir;
        this.me.anim = a;
      }),
      on("local-name", (n) => this.me.setName(n)),
      on("remote", ({ me, players }) => this.syncRemotes(me, players)),
    );
    this.events.once("shutdown", () => this.offs.forEach((o) => o()));
  }

  update(time: number, delta: number) {
    this.moveLocal(delta);
    this.me.update(time);
    for (const r of this.remotes.values()) {
      const s = r.view.sprite;
      s.setPosition(Phaser.Math.Linear(s.x, r.tx, 0.2), Phaser.Math.Linear(s.y, r.ty, 0.2));
      r.view.update(time);
    }
    const { x, y } = this.me.sprite;
    const zone = fishingZoneAt(x, y - 4);
    const building = nearestBuilding(x, y);
    const key = `${zone}|${building}`;
    if (key !== this.lastNear) {
      this.lastNear = key;
      emit("near", { zone, building });
    }
    if (time - this.lastPos > 100) {
      this.lastPos = time;
      emit("pos", { x: Math.round(x), y: Math.round(y), dir: this.me.dir, anim: this.me.anim });
    }
  }

  private moveLocal(delta: number) {
    const busy = this.me.anim !== "idle" && this.me.anim !== "walk";
    const k = this.keys;
    let dx = (k.D.isDown || k.RIGHT.isDown || pad.right ? 1 : 0) - (k.A.isDown || k.LEFT.isDown || pad.left ? 1 : 0);
    let dy = (k.S.isDown || k.DOWN.isDown || pad.down ? 1 : 0) - (k.W.isDown || k.UP.isDown || pad.up ? 1 : 0);
    if (busy) dx = dy = 0;
    if (!busy) this.me.anim = dx || dy ? "walk" : "idle";
    if (!dx && !dy) return;
    this.me.dir = dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";
    const len = Math.hypot(dx, dy);
    const step = (SPEED * delta) / 1000;
    const s = this.me.sprite;
    const nx = s.x + (dx / len) * step;
    const ny = s.y + (dy / len) * step;
    if (walkable(nx, s.y - 2)) s.x = nx;
    if (walkable(s.x, ny - 2)) s.y = ny;
  }

  private waterDir(): Dir | undefined {
    const { x, y } = this.me.sprite;
    const order: Dir[] = [this.me.dir, "down", "up", "left", "right"];
    return order.find((d) => {
      const t = terrainAt(x + DIRS[d][0] * TILE, y - 4 + DIRS[d][1] * TILE);
      return t === "water" || t === "reef" || t === "trench" || t === "deep";
    });
  }

  private syncRemotes(me: number | undefined, players: RemotePlayer[]) {
    this.myId = me;
    const seen = new Set<number>();
    for (const p of players) {
      if (p.id === this.myId) continue;
      seen.add(p.id);
      let r = this.remotes.get(p.id);
      if (!r) {
        r = { view: new AvatarView(this, p.x, p.y, 1 + (p.id % (SHIRT_RAMPS.length - 1)), p.name, false), tx: p.x, ty: p.y };
        this.remotes.set(p.id, r);
      }
      r.tx = p.x;
      r.ty = p.y;
      r.view.anim = p.anim;
      r.view.dir = p.dir;
      r.view.setName(p.name);
    }
    for (const [id, r] of this.remotes) {
      if (!seen.has(id)) {
        r.view.destroy();
        this.remotes.delete(id);
      }
    }
  }

  private drawTerrain() {
    // Painted once per page load at 1 texel = 1 world pixel (style F, terrainArt.ts).
    if (!this.textures.exists("terrain")) this.textures.addCanvas("terrain", paintTerrain());
    this.add.image(-PAINT_OX, -PAINT_OY, "terrain").setOrigin(0).setDepth(0);
  }

  private drawBuildings() {
    const art = makeBuildings(this);
    const shade = this.add.graphics().setDepth(3);
    for (const b of BUILDINGS) {
      const x = b.x * TILE;
      const w = b.w * TILE;
      const bottom = (b.y + b.h) * TILE;
      const a = art[b.key];
      // soft contact shadow to the lower right (light from the upper left)
      if (b.key !== "board") shade.fillStyle(0x06162d, 0.18).fillRect(x + 4, bottom - 3, w - 6, 4);
      const img = this.add.image(x + w / 2, bottom, a.key).setOrigin(0.5, 1).setDepth(depthAt(bottom));
      this.add
        .text(x + w / 2, bottom - a.h - 3, b.label, {
          fontFamily: "Pixelify Sans, system-ui",
          fontSize: "8px",
          color: "#f2fcff",
          stroke: "#06162d",
          strokeThickness: 2,
          resolution: 3,
        })
        .setOrigin(0.5, 1)
        .setDepth(img.depth + 0.0005);
    }
    this.placeProps();
    const zones = [
      { x: 30, y: 38.5, t: "DERMAGA · The Dock" },
      { x: 51, y: 21, t: "KARANG · The Reef" },
      { x: 30, y: 8.6, t: "PALUNG · The Trench" },
    ];
    for (const z of zones) {
      this.add
        .text(z.x * TILE, z.y * TILE, z.t, { fontFamily: "Silkscreen, monospace", fontSize: "8px", color: "#65c9b5", resolution: 3 })
        .setOrigin(0.5)
        .setDepth(4);
    }
  }

  /** Palms on the beach ring, rocks at the waterline, bushes on the grass. Decorative only: collision stays tile based. */
  private placeProps() {
    const palmL = makePalm(this, "palm-l", -1);
    const palmR = makePalm(this, "palm-r", 1);
    const rockS = makeRock(this, "rock-s", 12, 9);
    const rockM = makeRock(this, "rock-m", 20, 14);
    const bush = makeBush(this, "bush");
    const put = (key: string, tx: number, ty: number, shadowW: number) => {
      const x = tx * TILE;
      const y = ty * TILE;
      this.add.image(x + 3, y - 1, "shadow").setDisplaySize(shadowW, Math.max(4, shadowW / 4)).setAlpha(0.26).setDepth(4);
      this.add.image(x, y, key).setOrigin(0.5, 1).setDepth(depthAt(y));
    };
    for (const [tx, ty, side] of [
      [15.2, 17.8, -1],
      [15.0, 24.6, -1],
      [44.8, 17.8, 1],
      [45.0, 24.6, 1],
      [26.4, 31.2, -1],
      [33.6, 31.2, 1],
      [23.6, 12.2, -1],
      [36.6, 12.2, 1],
    ] as const)
      put(side < 0 ? palmL.key : palmR.key, tx, ty, 26);
    for (const [tx, ty, big] of [
      [17.4, 28.2, 1],
      [42.6, 13.6, 1],
      [19.2, 12.4, 0],
      [41.0, 29.0, 0],
      [13.8, 21.0, 0],
      [46.4, 21.4, 1],
    ] as const)
      put(big ? rockM.key : rockS.key, tx, ty, big ? 20 : 12);
    for (const [tx, ty] of [
      [25.2, 19.2],
      [35.0, 19.6],
      [21.0, 24.0],
      [41.5, 22.6],
      [28.0, 25.0],
    ])
      put(bush.key, tx, ty, 18);
  }

  /** Brass lantern on the dock's right post, with a warm ADD-blended light pool that breathes a little. */
  private addLantern() {
    const x = 31 * TILE + 4;
    const y = 31 * TILE + 34;
    const pool = this.add.image(x, y + 6, "glow-warm").setBlendMode(Phaser.BlendModes.ADD).setDepth(8).setAlpha(0.9);
    this.add.image(x, y, "lantern").setOrigin(0.5, 0).setDepth(depthAt(y + 8));
    this.tweens.add({ targets: pool, alpha: 0.7, duration: 1400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  private addAmbient() {
    for (let i = 0; i < 60; i++) {
      const x = Phaser.Math.Between(0, WORLD_W);
      const y = Phaser.Math.Between(0, WORLD_H);
      if (walkable(x, y) || terrainAt(x, y) === "building") continue;
      const s = this.add.image(x, y, "sparkle").setAlpha(0).setDepth(2);
      this.tweens.add({ targets: s, alpha: 0.8, duration: 700, yoyo: true, repeat: -1, delay: Phaser.Math.Between(0, 4000), hold: 200 });
    }
  }
}
