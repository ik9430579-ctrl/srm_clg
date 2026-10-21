import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, EyeOff, Sparkles, Video, Sliders, Volume2, VolumeX } from 'lucide-react';

interface CyberBackgroundProps {
  interactive?: boolean;
}

export const CyberBackground: React.FC<CyberBackgroundProps> = ({ interactive = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState<number>(0.25);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeTheme, setActiveTheme] = useState<'cyber' | 'quantum' | 'neon'>('cyber');
  const [isDockOpen, setIsDockOpen] = useState<boolean>(false);
  const [meshSpeed, setMeshSpeed] = useState<number>(1);

  // Fallback procedural video canvas generator if mp4 video fails
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        console.log('Video autoplay prevented or suspended');
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070a11, 0.022);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 4, 18);

    const renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Studio PBR Lighting
    const keyLight = new THREE.DirectionalLight(0x00f2fe, 2.5);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x7928ca, 3.0);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x00f2fe, 0x05070e, 1.2);
    scene.add(hemiLight);

    // 3. Composite 6-Part Procedural Cyber-Monolith Group
    const monolithGroup = new THREE.Group();
    monolithGroup.position.set(0, 1.5, 0);

    // Part A: Core crystalline nucleus
    const coreGeo = new THREE.IcosahedronGeometry(2, 2);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x005577,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    monolithGroup.add(coreMesh);

    // Part B: Outer octagonal gimbal frame
    const ringGeo1 = new THREE.TorusGeometry(3.6, 0.08, 16, 64);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x7928ca,
      emissive: 0x3b0764,
      roughness: 0.2,
      metalness: 0.8,
    });
    const ringMesh1 = new THREE.Mesh(ringGeo1, ringMat1);
    monolithGroup.add(ringMesh1);

    // Part C: Secondary perpendicular gimbal ring
    const ringGeo2 = new THREE.TorusGeometry(4.4, 0.06, 16, 64);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      emissive: 0x083344,
      roughness: 0.3,
      metalness: 0.7,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 2;
    monolithGroup.add(ringMesh2);

    // Part D: Orbiting tertiary data ring
    const ringGeo3 = new THREE.TorusGeometry(5.2, 0.05, 16, 64);
    const ringMat3 = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x064e3b,
      roughness: 0.25,
      metalness: 0.85,
    });
    const ringMesh3 = new THREE.Mesh(ringGeo3, ringMat3);
    ringMesh3.rotation.y = Math.PI / 3;
    monolithGroup.add(ringMesh3);

    // Part E: Energy column / conduit tube
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 8, 16);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x00f2fe,
      roughness: 0.1,
      metalness: 1.0,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    monolithGroup.add(tubeMesh);

    // Part F: Soft contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(12, 12);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
      grad.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
      grad.addColorStop(0.5, 'rgba(121, 40, 202, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4;
    monolithGroup.add(shadowPlane);

    scene.add(monolithGroup);

    // 4. Cyber-Grid Floor with procedural wave deformation
    const gridSegments = 60;
    const gridGeo = new THREE.PlaneGeometry(80, 80, gridSegments, gridSegments);
    const gridMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      emissive: 0x0284c7,
      roughness: 0.8,
      metalness: 0.4,
      wireframe: true,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    gridMesh.rotation.x = -Math.PI / 2;
    gridMesh.position.y = -4;
    scene.add(gridMesh);

    // 5. Instanced Particles (120 cyber-motes)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 1] = Math.random() * 20 - 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
      particleSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 32;
    particleCanvas.height = 32;
    const pCtx = particleCanvas.getContext('2d');
    if (pCtx) {
      const grad = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(0, 242, 254, 1)');
      grad.addColorStop(0.5, 'rgba(121, 40, 202, 0.6)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 32, 32);
    }
    const particleTex = new THREE.CanvasTexture(particleCanvas);
    const particleMat = new THREE.PointsMaterial({
      size: 0.4,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 6. Mouse parallax tracking
    const targetCameraPos = new THREE.Vector3(0, 4, 18);
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      targetCameraPos.x = x * 4;
      targetCameraPos.y = 4 + y * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 7. Lossless 60fps Animation Loop with exponential damping
    let animationFrameId: number;
    let lastTime = performance.now();
    const gridPosAttr = gridGeo.attributes.position;
    const initialZ = new Float32Array(gridPosAttr.count);
    for (let i = 0; i < gridPosAttr.count; i++) {
      initialZ[i] = gridPosAttr.getZ(i);
    }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const time = currentTime * 0.001 * meshSpeed;

      // Exponential damping on camera look
      camera.position.x += (targetCameraPos.x - camera.position.x) * (1 - Math.exp(-4 * dt));
      camera.position.y += (targetCameraPos.y - camera.position.y) * (1 - Math.exp(-4 * dt));
      camera.lookAt(0, 0, 0);

      // Rotate Monolith components
      coreMesh.rotation.y += 0.4 * dt;
      coreMesh.rotation.x += 0.2 * dt;
      ringMesh1.rotation.z += 0.5 * dt;
      ringMesh2.rotation.y += 0.6 * dt;
      ringMesh3.rotation.x += 0.4 * dt;

      // Procedural wave ripple on grid
      for (let i = 0; i < gridPosAttr.count; i++) {
        const u = (i % (gridSegments + 1)) / gridSegments;
        const v = Math.floor(i / (gridSegments + 1)) / gridSegments;
        const wave = Math.sin(u * 12 + time * 1.5) * Math.cos(v * 12 + time * 1.2) * 0.6;
        gridPosAttr.setZ(i, initialZ[i] + wave);
      }
      gridPosAttr.needsUpdate = true;

      // Float particles upward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i] * dt;
        if (positions[i * 3 + 1] > 16) {
          positions[i * 3 + 1] = -4;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ringGeo1.dispose();
      ringGeo2.dispose();
      ringGeo3.dispose();
      ringMat1.dispose();
      ringMat2.dispose();
      ringMat3.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      gridGeo.dispose();
      gridMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
    };
  }, [meshSpeed]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Underlying Abstract Cyber Video Loop */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none filter brightness-75 contrast-125 saturate-150"
        style={{ opacity: isVideoPlaying ? videoOpacity : 0 }}
      />

      {/* 2. Cyber-Dark Radial Vignette Scrim */}
      <div className="absolute inset-0 bg-radial from-transparent via-[#070a11]/70 to-[#070a11] pointer-events-none" />

      {/* 3. Three.js Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 pointer-events-none" />

      {/* 4. Compact Floating Ambient Control Dock (<= 15% viewport footprint) */}
      <div className="absolute bottom-4 right-4 z-20 pointer-events-auto">
        {isDockOpen ? (
          <div className="bg-[#090d16]/95 border border-white/10 rounded-xl p-3 shadow-2xl w-64 text-xs text-slate-300 space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Ambient Engine
              </span>
              <button
                onClick={() => setIsDockOpen(false)}
                className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded transition-colors"
                title="Collapse dock"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>Video Layer Opacity</span>
                <span className="font-mono">{Math.round(videoOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.05"
                value={videoOpacity}
                onChange={(e) => setVideoOpacity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded h-1 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px]">Video Motion</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    isVideoPlaying ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isVideoPlaying ? 'Playing' : 'Paused'}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3 text-cyan-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px]">3D Mesh Motion</span>
              <div className="flex items-center gap-1">
                {[0.5, 1, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setMeshSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      meshSpeed === spd ? 'bg-purple-500/30 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsDockOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#090d16]/90 border border-cyan-500/30 text-cyan-300 text-xs shadow-lg hover:border-cyan-400 hover:text-white transition-all backdrop-blur-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">3D & Video Ambience</span>
          </button>
        )}
      </div>
    </div>
  );
};
