import { Injectable, inject, computed } from '@angular/core';
import { PromptHistoryService } from './prompt-history.service';

export interface MonthlyActivity {
  month: string;   // 'Ene', 'Feb', etc.
  year: number;
  count: number;
  words: number;
}

export interface TypeStat {
  type: string;
  label: string;
  icon: string;
  count: number;
  percent: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private history = inject(PromptHistoryService);

  readonly overview = computed(() => {
    const entries = this.history.entries();
    const totalWords = entries.reduce((s, e) => s + e.wordCount, 0);
    const totalTokens = Math.round(totalWords * 1.3);
    const avgWords = entries.length ? Math.round(totalWords / entries.length) : 0;

    const typeCounts: Record<string, number> = {};
    for (const e of entries) {
      typeCounts[e.projectType] = (typeCounts[e.projectType] ?? 0) + 1;
    }
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    return { total: entries.length, totalWords, totalTokens, avgWords, topType, typeCounts };
  });

  readonly monthlyActivity = computed((): MonthlyActivity[] => {
    const entries = this.history.entries();
    const map = new Map<string, MonthlyActivity>();
    const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

    for (const e of entries) {
      const d = new Date(e.generatedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!map.has(key)) {
        map.set(key, { month: monthNames[d.getMonth()], year: d.getFullYear(), count: 0, words: 0 });
      }
      const m = map.get(key)!;
      m.count++;
      m.words += e.wordCount;
    }

    return Array.from(map.values())
      .sort((a, b) => a.year !== b.year ? a.year - b.year : monthNames.indexOf(a.month) - monthNames.indexOf(b.month))
      .slice(-12);
  });

  readonly typeStats = computed((): TypeStat[] => {
    const { typeCounts, total } = this.overview();
    const labels: Record<string, { label: string; icon: string }> = {
      'web-app':       { label: 'Web App',       icon: '🌐' },
      'api':           { label: 'API REST',       icon: '⚡' },
      'mobile-app':    { label: 'Mobile',         icon: '📱' },
      'desktop-app':   { label: 'Desktop',        icon: '🖥️' },
      'microservices': { label: 'Microservicios', icon: '🔧' },
      'cms':           { label: 'CMS',            icon: '📝' },
      'ecommerce':     { label: 'E-commerce',     icon: '🛒' },
      'dashboard':     { label: 'Dashboard',      icon: '📊' },
      'other':         { label: 'Otro',           icon: '📦' },
    };
    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type,
        label: labels[type]?.label ?? type,
        icon: labels[type]?.icon ?? '📦',
        count,
        percent: total ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  });
}
