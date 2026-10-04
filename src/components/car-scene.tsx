"use client";

import React, { Component, Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

type CarSceneProps = {
  /** Normalized scroll journey: assembled, exploded, then assembled again. */
  progress: number;
  reducedMotion?: boolean;
  onReady?: () => void;
};

type V3 = [number, number, number];
type Section = [number, number, number, number, number, number];

const LIME = "#c6f36b";
const ease = (start: number, end: number, value: number) => {
  const t = THREE.MathUtils.clamp((value - start) / (end - start), 0, 1);
  return t * t * (3 - 2 * t);
};

type JourneyPose = {
  x: number;
  y: number;
  z: number;
  scale: number;
  pitch: number;
  roll: number;
};

const JOURNEY: (JourneyPose & { at: number })[] = [
  { at: 0, x: 0.1, y: -0.12, z: -0.12, scale: 0.84, pitch: 0, roll: 0 },
  { at: 0.1, x: 0.16, y: -0.08, z: 0.08, scale: 0.9, pitch: -0.015, roll: 0.01 },
  { at: 0.25, x: -0.52, y: 0.12, z: 0.36, scale: 0.94, pitch: -0.07, roll: -0.045 },
  { at: 0.43, x: 0.52, y: -0.06, z: -0.48, scale: 0.73, pitch: 0.075, roll: 0.035 },
  { at: 0.58, x: -0.6, y: 0.13, z: 0.18, scale: 0.84, pitch: -0.045, roll: -0.035 },
  { at: 0.72, x: 0.32, y: 0.02, z: -0.52, scale: 0.77, pitch: 0.06, roll: 0.025 },
  { at: 0.87, x: -0.32, y: -0.055, z: 0.28, scale: 0.94, pitch: -0.035, roll: -0.015 },
  { at: 0.96, x: 0.1, y: -0.12, z: -0.12, scale: 0.84, pitch: 0, roll: 0 },
  { at: 1, x: 0.1, y: -0.12, z: -0.12, scale: 0.84, pitch: 0, roll: 0 },
];

function sampleJourney(progress: number, pose: JourneyPose) {
  let segment = 0;
  while (segment < JOURNEY.length - 2 && progress > JOURNEY[segment + 1].at) segment++;
  const from = JOURNEY[segment];
  const to = JOURNEY[segment + 1];
  const mix = ease(from.at, to.at, progress);
  pose.x = THREE.MathUtils.lerp(from.x, to.x, mix);
  pose.y = THREE.MathUtils.lerp(from.y, to.y, mix);
  pose.z = THREE.MathUtils.lerp(from.z, to.z, mix);
  pose.scale = THREE.MathUtils.lerp(from.scale, to.scale, mix);
  pose.pitch = THREE.MathUtils.lerp(from.pitch, to.pitch, mix);
  pose.roll = THREE.MathUtils.lerp(from.roll, to.roll, mix);
}

function partTravel(progress: number, leaveAt: number, separatedAt: number, returnAt: number, dockedAt: number) {
  return ease(leaveAt, separatedAt, progress) * (1 - ease(returnAt, dockedAt, progress));
}

// Each section describes a sculpted, eight-sided cross-section of the body.
function hullGeometry(sections: Section[]) {
  const vertices: number[] = [];
  const indices: number[] = [];
  sections.forEach(([x, width, bottom, shoulder, top, topWidth]) => {
    vertices.push(
      x, bottom, -width * 0.86,
      x, bottom + 0.065, -width,
      x, shoulder, -width,
      x, top, -topWidth,
      x, top, topWidth,
      x, shoulder, width,
      x, bottom + 0.065, width,
      x, bottom, width * 0.86,
    );
  });
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < 8; j++) {
      const a = i * 8 + j;
      const b = i * 8 + (j + 1) % 8;
      indices.push(a, b, a + 8, b, b + 8, a + 8);
    }
  }
  for (let j = 1; j < 7; j++) {
    indices.push(0, j + 1, j);
    const offset = (sections.length - 1) * 8;
    indices.push(offset, offset + j, offset + j + 1);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function Panel({ points, material }: { points: V3[]; material: THREE.Material }) {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points.flat(), 3));
    const indices: number[] = [];
    for (let i = 1; i < points.length - 1; i++) indices.push(0, i, i + 1);
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [points]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

