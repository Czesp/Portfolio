"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Box,
  Download,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react";
import type { PortfolioEntry } from "@/data/portfolio";
import DetailVisual from "./detail-visual";
import styles from "./detail-view.module.css";

const StlViewer = dynamic(() => import("./stl-viewer"), {
  ssr: false,
  loading: () => <div className={styles.previewMessage}>Preparing the 3D inspection view…</div>,
});

type Attachment = PortfolioEntry["attachments"][number];
type LocalAttachment = Attachment & { local: true };

function AttachmentIcon({ type }: { type: Attachment["type"] }) {
  if (type === "image") return <ImageIcon size={18} aria-hidden="true" />;
  if (type === "stl" || type === "cad") return <Box size={18} aria-hidden="true" />;
  return <FileText size={18} aria-hidden="true" />;
}

function AttachmentPreview({ attachment }: { attachment: Attachment | LocalAttachment }) {
  const local = "local" in attachment;
  return (
    <div className={styles.attachmentPreview}>
      <div className={styles.previewHeader}>
        <span><AttachmentIcon type={attachment.type} /> {attachment.label}</span>
        <a href={attachment.url} download={local ? attachment.label : undefined} target={local ? undefined : "_blank"} rel="noreferrer" aria-label={`Download or open ${attachment.label}`}>
          <Download size={16} aria-hidden="true" /><span>Open file</span>
        </a>
      </div>
      {attachment.type === "image" ? (
        <div className={styles.imagePreview}>
          {/* Native images support both published assets and private local blob URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachment.url} alt={attachment.label} />
        </div>
      ) : attachment.type === "pdf" ? (
        <div className={styles.pdfPreview}>
          <iframe src={attachment.url} title={`PDF: ${attachment.label}`} />
          <p>If the document does not appear, use <a href={attachment.url} target="_blank" rel="noreferrer">Open PDF <ArrowUpRight size={13} aria-hidden="true" /></a>.</p>
        </div>
      ) : attachment.type === "stl" ? (
        <StlViewer key={attachment.url} url={attachment.url} label={attachment.label} />
      ) : (
        <div className={styles.previewMessage}>
          <AttachmentIcon type={attachment.type} />
          <h3>{attachment.type === "presentation" ? "Inside the presentation" : "Explore the engineering file"}</h3>
          <p>{attachment.type === "presentation"
            ? "Download this presentation to view its slides in PowerPoint or another compatible app."
            : "Download this file to inspect it in a compatible CAD application. STL files can be previewed here in 3D."}</p>
          <a className={styles.fileButton} href={attachment.url} download={local ? attachment.label : undefined} target={local ? undefined : "_blank"} rel="noreferrer">
            Open {attachment.type === "presentation" ? "presentation" : "CAD file"}<ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  );
}

export default function DetailView({ entry, kind }: { entry: PortfolioEntry; kind: "project" | "experience" }) {
  const [localAttachment, setLocalAttachment] = useState<LocalAttachment | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showLocal, setShowLocal] = useState(false);
  const [fileError, setFileError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const attachment = showLocal && localAttachment ? localAttachment : entry.attachments[selectedIndex];
  const sectionName = kind === "project" ? "projects" : "experience";

  useEffect(() => {
    if (!localAttachment) return;
    return () => URL.revokeObjectURL(localAttachment.url);
  }, [localAttachment]);

  function previewFile(file?: File) {
    if (!file) return;
    setFileError("");
    if (file.size > 50 * 1024 * 1024) {
      setFileError("Choose a file smaller than 50 MB.");
      return;
    }
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    let type: Attachment["type"];
    if (["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp"].includes(extension)) type = "image";
    else if (extension === "pdf") type = "pdf";
    else if (["ppt", "pptx"].includes(extension)) type = "presentation";
    else if (extension === "stl") type = "stl";
    else if (["step", "stp", "iges", "igs", "sldprt", "cad", "zip", "dwg", "dxf"].includes(extension)) type = "cad";
    else {
      setFileError("Choose an image, PDF, PowerPoint, STL, or supported CAD file.");
      return;
    }
    setLocalAttachment({ label: file.name, type, url: URL.createObjectURL(file), local: true });
    setShowLocal(true);
  }

  function clearLocalFile() {
    setLocalAttachment(null);
    setShowLocal(false);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark} aria-label="Prashant Bhattarai home">PB<span>®</span></Link>
        <span className={styles.headerLabel}>MECHANICAL ENGINEERING / SELECTED WORK</span>
        <Link href={`/#${sectionName}`} className={styles.backLink}><ArrowLeft size={15} aria-hidden="true" />Back to {sectionName}</Link>
      </header>

      <section className={styles.hero} aria-labelledby="entry-title">
        <div className={styles.heroEyebrow}>{kind === "project" ? "PROJECT" : "EXPERIENCE"}<span className={styles.heroCategory}>{entry.category}</span></div>
        <div className={styles.heroGrid}>
          <div>
            <h1 id="entry-title">{entry.title}<span className={styles.lime}>.</span></h1>
            <p className={styles.heroSummary}>{entry.summary}</p>
          </div>
          <figure className={styles.drawing} data-detail-visual={entry.slug}><div className={styles.visualCover}><DetailVisual slug={entry.slug} /></div><figcaption className={styles.drawingCaption}><span>{entry.category}</span><span>Concept illustration</span></figcaption></figure>
        </div>
        <div className={styles.heroFooter}><span>{entry.organization}</span>{entry.period && <span>{entry.period}</span>}<ArrowDownRight size={28} strokeWidth={1.3} aria-hidden="true" /></div>
      </section>

      <div className={styles.body}>
        <aside className={styles.sidebar} aria-label="Entry information">
          <span className={styles.sidebarLabel}>{kind === "project" ? "PROJECT INFORMATION" : "EXPERIENCE"}</span>
          <dl>
            <div><dt>{kind === "project" ? "Context" : "Organization"}</dt><dd>{entry.organization}</dd></div>
            {entry.period && <div><dt>Period</dt><dd>{entry.period}</dd></div>}
            <div><dt>Discipline</dt><dd>{entry.category}</dd></div>
          </dl>
          {entry.skills.length > 0 && <div className={styles.skills}><h2>Tools & skills</h2><ul>{entry.skills.map((skill) => <li key={skill}>{skill}</li>)}</ul></div>}
          <Link className={styles.contactLink} href="/#contact">Get in touch<ArrowUpRight size={17} aria-hidden="true" /></Link>
        </aside>

        <div className={styles.content}>
          <section className={styles.overview} aria-labelledby="overview-title">
            <div className={styles.sectionHeading}><span>01 /</span><h2 id="overview-title">{kind === "project" ? "Project overview" : "Responsibilities & contributions"}</h2></div>
            <div className={styles.detailList}>{entry.details.map((detail, index) => <div className={styles.detailRow} key={`${index}-${detail}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{detail}</p></div>)}</div>
          </section>

          <section className={styles.documentation} aria-labelledby="documentation-title">
            <div className={styles.sectionHeading}><span>02 /</span><h2 id="documentation-title">Technical documentation</h2></div>
            {entry.attachments.length > 0 && <div className={styles.attachmentTabs} role="group" aria-label="Choose a document">{entry.attachments.map((file, index) => <button type="button" key={`${file.url}-${index}`} className={!showLocal && selectedIndex === index ? styles.activeAttachment : undefined} aria-pressed={!showLocal && selectedIndex === index} onClick={() => { setSelectedIndex(index); setShowLocal(false); }}><AttachmentIcon type={file.type} /><span>{file.label}</span></button>)}</div>}
            {attachment ? <AttachmentPreview attachment={attachment} /> : <div className={styles.emptyDocumentation}><div className={styles.documentOutline} aria-hidden="true"><FileText size={32} strokeWidth={1} /><span>DOCUMENTATION</span></div><p>{kind === "project" ? "Project" : "Experience"} documentation will be added here.</p></div>}

            <details className={styles.localPreview}>
              <summary><Plus size={15} aria-hidden="true" />Preview a local file<span>PRIVATE PREVIEW</span></summary>
              <div className={styles.localPreviewBody}>
                <p>Try an image, PDF, presentation, STL model, or CAD file. Your file stays in this browser. This is a preview only; it is not uploaded or published.</p>
                <label className={styles.fileLabel} htmlFor={inputId}>Choose a file <ArrowUpRight size={15} aria-hidden="true" /></label>
                <input className={styles.fileInput} ref={inputRef} id={inputId} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.bmp,.pdf,.ppt,.pptx,.stl,.step,.stp,.iges,.igs,.sldprt,.cad,.zip,.dwg,.dxf" onChange={(event) => previewFile(event.target.files?.[0])} aria-describedby={`${inputId}-help`} />
                <span id={`${inputId}-help`} className={styles.fileHelp}>Maximum size: 50 MB. PowerPoint and CAD files open in a compatible app.</span>
                {fileError && <p className={styles.fileError} role="alert">{fileError}</p>}
                {localAttachment && <div className={styles.localFile}><button type="button" onClick={() => setShowLocal(true)} aria-pressed={showLocal}><AttachmentIcon type={localAttachment.type} /><span>{localAttachment.label}</span></button><button type="button" onClick={clearLocalFile} aria-label={`Remove local preview of ${localAttachment.label}`}><X size={17} aria-hidden="true" /></button></div>}
              </div>
            </details>
          </section>

          <Link className={styles.nextLink} href={`/#${sectionName}`}><span><small>CONTINUE EXPLORING</small>Back to {sectionName}<span className={styles.lime}>.</span></span><ArrowUpRight size={38} strokeWidth={1.2} aria-hidden="true" /></Link>
        </div>
      </div>
      <footer className={styles.footer}><Link href="/">PRASHANT BHATTARAI</Link><span>MECHANICAL ENGINEERING</span><a href="#entry-title">BACK TO TOP ↑</a></footer>
    </main>
  );
}
