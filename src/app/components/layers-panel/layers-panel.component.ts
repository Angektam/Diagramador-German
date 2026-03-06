import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayerService } from '../../services/layer.service';
import { DiagramService } from '../../services/diagram.service';

@Component({
  selector: 'app-layers-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <aside class="layers-panel">
      <div class="panel-header">
        <h3>🎨 Capas</h3>
        <button class="btn-add" (click)="createNewLayer()" title="Nueva capa">
          <span>+</span>
        </button>
      </div>

      <div class="layers-list">
        @for (layer of layerService.layersList(); track layer.id) {
          <div class="layer-item" 
               [class.active]="layer.id === layerService.activeLayer()?.id"
               [class.hidden]="!layer.visible"
               (click)="selectLayer(layer.id)">
            
            <div class="layer-color" [style.background-color]="layer.color"></div>
            
            <div class="layer-info">
              @if (editingLayerId === layer.id) {
                <input 
                  type="text" 
                  class="layer-name-input"
                  [(ngModel)]="editingName"
                  (blur)="finishEditing(layer.id)"
                  (keyup.enter)="finishEditing(layer.id)"
                  (keyup.escape)="cancelEditing()"
                  (click)="$event.stopPropagation()"
                  #nameInput>
              } @else {
                <span class="layer-name" (dblclick)="startEditing(layer.id, layer.name)">
                  {{ layer.name }}
                </span>
              }
              <span class="layer-count">{{ getShapeCount(layer.id) }}</span>
            </div>

            <div class="layer-actions" (click)="$event.stopPropagation()">
              <button 
                class="btn-icon" 
                [class.active]="layer.visible"
                (click)="toggleVisibility(layer.id)"
                [title]="layer.visible ? 'Ocultar' : 'Mostrar'">
                {{ layer.visible ? '👁️' : '👁️‍🗨️' }}
              </button>
              
              <button 
                class="btn-icon" 
                [class.active]="layer.locked"
                (click)="toggleLock(layer.id)"
                [title]="layer.locked ? 'Desbloquear' : 'Bloquear'">
                {{ layer.locked ? '🔒' : '🔓' }}
              </button>

              <div class="layer-menu">
                <button class="btn-icon" (click)="toggleMenu(layer.id)">⋮</button>
                @if (openMenuId === layer.id) {
                  <div class="menu-dropdown">
                    <button (click)="duplicateLayer(layer.id)">📋 Duplicar</button>
                    <button (click)="layerService.moveLayerUp(layer.id)">⬆️ Subir</button>
                    <button (click)="layerService.moveLayerDown(layer.id)">⬇️ Bajar</button>
                    <hr>
                    <button (click)="changeOpacity(layer.id)">🎨 Opacidad</button>
                    <button (click)="mergeDown(layer.id)">🔗 Combinar abajo</button>
                    @if (layer.id !== 'default') {
                      <hr>
                      <button class="danger" (click)="deleteLayer(layer.id)">🗑️ Eliminar</button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>

      @if (showOpacitySlider) {
        <div class="opacity-slider-modal" (click)="showOpacitySlider = false">
          <div class="slider-content" (click)="$event.stopPropagation()">
            <label>Opacidad: {{ currentOpacity }}%</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              [(ngModel)]="currentOpacity"
              (input)="updateOpacity()">
            <button (click)="showOpacitySlider = false">Cerrar</button>
          </div>
        </div>
      }
    </aside>
  `,
  styles: [`
    .layers-panel {
      width: 280px;
      background: var(--bg-secondary, #f8f9fa);
      border-left: 1px solid var(--border, #dee2e6);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--border, #dee2e6);
    }

    .panel-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .btn-add {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: none;
      background: var(--accent, #6366f1);
      color: white;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-add:hover {
      background: var(--accent-dark, #4f46e5);
      transform: scale(1.05);
    }

    .layers-list {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .layer-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      margin-bottom: 4px;
      background: white;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .layer-item:hover {
      background: #f0f0f0;
    }

    .layer-item.active {
      border-color: var(--accent, #6366f1);
      background: #f0f4ff;
    }

    .layer-item.hidden {
      opacity: 0.5;
    }

    .layer-color {
      width: 4px;
      height: 40px;
      border-radius: 2px;
      flex-shrink: 0;
    }

    .layer-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .layer-name {
      font-weight: 500;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .layer-name-input {
      width: 100%;
      padding: 2px 4px;
      border: 1px solid var(--accent, #6366f1);
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }

    .layer-count {
      font-size: 12px;
      color: #6c757d;
    }

    .layer-actions {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .btn-icon {
      width: 28px;
      height: 28px;
      border: none;
      background: transparent;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      opacity: 0.6;
    }

    .btn-icon:hover {
      background: rgba(0, 0, 0, 0.05);
      opacity: 1;
    }

    .btn-icon.active {
      opacity: 1;
      background: rgba(99, 102, 241, 0.1);
    }

    .layer-menu {
      position: relative;
    }

    .menu-dropdown {
      position: absolute;
      right: 0;
      top: 100%;
      background: white;
      border: 1px solid var(--border, #dee2e6);
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      min-width: 160px;
      padding: 4px;
      margin-top: 4px;
    }

    .menu-dropdown button {
      width: 100%;
      padding: 8px 12px;
      border: none;
      background: transparent;
      text-align: left;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      transition: background 0.2s;
    }

    .menu-dropdown button:hover {
      background: #f0f0f0;
    }

    .menu-dropdown button.danger {
      color: #dc3545;
    }

    .menu-dropdown button.danger:hover {
      background: #fff0f0;
    }

    .menu-dropdown hr {
      margin: 4px 0;
      border: none;
      border-top: 1px solid var(--border, #dee2e6);
    }

    .opacity-slider-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .slider-content {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      min-width: 300px;
    }

    .slider-content label {
      display: block;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .slider-content input[type="range"] {
      width: 100%;
      margin-bottom: 16px;
    }

    .slider-content button {
      width: 100%;
      padding: 10px;
      border: none;
      background: var(--accent, #6366f1);
      color: white;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .slider-content button:hover {
      background: var(--accent-dark, #4f46e5);
    }
  `]
})
export class LayersPanelComponent {
  layerService = inject(LayerService);
  private diagramService = inject(DiagramService);

  editingLayerId: string | null = null;
  editingName = '';
  openMenuId: string | null = null;
  showOpacitySlider = false;
  currentOpacity = 100;
  currentLayerId: string | null = null;

  createNewLayer() {
    const count = this.layerService.layersList().length;
    const layer = this.layerService.createLayer(`Capa ${count + 1}`);
    this.layerService.setActiveLayer(layer.id);
  }

  selectLayer(layerId: string) {
    this.layerService.setActiveLayer(layerId);
    this.openMenuId = null;
  }

  toggleVisibility(layerId: string) {
    this.layerService.toggleLayerVisibility(layerId);
  }

  toggleLock(layerId: string) {
    this.layerService.toggleLayerLock(layerId);
  }

  startEditing(layerId: string, currentName: string) {
    this.editingLayerId = layerId;
    this.editingName = currentName;
    setTimeout(() => {
      const input = document.querySelector('.layer-name-input') as HTMLInputElement;
      input?.focus();
      input?.select();
    });
  }

  finishEditing(layerId: string) {
    if (this.editingName.trim()) {
      this.layerService.updateLayer(layerId, { name: this.editingName.trim() });
    }
    this.editingLayerId = null;
  }

  cancelEditing() {
    this.editingLayerId = null;
  }

  toggleMenu(layerId: string) {
    this.openMenuId = this.openMenuId === layerId ? null : layerId;
  }

  deleteLayer(layerId: string) {
    if (confirm('¿Eliminar esta capa? Las formas se moverán a la capa principal.')) {
      this.layerService.deleteLayer(layerId);
      this.openMenuId = null;
    }
  }

  duplicateLayer(layerId: string) {
    const layer = this.layerService.layersList().find(l => l.id === layerId);
    if (layer) {
      this.layerService.createLayer(`${layer.name} (copia)`);
    }
    this.openMenuId = null;
  }

  changeOpacity(layerId: string) {
    const layer = this.layerService.layersList().find(l => l.id === layerId);
    if (layer) {
      this.currentLayerId = layerId;
      this.currentOpacity = Math.round(layer.opacity * 100);
      this.showOpacitySlider = true;
    }
    this.openMenuId = null;
  }

  updateOpacity() {
    if (this.currentLayerId) {
      this.layerService.updateLayer(this.currentLayerId, { 
        opacity: this.currentOpacity / 100 
      });
    }
  }

  mergeDown(layerId: string) {
    alert('Funcionalidad de combinar capas próximamente');
    this.openMenuId = null;
  }

  getShapeCount(layerId: string): number {
    return this.diagramService.shapesList().filter(shape => 
      this.layerService.getShapeLayer(shape.id) === layerId
    ).length;
  }
}
