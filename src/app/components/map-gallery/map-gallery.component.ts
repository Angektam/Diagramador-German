import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { DiagramService } from '../../services/diagram.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface SavedDiagram {
  id: string;
  name: string;
  date: Date;
  data: any;
  userId?: string;
}

@Component({
  selector: 'app-map-gallery',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="gallery-container">
      <!-- Header -->
      <header class="gallery-header">
        <div class="gallery-header-content">
          <div class="gallery-title">
            <h1>🗂️ Mis Diagramas</h1>
            <p>Bienvenido, {{ authService.user()?.username }}</p>
          </div>
          <div class="gallery-actions">
            <button (click)="createNew()" class="btn-primary">
              ➕ Nuevo Diagrama
            </button>
            <button (click)="logout()" class="btn-secondary logout-btn">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="gallery-content">
        
        <!-- Search and Filter -->
        <div class="gallery-controls">
          <div class="search-section">
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              placeholder="🔍 Buscar diagramas..." 
              class="search-input">
          </div>
          <div class="filter-section">
            <select [(ngModel)]="sortBy" class="filter-select">
              <option value="date">Ordenar por fecha</option>
              <option value="name">Ordenar por nombre</option>
            </select>
            <button 
              (click)="sortOrder.set(sortOrder() === 'asc' ? 'desc' : 'asc')"
              class="sort-btn"
              [title]="sortOrder() === 'asc' ? 'Orden ascendente' : 'Orden descendente'">
              {{ sortOrder() === 'asc' ? '↑' : '↓' }}
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ filteredMaps().length }}</div>
            <div class="stat-label">Diagramas totales</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ getRecentCount() }}</div>
            <div class="stat-label">Esta semana</div>
          </div>
        </div>

        <!-- Diagrams Grid -->
        <div class="diagrams-grid">
          @for (map of filteredMaps(); track map.id) {
            <div class="diagram-card" (click)="openMap(map)">
              
              <!-- Preview Area -->
              <div class="diagram-preview">
                <div class="diagram-icon">📊</div>
                <div class="shape-count">{{ getShapeCount(map.data) }} formas</div>
              </div>
              
              <!-- Info Area -->
              <div class="diagram-info">
                <div class="diagram-header">
                  <h3 class="diagram-name">{{ map.name }}</h3>
                  <div class="diagram-actions">
                    <button 
                      (click)="editName(map); $event.stopPropagation()" 
                      class="action-btn edit-btn"
                      title="Editar nombre">
                      ✏️
                    </button>
                    <button 
                      (click)="deleteMap(map); $event.stopPropagation()" 
                      class="action-btn delete-btn"
                      title="Eliminar">
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div class="diagram-date">
                  📅 {{ map.date | date:'dd/MM/yyyy HH:mm' }}
                </div>
                
                <button class="btn-primary diagram-open-btn">
                  Abrir Diagrama
                </button>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <div class="empty-icon">📊</div>
              <h3>No tienes diagramas guardados</h3>
              <p>Crea tu primer diagrama para empezar</p>
              <button (click)="createNew()" class="btn-primary">
                ➕ Crear Primer Diagrama
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Edit Name Modal -->
    @if (editingMap()) {
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h2>Editar nombre del diagrama</h2>
            <button (click)="cancelEdit()" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <label>Nombre del diagrama</label>
            <input 
              type="text" 
              [(ngModel)]="newName" 
              placeholder="Nombre del diagrama"
              class="form-input">
          </div>
          <div class="modal-footer">
            <button (click)="cancelEdit()" class="btn-secondary">
              Cancelar
            </button>
            <button (click)="saveNewName()" class="btn-primary">
              Guardar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .gallery-container {
      min-height: 100vh;
      background: var(--bg-main);
      color: var(--text-primary);
    }

    .gallery-header {
      background: linear-gradient(180deg, #141414 0%, var(--bg-toolbar) 100%);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
      padding: 1.5rem 2rem;
    }

    .gallery-header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
    }

    .gallery-title h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .gallery-title p {
      margin: 0.25rem 0 0 0;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .gallery-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .logout-btn {
      background: #1a1a1a;
      color: #ef4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #ef4444;
    }

    .gallery-content {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .gallery-controls {
      background: linear-gradient(180deg, #141414 0%, var(--bg-panel) 100%);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      margin-bottom: 2rem;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-section {
      flex: 1;
      min-width: 200px;
    }

    .search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: #1a1a1a;
      color: var(--text-primary);
      transition: all var(--transition);
    }

    .search-input::placeholder {
      color: var(--text-secondary);
    }

    .search-input:focus {
      outline: none;
      border-color: var(--accent);
      background: #0a0a0a;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    .filter-section {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .filter-select {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: #1a1a1a;
      color: var(--text-primary);
    }

    .sort-btn {
      width: 40px;
      height: 40px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: #1a1a1a;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 16px;
      transition: all var(--transition);
    }

    .sort-btn:hover {
      background: var(--accent-light);
      border-color: var(--accent);
      color: var(--accent);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
      padding: 1.5rem;
      border-radius: var(--radius-lg);
      text-align: center;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      transition: all var(--transition);
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .stat-icon {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 14px;
    }

    .diagrams-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .diagram-card {
      background: linear-gradient(180deg, #141414 0%, var(--bg-panel) 100%);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all var(--transition);
    }

    .diagram-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md);
      border-color: var(--accent);
    }

    .diagram-preview {
      padding: 2rem;
      text-align: center;
      background: linear-gradient(135deg, #1a1a1a 0%, #222 100%);
      position: relative;
      border-bottom: 1px solid var(--border-color);
    }

    .diagram-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .shape-count {
      position: absolute;
      top: 10px;
      right: 10px;
      background: var(--accent-light);
      color: var(--accent);
      padding: 4px 8px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
    }

    .diagram-info {
      padding: 1.5rem;
    }

    .diagram-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }

    .diagram-name {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text-primary);
      flex: 1;
      word-break: break-word;
      font-weight: 600;
    }

    .diagram-actions {
      display: flex;
      gap: 0.25rem;
      margin-left: 0.75rem;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      padding: 0;
      background: #1a1a1a;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 12px;
      transition: all var(--transition);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .edit-btn:hover {
      background: var(--accent-light);
      border-color: var(--accent);
    }

    .delete-btn:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #ef4444;
      color: #ef4444;
    }

    .diagram-date {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .diagram-open-btn {
      width: 100%;
      padding: 8px;
      font-size: 14px;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      background: linear-gradient(180deg, #141414 0%, var(--bg-panel) 100%);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .empty-state p {
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      font-size: 14px;
      font-family: inherit;
      background: #1a1a1a;
      color: var(--text-primary);
      transition: all var(--transition);
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent);
      background: #0a0a0a;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }

    @media (max-width: 768px) {
      .gallery-header-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .gallery-actions {
        justify-content: center;
      }

      .gallery-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-section {
        justify-content: center;
      }
    }
  `]
})
export class MapGalleryComponent {
  private router = inject(Router);
  private diagram = inject(DiagramService);
  private notifications = inject(NotificationService);
  
  authService = inject(AuthService);
  
  private savedMaps = signal<SavedDiagram[]>([]);
  searchTerm = signal('');
  sortBy = signal<'date' | 'name'>('date');
  sortOrder = signal<'asc' | 'desc'>('desc');
  
  editingMap = signal<SavedDiagram | null>(null);
  newName = '';

  readonly filteredMaps = computed(() => {
    let maps = this.savedMaps();
    
    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      maps = maps.filter(map => 
        map.name.toLowerCase().includes(term)
      );
    }
    
    // Sort
    maps.sort((a, b) => {
      let comparison = 0;
      
      if (this.sortBy() === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      
      return this.sortOrder() === 'asc' ? comparison : -comparison;
    });
    
    return maps;
  });

  constructor() {
    this.loadMaps();
  }

  loadMaps() {
    const data = localStorage.getItem('sql_diagrams_gallery');
    if (data) {
      try {
        const maps = JSON.parse(data);
        // Filter by current user if userId exists
        const currentUserId = this.authService.user()?.id;
        const userMaps = currentUserId 
          ? maps.filter((map: SavedDiagram) => !map.userId || map.userId === currentUserId)
          : maps;
        this.savedMaps.set(userMaps);
      } catch {
        this.savedMaps.set([]);
      }
    }
  }

  openMap(map: SavedDiagram) {
    this.diagram.loadDiagramJson(map.data);
    this.router.navigate(['/editor']);
  }

  createNew() {
    this.diagram.newDiagram();
    this.router.navigate(['/editor']);
  }

  logout() {
    this.authService.logout();
  }

  getRecentCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.savedMaps().filter(map => 
      new Date(map.date) > oneWeekAgo
    ).length;
  }

  getShapeCount(data: any): number {
    try {
      return data?.shapes?.length || 0;
    } catch {
      return 0;
    }
  }

  editName(map: SavedDiagram) {
    this.editingMap.set(map);
    this.newName = map.name;
  }

  cancelEdit() {
    this.editingMap.set(null);
    this.newName = '';
  }

  saveNewName() {
    const map = this.editingMap();
    if (!map || !this.newName.trim()) return;

    const allMaps = JSON.parse(localStorage.getItem('sql_diagrams_gallery') || '[]');
    const mapIndex = allMaps.findIndex((m: SavedDiagram) => m.id === map.id);
    
    if (mapIndex !== -1) {
      allMaps[mapIndex].name = this.newName.trim();
      localStorage.setItem('sql_diagrams_gallery', JSON.stringify(allMaps));
      this.loadMaps();
      this.notifications.success('Nombre actualizado');
    }
    
    this.cancelEdit();
  }

  deleteMap(map: SavedDiagram) {
    if (!confirm(`¿Estás seguro de eliminar "${map.name}"?`)) return;

    const allMaps = JSON.parse(localStorage.getItem('sql_diagrams_gallery') || '[]');
    const filteredMaps = allMaps.filter((m: SavedDiagram) => m.id !== map.id);
    
    localStorage.setItem('sql_diagrams_gallery', JSON.stringify(filteredMaps));
    this.loadMaps();
    this.notifications.success('Diagrama eliminado');
  }
}