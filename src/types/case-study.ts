export type CaseStudyStep = {
  title: string;
  beforePhoto: string[];
  imageId: string;
  caption: string;
  afterPhoto?: string[];
};

/** Steps can be added, removed, or reordered to match the actual work. */
export type CaseStudyDraft = {
  sourceSlug: string;
  title: string;
  excerpt: string;
  intro: string[];
  steps: CaseStudyStep[];
  symptomsHeading: string;
  symptoms: string[];
  closing: string;
};
