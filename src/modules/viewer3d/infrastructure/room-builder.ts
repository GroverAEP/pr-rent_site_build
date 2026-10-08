"use client";
/**
 * Generador paramétrico de sala 3D.
 * Construye paredes, piso, techo, puertas, ventanas y mobiliario
 * a partir de un TourConfig. Todos los valores en metros; Three.js usa 1u = 1m.
 */

import * as THREE from "three";
import {
  TourConfig,
  FloorMaterial,
  WallMaterial,
  FurniturePreset,
} from "../domain/tour.types";

// ─── Paleta de colores de materiales ──────────────────────────────────────────
const FLOOR_COLORS: Record<FloorMaterial, string> = {
  ceramic: "#E8E0D0",
  wood: "#A0724A",
  concrete: "#9E9E9E",
  marble: "#F0EEE8",
  vinyl: "#C8B89A",
};

const WALL_COLORS: Record<WallMaterial, string> = {
  white: "#F5F5F0",
  cream: "#F5EDD8",
  gray: "#D0D0C8",
  painted: "#C8DDED",
  brick: "#B56A52",
};

// ─── Helpers de geometría ──────────────────────────────────────────────────────
function createBox(
  w: number, h: number, d: number,
  color: string, roughness = 0.8, metalness = 0
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return new THREE.Mesh(geo, mat);
}

// ─── Generadores de piezas ─────────────────────────────────────────────────────

export function buildRoom(cfg: TourConfig): THREE.Group {
  const group = new THREE.Group();
  const { width: W, depth: D, height: H } = cfg.room;
  const floorColor = FLOOR_COLORS[cfg.floor];
  const wallColor = WALL_COLORS[cfg.walls];

  // Piso
  const floor = createBox(W, 0.05, D, floorColor, 0.9);
  floor.position.set(0, -0.025, 0);
  floor.receiveShadow = true;
  group.add(floor);

  // Techo
  const ceiling = createBox(W, 0.05, D, "#FAFAFA", 1);
  ceiling.position.set(0, H + 0.025, 0);
  group.add(ceiling);

  // Paredes (sin huecos de puerta/ventana – se añaden por separado como planos)
  // Pared trasera
  const backWall = createBox(W, H, 0.12, wallColor, 0.9);
  backWall.position.set(0, H / 2, -D / 2);
  backWall.receiveShadow = true;
  group.add(backWall);

  // Pared frontal
  const frontWall = createBox(W, H, 0.12, wallColor, 0.9);
  frontWall.position.set(0, H / 2, D / 2);
  frontWall.receiveShadow = true;
  group.add(frontWall);

  // Pared izquierda
  const leftWall = createBox(0.12, H, D, wallColor, 0.9);
  leftWall.position.set(-W / 2, H / 2, 0);
  leftWall.receiveShadow = true;
  group.add(leftWall);

  // Pared derecha
  const rightWall = createBox(0.12, H, D, wallColor, 0.9);
  rightWall.position.set(W / 2, H / 2, 0);
  rightWall.receiveShadow = true;
  group.add(rightWall);

  return group;
}

export function buildDoor(cfg: TourConfig): THREE.Group {
  const group = new THREE.Group();
  const { width: W, depth: D, height: H } = cfg.room;
  const door = cfg.door;
  const dW = door.width;
  const dH = Math.min(2.2, H * 0.75);
  const frameColor = "#6B4C2A";
  const doorColor = "#8B6040";

  let x = 0, z = 0, rotY = 0;
  switch (door.wall) {
    case "front":  z = D / 2;  x = (door.offset - 0.5) * W; break;
    case "back":   z = -D / 2; x = (door.offset - 0.5) * W; rotY = Math.PI; break;
    case "left":   x = -W / 2; z = (door.offset - 0.5) * D; rotY = Math.PI / 2; break;
    case "right":  x = W / 2;  z = (door.offset - 0.5) * D; rotY = -Math.PI / 2; break;
  }

  // Marco
  const frameTop = createBox(dW + 0.15, 0.1, 0.14, frameColor);
  frameTop.position.set(x, dH + 0.05, z);
  frameTop.rotation.y = rotY;
  group.add(frameTop);

  const frameL = createBox(0.08, dH, 0.14, frameColor);
  frameL.position.set(x - dW / 2 - 0.04, dH / 2, z);
  frameL.rotation.y = rotY;
  group.add(frameL);

  const frameR = createBox(0.08, dH, 0.14, frameColor);
  frameR.position.set(x + dW / 2 + 0.04, dH / 2, z);
  frameR.rotation.y = rotY;
  group.add(frameR);

  // Hoja
  const leaf = createBox(dW - 0.04, dH - 0.04, 0.06, doorColor, 0.7, 0.1);
  leaf.position.set(x, dH / 2, z);
  leaf.rotation.y = rotY;
  group.add(leaf);

  return group;
}

export function buildWindows(cfg: TourConfig): THREE.Group {
  const group = new THREE.Group();
  const { width: W, depth: D } = cfg.room;
  const frameColor = "#FFFFFF";
  const glassColor = "#A0C4E0";

  for (const win of cfg.windows) {
    let x = 0, z = 0, rotY = 0;
    switch (win.wall) {
      case "front":  z = D / 2;  x = (win.offset - 0.5) * W; break;
      case "back":   z = -D / 2; x = (win.offset - 0.5) * W; rotY = Math.PI; break;
      case "left":   x = -W / 2; z = (win.offset - 0.5) * D; rotY = Math.PI / 2; break;
      case "right":  x = W / 2;  z = (win.offset - 0.5) * D; rotY = -Math.PI / 2; break;
    }

    const centerY = win.sillHeight + win.height / 2;

    // Marco
    const frame = createBox(win.width + 0.1, win.height + 0.1, 0.1, frameColor, 1);
    frame.position.set(x, centerY, z);
    frame.rotation.y = rotY;
    group.add(frame);

    // Vidrio
    const glassMat = new THREE.MeshStandardMaterial({
      color: glassColor,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.2,
    });
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(win.width - 0.05, win.height - 0.05, 0.04),
      glassMat
    );
    glass.position.set(x, centerY, z);
    glass.rotation.y = rotY;
    group.add(glass);
  }

  return group;
}