function Hull({ sections, material }: { sections: Section[]; material: THREE.Material }) {
  const geometry = useMemo(() => hullGeometry(sections), [sections]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} castShadow receiveShadow />;
}

function Bar({ from, to, radius = 0.022, material }: {
  from: V3;
  to: V3;
  radius?: number;
  material: THREE.Material;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const direction = b.clone().sub(a);
    return {
      position: a.add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow>
      <cylinderGeometry args={[radius, radius, length, 8]} />
    </mesh>
  );
}

type Materials = ReturnType<typeof useMaterials>;

function useMaterials() {
  const materials = useMemo(() => ({
    paint: new THREE.MeshPhysicalMaterial({ color: "#45504b", metalness: 0.72, roughness: 0.36, clearcoat: 0.7, clearcoatRoughness: 0.26, envMapIntensity: 0.75, side: THREE.DoubleSide }),
    edge: new THREE.MeshStandardMaterial({ color: "#737f81", metalness: 0.85, roughness: 0.3 }),
    carbon: new THREE.MeshStandardMaterial({ color: "#101714", metalness: 0.22, roughness: 0.64, envMapIntensity: 0.45, side: THREE.DoubleSide }),
    black: new THREE.MeshStandardMaterial({ color: "#05090a", metalness: 0.15, roughness: 0.58, side: THREE.DoubleSide }),
    rubber: new THREE.MeshStandardMaterial({ color: "#15191a", metalness: 0.08, roughness: 0.88 }),
    tread: new THREE.MeshStandardMaterial({ color: "#222729", roughness: 0.96 }),
    alloy: new THREE.MeshStandardMaterial({ color: "#b6c1c3", metalness: 0.96, roughness: 0.2 }),
    brake: new THREE.MeshStandardMaterial({ color: "#667073", metalness: 0.93, roughness: 0.5 }),
    lime: new THREE.MeshStandardMaterial({ color: LIME, metalness: 0.3, roughness: 0.3, emissive: LIME, emissiveIntensity: 0.12 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#10211e", metalness: 0.4, roughness: 0.19, clearcoat: 0.85, clearcoatRoughness: 0.14, envMapIntensity: 0.6, side: THREE.DoubleSide }),
    whiteLight: new THREE.MeshStandardMaterial({ color: "#ecfff3", emissive: "#d9ffe7", emissiveIntensity: 3, toneMapped: false }),
    redLight: new THREE.MeshStandardMaterial({ color: "#ff554d", emissive: "#ff2920", emissiveIntensity: 2.3, toneMapped: false }),
  }), []);
  useEffect(() => () => Object.values(materials).forEach((material) => material.dispose()), [materials]);
  return materials;
}

function TireTreads({ material }: { material: THREE.Material }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!ref.current) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 48; i++) {
      const angle = i / 48 * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * 0.401, Math.sin(angle) * 0.401, 0);
      dummy.rotation.set(0, 0, angle - Math.PI / 2);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, material, 48]}>
      <boxGeometry args={[0.024, 0.006, 0.16]} />
    </instancedMesh>
  );
}

