import Phaser from "phaser";
import { emit, on, pad, type Anim, type Dir, type RemotePlayer } from "./bus";
import { BUILDINGS, GRID, SPAWN, TILE, WORLD_H, WORLD_W, fishingZoneAt, nearestBuilding, terrainAt, walkable } from "./map";
import { PAL, SHIRTS, makeTextures } from "./textures";

const SPEED = 72; // px per second
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const FISHING: Anim[] = ["cast", "fishing", "reel"];

/** One avatar as everyone sees it. Catches are always a black "???" silhouette (ART_BIBLE §8, Addendum A2-A3). */
class AvatarView {
  sprite: Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  line: Phaser.GameObjects.Graphics;
  bobber: Phaser.GameObjects.Image;
  silhouette: Phaser.GameObjects.Image;
  mystery: Phaser.GameObjects.Text;
  anim: Anim = "idle";
  dir: Dir = "down";
  private bob = 0;

  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    shirt: number,
    name: string,
    isLocal: boolean,
  ) {
    this.line = scene.add.graphics().setDepth(5);
    this.sprite = scene.add.image(x, y, `avatar${shirt}`).setOrigin(0.5, 1).setDepth(10);
    this.label = scene.add
      .text(x, y - 18, name, { fontFamily: "Nunito, system-ui", fontSize: "8px", color: isLocal ? "#f8d77b" : "#f4efd9", resolution: 3 })
      .setOrigin(0.5, 1)
      .setDepth(20);
    this.bobber = scene.add.image(x, y, "bobber").setDepth(6).setVisible(false);
    this.silhouette = scene.add.image(x, y - 22, "silhouette").setDepth(21).setVisible(false);
    this.mystery = scene.add
      .text(x, y - 30, "???", { fontFamily: "Silkscreen, monospace", fontSize: "8px", color: "#f4efd9", resolution: 3 })
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
    this.sprite.setY(y);
    this.sprite.setAngle(walking ? Math.sin(time / 70) * 6 : 0);
    this.label.setPosition(x, y - 17);
    const fishing = FISHING.includes(this.anim);
    this.bobber.setVisible(fishing);
    this.line.clear();
    if (fishing) {
      const [dx, dy] = DIRS[this.dir];
      this.bob = Math.sin(time / (this.anim === "reel" ? 60 : 300)) * (this.anim === "reel" ? 2 : 1);
      const bx = x + dx * 26;
      const by = y - 6 + dy * 26 + this.bob;
      this.bobber.setPosition(bx, by);
      this.line.lineStyle(1, PAL.foam, 0.8).lineBetween(x + dx * 6, y - 14, bx, by);
    }
    const holding = this.anim === "hold_unknown";
    this.silhouette.setVisible(holding).setPosition(x, y - 24 + Math.sin(time / 250));
    this.mystery.setVisible(holding).setPosition(x, y - 31);
  }

  destroy() {
    [this.sprite, this.label, this.line, this.bobber, this.silhouette, this.mystery].forEach((o) => o.destroy());
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
    this.drawTerrain();
    this.drawBuildings();
    this.addAmbient();

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
        r = { view: new AvatarView(this, p.x, p.y, 1 + (p.id % (SHIRTS.length - 1)), p.name, false), tx: p.x, ty: p.y };
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
    const rt = this.add.renderTexture(0, 0, WORLD_W, WORLD_H).setOrigin(0).setDepth(0);
    for (let y = 0; y < GRID.length; y++)
      for (let x = 0; x < GRID[y].length; x++) {
        const t = GRID[y][x] === "building" ? "grass" : GRID[y][x];
        rt.draw(`t-${t}`, x * TILE, y * TILE);
      }
  }

  private drawBuildings() {
    const g = this.add.graphics().setDepth(3);
    for (const b of BUILDINGS) {
      const x = b.x * TILE;
      const y = b.y * TILE;
      const w = b.w * TILE;
      const h = b.h * TILE;
      if (b.key === "aquarium") {
        g.fillStyle(PAL.ink).fillRect(x - 2, y - 2, w + 4, h + 4);
        g.fillStyle(0x5fd6e0, 0.85).fillRect(x, y, w, h);
        g.fillStyle(PAL.foam, 0.5).fillRect(x + 4, y + 4, 10, 2);
      } else {
        const roof = b.key === "market" ? PAL.coral : b.key === "shop" ? 0x4f8fe8 : PAL.lime;
        g.fillStyle(PAL.ink).fillRect(x - 1, y - 1, w + 2, h + 2);
        g.fillStyle(PAL.foam).fillRect(x, y + h / 3, w, (2 * h) / 3);
        g.fillStyle(roof).fillRect(x, y, w, h / 3 + 2);
        g.fillStyle(PAL.wood).fillRect(x + w / 2 - 4, y + h - 9, 8, 9);
      }
      this.add
        .text(x + w / 2, y - 4, b.label, { fontFamily: "Pixelify Sans, system-ui", fontSize: "8px", color: "#f4efd9", resolution: 3 })
        .setOrigin(0.5, 1)
        .setDepth(4);
    }
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
