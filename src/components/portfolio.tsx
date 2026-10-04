"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Cog, Download, Github, Linkedin, Mail, Menu, Pause, Play, RotateCcw, X } from "lucide-react";
import { experiences, leadership, profile, projects, skillGroups } from "@/data/portfolio";
import ProjectVisual from "@/components/project-visual";
import DepthSection, { DepthContext } from "@/components/depth-section";
import EngineeringOverlay from "@/components/engineering-overlay";

const CarScene = dynamic(() => import("@/components/car-scene"), { ssr: false });
const chapters = ["Home", "About", "Experience", "Projects", "Skills", "Contact"];
const chapterIds = ["home", "about", "experience", "projects", "skills", "contact"];
// Kept in this document's JS runtime: client-side returns skip the intro; reloads reset it.
let introSeenInThisVisit = false;
const annotations = [
  null,
  { part: "CHASSIS", title: "Mechanical engineering, MSU", detail: "CLASS OF 2028", metric: "4.00 GPA", href: "#about" },
  { part: "POWERTRAIN", title: "Vehicle hardware integration", detail: "ECOCAR INNOVATION CHALLENGE", metric: "2026 — PRESENT", href: "/experience/ecocar-vehicle-integration" },
  null,
  { part: "SUSPENSION", title: "Design, simulation & control", detail: "SOLIDWORKS · SIEMENS NX · ROS2", metric: "", href: "#skills" },
  null,
];

function Loader({ ready, onComplete }: { ready: boolean; onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const isReady = useRef(ready);

  useEffect(() => { isReady.current = ready; }, [ready]);

  useEffect(() => {
    const start = performance.now();
    let finish: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      const elapsed = performance.now() - start;
      const value = Math.min(isReady.current || elapsed > 6500 ? 100 : 92, Math.round(elapsed / 20));
      setCount(value);
      if (value >= 100) {
        clearInterval(interval);
        setLeaving(true);
        finish = setTimeout(onComplete, 550);
      }
    }, 40);
    const deadline = setTimeout(onComplete, 7500);
    return () => { clearInterval(interval); clearTimeout(finish); clearTimeout(deadline); };
  }, [onComplete]);

  return <div className={`loader ${leaving ? "loader-leaving" : ""}`} role="status" aria-live="polite" aria-label="Assembling portfolio">
    <span className="loader-brand">PB<span>®</span></span>
    <div className="loader-center"><div className="loader-mechanism"><Cog size={100} strokeWidth={.8} /><Cog size={58} strokeWidth={1} /><span className="loader-cross">+</span></div><p className="eyebrow">{count < 40 ? "INITIALIZING SYSTEMS" : count < 80 ? "ASSEMBLING THE DETAILS" : "READY TO MOVE FORWARD"}</p><div className="loader-track"><i style={{ width: `${count}%` }} /></div><span className="loader-count">{String(count).padStart(3, "0")}<small>%</small></span></div>
    <div className="loader-bottom"><span>PRASHANT BHATTARAI</span><span>PRECISION IN EVERY PART.</span></div>
    <button className="loader-skip" onClick={onComplete}>Skip intro <ArrowRight size={14} /></button>
  </div>;
}

function SectionHeading({ index, label, children }: { index: string; label: string; children: React.ReactNode }) {
  return <div className="section-heading"><div className="eyebrow"><span className="section-number">{index}</span>{label}</div><h2>{children}</h2></div>;
}

