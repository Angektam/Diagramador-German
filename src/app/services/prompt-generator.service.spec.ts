import { TestBed } from '@angular/core/testing';
import { PromptGeneratorService } from './prompt-generator.service';
import { ProjectInfo } from '../models/project-info.interface';

describe('PromptGeneratorService', () => {
  let service: PromptGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptGeneratorService);
  });

  it('genera prompt completo con metadatos', () => {
    const info: ProjectInfo = {
      name: 'Mi API',
      description: 'API de pruebas',
      type: 'api',
      technologies: ['Node.js', 'TypeScript'],
      requirements: [],
      features: [],
      architecture: { pattern: 'Layered', layers: [], components: [], folderStructure: 'src/' }
    };

    const result = service.generatePrompt(info, ['Documento funcional'], 'es');
    expect(result.content).toContain('DOCUMENTACIÓN DEL PROYECTO');
    expect(result.metadata.documentCount).toBe(1);
    expect(result.metadata.wordCount).toBeGreaterThan(10);
  });
});
