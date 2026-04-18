import { Injectable, signal } from '@angular/core';
import { ProjectType } from '../models/project-info.interface';

export interface PromptTemplate {
  id: string;
  name: string;
  technologies: string[];
  projectType: ProjectType;
  createdAt: Date;
}

const KEY = 'pg_templates';

@Injectable({ providedIn: 'root' })
export class TemplateStoreService {
  templates = signal<PromptTemplate[]>(this.load());

  save(name: string, technologies: string[], projectType: ProjectType): PromptTemplate {
    const t: PromptTemplate = { id: Date.now().toString(), name, technologies, projectType, createdAt: new Date() };
    const updated = [t, ...this.templates()].slice(0, 10);
    this.templates.set(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
    return t;
  }

  delete(id: string) {
    const updated = this.templates().filter(t => t.id !== id);
    this.templates.set(updated);
    localStorage.setItem(KEY, JSON.stringify(updated));
  }

  private load(): PromptTemplate[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw).map((t: any) => ({ ...t, createdAt: new Date(t.createdAt) })) : [];
    } catch { return []; }
  }
}
