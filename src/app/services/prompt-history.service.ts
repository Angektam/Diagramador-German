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

  import(raw: string): { imported: number; skipped: number; error?: string } {
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        return { imported: 0, skipped: 0, error: 'El archivo no contiene JSON válido' };
      }

      if (!Array.isArray(parsed)) {
        // Intentar extraer del formato de exportación PromptGen
        if (parsed && typeof parsed === 'object' && 'projects' in parsed && Array.isArray((parsed as any).projects)) {
          parsed = (parsed as any).projects;
        } else {
          return { imported: 0, skipped: 0, error: 'Formato no reconocido. Se espera un array de proyectos.' };
        }
      }

      const entries = parsed as any[];
      if (entries.length === 0) {
        return { imported: 0, skipped: 0, error: 'El archivo no contiene proyectos' };
      }

      if (entries.length > 200) {
        return { imported: 0, skipped: 0, error: 'Demasiados proyectos (máx. 200). Divide el archivo.' };
      }

      const existing = new Set(this.entries().map(e => e.id));
      const toAdd: HistoryEntry[] = entries
        .filter(e => this.isValidEntry(e) && !existing.has(e.id))
        .map(e => ({
          id: String(e.id),
          projectName: String(e.projectName).slice(0, 100),
          projectType: String(e.projectType),
          generatedAt: new Date(e.generatedAt),
          prompt: String(e.prompt),
          wordCount: Number(e.wordCount) || e.prompt?.split(/\s+/).length || 0,
          documentCount: Number(e.documentCount) || 0,
          tags: Array.isArray(e.tags) ? e.tags.map(String).slice(0, 10) : [],
          versions: Array.isArray(e.versions) ? e.versions.slice(0, 10) : []
        }));

      const merged = [...toAdd, ...this.entries()].slice(0, MAX_ENTRIES);
      this.entries.set(merged);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return { imported: toAdd.length, skipped: entries.length - toAdd.length };
    } catch {
      return { imported: 0, skipped: 0, error: 'Error al procesar el archivo' };
    }
  }

  /** Valida que un objeto tenga la estructura mínima de una entrada */
  private isValidEntry(e: unknown): boolean {
    if (!e || typeof e !== 'object') return false;
    const entry = e as Record<string, unknown>;
    return !!(
      entry['id'] &&
      entry['projectName'] &&
      typeof entry['projectName'] === 'string' &&
      entry['prompt'] &&
      typeof entry['prompt'] === 'string' &&
      entry['prompt'].length > 10
    );
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
