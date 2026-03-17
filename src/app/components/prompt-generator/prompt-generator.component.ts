import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentAnalyzerService } from '../../services/document-analyzer.service';
import { PromptGeneratorService } from '../../services/prompt-generator.service';
import { FileParserService } from '../../services/file-parser.service';
import { PromptHistoryService } from '../../services/prompt-history.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { ProjectInfo, ProjectType } from '../../models/project-info.interface';
import { GeneratedPrompt } from '../../models/prompt-template.interface';

type Step = 'upload' | 'analyzing' | 'analysis' | 'prompt';
type InputMode = 'file' | 'text';

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
            <button class="input-tab" [class.active]="inputMode() === 'file'" (click)="inputMode.set('file')">
              📁 Subir archivos
            </button>
            <button class="input-tab" [class.active]="inputMode() === 'text'" (click)="inputMode.set('text')">
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
                <textarea [(ngModel)]="pastedText" class="paste-area"
                  placeholder="Pega aquí la documentación de tu proyecto: requisitos, historias de usuario, descripción, entrevistas con el cliente...

Ejemplo:
Sistema de gestión de inventario para una tienda.
El sistema debe permitir registrar productos, controlar stock, generar alertas cuando el stock es bajo y generar reportes de ventas..."></textarea>
                <div class="text-actions">
                  <span class="char-count" [class.warn]="pastedText.length > 8000">{{ pastedText.length }} caracteres</span>
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
            @if (projectInfo()!.technologies.length > 0) {
              <div class="detail-row">
                <span class="detail-label">Tecnologías</span>
                <div class="tech-tags">
                  @for (t of projectInfo()!.technologies; track t) {
                    <span class="tech-tag">{{ t }}</span>
                  }
                </div>
              </div>
            }
            @if (projectInfo()!.requirements.length > 0) {
              <div class="detail-row col">
                <span class="detail-label">Requisitos detectados</span>
                <div class="req-list">
                  @for (r of projectInfo()!.requirements.slice(0, 8); track r.id) {
                    <div class="req-item">
                      <span class="req-badge" [class]="r.type">{{ r.type === 'functional' ? 'F' : 'NF' }}</span>
                      <span class="req-priority" [class]="r.priority">{{ r.priority }}</span>
                      <span>{{ r.description }}</span>
                    </div>
                  }
                  @if (projectInfo()!.requirements.length > 8) {
                    <p class="more">+{{ projectInfo()!.requirements.length - 8 }} más</p>
                  }
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

          <div class="action-row">
            <button class="btn-secondary" (click)="reset()">← Volver</button>
            <button class="btn-primary" (click)="generatePrompt()">✨ Generar Prompt</button>
          </div>
        }

        <!-- STEP: PROMPT -->
        @if (step() === 'prompt') {
          <div class="page-header">
            <h1>Prompt Generado</h1>
            <div class="prompt-meta">
              <span>📄 {{ generatedPrompt()!.metadata.documentCount }} docs</span>
              <span>📝 {{ generatedPrompt()!.metadata.wordCount }} palabras</span>
            </div>
          </div>

          <div class="tip-banner">
            💡 Copia este prompt y pégalo en ChatGPT, Claude, Gemini o cualquier IA de código para generar tu proyecto completo.
          </div>

          <div class="prompt-box">
            <div class="prompt-box-header">
              <span class="dot dot-red"></span><span class="dot dot-amber"></span><span class="dot dot-green"></span>
              <span class="prompt-box-label">prompt.md</span>
              <button class="copy-inline-btn" (click)="copyPrompt()">📋 Copiar</button>
            </div>
            <div class="prompt-box-scroll">
              <pre>{{ generatedPrompt()!.content }}</pre>
            </div>
          </div>

          <div class="action-row">
            <button class="btn-secondary" (click)="goToDashboard()">🗂️ Ver Proyectos</button>
            <button class="btn-secondary" (click)="reset()">🔄 Nuevo</button>
            <button class="btn-secondary" (click)="downloadPrompt()">💾 Descargar .md</button>
            <button class="btn-primary" (click)="copyPrompt()">📋 Copiar Prompt</button>
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
    .center-state p { font-size: 14px; color: var(--c-text-2); }

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
    .req-list, .feat-list { display: flex; flex-direction: column; gap: 8px; }
    .req-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--c-text-2); line-height: 1.5; }
    .req-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; }
    .req-badge.functional { background: var(--c-green-bg); color: var(--c-green); }
    .req-badge.non-functional { background: var(--c-amber-bg); color: var(--c-amber); }
    .req-priority { font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; margin-top: 2px; text-transform: uppercase; }
    .req-priority.high { background: var(--c-red-bg); color: var(--c-red); }
    .req-priority.medium { background: var(--c-amber-bg); color: var(--c-amber); }
    .req-priority.low { background: var(--c-green-bg); color: var(--c-green); }
    .feat-item { font-size: 13px; color: var(--c-text-2); padding: 8px 12px; background: var(--c-bg); border-radius: 8px; border-left: 3px solid var(--c-accent-bd); }
    .more { font-size: 12px; color: var(--c-text-3); font-style: italic; }

    /* TIP */
    .tip-banner { background: var(--c-accent-bg); border: 1px solid var(--c-accent-bd); border-radius: 12px; padding: 12px 16px; font-size: 13.5px; color: var(--c-accent); margin-bottom: 20px; line-height: 1.5; }

    /* PROMPT BOX */
    .prompt-box { background: var(--c-code-bg); border-radius: 16px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 20px 25px rgba(0,0,0,.1); }
    .prompt-box-header { display: flex; align-items: center; gap: 7px; padding: 12px 16px; background: rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.07); }
    .dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-red { background: #ff5f57; } .dot-amber { background: #febc2e; } .dot-green { background: #28c840; }
    .prompt-box-label { margin-left: 8px; font-size: 12px; color: rgba(255,255,255,.3); flex: 1; }
    .copy-inline-btn { background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: rgba(255,255,255,.6); padding: 4px 12px; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all var(--t); }
    .copy-inline-btn:hover { background: rgba(255,255,255,.15); color: #fff; }
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
    .action-row { display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
    .link-btn { background: none; border: none; font-size: 13px; color: var(--c-accent); cursor: pointer; padding: 0; font-weight: 500; }
    .link-btn:hover { text-decoration: underline; }
  `]
})
export class PromptGeneratorComponent {
  private analyzer = inject(DocumentAnalyzerService);
  private promptGen = inject(PromptGeneratorService);
  private fileParser = inject(FileParserService);
  private notifications = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  history = inject(PromptHistoryService);

  readonly projectTypes = PROJECT_TYPES;

  step = signal<Step>('upload');
  inputMode = signal<InputMode>('file');
  isDragOver = signal(false);
  uploadedFiles = signal<File[]>([]);
  parsedContents = signal<string[]>([]);
  projectInfo = signal<ProjectInfo | null>(null);
  generatedPrompt = signal<GeneratedPrompt | null>(null);
  analyzeStatus = signal('Extrayendo texto...');

  pastedText = '';
  editName = '';
  editType: ProjectType = 'other';

  get currentUser() { return this.authService.user()?.username ?? 'Usuario'; }

  logout() { this.authService.logout(); }
  goToDashboard() { this.router.navigate(['/dashboard']); }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragOver.set(true); }
  onDragLeave(e: DragEvent) { e.preventDefault(); this.isDragOver.set(false); }
  onDrop(e: DragEvent) { e.preventDefault(); this.isDragOver.set(false); this.addFiles(Array.from(e.dataTransfer?.files ?? [])); }
  onFileSelected(e: Event) { this.addFiles(Array.from((e.target as HTMLInputElement).files ?? [])); }

  private addFiles(files: File[]) {
    const valid = files.filter(f => {
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
    this.analyzeStatus.set('Leyendo archivos...');
    try {
      const contents = await Promise.all(this.uploadedFiles().map(f => this.fileParser.parseFile(f)));
      const valid = contents.filter(c => c.trim().length > 20);
      if (!valid.length) { this.notifications.error('No se pudo extraer texto'); this.step.set('upload'); return; }
      this.analyzeStatus.set('Detectando requisitos y tecnologías...');
      setTimeout(() => { this.finishAnalysis(valid); }, 900);
    } catch { this.notifications.error('Error al analizar'); this.step.set('upload'); }
  }

  analyzeText() {
    const text = this.pastedText.trim();
    if (text.length < 50) { this.notifications.warning('El texto es muy corto'); return; }
    this.step.set('analyzing');
    this.analyzeStatus.set('Analizando texto...');
    setTimeout(() => { this.finishAnalysis([text]); }, 700);
  }

  private finishAnalysis(contents: string[]) {
    this.parsedContents.set(contents);
    const info = this.analyzer.analyzeDocuments(contents);
    this.projectInfo.set(info);
    this.editName = info.name;
    this.editType = info.type;
    this.step.set('analysis');
    this.notifications.success('Análisis completado');
  }

  generatePrompt() {
    if (!this.projectInfo()) return;
    const info: ProjectInfo = { ...this.projectInfo()!, name: this.editName || this.projectInfo()!.name, type: this.editType };
    const prompt = this.promptGen.generatePrompt(info, this.parsedContents());
    this.generatedPrompt.set(prompt);
    this.history.save(info.name, prompt);
    this.step.set('prompt');
    this.notifications.success('Prompt generado y guardado');
  }

  async copyPrompt() {
    if (!this.generatedPrompt()) return;
    await navigator.clipboard.writeText(this.generatedPrompt()!.content);
    this.notifications.success('Copiado al portapapeles');
  }

  downloadPrompt() {
    if (!this.generatedPrompt()) return;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([this.generatedPrompt()!.content], { type: 'text/markdown' })),
      download: `prompt-${this.editName || 'proyecto'}.md`
    });
    a.click(); URL.revokeObjectURL(a.href);
    this.notifications.success('Descargado');
  }

  reset() {
    this.step.set('upload'); this.uploadedFiles.set([]); this.parsedContents.set([]);
    this.projectInfo.set(null); this.generatedPrompt.set(null);
    this.pastedText = ''; this.editName = ''; this.editType = 'other';
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
}
