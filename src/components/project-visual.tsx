import { useId } from "react";

const titles = [
  "Robotic perception study with a tracked vehicle, pose axes, and a detection frame",
  "Synthetic vision scene with three wireframe boxes and object detection bounds",
  "Inverted pendulum control study with a reference trajectory and angular measurement",
];

function PerceptionIllustration() {
  return (
    <>
      <g stroke="#59675e" strokeWidth="1" fill="none">
        <path d="M112 273 300 167 505 276 316 383Z M157 247 360 357 M204 220 409 329 M252 194 457 303 M163 300 349 194 M214 327 400 221 M265 354 451 248" opacity=".32" />
        <path d="m241 194 63-37 100 55-63 37Zm0 0v77l100 55v-77m0 77 63-37v-77" />
        <path d="m254 187 87 48 49-29m-93-45v29l43 24 40-23" opacity=".65" />
        <path d="m260 239 60 33v21l-60-33zm97 22 29-16v22l-29 16z" />
        <ellipse cx="268" cy="282" rx="16" ry="24" transform="rotate(-25 268 282)" fill="#1c2520" />
        <ellipse cx="320" cy="311" rx="16" ry="24" transform="rotate(-25 320 311)" fill="#1c2520" />
        <ellipse cx="391" cy="278" rx="14" ry="23" transform="rotate(25 391 278)" fill="#1c2520" />
        <path d="m268 272 0 20m-8-15 16 10m60-100v-49" />
        <ellipse cx="336" cy="138" rx="20" ry="8" fill="#171c19" />
        <path d="M316 138v12c0 11 40 11 40 0v-12" />
      </g>
      <g stroke="#c2ed73" fill="none">
        <path d="M191 168v-41h40m173 0h41v40m0 133v39h-40m-175 0h-39v-40" strokeWidth="2" />
        <path d="M192 184v103m52 52h146m55-156v103m-200-159h145" strokeDasharray="3 7" opacity=".28" />
        <path d="m336 138-93-53m93 53 119-27m-119 27 8-72" opacity=".35" />
        <path d="m242 81 2 5 6-1m201 21 5 5-4 5m-112-43 4-8 4 7" opacity=".65" />
        <circle cx="336" cy="138" r="3" fill="#c2ed73" />
        <path d="M126 126v24m-12-12h24m345 183v24m-12-12h24" opacity=".55" />
      </g>
      <g fill="#97aa9b" fontSize="9" letterSpacing="1.4">
        <text x="191" y="113" fill="#c2ed73">POSE ESTIMATION</text>
        <text x="443" y="360" textAnchor="end">6-DoF / LOCKED</text>
        <text x="226" y="77">X</text>
        <text x="464" y="113">Y</text>
        <text x="340" y="54">Z</text>
        <text x="67" y="210" opacity=".7">01</text>
      </g>
      <g fill="#91b894" opacity=".55">
        {[ [145, 220], [153, 203], [139, 184], [168, 177], [158, 231], [476, 192], [470, 219], [489, 237], [480, 259], [461, 248], [265, 92], [284, 104], [296, 86] ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.5" />
        ))}
      </g>
    </>
  );
}

function Box({ x, y, width, height, depth, color }: { x: number; y: number; width: number; height: number; depth: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="1.1" fill="none">
      <path d={`M0 0 ${width} ${width * .48} ${width + depth} ${width * .48 - depth * .58} ${depth} ${-depth * .58}Z`} fill={color} fillOpacity=".035" />
      <path d={`M0 0v${height}l${width} ${width * .48} ${depth} ${-depth * .58}v${-height}M${width} ${width * .48}v${height}`} />
      <path d={`M${depth} ${-depth * .58}v${height}L0 ${height}m${depth} ${-depth * .58} ${width} ${width * .48}`} strokeDasharray="3 5" opacity=".23" />
      <path d={`M${width * .22} ${width * .105}l${depth} ${-depth * .58}m${-width * .08} ${width * .04} ${-depth} ${depth * .58}v${height * .28}`} opacity=".35" />
    </g>
  );
}

function SyntheticIllustration() {
  return (
    <>
      <g fill="none" stroke="#4e6056" strokeWidth="1" opacity=".24">
        <path d="m81 247 216-120 241 129-216 126Zm46-26 240 131m-192-157 240 131m-192-158 240 131m-192-157 240 131M127 272l215-120M175 297 391 177M223 323 439 203M271 349 487 229" />
      </g>
      <Box x={139} y={194} width={84} height={76} depth={61} color="#7b9b8b" />
      <Box x={315} y={206} width={101} height={92} depth={66} color="#c2ed73" />
      <Box x={273} y={119} width={59} height={55} depth={42} color="#79bcb8" />
      <g strokeWidth="1" fill="none">
        <path d="M131 180v-39h25m99 0h36v37m0 74v49h-32m-103 0h-25v-40" stroke="#7b9b8b" opacity=".7" />
        <path d="M306 193v-32h33m119 0h33v38m0 107v44h-35m-117 0h-33v-36" stroke="#c2ed73" />
        <path d="M266 110V84h27m67 0h23v26m0 36v26h-25m-65 0h-27v-28" stroke="#79bcb8" />
        <path d="M312 183h173m-173 40h173m-173 40h173m-173 40h173" stroke="#c2ed73" strokeDasharray="2 5" opacity=".12" />
        <path d="M65 318h40m-20-20v40M474 86h40m-20-20v40" stroke="#75897d" opacity=".4" />
      </g>
      <g fontSize="9" letterSpacing="1.4">
        <text x="306" y="150" fill="#c2ed73">BOX 02 / 0.99</text>
        <text x="266" y="72" fill="#79bcb8">BOX 03</text>
        <text x="131" y="130" fill="#8ba597">BOX 01</text>
        <text x="83" y="361" fill="#62766a">SYNTHETIC ENVIRONMENT</text>
      </g>
      <g stroke="#afdf8d" strokeWidth="1.2" opacity=".8">
        <path d="M389 265h16m-8-8v16" />
      </g>
    </>
  );
}

