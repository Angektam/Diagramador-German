import { Component } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { ShapesPanelComponent } from '../shapes-panel/shapes-panel.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { FormatPanelComponent } from '../format-panel/format-panel.component';
import { ModalTableComponent } from '../modal-table/modal-table.component';
import { ModalSqlComponent } from '../modal-sql/modal-sql.component';
import { NotificationContainerComponent } from '../notification-container/notification-container.component';

@Component({
  selector: 'app-editor',
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
export class EditorComponent {}