function Wheel({ side, materials }: { side: number; materials: Materials }) {
  return (
    <group scale={[1, 1, side]}>
      <mesh material={materials.rubber} scale={[1, 1, 1.36]} castShadow>
        <torusGeometry args={[0.3, 0.105, 14, 48]} />
      </mesh>
      <TireTreads material={materials.tread} />
      <mesh material={materials.black} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.277, 0.277, 0.21, 40]} />
      </mesh>
      <mesh material={materials.brake} position={[0, 0, 0.114]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.226, 0.226, 0.012, 40]} />
      </mesh>
      <mesh material={materials.carbon} position={[0, 0, 0.125]}>
        <torusGeometry args={[0.174, 0.006, 4, 40]} />
      </mesh>
      <mesh material={materials.lime} position={[0.164, 0.016, 0.132]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.076, 0.172, 0.032]} />
      </mesh>
      <mesh material={materials.alloy} position={[0, 0, 0.154]}>
        <torusGeometry args={[0.265, 0.015, 8, 48]} />
      </mesh>
      <mesh material={materials.edge} position={[0, 0, 0.145]}>
        <torusGeometry args={[0.246, 0.009, 6, 48]} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, 0, i * Math.PI * 2 / 5]}>
          {[-1, 1].map((split) => (
            <mesh key={split} material={materials.alloy} position={[split * 0.031, 0.152, 0.158]} rotation={[0, split * 0.05, split * -0.16]}>
              <boxGeometry args={[0.026, 0.22, 0.026]} />
            </mesh>
          ))}
          <mesh material={materials.black} position={[0, 0.041, 0.185]}>
            <sphereGeometry args={[0.008, 6, 6]} />
          </mesh>
        </group>
      ))}
      <mesh material={materials.alloy} position={[0, 0, 0.165]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.066, 0.066, 0.035, 24]} />
      </mesh>
      <mesh material={materials.carbon} position={[0, 0, 0.187]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.036, 0.036, 0.011, 20]} />
      </mesh>
      <mesh material={materials.lime} position={[0, 0, 0.194]}>
        <boxGeometry args={[0.013, 0.03, 0.004]} />
      </mesh>
    </group>
  );
}

const FRONT: Section[] = [
  [-2.23, 0.74, 0.11, 0.27, 0.32, 0.57],
  [-1.95, 0.91, 0.12, 0.38, 0.45, 0.69],
  [-1.7, 0.96, 0.16, 0.48, 0.57, 0.69],
  [-1.33, 0.97, 0.24, 0.54, 0.63, 0.66],
  [-0.68, 0.86, 0.32, 0.47, 0.6, 0.65],
];
const REAR: Section[] = [
  [0.79, 0.87, 0.29, 0.48, 0.59, 0.63],
  [1.34, 1.0, 0.23, 0.55, 0.67, 0.73],
  [1.92, 0.93, 0.13, 0.41, 0.55, 0.77],
  [2.18, 0.84, 0.13, 0.39, 0.48, 0.75],
];
const FLOOR: Section[] = [
  [-2.23, 0.82, 0.045, 0.075, 0.095, 0.82],
  [-1.72, 0.97, 0.045, 0.075, 0.095, 0.94],
  [-0.72, 0.82, 0.045, 0.075, 0.11, 0.81],
  [0.88, 0.83, 0.045, 0.075, 0.11, 0.81],
  [1.82, 0.94, 0.045, 0.075, 0.11, 0.91],
  [2.2, 0.87, 0.045, 0.075, 0.11, 0.84],
];

function FrontBody({ materials }: { materials: Materials }) {
  return (
    <group>
      <Hull sections={FRONT} material={materials.paint} />
      <mesh material={materials.black} position={[-2.239, 0.194, 0]}>
        <boxGeometry args={[0.022, 0.125, 0.74]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={materials.paint} position={[-1.38, 0.215, side * 0.975]}>
            <torusGeometry args={[0.42, 0.024, 6, 32, Math.PI]} />
          </mesh>
          <mesh material={materials.black} position={[-2.196, 0.269, side * 0.56]} rotation={[0, side * -0.13, 0]}>
            <boxGeometry args={[0.026, 0.09, 0.36]} />
          </mesh>
          <mesh material={materials.whiteLight} position={[-2.216, 0.295, side * 0.56]} rotation={[0, side * -0.13, 0]}>
            <boxGeometry args={[0.018, 0.016, 0.335]} />
          </mesh>
          <mesh material={materials.whiteLight} position={[-2.218, 0.276, side * 0.705]} rotation={[side * 0.38, 0, 0]}>
            <boxGeometry args={[0.019, 0.055, 0.018]} />
          </mesh>
          <Panel material={materials.black} points={[
            [-1.49, 0.57, side * 0.39], [-0.92, 0.605, side * 0.36],
            [-0.97, 0.588, side * 0.48], [-1.54, 0.553, side * 0.53],
          ]} />
          <Bar from={[-2.15, 0.105, side * 0.78]} to={[-1.72, 0.11, side * 0.97]} radius={0.012} material={materials.lime} />
          <Bar from={[-1.9, 0.405, side * 0.64]} to={[-0.72, 0.597, side * 0.5]} radius={0.005} material={materials.edge} />
        </group>
      ))}
      <mesh material={materials.lime} position={[-1.96, 0.457, 0]} rotation={[0, 0, -0.14]}>
        <boxGeometry args={[0.065, 0.004, 0.046]} />
      </mesh>
      {[-0.25, -0.125, 0, 0.125, 0.25].map((z) => (
        <mesh key={z} material={materials.carbon} position={[-2.253, 0.191, z]}>
          <boxGeometry args={[0.021, 0.1, 0.012]} />
        </mesh>
      ))}
    </group>
  );
}

