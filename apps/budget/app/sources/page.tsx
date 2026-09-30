import type { Metadata } from "next";
import { Rise, SectionHead } from "@betterbarmm/editorial";
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
  return (
    <>
      <Masthead
        kicker="Where this comes from"
        title="Every figure traces"
        titleMuted="back to a page."
      >
      </Masthead>

      {/* ---- The files ---- */}
      <section className="bb-container section-band">
        <SectionHead
          index="01"
          eyebrow="Check it yourself"
          size="sm"
          title="Every file"
          titleMuted="this was built from."
          lead={`Seven fiscal years of the Act, and the extraction FY ${budget.fiscalYear} was read out of. Nothing on this workspace is a figure you have to take on trust — download the year you want and the page numbers printed on these pages will take you to the line.`}
        />

        <SourceFiles
          files={DOWNLOADS.map((file) => ({
            file: file.file,
            year: file.year,
            kind: file.kind,
            role: file.role,
          }))}
        />

        <Rise distance={12}>
          <div className="mt-10 border-t border-[var(--rule)] pt-6 text-[12.5px] leading-7 text-[var(--ink-3)]">
            <p>
              Page numbers printed on these pages are the Act&rsquo;s own, as it
              numbers itself. In the PDF they sit {budget.pdfPageOffset} pages
              later, because of the cover matter — so printed page 136 is PDF
              page {136 + budget.pdfPageOffset}.
            </p>
            <p className="mt-3">
              Extracted {budget.extractedOn}. Found an error?{" "}
              <a href="mailto:support@betterbarmm.com" className="rule-link">
                Tell us
              </a>{" "}
              — a figure that disagrees with the Act is a bug, and it will be
              fixed and the change noted.
            </p>
          </div>
        </Rise>
      </section>

      {/* How those figures were got, and how they could still be wrong. Under
          the files rather than over them (user decision): a reader who came for
          a download reaches it first, and the method is what they read once the
          document is in front of them. On the light ground so it reads as a
          statement about the page rather than as more of the page. */}
      <section className="bg-[var(--paper-2)]">
        <div className="bb-container section-band">
          {/* Two cells rather than `columns-2`: flowed columns would split the
					    disclaimer across the gutter mid-sentence and strand its bolded
					    opening wherever the break landed. Split by argument instead — how
					    the figures were got on the left, how they could still be wrong on
					    the right. */}
          <div className="grid gap-x-16 gap-y-8 text-[15px] leading-8 text-[var(--ink-2)] lg:grid-cols-2">
            <div>
              {/* Where the document itself comes from, before anything about how
                  it was read. The Ministry publishes the Acts; this workspace only
                  transcribes what it publishes, and a reader who distrusts the
                  transcription should be able to go straight past it. */}
              <p>
                The Acts are published by the Bangsamoro Ministry of Finance,
                and Budget and Management at{" "}
                <a
                  href="https://mfbm.bangsamoro.gov.ph"
                  target="_blank"
                  rel="noreferrer"
                  className="rule-link"
                >
                  mfbm.bangsamoro.gov.ph
                </a>
                . That is the source of record; the PDFs offered below are those
                files as published.
              </p>
              <p className="mt-4">
                Every one of those lines was read from the text layer of the
                Act&rsquo;s own PDF, not retyped and not re-totalled, and each
                carries the printed page it came from so any figure on this
                workspace can be checked against the page it was taken out of.
              </p>
              <p className="mt-4">
                Where the Act prints a subtotal, that subtotal is what appears
                here — including the places where the rows beneath it do not add
                up to it. Extracted {budget.extractedOn}.
              </p>
            </div>

            {/* The caveat belongs beside the claim, not in a footnote under it. A
						    page that says its figures are checkable has to say in the same
						    breath how they could still be wrong.

						    The rule divides them only when they are stacked; side by side the
						    gutter already does it. */}
            <p className="border-t border-[var(--rule)] pt-5 text-[var(--ink-3)] lg:border-t-0 lg:pt-0">
              <strong className="font-semibold text-[var(--ink)]">
                These figures are machine-read, and some of them will be wrong.
              </strong>{" "}
              The Act is a PDF, and the{" "}
              {(
                programs.length +
                provisions.length +
                projects.length
              ).toLocaleString("en-PH")}{" "}
              lines on this workspace had to be pulled out of one — glyph by
              glyph in places, where the file&rsquo;s own encoding had to be
              normalised before a digit could be read at all. An extraction that
              size misreads some of what it reads. Every line is being checked
              against the printed page by hand, on a rolling basis, and
              corrections go in as they are found. Where a figure here disagrees
              with the Act, the Act is right —{" "}
              <a href="mailto:support@betterbarmm.com" className="rule-link">
                tell us
              </a>{" "}
              and it will be fixed.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
