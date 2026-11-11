import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { ProjectData } from '../../types/solar';
import { calculateSunPosition, estimateShadingPoint, MONTH_NAMES_TH, MID_MONTH_DAYS } from '../../utils/solarCalculations';
import { Sun, Play, Pause, Camera, Eye, Layers, Compass, Calendar, Clock, Maximize2, RotateCcw } from 'lucide-react';

interface SolarScene3DProps {
  project: ProjectData;
  onCaptureSnapshot?: (dataUrl: string) => void;
}

export const SolarScene3D: React.FC<SolarScene3DProps> = ({ project, onCaptureSnapshot }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Time & Simulation state
  const [hour, setHour] = useState<number>(11.5);
  const [monthIndex, setMonthIndex] = useState<number>(3); // April by default (Summer peak)
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showSunPath, setShowSunPath] = useState<boolean>(true);
  const [showShadows, setShowShadows] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [activeCameraView, setActiveCameraView] = useState<'iso' | 'top' | 'south' | 'sun'>('iso');

  // Realtime computed metrics
  const [realtimeMetrics, setRealtimeMetrics] = useState<{
    altitude: number;
    azimuth: number;
    shadingPercent: number;
    irradianceWm2: number;
    instantKw: number;
  }>({
    altitude: 72,
    azimuth: 175,
    shadingPercent: 0,
    irradianceWm2: 950,
    instantKw: 4.8
  });

  // Three.js internal references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunSphereRef = useRef<THREE.Mesh | null>(null);
  const sunPathLineRef = useRef<THREE.Line | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const modulesGroupRef = useRef<THREE.Group | null>(null);
  const obstacleGroupRef = useRef<THREE.Group | null>(null);
  const treeGroupRef = useRef<THREE.Group | null>(null);
  const shadowProbeBoxesRef = useRef<THREE.Mesh[]>([]);

  // Animation frame tracker
  const animationFrameIdRef = useRef<number>(0);
  const isSoftwareGlRef = useRef<boolean>(false);

  // Procedural texture generator for solar panels (Zero external assets)
  const createSolarPanelTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Deep monocrystalline dark blue gradient
    const grad = ctx.createLinearGradient(0, 0, 512, 1024);
    grad.addColorStop(0, '#0a192f');
    grad.addColorStop(0.5, '#08203e');
    grad.addColorStop(1, '#051329');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle wafer texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 512; i += 8) {
      ctx.fillRect(i, 0, 1, 1024);
    }

    // Busbars (Silver electrical lines)
    ctx.fillStyle = '#e2e8f0';
    const busbarSpacing = 512 / 10;
    for (let b = 1; b < 10; b++) {
      ctx.fillRect(b * busbarSpacing - 1, 0, 2, 1024);
    }

    // Horizontal cell cuts (144 half-cut cells)
    ctx.fillStyle = '#0f172a';
    for (let c = 0; c < 1024; c += 1024 / 24) {
      ctx.fillRect(0, c, 512, 2);
    }

    // Center division line for half-cell architecture
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 510, 512, 4);

    // Aluminum frame edge
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, 512, 1024);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Procedural roof texture (Metal sheet or Tiles)
  const createRoofTexture = useCallback((roofType: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    if (roofType.includes('Metal Sheet')) {
      // Ribbed standing seam metal sheet
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, 512, 512);

      for (let x = 0; x < 512; x += 32) {
        ctx.fillStyle = '#475569';
        ctx.fillRect(x, 0, 26, 512);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 26, 0, 6, 512);
        // Highlight ridge
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x + 27, 0, 2, 512);
      }
    } else if (roofType.includes('Tile')) {
      // CPAC Concrete tile pattern
      ctx.fillStyle = '#4a2810';
      ctx.fillRect(0, 0, 512, 512);

      for (let y = 0; y < 512; y += 32) {
        for (let x = 0; x < 512; x += 64) {
          const offsetX = (y / 32) % 2 === 0 ? 0 : 32;
          ctx.fillStyle = '#7c2d12';
          ctx.fillRect((x + offsetX) % 512, y, 60, 28);
          ctx.fillStyle = '#291307';
          ctx.fillRect((x + offsetX) % 512, y + 28, 64, 4);
        }
      }
    } else {
      // Concrete slab / flat deck
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = '#475569';
      for (let i = 0; i < 500; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        ctx.fillRect(rx, ry, 2, 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);

  // Initialize Three.js scene once
  useEffect(() => {
    if (!mountRef.current) return;

    // Detect software WebGL per Three.js skill directive
    const isSoft = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();
    isSoftwareGlRef.current = isSoft;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 560;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b1329');
    scene.fog = new THREE.FogExp2('#0b1329', 0.015);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
    camera.position.set(18, 14, 22);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoft,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoft ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoft;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    canvasRef.current = renderer.domElement;

    mountRef.current.replaceChildren(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoft;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 4;
    controls.maxDistance = 120;
    controls.target.set(0, 3.5, 0);
    controlsRef.current = controls;

    // Studio Environment lighting (RoomEnvironment per ThreeJS skill)
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch {
      // fallback
    }

    // Ambient / Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.65);
    scene.add(hemiLight);

    // Directional Key Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    sunLight.castShadow = !isSoft;
    sunLight.shadow.mapSize.width = isSoft ? 1024 : 2048;
    sunLight.shadow.mapSize.height = isSoft ? 1024 : 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const shadowD = 22;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Glowing Sun Marker Sphere
    const sunGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
    const sunSphere = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunSphere);
    sunSphereRef.current = sunSphere;

    // Sun Path Celestial Arc
    const sunPathPoints: THREE.Vector3[] = [];
    const arcRadius = 38;
    for (let h = 5.5; h <= 18.5; h += 0.25) {
      const sp = calculateSunPosition(project.location.latitude, MID_MONTH_DAYS[monthIndex], h);
      if (sp.altitudeDeg > 0) {
        const phi = (90 - sp.altitudeDeg) * (Math.PI / 180);
        const theta = (sp.azimuthDeg + 90) * (Math.PI / 180);
        const x = arcRadius * Math.sin(phi) * Math.sin(theta);
        const y = arcRadius * Math.cos(phi);
        const z = arcRadius * Math.sin(phi) * Math.cos(theta);
        sunPathPoints.push(new THREE.Vector3(x, y, z));
      }
    }
    const sunPathGeo = new THREE.BufferGeometry().setFromPoints(sunPathPoints);
    const sunPathMat = new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.65 });
    const sunPathLine = new THREE.Line(sunPathGeo, sunPathMat);
    scene.add(sunPathLine);
    sunPathLineRef.current = sunPathLine;

    // Ground Plane with perimeter landscape
    const groundGeo = new THREE.PlaneGeometry(160, 160);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.05
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.02;
    ground.receiveShadow = !isSoft;
    scene.add(ground);

    // Decorative Cad Grid on ground
    const gridHelper = new THREE.GridHelper(80, 40, 0x3b82f6, 0x1e3a8a);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Compass indicator on ground (True North N, S, E, W)
    const compassGroup = new THREE.Group();
    compassGroup.position.set(0, 0.05, 0);
    const northArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, -1),
      new THREE.Vector3(0, 0.02, 0),
      5,
      0xef4444,
      1.2,
      0.8
    );
    compassGroup.add(northArrow);
    scene.add(compassGroup);

    // Render loop
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update Building, Solar Array, and Obstacles when Project changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // 1. Clean previous meshes
    if (buildingGroupRef.current) scene.remove(buildingGroupRef.current);
    if (modulesGroupRef.current) scene.remove(modulesGroupRef.current);
    if (obstacleGroupRef.current) scene.remove(obstacleGroupRef.current);
    if (treeGroupRef.current) scene.remove(treeGroupRef.current);

    shadowProbeBoxesRef.current = [];

    const b = project.building;
    const l = project.layout;
    const p = project.selectedPanel;
    const isSoft = isSoftwareGlRef.current;

    // -------------------------------------------------------------
    // PROCEDURAL COMPOSITE BUILDING (3-12 Part Procedural Model)
    // -------------------------------------------------------------
    const buildingGroup = new THREE.Group();

    const buildingW = b.widthM;
    const buildingL = b.lengthM;
    const buildingH = b.heightM;

    // Part 1: Main Concrete Wall Envelope
    const wallGeo = new THREE.BoxGeometry(buildingW, buildingH, buildingL);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
      metalness: 0.1
    });
    const walls = new THREE.Mesh(wallGeo, wallMat);
    walls.position.y = buildingH / 2;
    walls.castShadow = !isSoft;
    walls.receiveShadow = !isSoft;
    buildingGroup.add(walls);

    // Part 2: Foundation Plinth / Trim
    const plinthGeo = new THREE.BoxGeometry(buildingW + 0.6, 0.4, buildingL + 0.6);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.9,
      metalness: 0.1
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.2;
    buildingGroup.add(plinth);

    // Part 3: Architectural Windows & Entrance Door
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.1,
      reflectivity: 0.9
    });
    // Front windows
    for (let wx = -buildingW / 3; wx <= buildingW / 3; wx += buildingW / 3) {
      const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.2), glassMat);
      windowMesh.position.set(wx, buildingH * 0.55, buildingL / 2 + 0.05);
      buildingGroup.add(windowMesh);
    }

    // Part 4: Roof Structure (Pitched Gable, Flat Slab, or Carport)
    const roofTexture = createRoofTexture(b.roofType);
    let roofPivotY = buildingH;

    if (b.roofType.includes('Concrete Slab')) {
      // Flat deck with parapet walls
      const slabGeo = new THREE.BoxGeometry(buildingW + 0.4, 0.3, buildingL + 0.4);
      const slabMat = new THREE.MeshStandardMaterial({
        map: roofTexture,
        roughness: 0.85
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.y = buildingH + 0.15;
      slab.receiveShadow = !isSoft;
      buildingGroup.add(slab);

      // Parapets around perimeter
      const parapetH = b.parapetHeightM;
      const parapetThickness = 0.25;
      const parapetMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });

      // North & South parapets
      const pNS = new THREE.BoxGeometry(buildingW + 0.4, parapetH, parapetThickness);
      const pNorth = new THREE.Mesh(pNS, parapetMat);
      pNorth.position.set(0, buildingH + 0.3 + parapetH / 2, -buildingL / 2 - 0.1);
      pNorth.castShadow = !isSoft;
      const pSouth = new THREE.Mesh(pNS, parapetMat);
      pSouth.position.set(0, buildingH + 0.3 + parapetH / 2, buildingL / 2 + 0.1);
      pSouth.castShadow = !isSoft;
      buildingGroup.add(pNorth, pSouth);

      // East & West parapets
      const pEW = new THREE.BoxGeometry(parapetThickness, parapetH, buildingL + 0.4);
      const pEast = new THREE.Mesh(pEW, parapetMat);
      pEast.position.set(buildingW / 2 + 0.1, buildingH + 0.3 + parapetH / 2, 0);
      pEast.castShadow = !isSoft;
      const pWest = new THREE.Mesh(pEW, parapetMat);
      pWest.position.set(-buildingW / 2 - 0.1, buildingH + 0.3 + parapetH / 2, 0);
      pWest.castShadow = !isSoft;
      buildingGroup.add(pEast, pWest);

      roofPivotY = buildingH + 0.3;
    } else {
      // Pitched Gable Roof
      const roofPitchRad = (b.roofTiltDeg * Math.PI) / 180;
      const roofOverhang = 0.5;
      const halfL = (buildingL + roofOverhang * 2) / 2;
      const roofRise = Math.tan(roofPitchRad) * halfL;

      const roofMat = new THREE.MeshStandardMaterial({
        map: roofTexture,
        roughness: 0.65,
        metalness: 0.15
      });

      // South-facing slope (PV side)
      const slopeLength = halfL / Math.cos(roofPitchRad);
      const southSlopeGeo = new THREE.BoxGeometry(buildingW + roofOverhang * 2, 0.15, slopeLength);
      const southSlope = new THREE.Mesh(southSlopeGeo, roofMat);
      southSlope.rotation.x = roofPitchRad;
      southSlope.position.set(0, buildingH + roofRise / 2, halfL / 2);
      southSlope.castShadow = !isSoft;
      southSlope.receiveShadow = !isSoft;
      buildingGroup.add(southSlope);

      // North-facing slope
      const northSlope = new THREE.Mesh(southSlopeGeo, roofMat);
      northSlope.rotation.x = -roofPitchRad;
      northSlope.position.set(0, buildingH + roofRise / 2, -halfL / 2);
      northSlope.castShadow = !isSoft;
      northSlope.receiveShadow = !isSoft;
      buildingGroup.add(northSlope);

      // Gable triangle walls
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-halfL, 0);
      gableShape.lineTo(0, roofRise);
      gableShape.lineTo(halfL, 0);
      gableShape.closePath();

      const extrudeSettings = { depth: 0.2, bevelEnabled: false };
      const gableGeo = new THREE.ExtrudeGeometry(gableShape, extrudeSettings);
      const gableMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });

      const eastGable = new THREE.Mesh(gableGeo, gableMat);
      eastGable.rotation.y = Math.PI / 2;
      eastGable.position.set(buildingW / 2, buildingH, 0);
      const westGable = eastGable.clone();
      westGable.position.set(-buildingW / 2 - 0.2, buildingH, 0);
      buildingGroup.add(eastGable, westGable);

      // Ridge Cap
      const ridgeGeo = new THREE.BoxGeometry(buildingW + roofOverhang * 2 + 0.1, 0.12, 0.35);
      const ridgeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const ridge = new THREE.Mesh(ridgeGeo, ridgeMat);
      ridge.position.set(0, buildingH + roofRise + 0.06, 0);
      buildingGroup.add(ridge);

      roofPivotY = buildingH + roofRise * 0.45;
    }

    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    // -------------------------------------------------------------
    // SOLAR PV MODULES ARRAY
    // -------------------------------------------------------------
    const modulesGroup = new THREE.Group();
    const panelTexture = createSolarPanelTexture();

    const panelLenM = p.length / 1000;
    const panelWidM = p.width / 1000;
    const panelThickM = 0.04;

    const modGeo = new THREE.BoxGeometry(panelWidM, panelThickM, panelLenM);
    const modFaceMat = new THREE.MeshStandardMaterial({
      map: panelTexture,
      roughness: 0.25,
      metalness: 0.4
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8
    });
    const modMaterials = [
      frameMat, frameMat, modFaceMat, frameMat, frameMat, frameMat
    ];

    const totalCols = l.modulesPerRow;
    const totalRows = l.rows;
    const gapX = 0.03;
    const gapZ = l.rowSpacingM;

    const arrayTotalW = totalCols * panelWidM + (totalCols - 1) * gapX;
    const arrayTotalL = totalRows * panelLenM + (totalRows - 1) * gapZ;

    const arrayTiltRad = (l.panelTiltDeg * Math.PI) / 180;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const modMesh = new THREE.Mesh(modGeo, modMaterials);

        // Position within grid
        const posX = (c - (totalCols - 1) / 2) * (panelWidM + gapX);
        const posZ = (r - (totalRows - 1) / 2) * (panelLenM + gapZ);

        modMesh.position.set(posX, 0.05, posZ);
        modMesh.castShadow = !isSoft;
        modMesh.receiveShadow = !isSoft;

        modulesGroup.add(modMesh);

        // Probe box for real-time raycast shading detection
        shadowProbeBoxesRef.current.push(modMesh);
      }
    }

    // Tilt array and place on roof surface
    modulesGroup.rotation.x = arrayTiltRad;
    if (b.roofType.includes('Concrete Slab')) {
      modulesGroup.position.set(0, roofPivotY + 0.35, 0);
    } else {
      // Placed along south slope
      modulesGroup.position.set(0, roofPivotY + 0.3, buildingL * 0.2);
    }

    scene.add(modulesGroup);
    modulesGroupRef.current = modulesGroup;

    // -------------------------------------------------------------
    // ROOFTOP OBSTACLES (AC Condensing Units or Water Tank)
    // -------------------------------------------------------------
    const obstacleGroup = new THREE.Group();
    if (b.hasObstacles && b.obstacleType !== 'None') {
      if (b.obstacleType === 'AC Units') {
        // Multi-part AC Outdoor Units
        for (let i = -1; i <= 1; i += 2) {
          const acBox = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 1.1, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.5, metalness: 0.3 })
          );
          acBox.castShadow = !isSoft;
          acBox.position.set(i * 3.5, roofPivotY + 0.55, -buildingL * 0.28);

          // Fan grill
          const fanGrill = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.35, 0.05, 16),
            new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
          );
          fanGrill.rotation.x = Math.PI / 2;
          fanGrill.position.set(i * 3.5, roofPivotY + 0.55, -buildingL * 0.28 + 0.31);
          obstacleGroup.add(acBox, fanGrill);
        }
      } else if (b.obstacleType === 'Water Tank') {
        // Stainless steel water storage cylinder on stand
        const tankStand = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 0.8, 0.6, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 })
        );
        tankStand.position.set(-buildingW * 0.3, roofPivotY + 0.3, -buildingL * 0.25);

        const tankCylinder = new THREE.Mesh(
          new THREE.CylinderGeometry(0.75, 0.75, 2.0, 24),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
        );
        tankCylinder.castShadow = !isSoft;
        tankCylinder.position.set(-buildingW * 0.3, roofPivotY + 1.6, -buildingL * 0.25);
        obstacleGroup.add(tankStand, tankCylinder);
      }
    }
    scene.add(obstacleGroup);
    obstacleGroupRef.current = obstacleGroup;

    // -------------------------------------------------------------
    // NEARBY PROCEDURAL SHADE TREE (3-Part Composite Model)
    // -------------------------------------------------------------
    const treeGroup = new THREE.Group();
    if (b.hasObstacles && b.obstacleType === 'Trees Nearby') {
      const treeDist = b.treeDistanceM;
      const treeH = b.treeHeightM;

      // Tree Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, treeH * 0.6, 12);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.set(treeDist, (treeH * 0.6) / 2, 0);
      trunk.castShadow = !isSoft;
      treeGroup.add(trunk);

      // Layered Organic Foliage (3 tiered spheres)
      const foliageMat = new THREE.MeshStandardMaterial({
        color: 0x166534,
        roughness: 0.85
      });
      const canopy1 = new THREE.Mesh(new THREE.SphereGeometry(treeH * 0.35, 16, 16), foliageMat);
      canopy1.position.set(treeDist, treeH * 0.65, 0);
      canopy1.castShadow = !isSoft;

      const canopy2 = new THREE.Mesh(new THREE.SphereGeometry(treeH * 0.28, 16, 16), foliageMat);
      canopy2.position.set(treeDist + 0.4, treeH * 0.85, 0.3);
      canopy2.castShadow = !isSoft;

      const canopy3 = new THREE.Mesh(new THREE.SphereGeometry(treeH * 0.22, 16, 16), foliageMat);
      canopy3.position.set(treeDist - 0.3, treeH * 1.0, -0.2);
      canopy3.castShadow = !isSoft;

      treeGroup.add(canopy1, canopy2, canopy3);
    }
    scene.add(treeGroup);
    treeGroupRef.current = treeGroup;

  }, [project, createRoofTexture, createSolarPanelTexture]);

  // Update Sun Direction, Position, and Shading Analytics whenever hour or month changes
  useEffect(() => {
    const sunLight = sunLightRef.current;
    const sunSphere = sunSphereRef.current;
    const sunPathLine = sunPathLineRef.current;
    const scene = sceneRef.current;
    if (!sunLight || !sunSphere || !scene) return;

    const dayOfYear = MID_MONTH_DAYS[monthIndex];
    const sun = calculateSunPosition(project.location.latitude, dayOfYear, hour);

    // Compute sun coordinates in Three.js world space
    const arcRadius = 40;
    const phi = (90 - Math.max(0.5, sun.altitudeDeg)) * (Math.PI / 180);
    const theta = (sun.azimuthDeg + 90) * (Math.PI / 180);

    const x = arcRadius * Math.sin(phi) * Math.sin(theta);
    const y = Math.max(0.5, arcRadius * Math.cos(phi));
    const z = arcRadius * Math.sin(phi) * Math.cos(theta);

    sunLight.position.set(x, y, z);
    sunLight.target.position.set(0, project.building.heightM / 2, 0);
    sunLight.target.updateMatrixWorld();

    sunSphere.position.set(x, y, z);

    // If sun is below horizon or dusk/dawn, adjust light intensity & color
    if (!sun.isDaylight) {
      sunLight.intensity = 0.05;
      sunLight.color.setHex(0x1e293b);
      sunSphere.visible = false;
    } else {
      sunSphere.visible = showSunPath;
      // Sunrise / Sunset golden hour vs midday bright white-warm
      const warmFactor = Math.min(1, Math.max(0, (sun.altitudeDeg - 5) / 25));
      const sunColor = new THREE.Color().lerpColors(new THREE.Color(0xff7722), new THREE.Color(0xfffbeb), warmFactor);
      sunLight.color = sunColor;
      sunLight.intensity = (sun.altitudeDeg / 90) * 2.8 + 0.3;
    }

    // Update Celestial Arc for this month
    if (sunPathLine && showSunPath) {
      const sunPathPoints: THREE.Vector3[] = [];
      for (let h = 5.5; h <= 18.5; h += 0.25) {
        const sp = calculateSunPosition(project.location.latitude, dayOfYear, h);
        if (sp.altitudeDeg > 0) {
          const p = (90 - sp.altitudeDeg) * (Math.PI / 180);
          const t = (sp.azimuthDeg + 90) * (Math.PI / 180);
          sunPathPoints.push(new THREE.Vector3(
            arcRadius * Math.sin(p) * Math.sin(t),
            arcRadius * Math.cos(p),
            arcRadius * Math.sin(p) * Math.cos(t)
          ));
        }
      }
      sunPathLine.geometry.dispose();
      sunPathLine.geometry = new THREE.BufferGeometry().setFromPoints(sunPathPoints);
      sunPathLine.visible = true;
    } else if (sunPathLine) {
      sunPathLine.visible = false;
    }

    // Calculate real-time instantaneous metrics & shading
    const simPoint = estimateShadingPoint(project, monthIndex, hour);
    setRealtimeMetrics({
      altitude: simPoint.sunAltitudeDeg,
      azimuth: simPoint.sunAzimuthDeg,
      shadingPercent: simPoint.shadingLossPercent,
      irradianceWm2: simPoint.irradianceWm2,
      instantKw: simPoint.effectiveGenerationKw
    });

  }, [hour, monthIndex, project, showSunPath]);

  // Daylight animation loop when "Play" is toggled
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setHour((prev) => {
        const next = prev + 0.15;
        if (next > 18.2) return 6.0;
        return Math.round(next * 100) / 100;
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Camera presets
  const setCameraPreset = (view: 'iso' | 'top' | 'south' | 'sun') => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    setActiveCameraView(view);
    const bh = project.building.heightM;

    if (view === 'iso') {
      camera.position.set(18, bh + 10, 20);
      controls.target.set(0, bh * 0.7, 0);
    } else if (view === 'top') {
      camera.position.set(0, bh + 26, 0.1);
      controls.target.set(0, bh, 0);
    } else if (view === 'south') {
      camera.position.set(0, bh + 4, 24);
      controls.target.set(0, bh + 1, 0);
    } else if (view === 'sun') {
      // Look from the sun's perspective down towards the building
      const sunSphere = sunSphereRef.current;
      if (sunSphere) {
        camera.position.copy(sunSphere.position).multiplyScalar(0.75);
        controls.target.set(0, bh * 0.6, 0);
      }
    }
    controls.update();
  };

  // High-res snapshot capture
  const handleSnapshot = () => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!renderer || !scene || !camera) return;

    renderer.render(scene, camera);
    const dataUrl = renderer.domElement.toDataURL('image/png');
    if (onCaptureSnapshot) {
      onCaptureSnapshot(dataUrl);
    } else {
      // Direct download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `SolarPro-3D-Simulation-${project.clientName || 'Project'}.png`;
      a.click();
    }
  };

  const formatHourString = (val: number) => {
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} น.`;
  };

  return (
    <div className="relative w-full h-[640px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD: Title & Engineering Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2.5 rounded-xl shadow-lg pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
            <h3 className="text-white font-semibold text-sm tracking-wide">
              3D Shading Simulation & Solar CAD
            </h3>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono">
              PVsyst Standard
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5">
            {project.building.roofType} • {project.selectedPanel.brand} {project.selectedPanel.wattage}W × {project.layout.modulesPerRow * project.layout.rows} แผง ({((project.layout.modulesPerRow * project.layout.rows * project.selectedPanel.wattage) / 1000).toFixed(2)} kWp)
          </p>
        </div>

        {/* Real-time Sun & Shading Telemetry */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-4 text-xs font-mono pointer-events-auto">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-sans">มุมเงย (Elevation)</div>
            <div className="text-amber-300 font-bold">{realtimeMetrics.altitude}°</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-sans">มุมทิศ (Azimuth)</div>
            <div className="text-blue-300 font-bold">{realtimeMetrics.azimuth}°</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-sans">ความเข้มแสง (POA)</div>
            <div className="text-emerald-300 font-bold">{realtimeMetrics.irradianceWm2} W/m²</div>
          </div>
          <div className="border-l border-slate-700 pl-3">
            <div className="text-slate-400 text-[10px] uppercase font-sans">Shading Loss</div>
            <div className={`font-bold ${realtimeMetrics.shadingPercent > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {realtimeMetrics.shadingPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Top-Right Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleSnapshot}
          className="bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95"
          title="บันทึกภาพ 3D ไปยังเล่ม Proposal"
        >
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>บันทึกภาพ 3D (Proposal)</span>
        </button>
      </div>

      {/* Compass Rose Badge */}
      <div className="absolute bottom-28 right-4 z-10 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-300 shadow pointer-events-none flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5 text-rose-400" />
        <span>N: ทิศเหนือ | S: ทิศใต้</span>
      </div>

      {/* Collapsible Unified Bottom Control Dock (Following ThreeJS skill zero-viewport occlusion) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[880px] transition-all duration-300 ${
          dockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Tab */}
        <div className="flex justify-center">
          <button
            onClick={() => setDockCollapsed(!dockCollapsed)}
            className="bg-slate-900/95 border-t border-x border-slate-700/80 text-slate-300 hover:text-white px-4 py-1 text-xs rounded-t-lg shadow-md flex items-center gap-1.5"
          >
            {dockCollapsed ? '▴ แสดงแถบควบคุมจำลองแสงเงา' : '▾ ซ่อนแถบควบคุม (Cinema View)'}
          </button>
        </div>

        {/* Dock Panel */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Play & Time Slider (Cols 1-6) */}
            <div className="md:col-span-6 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition-colors"
                    title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นจำลองการเคลื่อนที่ของดวงอาทิตย์'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    เวลาจำลอง:
                  </span>
                  <span className="font-mono text-amber-300 font-bold">{formatHourString(hour)}</span>
                </div>
                <span className="text-[11px] text-slate-400">06:00 - 18:00</span>
              </div>
              <input
                type="range"
                min="6"
                max="18"
                step="0.1"
                value={hour}
                onChange={(e) => setHour(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Month Selector (Cols 7-9) */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3 text-blue-400" />
                เดือน / ฤดูกาล:
              </label>
              <select
                value={monthIndex}
                onChange={(e) => setMonthIndex(parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {MONTH_NAMES_TH.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m} {idx === 3 ? '(แดดจัดสุด / เมษายน)' : idx === 11 ? '(องศาต่ำสุด / ธันวาคม)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Camera Presets & Toggles (Cols 10-12) */}
            <div className="md:col-span-3 flex flex-col gap-1.5">
              <div className="text-[11px] text-slate-400 font-medium">มุมกล้อง (Camera Views)</div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setCameraPreset('iso')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeCameraView === 'iso' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="มุมมอง 3 มิติ Isometric"
                >
                  3D
                </button>
                <button
                  onClick={() => setCameraPreset('top')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeCameraView === 'top' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="มุมมองบน Top Roof Plan"
                >
                  หลังคา
                </button>
                <button
                  onClick={() => setCameraPreset('south')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeCameraView === 'south' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="มองจากทิศใต้เข้าหาแผง"
                >
                  ทิศใต้
                </button>
                <button
                  onClick={() => setCameraPreset('sun')}
                  className={`px-1.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeCameraView === 'sun' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="มุมมองจากดวงอาทิตย์ (Sun-Eye View ตรวจสอบเงา)"
                >
                  แดด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