function RearBody({ materials }: { materials: Materials }) {
  return (
    <group>
      <Hull sections={REAR} material={materials.paint} />
      <mesh material={materials.black} position={[2.187, 0.313, 0]}>
        <boxGeometry args={[0.024, 0.17, 1.46]} />
      </mesh>
      <mesh material={materials.redLight} position={[2.206, 0.421, 0]}>
        <boxGeometry args={[0.02, 0.018, 1.49]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={materials.paint} position={[1.38, 0.215, side * 0.992]}>
            <torusGeometry args={[0.42, 0.024, 6, 32, Math.PI]} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => (
            <mesh key={i} material={materials.black} position={[1.32 + i * 0.09, 0.64 - i * 0.013, side * 0.45]} rotation={[0, 0, -0.14]}>
              <boxGeometry args={[0.046, 0.012, 0.35]} />
            </mesh>
          ))}
          <mesh material={materials.alloy} position={[2.19, 0.174, side * 0.58]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.063, 0.071, 0.17, 20, 1, true]} />
          </mesh>
          <mesh material={materials.black} position={[2.28, 0.174, side * 0.58]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.052, 0.052, 0.01, 16]} />
          </mesh>
        </group>
      ))}
      {[-0.62, -0.31, 0, 0.31, 0.62].map((z) => (
        <mesh key={z} material={materials.carbon} position={[2.08, 0.057, z]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.37, 0.12, 0.026]} />
        </mesh>
      ))}
    </group>
  );
}

function Cabin({ materials }: { materials: Materials }) {
  return (
    <group>
      <Panel material={materials.glass} points={[
        [-0.86, 0.606, -0.647], [-0.86, 0.606, 0.647],
        [-0.015, 0.952, 0.51], [-0.015, 0.952, -0.51],
      ]} />
      <Panel material={materials.carbon} points={[
        [-0.015, 0.958, -0.513], [-0.015, 0.958, 0.513],
        [0.66, 0.965, 0.5], [0.66, 0.965, -0.5],
      ]} />
      <Panel material={materials.glass} points={[
        [0.66, 0.96, -0.505], [0.66, 0.96, 0.505],
        [1.2, 0.646, 0.649], [1.2, 0.646, -0.649],
      ]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Panel material={materials.glass} points={[
            [-0.8, 0.602, side * 0.682], [0.013, 0.938, side * 0.528],
            [0.64, 0.945, side * 0.519], [1.02, 0.621, side * 0.714],
          ]} />
          <Bar from={[-0.85, 0.594, side * 0.671]} to={[-0.015, 0.963, side * 0.522]} radius={0.018} material={materials.paint} />
          <Bar from={[-0.015, 0.963, side * 0.521]} to={[0.66, 0.97, side * 0.515]} radius={0.02} material={materials.paint} />
          <Bar from={[0.66, 0.966, side * 0.515]} to={[1.22, 0.628, side * 0.667]} radius={0.029} material={materials.paint} />
          <Bar from={[-0.82, 0.592, side * 0.687]} to={[1.04, 0.61, side * 0.729]} radius={0.018} material={materials.paint} />
          <Bar from={[0.58, 0.948, side * 0.523]} to={[0.76, 0.616, side * 0.706]} radius={0.02} material={materials.carbon} />
        </group>
      ))}
      <mesh material={materials.lime} position={[0.32, 0.971, 0]} rotation={[0, 0, 0.01]}>
        <boxGeometry args={[0.66, 0.004, 0.008]} />
      </mesh>
    </group>
  );
}

