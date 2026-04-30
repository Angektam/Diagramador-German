import { Injectable } from '@angular/core';

/**
 * Servicio de sanitización centralizado.
 * Previene XSS y otros ataques de inyección en inputs del usuario.
 */
@Injectable({ providedIn: 'root' })
export class SanitizerService {

  /** Escapa caracteres HTML peligrosos */
  escapeHtml(input: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return input.replace(/[&<>"'/]/g, char => map[char] ?? char);
  }

  /** Elimina tags HTML de un string */
  stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  }

  /** Sanitiza un input de texto general (trim + limitar longitud + eliminar caracteres de control) */
  sanitizeText(input: string, maxLength = 500): string {
    return input
      .trim()
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Eliminar caracteres de control
      .slice(0, maxLength);
  }

  /** Sanitiza un nombre de proyecto (alfanumérico + espacios + guiones) */
  sanitizeProjectName(input: string): string {
    return input
      .trim()
      .replace(/[^\w\s\-áéíóúÁÉÍÓÚñÑüÜ().,:;]/g, '')
      .slice(0, 100);
  }

  /** Sanitiza un nombre de archivo */
  sanitizeFileName(input: string): string {
    return input
      .trim()
      .replace(/[^\w\s\-().]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 200);
  }

  /** Valida y sanitiza una URL */
  sanitizeUrl(input: string): string | null {
    try {
      const url = new URL(input);
      if (!['http:', 'https:'].includes(url.protocol)) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  /** Detecta posibles intentos de inyección */
  hasInjectionAttempt(input: string): boolean {
    const patterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /expression\s*\(/i,
    ];
    return patterns.some(p => p.test(input));
  }

  /** Resalta texto de búsqueda de forma segura (sin innerHTML vulnerable) */
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm.trim()) return this.escapeHtml(text);
    const escaped = this.escapeHtml(text);
    const escapedTerm = this.escapeRegex(searchTerm);
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
