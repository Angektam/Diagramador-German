import { Injectable, signal } from '@angular/core';
import { GeneratedPrompt } from '../models/prompt-template.interface';

export interface HistoryEntry {
  id: string;
  projectName: string;
  projectType: string;
  generatedAt: Date;
  prompt: string;
  wordCount: number;
  documentCount: number;
}

const STORAGE_KEY = 'prompt_history';
const MAX_ENTRIES = 20;

@Injectable({ providedIn: 'root' })
export class PromptHistoryService {
  entries = signal<HistoryEntry[]>(this.load());

  save(projectName: string, prompt: GeneratedPrompt): HistoryEntry {
    const entry: HistoryEntry = {
      id: Date.now().toString(),
      projectName,
      projectType: prompt.metadata.projectType,
      generatedAt: new Date(),
      prompt: prompt.content,
      wordCount: prompt.metadata.wordCount,
      documentCount: prompt.metadata.documentCount
    };

    const current = this.entries();
    const updated = [entry, ...current].slice(0, MAX_ENTRIES);
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return entry;
  }

  delete(id: string): void {
    const updated = this.entries().filter(e => e.id !== id);
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  clear(): void {
    this.entries.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((e: any) => ({
        ...e,
        generatedAt: new Date(e.generatedAt)
      }));
    } catch {
      return [];
    }
  }
}