// ─── Mobiliario paramétrico ────────────────────────────────────────────────────

function buildCounter(): THREE.Group {
  const g = new THREE.Group();
  const base = createBox(2.4, 1.05, 0.6, "#E8DCC8", 0.8);
  base.position.y = 0.525;
  const top = createBox(2.5, 0.06, 0.65, "#C0A880", 0.5, 0.1);
  top.position.y = 1.08;
  g.add(base, top);
  return g;
}

function buildShelves(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const shelf = createBox(2, 0.04, 0.4, "#D4C4A0", 0.9);
    shelf.position.set(0, 0.5 + i * 0.5, 0);
    const back = createBox(2, 0.04 + i * 0.5, 0.04, "#C8B890", 0.9);
    back.position.set(0, 0.27 + i * 0.25, -0.2);
    g.add(shelf, back);
  }
  const frame = createBox(0.04, 2.2, 0.44, "#B0A080", 0.9);
  frame.position.set(-1.02, 1.1, 0);
  const frame2 = frame.clone();
  frame2.position.x = 1.02;
  g.add(frame, frame2);
  return g;
}

function buildTable(): THREE.Group {
  const g = new THREE.Group();
  const top = createBox(0.9, 0.04, 0.9, "#C8A878", 0.7, 0.05);
  top.position.y = 0.74;
  const legs = [[-0.38, -0.38], [-0.38, 0.38], [0.38, -0.38], [0.38, 0.38]];
  for (const [lx, lz] of legs) {
    const leg = createBox(0.06, 0.72, 0.06, "#A0806A", 0.8);
    leg.position.set(lx, 0.36, lz);
    g.add(leg);
  }
  g.add(top);
  return g;
}

function buildVitrine(): THREE.Group {
  const g = new THREE.Group();
  const base = createBox(1.8, 0.9, 0.5, "#D0C0A0", 0.8);
  base.position.y = 0.45;
  const glassMat = new THREE.MeshStandardMaterial({
    color: "#B8D8F0", transparent: true, opacity: 0.4, roughness: 0.1,
  });
  const glassTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.5), glassMat);
  glassTop.position.y = 1.3;
  g.add(base, glassTop);
  return g;
}

function buildDesk(): THREE.Group {
  const g = new THREE.Group();
  const surface = createBox(1.4, 0.04, 0.7, "#D4C0A0", 0.7);
  surface.position.y = 0.74;
  const panel = createBox(0.04, 0.7, 0.7, "#C4B090", 0.8);
  panel.position.set(-0.68, 0.37, 0);
  const leg = createBox(0.06, 0.72, 0.06, "#B0A080", 0.8);
  leg.position.set(0.68, 0.36, -0.3);
  const leg2 = leg.clone();
  leg2.position.z = 0.3;
  g.add(surface, panel, leg, leg2);
  return g;
}

function buildRack(): THREE.Group {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const shelf = createBox(1.2, 0.03, 0.45, "#C0C0C0", 1, 0.3);
    shelf.position.y = 0.3 + i * 0.4;
    g.add(shelf);
  }
  const col1 = createBox(0.04, 2.3, 0.49, "#A0A0A0", 1, 0.5);
  col1.position.set(-0.61, 1.15, 0);
  const col2 = col1.clone();
  col2.position.x = 0.61;
  g.add(col1, col2);
  return g;
}

function buildFridge(): THREE.Group {
  const g = new THREE.Group();
  const body = createBox(0.7, 1.9, 0.75, "#E8E8E8", 0.6, 0.2);
  body.position.y = 0.95;
  const door1 = createBox(0.32, 1.82, 0.06, "#D0D0D0", 0.5, 0.3);
  door1.position.set(-0.18, 0.94, 0.4);
  const door2 = door1.clone();
  door2.position.x = 0.18;
  g.add(body, door1, door2);
  return g;
}

export function buildFurniturePiece(preset: FurniturePreset): THREE.Group {
  let piece: THREE.Group;
  switch (preset.type) {
    case "counter":  piece = buildCounter(); break;
    case "shelves":  piece = buildShelves(); break;
    case "tables":   piece = buildTable(); break;
    case "vitrine":  piece = buildVitrine(); break;
    case "desk":     piece = buildDesk(); break;
    case "rack":     piece = buildRack(); break;
    case "fridge":   piece = buildFridge(); break;
    default:         piece = new THREE.Group();
  }
  piece.position.set(preset.x, 0, preset.z);
  piece.rotation.y = (preset.rotation * Math.PI) / 180;
  if (preset.scale) piece.scale.setScalar(preset.scale);
  piece.traverse((obj) => { if (obj instanceof THREE.Mesh) obj.castShadow = true; });
  return piece;
}

export function buildFullScene(cfg: TourConfig): THREE.Group {
  const scene = new THREE.Group();
  scene.add(buildRoom(cfg));
  scene.add(buildDoor(cfg));
  scene.add(buildWindows(cfg));
  for (const f of cfg.furniture) {
    scene.add(buildFurniturePiece(f));
  }
  return scene;
}
