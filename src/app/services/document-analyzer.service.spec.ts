import { TestBed } from '@angular/core/testing';
import { DocumentAnalyzerService } from './document-analyzer.service';

describe('DocumentAnalyzerService', () => {
  let service: DocumentAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentAnalyzerService);
  });

  it('detecta tipo ecommerce y tecnologías básicas', () => {
    const docs = [
      'Proyecto: Tienda online con carrito y checkout.',
      'Usará React, Node.js, PostgreSQL y Stripe para pagos.'
    ];
    const info = service.analyzeDocuments(docs);
    expect(info.type).toBe('ecommerce');
    expect(info.technologies).toContain('React');
    expect(info.technologies).toContain('PostgreSQL');
  });

  it('detecta idioma inglés cuando predomina texto en inglés', () => {
    const lang = service.detectLanguage('The system should allow users to login and manage requirements');
    expect(lang).toBe('en');
  });
});
