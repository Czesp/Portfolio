import { useId } from "react";
import ProjectVisual from "./project-visual";

const projectIndices: Record<string, number> = {
  "robotics-perception": 0,
  "synthetic-data-object-detection": 1,
  "nonlinear-model-predictive-control": 2,
};

const visualTitles: Record<string, string> = {
  "ecocar-vehicle-integration": "Conceptual exploded vehicle platform with battery, frame, and hardware integration points",
  "cavs-autonomous-vehicles": "Conceptual autonomous research vehicle with LiDAR scanning, camera, and navigation path",
  "additive-manufacturing-research": "Conceptual three-dimensional structural lattice beneath an additive manufacturing nozzle",
  "usda-product-design": "Conceptual modular field device with an exploded enclosure, circuit board, and camera module",
  "istvs-localization-research": "Conceptual satellite localization study comparing a GPS trajectory and a fused GPS–IMU trajectory",
  "advanced-manufacturing-society": "Conceptual CNC mill with a cutting tool, workpiece, and manufacturing toolpath",
  "istvs-vice-president": "Conceptual terramechanics study showing a treaded wheel, soil particles, and drawbar force",
};

const lime = "#c2ed73";
const muted = "#7a9784";
const dark = "#1c2921";
const aqua = "#81b4ae";

function Platform({ y, fill = dark }: { y: number; fill?: string }) {
  return <g transform={`translate(0 ${y})`} stroke={muted} strokeWidth="1.2"><path d="m155 183 143-80 167 91-143 82Z" fill={fill} /><path d="M155 183v15l167 92 143-81v-15M322 276v14" fill="none" /></g>;
}

function VehicleAssembly() {
  return <>
    <g opacity=".22" stroke={muted} fill="none"><path d="m90 273 204-116 220 126-204 117ZM150 239l220 126m-155-163 220 126M145 304l204-116m-140 150 204-116" /></g>
    <g fill="#141c17" stroke={muted} strokeWidth="1.4">
      {[ [168, 274], [272, 331], [366, 291], [466, 234] ].map(([x, y]) => <g key={x} transform={`translate(${x} ${y}) rotate(-28)`}><ellipse rx="20" ry="32" /><ellipse rx="11" ry="21" /><path d="M0-18v36m-8-25 16 14" /></g>)}
    </g>
    <Platform y={34} />
    <g stroke={muted} strokeDasharray="4 6" opacity=".5"><path d="M185 99v145m111-207v145m140-68v145m-115-80v145" /></g>
    <Platform y={-25} fill="#273b29" />
    <g fill="none" stroke={lime} strokeWidth="1.2"><path d="m211 160 87-49 109 59-86 50Z" /><path d="m233 148 109 60m-87-72 109 60m-87-72 109 60" opacity=".5" /><path d="m182 174 18-11 22 12-18 11Zm189 24 19-11 22 12-18 11Z" /></g>
    <g stroke={muted} strokeWidth="1.2" fill="#19281e"><path d="m183 104 112-63 140 77-113 65ZM183 104v13l139 77 113-64v-12M322 183v11" /><path d="m211 102 84-47 112 63-84 47Z" fill="#111914" /><path d="M263 73 375 136m-80-81 2 125" fill="none" /></g>
    <g stroke={lime} fill="none"><path d="m437 118 41-24h48M398 207l51 28h77M239 309l-41 24h-81" /><circle cx="437" cy="118" r="3" fill={lime} /><circle cx="398" cy="207" r="3" fill={lime} /></g>
    <g fontSize="9" fill={muted}><text x="480" y="84">FRAME</text><text x="465" y="226" fill={lime}>BATTERY</text><text x="118" y="350">CHASSIS</text></g>
  </>;
}

