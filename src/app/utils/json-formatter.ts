/**
 * Genera un JSON bien estructurado y legible para un prompt individual.
 * El prompt se divide en secciones detectadas automáticamente.
 * Los textos largos se representan como arrays de líneas para legibilidad.
 */
export function formatPromptJson(entry: {
  id?: string;
  projectName: string;
  projectType: string;
  generatedAt: Date | string;
  wordCount: number;
  documentCount: number;
  tags?: string[];
  lang?: string;
  short?: boolean;
  prompt: string;
}): string {
  const sections = parsePromptSections(entry.prompt);
  const tokenEstimate = Math.round(entry.wordCount * 1.3);

  const structured = {
    _info: {
      generator: 'PromptGen v2.0',
      exportedAt: new Date().toISOString(),
      format: 'promptgen-v2'
    },
    metadata: {
      ...(entry.id ? { id: entry.id } : {}),
      projectName: entry.projectName,
      projectType: entry.projectType,
      generatedAt: new Date(entry.generatedAt).toISOString(),
      language: entry.lang ?? 'es',
      mode: entry.short ? 'short' : 'full',
      stats: {
        wordCount: entry.wordCount,
        tokenEstimate,
        documentCount: entry.documentCount,
        sectionCount: sections.length
      },
      tags: entry.tags ?? []
    },
    prompt: {
      full: textToLines(entry.prompt),
      sections: sections.map(s => ({
        title: s.title,
        content: textToLines(s.content)
      }))
    }
  };

  return JSON.stringify(structured, null, 2);
}

/**
 * Genera un JSON para exportación masiva con índice y proyectos separados.
 */
export function formatExportJson(entries: Array<{
  id: string;
  projectName: string;
  projectType: string;
  generatedAt: Date | string;
  wordCount: number;
  documentCount: number;
  tags: string[];
  prompt: string;
}>): string {
  const structured = {
    _info: {
      generator: 'PromptGen v2.0',
      exportedAt: new Date().toISOString(),
      format: 'promptgen-export-v2',
      totalProjects: entries.length,
      totalWords: entries.reduce((s, e) => s + e.wordCount, 0)
    },
    index: entries.map(e => ({
      id: e.id,
      projectName: e.projectName,
      projectType: e.projectType,
      generatedAt: new Date(e.generatedAt).toISOString(),
      wordCount: e.wordCount,
      tags: e.tags
    })),
    projects: entries.map(e => ({
      id: e.id,
      projectName: e.projectName,
      projectType: e.projectType,
      generatedAt: new Date(e.generatedAt).toISOString(),
      wordCount: e.wordCount,
      tokenEstimate: Math.round(e.wordCount * 1.3),
      documentCount: e.documentCount,
      tags: e.tags,
      prompt: {
        full: textToLines(e.prompt),
        sections: parsePromptSections(e.prompt).map(s => ({
          title: s.title,
          content: textToLines(s.content)
        }))
      }
    }))
  };

  return JSON.stringify(structured, null, 2);
}

/**
 * Convierte un texto multilínea en un array de líneas para que sea legible en JSON.
 * Cada línea es un elemento del array, eliminando el problema de strings enormes con \n.
 */
function textToLines(text: string): string[] {
  if (!text) return [];
  return text.split('\n');
}

/** Divide el prompt en secciones basándose en los separadores ════ */
function parsePromptSections(prompt: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  // Detectar bloques delimitados por ════...════ o líneas de título en mayúsculas
  const parts = prompt.split(/\n(?=════)/);

  for (const part of parts) {
    const lines = part.trim().split('\n');
    // Buscar línea de título (entre separadores ════)
    const sepIdx = lines.findIndex(l => /^════/.test(l));
    if (sepIdx !== -1) {
      // El título está entre el primer y segundo separador
      const titleLine = lines[sepIdx + 1]?.trim() ?? '';
      const contentStart = lines.findIndex((l, i) => i > sepIdx + 1 && /^════/.test(l));
      const contentLines = contentStart !== -1
        ? lines.slice(contentStart + 1)
        : lines.slice(sepIdx + 2);
      const content = contentLines.join('\n').trim();
      if (titleLine) {
        sections.push({ title: titleLine, content });
      }
    } else if (part.trim()) {
      // Contenido sin separador (inicio del prompt)
      sections.push({ title: 'Introducción', content: part.trim() });
    }
  }

  // Fallback: si no se detectaron secciones, devolver el prompt completo
  if (sections.length === 0) {
    sections.push({ title: 'Prompt completo', content: prompt.trim() });
  }

  return sections;
}
