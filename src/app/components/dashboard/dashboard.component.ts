import { Component, signal, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PromptHistoryService, HistoryEntry } from '../../services/prompt-history.service';
import { NotificationService } from '../../services/notification.service';

type Section = 'projects' | 'new';

@Component({
  selector: 'app-dashboard',
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
          <button class="nav-item" [class.active]="section() === 'projects'" (click)="section.set('projects')">
            <span class="nav-icon">🗂️</span>
            <span>Mis Proyectos</span>
            @if (history.entries().length > 0) {
              <span class="nav-badge">{{ history.entries().length }}</span>
            }
          </button>
          <button class="nav-item" [class.active]="section() === 'new'" (click)="goToGenerator()">
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

      <!-- MAIN CONTENT -->
      <main class="content">

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
                  <input [(ngModel)]="searchQuery" placeholder="Buscar proyectos..." class="search-input" />
                </div>
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
            <div class="projects-grid">
              @for (entry of filteredEntries(); track entry.id) {
                <div class="project-card" [class.expanded]="expandedId() === entry.id">
                  <div class="card-header">
                    <div class="card-icon">{{ typeIcon(entry.projectType) }}</div>
                    <div class="card-info">
                      <h3 class="card-title">{{ entry.projectName }}</h3>
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
                    <button class="action-btn danger" (click)="deleteEntry(entry.id)" title="Eliminar">🗑</button>
                  </div>

                  @if (expandedId() === entry.id) {
                    <div class="card-preview">
                      <pre>{{ entry.prompt }}</pre>
                    </div>
                  }
                </div>
              }

              @if (filteredEntries().length === 0 && searchQuery) {
                <div class="no-results">
                  <p>No se encontraron proyectos para "{{ searchQuery }}"</p>
                </div>
              }
            </div>
          }
        }

      </main>
    </div>
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
  `]
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  history = inject(PromptHistoryService);

  section = signal<Section>('projects');
  expandedId = signal<string | null>(null);
  searchQuery = '';

  get currentUser() { return this.auth.user()?.username ?? 'Usuario'; }

  filteredEntries() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.history.entries();
    return this.history.entries().filter(e =>
      e.projectName.toLowerCase().includes(q) ||
      e.projectType.toLowerCase().includes(q)
    );
  }

  goToGenerator() { this.router.navigate(['/generator']); }
  logout() { this.auth.logout(); }

  toggleExpand(id: string) { this.expandedId.set(this.expandedId() === id ? null : id); }

  async copyEntry(entry: HistoryEntry) {
    await navigator.clipboard.writeText(entry.prompt);
    this.notifications.success('Copiado al portapapeles');
  }

  downloadEntry(entry: HistoryEntry) {
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([entry.prompt], { type: 'text/markdown' })),
      download: `prompt-${entry.projectName}.md`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    this.notifications.success('Descargado');
  }

  deleteEntry(id: string) {
    this.history.delete(id);
    if (this.expandedId() === id) this.expandedId.set(null);
    this.notifications.success('Proyecto eliminado');
  }

  clearAll() {
    if (confirm('¿Eliminar todos los proyectos?')) {
      this.history.clear();
      this.notifications.success('Historial limpiado');
    }
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
