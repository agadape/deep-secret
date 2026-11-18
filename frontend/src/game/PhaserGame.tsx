import Phaser from "phaser";
import { useEffect, useRef } from "react";
import { IslandScene } from "./IslandScene";

/**
 * Mounts the Phaser world once. The canvas fills the screen and the camera uses an integer zoom, so pixels stay
 * crisp in portrait phones and wide desktops alike (ART_BIBLE §3.1, §11.6).
 */
export function PhaserGame() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      pixelArt: true,
      backgroundColor: "#163b42",
      scale: { mode: Phaser.Scale.RESIZE, width: "100%", height: "100%" },
      scene: IslandScene,
    });
    return () => game.destroy(true);
  }, []);
  return <div ref={host} className="world" />;
}