function Door({ side, materials }: { side: number; materials: Materials }) {
  return (
    <group>
      <Panel material={materials.paint} points={[
        [-0.76, 0.17, side * 0.878], [-0.85, 0.376, side * 0.897],
        [-0.654, 0.577, side * 0.704], [0.916, 0.598, side * 0.742],
        [1.014, 0.414, side * 0.894], [0.874, 0.168, side * 0.881],
      ]} />
      <Panel material={materials.paint} points={[
        [-0.74, 0.17, side * 0.88], [0.88, 0.168, side * 0.881],
        [0.94, 0.295, side * 0.929], [-0.756, 0.329, side * 0.915],
      ]} />
      <Bar from={[-0.72, 0.149, side * 0.907]} to={[0.84, 0.148, side * 0.925]} radius={0.019} material={materials.lime} />
      <Bar from={[-0.755, 0.342, side * 0.918]} to={[0.87, 0.308, side * 0.937]} radius={0.005} material={materials.edge} />
      <mesh material={materials.carbon} position={[0.644, 0.538, side * 0.808]} rotation={[side * 0.54, 0, 0]}>
        <boxGeometry args={[0.16, 0.018, 0.03]} />
      </mesh>
      <Bar from={[-0.48, 0.642, side * 0.707]} to={[-0.51, 0.68, side * 0.938]} radius={0.022} material={materials.carbon} />
      <mesh material={materials.paint} position={[-0.5, 0.698, side * 0.985]} scale={[1.8, 0.52, 1]}>
        <sphereGeometry args={[0.089, 14, 8]} />
      </mesh>
      <Panel material={materials.black} points={[
        [0.64, 0.24, side * 0.935], [1.01, 0.431, side * 0.916],
        [0.92, 0.474, side * 0.893], [0.5, 0.284, side * 0.936],
      ]} />
    </group>
  );
}

function Engine({ materials }: { materials: Materials }) {
  return (
    <group position={[1.06, 0.285, 0]}>
      <mesh material={materials.brake} castShadow>
        <boxGeometry args={[0.69, 0.29, 0.69]} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={materials.carbon} position={[0, 0.185, side * 0.212]} rotation={[side * 0.22, 0, 0]}>
            <boxGeometry args={[0.81, 0.1, 0.27]} />
          </mesh>
          <mesh material={materials.lime} position={[0, 0.244, side * 0.216]} rotation={[side * 0.22, 0, 0]}>
            <boxGeometry args={[0.62, 0.012, 0.052]} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i}>
              <mesh material={materials.alloy} position={[-0.26 + i * 0.174, 0.117, side * 0.415]} rotation={[side * 0.84, 0, 0]}>
                <cylinderGeometry args={[0.043, 0.037, 0.23, 12]} />
              </mesh>
              <Bar from={[-0.27 + i * 0.172, -0.005, side * 0.36]} to={[0.45, -0.05, side * 0.47]} radius={0.028} material={materials.brake} />
            </group>
          ))}
        </group>
      ))}
      <mesh material={materials.alloy} position={[-0.435, 0.004, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.125, 0.13, 0.11, 24]} />
      </mesh>
      <mesh material={materials.carbon} position={[0.47, -0.035, 0]}>
        <boxGeometry args={[0.35, 0.2, 0.3]} />
      </mesh>
    </group>
  );
}

