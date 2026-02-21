import { Injectable, inject } from '@angular/core';
import { DiagramService } from './diagram.service';
import { NotificationService } from './notification.service';
import { DiagramShape } from '../models/diagram.model';

export interface ProcessedDocument {
  type: 'interview' | 'process' | 'requirements' | 'other';
  entities: string[];
  relationships: Array<{ from: string; to: string; type: string }>;
  processes: Array<{ name: string; steps: string[] }>;
  rawText: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentProcessorService {
  private diagram = inject(DiagramService);
  private notifications = inject(NotificationService);

  processDocument(content: string, filename: string): ProcessedDocument {
    const type = this.detectDocumentType(content, filename);
    
    const processed: ProcessedDocument = {
      type,
      entities: this.extractEntities(content),
      relationships: this.extractRelationships(content),
      processes: this.extractProcesses(content),
      rawText: content
    };

    return processed;
  }

  private detectDocumentType(content: string, filename: string): ProcessedDocument['type'] {
    const lower = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.includes('entrevista') || lower.includes('entrevista') || 
        lower.includes('pregunta:') || lower.includes('respuesta:')) {
      return 'interview';
    }

    if (lowerFilename.includes('proceso') || lower.includes('proceso de') || 
        lower.includes('procedimiento') || lower.includes('flujo de trabajo')) {
      return 'process';
    }

    if (lowerFilename.includes('requisito') || lower.includes('requisitos') || 
        lower.includes('requerimiento')) {
      return 'requirements';
    }

    return 'other';
  }

