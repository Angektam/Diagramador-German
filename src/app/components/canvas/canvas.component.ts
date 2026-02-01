import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { DiagramShape } from '../../models/diagram.model';

@Component({
  selector: 'app-canvas',
  standalone: true,
  template: `
    <main class="canvas-wrapper" #wrapperRef (drop)="onDrop($event)" (dragover)="onDragOver($event)">
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
    this.diagram.addShape(newShape);
    this.diagram.selectShape(newShape.id);
  }

  onShapeMouseDown(event: MouseEvent, shape: DiagramShape): void {
    event.stopPropagation();
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
