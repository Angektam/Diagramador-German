// Importación del decorador Component desde el núcleo de Angular
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Importación del componente de barra de herramientas
import { ToolbarComponent } from './components/toolbar/toolbar.component';
// Importación del componente del panel de formas
import { ShapesPanelComponent } from './components/shapes-panel/shapes-panel.component';
// Importación del componente de lienzo para dibujo
import { CanvasComponent } from './components/canvas/canvas.component';
// Importación del componente del panel de formato
import { FormatPanelComponent } from './components/format-panel/format-panel.component';
// Importación del componente modal para tablas
import { ModalTableComponent } from './components/modal-table/modal-table.component';
// Importación del componente modal para SQL
import { ModalSqlComponent } from './components/modal-sql/modal-sql.component';
// Importación del componente contenedor de notificaciones
import { NotificationContainerComponent } from './components/notification-container/notification-container.component';

// Decorador que define el componente raíz de la aplicación
@Component({
  // Selector CSS para identificar el componente en el HTML
  selector: 'app-root',
  // Indica que este componente es independiente y no requiere un módulo
  standalone: true,
  // Array de componentes que se utilizan en la plantilla
  imports: [
    RouterOutlet,
    ToolbarComponent,
    ShapesPanelComponent,
    CanvasComponent,
    FormatPanelComponent,
    ModalTableComponent,
    ModalSqlComponent,
    NotificationContainerComponent
  ],
  // Plantilla HTML del componente que estructura la interfaz principal
  template: `
    <router-outlet />
  `,
  // Array de estilos CSS (actualmente vacío)
  styles: []
})
// Clase del componente principal de la aplicación
export class AppComponent {}