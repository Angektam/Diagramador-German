import { Component, inject, computed } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-modal-sql',
  standalone: true,
  template: `
    <div class="modal-overlay" [class.hidden]="!diagram.sqlModalOpen()" (click)="onOverlayClick($event)">
      <div class="modal modal-sql" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>SQL generado</h2>
          <button type="button" class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <textarea readonly>{{ sqlOutput() }}</textarea>
          <div class="modal-sql-actions">
            <button type="button" class="btn-primary" (click)="copySql()">Copiar al portapapeles</button>
            <button type="button" class="btn-secondary" (click)="downloadSql()">Descargar .sql</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ModalSqlComponent {
  diagram = inject(DiagramService);
  notifications = inject(NotificationService);
  sqlOutput = computed(() => this.diagram.generateSql());

  close(): void {
    this.diagram.closeSqlModal();
  }

  onOverlayClick(e: Event): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close();
  }

  copySql(): void {
    const sql = this.diagram.generateSql();
    navigator.clipboard.writeText(sql).then(
      () => this.notifications.success('SQL copiado al portapapeles'),
      () => this.notifications.error('No se pudo copiar al portapapeles')
    );
  }

  downloadSql(): void {
    const sql = this.diagram.generateSql();
    const blob = new Blob([sql], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'diagrama.sql';
    a.click();
    URL.revokeObjectURL(a.href);
    this.notifications.success('Archivo diagrama.sql descargado');
  }
}
