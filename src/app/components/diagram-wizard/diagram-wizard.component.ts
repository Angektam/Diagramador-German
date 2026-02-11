import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';
import { DiagramShape } from '../../models/diagram.model';

interface WizardStep {
  id: string;
  question: string;
  type: 'choice' | 'text' | 'number' | 'multi-choice';
  options?: string[];
  placeholder?: string;
}

interface WizardAnswer {
  stepId: string;
  value: any;
}

@Component({
  selector: 'app-diagram-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="wizard-container">
        <div class="wizard-header">
          <h3>🧙‍♂️ Asistente Guiado</h3>
          <button class="close-btn" (click)="close()">×</button>
        </div>
        
        <div class="wizard-body">
            @if (currentStep() === 0) {
              <!-- Pantalla de bienvenida -->
              <div class="wizard-welcome">
                <div class="wizard-icon">🎨</div>
                <h3>¡Crea tu diagrama fácilmente!</h3>
                <p>Te haré algunas preguntas para generar automáticamente tu diagrama.</p>
                
                <div class="diagram-types">
                  <button class="diagram-type-btn" (click)="selectDiagramType('flowchart')">
                    <span class="type-icon">📊</span>
                    <span class="type-name">Diagrama de Flujo</span>
                    <span class="type-desc">Procesos y decisiones</span>
                  </button>
                  
                  <button class="diagram-type-btn" (click)="selectDiagramType('database')">
                    <span class="type-icon">🗄️</span>
                    <span class="type-name">Base de Datos</span>
                    <span class="type-desc">Tablas y relaciones</span>
                  </button>
                  
                  <button class="diagram-type-btn" (click)="selectDiagramType('process')">
                    <span class="type-icon">⚙️</span>
                    <span class="type-name">Proceso de Negocio</span>
                    <span class="type-desc">Flujo de trabajo</span>
                  </button>
                  
                  <button class="diagram-type-btn" (click)="selectDiagramType('system')">
                    <span class="type-icon">🖥️</span>
                    <span class="type-name">Arquitectura de Sistema</span>
                    <span class="type-desc">Componentes y servicios</span>
                  </button>
                </div>
              </div>
            } @else if (currentStep() > 0 && currentStep() <= steps().length) {
              <!-- Preguntas del wizard -->
              <div class="wizard-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="getProgress()"></div>
                </div>
                <span class="progress-text">Paso {{ currentStep() }} de {{ steps().length }}</span>
              </div>
              
              <div class="wizard-question">
                <h3>{{ getCurrentQuestion().question }}</h3>
                
                @switch (getCurrentQuestion().type) {
                  @case ('choice') {
                    <div class="choice-options">
                      @for (option of getCurrentQuestion().options; track option) {
                        <button class="choice-btn" 
                                [class.selected]="currentAnswer() === option"
                                (click)="selectAnswer(option)">
                          {{ option }}
                        </button>
                      }
                    </div>
                  }
                  @case ('multi-choice') {
                    <div class="multi-choice-options">
                      @for (option of getCurrentQuestion().options; track option) {
                        <label class="checkbox-option">
                          <input type="checkbox" 
                                 [checked]="isOptionSelected(option)"
                                 (change)="toggleMultiOption(option)">
                          <span>{{ option }}</span>
                        </label>
                      }
                    </div>
                  }
                  @case ('text') {
                    <input type="text" 
                           class="wizard-input" 
                           [placeholder]="getCurrentQuestion().placeholder || 'Escribe tu respuesta...'"
                           [(ngModel)]="currentAnswer"
                           (keyup.enter)="nextStep()">
                  }
                  @case ('number') {
                    <input type="number" 
                           class="wizard-input" 
                           [placeholder]="getCurrentQuestion().placeholder || 'Ingresa un número...'"
                           [(ngModel)]="currentAnswer"
                           (keyup.enter)="nextStep()"
                           min="1"
                           max="20">
                  }
                }
              </div>
              
              <div class="wizard-actions">
                <button class="btn-secondary" (click)="previousStep()" [disabled]="currentStep() === 1">
                  ← Anterior
                </button>
                <button class="btn-primary" (click)="nextStep()">
                  {{ currentStep() === steps().length ? '✨ Generar Diagrama' : 'Siguiente →' }}
                </button>
              </div>
            } @else {
              <!-- Pantalla de generación -->
              <div class="wizard-generating">
                <div class="spinner"></div>
                <h3>Generando tu diagrama...</h3>
                <p>Estamos creando las formas y conexiones basadas en tus respuestas.</p>
              </div>
            }
          </div>
        </div>
    } @else {
      <div class="wizard-placeholder">
        <div class="placeholder-icon">🎨</div>
        <p>Haz clic en el tab "Wizard" para comenzar</p>
      </div>
    }
  `,
  styles: [`
    .wizard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: white;
    }

    .wizard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e9ecef;
    }

    .wizard-header h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 24px;
      color: #999;
      cursor: pointer;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: #f1f3f5;
      color: #333;
    }

    .wizard-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .wizard-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #999;
      padding: 40px;
      text-align: center;
    }

    .placeholder-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .wizard-modal {
      min-width: 600px;
      max-width: 700px;
    }
    
    .wizard-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .wizard-welcome {
      text-align: center;
      padding: 16px;
    }
    
    .wizard-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    .wizard-welcome h3 {
      font-size: 18px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }
    
    .wizard-welcome p {
      font-size: 13px;
      color: var(--text-secondary);
      margin-bottom: 20px;
    }
    
    .diagram-types {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    
    .diagram-type-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 16px 12px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 2px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition);
      text-align: center;
    }
    
    .diagram-type-btn:hover {
      border-color: #667eea;
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
    }
    
    .type-icon {
      font-size: 28px;
    }
    
    .type-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    
    .type-desc {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .wizard-progress {
      margin-bottom: 20px;
    }
    
    .progress-bar {
      height: 4px;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 6px;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }
    
    .progress-text {
      font-size: 11px;
      color: var(--text-secondary);
    }
    
    .wizard-question h3 {
      font-size: 15px;
      margin-bottom: 16px;
      color: var(--text-primary);
      line-height: 1.4;
    }
    
    .choice-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .choice-btn {
      padding: 12px 16px;
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 13px;
      cursor: pointer;
      transition: all var(--transition);
      text-align: left;
    }
    
    .choice-btn:hover {
      border-color: #667eea;
      background: #eef2ff;
      transform: translateX(4px);
    }
    
    .choice-btn.selected {
      border-color: #667eea;
      background: #eef2ff;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .multi-choice-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .checkbox-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: #f8f9fa;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all var(--transition);
    }
    
    .checkbox-option:hover {
      border-color: #667eea;
      background: #eef2ff;
    }
    
    .checkbox-option input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
    
    .checkbox-option span {
      font-size: 13px;
      color: var(--text-primary);
    }
    
    .wizard-input {
      width: 100%;
      padding: 12px 14px;
      background: white;
      border: 2px solid #dee2e6;
      border-radius: 8px;
      color: var(--text-primary);
      font-size: 13px;
      font-family: inherit;
      transition: all var(--transition);
    }
    
    .wizard-input:focus {
      outline: none;
      border-color: #667eea;
      background: #fafbfc;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .wizard-actions {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-top: 20px;
    }
    
    .wizard-generating {
      text-align: center;
      padding: 30px 16px;
    }
    
    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 20px;
      border: 3px solid rgba(102, 126, 234, 0.2);
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .wizard-generating h3 {
      font-size: 16px;
      margin-bottom: 8px;
      color: var(--text-primary);
    }
    
    .wizard-generating p {
      font-size: 13px;
      color: var(--text-secondary);
    }
  `]
})
export class DiagramWizardComponent {
  private diagram = inject(DiagramService);
  private notifications = inject(NotificationService);
  
  isOpen = signal(false);
  currentStep = signal(0);
  diagramType = signal('');
  steps = signal<WizardStep[]>([]);
  answers = signal<WizardAnswer[]>([]);
  currentAnswer = signal<any>('');
  
  open() {
    this.isOpen.set(true);
    this.currentStep.set(0);
    this.answers.set([]);
    this.currentAnswer.set('');
  }
  
  close() {
    this.isOpen.set(false);
    this.currentStep.set(0);
    this.diagramType.set('');
    this.steps.set([]);
    this.answers.set([]);
  }
  
  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
  
  selectDiagramType(type: string) {
    this.diagramType.set(type);
    this.steps.set(this.getStepsForType(type));
    this.currentStep.set(1);
  }
  
  getStepsForType(type: string): WizardStep[] {
    switch (type) {
      case 'flowchart':
        return [
          {
            id: 'process-name',
            question: '¿Cómo se llama el proceso que quieres diagramar?',
            type: 'text',
            placeholder: 'Ej: Proceso de compra online'
          },
          {
            id: 'num-steps',
            question: '¿Cuántos pasos principales tiene tu proceso?',
            type: 'number',
            placeholder: 'Número de pasos (2-10)'
          },
          {
            id: 'step-names',
            question: 'Escribe los nombres de los pasos separados por comas',
            type: 'text',
            placeholder: 'Ej: Seleccionar producto, Agregar al carrito, Pagar, Confirmar'
          },
          {
            id: 'has-decisions',
            question: '¿Tu proceso incluye decisiones o condiciones?',
            type: 'choice',
            options: ['Sí, tiene decisiones', 'No, es lineal']
          },
          {
            id: 'layout',
            question: '¿Cómo prefieres organizar el diagrama?',
            type: 'choice',
            options: ['Vertical (de arriba a abajo)', 'Horizontal (de izquierda a derecha)']
          }
        ];
      
      case 'database':
        return [
          {
            id: 'db-name',
            question: '¿Cómo se llama tu base de datos o sistema?',
            type: 'text',
            placeholder: 'Ej: Sistema de ventas'
          },
          {
            id: 'num-tables',
            question: '¿Cuántas tablas principales necesitas?',
            type: 'number',
            placeholder: 'Número de tablas (2-10)'
          },
          {
            id: 'table-names',
            question: 'Escribe los nombres de las tablas separados por comas',
            type: 'text',
            placeholder: 'Ej: Usuarios, Productos, Pedidos, Categorias'
          },
          {
            id: 'include-views',
            question: '¿Necesitas incluir vistas o procedimientos?',
            type: 'choice',
            options: ['Sí, incluir vistas', 'Sí, incluir procedimientos', 'Ambos', 'No, solo tablas']
          }
        ];
      
      case 'process':
        return [
          {
            id: 'process-name',
            question: '¿Qué proceso de negocio vas a modelar?',
            type: 'text',
            placeholder: 'Ej: Proceso de aprobación de solicitudes'
          },
          {
            id: 'num-actors',
            question: '¿Cuántos actores o roles participan?',
            type: 'number',
            placeholder: 'Número de actores (2-8)'
          },
          {
            id: 'actor-names',
            question: 'Escribe los nombres de los actores separados por comas',
            type: 'text',
            placeholder: 'Ej: Cliente, Vendedor, Gerente, Almacén'
          },
          {
            id: 'complexity',
            question: '¿Qué tan complejo es el proceso?',
            type: 'choice',
            options: ['Simple (pocos pasos)', 'Moderado (varios pasos)', 'Complejo (muchos pasos y decisiones)']
          }
        ];
      
      case 'system':
        return [
          {
            id: 'system-name',
            question: '¿Cómo se llama tu sistema o aplicación?',
            type: 'text',
            placeholder: 'Ej: Plataforma de e-commerce'
          },
          {
            id: 'num-components',
            question: '¿Cuántos componentes principales tiene?',
            type: 'number',
            placeholder: 'Número de componentes (2-10)'
          },
          {
            id: 'component-names',
            question: 'Escribe los nombres de los componentes separados por comas',
            type: 'text',
            placeholder: 'Ej: Frontend, API, Base de datos, Cache, Cola de mensajes'
          },
          {
            id: 'architecture-type',
            question: '¿Qué tipo de arquitectura usas?',
            type: 'choice',
            options: ['Monolítica', 'Microservicios', 'Cliente-Servidor', 'En capas']
          }
        ];
      
      default:
        return [];
    }
  }
  
  getCurrentQuestion(): WizardStep {
    return this.steps()[this.currentStep() - 1];
  }
  
  getProgress(): number {
    return (this.currentStep() / this.steps().length) * 100;
  }
  
  selectAnswer(value: any) {
    this.currentAnswer.set(value);
  }
  
  isOptionSelected(option: string): boolean {
    const current = this.currentAnswer();
    if (Array.isArray(current)) {
      return current.includes(option);
    }
    return false;
  }
  
  toggleMultiOption(option: string) {
    let current = this.currentAnswer();
    if (!Array.isArray(current)) {
      current = [];
    }
    
    if (current.includes(option)) {
      this.currentAnswer.set(current.filter((o: string) => o !== option));
    } else {
      this.currentAnswer.set([...current, option]);
    }
  }
  
  nextStep() {
    const currentQ = this.getCurrentQuestion();
    const answer = this.currentAnswer();
    
    // Validar respuesta
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      this.notifications.error('Por favor responde la pregunta antes de continuar');
      return;
    }
    
    // Guardar respuesta
    this.answers.update(ans => [...ans, { stepId: currentQ.id, value: answer }]);
    
    // Siguiente paso o generar
    if (this.currentStep() === this.steps().length) {
      this.generateDiagram();
    } else {
      this.currentStep.update(s => s + 1);
      this.currentAnswer.set('');
    }
  }
  
  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
      // Restaurar respuesta anterior
      const prevAnswer = this.answers()[this.currentStep() - 1];
      if (prevAnswer) {
        this.currentAnswer.set(prevAnswer.value);
      }
      // Remover última respuesta
      this.answers.update(ans => ans.slice(0, -1));
    }
  }
  
  generateDiagram() {
    this.currentStep.set(this.steps().length + 1);
    
    setTimeout(() => {
      const type = this.diagramType();
      const answers = this.answers();
      
      switch (type) {
        case 'flowchart':
          this.generateFlowchart(answers);
          break;
        case 'database':
          this.generateDatabase(answers);
          break;
        case 'process':
          this.generateProcess(answers);
          break;
        case 'system':
          this.generateSystem(answers);
          break;
      }
      
      this.notifications.success('¡Diagrama generado exitosamente!');
      this.close();
    }, 2000);
  }
  
  private generateFlowchart(answers: WizardAnswer[]) {
    const processName = this.getAnswer(answers, 'process-name') as string;
    const stepNamesStr = this.getAnswer(answers, 'step-names') as string;
    const stepNames = stepNamesStr.split(',').map(s => s.trim()).filter(s => s);
    const hasDecisions = this.getAnswer(answers, 'has-decisions') === 'Sí, tiene decisiones';
    const isVertical = this.getAnswer(answers, 'layout')?.includes('Vertical');
    
    let x = 400;
    let y = 200;
    const spacing = isVertical ? 150 : 250;
    const shapes: DiagramShape[] = [];
    
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
    shapes.push(startShape);
    this.diagram.addShape(startShape);
    
    let prevId = startShape.id;
    
    // Pasos con nombres personalizados
    stepNames.forEach((stepName, i) => {
      if (isVertical) {
        y += spacing;
      } else {
        x += spacing;
      }
      
      const isDecision = hasDecisions && i === Math.floor(stepNames.length / 2);
      
      const shape: DiagramShape = {
        id: `shape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: isDecision ? 'diamond' : 'rect',
        x, y,
        width: isDecision ? 160 : 140,
        height: isDecision ? 90 : 70,
        fill: isDecision ? '#fef3c7' : '#dbeafe',
        stroke: isDecision ? '#f59e0b' : '#3b82f6',
        text: stepName
      };
      shapes.push(shape);
      this.diagram.addShape(shape);
      this.diagram.addConnection(prevId, shape.id);
      prevId = shape.id;
      
      // Si es decisión, agregar rama alternativa
      if (isDecision) {
        if (isVertical) {
          const altShape: DiagramShape = {
            id: `shape-${Date.now()}-alt-${i}`,
            type: 'rect',
            x: x + 200,
            y: y,
            width: 120,
            height: 60,
            fill: '#fee2e2',
            stroke: '#dc2626',
            text: 'Alternativa'
          };
          this.diagram.addShape(altShape);
          this.diagram.addConnection(shape.id, altShape.id);
        } else {
          const altShape: DiagramShape = {
            id: `shape-${Date.now()}-alt-${i}`,
            type: 'rect',
            x: x,
            y: y + 150,
            width: 120,
            height: 60,
            fill: '#fee2e2',
            stroke: '#dc2626',
            text: 'Alternativa'
          };
          this.diagram.addShape(altShape);
          this.diagram.addConnection(shape.id, altShape.id);
        }
      }
    });
    
    // Fin
    if (isVertical) {
      y += spacing;
    } else {
      x += spacing;
    }
    
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
    this.diagram.addConnection(prevId, endShape.id);
  }
  
  private generateDatabase(answers: WizardAnswer[]) {
    const dbName = this.getAnswer(answers, 'db-name') as string;
    const tableNamesStr = this.getAnswer(answers, 'table-names') as string;
    const tableNames = tableNamesStr.split(',').map(s => s.trim()).filter(s => s);
    const includeViews = this.getAnswer(answers, 'include-views') as string;
    
    let x = 300;
    let y = 200;
    const spacing = 250;
    const shapes: DiagramShape[] = [];
    
    // Generar tablas con nombres personalizados
    tableNames.forEach((tableName, i) => {
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
          name: tableName,
          columns: [
            { name: 'id', type: 'INT', pk: true },
            { name: 'nombre', type: 'VARCHAR' },
            { name: 'fecha_creacion', type: 'TIMESTAMP' }
          ]
        }
      };
      
      shapes.push(shape);
      this.diagram.addShape(shape);
      
      // Conectar con la tabla anterior (relación)
      if (i > 0) {
        this.diagram.addConnection(shapes[i - 1].id, shape.id);
      }
    });
    
    // Agregar vistas o procedimientos si se solicitó
    if (includeViews.includes('vistas') || includeViews.includes('Ambos')) {
      const viewShape: DiagramShape = {
        id: `shape-${Date.now()}-view`,
        type: 'view',
        x: x + (tableNames.length % 3) * spacing,
        y: y + Math.floor(tableNames.length / 3) * 220,
        width: 200,
        height: 120,
        fill: '#ffffff',
        stroke: '#0d9488',
        tableData: {
          name: 'Vista_' + dbName,
          columns: [
            { name: 'campo1', type: 'VARCHAR' },
            { name: 'campo2', type: 'INT' }
          ]
        }
      };
      this.diagram.addShape(viewShape);
      if (shapes.length > 0) {
        this.diagram.addConnection(shapes[0].id, viewShape.id);
      }
    }
    
    if (includeViews.includes('procedimientos') || includeViews.includes('Ambos')) {
      const procShape: DiagramShape = {
        id: `shape-${Date.now()}-proc`,
        type: 'procedure',
        x: x + ((tableNames.length + 1) % 3) * spacing,
        y: y + Math.floor((tableNames.length + 1) / 3) * 220,
        width: 180,
        height: 100,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        text: 'sp_' + dbName.toLowerCase().replace(/\s/g, '_')
      };
      this.diagram.addShape(procShape);
      if (shapes.length > 0) {
        this.diagram.addConnection(shapes[shapes.length - 1].id, procShape.id);
      }
    }
  }
  
  private generateProcess(answers: WizardAnswer[]) {
    const processName = this.getAnswer(answers, 'process-name') as string;
    const actorNamesStr = this.getAnswer(answers, 'actor-names') as string;
    const actorNames = actorNamesStr.split(',').map(s => s.trim()).filter(s => s);
    const complexity = this.getAnswer(answers, 'complexity') as string;
    
    let x = 300;
    let y = 200;
    const spacingX = 220;
    const spacingY = 150;
    const shapes: DiagramShape[] = [];
    
    // Crear actores con sus actividades
    actorNames.forEach((actorName, i) => {
      // Actor
      const actorShape: DiagramShape = {
        id: `shape-${Date.now()}-actor-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'rounded',
        x: x + i * spacingX,
        y: y,
        width: 160,
        height: 80,
        fill: '#e0e7ff',
        stroke: '#6366f1',
        text: actorName
      };
      
      shapes.push(actorShape);
      this.diagram.addShape(actorShape);
      
      // Actividad del actor
      const activityShape: DiagramShape = {
        id: `shape-${Date.now()}-activity-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'rect',
        x: x + i * spacingX,
        y: y + spacingY,
        width: 160,
        height: 70,
        fill: '#dbeafe',
        stroke: '#3b82f6',
        text: `Actividad de\n${actorName}`
      };
      
      this.diagram.addShape(activityShape);
      this.diagram.addConnection(actorShape.id, activityShape.id);
      
      // Conectar con el siguiente actor (flujo del proceso)
      if (i > 0) {
        this.diagram.addConnection(shapes[shapes.length - 2].id, actorShape.id);
      }
      
      shapes.push(activityShape);
    });
    
    // Si es complejo, agregar decisión
    if (complexity.includes('Complejo')) {
      const decisionShape: DiagramShape = {
        id: `shape-${Date.now()}-decision`,
        type: 'diamond',
        x: x + Math.floor(actorNames.length / 2) * spacingX,
        y: y + spacingY * 2,
        width: 160,
        height: 90,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        text: '¿Aprobado?'
      };
      
      this.diagram.addShape(decisionShape);
      if (shapes.length > 0) {
        this.diagram.addConnection(shapes[shapes.length - 1].id, decisionShape.id);
      }
    }
  }
  
  private generateSystem(answers: WizardAnswer[]) {
    const systemName = this.getAnswer(answers, 'system-name') as string;
    const componentNamesStr = this.getAnswer(answers, 'component-names') as string;
    const componentNames = componentNamesStr.split(',').map(s => s.trim()).filter(s => s);
    const architecture = this.getAnswer(answers, 'architecture-type') as string;
    
    let x = 300;
    let y = 200;
    const spacing = 240;
    const shapes: DiagramShape[] = [];
    
    // Generar componentes con nombres personalizados
    componentNames.forEach((componentName, i) => {
      // Determinar tipo de forma según el nombre
      let shapeType: any = 'rect';
      let fill = '#f0f9ff';
      let stroke = '#0ea5e9';
      
      if (componentName.toLowerCase().includes('base') || componentName.toLowerCase().includes('db')) {
        shapeType = 'database';
        fill = '#eef2ff';
        stroke = '#6366f1';
      } else if (componentName.toLowerCase().includes('api') || componentName.toLowerCase().includes('servicio')) {
        shapeType = 'hexagon';
        fill = '#f0fdf4';
        stroke = '#16a34a';
      } else if (componentName.toLowerCase().includes('front') || componentName.toLowerCase().includes('ui')) {
        shapeType = 'rounded';
        fill = '#fef3c7';
        stroke = '#f59e0b';
      }
      
      const shape: DiagramShape = {
        id: `shape-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        type: shapeType,
        x: x + (i % 3) * spacing,
        y: y + Math.floor(i / 3) * 180,
        width: 200,
        height: 100,
        fill: fill,
        stroke: stroke,
        text: componentName
      };
      
      shapes.push(shape);
      this.diagram.addShape(shape);
      
      // Conectar componentes según arquitectura
      if (architecture.includes('Microservicios')) {
        // En microservicios, conectar todos al primero (API Gateway)
        if (i > 0 && shapes.length > 0) {
          this.diagram.addConnection(shapes[0].id, shape.id);
        }
      } else if (architecture.includes('capas')) {
        // En capas, conectar secuencialmente
        if (i > 0) {
          this.diagram.addConnection(shapes[i - 1].id, shape.id);
        }
      } else {
        // Cliente-Servidor o Monolítica: conectar en cadena
        if (i > 0) {
          this.diagram.addConnection(shapes[i - 1].id, shape.id);
        }
      }
    });
  }
  
  private getAnswer(answers: WizardAnswer[], stepId: string): any {
    return answers.find(a => a.stepId === stepId)?.value;
  }
}
