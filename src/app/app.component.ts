// Importación del decorador Component desde el núcleo de Angular
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KeyboardShortcutsService } from './services/keyboard-shortcuts.service';

// Decorador que define el componente raíz de la aplicación
@Component({
  // Selector CSS para identificar el componente en el HTML
  selector: 'app-root',
  // Indica que este componente es independiente y no requiere un módulo
  standalone: true,
  // Array de componentes que se utilizan en la plantilla
  imports: [RouterOutlet],
  // Plantilla HTML del componente que estructura la interfaz principal
  template: `
    <router-outlet />
  `,
  // Array de estilos CSS (actualmente vacío)
  styles: []
})
// Clase del componente principal de la aplicación
export class AppComponent {
  private keyboardShortcuts = inject(KeyboardShortcutsService);

  constructor() {
    this.keyboardShortcuts.initialize();
  }
}
