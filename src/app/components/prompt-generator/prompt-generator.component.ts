import { Component, signal, inject, OnInit, OnDestroy, HostListener, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DocumentAnalyzerService, AnalysisResult } from '../../services/document-analyzer.service';
import { PromptGeneratorService } from '../../services/prompt-generator.service';
import { FileParserService } from '../../services/file-parser.service';
import { PromptHistoryService } from '../../services/prompt-history.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { TitleService } from '../../services/title.service';
import { TemplateStoreService } from '../../services/template-store.service';
import { ShareService } from '../../services/share.service';
import { ClipboardService } from '../../services/clipboard.service';
import { formatPromptJson } from '../../utils/json-formatter';
import { ProjectInfo, ProjectType } from '../../models/project-info.interface';
import { GeneratedPrompt, PromptTargetModel } from '../../models/prompt-template.interface';

type Step = 'upload' | 'analyzing' | 'analysis' | 'prompt';
type InputMode = 'file' | 'text';
type UiPromptModel = PromptTargetModel;
type TokenBudget = 800 | 1200 | 2000 | 3500;

const PROJECT_TYPES: { value: ProjectType; label: string; icon: string }[] = [
  { value: 'web-app',       label: 'Web App',       icon: '🌐' },
  { value: 'api',           label: 'API REST',       icon: '⚡' },
  { value: 'mobile-app',    label: 'Mobile',         icon: '📱' },
  { value: 'desktop-app',   label: 'Desktop',        icon: '🖥️' },
  { value: 'microservices', label: 'Microservicios', icon: '🔧' },
  { value: 'cms',           label: 'CMS',            icon: '📝' },
  { value: 'ecommerce',     label: 'E-commerce',     icon: '🛒' },
  { value: 'dashboard',     label: 'Dashboard',      icon: '📊' },
  { value: 'other',         label: 'Otro',           icon: '📦' },
];

