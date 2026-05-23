import storiesJson from "../../../../datasets/election/barmm_2026_developing_stories.json";

type KeyFact = {
  text: string;
  date?: string | null;
  source_ids?: string[];
  confidence?: string;
};

export type DevelopingStory = {
  id: string;
  slug: string;
  status: string;
  priority: number;
  headline: string;
  deck: string;
  summary: string;
  why_it_matters: string;
  key_facts: KeyFact[];
  affected_entities?: string[];
  reader_questions?: string[];
  workspace_actions?: string[];
  source_ids?: string[];
  tags?: string[];
};

type DevelopingStoriesWorkspace = {
  dataset_name: string;
  generated_at: string;
  purpose: string;
  developing_stories: DevelopingStory[];
};

const workspace = storiesJson as unknown as DevelopingStoriesWorkspace;

function firstStoryDate(story: DevelopingStory) {
  return story.key_facts.find((fact) => fact.date)?.date ?? "";
}

export function getDevelopingStoriesViewModel() {
  return {
    metadata: {
      datasetName: workspace.dataset_name,
      generatedAt: workspace.generated_at,
      purpose: workspace.purpose,
    },
    stories: workspace.developing_stories,
    storyTimeline: workspace.developing_stories.map((story) => ({
      ...story,
      displayDate: firstStoryDate(story),
    })),
  };
}
