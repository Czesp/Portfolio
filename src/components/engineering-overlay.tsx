import styles from "./engineering-overlay.module.css";

type EngineeringOverlayProps = {
  chapter: number;
  progress: number;
  reducedMotion: boolean;
};

function gearOutline(teeth: number, radius: number) {
  const points: string[] = [];
  const profile = [[0, 0.83], [0.17, 0.83], [0.26, 1], [0.62, 1], [0.71, 0.83]];

  for (let tooth = 0; tooth < teeth; tooth++) {
    for (const [offset, depth] of profile) {
      const angle = (tooth + offset) / teeth * Math.PI * 2;
      points.push(`${(Math.cos(angle) * radius * depth).toFixed(3)},${(Math.sin(angle) * radius * depth).toFixed(3)}`);
    }
  }

  return `M${points.join("L")}Z`;
}

const largeGear = gearOutline(16, 58);
const smallGear = gearOutline(10, 37);

function Bearing({ x, y, radius, angle = 0 }: { x: number; y: number; radius: number; angle?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`} className={styles.bearing}>
      <circle r={radius} />
      <circle r={radius * 0.88} />
      <circle r={radius * 0.57} />
      <circle r={radius * 0.45} />
      {Array.from({ length: 10 }, (_, index) => (
        <circle key={index} cy={-radius * 0.725} r={radius * 0.104} transform={`rotate(${index * 36})`} />
      ))}
      <path className={styles.accent} d={`M${-radius * 0.17} ${-radius * 0.45}V${-radius * 0.28}H${radius * 0.17}V${-radius * 0.45}`} />
      <path className={styles.centerline} d={`M${-radius - 13} 0H${radius + 13}M0 ${-radius - 13}V${radius + 13}`} />
    </g>
  );
}

export default function EngineeringOverlay({ chapter, progress, reducedMotion }: EngineeringOverlayProps) {
  const active = Math.min(5, Math.max(0, Number.isFinite(chapter) ? Math.round(chapter) : 0));
  const phase = reducedMotion ? 0 : Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const turn = phase * 70;
  const drift = Math.sin(phase * Math.PI * 2) * 13;
  const separation = Math.sin(phase * Math.PI) * 19;

  return (
    <div className={styles.overlay} aria-hidden="true" data-engineering-overlay="" data-chapter={active} data-reduced-motion={reducedMotion}>
      <svg className={styles.drawing} viewBox="0 0 1000 700" fill="none" focusable="false">
        <g className={styles.chapterLayer} data-active={active === 0} data-diagram="assembly-drafting">
        <g className={styles.ground} transform={`rotate(${-10 + phase * 5} 520 445)`}>
          <ellipse cx="520" cy="445" rx="310" ry="91" />
          <ellipse className={styles.outerOrbit} cx="520" cy="445" rx="352" ry="114" />
          <path className={styles.centerline} d="M139 445H901M520 316V574" />
          <path className={styles.axisMarks} d="M202 439V451M830 439V451M514 347H526M514 543H526" />
          <path className={styles.accent} d="M191 445H216M520 332V348" />
        </g>

        <g className={styles.crosshair}>
          <circle cx="520" cy="445" r="12" />
          <path d="M501 445H512M528 445H539M520 426V437M520 453V464" />
          <circle cx="520" cy="445" r="2" />
        </g>

        <g className={styles.dimension}>
          <path className={styles.extension} d="M229 500V598M810 478V598" />
          <path d="M229 578H449M591 578H810" />
          <path className={styles.endTicks} d="M224 583L234 573M805 583L815 573" />
          <path className={styles.rulerTicks} d="M265 578V584M301 578V582M337 578V584M373 578V582M409 578V584M629 578V584M665 578V582M701 578V584M737 578V582M773 578V584" />
          <text x="520" y="581" textAnchor="middle">ASSEMBLY / PB-01</text>
        </g>

        <g className={styles.leader}>
          <circle cx="739" cy="451" r="3.5" />
          <path d="M743 449L797 418H872" />
          <path className={styles.accent} d="M797 418H814" />
          <text x="798" y="406">MECHANICAL DESIGN</text>
          <path className={styles.endTicks} d="M872 414V422" />
        </g>

        <g className={styles.cornerMarks}>
          <path d="M174 369V350H193M859 483V502H840" />
          <path d="M173 610H184M178.5 604.5V615.5" />
        </g>
        </g>

        <g className={styles.chapterLayer} data-active={active === 1} data-diagram="structural-projection">
          <g className={styles.construction} transform={`translate(${drift * 0.35} 0)`}>
            <path className={styles.dashed} d="M196 218V581M812 243V567M174 485H872" />
            <path d="M220 485L435 272L817 369L601 581Z" />
            <path className={styles.softLine} d="M220 431L435 218L817 315L601 527ZM220 431V485M435 218V272M817 315V369M601 527V581" />
            <path className={styles.dashed} d="M330 377L710 475M410 297L790 395M342 516L556 303" />
            <path className={styles.inkAccent} d="M220 464V485L246 492M795 363L817 369L801 385" />
            <path d="M164 296H212M180 280V327M178 558H214M196 540V576" />
            <circle cx="435" cy="272" r="4" />
            <circle cx="601" cy="581" r="4" />
          </g>
          <g className={styles.detailInk}>
            <path d="M244 288V236H345M240 284L244 288L248 284" />
            <text x="249" y="222">FORM / STRUCTURE</text>
            <path className={styles.shortRule} d="M241 594H410" />
            <text x="242" y="613">PROJECTION STUDY</text>
          </g>
        </g>

        <g className={styles.chapterLayer} data-active={active === 2} data-diagram="exploded-alignment">
          <g className={styles.construction}>
            <path className={styles.dashed} d="M245 212V586M520 183V585M802 231V577" />
            <g transform={`translate(0 ${-separation})`}>
              <path d="M266 289L463 230L769 281L573 341Z" />
              <path className={styles.dashed} d="M266 289L573 341M463 230L463 248" />
              <path className={styles.inkAccent} d="M266 278V289L286 293M747 277L769 281V292" />
            </g>
            <g transform={`translate(${drift * 0.6} 0)`}>
              <path d="M236 410L448 341L801 399L590 473Z" />
              <path className={styles.dashed} d="M275 399L627 460M384 362L736 422" />
            </g>
            <g transform={`translate(0 ${separation})`}>
              <path d="M227 512L442 444L818 505L604 580Z" />
              <path className={styles.inkAccent} d="M227 500V512L248 516M797 502L818 505V516" />
            </g>
            {[284, 410, 515].map((y) => <path key={y} d={`M230 ${y}H257M796 ${y}H809`} />)}
            <path d="M178 261V536M172 261H184M172 536H184M170 396H186" />
          </g>
          <g className={styles.detailInk}>
            <path d="M178 241V223H280" />
            <text x="179" y="209">PARTS / RELATIONSHIPS</text>
            <path className={styles.shortRule} d="M226 606H390" />
            <text x="227" y="625">EXPLODED ALIGNMENT</text>
          </g>
        </g>

        <g className={styles.chapterLayer} data-active={active === 3} data-diagram="rotation-bearing">
          <g className={styles.construction}>
            <g transform={`rotate(${-22 + turn} 505 414)`}>
              <path d="M296 303A236 236 0 0 1 719 315M734 356A236 236 0 0 1 361 601M320 561A236 236 0 0 1 278 352" />
              <path className={styles.inkAccent} d="M710 305L719 315L721 301M371 600L361 601L366 610" />
              <path className={styles.dashed} d="M314 300A222 222 0 1 1 283 414" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                <path key={index} d="M505 168V181" transform={`rotate(${index * 45} 505 414)`} />
              ))}
            </g>
            <ellipse className={styles.dashed} cx="511" cy="455" rx="334" ry="94" transform="rotate(-12 511 455)" />
            <path className={styles.dashed} d="M505 163V658M157 414H854" />
          </g>
          <Bearing x={235} y={486} radius={64} angle={-turn} />
          <g className={styles.detailInk}>
            <path d="M189 258V228H320" />
            <text x="190" y="214">ROTATION / EXPLORATION</text>
            <path d="M225 562V586H331" />
            <text x="239" y="601">BEARING STUDY</text>
          </g>
        </g>

        <g className={styles.chapterLayer} data-active={active === 4} data-diagram="machining-toolpath">
          <g className={styles.construction} transform={`translate(${drift * 0.5} ${drift * 0.2})`}>
            <path d="M233 338V286H426L466 254H657L723 318H808V502H638L596 544H384L346 505H233V400" />
            <path className={styles.softLine} d="M251 339V304H433L473 272H649L715 336H790V484H631L589 526H392L354 487H251V400" />
            <path className={styles.dashed} d="M269 339V322H440L480 290H641L708 354H772V466H624L582 508H400L362 469H269V400" />
            <path className={styles.inkAccent} d="M289 339V340H447L487 308H634L700 372H754V448H616L574 490H408L370 451H289V400" />
            <path className={styles.dashed} d="M189 574H851M214 232V601" />
            <path d="M205 278H223M205 503H223M233 565V583M808 565V583" />
            <circle cx="289" cy="371" r="18" />
            <circle cx="289" cy="371" r="7" />
            <path d="M289 345V360M289 382V397M263 371H278M300 371H315" />
          </g>
          <g className={styles.detailInk}>
            <path d="M178 388H249L271 373" />
            <text x="169" y="412">TOOL / PATH</text>
            <path className={styles.shortRule} d="M230 613H427" />
            <text x="231" y="632">DESIGN INTO PROCESS</text>
          </g>
          <g className={styles.hatching}>
            {Array.from({ length: 7 }, (_, index) => <path key={index} d={`M${664 + index * 13} 528L${689 + index * 13} 503`} />)}
          </g>
        </g>

        <g className={styles.chapterLayer} data-active={active === 5} data-diagram="reassembly-frame">
          <g className={styles.construction}>
            <path d="M183 293V255H261M739 255H817V293M817 502V551H739M261 551H183V502" />
            <path className={styles.softLine} d="M198 289V270H260M740 270H802V289M802 510V536H740M260 536H198V510" />
            <ellipse cx="500" cy="457" rx="308" ry="96" transform={`rotate(${-8 + drift * 0.15} 500 457)`} />
            <ellipse className={styles.dashed} cx="500" cy="457" rx="337" ry="116" transform="rotate(-8 500 457)" />
            <path className={styles.dashed} d="M148 402H244M756 402H852M500 218V286M500 532V608" />
            <path className={styles.inkAccent} d="M172 394L181 402L172 410M828 394L819 402L828 410M492 247L500 255L508 247" />
            <circle cx="183" cy="402" r="3" />
            <circle cx="817" cy="402" r="3" />
            <path d="M223 590H416M584 590H777M223 580V600M777 580V600" />
          </g>
          <Bearing x={217} y={305} radius={38} angle={turn * 0.5} />
          <g className={styles.detailInk}>
            <text x="500" y="594" textAnchor="middle">{phase >= 0.94 || reducedMotion ? "ASSEMBLY / COMPLETE" : "REASSEMBLY / PB-01"}</text>
            <path className={styles.shortRule} d="M278 220H415" />
            <text x="278" y="206">BACK TO THE BEGINNING</text>
          </g>
        </g>
      </svg>

      <div className={styles.gearAssembly} data-active={active === 0}>
        <svg className={styles.gearDrawing} viewBox="0 0 225 158" fill="none" focusable="false">
          <path className={styles.gearAxes} d="M74 5V149M9 77H214M162 31V122" />
          <g transform="translate(74 77)">
            <g className={`${styles.gearRotor} ${styles.largeGear}`}>
              <path d={largeGear} />
              <circle r="40" />
              <circle r="13" />
              <path d="M-3-13V-19H3V-13" />
              {[0, 1, 2, 3].map((index) => (
                <g key={index} transform={`rotate(${index * 90})`}>
                  <path d="M-8-25L-11-35M8-25L11-35" />
                  <circle cy="-29" r="4.5" />
                </g>
              ))}
              <path className={styles.gearIndex} d="M-5-47H5" />
            </g>
            <circle className={styles.gearHub} r="3" />
          </g>
          <g transform="translate(162 77)">
            <g transform="rotate(18)">
            <g className={`${styles.gearRotor} ${styles.smallGear}`}>
              <path d={smallGear} />
              <circle r="23" />
              <circle r="8" />
              {[0, 1, 2].map((index) => (
                <circle key={index} cy="-16" r="3" transform={`rotate(${index * 120})`} />
              ))}
              <path className={styles.gearIndex} d="M-3-29H3" />
            </g>
            </g>
            <circle className={styles.gearHub} r="2" />
          </g>
          <path className={styles.gearDatum} d="M162 115V140H201M197 136L201 140L197 144" />
        </svg>
        <span className={styles.gearCaption}>FORM FOLLOWS FUNCTION</span>
      </div>

    </div>
  );
}
