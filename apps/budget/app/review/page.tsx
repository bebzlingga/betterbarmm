import { BudgetComingSoonPage } from "../_components/budget-coming-soon-page";

export default function BudgetReviewPage() {
  return (
    <BudgetComingSoonPage
      activeItem="The review"
      eyebrow="Public review"
      title="The review room is"
      accent="heating up."
      description="This page will turn the compiled GAAB dataset into a guided review space for source checks, classification flags, anomalies, and notes that need human attention."
      signal="The goal is to make review work visible: what passed, what looks odd, what still needs source confirmation, and which rows deserve a second look."
      notes={[
        "Source confidence and page references for each major budget line.",
        "Outlier notes for sudden increases, drops, and classification changes.",
        "A compact queue for rows that need human review before publication.",
      ]}
      checkpoints={[
        "Trace the largest rows back to their GAAB source pages.",
        "Flag unusual year-over-year movements and missing object details.",
        "Prepare reviewer notes that can sit beside the public tables.",
      ]}
    />
  );
}
