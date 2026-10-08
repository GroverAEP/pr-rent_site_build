"use client";
/**
 * Escena Three.js principal del visor 3D.
 * Carga el room builder + iluminación + hotspots + navegación.
 * Este componente se importa SOLO con next/dynamic + ssr:false.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { TourConfig, LightingMode, NavMode, Hotspot } from "../domain/tour.types";
import { buildFullScene } from "../infrastructure/room-builder";
import * as THREE from "three";

// ─── Tipos exportados ──────────────────────────────────────────────────────────
export interface ViewerProps {
  tourConfig: TourConfig;
  glbUrl?: string;
  onLoadComplete?: () => void;
  onError?: (err?: unknown) => void;
}

interface HotspotState {
  hotspot: Hotspot;
  screenX: number;
  screenY: number;
  visible: boolean;
}

// ─── Constantes de navegación ──────────────────────────────────────────────────
const FPS_SPEED = 4.0;    // m/s
const FPS_SENSITIVITY = 0.002;
const FPS_HEIGHT = 1.65;   // altura de ojos
const COLLISION_MARGIN = 0.4;

// ─── Componente principal ──────────────────────────────────────────────────────
export default function Viewer3DCanvas({ tourConfig, onLoadComplete, onError }: ViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const mouseRef = useRef({ dx: 0, dy: 0, locked: false });
  const yawRef = useRef(0);
  const pitchRef = useRef(0);

  const [navMode, setNavMode] = useState<NavMode>("orbit");
  const navModeRef = useRef<NavMode>("orbit");
  const [lightMode, setLightMode] = useState<LightingMode>("day");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [hotspotPositions, setHotspotPositions] = useState<HotspotState[]>([]);
  const [showControls, setShowControls] = useState(true);

  // Joystick para móvil
  const joystickRef = useRef({ active: false, startX: 0, startY: 0, dx: 0, dy: 0 });

  const changeNavMode = (mode: NavMode) => {
    navModeRef.current = mode;
    setNavMode(mode);
    if (mode === "fps") {
      rendererRef.current?.domElement.requestPointerLock();
    }
  };


  const { width: W, depth: D, height: H } = tourConfig.room;

  // ─── Setup de la escena ────────────────────────────────────────────────────
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (err) {
      onError?.(err);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#87CEEB");
    scene.fog = new THREE.Fog("#87CEEB", 20, 60);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70, mount.clientWidth / mount.clientHeight, 0.05, 100
    );
    // Posición inicial: exterior frente a la puerta
    camera.position.set(0, FPS_HEIGHT, D / 2 + 3);
    camera.lookAt(0, FPS_HEIGHT, 0);
    cameraRef.current = camera;

    // Luces
    setupLights(scene, lightMode);

    // Geometría del local
    const roomGroup = buildFullScene(tourConfig);
    scene.add(roomGroup);

    // Hotspot meshes invisibles (para raycasting)
    const hotspotMeshes: THREE.Mesh[] = [];
    for (const hs of tourConfig.hotspots) {
      const geo = new THREE.SphereGeometry(0.18, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: "#FF6B35", transparent: true, opacity: 0.85 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(hs.x, hs.y, hs.z);
      mesh.userData = { hotspot: hs };
      scene.add(mesh);
      hotspotMeshes.push(mesh);
    }

    // Orbit helper vars
    let orbitTheta = 0;
    let orbitPhi = Math.PI / 3;
    let orbitRadius = Math.min(W, D) * 0.9;
    let orbitDragging = false;
    let orbitLastX = 0;
    let orbitLastY = 0;
    const orbitTarget = new THREE.Vector3(0, H / 2, 0);

    // Posicionar cámara en modo orbit
    function updateOrbitCamera() {
      camera.position.x = orbitTarget.x + orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
      camera.position.y = orbitTarget.y + orbitRadius * Math.cos(orbitPhi);
      camera.position.z = orbitTarget.z + orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
      camera.lookAt(orbitTarget);
    }
    updateOrbitCamera();

    // ─── Eventos mouse / teclado ─────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      if (navMode === "orbit") {
        orbitDragging = true;
        orbitLastX = e.clientX;
        orbitLastY = e.clientY;
      }
    };
    const onMouseUp = () => { orbitDragging = false; };
    const onMouseMove = (e: MouseEvent) => {
      if (navMode === "orbit" && orbitDragging) {
        orbitTheta -= (e.clientX - orbitLastX) * 0.008;
        orbitPhi = Math.max(0.1, Math.min(Math.PI / 2, orbitPhi + (e.clientY - orbitLastY) * 0.005));
        orbitLastX = e.clientX;
        orbitLastY = e.clientY;
        updateOrbitCamera();
      }
      if (navMode === "fps" && mouseRef.current.locked) {
        mouseRef.current.dx += e.movementX;
        mouseRef.current.dy += e.movementY;
      }
    };
    const onWheel = (e: WheelEvent) => {
      if (navMode === "orbit") {
        orbitRadius = Math.max(1.5, Math.min(orbitRadius + e.deltaY * 0.01, 30));
        updateOrbitCamera();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.code);
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.code);

    // Click para raycasting de hotspots
    const raycaster = new THREE.Raycaster();
    const onCanvasClick = (e: MouseEvent) => {
      if (!mount) return;
      const rect = mount.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(hotspotMeshes);
      if (hits.length > 0) {
        setActiveHotspot(hits[0].object.userData.hotspot as Hotspot);
      } else {
        setActiveHotspot(null);
      }
    };

    // Pointer lock para FPS
    const onPointerLockChange = () => {
      mouseRef.current.locked = document.pointerLockElement === renderer.domElement;
    };
    document.addEventListener("pointerlockchange", onPointerLockChange);

    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("click", onCanvasClick);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ─── Loop de animación ───────────────────────────────────────────────────
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);

      if (navModeRef.current === "fps") {
        // Rotación con mouse
        yawRef.current -= mouseRef.current.dx * FPS_SENSITIVITY;
        pitchRef.current -= mouseRef.current.dy * FPS_SENSITIVITY;
        pitchRef.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitchRef.current));
        mouseRef.current.dx = 0;
        mouseRef.current.dy = 0;

        // Movimiento con WASD + joystick
        const forward = new THREE.Vector3(
          -Math.sin(yawRef.current), 0, -Math.cos(yawRef.current)
        );
        const right = new THREE.Vector3(
          Math.cos(yawRef.current), 0, -Math.sin(yawRef.current)
        );
        const moveVec = new THREE.Vector3();

        if (keysRef.current.has("KeyW") || keysRef.current.has("ArrowUp")) moveVec.add(forward);
        if (keysRef.current.has("KeyS") || keysRef.current.has("ArrowDown")) moveVec.sub(forward);
        if (keysRef.current.has("KeyA") || keysRef.current.has("ArrowLeft")) moveVec.sub(right);
        if (keysRef.current.has("KeyD") || keysRef.current.has("ArrowRight")) moveVec.add(right);

        // Joystick móvil
        if (joystickRef.current.active) {
          const jf = joystickRef.current.dy / 50;
          const jr = joystickRef.current.dx / 50;
          moveVec.add(forward.clone().multiplyScalar(-jf));
          moveVec.add(right.clone().multiplyScalar(jr));
        }

        if (moveVec.length() > 0) {
          moveVec.normalize().multiplyScalar(FPS_SPEED * dt);
          const next = camera.position.clone().add(moveVec);
          // Colisiones simples con las paredes
          if (Math.abs(next.x) < W / 2 - COLLISION_MARGIN) camera.position.x = next.x;
          if (Math.abs(next.z) < D / 2 - COLLISION_MARGIN) camera.position.z = next.z;
        }

        camera.position.y = FPS_HEIGHT;

        // Aplicar rotación
        const euler = new THREE.Euler(pitchRef.current, yawRef.current, 0, "YXZ");
        camera.quaternion.setFromEuler(euler);
      }

      // Actualizar posiciones 2D de hotspots
      if (tourConfig.hotspots.length > 0) {
        const positions: HotspotState[] = [];
        for (const hs of tourConfig.hotspots) {
          const pos = new THREE.Vector3(hs.x, hs.y, hs.z);
          const projected = pos.clone().project(camera);
          const screenX = ((projected.x + 1) / 2) * (mount?.clientWidth ?? 0);
          const screenY = ((-projected.y + 1) / 2) * (mount?.clientHeight ?? 0);
          positions.push({
            hotspot: hs,
            screenX,
            screenY,
            visible: projected.z > 0 && projected.z < 1 && Math.abs(projected.x) < 1 && Math.abs(projected.y) < 1,
          });
        }
        setHotspotPositions(positions);
      }

      renderer.render(scene, camera);
    };
    animate();
    onLoadComplete?.();

    // ─── Resize ──────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("click", onCanvasClick);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourConfig, lightMode]);

  // Actualizar luces cuando cambia el modo
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    // Remover luces existentes
    const toRemove = scene.children.filter((c) => c instanceof THREE.Light);
    toRemove.forEach((l) => scene.remove(l));
    setupLights(scene, lightMode);
  }, [lightMode]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    const el = mountRef.current?.parentElement;
    if (!document.fullscreenElement && el) {
      el.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // FPS: solicitar pointer lock
  const handleFpsClick = () => {
    if (navMode === "fps") {
      rendererRef.current?.domElement.requestPointerLock();
    }
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Canvas container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleFpsClick}
      />

      {/* Barra de controles superior */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Nav mode toggle */}
          <div className="flex bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border border-white/10">
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${navMode === "orbit" ? "bg-[#0E5A73] text-white" : "text-white/70 hover:text-white"}`}
              onClick={() => changeNavMode("orbit")}
            >
              🔄 Órbita
            </button>
            <button
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${navMode === "fps" ? "bg-[#0E5A73] text-white" : "text-white/70 hover:text-white"}`}
              onClick={() => changeNavMode("fps")}
            >
              👤 Recorrer
            </button>
          </div>

          {/* Día/Noche */}
          <button
            className="bg-black/60 backdrop-blur-sm border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors"
            onClick={() => setLightMode(m => m === "day" ? "night" : "day")}
          >
            {lightMode === "day" ? "🌙 Noche" : "☀️ Día"}
          </button>
        </div>

        {/* Fullscreen */}
        <button
          className="bg-black/60 backdrop-blur-sm border border-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-black/80 transition-colors pointer-events-auto"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "⬜ Salir" : "⛶ Pantalla completa"}
        </button>
      </div>

      {/* Instrucciones FPS */}
      {navMode === "fps" && showControls && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white/80 text-xs px-4 py-2 rounded-xl border border-white/10 pointer-events-none text-center">
          Haz clic en el visor para capturar el cursor · WASD para moverse · ESC para liberar
          <button
            className="ml-3 text-white/50 hover:text-white pointer-events-auto"
            onClick={() => setShowControls(false)}
          >✕</button>
        </div>
      )}

      {/* Minimapa */}
      <Minimap
        roomWidth={W}
        roomDepth={D}
        cameraRef={cameraRef}
        navMode={navMode}
      />

      {/* Hotspot overlays */}
      {hotspotPositions.map((hs) => hs.visible && (
        <button
          key={hs.hotspot.id}
          className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ left: hs.screenX, top: hs.screenY }}
          onClick={() => setActiveHotspot(hs.hotspot)}
        >
          <span className="w-6 h-6 bg-[#FF6B35] rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold animate-pulse">
            i
          </span>
        </button>
      ))}

      {/* Tarjeta de hotspot activo */}
      {activeHotspot && (
        <div className="absolute bottom-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-72 bg-white rounded-xl shadow-2xl p-4 border border-slate-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{activeHotspot.label}</h4>
              {activeHotspot.description && (
                <p className="text-xs text-slate-600 mt-1">{activeHotspot.description}</p>
              )}
            </div>
            <button
              className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              onClick={() => setActiveHotspot(null)}
            >×</button>
          </div>
        </div>
      )}

      {/* Joystick móvil */}
      {navMode === "fps" && (
        <MobileJoystick joystickRef={joystickRef} />
      )}
    </div>
  );
}

