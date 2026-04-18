import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileParserService {
  private readonly MAX_PDF_PAGES = 80;

  async parseFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':  return this.parsePdf(file);
      case 'docx': return this.parseDocx(file);
      case 'doc':  return this.parseDoc(file);
      case 'txt':
      case 'md':
      default:
        return this.parseText(file);
    }
  }

  private parseText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string ?? '');
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Extrae texto de un .docx (ZIP con word/document.xml) sin dependencias externas.
   * Lee las entradas del ZIP manualmente y parsea el XML.
   */
  private async parseDocx(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const xml = await this.extractZipEntry(new Uint8Array(buffer), 'word/document.xml');
      if (!xml) throw new Error('No se encontró word/document.xml');
      return this.extractTextFromWordXml(xml);
    } catch (e) {
      console.warn('parseDocx falló, intentando como texto plano:', e);
      return this.parseText(file);
    }
  }

  /**
   * .doc (formato binario antiguo) — no hay forma nativa de parsearlo bien.
   * Extraemos strings legibles del binario como fallback.
   */
  private async parseDoc(file: File): Promise<string> {
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Extraer secuencias de caracteres ASCII/Latin imprimibles de longitud > 4
      const text = this.extractReadableStrings(bytes);
      if (text.trim().length > 50) return text;
    } catch { /* fallthrough */ }
    return this.parseText(file);
  }

  /**
   * Parsea el ZIP byte a byte para encontrar y extraer una entrada específica.
   * Soporta entradas sin compresión (method=0) y deflate (method=8).
   */
  private async extractZipEntry(data: Uint8Array, targetName: string): Promise<string | null> {
    let offset = 0;
    const view = new DataView(data.buffer);

    while (offset + 30 < data.length) {
      const sig = view.getUint32(offset, true);
      if (sig !== 0x04034b50) break; // Local file header signature

      const method      = view.getUint16(offset + 8,  true);
      const compSize    = view.getUint32(offset + 18, true);
      const nameLen     = view.getUint16(offset + 26, true);
      const extraLen    = view.getUint16(offset + 28, true);

      const nameBytes   = data.slice(offset + 30, offset + 30 + nameLen);
      const entryName   = new TextDecoder('utf-8').decode(nameBytes);
      const dataOffset  = offset + 30 + nameLen + extraLen;
      const compressed  = data.slice(dataOffset, dataOffset + compSize);

      if (entryName === targetName) {
        if (method === 0) {
          // Sin compresión
          return new TextDecoder('utf-8').decode(compressed);
        } else if (method === 8) {
          // Deflate — usar DecompressionStream si está disponible
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
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
            const out = new Uint8Array(total);
            let pos = 0;
            for (const c of chunks) { out.set(c, pos); pos += c.length; }
            return new TextDecoder('utf-8').decode(out);
          }
        }
      }

      offset = dataOffset + compSize;
    }
    return null;
  }

  /** Extrae texto plano del XML de Word eliminando tags y decodificando entidades */
  private extractTextFromWordXml(xml: string): string {
    // Extraer contenido de <w:t> (texto real) y <w:br> (saltos)
    const paragraphs: string[] = [];
    const paraRegex = /<w:p[ >][\s\S]*?<\/w:p>/g;
    let paraMatch: RegExpExecArray | null;

    while ((paraMatch = paraRegex.exec(xml)) !== null) {
      const paraXml = paraMatch[0];
      // Extraer todos los <w:t> dentro del párrafo
      const textParts: string[] = [];
      const tRegex = /<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g;
      let tMatch: RegExpExecArray | null;
      while ((tMatch = tRegex.exec(paraXml)) !== null) {
        textParts.push(tMatch[1]);
      }
      const line = textParts.join('').trim();
      if (line) paragraphs.push(line);
    }

    if (paragraphs.length === 0) {
      // Fallback: strip all XML tags
      return xml
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x[0-9A-Fa-f]+;/g, '')
        .replace(/\s{2,}/g, '\n')
        .trim();
    }

    return paragraphs
      .join('\n')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .trim();
  }

  /** Extrae strings legibles de un buffer binario (fallback para .doc) */
  private extractReadableStrings(bytes: Uint8Array, minLen = 5): string {
    const parts: string[] = [];
    let current = '';
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 32 && b < 127) {
        current += String.fromCharCode(b);
      } else {
        if (current.length >= minLen) parts.push(current);
        current = '';
      }
    }
    if (current.length >= minLen) parts.push(current);
    return parts.join('\n');
  }

  private async parsePdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();

    try {
      const pdfjsLib = await import('pdfjs-dist');

      // pdfjs v5+ requiere workerSrc explícito — apuntamos al worker copiado en assets
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.min.mjs';
      }

      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
        disableFontFace: true,
      });

      const pdf = await loadingTask.promise;
      const textParts: string[] = [];

      const maxPages = Math.min(pdf.numPages, this.MAX_PDF_PAGES);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter((s: string) => s.trim())
          .join(' ');
        if (pageText.trim()) textParts.push(pageText);
        // Ceder el hilo para mantener la UI responsiva.
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const truncated = pdf.numPages > this.MAX_PDF_PAGES
        ? `\n\n[... PDF truncado: ${pdf.numPages - this.MAX_PDF_PAGES} páginas omitidas ...]`
        : '';
      const result = textParts.join('\n\n') + truncated;
      if (!result.trim()) throw new Error('PDF sin texto extraíble (puede ser imagen escaneada)');
      return result;

    } catch (e: any) {
      console.warn('pdfjs falló, usando fallback de strings:', e?.message);
      const bytes = new Uint8Array(arrayBuffer);
      const fallback = this.extractReadableStrings(bytes, 4);
      if (fallback.trim().length > 50) return fallback;
      throw new Error(`No se pudo leer el PDF: ${e?.message ?? 'error desconocido'}`);
    }
  }
}