export default function Portfolio() {
  const [intro, setIntro] = useState<"checking" | "playing" | "complete">(() => introSeenInThisVisit ? "complete" : "checking");
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [looping, setLooping] = useState(false);
  const loopLock = useRef(false);
  const replayTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeId = useRef("home");
  const loading = intro !== "complete";
  const depthEnabled = mounted && !reducedMotion;

  const markReady = useCallback(() => setReady(true), []);
  const finishLoading = useCallback(() => {
    introSeenInThisVisit = true;
    loopLock.current = false;
    setIntro("complete");
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      if (introSeenInThisVisit) setIntro("complete");
      else setIntro("playing");
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => replayTimers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.documentElement.style.scrollBehavior = reducedMotion ? "auto" : "smooth";
    document.documentElement.style.scrollPaddingTop = depthEnabled ? "0px" : "95px";
    const frame = requestAnimationFrame(() => {
      const id = location.hash.slice(1) || activeId.current;
      const target = document.getElementById(id);
      if (target) window.scrollTo({ top: target.offsetTop, behavior: "instant" });
    });
    return () => { cancelAnimationFrame(frame); document.documentElement.style.scrollBehavior = ""; document.documentElement.style.scrollPaddingTop = ""; };
  }, [reducedMotion, depthEnabled]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [loading]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0);
      const sections = chapterIds.map(id => document.getElementById(id));
      let current = 0;
      sections.forEach((section, i) => { if (section && section.getBoundingClientRect().top < innerHeight * .48) current = i; });
      activeId.current = chapterIds[current];
      setActive(current);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => { observer.disconnect(); removeEventListener("scroll", schedule); removeEventListener("resize", schedule); cancelAnimationFrame(frame); };
  }, []);

  const replay = useCallback((showIntro = false) => {
    if (loopLock.current || loading) return;
    loopLock.current = true;
    if (showIntro) {
      setIntro("playing");
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", window.location.pathname);
      return;
    }
    setLooping(true);
    replayTimers.current.push(setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      history.replaceState(null, "", window.location.pathname);
      replayTimers.current.push(setTimeout(() => { setLooping(false); loopLock.current = false; }, 450));
    }, reducedMotion ? 0 : 380));
  }, [reducedMotion, loading]);

  useEffect(() => {
    if (reducedMotion || loading) return;
    let atEndSince = 0;
    let touchStart = 0;
    const atEnd = () => scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
    const onScroll = () => {
      if (atEnd()) { if (!atEndSince) atEndSince = performance.now(); }
      else atEndSince = 0;
    };
    const tryReplay = () => { if (atEnd() && atEndSince && performance.now() - atEndSince > 1500 && !menuOpen) replay(); };
    const wheel = (event: WheelEvent) => { if (event.deltaY > 20) tryReplay(); };
    const touchDown = (event: TouchEvent) => { touchStart = event.touches[0].clientY; };
    const touchUp = (event: TouchEvent) => { if (touchStart - event.changedTouches[0].clientY > 70) tryReplay(); };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("wheel", wheel, { passive: true });
    addEventListener("touchstart", touchDown, { passive: true });
    addEventListener("touchend", touchUp, { passive: true });
    onScroll();
    return () => { removeEventListener("scroll", onScroll); removeEventListener("wheel", wheel); removeEventListener("touchstart", touchDown); removeEventListener("touchend", touchUp); };
  }, [loading, menuOpen, reducedMotion, replay]);

  async function copyEmail() {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setCopyFailed(false); setTimeout(() => setCopied(false), 2400); }
    catch { setCopyFailed(true); }
  }

  const annotation = annotations[active];

  function navigateSection(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const href = link.getAttribute("href");
    const target = href && document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    history.replaceState(null, "", href);
    window.scrollTo({ top: target.offsetTop, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return <DepthContext value={depthEnabled}><div className="portfolio-root" data-reduced-motion={reducedMotion} data-depth-enabled={depthEnabled} onClickCapture={navigateSection}>
    <a className="skip-link" href="#about">Skip to content</a>
    {intro === "checking" && <div className="intro-check" aria-hidden="true" />}
    {intro === "playing" && <Loader ready={ready} onComplete={finishLoading} />}
    <div className={`loop-shutter ${looping ? "is-looping" : ""}`} aria-hidden="true"><Cog size={52} /></div>
    <header className="site-header">
      <a className="brand" href="#home" aria-label="Prashant Bhattarai home">p<span>b</span><i>↗</i></a>
      <a className="brand-name" href="#home">PRASHANT<br />BHATTARAI<span>MECHANICAL ENGINEERING</span></a>
      <nav id="main-navigation" className={menuOpen ? "nav-links nav-open" : "nav-links"} aria-label="Main navigation">
        {chapters.slice(1).map((chapter, index) => <a key={chapter} className={active === index + 1 ? "nav-active" : ""} href={`#${chapterIds[index + 1]}`} onClick={() => setMenuOpen(false)}>{chapter}<span /></a>)}
      </nav>
      <a href={profile.resume} className="resume-link" target="_blank" rel="noreferrer">Résumé <ArrowUpRight size={15} /></a>
      <button className="menu-toggle" aria-controls="main-navigation" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
    </header>

    <div className={`car-stage stage-${chapterIds[active]} ${loading ? "stage-loading" : ""}`} data-progress={progress.toFixed(3)}>
      <EngineeringOverlay chapter={active} progress={progress} reducedMotion={reducedMotion || loading} />
      <div className="car-render" aria-hidden="true"><CarScene progress={progress} reducedMotion={reducedMotion || loading} onReady={markReady} /></div>
      {annotation && <div className={`part-annotation annotation-${active}`}><span>{annotation.part}</span><strong>{annotation.title}</strong><small>{annotation.detail}</small><em>{annotation.metric}</em><i aria-hidden="true" /></div>}
    </div>

    <aside className="chapter-rail" aria-label="Section navigation">{chapterIds.map((id, index) => <a key={id} href={`#${id}`} aria-label={chapters[index]} className={active === index ? "rail-active" : ""}><span>{String(index + 1).padStart(2, "0")}</span><i /></a>)}</aside>

    <main>
      <DepthSection id="home" className="hero section-shell">
        <div className="hero-drafting" aria-hidden="true"><span className="draft-corner draft-corner-tl" /><span className="draft-corner draft-corner-tr" /><span className="draft-corner draft-corner-bl" /><span className="draft-corner draft-corner-br" /><span className="draft-center-mark">+</span></div>
        <div className="hero-topline"><span className="eyebrow">PRASHANT BHATTARAI — MECHANICAL ENGINEERING</span><span className="edition">MISSISSIPPI STATE UNIVERSITY</span></div>
        <div className="hero-title"><h1>Engineered<br />to move <span>forward.</span></h1><span className="hero-handnote">Always a work in progress.</span></div>
        <aside className="hero-design-note" aria-label="Engineering focus"><span className="note-index">DESIGN NOTES <span>01 /</span></span><strong>From CAD<br />to something real.</strong><div><span>DESIGN</span><span>SolidWorks / NX</span></div><div><span>SYSTEMS</span><span>Robotics / Autonomy</span></div><i aria-hidden="true" /></aside>
        <div className="hero-intro"><p>I’m Prashant. I design mechanical systems<br />and work on robots that find their own way.</p><a className="button button-lime" href="#projects"><span>Explore my work</span><ArrowUpRight size={20} /></a></div>
        <div className="hero-footer"><span className="hero-signature">Prashant Bhattarai</span><div className="hero-location">STARKVILLE, MISSISSIPPI</div><a className="quiet-about" href="#about">A little about me <ArrowDown size={15} /></a></div>
      </DepthSection>

      <DepthSection id="about" className="about-section content-section section-shell">
        <SectionHeading index="01" label="ABOUT">A little<br />about me<span>.</span></SectionHeading>
        <div className="about-layout"><figure className="profile-portrait">{profile.headshot ? <Image src={profile.headshot} alt="Prashant Bhattarai" width={560} height={700} unoptimized /> : <div className="portrait-placeholder" role="img" aria-label="Space for Prashant’s profile photo"><span>pb.</span><small>Portrait coming soon</small></div>}<figcaption>Prashant Bhattarai<span>MECHANICAL ENGINEERING</span></figcaption></figure><div className="about-writing"><div className="section-copy"><p className="large-copy">Mechanics, robotics,<br /><em>and a lot of figuring things out.</em></p><p>I’m studying mechanical engineering at Mississippi State. My work ranges from designing parts in SolidWorks to getting autonomous vehicles to navigate off-road.</p><p>Right now, that means research at CAVS, vehicle integration with EcoCAR, and a few projects of my own.</p></div><div className="education-copy"><h3>Mississippi State University</h3><p>{profile.education.degree}</p><div><span>CLASS OF 2028</span><span>4.00 GPA</span></div></div></div></div>
        <div className="coursework"><span className="eyebrow">IN THE CLASSROOM</span><p>{profile.education.coursework.join(" · ")}</p></div>
      </DepthSection>

      <DepthSection id="experience" className="experience-section content-section section-shell">
        <SectionHeading index="02" label="EXPERIENCE">Where I’ve<br />been working<span>.</span></SectionHeading>
        <div className="experience-list">{experiences.map((experience, index) => <Link className="experience-row" href={`/experience/${experience.slug}`} key={experience.slug}><span className="row-number">0{index + 1}</span><div><span className="experience-period">{experience.period}</span><h3>{experience.title}</h3><p>{experience.organization.split(" · ")[0]}</p><span className="experience-category">{experience.category}</span></div><span className="row-arrow"><ArrowUpRight size={20} /></span></Link>)}</div>
        <div className="leadership-strip"><span className="eyebrow">STUDENT ORGANIZATIONS</span>{leadership.map(item => <Link href={`/experience/${item.slug}`} key={item.slug}><span>{item.title}<small>{item.organization}</small></span><ArrowUpRight size={16} /></Link>)}</div>
      </DepthSection>

      <DepthSection id="projects" className="projects-section content-section section-shell">
        <div className="projects-heading"><SectionHeading index="03" label="SELECTED WORK">A few things<br />I’m building<span>.</span></SectionHeading><p>Perception, simulation, control.<br />Methods, experiments, and what I learned.</p></div>
        <div className="project-grid">{projects.map((project, index) => <Link className="project-card" href={`/projects/${project.slug}`} key={project.slug}><div className="project-image"><div className="project-image-top"><span>EXPERIMENT / 0{index + 1}</span><span className="project-plus">+</span></div><ProjectVisual index={index} /><span className="view-project">Explore project <ArrowUpRight size={17} /></span><span className="project-image-caption">{index === 0 ? "PERCEPTION → PRECISION" : index === 1 ? "SIMULATION → REALITY" : "DYNAMICS → CONTROL"}</span></div><div className="project-card-label"><span>{project.category}</span><ArrowUpRight size={19} /></div><h3>{project.title}</h3><p>{project.summary}</p><div className="project-tags">{project.skills.slice(0, 3).map(skill => <span key={skill}>{skill}</span>)}</div></Link>)}</div>
        <a className="text-link projects-github" href={profile.github} target="_blank" rel="noreferrer"><Github size={16} /> Code on GitHub <ArrowUpRight size={16} /></a>
      </DepthSection>

      <DepthSection id="skills" className="skills-section content-section section-shell">
        <SectionHeading index="04" label="SKILLS">What I<br />work with<span>.</span></SectionHeading>
        <div className="skills-list">{skillGroups.map((group, index) => <div className="skill-group" key={group.title}><div className="skill-group-title"><span>0{index + 1}</span><h3>{group.title}</h3><Cog size={18} /></div><div className="skill-tags">{group.skills.map(skill => <span key={skill}>{skill}</span>)}</div></div>)}</div>
        <div className="certification"><span className="certification-symbol"><Check size={20} /></span><div><strong>Certified SOLIDWORKS Professional</strong><span>CSWP · Mechanical Design</span></div><ArrowUpRight size={20} /></div>
      </DepthSection>

      <DepthSection id="contact" className="contact-section content-section section-shell">
        <SectionHeading index="05" label="CONTACT">Good work starts<br />with a <span>hello.</span></SectionHeading>
        <p className="section-lede">For opportunities, project ideas,<br />or a conversation about something interesting.</p>
        <a href={`mailto:${profile.email}`} className="button button-lime contact-cta">Start a conversation <ArrowUpRight size={20} /></a>
        <div className="contact-links"><a href={`mailto:${profile.email}`}><Mail size={18} /><span>Email</span><ArrowUpRight size={17} /></a><a href={profile.github} target="_blank" rel="noreferrer"><Github size={18} /><span>GitHub</span><ArrowUpRight size={17} /></a>{profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer"><Linkedin size={18} /><span>LinkedIn</span><ArrowUpRight size={17} /></a> : <span className="contact-unavailable"><Linkedin size={18} /><span>LinkedIn</span><small>COMING SOON</small></span>}</div>
        <button className="email-copy" onClick={copyEmail}>{profile.email}{copied ? <Check size={15} /> : <span>COPY ↗</span>}</button><span className="copy-status" role="status">{copied ? "Email copied." : copyFailed ? "Please select the email address to copy it." : ""}</span>
        <a href={profile.resume} download className="text-link download-resume"><Download size={16} /> Download my résumé <ArrowDown size={16} /></a>
        <div className="site-footer"><span>© {new Date().getFullYear()} PRASHANT BHATTARAI</span><button onClick={() => replay(true)}>Take another spin <RotateCcw size={15} /></button></div>
      </DepthSection>
    </main>

    <div className="journey-status"><div><span className="lime">0{active + 1}</span><span className="status-separator">/</span><span>{chapters[active].toUpperCase()}</span></div><div className="journey-track"><i style={{ transform: `scaleX(${progress})` }} /></div><button aria-label={reducedMotion ? "Enable animation" : "Reduce animation"} aria-pressed={reducedMotion} onClick={() => setReducedMotion(!reducedMotion)}>{reducedMotion ? <Play size={12} /> : <Pause size={12} />}<span>{reducedMotion ? "MOTION OFF" : "MOTION ON"}</span></button></div>
  </div></DepthContext>;
}
