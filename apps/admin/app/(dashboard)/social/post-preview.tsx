import { GlobeHemisphereEastIcon } from "@phosphor-icons/react/ssr";

/* A post roughly as Facebook shows it: page, time, text, then the photo or
   the link card. Used live in the composer and read-only in review. */

export const LONG = 500; // Past this, Facebook folds the post behind "See more".

export function PostPreview({ pageName, when, body, image, link }: { pageName: string; when: string; body: string; image: string | null; link: string | null }) {
  let host = "";
  try {
    host = link ? new URL(link).hostname.replace(/^www\./, "") : "";
  } catch {}
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--rule)] bg-white text-[#1c1e21] shadow-[var(--shadow-md)]">
      <div className="flex items-center gap-2.5 px-4 pt-4">
        <span className="grid size-10 place-items-center rounded-full bg-[#9b2a1c] font-[family-name:var(--font-display)] text-sm font-bold text-white">B</span>
        <div>
          <p className="text-[14px] font-semibold leading-tight">{pageName}</p>
          <p className="flex items-center gap-1 text-[12px] text-[#65676b]">
            {when} · <GlobeHemisphereEastIcon size={12} aria-hidden="true" />
          </p>
        </div>
      </div>
      <p className="whitespace-pre-wrap break-words px-4 pb-3 pt-3 text-[15px] leading-[1.35]">
        {body ? (
          body.length > LONG ? (
            <>
              {body.slice(0, 480)}… <span className="font-semibold text-[#65676b]">See more</span>
            </>
          ) : (
            body
          )
        ) : (
          <span className="text-[#8a8d91]">Your post appears here.</span>
        )}
      </p>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="max-h-[22rem] w-full object-cover" />
      ) : host ? (
        <div className="border-t border-[#e4e6eb] bg-[#f0f2f5] px-4 py-3">
          <p className="text-[12px] uppercase text-[#65676b]">{host}</p>
          <p className="mt-0.5 text-[15px] font-semibold leading-snug">Link preview</p>
          <p className="text-[13px] text-[#65676b]">Facebook fills this card from the page when it posts.</p>
        </div>
      ) : null}
      {image && link ? <p className="px-4 py-2 text-[13px] text-[#385898]">{link}</p> : null}
    </div>
  );
}

/** "Oct 13, 9:00 AM" in Manila, or "Just now". */
export const whenLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }) : "Just now";

export const STATUS = {
  draft: ["Draft", "pill"],
  in_review: ["In review", "pill-warn"],
  scheduled: ["Scheduled", "pill-info"],
  posted: ["Posted", "pill-good"],
  failed: ["Failed", "pill-accent"],
} as const;
