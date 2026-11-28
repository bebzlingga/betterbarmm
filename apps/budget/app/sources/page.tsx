import type { Metadata } from "next";
import { budget, programs, projects, provisions } from "@betterbarmm/budget-data";
import { Masthead } from "../_components/budget-parts";
import { SourceFiles } from "../_components/source-files";
import { DOWNLOADS } from "./downloads";

export const metadata: Metadata = {
  title: "Sources",
  description: `Where every figure on this workspace comes from: ${budget.actLong}, the extraction that produced it, and the files to download and check it yourself.`,
};

/**
 * The questions a reader asks in the order they ask them, as prose rather than
 * as a methodology.
 *
 * "Methodology" is a page nobody opens. What a reader actually wants to know
 * is narrower and more suspicious than that: where did you get this, did you
 * change it, and what are you not telling me. So those are the headings.
 */
export default function SourcesPage() {
  const lines = (programs.length + provisions.length + projects.length).toLocaleString("en-PH");
  // How the figures were got, a card each: where the document comes from, how it was read, and what was kept as printed.
  const method = [
    {
      title: "The Act, as published",
      body: (
        <>
          The Acts are published by the Bangsamoro Ministry of Finance, and Budget and Management at{" "}
          <a href="https://mfbm.bangsamoro.gov.ph" target="_blank" rel="noreferrer" className="rule-link">
            mfbm.bangsamoro.gov.ph
          </a>
          . That is the source of record; the PDFs here are those files as published.
        </>
      ),
    },
    {
      title: "Read, not retyped",
      body: "Every line was read from the text layer of the Act’s own PDF, not retyped and not re-totalled, and each carries the printed page it came from, so any figure can be checked against the page it was taken out of.",
    },
    {
      title: "Subtotals as printed",
      body: `Where the Act prints a subtotal, that subtotal is what appears here, including the places where the rows beneath it do not add up to it. Extracted ${budget.extractedOn}.`,
    },
  ];

  return (
    <>
      <Masthead
        kicker="Where this comes from"
        title="Sources"
        lead={`Every figure traces back to a page. Seven fiscal years of the Act and the extraction FY ${budget.fiscalYear} was read out of: download the year you want, and the page numbers printed on this workspace take you to the line.`}
      />

      {/* ---- The files ---- */}
      <section className="bb-container section-band">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="dv-title">Every file this was built from</h2>
          <p className="max-w-xl text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]">Nothing here is a figure you have to take on trust.</p>
        </div>

        <SourceFiles
          files={DOWNLOADS.map((file) => ({
            file: file.file,
            year: file.year,
            kind: file.kind,
            role: file.role,
          }))}
        />

        {/* How to find a printed page in the PDF, as a note card under the files. */}
        <div className="mt-6 flex flex-col gap-2 rounded-2xl bg-[var(--paper-2)] p-5 text-[0.84375rem] leading-[1.65] text-[var(--ink-2)] sm:flex-row sm:gap-6">
          <p className="shrink-0 font-mono text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--brass)] sm:pt-1">Page numbers</p>
          <p>
            The page numbers on this workspace are the Act&rsquo;s own, as it numbers itself. In the PDF they sit {budget.pdfPageOffset} pages
            later, because of the cover matter, so printed page 136 is PDF page {136 + budget.pdfPageOffset}.
          </p>
        </div>
      </section>

      {/* ---- How the figures were got, and how they could still be wrong ---- */}
      <section className="tv-wash">
        <div className="bb-container section-band">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="dv-title">How the figures were made</h2>
            <p className="max-w-xl text-[0.9375rem] leading-[1.7] text-[var(--ink-3)]">From the published Act to a line on this workspace.</p>
          </div>

          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {method.map((step, index) => (
              <li key={step.title} className="flex flex-col rounded-[var(--dv-r)] border border-[var(--rule)] bg-[var(--paper)] p-6">
                <span className="num text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[1.0625rem] font-extrabold tracking-[-0.015em] text-[var(--ink)]">{step.title}</h3>
                <p className="mt-2 text-[0.875rem] leading-[1.7] text-[var(--ink-2)]">{step.body}</p>
              </li>
            ))}
          </ol>

          {/* The caveat beside the claim, not in a footnote under it: a page that says its figures are checkable says in
              the same breath how they could still be wrong. */}
          <div className="mt-4 rounded-[var(--dv-r)] bg-[#8f2328] p-6 text-white lg:p-8">
            <p className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[#f6cf7a]">Some of these will be wrong</p>
            <p className="mt-3 max-w-4xl text-[0.9375rem] leading-[1.75] text-white/90">
              <strong className="font-semibold text-white">These figures are machine-read.</strong> The Act is a PDF, and the {lines}{" "}lines on this
              workspace had to be pulled out of one, glyph by glyph in places, where the file&rsquo;s own encoding had to be normalised before a
              digit could be read at all. An extraction that size misreads some of what it reads. Every line is being checked against the printed
              page by hand, on a rolling basis, and corrections go in as they are found. Where a figure here disagrees with the Act, the Act is
              right.
            </p>
            <a
              href="mailto:support@betterbarmm.com"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[0.8125rem] font-bold text-[#8f2328] transition hover:bg-[#fff3cf]"
            >
              Tell us about an error
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