// ─── Iluminación ─────────────────────────────────────────────────────────────
function setupLights(scene: THREE.Scene, mode: LightingMode) {
  const ambient = new THREE.AmbientLight(
    mode === "day" ? "#FFFFFF" : "#1A2040",
    mode === "day" ? 0.6 : 0.15
  );
  scene.add(ambient);

  if (mode === "day") {
    // Luz solar desde exterior
    const sun = new THREE.DirectionalLight("#FFF5E0", 1.2);
    sun.position.set(5, 10, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 50;
    scene.add(sun);

    // Rebote suave
    const fill = new THREE.HemisphereLight("#B0D0F0", "#806040", 0.4);
    scene.add(fill);

    // Luz de techo (punto)
    const ceiling = new THREE.PointLight("#FFFDE0", 0.8, 20, 2);
    ceiling.position.set(0, 2.8, 0);
    scene.add(ceiling);
  } else {
    // Modo noche: lámparas interiores amarillas
    const lamp1 = new THREE.PointLight("#FFD080", 1.5, 12, 2);
    lamp1.position.set(0, 2.8, 0);
    lamp1.castShadow = true;
    scene.add(lamp1);

    const lamp2 = new THREE.PointLight("#FF9040", 0.8, 8, 2);
    lamp2.position.set(-3, 2.5, -3);
    scene.add(lamp2);

    const lamp3 = lamp2.clone();
    lamp3.position.set(3, 2.5, 3);
    scene.add(lamp3);
  }
}

// ─── Minimapa ─────────────────────────────────────────────────────────────────
function Minimap({
  roomWidth, roomDepth, cameraRef, navMode,
}: {
  roomWidth: number;
  roomDepth: number;
  cameraRef: React.RefObject<THREE.PerspectiveCamera | null>;
  navMode: NavMode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let raf: number;
    const draw = () => {
      const canvas = canvasRef.current;
      const cam = cameraRef.current;
      if (!canvas || !cam) { raf = requestAnimationFrame(draw); return; }

      const ctx = canvas.getContext("2d");
      if (!ctx) { raf = requestAnimationFrame(draw); return; }

      const size = 80;
      const scale = size / Math.max(roomWidth, roomDepth);
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, size, size);

      // Plano de la sala
      ctx.strokeStyle = "#FFFFFF44";
      ctx.lineWidth = 1;
      const rx = (size - roomWidth * scale) / 2;
      const rz = (size - roomDepth * scale) / 2;
      ctx.strokeRect(rx, rz, roomWidth * scale, roomDepth * scale);
      ctx.fillStyle = "#FFFFFF08";
      ctx.fillRect(rx, rz, roomWidth * scale, roomDepth * scale);

      // Posición de la cámara
      const cx = size / 2 + cam.position.x * scale;
      const cz = size / 2 + cam.position.z * scale;

      if (navMode === "fps") {
        // Triángulo de visión
        const fovR = 35 * (Math.PI / 180);
        const dir = new THREE.Vector3();
        cam.getWorldDirection(dir);
        const angle = Math.atan2(dir.x, dir.z);
        ctx.beginPath();
        ctx.moveTo(cx, cz);
        ctx.lineTo(cx + Math.sin(angle - fovR) * 14, cz + Math.cos(angle - fovR) * 14);
        ctx.lineTo(cx + Math.sin(angle + fovR) * 14, cz + Math.cos(angle + fovR) * 14);
        ctx.closePath();
        ctx.fillStyle = "#0E5A7355";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(cx, cz, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#FF6B35";
      ctx.fill();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [roomWidth, roomDepth, cameraRef, navMode]);

  return (
    <div className="absolute bottom-3 right-3 rounded-lg overflow-hidden border border-white/20 shadow-lg">
      <canvas ref={canvasRef} className="block" style={{ width: 80, height: 80 }} />
    </div>
  );
}

// ─── Joystick móvil ───────────────────────────────────────────────────────────
function MobileJoystick({
  joystickRef,
}: {
  joystickRef: React.MutableRefObject<{ active: boolean; startX: number; startY: number; dx: number; dy: number }>;
}) {
  const stickRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const MAX_R = 30;

  const handleStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    joystickRef.current = { active: true, startX: t.clientX, startY: t.clientY, dx: 0, dy: 0 };
    e.preventDefault();
  };
  const handleMove = (e: React.TouchEvent) => {
    if (!joystickRef.current.active) return;
    const t = e.touches[0];
    let dx = t.clientX - joystickRef.current.startX;
    let dy = t.clientY - joystickRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > MAX_R) { dx = (dx / dist) * MAX_R; dy = (dy / dist) * MAX_R; }
    joystickRef.current.dx = dx;
    joystickRef.current.dy = dy;
    setKnobPos({ x: dx, y: dy });
    e.preventDefault();
  };
  const handleEnd = () => {
    joystickRef.current = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    setKnobPos({ x: 0, y: 0 });
  };

  return (
    <div
      className="absolute bottom-16 left-6 w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center touch-none sm:hidden"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <div
        ref={stickRef}
        className="w-8 h-8 rounded-full bg-white/60 border border-white/80 shadow"
        style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
      />
    </div>
  );
}