function AutonomousSensing() {
  return <>
    <g stroke={muted} opacity=".17" fill="none"><path d="M63 304c67-104 96 62 175-15s98-81 164-37 91-64 134-29M74 326c56-87 102 61 171-5s98-95 160-42 86-56 128-28M91 351c56-67 95 57 163-7s98-81 153-37 85-58 120-29" /></g>
    <g fill="none" stroke={lime} strokeWidth="1"><path d="M301 172 118 77Q307-28 504 87Z" fill={lime} fillOpacity=".025" strokeOpacity=".2" /><path d="M207 123q99-61 204 9M164 100q146-82 294 8M116 76q192-97 388 11" strokeDasharray="3 6" opacity=".45" /><path d="m301 172-151-60m151 60-83-94m83 94 7-114m-7 114 115-91m-115 91 167-37" opacity=".12" /></g>
    <g fill={dark} stroke={muted} strokeWidth="1.4"><path d="m184 222 114-64 121 70-114 66ZM184 222v44l121 69 114-65v-42M305 294v41" /><path d="m217 199 81-46 87 50-81 45Z" fill="#253d2c" /><path d="M217 199v24l87 49 81-44v-25M304 248v24" />
      {[ [207, 275], [259, 305], [389, 290] ].map(([x, y]) => <g key={x} transform={`translate(${x} ${y})`}><ellipse rx="19" ry="28" fill="#121b15" /><ellipse rx="9" ry="16" /></g>)}
      <path d="M284 160v19c0 13 41 13 41 0v-19" /><ellipse cx="304" cy="160" rx="21" ry="9" fill="#466144" /><path d="m339 207 15-9 22 13v18l-15 9-22-13Z" /><ellipse cx="362" cy="221" rx="6" ry="8" fill={lime} stroke="none" /></g>
    <path d="m363 221 118-56v137Z" fill={aqua} fillOpacity=".025" stroke={aqua} strokeDasharray="4 6" opacity=".5" />
    <g fill={lime}>{[ [182, 102], [237, 71], [338, 66], [411, 99], [455, 130], [481, 246], [445, 211] ].map(([x, y]) => <circle key={x} cx={x} cy={y} r="2" />)}</g>
    <path d="M94 287q44-45 103 3t141 63q72 32 163-46" stroke={lime} strokeDasharray="5 6" fill="none" opacity=".55" />
    <g fill={muted} fontSize="9"><text x="100" y="63" fill={lime}>LiDAR</text><text x="489" y="238" fill={aqua}>CAMERA</text><text x="383" y="365">LOCAL NAVIGATION</text></g>
  </>;
}

function LatticePrinting() {
  const point = (x: number, y: number, z: number) => [301 + (x - z) * 45, 251 + (x + z) * 23 - y * 48];
  const edges: { a: number[]; b: number[]; brace?: boolean }[] = [];
  for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) for (let z = 0; z < 3; z++) {
    if (x < 2) edges.push({ a: point(x,y,z), b: point(x+1,y,z) });
    if (y < 2) edges.push({ a: point(x,y,z), b: point(x,y+1,z) });
    if (z < 2) edges.push({ a: point(x,y,z), b: point(x,y,z+1) });
    if (x < 2 && y < 2) edges.push({ a: point(x,y,z), b: point(x+1,y+1,z), brace: true });
    if (z < 2 && y < 2) edges.push({ a: point(x,y,z), b: point(x,y+1,z+1), brace: true });
  }
  return <>
    <path d="m167 286 136-79 138 80-138 80Z" fill={dark} fillOpacity=".7" stroke={muted} strokeOpacity=".35" />
    <g fill="none" strokeLinecap="round">{edges.map(({ a,b,brace }, index) => <line key={index} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={brace ? lime : muted} strokeWidth={brace ? 1.2 : 2.6} opacity={brace ? .6 : .9} />)}</g>
    <g fill={lime}>{Array.from({ length: 27 }, (_, i) => { const [x,y] = point(Math.floor(i / 9), Math.floor(i / 3) % 3, i % 3); return <circle key={i} cx={x} cy={y} r="2.8" />; })}</g>
    <g stroke={muted} strokeWidth="1.3" fill={dark}><path d="M279 44h46v44h-46ZM282 88l15 29h11l14-29Z" /><path d="M288 54h28m-28 10h28m-28 10h28" opacity=".6" /><path d="M300 117v16h5v-16" fill={lime} stroke={lime} /></g>
    <path d="M302 139v12m-91 146-44 26H90m301-128 57-34h50" stroke={lime} strokeWidth="1" fill="none" />
    <g fill={muted} fontSize="9"><text x="90" y="341">LATTICE STRUCTURE</text><text x="441" y="151" fill={lime}>BUILD LAYERS</text></g>
    <path d="M135 144v122m-5-122h10m-10 122h10" stroke={muted} opacity=".35" /><path d="M150 144h58m-58 122h33" stroke={muted} strokeDasharray="3 5" opacity=".25" />
  </>;
}

