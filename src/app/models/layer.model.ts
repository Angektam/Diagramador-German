export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  order: number;
  color?: string;
}

export interface LayerState {
  layers: Layer[];
  activeLayerId: string;
}