function Chassis({ materials }: { materials: Materials }) {
  return (
    <group>
      <Hull sections={FLOOR} material={materials.carbon} />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Bar from={[-1.6, 0.16, side * 0.43]} to={[1.7, 0.16, side * 0.43]} radius={0.035} material={materials.alloy} />
          <Bar from={[-0.72, 0.2, side * 0.55]} to={[0.68, 0.19, side * 0.55]} radius={0.06} material={materials.carbon} />
          {[-1.38, 1.38].map((x) => (
            <group key={x}>
              <Bar from={[x - 0.25, 0.17, side * 0.4]} to={[x, 0, side * 0.89]} radius={0.024} material={materials.alloy} />
              <Bar from={[x + 0.25, 0.17, side * 0.4]} to={[x, 0, side * 0.89]} radius={0.024} material={materials.alloy} />
              <Bar from={[x, 0.31, side * 0.48]} to={[x, 0.04, side * 0.87]} radius={0.043} material={materials.lime} />
            </group>
          ))}
          <mesh material={materials.black} position={[0.13, 0.265, side * 0.295]} rotation={[0, 0, -0.11]}>
            <boxGeometry args={[0.51, 0.19, 0.36]} />
          </mesh>
          <mesh material={materials.carbon} position={[0.37, 0.49, side * 0.295]} rotation={[0, 0, 0.19]}>
            <boxGeometry args={[0.105, 0.49, 0.36]} />
          </mesh>
        </group>
      ))}
      {[-1.38, 1.38].map((x) => (
        <Bar key={x} from={[x, 0.06, -0.8]} to={[x, 0.06, 0.8]} radius={0.038} material={materials.brake} />
      ))}
      <mesh material={materials.carbon} position={[-0.53, 0.45, 0]}>
        <boxGeometry args={[0.19, 0.17, 1.04]} />
      </mesh>
      <mesh material={materials.black} position={[-0.35, 0.57, 0.285]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.11, 0.015, 8, 24]} />
      </mesh>
    </group>
  );
}

function Spoiler({ materials }: { materials: Materials }) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh material={materials.carbon} position={[1.96, 0.676, side * 0.54]} rotation={[0, 0, -0.23]}>
            <boxGeometry args={[0.075, 0.34, 0.031]} />
          </mesh>
          <mesh material={materials.carbon} position={[1.97, 0.882, side * 1.005]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.33, 0.115, 0.025]} />
          </mesh>
          <mesh material={materials.lime} position={[1.97, 0.945, side * 1.005]} rotation={[0, 0, -0.1]}>
            <boxGeometry args={[0.335, 0.008, 0.03]} />
          </mesh>
        </group>
      ))}
      <mesh material={materials.carbon} position={[1.96, 0.833, 0]} rotation={[0, 0, -0.07]} castShadow>
        <boxGeometry args={[0.32, 0.045, 2.025]} />
      </mesh>
      <mesh material={materials.edge} position={[2.114, 0.823, 0]}>
        <boxGeometry args={[0.012, 0.02, 1.99]} />
      </mesh>
    </group>
  );
}