function ControlIllustration() {
  return (
    <>
      <g stroke="#576a5c" fill="none">
        <path d="M97 291h407M144 96v217" strokeWidth="1" />
        <path d="M145 137h340M145 188h340M145 240h340M196 97v195m58-195v195m58-195v195m58-195v195m58-195v195m58-195v195" opacity=".2" />
        <path d="m497 287 7 4-7 4m-357-191 4-8 4 8" />
        <path d="M144 293c33-170 61-194 100-68s49 30 85 35 92 5 156 5" strokeDasharray="5 7" opacity=".6" />
      </g>
      <path d="M145 293c21-67 24-173 60-163s35 181 71 178 30-59 69-49 76 3 141 4" fill="none" stroke="#c2ed73" strokeWidth="2" />
      <path d="M145 293c21-67 24-173 60-163s35 181 71 178 30-59 69-49 76 3 141 4" fill="none" stroke="#c2ed73" strokeWidth="7" opacity=".07" />
      <g transform="translate(371 156)">
        <circle r="78" stroke="#4f6456" strokeDasharray="2 6" fill="none" opacity=".6" />
        <path d="M0 0v-78M-30 0h60" stroke="#698172" strokeDasharray="3 5" opacity=".5" />
        <path d="M0 0 40-63" stroke="#99bda3" strokeWidth="5" />
        <path d="M0 0 40-63" stroke="#d0e7ca" strokeWidth="1" />
        <path d="M0-39a39 39 0 0 1 21 6" stroke="#c2ed73" fill="none" />
        <circle r="10" fill="#171c19" stroke="#89a58f" />
        <circle r="3" fill="#c2ed73" />
        <circle cx="40" cy="-63" r="12" fill="#273127" stroke="#c2ed73" />
        <circle cx="40" cy="-63" r="3" fill="#c2ed73" />
        <text x="10" y="-47" fill="#c2ed73" fontSize="12">θ</text>
      </g>
      <g fill="#718979" fontSize="9" letterSpacing="1.2">
        <text x="108" y="99">x(t)</text>
        <text x="511" y="296">t</text>
        <text x="135" y="332">0</text>
        <text x="248" y="332">2.0</text>
        <text x="363" y="332">4.0</text>
        <text x="474" y="332">6.0s</text>
        <text x="107" y="191">0.5</text>
        <text x="339" y="52" fill="#a0b5a4">STATE / θ</text>
        <text x="156" y="364" fill="#c2ed73">NONLINEAR CONTROL</text>
      </g>
      <circle cx="205" cy="130" r="4" fill="#c2ed73" />
      <circle cx="486" cy="263" r="3" fill="#c2ed73" />
    </>
  );
}

export default function ProjectVisual({ index }: { index: number }) {
  const id = useId();
  const visualIndex = ((index % 3) + 3) % 3;

  return (
    <svg viewBox="0 0 600 400" fill="none" role="img" aria-labelledby={`${id}-title`} style={{ display: "block", width: "100%", height: "100%" }}>
      <title id={`${id}-title`}>{titles[visualIndex]}</title>
      <defs>
        <pattern id={`${id}-grid`} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r=".8" fill="#72927d" opacity=".19" />
        </pattern>
        <radialGradient id={`${id}-ambient`} cx="52%" cy="53%" r="64%">
          <stop stopColor="#466346" stopOpacity=".13" />
          <stop offset="1" stopColor="#171c19" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#${id}-ambient)`} />
      <rect width="600" height="400" fill={`url(#${id}-grid)`} />
      <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
        <g stroke="#65816c" opacity=".35">
          <path d="M24 44V24h20m512 0h20v20M24 356v20h20m512 0h20v-20" />
        </g>
        <g fill="#718776" fontSize="8" letterSpacing="1.7">
          <text x="40" y="44">FIG. 0{visualIndex + 1}</text>
          <text x="560" y="44" textAnchor="end">ENGINEERING STUDY</text>
        </g>
        {visualIndex === 0 ? <PerceptionIllustration /> : visualIndex === 1 ? <SyntheticIllustration /> : <ControlIllustration />}
      </g>
    </svg>
  );
}