@Component({
  selector: 'app-prompt-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="layout">

      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-logo">📄</div>
          <span class="brand-name">PromptGen</span>
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item" (click)="goToDashboard()">
            <span class="nav-icon">🗂️</span>
            <span>Mis Proyectos</span>
          </button>
          <button class="nav-item active">
            <span class="nav-icon">✨</span>
            <span>Nuevo Prompt</span>
          </button>
        </nav>
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">{{ currentUser.charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <span class="user-name">{{ currentUser }}</span>
              <span class="user-role">Usuario</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()" title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <!-- MAIN -->
      <main class="main">

        <!-- STEP: UPLOAD -->
        @if (step() === 'upload') {
          <div class="page-header">
            <h1>Nuevo Prompt</h1>
            <p>Sube la documentación de tu proyecto y obtén un prompt optimizado para generar código con IA</p>
          </div>

          <div class="input-tabs">
            <button class="input-tab" [class.active]="inputMode() === 'file'" (click)="setInputMode('file')">
              📁 Subir archivos
            </button>
            <button class="input-tab" [class.active]="inputMode() === 'text'" (click)="setInputMode('text')">
              ✏️ Pegar texto
            </button>
          </div>

          <div class="upload-card">
            @if (inputMode() === 'file') {
              <div class="upload-area"
                   [class.drag-over]="isDragOver()"
                   (dragover)="onDragOver($event)" (dragleave)="onDragLeave($event)"
                   (drop)="onDrop($event)" (click)="fileInput.click()">
                <div class="upload-icon">📁</div>
                <p class="upload-title">Arrastra tus documentos aquí</p>
                <p class="upload-sub">o haz clic para seleccionar</p>
                <p class="upload-formats">PDF · DOC · DOCX · MD · TXT</p>
                <input #fileInput type="file" multiple accept=".txt,.md,.doc,.docx,.pdf"
                       (change)="onFileSelected($event)" style="display:none">
              </div>
              @if (uploadedFiles().length > 0) {
                <div class="files-section">
                  <div class="files-header">
                    <span>{{ uploadedFiles().length }} archivo(s)</span>
                    <button class="link-btn" (click)="uploadedFiles.set([])">Limpiar</button>
                  </div>
                  <div class="files-list">
                    @for (file of uploadedFiles(); track file.name) {
                      <div class="file-chip">
                        <span>{{ getFileIcon(file.name) }}</span>
                        <span class="file-name">{{ file.name }}</span>
                        <span class="file-size">{{ formatSize(file.size) }}</span>
                        <button class="chip-remove" (click)="removeFile(file)">×</button>
                      </div>
                    }
                  </div>
                  <button class="btn-primary full" (click)="analyzeDocuments()">🔍 Analizar Documentación</button>
                </div>
              }
            }

            @if (inputMode() === 'text') {
              <div class="text-section">
                <textarea class="paste-area"
                  [value]="pastedText"
                  (input)="onTextInput($any($event.target).value)"
                  placeholder="Pega aquí la documentación de tu proyecto: requisitos, historias de usuario, descripción, entrevistas con el cliente...

Ejemplo:
Sistema de gestión de inventario para una tienda.
El sistema debe permitir registrar productos, controlar stock, generar alertas cuando el stock es bajo y generar reportes de ventas..."></textarea>
                <div class="char-progress-wrap">
                  <div class="char-progress-bar" [style.width.%]="Math.min(100, textLength() / 100)" [class.warn]="textLength() > 8000"></div>
                </div>
                <div class="text-actions">
                  <span class="char-count" [class.warn]="textLength() > 8000">
                    {{ textLength() }} / 10,000 caracteres
                    @if (textLength() > 8000) { <span> ⚠️ muy largo</span> }
                  </span>
                  <button class="btn-primary" (click)="analyzeText()" [disabled]="pastedText.trim().length < 50">🔍 Analizar Texto</button>
                </div>
              </div>
            }
          </div>
        }

        <!-- STEP: ANALYZING -->
        @if (step() === 'analyzing') {
          <div class="center-state">
            <div class="spinner-wrap">
              <div class="spinner-outer"></div>
              <div class="spinner-inner"></div>
            </div>
            <h2>Analizando documentación...</h2>
            <p>{{ analyzeStatus() }}</p>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" [style.width.%]="analyzeProgress()"></div>
            </div>
            <span class="progress-pct">{{ analyzeProgress() }}%</span>
          </div>
        }

        <!-- STEP: ANALYSIS -->
        @if (step() === 'analysis') {
          <div class="page-header">
            <h1>Análisis Completado</h1>
            <p>Revisa y ajusta la información antes de generar el prompt</p>
          </div>

          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-label">Tipo</div>
              <div class="stat-value type">{{ typeLabel(editType) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Tecnologías</div>
              <div class="stat-value">{{ projectInfo()!.technologies.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Requisitos</div>
              <div class="stat-value">{{ projectInfo()!.requirements.length }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Funcionalidades</div>
              <div class="stat-value">{{ projectInfo()!.features.length }}</div>
            </div>
          </div>

          <!-- Resumen + Confianza -->
          <div class="summary-bar">
            <div class="summary-text">💡 {{ projectInfo()!.summary }}</div>
            <div class="confidence-badge confidence-{{ projectInfo()!.confidence.level }}"
                 [title]="projectInfo()!.confidence.detail">
              {{ projectInfo()!.confidence.level === 'high' ? '🟢' : projectInfo()!.confidence.level === 'medium' ? '🟡' : '🔴' }}
              Confianza {{ projectInfo()!.confidence.level === 'high' ? 'alta' : projectInfo()!.confidence.level === 'medium' ? 'media' : 'baja' }}
              ({{ projectInfo()!.confidence.score }}/10)
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-row">
              <span class="detail-label">Nombre</span>
              <input class="inline-edit" [(ngModel)]="editName" placeholder="Nombre del proyecto" />
            </div>
            <div class="detail-row">
              <span class="detail-label">Tipo</span>
              <div class="type-selector">
                @for (t of projectTypes; track t.value) {
                  <button class="type-btn" [class.active]="editType === t.value" (click)="editType = t.value">
                    {{ t.icon }} {{ t.label }}
                  </button>
                }
              </div>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tecnologías</span>
              <div class="tech-edit-area">
                <div class="tech-tags">
                  @for (t of editTechs; track t) {
                    <span class="tech-tag removable" (click)="removeTech(t)" title="Quitar">{{ t }} ×</span>
                  }
                </div>
                <div class="tech-add-row">
                  <input class="tech-input" [(ngModel)]="newTech" placeholder="Agregar tecnología..." (keyup.enter)="addTech()" />
                  <button class="btn-add-tech" (click)="addTech()" [disabled]="!newTech.trim()">+ Agregar</button>
                </div>
              </div>
            </div>
            @if (projectInfo()!.requirements.length > 0) {
              <div class="detail-row col">
                <span class="detail-label">Requisitos detectados</span>
                <div class="req-list">
                  @for (r of editReqs.slice(0, 10); track r.id) {
                    <div class="req-item" [class.excluded]="r.excluded">
                      <span class="req-badge" [class]="r.type">{{ r.type === 'functional' ? 'F' : 'NF' }}</span>
                      <span class="req-priority" [class]="r.priority">{{ r.priority }}</span>
                      <span class="req-desc">{{ r.description }}</span>
                      <button class="req-toggle" (click)="toggleReq(r.id)" [title]="r.excluded ? 'Incluir' : 'Excluir'">
                        {{ r.excluded ? '＋' : '✕' }}
                      </button>
                    </div>
                  }
                  @if (editReqs.length > 10) {
                    <p class="more">+{{ editReqs.length - 10 }} más</p>
                  }
                </div>
                <div class="tech-add-row">
                  <input class="tech-input" [(ngModel)]="newReq" placeholder="Agregar requisito manualmente..." (keyup.enter)="addReq()" />
                  <button class="btn-add-tech" (click)="addReq()" [disabled]="!newReq.trim()">+ Agregar</button>
                </div>
              </div>
            }
            @if (projectInfo()!.features.length > 0) {
              <div class="detail-row col">
                <span class="detail-label">Funcionalidades</span>
                <div class="feat-list">
                  @for (f of projectInfo()!.features.slice(0, 6); track f.name) {
                    <div class="feat-item">{{ f.description }}</div>
                  }
                  @if (projectInfo()!.features.length > 6) {
                    <p class="more">+{{ projectInfo()!.features.length - 6 }} más</p>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Sugerencias de stack -->
          <div class="stack-suggestions-wrap">
            <button class="link-btn" (click)="showStackSuggestions.set(!showStackSuggestions())">
              💡 {{ showStackSuggestions() ? 'Ocultar' : 'Ver' }} stacks sugeridos para {{ typeLabel(editType) }}
            </button>
            @if (showStackSuggestions()) {
              <div class="stack-grid">
                @for (s of projectInfo()!.stackSuggestions; track s.name) {
                  <div class="stack-card">
                    <div class="stack-name">{{ s.name }}</div>
                    <div class="stack-desc">{{ s.description }}</div>
                    <div class="stack-techs">{{ s.techs.join(' · ') }}</div>
                    <button class="btn-add-tech" (click)="applyStackSuggestion(s.techs)">Aplicar</button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Presets de instrucciones extra -->
          <div class="presets-wrap">
            <div class="presets-label">⚡ Instrucciones extra (click para activar):</div>
            <div class="presets-grid">
              @for (p of instructionPresets; track p.value) {
                <button class="preset-btn" [class.active]="isInstructionActive(p.value)" (click)="toggleInstruction(p.value)">
                  {{ p.label }}
                </button>
              }
            </div>
          </div>

          <div class="action-area">
            <!-- Fila 1: Opciones -->
            <div class="options-row">
              <div class="lang-selector">
                <span class="lang-label">Idioma:</span>
                <button class="lang-btn" [class.active]="promptLang() === 'es'" (click)="setPromptLang('es')">🇪🇸 ES</button>
                <button class="lang-btn" [class.active]="promptLang() === 'en'" (click)="setPromptLang('en')">🇺🇸 EN</button>
              </div>
              <div class="lang-selector">
                <span class="lang-label">Modelo:</span>
                <button class="lang-btn" [class.active]="promptModel() === 'auto'" (click)="setPromptModel('auto')">Auto</button>
                <button class="lang-btn" [class.active]="promptModel() === 'gpt'" (click)="setPromptModel('gpt')">GPT</button>
                <button class="lang-btn" [class.active]="promptModel() === 'claude'" (click)="setPromptModel('claude')">Claude</button>
                <button class="lang-btn" [class.active]="promptModel() === 'gemini'" (click)="setPromptModel('gemini')">Gemini</button>
              </div>
            </div>
            <!-- Fila 2: Acciones -->
            <div class="action-row">
              <button class="btn-secondary" (click)="reset()">← Volver</button>
              <button class="btn-secondary" (click)="showTemplates.set(!showTemplates())">📋 Plantillas</button>
              <button class="btn-secondary" (click)="generateShortPrompt()">⚡ Prompt corto</button>
              <button class="btn-primary" (click)="generatePrompt()">✨ Generar Prompt</button>
            </div>
          </div>

          <!-- Templates panel -->
          @if (showTemplates()) {
            <div class="templates-panel">
              <div class="templates-header">
                <span>📋 Plantillas guardadas</span>
                <button class="link-btn" (click)="showTemplates.set(false)">✕</button>
              </div>
              @if (templateStore.templates().length === 0) {
                <p class="templates-empty">No hay plantillas. Guarda el stack actual para reutilizarlo.</p>
              } @else {
                @for (t of templateStore.templates(); track t.id) {
                  <div class="template-row">
                    <div class="template-info">
                      <span class="template-name">{{ t.name }}</span>
                      <span class="template-techs">{{ t.technologies.join(', ') }}</span>
                    </div>
                    <button class="action-btn-sm" (click)="applyTemplate(t)">Aplicar</button>
                    <button class="action-btn-sm danger" (click)="templateStore.delete(t.id)">✕</button>
                  </div>
                }
              }
              <div class="template-save-row">
                <input class="tech-input" [(ngModel)]="templateName" placeholder="Nombre de la plantilla..." (keyup.enter)="saveTemplate()" />
                <button class="btn-add-tech" (click)="saveTemplate()" [disabled]="!templateName.trim()">💾 Guardar actual</button>
              </div>
            </div>
          }
        }

        <!-- STEP: PROMPT -->
        @if (step() === 'prompt') {
          <div class="page-header">
            <h1>Prompt Generado</h1>
            <div class="prompt-meta">
              <span>📄 {{ generatedPrompt()!.metadata.documentCount }} docs</span>
              <span>📝 {{ wordCount }} palabras</span>
              <span class="token-badge token-{{ tokenLevel }}">~{{ tokenEstimate.toLocaleString('es-ES') }} tokens</span>
              <span>{{ promptLang() === 'en' ? '🇺🇸 English' : '🇪🇸 Español' }}</span>
              <span>🤖 {{ modelLabel(generatedPrompt()!.metadata.targetModel ?? promptModel()) }}</span>
              <span>🎯 {{ generatedPrompt()!.metadata.targetTokenBudget ?? tokenBudget() }} máx</span>
            </div>
          </div>

          @if (tokenWarning) {
            <div class="warn-banner">
              ⚠️ Este prompt supera las 8,000 tokens. Algunos modelos pueden truncarlo. Considera usar Claude o GPT-4 con contexto largo.
              <div class="cost-row">
                <span>Costo estimado:</span>
                <span>GPT-4: {{ costEstimate.gpt4 }}</span>
                <span>Claude: {{ costEstimate.claude }}</span>
                <span>Gemini: {{ costEstimate.gemini }}</span>
              </div>
            </div>
          } @else {
            <div class="tip-banner">
              💡 Copia este prompt y pégalo en ChatGPT, Claude, Gemini o cualquier IA de código para generar tu proyecto completo.
              <div class="cost-row">
                <span>Costo estimado:</span>
                <span>GPT-4: {{ costEstimate.gpt4 }}</span>
                <span>Claude: {{ costEstimate.claude }}</span>
                <span>Gemini: {{ costEstimate.gemini }}</span>
              </div>
            </div>
          }

          <div class="prompt-box" [class.fullscreen]="fullscreen()">
            <div class="prompt-box-header">
              <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
              <span class="prompt-box-label">{{ shortMode() ? 'prompt-corto.md' : 'prompt.md' }}</span>
              @if (shortMode()) { <span class="short-badge">⚡ Corto</span> }
              <button class="copy-inline-btn" [class.copied]="copyDone()" (click)="copyPrompt()">
                {{ copyDone() ? '✓ Copiado' : '📋 Copiar' }}
              </button>
              <button class="fullscreen-btn" (click)="fullscreen.set(!fullscreen())" [title]="fullscreen() ? 'Salir de pantalla completa' : 'Pantalla completa'">
                {{ fullscreen() ? '⊠' : '⊞' }}
              </button>
            </div>
            <div class="prompt-box-scroll">
              <pre [innerHTML]="coloredPrompt"></pre>
            </div>
          </div>

          <div class="action-row">
            <button class="btn-secondary" (click)="goToDashboard()">🗂️ Ver Proyectos</button>
            <button class="btn-secondary" (click)="reset()">🔄 Nuevo</button>
            <button class="btn-secondary" (click)="downloadPrompt()">💾 Descargar .json</button>
            <button class="btn-secondary" (click)="sharePrompt()">🔗 Compartir</button>
            <button class="btn-primary" [class.btn-copied]="copyDone()" (click)="copyPrompt()">
              {{ copyDone() ? '✓ Copiado' : '📋 Copiar Prompt' }}
            </button>
          </div>
        }

      </main>
    </div>
  `,
  styles: [`
    :host {
      display: flex; position: fixed; inset: 0;
      font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased;
      --c-bg: #f0f2f8; --c-surface: #ffffff; --c-border: #e2e8f0;
      --c-text: #0f172a; --c-text-2: #475569; --c-text-3: #94a3b8;
      --c-accent: #6d28d9; --c-accent-3: #8b5cf6;
      --c-accent-bg: #f5f3ff; --c-accent-bd: #ddd6fe;
      --c-green: #16a34a; --c-green-bg: #dcfce7;
      --c-amber: #d97706; --c-amber-bg: #fef3c7;
      --c-red: #dc2626; --c-red-bg: #fee2e2;
      --c-code-bg: #0d1117; --sidebar-w: 240px;
      --t: .18s cubic-bezier(.4,0,.2,1);
    }
    .layout { display: flex; width: 100%; height: 100%; overflow: hidden; }

    /* SIDEBAR */
    .sidebar { width: var(--sidebar-w); flex-shrink: 0; background: #1e1b4b; display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,.06); }
    .sidebar-brand { display: flex; align-items: center; gap: 10px; padding: 22px 20px 18px; border-bottom: 1px solid rgba(255,255,255,.07); }
    .brand-logo { width: 36px; height: 36px; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3)); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .brand-name { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -.03em; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: none; background: transparent; border-radius: 8px; font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,.6); cursor: pointer; transition: all var(--t); text-align: left; width: 100%; }
    .nav-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
    .nav-item.active { background: rgba(139,92,246,.25); color: #fff; font-weight: 600; }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }
    .sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,.07); display: flex; align-items: center; gap: 10px; }
    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .user-avatar { width: 32px; height: 32px; flex-shrink: 0; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; }
    .user-details { display: flex; flex-direction: column; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { font-size: 11px; color: rgba(255,255,255,.4); }
    .logout-btn { background: rgba(255,255,255,.07); border: none; color: rgba(255,255,255,.5); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all var(--t); flex-shrink: 0; }
    .logout-btn:hover { background: var(--c-red-bg); color: var(--c-red); }

    /* MAIN */
    .main { flex: 1; overflow-y: auto; background: var(--c-bg); padding: 36px 40px; }
    .page-header { margin-bottom: 28px; }
    .page-header h1 { font-size: 26px; font-weight: 800; letter-spacing: -.04em; margin-bottom: 6px; }
    .page-header p { font-size: 14px; color: var(--c-text-2); }
    .prompt-meta { display: flex; gap: 10px; margin-top: 10px; font-size: 13px; color: var(--c-text-3); }
    .prompt-meta span { background: var(--c-surface); border: 1px solid var(--c-border); padding: 4px 10px; border-radius: 20px; }

    /* INPUT TABS */
    .input-tabs { display: flex; gap: 8px; margin-bottom: 16px; }
    .input-tab { padding: 9px 20px; border: 1px solid var(--c-border); background: var(--c-surface); border-radius: 8px; font-size: 13.5px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .input-tab:hover { border-color: var(--c-accent-bd); color: var(--c-accent); }
    .input-tab.active { background: var(--c-accent-bg); border-color: var(--c-accent-bd); color: var(--c-accent); font-weight: 600; }

    /* UPLOAD */
    .upload-card { background: var(--c-surface); border-radius: 20px; border: 1px solid var(--c-border); box-shadow: 0 4px 6px rgba(0,0,0,.07); overflow: hidden; }
    .upload-area { padding: 64px 40px; text-align: center; cursor: pointer; border-bottom: 1px solid var(--c-border); transition: background var(--t); }
    .upload-area:hover, .upload-area.drag-over { background: var(--c-accent-bg); }
    .upload-area.drag-over { box-shadow: inset 0 0 0 2px var(--c-accent); }
    .upload-icon { font-size: 56px; margin-bottom: 16px; }
    .upload-title { font-size: 19px; font-weight: 700; margin-bottom: 6px; }
    .upload-sub { font-size: 14px; color: var(--c-text-2); margin-bottom: 10px; }
    .upload-formats { font-size: 11px; font-weight: 600; color: var(--c-text-3); letter-spacing: .04em; text-transform: uppercase; }
    .files-section { padding: 22px; }
    .files-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-size: 13px; font-weight: 600; color: var(--c-text-2); }
    .files-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px; }
    .file-chip { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 8px; font-size: 13px; }
    .file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-size { font-size: 11px; color: var(--c-text-3); }
    .chip-remove { background: none; border: none; font-size: 18px; color: var(--c-text-3); cursor: pointer; }
    .chip-remove:hover { color: var(--c-red); }
    .text-section { padding: 22px; display: flex; flex-direction: column; gap: 12px; }
    .paste-area { width: 100%; min-height: 260px; padding: 16px; border: 1.5px solid var(--c-border); border-radius: 12px; font-size: 14px; font-family: inherit; resize: vertical; background: var(--c-bg); color: var(--c-text); line-height: 1.6; transition: border-color var(--t); box-sizing: border-box; }
    .paste-area:focus { outline: none; border-color: var(--c-accent); background: #fff; }
    .text-actions { display: flex; justify-content: space-between; align-items: center; }
    .char-count { font-size: 12px; color: var(--c-text-3); }
    .char-count.warn { color: var(--c-amber); }

    /* SPINNER */
    .center-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 20px; text-align: center; }
    .spinner-wrap { position: relative; width: 56px; height: 56px; margin-bottom: 28px; }
    .spinner-outer { position: absolute; inset: 0; border: 3px solid var(--c-border); border-top-color: var(--c-accent); border-radius: 50%; animation: spin 1s linear infinite; }
    .spinner-inner { position: absolute; inset: 8px; border: 3px solid transparent; border-bottom-color: var(--c-accent-3); border-radius: 50%; animation: spin .7s linear infinite reverse; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .center-state h2 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
    .center-state p { font-size: 14px; color: var(--c-text-2); margin-bottom: 20px; }
    .progress-bar-wrap { width: 280px; height: 6px; background: var(--c-border); border-radius: 99px; overflow: hidden; margin-top: 16px; }
    .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--c-accent), var(--c-accent-3)); border-radius: 99px; transition: width .4s ease; }
    .progress-pct { font-size: 12px; color: var(--c-text-3); margin-top: 8px; }

    /* STATS */
    .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
    .stat-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 16px; padding: 22px 16px; text-align: center; }
    .stat-label { font-size: 11px; font-weight: 600; color: var(--c-text-3); margin-bottom: 10px; text-transform: uppercase; letter-spacing: .06em; }
    .stat-value { font-size: 30px; font-weight: 800; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-value.type { font-size: 15px; line-height: 1.4; -webkit-text-fill-color: var(--c-accent); }

    /* DETAIL CARD */
    .detail-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 16px; padding: 26px; margin-bottom: 24px; display: flex; flex-direction: column; gap: 20px; }
    .detail-row { display: flex; align-items: flex-start; gap: 16px; }
    .detail-row.col { flex-direction: column; gap: 10px; }
    .detail-label { font-size: 11px; font-weight: 700; color: var(--c-text-3); min-width: 140px; text-transform: uppercase; letter-spacing: .05em; padding-top: 4px; }
    .inline-edit { flex: 1; padding: 8px 12px; border: 1.5px solid var(--c-border); border-radius: 8px; font-size: 14px; font-weight: 500; color: var(--c-text); background: var(--c-bg); transition: border-color var(--t); }
    .inline-edit:focus { outline: none; border-color: var(--c-accent); background: #fff; }
    .type-selector { display: flex; flex-wrap: wrap; gap: 8px; flex: 1; }
    .type-btn { padding: 6px 14px; border: 1.5px solid var(--c-border); background: var(--c-bg); border-radius: 20px; font-size: 12.5px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .type-btn:hover { border-color: var(--c-accent-bd); color: var(--c-accent); }
    .type-btn.active { background: var(--c-accent-bg); border-color: var(--c-accent); color: var(--c-accent); font-weight: 600; }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
    .tech-tag { background: var(--c-accent-bg); color: var(--c-accent); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid var(--c-accent-bd); }
    .tech-tag.removable { cursor: pointer; transition: all var(--t); }
    .tech-tag.removable:hover { background: var(--c-red-bg); color: var(--c-red); border-color: var(--c-red); }
    .tech-edit-area { flex: 1; display: flex; flex-direction: column; gap: 10px; }
    .tech-add-row { display: flex; gap: 8px; align-items: center; }
    .tech-input { flex: 1; max-width: 220px; padding: 6px 12px; border: 1.5px solid var(--c-border); border-radius: 8px; font-size: 13px; color: var(--c-text); background: var(--c-bg); transition: border-color var(--t); }
    .tech-input:focus { outline: none; border-color: var(--c-accent); background: #fff; }
    .btn-add-tech { padding: 6px 14px; background: var(--c-accent-bg); border: 1px solid var(--c-accent-bd); color: var(--c-accent); border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all var(--t); }
    .btn-add-tech:hover:not(:disabled) { background: var(--c-accent); color: #fff; }
    .btn-add-tech:disabled { opacity: .4; cursor: not-allowed; }
    .req-list, .feat-list { display: flex; flex-direction: column; gap: 8px; }
    .req-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--c-text-2); line-height: 1.5; padding: 6px 0; }
    .req-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
    .req-badge.functional { background: var(--c-green-bg); color: var(--c-green); }
    .req-badge.non-functional { background: var(--c-amber-bg); color: var(--c-amber); }
    .req-priority { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; text-transform: uppercase; }
    .req-priority.high { background: var(--c-red-bg); color: var(--c-red); }
    .req-priority.medium { background: var(--c-amber-bg); color: var(--c-amber); }
    .req-priority.low { background: var(--c-green-bg); color: var(--c-green); }
    .feat-item { font-size: 13px; color: var(--c-text-2); padding: 8px 12px; background: var(--c-bg); border-radius: 8px; border-left: 3px solid var(--c-accent-bd); word-break: break-word; }
    .more { font-size: 12px; color: var(--c-text-3); font-style: italic; }

    /* TIP / WARN */
    .tip-banner { background: var(--c-accent-bg); border: 1px solid var(--c-accent-bd); border-radius: 12px; padding: 12px 16px; font-size: 13.5px; color: var(--c-accent); margin-bottom: 20px; line-height: 1.5; }
    .warn-banner { background: var(--c-amber-bg); border: 1px solid #fcd34d; border-radius: 12px; padding: 12px 16px; font-size: 13.5px; color: var(--c-amber); margin-bottom: 20px; line-height: 1.5; }
    .warn-badge { color: var(--c-amber) !important; }

    /* PROMPT BOX */
    .prompt-box { background: var(--c-code-bg); border-radius: 16px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,.1); }
    .prompt-box-header { display: flex; align-items: center; gap: 7px; padding: 12px 16px; background: rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.07); }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-red { background: #ff5f57; } .dot-amber { background: #febc2e; } .dot-green { background: #28c840; }
    .prompt-box-label { margin-left: 8px; font-size: 12px; color: rgba(255,255,255,.3); flex: 1; }
    .copy-inline-btn { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.6); padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all var(--t); }
    .copy-inline-btn:hover { background: rgba(255,255,255,.15); color: #fff; }
    .copy-inline-btn.copied { background: rgba(34,197,94,.2); border-color: rgba(34,197,94,.4); color: #4ade80; }
    .prompt-box-scroll { padding: 22px 24px; max-height: 480px; overflow-y: auto; }
    .prompt-box-scroll::-webkit-scrollbar { width: 6px; }
    .prompt-box-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }
    .prompt-box-scroll pre { color: #cdd9e5; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; margin: 0; }

    /* BUTTONS */
    .btn-primary { padding: 11px 24px; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3)); color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(109,40,217,.35); transition: all var(--t); }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(109,40,217,.45); }
    .btn-primary:disabled { opacity: .45; cursor: not-allowed; }
    .btn-primary.full { width: 100%; }
    .btn-secondary { padding: 11px 24px; background: var(--c-surface); color: var(--c-text-2); border: 1px solid var(--c-border); border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--t); }
    .btn-secondary:hover { border-color: var(--c-accent-bd); color: var(--c-accent); background: var(--c-accent-bg); }
    .action-row { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; align-items: center; }
    .link-btn { background: none; border: none; font-size: 13px; color: var(--c-accent); cursor: pointer; padding: 0; font-weight: 500; }
    .link-btn:hover { text-decoration: underline; }
    /* Lang selector */
    .action-area { display: flex; flex-direction: column; gap: 12px; }
    .options-row { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; padding: 12px 16px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px; }
    .lang-selector { display: flex; align-items: center; gap: 6px; }
    .lang-label { font-size: 12px; color: var(--c-text-3); font-weight: 600; }
    .lang-btn { padding: 6px 12px; border: 1.5px solid var(--c-border); background: var(--c-bg); border-radius: 20px; font-size: 12px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .lang-btn:hover { border-color: var(--c-accent-bd); color: var(--c-accent); }
    .lang-btn.active { background: var(--c-accent-bg); border-color: var(--c-accent); color: var(--c-accent); font-weight: 600; }
    /* Copied state */
    .btn-copied { background: linear-gradient(135deg, #16a34a, #22c55e) !important; box-shadow: 0 2px 8px rgba(22,163,74,.35) !important; }
    /* Token badge */
    .token-badge { font-weight: 600 !important; }
    .token-green { border-color: #22c55e !important; color: #16a34a !important; }
    .token-amber { border-color: #f59e0b !important; color: #d97706 !important; }
    .token-red   { border-color: #ef4444 !important; color: #dc2626 !important; }
    /* Req excluded */
    .req-item.excluded { opacity: .4; }
    .req-item.excluded .req-desc { text-decoration: line-through; }
    .req-desc { flex: 1; word-break: break-word; overflow-wrap: anywhere; max-height: 3em; overflow: hidden; }
    .req-toggle { background: none; border: none; font-size: 14px; cursor: pointer; color: var(--c-text-3); padding: 2px 6px; flex-shrink: 0; border-radius: 4px; }
    .req-toggle:hover { color: var(--c-red); background: var(--c-red-bg); }
    /* Char progress */
    .char-progress-wrap { height: 3px; background: var(--c-border); border-radius: 99px; overflow: hidden; margin: 4px 0; }
    .char-progress-bar { height: 100%; background: linear-gradient(90deg, var(--c-accent), var(--c-accent-3)); border-radius: 99px; transition: width .2s, background .2s; }
    .char-progress-bar.warn { background: linear-gradient(90deg, var(--c-amber), var(--c-red)); }
    /* Fullscreen prompt box */
    .prompt-box.fullscreen { position: fixed; inset: 0; z-index: 200; border-radius: 0; margin: 0; }
    .prompt-box.fullscreen .prompt-box-scroll { max-height: calc(100vh - 52px); }
    .fullscreen-btn { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.6); padding: 4px 10px; border-radius: 6px; font-size: 14px; cursor: pointer; transition: all var(--t); margin-left: 4px; }
    .fullscreen-btn:hover { background: rgba(255,255,255,.15); color: #fff; }
    .short-badge { background: rgba(251,191,36,.2); border: 1px solid rgba(251,191,36,.4); color: #fbbf24; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    /* Colored prompt sections */
    .prompt-box-scroll pre .ps-sep     { color: #6366f1; font-weight: 700; }
    .prompt-box-scroll pre .ps-doc     { color: #38bdf8; font-weight: 700; }
    .prompt-box-scroll pre .ps-analysis{ color: #34d399; font-weight: 700; }
    .prompt-box-scroll pre .ps-instr   { color: #f59e0b; font-weight: 700; }
    .prompt-box-scroll pre .ps-struct  { color: #a78bfa; font-weight: 700; }
    .prompt-box-scroll pre .ps-tech    { color: #fb7185; font-weight: 700; }
    .prompt-box-scroll pre .ps-result  { color: #4ade80; font-weight: 700; }
    /* Templates panel */
    .templates-panel { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 14px; padding: 18px; margin-top: 12px; display: flex; flex-direction: column; gap: 12px; }
    .templates-header { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 700; color: var(--c-text); }
    .templates-empty { font-size: 13px; color: var(--c-text-3); font-style: italic; }
    .template-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 8px; }
    .template-info { flex: 1; min-width: 0; }
    .template-name { font-size: 13px; font-weight: 700; color: var(--c-text); display: block; }
    .template-techs { font-size: 11px; color: var(--c-text-3); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
    .action-btn-sm { padding: 4px 10px; border: 1px solid var(--c-border); background: var(--c-bg); border-radius: 6px; font-size: 11px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .action-btn-sm:hover { border-color: var(--c-accent-bd); color: var(--c-accent); background: var(--c-accent-bg); }
    .action-btn-sm.danger:hover { border-color: var(--c-red); color: var(--c-red); background: var(--c-red-bg); }
    .template-save-row { display: flex; gap: 8px; align-items: center; border-top: 1px solid var(--c-border); padding-top: 12px; }
    /* Summary bar */
    .summary-bar { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .summary-text { flex: 1; font-size: 13px; color: var(--c-text-2); line-height: 1.5; min-width: 200px; }
    .confidence-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; flex-shrink: 0; cursor: help; }
    .confidence-high   { background: var(--c-green-bg); color: var(--c-green); border: 1px solid #86efac; }
    .confidence-medium { background: var(--c-amber-bg); color: var(--c-amber); border: 1px solid #fcd34d; }
    .confidence-low    { background: var(--c-red-bg);   color: var(--c-red);   border: 1px solid #fca5a5; }
    /* Stack suggestions */
    .stack-suggestions-wrap { margin-bottom: 16px; }
    .stack-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
    .stack-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 6px; }
    .stack-name { font-size: 13px; font-weight: 700; color: var(--c-text); }
    .stack-desc { font-size: 11px; color: var(--c-text-3); }
    .stack-techs { font-size: 11px; color: var(--c-accent); font-weight: 500; }
    /* Instruction presets */
    .presets-wrap { margin-bottom: 16px; }
    .presets-label { font-size: 12px; font-weight: 600; color: var(--c-text-3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: .05em; }
    .presets-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .preset-btn { padding: 6px 14px; border: 1.5px solid var(--c-border); background: var(--c-bg); border-radius: 20px; font-size: 12px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .preset-btn:hover { border-color: var(--c-accent-bd); color: var(--c-accent); }
    .preset-btn.active { background: var(--c-accent-bg); border-color: var(--c-accent); color: var(--c-accent); font-weight: 700; }
    /* Cost row */
    .cost-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; font-size: 12px; opacity: .8; }
    .cost-row span:first-child { font-weight: 600; }
  `]
})
export class PromptGeneratorComponent implements OnInit, OnDestroy {
  private analyzer = inject(DocumentAnalyzerService);
  private promptGen = inject(PromptGeneratorService);
  private fileParser = inject(FileParserService);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly theme = inject(ThemeService);
  private titleSvc = inject(TitleService);
  private sanitizer = inject(DomSanitizer);
  history = inject(PromptHistoryService);
  readonly templateStore = inject(TemplateStoreService);
  private shareService = inject(ShareService);
  private clipboard = inject(ClipboardService);

  readonly projectTypes = PROJECT_TYPES;
  readonly Math = Math;

  step = signal<Step>('upload');
  inputMode = signal<InputMode>(
    (localStorage.getItem('pg_input_mode') as InputMode) ?? 'file'
  );
  isDragOver = signal(false);
  uploadedFiles = signal<File[]>([]);
  parsedContents = signal<string[]>([]);
  projectInfo = signal<AnalysisResult | null>(null);
  generatedPrompt = signal<GeneratedPrompt | null>(null);
  analyzeStatus = signal('Extrayendo texto...');
  analyzeProgress = signal(0);
  copyDone = signal(false);
  promptLang = signal<'es' | 'en'>(
    (localStorage.getItem('pg_prompt_lang') as 'es' | 'en') ?? 'es'
  );
  promptModel = signal<UiPromptModel>(
    (localStorage.getItem('pg_prompt_model') as UiPromptModel) ?? 'auto'
  );
  tokenBudget = signal<TokenBudget>(
    ((Number(localStorage.getItem('pg_token_budget')) || 800) as TokenBudget)
  );
  fullscreen = signal(false);
  shortMode = signal(false);
  showTemplates = signal(false);
  showStackSuggestions = signal(false);
  extraInstructions = signal<string[]>([]);
  templateName = '';
  private textDebounce: any = null;
  textLength = signal(0);

  pastedText = '';
  editName = '';
  editType: ProjectType = 'other';
  editTechs: string[] = [];
  editReqs: Array<{ id: string; description: string; type: 'functional' | 'non-functional'; priority: 'high' | 'medium' | 'low'; excluded: boolean }> = [];
  newTech = '';
  newReq = '';

  ngOnInit() { this.titleSvc.set('Nuevo Prompt'); }
  ngOnDestroy() { this.titleSvc.reset(); }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(e: BeforeUnloadEvent) {
    if (this.step() === 'analyzing' || this.step() === 'analysis') {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.step() === 'analysis') { this.reset(); return; }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (this.step() === 'upload') {
        if (this.inputMode() === 'file' && this.uploadedFiles().length) this.analyzeDocuments();
        else if (this.inputMode() === 'text' && this.pastedText.trim().length >= 50) this.analyzeText();
      } else if (this.step() === 'analysis') {
        this.generatePrompt();
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && this.step() === 'prompt') {
      // solo si no hay selección de texto activa
      if (!window.getSelection()?.toString()) { e.preventDefault(); this.copyPrompt(); }
    }
  }

  get currentUser() { return this.authService.user()?.username ?? 'Usuario'; }

  logout() { this.authService.logout(); }
  goToDashboard() { this.router.navigate(['/dashboard']); }

  setInputMode(mode: InputMode) {
    this.inputMode.set(mode);
    localStorage.setItem('pg_input_mode', mode);
  }

  setPromptLang(lang: 'es' | 'en') {
    this.promptLang.set(lang);
    localStorage.setItem('pg_prompt_lang', lang);
  }

  setPromptModel(model: UiPromptModel) {
    this.promptModel.set(model);
    localStorage.setItem('pg_prompt_model', model);
  }

  setTokenBudget(budget: TokenBudget) {
    this.tokenBudget.set(budget);
    localStorage.setItem('pg_token_budget', String(budget));
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.isDragOver.set(false); }
  onDrop(e: DragEvent) { e.preventDefault(); this.isDragOver.set(false); this.addFiles(Array.from(e.dataTransfer?.files ?? [])); }
  onFileSelected(e: Event) { this.addFiles(Array.from((e.target as HTMLInputElement).files ?? [])); }

  private addFiles(files: File[]) {
    const allowedExt = new Set(['pdf', 'doc', 'docx', 'md', 'txt']);
    const allowedMime = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/markdown',
      'text/plain',
      ''
    ]);
    const valid = files.filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!allowedExt.has(ext) || !allowedMime.has(f.type)) {
        this.notifications.error(`${f.name} no es un tipo de archivo soportado`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) { this.notifications.error(`${f.name} supera 10MB`); return false; }
      return true;
    });
    this.uploadedFiles.update(cur => [...cur, ...valid]);
    if (valid.length) this.notifications.success(`${valid.length} archivo(s) agregado(s)`);
  }

  removeFile(file: File) { this.uploadedFiles.update(f => f.filter(x => x !== file)); }

  async analyzeDocuments() {
    if (!this.uploadedFiles().length) { this.notifications.warning('Carga al menos un documento'); return; }
    this.step.set('analyzing');
    this.analyzeProgress.set(0);
    const files = this.uploadedFiles();
    const contents: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      this.analyzeStatus.set(`Leyendo archivo ${i + 1} de ${files.length}: ${files[i].name}`);
      this.analyzeProgress.set(Math.round((i / files.length) * 70));
      try {
        const text = await this.fileParser.parseFile(files[i]);
        if (text.trim().length > 20) {
          contents.push(text);
        } else {
          errors.push(`${files[i].name}: sin texto extraíble`);
        }
      } catch (e: any) {
        console.error(`Error parseando ${files[i].name}:`, e);
        errors.push(`${files[i].name}: ${e?.message ?? 'error desconocido'}`);
      }
    }

    if (!contents.length) {
      const msg = errors.length ? `No se pudo extraer texto. ${errors[0]}` : 'No se pudo extraer texto de los archivos';
      this.notifications.error(msg, 6000);
      this.step.set('upload');
      return;
    }

    if (errors.length) {
      this.notifications.warning(`${errors.length} archivo(s) con problemas, continuando con ${contents.length} válido(s)`);
    }

    this.analyzeProgress.set(80);
    this.analyzeStatus.set('Detectando requisitos y tecnologías...');
    setTimeout(() => {
      this.analyzeProgress.set(100);
      this.finishAnalysis(contents);
    }, 600);
  }

  analyzeText() {
    const text = this.pastedText.trim();
    if (text.length < 50) { this.notifications.warning('El texto es muy corto'); return; }
    this.step.set('analyzing');
    this.analyzeProgress.set(30);
    this.analyzeStatus.set('Analizando texto...');
    setTimeout(() => {
      this.analyzeProgress.set(80);
      this.analyzeStatus.set('Detectando requisitos y tecnologías...');
      setTimeout(() => { this.analyzeProgress.set(100); this.finishAnalysis([text]); }, 400);
    }, 400);
  }

  private finishAnalysis(contents: string[]) {
    this.parsedContents.set(contents);
    const info = this.analyzer.analyzeDocuments(contents);
    this.projectInfo.set(info);
    this.editName = info.name;
    this.editType = info.type;
    this.editTechs = [...info.technologies];
    this.editReqs = info.requirements.map(r => ({ ...r, excluded: false }));
    // Auto-detectar idioma del documento
    const detectedLang = this.analyzer.detectLanguage(contents.join(' '));
    if (detectedLang !== this.promptLang()) {
      this.setPromptLang(detectedLang);
      this.notifications.info(`Idioma detectado: ${detectedLang === 'en' ? '🇺🇸 English' : '🇪🇸 Español'}`);
    }
    this.step.set('analysis');
    this.notifications.success(`Análisis completado — confianza ${info.confidence.level === 'high' ? 'alta' : info.confidence.level === 'medium' ? 'media' : 'baja'}`);
  }

  addReq() {
    const desc = this.newReq.trim();
    if (!desc) return;
    this.editReqs = [...this.editReqs, { id: `REQ-M-${Date.now()}`, description: desc, type: 'functional', priority: 'medium', excluded: false }];
    this.newReq = '';
  }

  toggleReq(id: string) {
    this.editReqs = this.editReqs.map(r => r.id === id ? { ...r, excluded: !r.excluded } : r);
  }

  addTech() {
    const t = this.newTech.trim();
    if (t && !this.editTechs.includes(t)) { this.editTechs = [...this.editTechs, t]; }
    this.newTech = '';
  }

  removeTech(tech: string) { this.editTechs = this.editTechs.filter(t => t !== tech); }

  generatePrompt() {
    if (!this.projectInfo()) return;
    const activeReqs = this.editReqs
      .filter(r => !r.excluded)
      .map(({ excluded, ...r }) => r);
    const info: ProjectInfo = {
      ...this.projectInfo()!,
      name: this.editName || this.projectInfo()!.name,
      type: this.editType,
      technologies: this.editTechs,
      requirements: activeReqs
    };
    const prompt = this.promptGen.generatePrompt(
      info,
      this.parsedContents(),
      this.promptLang(),
      this.promptModel(),
      this.tokenBudget()
    );
    this.generatedPrompt.set(prompt);
    this.history.save(info.name, prompt);
    this.step.set('prompt');
    this.titleSvc.set(`Prompt: ${info.name}`);
    this.notifications.success('Prompt generado y guardado');
  }

  get wordCount() { return this.generatedPrompt()?.metadata.wordCount ?? 0; }
  get tokenEstimate() { return Math.round(this.wordCount * 1.3); }
  get tokenLevel(): 'green' | 'amber' | 'red' {
    if (this.tokenEstimate < 4000) return 'green';
    if (this.tokenEstimate < 8000) return 'amber';
    return 'red';
  }
  get tokenWarning() { return this.tokenEstimate > 8000; }

  get costEstimate(): { gpt4: string; claude: string; gemini: string } {
    const tokens = this.tokenEstimate;
    // Precios aproximados por 1K tokens (input+output estimado x3)
    const total = tokens * 4; // input + output estimado
    return {
      gpt4:   `~$${((total / 1000) * 0.03).toFixed(3)}`,
      claude: `~$${((total / 1000) * 0.015).toFixed(3)}`,
      gemini: `~$${((total / 1000) * 0.00025).toFixed(4)}`
    };
  }

  async copyPrompt() {
    if (!this.generatedPrompt() || this.copyDone()) return;
    const ok = await this.clipboard.copyText(this.generatedPrompt()!.content, '');
    if (ok) {
      this.copyDone.set(true);
      setTimeout(() => this.copyDone.set(false), 2000);
    }
  }

  async sharePrompt() {
    if (!this.generatedPrompt()) return;
    try {
      const id = await this.shareService.create(this.generatedPrompt()!.content);
      const url = `${window.location.origin}/share/${id}`;
      await this.clipboard.copyText(url, 'Enlace copiado — compártelo con quien quieras');
    } catch { this.notifications.error('No se pudo generar el enlace'); }
  }

  // Short mode
  generateShortPrompt() {
    if (!this.projectInfo()) return;
    const info: ProjectInfo = { ...this.projectInfo()!, name: this.editName || this.projectInfo()!.name, type: this.editType, technologies: this.editTechs };
    const prompt = this.promptGen.generateShortPrompt(info, this.promptLang());
    this.generatedPrompt.set(prompt);
    this.shortMode.set(true);
    this.history.save(info.name, prompt);
    this.step.set('prompt');
    this.titleSvc.set(`Prompt: ${info.name}`);
    this.notifications.success('Prompt corto generado');
  }

  // Templates
  saveTemplate() {
    const name = this.templateName.trim();
    if (!name || !this.editTechs.length) { this.notifications.warning('Ingresa un nombre y al menos una tecnología'); return; }
    this.templateStore.save(name, this.editTechs, this.editType);
    this.templateName = '';
    this.showTemplates.set(false);
    this.notifications.success('Plantilla guardada');
  }

  applyTemplate(t: { technologies: string[]; projectType: ProjectType }) {
    this.editTechs = [...t.technologies];
    this.editType = t.projectType;
    this.showTemplates.set(false);
    this.notifications.success('Plantilla aplicada');
  }

  applyStackSuggestion(techs: string[]) {
    this.editTechs = [...new Set([...this.editTechs, ...techs])];
    this.showStackSuggestions.set(false);
    this.notifications.success('Stack aplicado');
  }

  readonly instructionPresets = [
    { label: '🧪 Usar TDD', value: 'Implementa el proyecto usando Test-Driven Development (TDD). Incluye tests unitarios para cada función crítica.' },
    { label: '🐳 Agregar Docker', value: 'Incluye Dockerfile y docker-compose.yml para containerizar la aplicación.' },
    { label: '🔐 OAuth 2.0', value: 'Implementa autenticación con OAuth 2.0 (Google/GitHub). Incluye flujo completo de login social.' },
    { label: '📱 Responsive', value: 'La UI debe ser completamente responsive y funcionar en móvil, tablet y desktop.' },
    { label: '♿ Accesibilidad', value: 'Implementa accesibilidad WCAG 2.1 AA: aria-labels, navegación por teclado, contraste adecuado.' },
    { label: '📊 Logging', value: 'Agrega logging estructurado con niveles (info, warn, error) en todos los endpoints y operaciones críticas.' },
    { label: '🚀 CI/CD', value: 'Incluye configuración de GitHub Actions para CI/CD: lint, tests y deploy automático.' },
    { label: '📖 Swagger', value: 'Documenta todos los endpoints con Swagger/OpenAPI. Incluye ejemplos de request/response.' },
  ];

  toggleInstruction(value: string) {
    const current = this.extraInstructions();
    if (current.includes(value)) {
      this.extraInstructions.set(current.filter(i => i !== value));
    } else {
      this.extraInstructions.set([...current, value]);
    }
  }

  isInstructionActive(value: string) { return this.extraInstructions().includes(value); }

  // Colored sections — parse prompt into sections with colors
  get coloredPrompt(): SafeHtml {
    const content = this.generatedPrompt()?.content ?? '';
    const escaped = content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const colored = escaped
      .replace(/(════+[^\n]+════+)/g, '<span class="ps-sep">$1</span>')
      .replace(/(DOCUMENTACIÓN DEL PROYECTO|PROJECT DOCUMENTATION)/g, '<span class="ps-doc">$1</span>')
      .replace(/(ANÁLISIS EXTRAÍDO|EXTRACTED ANALYSIS)/g, '<span class="ps-analysis">$1</span>')
      .replace(/(INSTRUCCIONES DE GENERACIÓN|GENERATION INSTRUCTIONS)/g, '<span class="ps-instr">$1</span>')
      .replace(/(ESTRUCTURA DE ARCHIVOS|FILE STRUCTURE)/g, '<span class="ps-struct">$1</span>')
      .replace(/(ESPECIFICACIONES TÉCNICAS|TECHNICAL SPECIFICATIONS)/g, '<span class="ps-tech">$1</span>')
      .replace(/(RESULTADO ESPERADO|EXPECTED RESULT)/g, '<span class="ps-result">$1</span>');
    return this.sanitizer.bypassSecurityTrustHtml(colored);
  }

  // Debounced text input
  onTextInput(value: string) {
    this.pastedText = value;
    clearTimeout(this.textDebounce);
    this.textDebounce = setTimeout(() => this.textLength.set(value.length), 150);
  }

  downloadPrompt() {
    if (!this.generatedPrompt()) return;
    const json = formatPromptJson({
      projectName: this.editName || 'proyecto',
      projectType: this.generatedPrompt()!.metadata.projectType,
      generatedAt: this.generatedPrompt()!.metadata.generatedAt,
      wordCount: this.generatedPrompt()!.metadata.wordCount,
      documentCount: this.generatedPrompt()!.metadata.documentCount,
      lang: this.promptLang(),
      short: this.shortMode(),
      prompt: this.generatedPrompt()!.content
    });
    const blob = new Blob([json], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `prompt-${(this.editName || 'proyecto').replace(/\s+/g, '-')}.json`
    });
    a.click(); URL.revokeObjectURL(a.href);
    this.notifications.success('Descargado como .json');
  }

  reset() {
    this.step.set('upload'); this.uploadedFiles.set([]); this.parsedContents.set([]);
    this.projectInfo.set(null); this.generatedPrompt.set(null); this.copyDone.set(false);
    this.pastedText = ''; this.editName = ''; this.editType = 'other';
    this.editTechs = []; this.editReqs = []; this.newTech = ''; this.newReq = '';
    this.extraInstructions.set([]); this.showStackSuggestions.set(false);
    this.titleSvc.set('Nuevo Prompt');
  }

  getFileIcon(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase();
    return ({ pdf: '📕', doc: '📘', docx: '📘', md: '📗', txt: '📄' } as any)[ext ?? ''] ?? '📄';
  }

  formatSize(bytes: number): string {
    return bytes < 1024 * 1024 ? (bytes / 1024).toFixed(1) + ' KB' : (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  typeLabel(type: string): string {
    return PROJECT_TYPES.find(t => t.value === type)?.label ?? type;
  }

  modelLabel(model: UiPromptModel): string {
    if (model === 'gpt') return 'GPT';
    if (model === 'claude') return 'Claude';
    if (model === 'gemini') return 'Gemini';
    return 'Auto';
  }
}
