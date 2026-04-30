import { Injectable } from '@angular/core';

/** Máximo de caracteres para compartir via URL (evitar URLs demasiado largas) */
const MAX_SHARE_LENGTH = 50_000;

@Injectable({ providedIn: 'root' })
export class ShareService {
  /**
   * Encode prompt content into a URL-safe compressed string.
   * Usa compresión si está disponible, fallback a base64.
   */
  async create(content: string): Promise<string> {
    if (!content || content.trim().length === 0) {
      throw new Error('No hay contenido para compartir');
    }

    if (content.length > MAX_SHARE_LENGTH) {
      throw new Error(`El contenido es demasiado largo para compartir (${(content.length / 1000).toFixed(0)}K caracteres). Máximo: ${MAX_SHARE_LENGTH / 1000}K`);
    }

    try {
      // Intentar comprimir con CompressionStream si está disponible
      if (typeof CompressionStream !== 'undefined') {
        const encoded = new TextEncoder().encode(content);
        const cs = new CompressionStream('gzip');
        const writer = cs.writable.getWriter();
        writer.write(encoded);
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = cs.readable.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const total = chunks.reduce((s, c) => s + c.length, 0);
        const compressed = new Uint8Array(total);
        let pos = 0;
        for (const c of chunks) { compressed.set(c, pos); pos += c.length; }

        // Prefijo 'z:' indica contenido comprimido
        return 'z:' + this.uint8ToBase64Url(compressed);
      }
    } catch {
      // Fallback a base64 simple
    }

    return btoa(encodeURIComponent(content));
  }

  /** Decode a shared string back to prompt content */
  async get(id: string): Promise<string> {
    if (!id || id.trim().length === 0) {
      throw new Error('ID de compartición inválido');
    }

    try {
      // Detectar si está comprimido (prefijo 'z:')
      if (id.startsWith('z:') && typeof DecompressionStream !== 'undefined') {
        const compressed = this.base64UrlToUint8(id.slice(2));
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(compressed);
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = ds.readable.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }

        const total = chunks.reduce((s, c) => s + c.length, 0);
        const decompressed = new Uint8Array(total);
        let pos = 0;
        for (const c of chunks) { decompressed.set(c, pos); pos += c.length; }

        return new TextDecoder().decode(decompressed);
      }

      // Fallback: base64 simple
      return decodeURIComponent(atob(id));
    } catch {
      throw new Error('No se pudo decodificar el contenido compartido. El enlace puede estar corrupto.');
    }
  }

  /** Convierte Uint8Array a base64 URL-safe */
  private uint8ToBase64Url(data: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** Convierte base64 URL-safe a Uint8Array */
  private base64UrlToUint8(str: string): Uint8Array {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
