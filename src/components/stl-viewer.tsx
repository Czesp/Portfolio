"use client";

import { Component, useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, OrbitControls } from "@react-three/drei";
import type { BufferGeometry } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

function ModelFailure({ url }: { url: string }) {
  return <div role="status" style={{ minHeight: 340, padding: 35, display: "grid", placeContent: "center", textAlign: "center", fontSize: 13, lineHeight: 1.8, color: "#b4bfa9" }}>
    <p>This model could not be displayed in the browser.</p>
    <a href={url} download style={{ color: "#d9ff6a", textDecoration: "underline", textUnderlineOffset: 4 }}>Download the STL to inspect it in a CAD app</a>
  </div>;
}

class ModelErrorBoundary extends Component<{ children: ReactNode; url: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <ModelFailure url={this.props.url} />;
    return this.props.children;
  }
}

function StlFile({ url, label }: { url: string; label: string }) {
  const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let parsed: BufferGeometry | undefined;

    async function loadGeometry() {
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("The model could not be loaded.");
        const data = await response.arrayBuffer();
        if (controller.signal.aborted) return;
        parsed = new STLLoader().parse(data);
        const positions = parsed.getAttribute("position");
        if (!positions || positions.count < 3 || positions.count % 3 !== 0 || !positions.array.every(Number.isFinite)) {
          throw new Error("The STL does not contain valid triangles.");
        }
        parsed.computeVertexNormals();
        parsed.center();
        parsed.computeBoundingSphere();
        if (!parsed.boundingSphere || !Number.isFinite(parsed.boundingSphere.radius) || parsed.boundingSphere.radius === 0) {
          throw new Error("The STL does not contain a visible model.");
        }
        setGeometry(parsed);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }

    void loadGeometry();
    return () => { controller.abort(); parsed?.dispose(); };
  }, [url]);

  if (failed) return <ModelFailure url={url} />;
  if (!geometry) return <div role="status" style={{ minHeight: 340, display: "grid", placeContent: "center", color: "#d9ff6a", fontFamily: "monospace", fontSize: 11 }}>LOADING GEOMETRY…</div>;

  return (
    <div>
      <ModelErrorBoundary url={url} key={url}>
        <div style={{ height: "clamp(300px, 45vw, 480px)", background: "radial-gradient(ellipse at 50% 45%, #293324, #141a13 75%)" }} role="img" aria-label={`Interactive 3D preview of ${label}. Drag to rotate, scroll to zoom. A download link is available above.`}>
          <Canvas camera={{ position: [4, 3, 5], fov: 42 }} dpr={[1, 1.5]} frameloop="demand" fallback={<div style={{ padding: 30, color: "#a8b59f" }}>3D preview requires WebGL. Use Open file to download the model.</div>}>
            <ambientLight intensity={0.9} />
            <directionalLight position={[5, 8, 4]} intensity={3} />
            <directionalLight position={[-5, 2, -3]} intensity={1.8} color="#d9ff6a" />
            <Bounds fit clip observe margin={1.4}><mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}><meshStandardMaterial color="#c5cebd" metalness={0.55} roughness={0.35} /></mesh></Bounds>
            <OrbitControls makeDefault enablePan enableDamping minPolarAngle={0.05} maxPolarAngle={Math.PI - 0.05} />
          </Canvas>
        </div>
      </ModelErrorBoundary>
      <div style={{ padding: "13px 18px", borderTop: "1px solid #ffffff15", color: "#8d9e83", display: "flex", flexWrap: "wrap", gap: "8px 22px", justifyContent: "space-between", fontSize: 9, letterSpacing: 1 }}><span>STL INSPECTION VIEW</span><span>DRAG TO ROTATE · SCROLL TO ZOOM</span></div>
    </div>
  );
}

export default function StlViewer({ url, label }: { url: string; label: string }) {
  return <StlFile key={url} url={url} label={label} />;
}
