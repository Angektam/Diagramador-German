import { Injectable, signal, computed } from '@angular/core';
import { Layer } from '../models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class LayerService {
  private layers = signal<Layer[]>([
    {
      id: 'default',
      name: 'Capa Principal',
      visible: true,
      locked: false,
      opacity: 1,
      order: 0,
      color: '#6366f1'
    }
  ]);

  private activeLayerId = signal<string>('default');
  private shapeLayerMap = signal<Map<string, string>>(new Map());

  layersList = computed(() => [...this.layers()].sort((a, b) => b.order - a.order));
  activeLayer = computed(() => this.layers().find(l => l.id === this.activeLayerId()));
  visibleLayers = computed(() => this.layers().filter(l => l.visible));

  createLayer(name: string): Layer {
    const maxOrder = Math.max(...this.layers().map(l => l.order), -1);
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      locked: false,
      opacity: 1,
      order: maxOrder + 1,
      color: this.getRandomColor()
    };

    this.layers.update(layers => [...layers, newLayer]);
    return newLayer;
  }

  deleteLayer(layerId: string) {
    if (layerId === 'default') return;
    
    // Mover formas a capa default
    this.shapeLayerMap.update(map => {
      const newMap = new Map(map);
      for (const [shapeId, lId] of newMap.entries()) {
        if (lId === layerId) {
          newMap.set(shapeId, 'default');
        }
      }
      return newMap;
    });

    this.layers.update(layers => layers.filter(l => l.id !== layerId));
    
    if (this.activeLayerId() === layerId) {
      this.activeLayerId.set('default');
    }
  }

  updateLayer(layerId: string, updates: Partial<Layer>) {
    this.layers.update(layers =>
      layers.map(l => l.id === layerId ? { ...l, ...updates } : l)
    );
  }

  toggleLayerVisibility(layerId: string) {
    this.updateLayer(layerId, { visible: !this.getLayer(layerId)?.visible });
  }

  toggleLayerLock(layerId: string) {
    this.updateLayer(layerId, { locked: !this.getLayer(layerId)?.locked });
  }

  setActiveLayer(layerId: string) {
    this.activeLayerId.set(layerId);
  }

  assignShapeToLayer(shapeId: string, layerId: string) {
    this.shapeLayerMap.update(map => {
      const newMap = new Map(map);
      newMap.set(shapeId, layerId);
      return newMap;
    });
  }

  getShapeLayer(shapeId: string): string {
    return this.shapeLayerMap().get(shapeId) || 'default';
  }

  isShapeVisible(shapeId: string): boolean {
    const layerId = this.getShapeLayer(shapeId);
    const layer = this.getLayer(layerId);
    return layer?.visible ?? true;
  }

  isShapeLocked(shapeId: string): boolean {
    const layerId = this.getShapeLayer(shapeId);
    const layer = this.getLayer(layerId);
    return layer?.locked ?? false;
  }

  getShapeOpacity(shapeId: string): number {
    const layerId = this.getShapeLayer(shapeId);
    const layer = this.getLayer(layerId);
    return layer?.opacity ?? 1;
  }

  reorderLayer(layerId: string, newOrder: number) {
    this.updateLayer(layerId, { order: newOrder });
  }

  moveLayerUp(layerId: string) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    const layersAbove = this.layers().filter(l => l.order > layer.order);
    if (layersAbove.length === 0) return;

    const nextLayer = layersAbove.reduce((prev, curr) => 
      curr.order < prev.order ? curr : prev
    );

    const tempOrder = layer.order;
    this.updateLayer(layer.id, { order: nextLayer.order });
    this.updateLayer(nextLayer.id, { order: tempOrder });
  }

  moveLayerDown(layerId: string) {
    const layer = this.getLayer(layerId);
    if (!layer) return;

    const layersBelow = this.layers().filter(l => l.order < layer.order);
    if (layersBelow.length === 0) return;

    const prevLayer = layersBelow.reduce((prev, curr) => 
      curr.order > prev.order ? curr : prev
    );

    const tempOrder = layer.order;
    this.updateLayer(layer.id, { order: prevLayer.order });
    this.updateLayer(prevLayer.id, { order: tempOrder });
  }

  private getLayer(layerId: string): Layer | undefined {
    return this.layers().find(l => l.id === layerId);
  }

  private getRandomColor(): string {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
      '#10b981', '#06b6d4', '#ef4444', '#84cc16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  getState() {
    return {
      layers: this.layers(),
      activeLayerId: this.activeLayerId(),
      shapeLayerMap: Array.from(this.shapeLayerMap().entries())
    };
  }

  loadState(state: any) {
    if (state.layers) {
      this.layers.set(state.layers);
    }
    if (state.activeLayerId) {
      this.activeLayerId.set(state.activeLayerId);
    }
    if (state.shapeLayerMap) {
      this.shapeLayerMap.set(new Map(state.shapeLayerMap));
    }
  }
}