function FieldDevice() {
  return <>
    <g stroke={muted} fill="none" opacity=".2"><path d="m108 312 187-107 201 116-186 102ZM146 291l201 116m-156-142 201 116m-154-143 201 116M149 336l187-108m-140 136 187-108m-141 135 187-108" /></g>
    <g stroke={muted} strokeWidth="1.4" fill={dark}><path d="m216 253 85-48 91 52-86 48ZM216 253v56l90 51 86-48v-55M306 305v55" /><path d="m238 256 63-36 67 38-62 35Z" fill="#0f1912" /><path d="m245 313 34 19v8l-34-19Zm79 10 44-25v9l-44 25Z" fill="#263c2b" /></g>
    <g stroke={lime} fill="#263e2a" strokeWidth="1.2"><path d="m223 201 79-45 81 46-79 46Z" /><path d="m265 199 32-18 38 22-32 18Z" fill="#111b14" /><path d="m241 200 18-10m-7 21 18-10m53 19 20-11m-8 18 20-11m-58-40 14-8m-2 18 14-8" opacity=".7" /></g>
    <g stroke={muted} strokeDasharray="3 6" opacity=".45"><path d="M225 139v145m79-103v146m75-180v145" /></g>
    <g stroke={muted} strokeWidth="1.4" fill={dark}><path d="m214 109 86-49 93 54-88 49ZM214 109v29l91 53 88-49v-28M305 163v28" /><path d="m237 109 62-36 69 40-63 36Z" fill="#2c4230" /><path d="M286 105v22c0 9 30 9 30 0v-22" /><ellipse cx="301" cy="105" rx="15" ry="9" fill="#142519" /><ellipse cx="301" cy="105" rx="8" ry="5" fill={aqua} /></g>
    <g stroke={lime} fill="none"><path d="m364 117 56-33h66M349 219l69 40h70" /><circle cx="364" cy="117" r="3" fill={lime} /><circle cx="349" cy="219" r="3" fill={lime} /></g>
    <g fontSize="9" fill={muted}><text x="422" y="74">ENCLOSURE</text><text x="420" y="275" fill={lime}>ELECTRONICS</text></g>
    <g stroke={muted} fill="none" strokeWidth="1.2" opacity=".65"><path d="M125 309v-58m0 31c-24-4-30-21-28-33 18 2 26 14 28 33Zm0-14c25-5 30-21 27-34-18 3-26 16-27 34" /><path d="m110 313 15-4 16 6" /></g>
  </>;
}

function Localization() {
  return <>
    <g stroke={muted} opacity=".23" fill="none"><path d="M101 155v188h411M101 190h411M101 228h411M101 266h411M101 304h411M152 155v188m60-188v188m60-188v188m60-188v188m60-188v188m60-188v188" /></g>
    <path d="m116 303 43-32 27 17 19-42 27 10 31-43 18 21 29-42 26 10 25-29 31 21 35-19 27 15 39-33" stroke={muted} strokeWidth="1.5" fill="none" opacity=".7" />
    <path d="M116 312c67-2 73-59 126-69s56-38 97-46 79 24 154-27" stroke={lime} strokeWidth="2.5" fill="none" />
    <g stroke={aqua} strokeWidth="1.2" fill={dark} transform="translate(300 76) rotate(-25)"><path d="M-14-16h28v33h-28Z" /><path d="M-58-12h36v25h-36Zm80 0h36v25H22Z" fill="#253a31" /><path d="M-47-12v25m12-25v25m23-25v25m45-25v25m12-25v25M-58 0h36m44 0h36M0-16v-15" /><path d="M-10 18q10 17 20 0M0 30v9" fill="none" /></g>
    <g stroke={aqua} fill="none" opacity=".35"><path d="m302 104-74 145m74-145 49 111m-93-77q49 35 81-5" strokeDasharray="4 6" /><path d="M275 121q28 17 46-3" /></g>
    <g transform="translate(339 197)"><circle r="17" fill={lime} fillOpacity=".07" stroke={lime} strokeOpacity=".3" /><circle r="7" fill={dark} stroke={lime} /><circle r="2" fill={lime} /><path d="M0-27v7m0 40v7M-27 0h7m40 0h7" stroke={lime} /></g>
    <g fontSize="9" fill={muted}><text x="118" y="366">GPS</text><text x="233" y="366" fill={lime}>GPS + IMU</text><text x="378" y="90" fill={aqua}>LOCALIZATION</text></g>
    <path d="M101 363h11" stroke={muted} /><path d="M214 363h13" stroke={lime} />
  </>;
}