function Car({ progress, reducedMotion = false, onReady }: CarSceneProps) {
  const materials = useMaterials();
  const root = useRef<THREE.Group>(null);
  const hood = useRef<THREE.Group>(null);
  const rear = useRef<THREE.Group>(null);
  const cabin = useRef<THREE.Group>(null);
  const engine = useRef<THREE.Group>(null);
  const spoiler = useRef<THREE.Group>(null);
  const doors = useRef<(THREE.Group | null)[]>([]);
  const wheels = useRef<(THREE.Group | null)[]>([]);
  const current = useRef(Number.isFinite(progress) ? THREE.MathUtils.clamp(progress, 0, 1) : 0);
  const pose = useRef<JourneyPose>({ ...JOURNEY[0] });
  const announced = useRef(false);
  const { invalidate, size } = useThree();

  useEffect(() => { invalidate(); }, [progress, reducedMotion, invalidate]);

  useFrame((state, delta) => {
    if (!announced.current) {
      announced.current = true;
      onReady?.();
    }
    const target = Number.isFinite(progress) ? THREE.MathUtils.clamp(progress, 0, 1) : 0;
    // The first and last poses match, so wrapping the journey does not rewind it.
    if (reducedMotion) current.current = 0;
    else if (Math.abs(target - current.current) > 0.88) current.current = target;
    else current.current = THREE.MathUtils.damp(current.current, target, 8, Math.min(delta, 0.05));

    const value = current.current;
    const amount = partTravel(value, 0.12, 0.45, 0.72, 0.95);
    const frameFit = Math.min(1, size.width / Math.max(size.height, 1) / 1.1);
    sampleJourney(value, pose.current);
    const travel = pose.current;
    const hover = reducedMotion ? 0 : Math.sin(state.clock.elapsedTime * 0.65) * 0.012 * amount;

    if (root.current) {
      root.current.scale.setScalar(travel.scale * frameFit);
      root.current.position.set(travel.x * frameFit, travel.y + hover, travel.z * frameFit);
      root.current.rotation.set(travel.pitch, -0.06 + Math.PI * 2 * ease(0.07, 0.95, value), travel.roll);
    }

    // Panels release in a mechanical sequence; each follows its own path back.
    if (hood.current) {
      const lift = partTravel(value, 0.12, 0.34, 0.79, 0.92);
      hood.current.position.set(-lift * 0.62, lift * 1.02, -lift * 0.13);
      hood.current.rotation.set(-lift * 0.1, -lift * 0.16, -lift * 0.13);
    }
    if (rear.current) {
      const lift = partTravel(value, 0.19, 0.4, 0.75, 0.9);
      rear.current.position.set(lift * 0.63, lift * 0.82, lift * 0.18);
      rear.current.rotation.set(lift * 0.06, lift * 0.13, lift * 0.1);
    }
    if (cabin.current) {
      const lift = partTravel(value, 0.14, 0.32, 0.82, 0.94);
      cabin.current.position.set(-lift * 0.08, lift * 1.53, -lift * 0.06);
      cabin.current.rotation.set(lift * 0.07, -lift * 0.08, -lift * 0.03);
    }
    if (engine.current) {
      const lift = partTravel(value, 0.25, 0.45, 0.73, 0.86);
      engine.current.position.set(-lift * 0.18, lift * 0.49, lift * 0.12);
      engine.current.rotation.set(lift * 0.04, -lift * 0.12, -lift * 0.03);
    }
    if (spoiler.current) {
      const lift = partTravel(value, 0.11, 0.3, 0.76, 0.9);
      spoiler.current.position.set(lift * 0.75, lift * 1.34, -lift * 0.18);
      spoiler.current.rotation.set(-lift * 0.1, lift * 0.12, lift * 0.06);
    }
    doors.current.forEach((door, index) => {
      if (!door) return;
      const side = index === 0 ? -1 : 1;
      const lift = partTravel(value, 0.17 + index * 0.035, 0.38 + index * 0.035, 0.76 + index * 0.015, 0.92 + index * 0.015);
      door.position.set(lift * (side * 0.14 - 0.06), lift * (0.43 + index * 0.1), side * lift * 1.2);
      door.rotation.set(side * lift * -0.34, side * lift * 0.2, lift * 0.08);
    });
    wheels.current.forEach((wheel, index) => {
      if (!wheel) return;
      const front = index < 2;
      const side = index % 2 === 0 ? -1 : 1;
      const lift = partTravel(value, 0.2 + index * 0.024, 0.36 + index * 0.025, 0.73 + index * 0.012, 0.88 + index * 0.013);
      const spin = Math.PI * 2 * ease(0.1, 0.93, value);
      wheel.position.set(
        (front ? -1.38 : 1.38) + (front ? -1 : 1) * lift * 0.42,
        0.015 + lift * (0.12 + (side > 0 ? 0.07 : 0)),
        side * (0.885 + lift * 0.96),
      );
      wheel.rotation.set(side * lift * 0.1, (front ? -0.075 : 0) + side * lift * 0.24, spin + lift * (front ? 0.24 : -0.2));
    });
  });

  // Preserve the detailed geometry while scroll values update the animation.
  const parts = useMemo(() => (
    <>
      <group position={[0, -0.2, 0]}>
      <Chassis materials={materials} />
      <group ref={hood}><FrontBody materials={materials} /></group>
      <group ref={rear}><RearBody materials={materials} /></group>
      <group ref={cabin}><Cabin materials={materials} /></group>
      <group ref={engine}><Engine materials={materials} /></group>
      <group ref={spoiler}><Spoiler materials={materials} /></group>
      {[-1, 1].map((side, index) => (
        <group key={side} ref={(node) => { doors.current[index] = node; }}>
          <Door side={side} materials={materials} />
        </group>
      ))}
      </group>
      {[0, 1, 2, 3].map((index) => (
        <group key={index} ref={(node) => { wheels.current[index] = node; }} position={[index < 2 ? -1.38 : 1.38, 0.015, index % 2 === 0 ? -0.885 : 0.885]}>
          <Wheel side={index % 2 === 0 ? -1 : 1} materials={materials} />
        </group>
      ))}
    </>
  ), [materials]);

  return <group ref={root}>{parts}</group>;
}

