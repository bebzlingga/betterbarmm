import { BudgetComingSoonPage } from "../_components/budget-coming-soon-page";

export default function BudgetFuturePage() {
  return (
    <BudgetComingSoonPage
      activeItem="The future story"
      eyebrow="Future story / coming soon"
      title="We are cooking"
      accent="the future story."
      description="A narrative layer is taking shape here: fewer tables, sharper context, and a clearer path from appropriations to classrooms, roads, clinics, local services, reserves, and communities."
      signal="We are shaping this as a story view, not another table: fewer rows, stronger context, and a better bridge between peso amounts and public outcomes."
      statusHeading="Plot in progress."
      notes={[
        "A guided read of the biggest FY 2026 commitments.",
        "Plain-language context for programs, funds, and special provisions.",
        "A visual path from budget lines to the public services they point toward.",
      ]}
      checkpoints={[
        "Choose the strongest story beats from the GAAB source lines.",
        "Connect high-value programs to sectors and public-facing outcomes.",
        "Design a scrollable narrative that still links back to the data.",
      ]}
    />
  );
}