  private extractEntities(content: string): string[] {
    const entities = new Set<string>();
    
    // Patrones para detectar entidades (sustantivos importantes)
    const patterns = [
      /(?:tabla|entidad|clase|modelo)\s+(?:de\s+)?([A-ZÁÉÍÓÚ][a-záéíóúñ]+)/gi,
      /(?:el|la|los|las)\s+([A-ZÁÉÍÓÚ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚ][a-záéíóúñ]+)?)/g,
      /\b([A-ZÁÉÍÓÚ][a-záéíóúñ]+)\s+(?:tiene|contiene|incluye|gestiona)/gi,
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const entity = match[1].trim();
        if (entity.length > 3 && !this.isCommonWord(entity)) {
          entities.add(entity);
        }
      }
    });

    return Array.from(entities).slice(0, 15); // Limitar a 15 entidades
  }

  private extractRelationships(content: string): Array<{ from: string; to: string; type: string }> {
    const relationships: Array<{ from: string; to: string; type: string }> = [];
    
    // Patrones para detectar relaciones
    const patterns = [
      { regex: /(\w+)\s+(?:tiene|posee|contiene)\s+(?:uno|varios|muchos|múltiples)?\s*(\w+)/gi, type: 'has' },
      { regex: /(\w+)\s+(?:pertenece a|es parte de)\s+(\w+)/gi, type: 'belongs_to' },
      { regex: /(\w+)\s+(?:se relaciona con|está vinculado a)\s+(\w+)/gi, type: 'related_to' },
      { regex: /(\w+)\s+(?:depende de|requiere)\s+(\w+)/gi, type: 'depends_on' },
    ];

    patterns.forEach(({ regex, type }) => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        relationships.push({
          from: match[1],
          to: match[2],
          type
        });
      }
    });

    return relationships.slice(0, 20); // Limitar a 20 relaciones
  }

  private extractProcesses(content: string): Array<{ name: string; steps: string[] }> {
    const processes: Array<{ name: string; steps: string[] }> = [];
    
    // Buscar procesos con pasos numerados
    const processPattern = /(?:proceso|procedimiento|flujo)\s+(?:de\s+)?([^:\n]+):\s*((?:\d+\.|[-•])\s*[^\n]+(?:\n(?:\d+\.|[-•])\s*[^\n]+)*)/gi;
    let match;
    
    while ((match = processPattern.exec(content)) !== null) {
      const name = match[1].trim();
      const stepsText = match[2];
      const steps = stepsText
        .split(/\n/)
        .map(s => s.replace(/^\d+\.|^[-•]\s*/, '').trim())
        .filter(s => s.length > 0);
      
      if (steps.length > 0) {
        processes.push({ name, steps });
      }
    }

    return processes;
  }

  private isCommonWord(word: string): boolean {
    const common = ['Este', 'Esta', 'Estos', 'Estas', 'Para', 'Desde', 'Hasta', 'Cuando', 
                    'Donde', 'Como', 'Porque', 'Aunque', 'Mientras', 'Durante'];
    return common.includes(word);
  }

  generateDiagramFromDocument(doc: ProcessedDocument): void {
    this.diagram.newDiagram();

    switch (doc.type) {
      case 'interview':
        this.generateFromInterview(doc);
        break;
      case 'process':
        this.generateFromProcess(doc);
        break;
      case 'requirements':
        this.generateFromRequirements(doc);
        break;
      default:
        this.generateGenericDiagram(doc);
    }

    this.notifications.success(`Diagrama generado desde ${doc.type}`);
  }

  private generateFromInterview(doc: ProcessedDocument): void {
    // Generar diagrama de entidad-relación desde entrevista
    const entities = doc.entities.slice(0, 10);
    let x = 300;
    let y = 200;
    const spacing = 250;
    const createdShapes = new Map<string, DiagramShape>();

    entities.forEach((entity, i) => {
      const shape: DiagramShape = {
        id: `shape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'table',
        x: x + (i % 3) * spacing,
        y: y + Math.floor(i / 3) * 220,
        width: 200,
        height: 140,
        fill: '#ffffff',
        stroke: '#6366f1',
        tableData: {
          name: entity,
          columns: [
            { name: 'id', type: 'INT', pk: true },
            { name: 'nombre', type: 'VARCHAR(100)' },
            { name: 'fecha_creacion', type: 'TIMESTAMP' }
          ]
        }
      };

      this.diagram.addShape(shape);
      createdShapes.set(entity, shape);
    });

    // Crear conexiones basadas en relaciones detectadas
    doc.relationships.forEach(rel => {
      const fromShape = createdShapes.get(rel.from);
      const toShape = createdShapes.get(rel.to);
      
      if (fromShape && toShape) {
        this.diagram.addConnection(fromShape.id, toShape.id);
      }
    });
  }

  private generateFromProcess(doc: ProcessedDocument): void {
    // Generar diagrama de flujo desde proceso
    let x = 400;
    let y = 200;
    const spacing = 150;
    let prevId: string | null = null;

    // Inicio
    const startShape: DiagramShape = {
      id: `shape-${Date.now()}-start`,
      type: 'ellipse',
      x, y,
      width: 140,
      height: 70,
      fill: '#dcfce7',
      stroke: '#16a34a',
      text: 'Inicio'
    };
    this.diagram.addShape(startShape);
    prevId = startShape.id;

    // Procesar cada proceso detectado
    doc.processes.forEach(process => {
      process.steps.forEach((step, i) => {
        y += spacing;
        
        const shape: DiagramShape = {
          id: `shape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'rect',
          x, y,
          width: 180,
          height: 80,
          fill: '#dbeafe',
          stroke: '#3b82f6',
          text: step.substring(0, 50) // Limitar texto
        };

        this.diagram.addShape(shape);
        
        if (prevId) {
          this.diagram.addConnection(prevId, shape.id);
        }
        
        prevId = shape.id;
      });
    });

    // Fin
    y += spacing;
    const endShape: DiagramShape = {
      id: `shape-${Date.now()}-end`,
      type: 'ellipse',
      x, y,
      width: 140,
      height: 70,
      fill: '#fee2e2',
      stroke: '#dc2626',
      text: 'Fin'
    };
    this.diagram.addShape(endShape);
    
    if (prevId) {
      this.diagram.addConnection(prevId, endShape.id);
    }
  }

  private generateFromRequirements(doc: ProcessedDocument): void {
    // Generar diagrama de componentes desde requisitos
    const entities = doc.entities.slice(0, 8);
    let x = 300;
    let y = 200;
    const spacing = 240;

    entities.forEach((entity, i) => {
      const shape: DiagramShape = {
        id: `shape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'rounded',
        x: x + (i % 3) * spacing,
        y: y + Math.floor(i / 3) * 180,
        width: 200,
        height: 100,
        fill: '#f0f9ff',
        stroke: '#0ea5e9',
        text: entity
      };

      this.diagram.addShape(shape);
    });
  }

  private generateGenericDiagram(doc: ProcessedDocument): void {
    // Diagrama genérico con entidades detectadas
    this.generateFromRequirements(doc);
  }
}