function Manufacturing() {
  return <>
    <g stroke={muted} strokeWidth="1.3" fill={dark}><path d="M143 100h312v25H143ZM149 125h22v169h-22Zm278 0h22v169h-22ZM134 294h331v35H134Z" /><path d="M154 304h290m-290 10h290M180 88h38v12h-38Zm200 0h38v12h-38Z" fill="none" opacity=".5" /><path d="M274 83h51v43h-51ZM282 126h35v62h-35Z" /><path d="M288 188h23l-5 22h-13Z" fill="#597154" /><path d="M296 210v24m7-24v24" stroke={lime} /><path d="m295 217 9-5m-9 12 9-5m-9 12 9-5" stroke={lime} /></g>
    <g stroke={muted} strokeWidth="1.2" fill="#233629"><path d="m212 253 82-47 96 55-82 48ZM212 253v29l96 55 82-47v-29M308 309v28" /><path d="m237 251 57-32 71 41-56 32Z" fill="#121e16" /></g>
    <path d="m256 253 39-21 49 28-35 19-32-18 17-10 17 10" stroke={lime} strokeWidth="1.4" fill="none" />
    <g stroke={lime} opacity=".4"><path d="m290 239-12 6m19-8 6 9m-12-8-13-2m23 0 14 3m-27-12-6-8" /></g>
    <path d="M192 157v-15h76m-9-4 9 4-9 4M343 158h61v69m-4-8 4 8 4-8" stroke={aqua} fill="none" opacity=".7" />
    <g fontSize="9" fill={muted}><text x="188" y="137" fill={aqua}>X</text><text x="416" y="220" fill={aqua}>Z</text><text x="223" y="365">CNC / APPLIED MANUFACTURING</text></g>
  </>;
}

function Terramechanics() {
  return <>
    <g stroke={muted} fill="none" opacity=".4"><path d="M68 295h133q90 34 181 0h153M83 327c57-10 71-17 101-14s99 37 165 14 104-18 176-9M98 349c89-33 146 18 213-2s130-19 195-6" /></g>
    <g fill={muted} opacity=".6">{Array.from({ length: 46 }, (_, i) => <circle key={i} cx={100 + (i * 47) % 403} cy={306 + (i * 19) % 62} r={i % 3 === 0 ? 2.1 : 1.2} />)}</g>
    <g transform="translate(302 209)"><circle r="90" stroke={muted} fill={dark} /><circle r="78" stroke={muted} strokeOpacity=".5" fill="none" /><circle r="53" stroke={lime} fill="#253a28" /><circle r="17" stroke={muted} fill="#101d14" /><circle r="6" fill={lime} />
      {Array.from({ length: 20 }, (_, i) => <path key={i} d="m-7-91 14 4v11l-14-4Z" fill="#536a50" stroke={muted} strokeWidth=".8" transform={`rotate(${i * 18})`} />)}
      {Array.from({ length: 6 }, (_, i) => <path key={i} d="M-6-21-11-46H11L6-21Z" fill="#101d14" stroke={muted} strokeWidth=".8" transform={`rotate(${i * 60})`} />)}
    </g>
    <g fill="none" stroke={lime} strokeWidth="1.3"><path d="M404 195h95m-9-5 10 5-10 5M302 64v53m-5-10 5 10 5-10M214 142a110 110 0 0 1 154-14m-11 0 11 0-2-11" /><path d="M283 310v30m-4-8 4 8 4-8m14-36v43m-4-8 4 8 4-8m15-30v30m-4-8 4 8 4-8" opacity=".35" /></g>
    <g fill={muted} fontSize="9"><text x="416" y="181" fill={lime}>DRAWBAR PULL</text><text x="318" y="79">LOAD</text><text x="204" y="382">WHEEL–TERRAIN INTERACTION</text></g>
  </>;
}

export default function DetailVisual({ slug }: { slug: string }) {
  const id = useId();
  if (slug in projectIndices) return <ProjectVisual index={projectIndices[slug]} />;

  const illustrations: Record<string, React.ReactNode> = {
    "ecocar-vehicle-integration": <VehicleAssembly />,
    "cavs-autonomous-vehicles": <AutonomousSensing />,
    "additive-manufacturing-research": <LatticePrinting />,
    "usda-product-design": <FieldDevice />,
    "istvs-localization-research": <Localization />,
    "advanced-manufacturing-society": <Manufacturing />,
    "istvs-vice-president": <Terramechanics />,
  };

  return <svg viewBox="0 0 600 400" fill="none" role="img" aria-labelledby={`${id}-title`} style={{ display: "block", width: "100%", height: "100%" }}>
    <title id={`${id}-title`}>{visualTitles[slug] ?? "Engineering schematic"}</title>
    <defs><pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r=".8" fill="#72927d" opacity=".16" /></pattern><radialGradient id={`${id}-ambient`}><stop stopColor="#486343" stopOpacity=".14" /><stop offset="1" stopColor="#171c19" stopOpacity="0" /></radialGradient></defs>
    <rect width="600" height="400" fill={`url(#${id}-ambient)`} /><rect width="600" height="400" fill={`url(#${id}-grid)`} />
    <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" letterSpacing="1.1"><path d="M24 44V24h20m512 0h20v20M24 356v20h20m512 0h20v-20" stroke="#65816c" opacity=".35" />{illustrations[slug] ?? <Manufacturing />}</g>
  </svg>;
}
