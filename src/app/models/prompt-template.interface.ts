import { ProjectType } from './project-info.interface';

export interface PromptTemplate {
  type: ProjectType;
  sections: PromptSection[];
}

export interface PromptSection {
  title: string;
  content: string;
  order: number;
}

export interface GeneratedPrompt {
  content: string;
  metadata: {
    projectType: ProjectType;
    generatedAt: Date;
    documentCount: number;
    wordCount: number;
  };
}
