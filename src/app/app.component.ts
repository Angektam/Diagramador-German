import { Component } from '@angular/core';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ShapesPanelComponent } from './components/shapes-panel/shapes-panel.component';
import { CanvasComponent } from './components/canvas/canvas.component';
import { FormatPanelComponent } from './components/format-panel/format-panel.component';
import { ModalTableComponent } from './components/modal-table/modal-table.component';
import { ModalSqlComponent } from './components/modal-sql/modal-sql.component';
import { NotificationContainerComponent } from './components/notification-container/notification-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ToolbarComponent,
    ShapesPanelComponent,
    CanvasComponent,
    FormatPanelComponent,
    ModalTableComponent,
    ModalSqlComponent,
    NotificationContainerComponent
  ],
  template: `
    <app-toolbar />
    <div class="app-container">
      <app-shapes-panel />
      <app-canvas />
      <app-format-panel />
    </div>
    <app-modal-table />
    <app-modal-sql />
    <app-notification-container />
  `,
  styles: []
})
export class AppComponent {}
