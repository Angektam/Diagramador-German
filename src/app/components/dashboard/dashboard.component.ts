import { Component, signal, inject, computed, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { PromptHistoryService, HistoryEntry, SortField } from '../../services/prompt-history.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';
import { TitleService } from '../../services/title.service';
import { formatExportJson } from '../../utils/json-formatter';
import { ShareService } from '../../services/share.service';
import { ClipboardService } from '../../services/clipboard.service';

type Section = 'projects' | 'new';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="layout">

      <!-- SIDEBAR -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-brand">
          <div class="brand-logo">📄</div>
          @if (!sidebarCollapsed()) { <span class="brand-name">PromptGen</span> }
        </div>

        <nav class="sidebar-nav">
          <button class="nav-item" [class.active]="section() === 'projects'" (click)="section.set('projects')" [title]="sidebarCollapsed() ? 'Mis Proyectos' : ''">
            <span class="nav-icon">🗂️</span>
            @if (!sidebarCollapsed()) {
              <span>Mis Proyectos</span>
              @if (history.entries().length > 0) {
                <span class="nav-badge">{{ history.entries().length }}</span>
              }
            }
          </button>
          <button class="nav-item" [class.active]="section() === 'new'" (click)="goToGenerator()" [title]="sidebarCollapsed() ? 'Nuevo Prompt' : ''">
            <span class="nav-icon">✨</span>
            @if (!sidebarCollapsed()) { <span>Nuevo Prompt</span> }
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" [class.hidden]="sidebarCollapsed()">
            <div class="user-avatar">{{ currentUser.charAt(0).toUpperCase() }}</div>
            <div class="user-details">
              <span class="user-name">{{ currentUser }}</span>
              <span class="user-role">Usuario</span>
            </div>
          </div>
          <button class="theme-btn" (click)="theme.toggle()" [title]="theme.theme() === 'dark' ? 'Modo claro' : 'Modo oscuro'">
            {{ theme.theme() === 'dark' ? '☀️' : '🌙' }}
          </button>
          <button class="theme-btn" (click)="toggleSidebar()" [title]="sidebarCollapsed() ? 'Expandir sidebar' : 'Colapsar sidebar'">
            {{ sidebarCollapsed() ? '→' : '←' }}
          </button>
          <button class="logout-btn" (click)="logout()" title="Cerrar sesión">⏻</button>
        </div>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="content">
        <!-- ONBOARDING -->
        @if (showOnboarding()) {
          <div class="onboarding-overlay" (click)="dismissOnboarding()">
            <div class="onboarding-card" (click)="$event.stopPropagation()">
              <div class="onboarding-steps">
                <div class="ob-step"><div class="ob-num">1</div><div><strong>Sube tu documentación</strong><p>PDF, DOCX, TXT o pega texto directamente</p></div></div>
                <div class="ob-step"><div class="ob-num">2</div><div><strong>Revisa el análisis</strong><p>Edita tecnologías, requisitos y tipo de proyecto</p></div></div>
                <div class="ob-step"><div class="ob-num">3</div><div><strong>Copia el prompt</strong><p>Pégalo en ChatGPT, Claude o Gemini y genera tu proyecto</p></div></div>
              </div>
              <div class="ob-actions">
                <button class="btn-primary" (click)="dismissOnboarding(); goToGenerator()">✨ Crear mi primer prompt</button>
                <button class="link-btn" (click)="dismissOnboarding()">Entendido, cerrar</button>
              </div>
            </div>
          </div>
        }

        <!-- PROJECTS SECTION -->
        @if (section() === 'projects') {
          <div class="section-header">
            <div>
              <h1>Mis Proyectos</h1>
              <p>{{ history.entries().length }} prompt(s) generado(s)</p>
            </div>
            <div class="header-actions">
              @if (history.entries().length > 0) {
                <div class="search-box">
                  <span class="search-icon">🔍</span>
                  <input [value]="searchRaw" (input)="onSearchInput($any($event.target).value)" placeholder="Buscar proyectos, tags, contenido..." class="search-input" />
                  @if (searchRaw) { <button class="search-clear" (click)="searchRaw=''; searchQuery.set('')">✕</button> }
                </div>
                <button class="btn-secondary-outline" (click)="exportAll()">📤 Exportar</button>
                <button class="btn-secondary-outline" (click)="importInput.click()">📥 Importar</button>
                <input #importInput type="file" accept=".json" style="display:none" (change)="importHistory($event)" />
                <button class="btn-danger-outline" (click)="clearAll()">🗑 Limpiar todo</button>
              }
              <button class="btn-primary" (click)="goToGenerator()">✨ Nuevo Prompt</button>
            </div>
          </div>

          @if (history.entries().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🚀</div>
              <h2>Aún no tienes proyectos</h2>
              <p>Genera tu primer prompt subiendo la documentación de tu proyecto</p>
              <button class="btn-primary" (click)="goToGenerator()">✨ Crear mi primer prompt</button>
            </div>
          } @else {
            @if (stats().total > 0) {
              <div class="stats-bar">
                <div class="stat-pill">📊 {{ stats().total }} prompts</div>
                <div class="stat-pill">📝 {{ stats().totalWords.toLocaleString('es-ES') }} palabras totales</div>
                @if (stats().topType) {
                  <div class="stat-pill">🏆 Más usado: {{ typeLabel(stats().topType!) }}</div>
                }
                <div class="stat-pill hint">Ctrl+N → nuevo prompt</div>
              </div>
            }
            <!-- Filtro por tipo -->
            @if (availableTypes().length > 1) {
              <div class="type-filter-bar">
                <button class="type-filter-btn" [class.active]="typeFilter() === ''" (click)="typeFilter.set('')">Todos</button>
                @for (t of availableTypes(); track t) {
                  <button class="type-filter-btn" [class.active]="typeFilter() === t" (click)="typeFilter.set(typeFilter() === t ? '' : t)">
                    {{ typeIcon(t) }} {{ typeLabel(t) }}
                  </button>
                }
              </div>
            }
            <!-- Búsquedas recientes -->
            @if (recentSearches().length > 0 && !searchRaw) {
              <div class="recent-searches">
                <span class="recent-label">Recientes:</span>
                @for (s of recentSearches(); track s) {
                  <button class="recent-chip" (click)="applyRecentSearch(s)">{{ s }}</button>
                }
                <button class="link-btn" (click)="clearRecentSearches()">Limpiar</button>
              </div>
            }
            <!-- Vista lista/grid toggle -->
            <div class="view-toggle">
              <button class="view-btn" [class.active]="viewMode() === 'grid'" (click)="setViewMode('grid')" title="Vista grid">⊞</button>
              <button class="view-btn" [class.active]="viewMode() === 'list'" (click)="setViewMode('list')" title="Vista lista">☰</button>
            </div>
            <!-- Sort bar -->
            <div class="sort-bar">
              <span class="sort-label">Ordenar:</span>
              @for (f of sortOptions; track f.value) {
                <button class="sort-btn" [class.active]="history.sortField() === f.value" (click)="setSort(f.value)">
                  {{ f.label }} {{ sortIcon(f.value) }}
                </button>
              }
              @if (compareReady) {
                <button class="btn-compare" (click)="compareIds.set(null)">✕ Cancelar comparación</button>
              } @else if (compareIds() && !compareIds()![1]) {
                <span class="compare-hint">Selecciona otro proyecto para comparar</span>
              }
            </div>
            <!-- Compare view -->
            @if (compareReady && compareEntries) {
              <div class="compare-view">
                <div class="compare-header">
                  <h3>Comparando prompts</h3>
                  <button class="link-btn" (click)="compareIds.set(null)">✕ Cerrar</button>
                </div>
                <div class="compare-cols">
                  @for (e of compareEntries; track e!.id) {
                    <div class="compare-col">
                      <div class="compare-col-title">{{ e!.projectName }}</div>
                      <div class="compare-col-meta">{{ e!.wordCount }} palabras · {{ typeLabel(e!.projectType) }}</div>
                      <div class="compare-pre"><pre>{{ e!.prompt }}</pre></div>
                    </div>
                  }
                </div>
              </div>
            }
            <div [class]="viewMode() === 'grid' ? 'projects-grid' : 'projects-list'">
              @if (loading()) {
                @for (i of [1,2,3,4,5,6]; track i) {
                  <div class="project-card skeleton-card">
                    <div class="sk sk-icon"></div>
                    <div class="sk-body">
                      <div class="sk sk-title"></div>
                      <div class="sk sk-meta"></div>
                    </div>
                  </div>
                }
              } @else {
              @for (entry of filteredEntries(); track entry.id) {
                <div class="project-card" [class.expanded]="expandedId() === entry.id">
                  <div class="card-header">
                    <div class="card-icon">{{ typeIcon(entry.projectType) }}</div>
                    <div class="card-info">
                      @if (renamingId() === entry.id) {
                        <div class="rename-row">
                          <input class="rename-input" [(ngModel)]="renameValue" (keyup.enter)="confirmRename(entry.id)" (keyup.escape)="renamingId.set(null)" [attr.autofocus]="null" #renameInputEl (focus)="renameInputEl.select()" />
                          <button class="action-btn" (click)="confirmRename(entry.id)">✓</button>
                          <button class="action-btn" (click)="renamingId.set(null)">✕</button>
                        </div>
                      } @else {
                        <h3 class="card-title" [innerHTML]="highlight(entry.projectName)"></h3>
                      }
                      <div class="card-meta">
                        <span class="type-badge">{{ typeLabel(entry.projectType) }}</span>
                        <span class="meta-item">📝 {{ entry.wordCount }} palabras</span>
                        <span class="meta-item">📄 {{ entry.documentCount }} docs</span>
                      </div>
                    </div>
                  </div>

                  <div class="card-date">{{ formatDate(entry.generatedAt) }}</div>

                  <div class="card-actions">
                    <button class="action-btn" (click)="toggleExpand(entry.id)" title="Ver prompt">
                      {{ expandedId() === entry.id ? '▲ Ocultar' : '▼ Ver prompt' }}
                    </button>
                    <button class="action-btn" (click)="copyEntry(entry)" title="Copiar">📋 Copiar</button>
                    <button class="action-btn" (click)="downloadEntry(entry)" title="Descargar">💾 Descargar</button>
                    <button class="action-btn" (click)="shareEntry(entry)" title="Compartir enlace">🔗</button>
                    <button class="action-btn" [class.active-compare]="isInCompare(entry.id)" (click)="toggleCompare(entry.id)" title="Comparar">⚖️</button>
                    <button class="action-btn" (click)="startRename(entry)" title="Renombrar">✏️</button>
                    <button class="action-btn" (click)="openTagEdit(entry)" title="Etiquetas">🏷️</button>
                    <button class="action-btn" (click)="duplicateEntry(entry)" title="Duplicar">⧉</button>
                    @if (entry.versions.length > 0) {
                      <button class="action-btn" (click)="toggleVersions(entry.id)" title="Versiones">🕐 {{ entry.versions.length }}</button>
                    }
                    <button class="action-btn danger" (click)="deleteEntry(entry.id)" title="Eliminar">🗑</button>
                  </div>
                  <!-- Tags display -->
                  @if (entry.tags.length > 0 && tagEditId() !== entry.id) {
                    <div class="tags-row">
                      @for (tag of entry.tags; track tag) {
                        <span class="tag-chip">{{ tag }}</span>
                      }
                    </div>
                  }
                  <!-- Tag editor -->
                  @if (tagEditId() === entry.id) {
                    <div class="tag-edit-row">
                      <input class="tag-input" [(ngModel)]="tagInput" placeholder="etiqueta1, etiqueta2..." (keyup.enter)="saveTag(entry.id)" (keyup.escape)="tagEditId.set(null)" />
                      <button class="action-btn" (click)="saveTag(entry.id)">✓</button>
                      <button class="action-btn" (click)="tagEditId.set(null)">✕</button>
                    </div>
                  }
                  <!-- Versions panel -->
                  @if (versionsId() === entry.id && entry.versions.length > 0) {
                    <div class="versions-panel">
                      <div class="versions-title">🕐 Versiones anteriores</div>
                      @for (v of entry.versions; track v.id) {
                        <div class="version-row">
                          <span class="version-date">{{ formatDate(v.generatedAt) }}</span>
                          <span class="version-words">{{ v.wordCount }} palabras</span>
                          <button class="action-btn" (click)="restoreVersion(entry.id, v.id)">↩ Restaurar</button>
                        </div>
                      }
                    </div>
                  }

                  @if (expandedId() === entry.id) {
                    <div class="card-preview">
                      <pre>{{ entry.prompt }}</pre>
                    </div>
                  }
                </div>
              }

              @if (filteredEntries().length === 0 && searchQuery()) {
                <div class="no-results">
                  <p>No se encontraron proyectos para "{{ searchQuery() }}"</p>
                </div>
              }
              } <!-- end @else skeleton -->
            </div>
          }
        }

      </main>
    </div>

    <!-- EXPORT MODAL -->
    @if (showExportModal()) {
      <div class="modal-overlay" (click)="showExportModal.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-head">
            <span>📤 Exportar proyectos</span>
            <button class="modal-close" (click)="showExportModal.set(false)">✕</button>
          </div>
          <div class="modal-body-ex">
            <div class="export-select-all">
              <label class="export-check-row">
                <input type="checkbox"
                  [checked]="allExportSelected"
                  (change)="toggleExportAll()" />
                <span>Seleccionar todos ({{ history.entries().length }})</span>
              </label>
            </div>
            <div class="export-list">
              @for (entry of history.entries(); track entry.id) {
                <label class="export-check-row">
                  <input type="checkbox"
                    [checked]="isExportSelected(entry.id)"
                    (change)="toggleExportItem(entry.id)" />
                  <span class="export-icon">{{ typeIcon(entry.projectType) }}</span>
                  <span class="export-name">{{ entry.projectName }}</span>
                  <span class="export-meta">{{ typeLabel(entry.projectType) }} · {{ entry.wordCount }} palabras</span>
                </label>
              }
            </div>
          </div>
          <div class="modal-foot">
            <span class="export-count">{{ exportSelectionSize }} seleccionado(s)</span>
            <button class="btn-secondary-outline" (click)="showExportModal.set(false)">Cancelar</button>
            <button class="btn-primary" (click)="confirmExport()" [disabled]="exportSelectionSize === 0">
              💾 Exportar .json
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex; position: fixed; inset: 0;
      font-family: 'Inter', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      --c-bg:        #f0f2f8;
      --c-surface:   #ffffff;
      --c-border:    #e2e8f0;
      --c-text:      #0f172a;
      --c-text-2:    #475569;
      --c-text-3:    #94a3b8;
      --c-accent:    #6d28d9;
      --c-accent-2:  #7c3aed;
      --c-accent-3:  #8b5cf6;
      --c-accent-bg: #f5f3ff;
      --c-accent-bd: #ddd6fe;
      --c-red:       #dc2626;
      --c-red-bg:    #fee2e2;
      --c-code-bg:   #0d1117;
      --sidebar-w:   240px;
      --t: .18s cubic-bezier(.4,0,.2,1);
    }
    /* DARK THEME */
    :host-context([data-theme="dark"]) {
      --c-bg: #0f1117; --c-surface: #1a1d27; --c-border: #2d3148;
      --c-text: #f1f5f9; --c-text-2: #94a3b8; --c-text-3: #475569;
      --c-accent-bg: rgba(109,40,217,.15); --c-accent-bd: rgba(139,92,246,.3);
      --c-red-bg: rgba(220,38,38,.15);
    }

    /* LAYOUT */
    .layout { display: flex; width: 100%; height: 100%; overflow: hidden; }

    /* SIDEBAR */
    .sidebar {
      width: var(--sidebar-w); flex-shrink: 0;
      background: #1e1b4b;
      display: flex; flex-direction: column;
      border-right: 1px solid rgba(255,255,255,.06);
    }
    .sidebar-brand {
      display: flex; align-items: center; gap: 10px;
      padding: 22px 20px 18px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .brand-logo {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3));
      border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px;
    }
    .brand-name { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -.03em; }

    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border: none; background: transparent;
      border-radius: 8px; font-size: 13.5px; font-weight: 500;
      color: rgba(255,255,255,.6); cursor: pointer; transition: all var(--t);
      text-align: left; width: 100%;
    }
    .nav-item:hover { background: rgba(255,255,255,.07); color: rgba(255,255,255,.9); }
    .nav-item.active { background: rgba(139,92,246,.25); color: #fff; font-weight: 600; }
    .nav-icon { font-size: 16px; width: 20px; text-align: center; }
    .nav-badge {
      margin-left: auto; background: var(--c-accent-3); color: #fff;
      font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px;
    }

    .sidebar-footer {
      padding: 16px; border-top: 1px solid rgba(255,255,255,.07);
      display: flex; align-items: center; gap: 10px;
    }
    .user-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
    .user-avatar {
      width: 32px; height: 32px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3));
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: #fff;
    }
    .user-details { display: flex; flex-direction: column; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { font-size: 11px; color: rgba(255,255,255,.4); }
    .logout-btn {
      background: rgba(255,255,255,.07); border: none; color: rgba(255,255,255,.5);
      width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
      font-size: 16px; display: flex; align-items: center; justify-content: center;
      transition: all var(--t); flex-shrink: 0;
    }
    .logout-btn:hover { background: var(--c-red-bg); color: var(--c-red); }

    /* CONTENT */
    .content { flex: 1; overflow-y: auto; background: var(--c-bg); padding: 36px 40px; }

    .section-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 32px; gap: 16px; flex-wrap: wrap;
    }
    .section-header h1 { font-size: 26px; font-weight: 800; color: var(--c-text); letter-spacing: -.04em; margin-bottom: 4px; }
    .section-header p { font-size: 14px; color: var(--c-text-3); }
    .header-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

    .search-box {
      display: flex; align-items: center; gap: 8px;
      background: var(--c-surface); border: 1px solid var(--c-border);
      border-radius: 8px; padding: 8px 14px;
    }
    .search-icon { font-size: 14px; color: var(--c-text-3); }
    .search-input { border: none; outline: none; font-size: 13.5px; color: var(--c-text); background: transparent; width: 180px; }

    /* EMPTY STATE */
    .empty-state { text-align: center; padding: 100px 20px; }
    .empty-icon { font-size: 72px; margin-bottom: 20px; }
    .empty-state h2 { font-size: 22px; font-weight: 700; color: var(--c-text); margin-bottom: 10px; }
    .empty-state p { font-size: 15px; color: var(--c-text-2); margin-bottom: 28px; }

    /* PROJECTS GRID */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

    .project-card {
      background: var(--c-surface); border: 1px solid var(--c-border);
      border-radius: 16px; padding: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
      transition: box-shadow var(--t), transform var(--t);
      display: flex; flex-direction: column; gap: 14px;
    }
    .project-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); }
    .project-card.expanded { box-shadow: 0 8px 24px rgba(0,0,0,.1); }

    .card-header { display: flex; gap: 14px; align-items: flex-start; }
    .card-icon {
      width: 44px; height: 44px; flex-shrink: 0;
      background: var(--c-accent-bg); border-radius: 12px;
      display: flex; align-items: center; justify-content: center; font-size: 22px;
    }
    .card-info { flex: 1; min-width: 0; }
    .card-title { font-size: 15px; font-weight: 700; color: var(--c-text); margin-bottom: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .rename-row { display: flex; gap: 6px; align-items: center; margin-bottom: 6px; }
    .rename-input { flex: 1; padding: 5px 10px; border: 1.5px solid var(--c-accent); border-radius: 6px; font-size: 14px; font-weight: 600; color: var(--c-text); background: var(--c-bg); outline: none; }
    .card-meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
    .type-badge {
      background: var(--c-accent-bg); color: var(--c-accent);
      font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px;
      border: 1px solid var(--c-accent-bd);
    }
    .meta-item { font-size: 11px; color: var(--c-text-3); }

    .card-date { font-size: 12px; color: var(--c-text-3); }

    .card-actions { display: flex; gap: 6px; flex-wrap: wrap; }
    .action-btn {
      padding: 6px 12px; border: 1px solid var(--c-border); background: var(--c-bg);
      border-radius: 6px; font-size: 12px; font-weight: 500; color: var(--c-text-2);
      cursor: pointer; transition: all var(--t);
    }
    .action-btn:hover { border-color: var(--c-accent-bd); color: var(--c-accent); background: var(--c-accent-bg); }
    .action-btn.danger:hover { border-color: var(--c-red); color: var(--c-red); background: var(--c-red-bg); }

    .card-preview {
      background: var(--c-code-bg); border-radius: 10px;
      padding: 16px 18px; max-height: 320px; overflow-y: auto;
    }
    .card-preview::-webkit-scrollbar { width: 5px; }
    .card-preview::-webkit-scrollbar-thumb { background: rgba(255,255,255,.15); border-radius: 3px; }
    .card-preview pre {
      color: #cdd9e5; font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px; line-height: 1.65; white-space: pre-wrap; word-wrap: break-word; margin: 0;
    }

    .no-results { grid-column: 1/-1; text-align: center; padding: 60px; color: var(--c-text-3); font-size: 14px; }

    /* BUTTONS */
    .btn-primary {
      padding: 10px 20px;
      background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3));
      color: #fff; border: none; border-radius: 8px;
      font-size: 13.5px; font-weight: 600; cursor: pointer;
      box-shadow: 0 2px 8px rgba(109,40,217,.3); transition: all var(--t);
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(109,40,217,.4); }
    .btn-danger-outline {
      padding: 10px 16px; background: transparent;
      border: 1px solid var(--c-border); border-radius: 8px;
      font-size: 13px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t);
    }
    .btn-danger-outline:hover { border-color: var(--c-red); color: var(--c-red); background: var(--c-red-bg); }
    .btn-secondary-outline {
      padding: 10px 16px; background: transparent;
      border: 1px solid var(--c-border); border-radius: 8px;
      font-size: 13px; font-weight: 500; color: var(--c-text-2); cursor: pointer; transition: all var(--t);
    }
    .btn-secondary-outline:hover { border-color: var(--c-accent-bd); color: var(--c-accent); background: var(--c-accent-bg); }
    /* Stats bar */
    .stats-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .stat-pill { padding: 5px 12px; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 20px; font-size: 12px; color: var(--c-text-2); }
    .stat-pill.hint { color: var(--c-text-3); font-style: italic; }
    /* Theme button */
    .theme-btn { background: rgba(255,255,255,.07); border: none; color: rgba(255,255,255,.7); width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all var(--t); flex-shrink: 0; }
    .theme-btn:hover { background: rgba(255,255,255,.15); }
    /* Sort bar */
    .sort-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .sort-label { font-size: 12px; color: var(--c-text-3); }
    .sort-btn { padding: 4px 12px; border: 1px solid var(--c-border); background: var(--c-surface); border-radius: 20px; font-size: 12px; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .sort-btn:hover, .sort-btn.active { border-color: var(--c-accent-bd); color: var(--c-accent); background: var(--c-accent-bg); }
    .btn-compare { padding: 4px 12px; border: 1px solid var(--c-accent-bd); background: var(--c-accent-bg); border-radius: 20px; font-size: 12px; color: var(--c-accent); cursor: pointer; margin-left: auto; }
    .compare-hint { font-size: 12px; color: var(--c-amber); margin-left: auto; }
    /* Compare view */
    .compare-view { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
    .compare-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .compare-header h3 { font-size: 15px; font-weight: 700; color: var(--c-text); }
    .compare-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .compare-col { display: flex; flex-direction: column; gap: 6px; }
    .compare-col-title { font-size: 14px; font-weight: 700; color: var(--c-text); }
    .compare-col-meta { font-size: 12px; color: var(--c-text-3); }
    .compare-pre { background: var(--c-code-bg); border-radius: 8px; padding: 12px; max-height: 300px; overflow-y: auto; }
    .compare-pre pre { color: #cdd9e5; font-family: 'JetBrains Mono', monospace; font-size: 11px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; margin: 0; }
    /* Tags */
    .tags-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag-chip { padding: 2px 10px; background: rgba(109,40,217,.12); border: 1px solid var(--c-accent-bd); border-radius: 20px; font-size: 11px; color: var(--c-accent); font-weight: 600; }
    .tag-edit-row { display: flex; gap: 6px; align-items: center; }
    .tag-input { flex: 1; padding: 5px 10px; border: 1.5px solid var(--c-accent); border-radius: 6px; font-size: 13px; color: var(--c-text); background: var(--c-bg); outline: none; }
    .active-compare { border-color: var(--c-accent) !important; color: var(--c-accent) !important; background: var(--c-accent-bg) !important; }
    /* Versions */
    .versions-panel { background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
    .versions-title { font-size: 12px; font-weight: 700; color: var(--c-text-3); text-transform: uppercase; letter-spacing: .05em; }
    .version-row { display: flex; align-items: center; gap: 10px; font-size: 12px; }
    .version-date { color: var(--c-text-2); flex: 1; }
    .version-words { color: var(--c-text-3); }
    /* Onboarding */
    .onboarding-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); backdrop-filter: blur(4px); z-index: 100; display: flex; align-items: center; justify-content: center; }
    .onboarding-card { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 20px; padding: 32px; max-width: 480px; width: 90%; box-shadow: 0 24px 48px rgba(0,0,0,.2); }
    .onboarding-card h2 { font-size: 22px; font-weight: 800; color: var(--c-text); margin-bottom: 24px; text-align: center; }
    .onboarding-steps { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
    .ob-step { display: flex; gap: 14px; align-items: flex-start; }
    .ob-num { width: 32px; height: 32px; flex-shrink: 0; background: linear-gradient(135deg, var(--c-accent), var(--c-accent-3)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: #fff; }
    .ob-step strong { font-size: 14px; font-weight: 700; color: var(--c-text); display: block; margin-bottom: 2px; }
    .ob-step p { font-size: 13px; color: var(--c-text-2); margin: 0; }
    .ob-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; }
    /* Skeleton */
    .skeleton-card { pointer-events: none; display: flex; gap: 14px; align-items: flex-start; }
    .sk { background: linear-gradient(90deg, var(--c-border) 25%, var(--c-bg) 50%, var(--c-border) 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
    .sk-icon { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; }
    .sk-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .sk-title { height: 16px; width: 60%; }
    .sk-meta { height: 12px; width: 40%; }
    /* Highlight */
    .hl { background: #fef08a; color: #713f12; border-radius: 2px; padding: 0 2px; }
    /* Search clear */
    .search-clear { background: none; border: none; color: var(--c-text-3); cursor: pointer; font-size: 14px; padding: 0 4px; }
    .search-clear:hover { color: var(--c-red); }
    /* Sidebar collapsed */
    .sidebar.collapsed { width: 60px; }
    .sidebar.collapsed .brand-name, .sidebar.collapsed .user-details, .sidebar.collapsed .nav-badge { display: none; }
    .sidebar.collapsed .sidebar-brand { justify-content: center; padding: 16px 0; }
    .sidebar.collapsed .nav-item { justify-content: center; padding: 10px 0; }
    .sidebar.collapsed .sidebar-footer { flex-wrap: wrap; justify-content: center; gap: 6px; }
    .user-info.hidden .user-details { display: none; }
    /* Type filter */
    .type-filter-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .type-filter-btn { padding: 4px 12px; border: 1px solid var(--c-border); background: var(--c-surface); border-radius: 20px; font-size: 12px; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .type-filter-btn:hover, .type-filter-btn.active { border-color: var(--c-accent); color: var(--c-accent); background: var(--c-accent-bg); font-weight: 600; }
    /* Recent searches */
    .recent-searches { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
    .recent-label { font-size: 11px; color: var(--c-text-3); font-weight: 600; }
    .recent-chip { padding: 3px 10px; background: var(--c-bg); border: 1px solid var(--c-border); border-radius: 20px; font-size: 11px; color: var(--c-text-2); cursor: pointer; transition: all var(--t); }
    .recent-chip:hover { border-color: var(--c-accent-bd); color: var(--c-accent); }
    /* View toggle */
    .view-toggle { display: flex; gap: 4px; margin-left: auto; }
    .view-btn { width: 32px; height: 32px; border: 1px solid var(--c-border); background: var(--c-surface); border-radius: 6px; font-size: 16px; cursor: pointer; transition: all var(--t); color: var(--c-text-3); display: flex; align-items: center; justify-content: center; }
    .view-btn.active { border-color: var(--c-accent); color: var(--c-accent); background: var(--c-accent-bg); }
    /* List view */
    .projects-list { display: flex; flex-direction: column; gap: 8px; }
    .projects-list .project-card { flex-direction: row; align-items: center; padding: 12px 16px; gap: 12px; }
    .projects-list .card-header { flex: 1; margin: 0; }
    .projects-list .card-date { font-size: 11px; flex-shrink: 0; }
    .projects-list .card-actions { flex-shrink: 0; flex-wrap: nowrap; }
    .projects-list .card-preview, .projects-list .tags-row, .projects-list .versions-panel, .projects-list .tag-edit-row { display: none; }
    /* Export modal */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); z-index: 300; display: flex; align-items: center; justify-content: center; }
    .modal-box { background: var(--c-surface); border: 1px solid var(--c-border); border-radius: 18px; width: 480px; max-width: 95vw; max-height: 80vh; display: flex; flex-direction: column; box-shadow: 0 24px 48px rgba(0,0,0,.2); }
    .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 18px 22px; border-bottom: 1px solid var(--c-border); font-size: 15px; font-weight: 700; color: var(--c-text); }
    .modal-close { background: none; border: none; font-size: 18px; color: var(--c-text-3); cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .modal-close:hover { background: var(--c-red-bg); color: var(--c-red); }
    .modal-body-ex { flex: 1; overflow-y: auto; padding: 16px 22px; display: flex; flex-direction: column; gap: 8px; }
    .export-select-all { padding-bottom: 10px; border-bottom: 1px solid var(--c-border); }
    .export-list { display: flex; flex-direction: column; gap: 6px; }
    .export-check-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; cursor: pointer; transition: background var(--t); }
    .export-check-row:hover { background: var(--c-accent-bg); }
    .export-check-row input[type="checkbox"] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--c-accent); flex-shrink: 0; }
    .export-icon { font-size: 16px; flex-shrink: 0; }
    .export-name { flex: 1; font-size: 13px; font-weight: 600; color: var(--c-text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .export-meta { font-size: 11px; color: var(--c-text-3); flex-shrink: 0; }
    .modal-foot { display: flex; align-items: center; gap: 10px; padding: 16px 22px; border-top: 1px solid var(--c-border); }
    .export-count { font-size: 13px; color: var(--c-text-3); flex: 1; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  readonly theme = inject(ThemeService);
  private titleSvc = inject(TitleService);
  private shareService = inject(ShareService);
  private clipboard = inject(ClipboardService);
  history = inject(PromptHistoryService);

  section = signal<Section>('projects');
  expandedId = signal<string | null>(null);
  searchQuery = signal('');
  searchRaw = '';
  private searchDebounce: any = null;
  loading = signal(true);
  renamingId = signal<string | null>(null);
  renameValue = '';
  tagEditId = signal<string | null>(null);
  tagInput = '';
  versionsId = signal<string | null>(null);
  showOnboarding = signal(!localStorage.getItem('pg_onboarding_done'));
  compareIds = signal<[string, string] | null>(null);
  showExportModal = signal(false);
  exportSelection = signal<Set<string>>(new Set());
  viewMode = signal<'grid' | 'list'>((localStorage.getItem('pg_view_mode') as 'grid' | 'list') ?? 'grid');
  sidebarCollapsed = signal(localStorage.getItem('pg_sidebar_collapsed') === '1');
  typeFilter = signal<string>('');
  recentSearches = signal<string[]>(JSON.parse(localStorage.getItem('pg_recent_searches') ?? '[]'));

  get allExportSelected(): boolean {
    const entries = this.history.entries();
    return entries.length > 0 && entries.every(e => this.exportSelection().has(e.id));
  }

  get exportSelectionSize(): number {
    return this.exportSelection().size;
  }

  isExportSelected(id: string): boolean {
    return this.exportSelection().has(id);
  }

  readonly sortOptions: { value: SortField; label: string }[] = [
    { value: 'date',  label: 'Fecha' },
    { value: 'name',  label: 'Nombre' },
    { value: 'type',  label: 'Tipo' },
    { value: 'words', label: 'Palabras' },
  ];

  get currentUser() { return this.auth.user()?.username ?? 'Usuario'; }

  filteredEntries = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const tf = this.typeFilter();
    const sorted = this.history.sorted();
    return sorted.filter(e => {
      const matchesType = !tf || e.projectType === tf;
      const matchesQuery = !q || e.projectName.toLowerCase().includes(q) ||
        e.projectType.toLowerCase().includes(q) ||
        e.prompt.toLowerCase().includes(q) ||
        (e.tags ?? []).some(t => t.toLowerCase().includes(q));
      return matchesType && matchesQuery;
    });
  });

  availableTypes = computed(() => {
    const types = new Set(this.history.entries().map(e => e.projectType));
    return Array.from(types);
  });

  stats = computed(() => {
    const entries = this.history.entries();
    const totalWords = entries.reduce((s, e) => s + e.wordCount, 0);
    const typeCounts = entries.reduce((acc, e) => {
      acc[e.projectType] = (acc[e.projectType] ?? 0) + 1; return acc;
    }, {} as Record<string, number>);
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return { totalWords, topType, total: entries.length };
  });

  ngOnInit() {
    this.titleSvc.set('Dashboard');
    // Simulate brief loading for skeleton effect
    setTimeout(() => this.loading.set(false), 400);
  }
  ngOnDestroy() { this.titleSvc.reset(); }

  onSearchInput(value: string) {
    this.searchRaw = value;
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => {
      this.searchQuery.set(value);
      if (value.trim()) this.addRecentSearch(value.trim());
    }, 200);
  }

  addRecentSearch(q: string) {
    const current = this.recentSearches().filter(s => s !== q);
    const updated = [q, ...current].slice(0, 5);
    this.recentSearches.set(updated);
    localStorage.setItem('pg_recent_searches', JSON.stringify(updated));
  }

  applyRecentSearch(q: string) {
    this.searchRaw = q;
    this.searchQuery.set(q);
  }

  clearRecentSearches() {
    this.recentSearches.set([]);
    localStorage.removeItem('pg_recent_searches');
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
    localStorage.setItem('pg_view_mode', mode);
  }

  toggleSidebar() {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem('pg_sidebar_collapsed', next ? '1' : '0');
  }

  duplicateEntry(entry: HistoryEntry) {
    const clone = {
      ...entry,
      id: Date.now().toString(),
      projectName: `${entry.projectName} (copia)`,
      generatedAt: new Date(),
      versions: [],
      tags: [...entry.tags]
    };
    const current = this.history.entries();
    const updated = [clone, ...current].slice(0, 50);
    this.history.entries.set(updated);
    localStorage.setItem('prompt_history', JSON.stringify(updated));
    this.notifications.success('Proyecto duplicado');
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); this.goToGenerator(); }
  }

  goToGenerator() { this.router.navigate(['/generator']); }
  logout() { this.auth.logout(); }

  toggleExpand(id: string) { this.expandedId.set(this.expandedId() === id ? null : id); }

  async copyEntry(entry: HistoryEntry) {
    await this.clipboard.copyText(entry.prompt);
  }

  downloadEntry(entry: HistoryEntry) {
    const blob = new Blob([entry.prompt], { type: 'text/markdown;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `prompt-${entry.projectName.replace(/\s+/g, '-')}.md`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    this.notifications.success('Descargado como .md');
  }

  deleteEntry(id: string) {
    this.history.delete(id);
    if (this.expandedId() === id) this.expandedId.set(null);
    if (this.renamingId() === id) this.renamingId.set(null);
    if (this.versionsId() === id) this.versionsId.set(null);
    this.notifications.success('Proyecto eliminado');
  }

  startRename(entry: HistoryEntry) {
    this.renamingId.set(entry.id);
    this.renameValue = entry.projectName;
    // Focus after Angular renders the input
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('.rename-input');
      el?.focus(); el?.select();
    }, 50);
  }

  confirmRename(id: string) {
    const name = this.renameValue.trim();
    if (name) { this.history.rename(id, name); this.notifications.success('Renombrado'); }
    this.renamingId.set(null);
  }

  // Tags
  openTagEdit(entry: HistoryEntry) {
    this.tagEditId.set(entry.id);
    this.tagInput = (entry.tags ?? []).join(', ');
  }
  saveTag(id: string) {
    const tags = this.tagInput.split(',').map(t => t.trim()).filter(Boolean);
    this.history.setTags(id, tags);
    this.tagEditId.set(null);
    this.notifications.success('Etiquetas guardadas');
  }

  // Versiones
  toggleVersions(id: string) { this.versionsId.set(this.versionsId() === id ? null : id); }
  restoreVersion(entryId: string, versionId: string) {
    this.history.restoreVersion(entryId, versionId);
    this.versionsId.set(null);
    this.notifications.success('Versión restaurada');
  }

  // Compartir por URL
  async shareEntry(entry: HistoryEntry) {
    try {
      const id = await this.shareService.create(entry.prompt);
      const url = `${window.location.origin}/share/${id}`;
      await this.clipboard.copyText(url, 'Enlace copiado al portapapeles');
    } catch { this.notifications.error('No se pudo generar el enlace'); }
  }

  // Comparar
  toggleCompare(id: string) {
    const cur = this.compareIds();
    if (!cur) { this.compareIds.set([id, '']); return; }
    if (cur[0] === id) { this.compareIds.set(null); return; }
    if (!cur[1]) { this.compareIds.set([cur[0], id]); return; }
    this.compareIds.set([id, '']);
  }
  isInCompare(id: string) { const c = this.compareIds(); return c ? c.includes(id) : false; }
  get compareReady() { const c = this.compareIds(); return c && c[0] && c[1]; }
  get compareEntries() {
    const c = this.compareIds();
    if (!c || !c[1]) return null;
    return [this.history.entries().find(e => e.id === c[0]), this.history.entries().find(e => e.id === c[1])];
  }

  // Ordenamiento
  setSort(field: SortField) {
    if (this.history.sortField() === field) {
      this.history.sortDir.set(this.history.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.history.sortField.set(field);
      this.history.sortDir.set('desc');
    }
  }
  sortIcon(field: SortField) {
    if (this.history.sortField() !== field) return '↕';
    return this.history.sortDir() === 'asc' ? '↑' : '↓';
  }

  dismissOnboarding() {
    localStorage.setItem('pg_onboarding_done', '1');
    this.showOnboarding.set(false);
  }

  highlight(text: string): SafeHtml {
    const q = this.searchQuery().trim();
    if (!q) return this.sanitizer.bypassSecurityTrustHtml(text);
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlighted = text.replace(new RegExp(escaped, 'gi'), m => `<mark class="hl">${m}</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  clearAll() {
    if (confirm('¿Eliminar todos los proyectos? Esta acción no se puede deshacer.')) {
      this.history.clear();
      this.expandedId.set(null);
      this.notifications.success('Historial limpiado');
    }
  }

  exportAll() {
    // Abrir modal de selección
    this.exportSelection.set(new Set(this.history.entries().map(e => e.id)));
    this.showExportModal.set(true);
  }

  toggleExportItem(id: string) {
    const s = new Set(this.exportSelection());
    s.has(id) ? s.delete(id) : s.add(id);
    this.exportSelection.set(s);
  }

  toggleExportAll() {
    const all = this.history.entries().map(e => e.id);
    const allSelected = all.every(id => this.exportSelection().has(id));
    this.exportSelection.set(allSelected ? new Set() : new Set(all));
  }

  confirmExport() {
    const ids = this.exportSelection();
    const entries = this.history.entries().filter(e => ids.has(e.id));
    if (!entries.length) { this.notifications.warning('Selecciona al menos un proyecto'); return; }
    const json = formatExportJson(entries);
    const blob = new Blob([json], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `promptgen-${new Date().toISOString().slice(0,10)}.json`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    this.showExportModal.set(false);
    this.notifications.success(`${entries.length} proyecto(s) exportado(s)`);
  }

  importHistory(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = e.target?.result as string;
      const result = this.history.import(raw);
      if (result.imported > 0) {
        this.notifications.success(`${result.imported} proyecto(s) importado(s)${result.skipped > 0 ? `, ${result.skipped} omitido(s) (duplicados)` : ''}`);
      } else {
        this.notifications.error('No se pudo importar. Verifica que el archivo sea válido.');
      }
      (event.target as HTMLInputElement).value = '';
    };
    reader.readAsText(file);
  }

  typeLabel(type: string): string {
    const map: Record<string, string> = {
      'web-app': 'Web App', 'api': 'API REST', 'mobile-app': 'Mobile',
      'desktop-app': 'Desktop', 'microservices': 'Microservicios',
      'cms': 'CMS', 'ecommerce': 'E-commerce', 'dashboard': 'Dashboard', 'other': 'Otro'
    };
    return map[type] ?? type;
  }

  typeIcon(type: string): string {
    const map: Record<string, string> = {
      'web-app': '🌐', 'api': '⚡', 'mobile-app': '📱', 'desktop-app': '🖥️',
      'microservices': '🔧', 'cms': '📝', 'ecommerce': '🛒', 'dashboard': '📊', 'other': '📦'
    };
    return map[type] ?? '📦';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
