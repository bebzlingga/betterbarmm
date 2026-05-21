import { type PropsWithChildren } from "react";
import { clsx } from "clsx";

export interface CardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function Card({
  title,
  description,
  children,
  className,
}: PropsWithChildren<CardProps>) {
  return (
    <section
      className={clsx("border border-[#16140f] bg-[#f7f5f0] p-6", className)}
    >
      {title ? (
        <h2 className="font-sans text-xl font-extrabold tracking-[-0.02em] text-[#16140f]">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm leading-6 text-[#3a352a]">{description}</p>
      ) : null}
      <div className="mt-5 text-[#3a352a]">{children}</div>
    </section>
  );
}
