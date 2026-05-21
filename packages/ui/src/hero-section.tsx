import { type PropsWithChildren } from "react";

export interface HeroSectionProps {
  title: string;
  description: string;
  actions?: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }>;
}

export function HeroSection({
  title,
  description,
  actions,
}: PropsWithChildren<HeroSectionProps>) {
  return (
    <div className="border-y border-[#16140f] bg-[#f7f5f0] py-12 text-[#16140f] sm:py-16">
      <div className="max-w-5xl">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a2418]">
          BetterBARMM platform
        </p>
        <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[0.98] tracking-[-0.035em] sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#3a352a]">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {actions?.map((action) => (
            <a
              key={action.href}
              href={action.href}
              className={`inline-flex border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-150 ${
                action.variant === "primary"
                  ? "border-[#16140f] bg-[#16140f] text-[#f7f5f0] hover:bg-[#8a2418]"
                  : "border-[#cbc1a8] bg-[#f7f5f0] text-[#16140f] hover:border-[#8a2418] hover:text-[#8a2418]"
              }`}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