function CameraRig() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    camera.position.set(-5.85, 2.65, 7.35);
    // Three.js cameras expose an imperative API owned by the render loop.
    // eslint-disable-next-line react-hooks/immutability
    camera.fov = 35;
    camera.lookAt(0, 0.3, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function StaticCar({ onReady }: Pick<CarSceneProps, "onReady">) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return (
    <div role="img" aria-label="Sports car engineering illustration" style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
      <svg viewBox="0 0 800 400" style={{ width: "94%", maxWidth: 900 }} fill="none" aria-hidden="true">
        <defs><linearGradient id="car-metal" x1="300" y1="150" x2="400" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#74827c" /><stop offset="1" stopColor="#202927" /></linearGradient></defs>
        <ellipse cx="400" cy="325" rx="275" ry="18" fill="#000" opacity=".24" />
        <path d="M103 280 125 242 267 224 340 161 487 168 570 221 663 244 692 280 665 300 135 300Z" fill="url(#car-metal)" stroke="#81908a" />
        <path d="m290 223 61-53 124 6 65 47Z" fill="#101c1c" stroke="#63766a" />
        <path d="M422 174v49M280 238l-8 49h265l12-49M118 268h78m418-10 58 16" stroke="#c6f36b" strokeWidth="3" />
        {[220, 593].map((x) => <g key={x}><circle cx={x} cy="289" r="45" fill="#111716" stroke="#46534b" strokeWidth="3" /><circle cx={x} cy="289" r="29" stroke="#aebbb2" strokeWidth="5" /><path d={`M${x} 260v58m-29-29h58m-49-20 40 40m-40 0 40-40`} stroke="#aebbb2" strokeWidth="3" /><circle cx={x} cy="289" r="7" fill="#c6f36b" /></g>)}
        <path d="m601 218 6-25h72m-69 1 44 47" stroke="#a5b1a7" strokeWidth="7" />
      </svg>
    </div>
  );
}

class SceneBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export default function CarScene({ progress, reducedMotion = false, onReady }: CarSceneProps) {
  return (
    <SceneBoundary fallback={<StaticCar onReady={onReady} />}>
      <Canvas
        camera={{ position: [-5.85, 2.65, 7.35], fov: 35, near: 0.1, far: 50 }}
        dpr={[1, 1.6]}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        shadows
        style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
        fallback={<StaticCar onReady={onReady} />}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
        aria-label="Interactive exploded view of a sports car"
        role="img"
      >
        <CameraRig />
        <ambientLight intensity={0.8} />
        <directionalLight position={[-4, 7, 5]} intensity={2.0} color="#efffe9" />
        <directionalLight position={[4, 3, -5]} intensity={1.7} color="#a4c0cf" />
        <directionalLight position={[-3, 1, -3]} intensity={0.75} color={LIME} />
        <Suspense fallback={null}>
          <Environment resolution={128} frames={1}>
            <Lightformer form="rect" intensity={1.8} color="#f3fff7" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 1.8, 1]} />
            <Lightformer form="rect" intensity={1.4} color="#ffffff" position={[-5, 2, 3]} rotation={[0, Math.PI / 2, 0]} scale={[4, 1.2, 1]} />
            <Lightformer form="rect" intensity={2.2} color="#d5e8ee" position={[3, 2, -4]} rotation={[0, -Math.PI / 4, 0]} scale={[7, 1.2, 1]} />
            <Lightformer form="rect" intensity={1.0} color={LIME} position={[2, 1, 5]} rotation={[0, Math.PI, 0]} scale={[6, 0.5, 1]} />
          </Environment>
          <Car progress={progress} reducedMotion={reducedMotion} onReady={onReady} />
          <ContactShadows position={[0, -0.47, 0]} opacity={0.48} scale={12} blur={3.4} far={4} resolution={256} frames={1} color="#000000" />
        </Suspense>
      </Canvas>
    </SceneBoundary>
  );
}
