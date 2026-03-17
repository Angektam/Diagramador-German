import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileParserService {

  async parseFile(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return this.parsePdf(file);
      case 'txt':
      case 'md':
      case 'doc':
      case 'docx':
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

  private async parsePdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfjsLib = await import('pdfjs-dist');

    // Deshabilitar el worker externo — pdfjs corre en el hilo principal (fake worker).
    // Esto evita todos los problemas de CORS/MIME con el worker .mjs en dev y prod.
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n\n');
  }
}
