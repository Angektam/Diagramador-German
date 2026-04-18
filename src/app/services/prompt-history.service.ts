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
  tags: string[];
  versions: { id: string; prompt: string; generatedAt: Date; wordCount: number }[];
}

export type SortField = 'date' | 'name' | 'type' | 'words';
export type SortDir   = 'asc' | 'desc';

const STORAGE_KEY = 'prompt_history';
const MAX_ENTRIES = 50;

@Injectable({ providedIn: 'root' })
export class PromptHistoryService {
  entries = signal<HistoryEntry[]>(this.load());
  sortField = signal<SortField>('date');
  sortDir   = signal<SortDir>('desc');

  save(projectName: string, prompt: GeneratedPrompt): HistoryEntry {
    const current = this.entries();
    const existing = current.find(e => e.projectName === projectName);

    if (existing) {
      // Guardar versión anterior
      const newVersion = { id: Date.now().toString(), prompt: prompt.content, generatedAt: new Date(), wordCount: prompt.metadata.wordCount };
      const updated = current.map(e => e.id === existing.id
        ? { ...e, prompt: prompt.content, wordCount: prompt.metadata.wordCount, generatedAt: new Date(), versions: [newVersion, ...(e.versions ?? [])].slice(0, 10) }
        : e);
      this.entries.set(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return existing;
    }

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      projectName,
      projectType: prompt.metadata.projectType,
      generatedAt: new Date(),
      prompt: prompt.content,
      wordCount: prompt.metadata.wordCount,
      documentCount: prompt.metadata.documentCount,
      tags: [],
      versions: []
    };
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

  rename(id: string, newName: string): void {
    const updated = this.entries().map(e => e.id === id ? { ...e, projectName: newName } : e);
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  setTags(id: string, tags: string[]): void {
    const updated = this.entries().map(e => e.id === id ? { ...e, tags } : e);
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  restoreVersion(entryId: string, versionId: string): void {
    const updated = this.entries().map(e => {
      if (e.id !== entryId) return e;
      const v = e.versions.find(v => v.id === versionId);
      if (!v) return e;
      return { ...e, prompt: v.prompt, wordCount: v.wordCount };
    });
    this.entries.set(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  clear(): void {
    this.entries.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  import(raw: string): { imported: number; skipped: number } {
    try {
      const parsed: any[] = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error('Invalid format');
      const existing = new Set(this.entries().map(e => e.id));
      const toAdd: HistoryEntry[] = parsed
        .filter(e => e.id && e.projectName && e.prompt && !existing.has(e.id))
        .map(e => ({ tags: [], versions: [], ...e, generatedAt: new Date(e.generatedAt) }));
      const merged = [...toAdd, ...this.entries()].slice(0, MAX_ENTRIES);
      this.entries.set(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return { imported: toAdd.length, skipped: parsed.length - toAdd.length };
    } catch {
      return { imported: 0, skipped: 0 };
    }
  }

  sorted(): HistoryEntry[] {
    const f = this.sortField(), d = this.sortDir();
    return [...this.entries()].sort((a, b) => {
      let cmp = 0;
      if (f === 'date')  cmp = new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
      if (f === 'name')  cmp = a.projectName.localeCompare(b.projectName);
      if (f === 'type')  cmp = a.projectType.localeCompare(b.projectType);
      if (f === 'words') cmp = a.wordCount - b.wordCount;
      return d === 'asc' ? cmp : -cmp;
    });
  }

  private load(): HistoryEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw).map((e: any) => ({
        tags: [], versions: [], ...e, generatedAt: new Date(e.generatedAt)
      }));
    } catch { return []; }
  }
}
