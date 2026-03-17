export interface ProjectInfo {
  name: string;
  description: string;
  type: ProjectType;
  technologies: string[];
  requirements: Requirement[];
  features: Feature[];
  architecture?: ArchitectureSuggestion;
}

export type ProjectType = 
  | 'web-app'
  | 'api'
  | 'mobile-app'
  | 'desktop-app'
  | 'microservices'
  | 'cms'
  | 'ecommerce'
  | 'dashboard'
  | 'other';

export interface Requirement {
  id: string;
  type: 'functional' | 'non-functional';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Feature {
  name: string;
  description: string;
  components: string[];
}

export interface ArchitectureSuggestion {
  pattern: string;
  layers: string[];
  components: ComponentSuggestion[];
  folderStructure: string;
}

export interface ComponentSuggestion {
  name: string;
  type: 'component' | 'service' | 'model' | 'util';
  responsibilities: string[];
}
