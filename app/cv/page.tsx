import type { Metadata } from "next";
import { Frame, PageHeader } from "../site-chrome";

export const metadata: Metadata = { title: "CV" };

export default function Cv() {
  return (
    <Frame>
      <article className="content-page cv-page">
        <PageHeader
          kicker="CURRICULUM VITAE"
          title="CV"
          description="Experience, education, research, publications, patents, and professional service."
        />
        <div className="cv-actions">
          <a href="/cv.pdf" target="_blank" rel="noreferrer">Open PDF ↗</a>
          <a href="/cv.pdf" download>Download PDF ↓</a>
        </div>
        <object
          className="cv-viewer"
          data="/cv.pdf"
          type="application/pdf"
          aria-label="Balakrishnan (Murali) Narayanaswamy CV"
        >
          <p>
            Your browser cannot display the PDF inline.{" "}
            <a href="/cv.pdf">Open the CV PDF</a>.
          </p>
        </object>
      </article>
    </Frame>
  );
}

