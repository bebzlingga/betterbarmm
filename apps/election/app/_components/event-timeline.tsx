import { HorizontalTimeline } from "./horizontal-timeline";

export type EventTimelineItem = {
  id: string;
  yearLabel: string;
  dateLabel: string;
  kicker: string;
  title: string;
  body: string;
};

function EventCard({ item }: { item: EventTimelineItem }) {
  return (
    <div>
      <p className="eyebrow text-[9px]">{item.kicker}</p>
      <h3 className="mt-2 text-lg font-extrabold leading-tight tracking-[-0.025em]">
        {item.title}
      </h3>
      <p className="mt-2 line-clamp-5 text-xs leading-snug text-[var(--ink-2)]">
        {item.body}
      </p>
    </div>
  );
}

export function EventTimeline({ items }: { items: EventTimelineItem[] }) {
  return (
    <HorizontalTimeline
      ariaLabel="Election timeline"
      items={items.map((item) => ({
        id: item.id,
        yearLabel: item.yearLabel,
        dateLabel: item.dateLabel,
        card: <EventCard item={item} />,
      }))}
    />
  );
}
