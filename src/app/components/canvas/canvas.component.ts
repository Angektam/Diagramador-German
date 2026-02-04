import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';
import { DiagramShape } from '../../models/diagram.model';

@Component({
  selector: 'app-canvas',
  standalone: true,
  template: `
    <main class="canvas-wrapper" #wrapperRef (drop)="onDrop($event)" (dragover)="onDragOver($event)" (mousedown)="onCanvasMouseDown($event)">
      <div class="canvas-container" #containerRef>
        <svg class="canvas-grid" #gridRef></svg>
        <svg class="canvas-svg" #svgRef>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="var(--stroke-color)" />
            </marker>
          </defs>
          <g id="connections-layer">
            @for (conn of diagram.connectionsList(); track conn.id) {
              <line class="connection-line" [attr.x1]="getConnX1(conn)" [attr.y1]="getConnY1(conn)"
                    [attr.x2]="getConnX2(conn)" [attr.y2]="getConnY2(conn)" marker-end="url(#arrowhead)"/>
            }
          </g>
          <g id="shapes-layer">
            @for (shape of diagram.shapesList(); track shape.id) {
              <g class="diagram-shape" [class.selected]="diagram.selectedShapeId() === shape.id"
                 [class.table-shape]="shape.type === 'table'"
                 [attr.transform]="'translate(' + shape.x + ',' + shape.y + ')'"
                 (mousedown)="onShapeMouseDown($event, shape)">
                @switch (shape.type) {
                  @case ('table') {
                    @if (shape.tableData) {
                      <rect class="table-header" [attr.width]="shape.width" [attr.height]="24" rx="2"/>
                      <text class="table-title" [attr.x]="shape.width/2" y="17" text-anchor="middle">{{ shape.tableData.name || 'Tabla' }}</text>
                      @for (row of shape.tableData.columns; track row.name; let i = $index) {
                        <rect class="table-row" [attr.y]="26 + i * 22" [attr.width]="shape.width" [attr.height]="22" rx="0"/>
                        <text class="col-text" [attr.x]="8" [attr.y]="42 + i * 22">{{ row.name }} {{ row.type }}{{ row.pk ? ' PK' : '' }}</text>
                      }
                    }
                  }
                  @case ('rect') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="4" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('rounded') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" [attr.rx]="getRoundedRx(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('diamond') {
                    <polygon [attr.points]="getDiamondPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('ellipse') {
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="shape.height/2" [attr.rx]="shape.width/2 - 2" [attr.ry]="shape.height/2 - 2" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('parallelogram') {
                    <polygon [attr.points]="getParallelogramPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('hexagon') {
                    <polygon [attr.points]="getHexagonPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('procedure') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="8" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || 'PROC' }}</text>
                  }
                  @case ('database') {
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="12" [attr.rx]="shape.width/2 - 4" [attr.ry]="8" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <path [attr.d]="getDatabasePath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="shape.height - 12" [attr.rx]="shape.width/2 - 4" [attr.ry]="8" fill="none" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('schema') {
                    <path [attr.d]="getSchemaPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || 'Schema' }}</text>
                  }
                  @case ('trigger') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="6" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || 'Trigger' }}</text>
                  }
                  @case ('view') {
                    @if (shape.tableData) {
                      <rect class="table-header" [attr.width]="shape.width" [attr.height]="24" rx="2" fill="#0d9488" stroke="#0f766e"/>
                      <text class="table-title" [attr.x]="shape.width/2" y="17" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">{{ shape.tableData.name || 'Vista' }}</text>
                      @for (row of shape.tableData.columns; track row.name; let i = $index) {
                        <rect class="table-row" [attr.y]="26 + i * 22" [attr.width]="shape.width" [attr.height]="22" rx="0"/>
                        <text class="col-text" [attr.x]="8" [attr.y]="42 + i * 22">{{ row.name }} {{ row.type }}{{ row.pk ? ' PK' : '' }}</text>
                      }
                    } @else {
                      <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="8" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                      <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || 'Vista' }}</text>
                    }
                  }
                  @default {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="4" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || shape.type }}</text>
                  }
                }
              </g>
            }
          </g>
        </svg>
      </div>
    </main>
  `,
  styles: []
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('svgRef') svgRef!: ElementRef<SVGSVGElement>;

  diagram = inject(DiagramService);
  private notifications = inject(NotificationService);
  private dragStart = { mouseX: 0, mouseY: 0, shapeX: 0, shapeY: 0 };

  ngAfterViewInit(): void {
    this.drawGrid();
  }

  private drawGrid(): void {
    const grid = this.wrapperRef?.nativeElement?.querySelector('.canvas-grid');
    if (!grid) return;
    const size = 20;
    let dots = '';
    for (let x = 0; x < 2000; x += size) {
      for (let y = 0; y < 2000; y += size) {
        dots += `<circle cx="${x}" cy="${y}" r="1" fill="var(--grid-dot)"/>`;
      }
    }
    grid.innerHTML = dots;
  }

  onCanvasMouseDown(event: MouseEvent): void {
    const target = event.target as Element;
    if (!target.closest('.diagram-shape')) {
      this.diagram.selectShape(null);
      this.diagram.clearConnectMode();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/shape');
    if (!data) return;
    const { shape, table } = JSON.parse(data);
    const wrapper = this.wrapperRef.nativeElement;
    const rect = wrapper.getBoundingClientRect();
    const w = shape === 'table' || shape === 'view' ? 180 : 120;
    const h = shape === 'table' || shape === 'view' ? 70 : 60;
    const dropX = event.clientX - rect.left + wrapper.scrollLeft - 60;
    const dropY = event.clientY - rect.top + wrapper.scrollTop - 60;
    const x = dropX - w / 2;
    const y = dropY - h / 2;

    const newShape: DiagramShape = {
      id: `shape-${Date.now()}`,
      type: shape,
      x, y,
      width: w,
      height: h,
      fill: '#ffffff',
      stroke: '#6366f1',
    };
    if (shape === 'table') {
      newShape.tableData = { name: 'Tabla', columns: [{ name: 'id', type: 'INT', pk: true }, { name: 'nombre', type: 'VARCHAR' }] };
    }
    const shapesBefore = this.diagram.shapesList();
    const lastShape = shapesBefore.length > 0 ? shapesBefore[shapesBefore.length - 1] : null;
    this.diagram.addShape(newShape);
    if (lastShape) {
      this.diagram.addConnection(lastShape.id, newShape.id);
    }
    this.diagram.selectShape(newShape.id);
  }

  onShapeMouseDown(event: MouseEvent, shape: DiagramShape): void {
    event.stopPropagation();
    if (this.diagram.connectingFromShapeId()) {
      const ok = this.diagram.connectToShape(shape.id);
      if (ok) {
        this.notifications.success('Conexión creada');
      }
      return;
    }
    this.diagram.selectShape(shape.id);
    this.dragStart = { mouseX: event.clientX, mouseY: event.clientY, shapeX: shape.x, shapeY: shape.y };

    const onMove = (e: MouseEvent) => {
      this.diagram.updateShape(shape.id, {
        x: this.dragStart.shapeX + (e.clientX - this.dragStart.mouseX),
        y: this.dragStart.shapeY + (e.clientY - this.dragStart.mouseY)
      });
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  getFill(shape: DiagramShape): string {
    return shape.fill || '#f1f5f9';
  }

  getStroke(shape: DiagramShape): string {
    return shape.stroke || '#6366f1';
  }

  getRoundedRx(shape: DiagramShape): number {
    return Math.min(16, shape.width / 6);
  }

  getDiamondPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`;
  }

  getParallelogramPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const skew = Math.min(20, w * 0.15);
    return `${skew},0 ${w},0 ${w-skew},${h} 0,${h}`;
  }

  getHexagonPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const q = w / 4;
    return `${q},0 ${w-q},0 ${w},${h/2} ${w-q},${h} ${q},${h} 0,${h/2}`;
  }

  getDatabasePath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const rx = w / 2 - 4;
    return `M ${4} 12 Q ${4} ${h/2} ${4} ${h-12} L ${w-4} ${h-12} Q ${w-4} ${h/2} ${w-4} 12 Z`;
  }

  getSchemaPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `M 0 ${h*0.35} L ${w/2} 5 L ${w} ${h*0.35} L ${w/2} ${h-5} Z`;
  }

  getConnX1(conn: { fromId: string }): number {
    const s = this.diagram.shapesList().find(x => x.id === conn.fromId);
    return s ? s.x + s.width / 2 : 0;
  }
  getConnY1(conn: { fromId: string }): number {
    const s = this.diagram.shapesList().find(x => x.id === conn.fromId);
    return s ? s.y + s.height : 0;
  }
  getConnX2(conn: { toId: string }): number {
    const s = this.diagram.shapesList().find(x => x.id === conn.toId);
    return s ? s.x + s.width / 2 : 0;
  }
  getConnY2(conn: { toId: string }): number {
    const s = this.diagram.shapesList().find(x => x.id === conn.toId);
    return s ? s.y : 0;
  }
}
