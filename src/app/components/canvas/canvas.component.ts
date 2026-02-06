import { Component, ElementRef, ViewChild, AfterViewInit, inject, HostListener, signal } from '@angular/core';
import { DiagramService } from '../../services/diagram.service';
import { NotificationService } from '../../services/notification.service';
import { DiagramShape } from '../../models/diagram.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="canvas-wrapper" #wrapperRef (drop)="onDrop($event)" (dragover)="onDragOver($event)" (mousedown)="onCanvasMouseDown($event)" (wheel)="onWheel($event)">
      <div class="canvas-container" #containerRef [style.transform]="'scale(' + diagram.zoomLevel() / 100 + ')'" [style.transform-origin]="'0 0'">
        <svg class="canvas-grid" #gridRef viewBox="0 0 10000 10000"></svg>
        <svg class="canvas-svg" #svgRef viewBox="0 0 10000 10000">
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
              <g class="diagram-shape" [class.selected]="diagram.selectedShapeIds().includes(shape.id)"
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
                  @case ('trapezoid') {
                    <polygon [attr.points]="getTrapezoidPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('triangle') {
                    <polygon [attr.points]="getTrianglePoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('pentagon') {
                    <polygon [attr.points]="getPentagonPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('star') {
                    <polygon [attr.points]="getStarPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('cylinder') {
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="12" [attr.rx]="shape.width/2 - 4" [attr.ry]="8" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <rect [attr.x]="4" [attr.y]="12" [attr.width]="shape.width - 8" [attr.height]="shape.height - 24" [attr.fill]="getFill(shape)" stroke="none"/>
                    <line [attr.x1]="4" [attr.y1]="12" [attr.x2]="4" [attr.y2]="shape.height - 12" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <line [attr.x1]="shape.width - 4" [attr.y1]="12" [attr.x2]="shape.width - 4" [attr.y2]="shape.height - 12" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="shape.height - 12" [attr.rx]="shape.width/2 - 4" [attr.ry]="8" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('document') {
                    <path [attr.d]="getDocumentPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.4" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('cloud') {
                    <path [attr.d]="getCloudPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('arrow-right') {
                    <polygon [attr.points]="getArrowRightPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width * 0.4" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('arrow-left') {
                    <polygon [attr.points]="getArrowLeftPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width * 0.6" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('square') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.width" rx="4" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.width/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('circle') {
                    <circle [attr.cx]="shape.width/2" [attr.cy]="shape.width/2" [attr.r]="shape.width/2 - 2" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.width/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('octagon') {
                    <polygon [attr.points]="getOctagonPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('cross') {
                    <polygon [attr.points]="getCrossPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('plus') {
                    <path [attr.d]="getPlusPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('multi-document') {
                    <path [attr.d]="getMultiDocumentPath1(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <path [attr.d]="getMultiDocumentPath2(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.35" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('callout') {
                    <path [attr.d]="getCalloutPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.4" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('note') {
                    <path [attr.d]="getNotePath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('card') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" rx="6" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <line [attr.x1]="0" [attr.y1]="shape.height * 0.25" [attr.x2]="shape.width" [attr.y2]="shape.height * 0.25" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('tape') {
                    <path [attr.d]="getTapePath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('display') {
                    <path [attr.d]="getDisplayPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('manual-input') {
                    <polygon [attr.points]="getManualInputPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('manual-operation') {
                    <polygon [attr.points]="getManualOperationPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('delay') {
                    <path [attr.d]="getDelayPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width * 0.4" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('stored-data') {
                    <path [attr.d]="getStoredDataPath(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('internal-storage') {
                    <rect [attr.width]="shape.width" [attr.height]="shape.height" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <line [attr.x1]="shape.width * 0.2" [attr.y1]="0" [attr.x2]="shape.width * 0.2" [attr.y2]="shape.height" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <line [attr.x1]="0" [attr.y1]="shape.height * 0.2" [attr.x2]="shape.width" [attr.y2]="shape.height * 0.2" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <text [attr.x]="shape.width * 0.6" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('sequential-data') {
                    <ellipse [attr.cx]="shape.width/2" [attr.cy]="shape.height/2" [attr.rx]="shape.width/2 - 2" [attr.ry]="shape.height/2 - 2" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('direct-data') {
                    <polygon [attr.points]="getDirectDataPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('summing-junction') {
                    <circle [attr.cx]="shape.width/2" [attr.cy]="shape.height/2" [attr.r]="getMinRadius(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <line [attr.x1]="shape.width * 0.15" [attr.y1]="shape.height/2" [attr.x2]="shape.width * 0.85" [attr.y2]="shape.height/2" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                    <line [attr.x1]="shape.width/2" [attr.y1]="shape.height * 0.15" [attr.x2]="shape.width/2" [attr.y2]="shape.height * 0.85" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                  }
                  @case ('or') {
                    <circle [attr.cx]="shape.width/2" [attr.cy]="shape.height/2" [attr.r]="getMinRadius(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <line [attr.x1]="shape.width * 0.15" [attr.y1]="shape.height/2" [attr.x2]="shape.width * 0.85" [attr.y2]="shape.height/2" [attr.stroke]="getStroke(shape)" stroke-width="2"/>
                  }
                  @case ('collate') {
                    <polygon [attr.points]="getCollatePoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                  }
                  @case ('sort') {
                    <polygon [attr.points]="getSortPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                  }
                  @case ('extract') {
                    <polygon [attr.points]="getExtractPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('merge') {
                    <polygon [attr.points]="getMergePoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.4" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('off-page') {
                    <polygon [attr.points]="getOffPagePoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.4" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('on-page') {
                    <circle [attr.cx]="shape.width/2" [attr.cy]="shape.height/2" [attr.r]="getMinRadius(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('arrow-up') {
                    <polygon [attr.points]="getArrowUpPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.6" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('arrow-down') {
                    <polygon [attr.points]="getArrowDownPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width/2" [attr.y]="shape.height * 0.4" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('chevron-right') {
                    <polygon [attr.points]="getChevronRightPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width * 0.4" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
                  }
                  @case ('chevron-left') {
                    <polygon [attr.points]="getChevronLeftPoints(shape)" [attr.fill]="getFill(shape)" [attr.stroke]="getStroke(shape)"/>
                    <text [attr.x]="shape.width * 0.6" [attr.y]="shape.height/2" text-anchor="middle" dy=".35em">{{ shape.text || '' }}</text>
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
        
        <!-- Guías de alineación -->
        @if (alignmentGuides().horizontal !== null) {
          <div class="alignment-guide horizontal" [style.top.px]="alignmentGuides().horizontal"></div>
        }
        @if (alignmentGuides().vertical !== null) {
          <div class="alignment-guide vertical" [style.left.px]="alignmentGuides().vertical"></div>
        }
      </div>
      
      <!-- Mini-mapa -->
      <div class="minimap" #minimapRef (mousedown)="onMinimapMouseDown($event)">
        <svg class="minimap-svg" [attr.viewBox]="getMinimapViewBox()">
          <!-- Viewport rectangle -->
          <rect 
            class="minimap-viewport" 
            [attr.x]="minimapViewport().x" 
            [attr.y]="minimapViewport().y" 
            [attr.width]="minimapViewport().width" 
            [attr.height]="minimapViewport().height" 
            fill="rgba(99, 102, 241, 0.2)" 
            stroke="var(--accent)" 
            stroke-width="8"/>
          
          <!-- Shapes -->
          @for (shape of diagram.shapesList(); track shape.id) {
            <rect 
              [attr.x]="shape.x" 
              [attr.y]="shape.y" 
              [attr.width]="shape.width" 
              [attr.height]="shape.height" 
              [attr.fill]="diagram.selectedShapeIds().includes(shape.id) ? 'var(--accent)' : '#64748b'" 
              opacity="0.7"/>
          }
        </svg>
      </div>
    </main>
  `,
  styles: [`
    .alignment-guide {
      position: absolute;
      background: var(--accent);
      opacity: 0.6;
      pointer-events: none;
      z-index: 1000;
    }
    
    .alignment-guide.horizontal {
      left: 0;
      right: 0;
      height: 1px;
    }
    
    .alignment-guide.vertical {
      top: 0;
      bottom: 0;
      width: 1px;
    }
    
    .minimap {
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 200px;
      height: 150px;
      background: rgba(17, 17, 17, 0.95);
      border: 2px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      z-index: 100;
      backdrop-filter: blur(8px);
    }
    
    .minimap-svg {
      width: 100%;
      height: 100%;
    }
    
    .minimap-viewport {
      cursor: move;
    }
  `]
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('wrapperRef') wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('containerRef') containerRef!: ElementRef<HTMLElement>;
  @ViewChild('svgRef') svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('minimapRef') minimapRef!: ElementRef<HTMLElement>;

  diagram = inject(DiagramService);
  private notifications = inject(NotificationService);
  private dragStart = { mouseX: 0, mouseY: 0, shapeX: 0, shapeY: 0 };
  
  // Snap to grid
  private readonly GRID_SIZE = 20;
  private snapToGrid = true;
  
  // Alignment guides
  alignmentGuides = signal<{ horizontal: number | null; vertical: number | null }>({ 
    horizontal: null, 
    vertical: null 
  });
  
  // Minimap viewport
  minimapViewport = signal({ x: 0, y: 0, width: 400, height: 300 });

  ngAfterViewInit(): void {
    this.drawGrid();
    this.updateMinimapViewport();
    
    // Centrar el canvas al inicio
    const wrapper = this.wrapperRef.nativeElement;
    wrapper.scrollLeft = 500; // Empezar en una posición cómoda
    wrapper.scrollTop = 500;
    this.updateMinimapViewport();
    
    // Update minimap on scroll
    wrapper.addEventListener('scroll', () => {
      this.updateMinimapViewport();
    });
  }
  
  // Keyboard shortcuts
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Toggle snap to grid with 'G' key
    if (event.key === 'g' || event.key === 'G') {
      this.snapToGrid = !this.snapToGrid;
      this.notifications.success(`Snap to grid: ${this.snapToGrid ? 'ON' : 'OFF'}`);
    }
    
    // Delete selected shapes with Delete or Backspace
    if ((event.key === 'Delete' || event.key === 'Backspace') && this.diagram.selectedShapeIds().length > 0) {
      event.preventDefault();
      const count = this.diagram.selectedShapeIds().length;
      this.diagram.deleteSelectedShapes();
      this.notifications.success(`${count} forma(s) eliminada(s)`);
    }
    
    // Select all with Ctrl+A
    if (event.ctrlKey && event.key === 'a') {
      event.preventDefault();
      this.diagram.selectAllShapes();
      this.notifications.success('Todas las formas seleccionadas');
    }
    
    // Deselect all with Escape
    if (event.key === 'Escape') {
      this.diagram.clearSelection();
      this.alignmentGuides.set({ horizontal: null, vertical: null });
    }
  }
  
  // Zoom with mouse wheel
  onWheel(event: WheelEvent) {
    if (event.ctrlKey) {
      event.preventDefault();
      
      const wrapper = this.wrapperRef.nativeElement;
      const oldZoom = this.diagram.zoomLevel();
      const delta = event.deltaY > 0 ? -10 : 10;
      const newZoom = Math.max(25, Math.min(200, oldZoom + delta));
      
      if (newZoom !== oldZoom) {
        // Calcular punto del mouse relativo al wrapper
        const rect = wrapper.getBoundingClientRect();
        const mouseX = event.clientX - rect.left + wrapper.scrollLeft;
        const mouseY = event.clientY - rect.top + wrapper.scrollTop;
        
        // Calcular nueva posición de scroll para mantener el punto bajo el cursor
        const zoomRatio = newZoom / oldZoom;
        const newScrollLeft = mouseX * zoomRatio - (event.clientX - rect.left);
        const newScrollTop = mouseY * zoomRatio - (event.clientY - rect.top);
        
        // Aplicar zoom
        this.diagram.setZoom(newZoom);
        
        // Ajustar scroll después de un pequeño delay para que el transform se aplique
        setTimeout(() => {
          wrapper.scrollLeft = newScrollLeft;
          wrapper.scrollTop = newScrollTop;
          this.updateMinimapViewport();
        }, 0);
      }
    }
  }
  
  // Update minimap viewport
  private updateMinimapViewport() {
    const wrapper = this.wrapperRef?.nativeElement;
    if (!wrapper) return;
    
    const scrollX = wrapper.scrollLeft;
    const scrollY = wrapper.scrollTop;
    const viewWidth = wrapper.clientWidth;
    const viewHeight = wrapper.clientHeight;
    
    // Scale to minimap coordinates (2000x2000 canvas)
    this.minimapViewport.set({
      x: scrollX,
      y: scrollY,
      width: viewWidth,
      height: viewHeight
    });
  }
  
  // Get minimap viewBox based on shapes extent
  getMinimapViewBox(): string {
    const shapes = this.diagram.shapesList();
    if (shapes.length === 0) {
      return '0 0 2000 2000'; // Default view
    }
    
    // Calculate bounds of all shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach(shape => {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });
    
    // Add padding
    const padding = 200;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = maxX + padding;
    maxY = maxY + padding;
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Ensure minimum size
    const finalWidth = Math.max(width, 2000);
    const finalHeight = Math.max(height, 2000);
    
    return `${minX} ${minY} ${finalWidth} ${finalHeight}`;
  }
  
  // Minimap navigation
  onMinimapMouseDown(event: MouseEvent) {
    event.preventDefault();
    const minimap = this.minimapRef.nativeElement;
    const rect = minimap.getBoundingClientRect();
    
    // Parse current viewBox
    const viewBox = this.getMinimapViewBox().split(' ').map(Number);
    const [vbX, vbY, vbWidth, vbHeight] = viewBox;
    
    const moveToPosition = (e: MouseEvent) => {
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      
      const x = vbX + (relX * vbWidth);
      const y = vbY + (relY * vbHeight);
      
      const wrapper = this.wrapperRef.nativeElement;
      wrapper.scrollLeft = x - wrapper.clientWidth / 2;
      wrapper.scrollTop = y - wrapper.clientHeight / 2;
      this.updateMinimapViewport();
    };
    
    moveToPosition(event);
    
    const onMove = (e: MouseEvent) => moveToPosition(e);
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }
  
  // Snap position to grid
  private snapPosition(value: number): number {
    if (!this.snapToGrid) return value;
    return Math.round(value / this.GRID_SIZE) * this.GRID_SIZE;
  }
  
  // Calculate alignment guides
  private calculateAlignmentGuides(movingShape: DiagramShape, newX: number, newY: number) {
    if (!this.snapToGrid) {
      this.alignmentGuides.set({ horizontal: null, vertical: null });
      return { x: newX, y: newY };
    }
    
    const SNAP_THRESHOLD = 10;
    let snappedX = newX;
    let snappedY = newY;
    let horizontalGuide: number | null = null;
    let verticalGuide: number | null = null;
    
    const otherShapes = this.diagram.shapesList().filter(s => 
      s.id !== movingShape.id && !this.diagram.selectedShapeIds().includes(s.id)
    );
    
    // Check alignment with other shapes
    for (const shape of otherShapes) {
      // Vertical alignment (X axis)
      if (Math.abs(newX - shape.x) < SNAP_THRESHOLD) {
        snappedX = shape.x;
        verticalGuide = shape.x;
      } else if (Math.abs((newX + movingShape.width / 2) - (shape.x + shape.width / 2)) < SNAP_THRESHOLD) {
        snappedX = shape.x + shape.width / 2 - movingShape.width / 2;
        verticalGuide = shape.x + shape.width / 2;
      } else if (Math.abs((newX + movingShape.width) - (shape.x + shape.width)) < SNAP_THRESHOLD) {
        snappedX = shape.x + shape.width - movingShape.width;
        verticalGuide = shape.x + shape.width;
      }
      
      // Horizontal alignment (Y axis)
      if (Math.abs(newY - shape.y) < SNAP_THRESHOLD) {
        snappedY = shape.y;
        horizontalGuide = shape.y;
      } else if (Math.abs((newY + movingShape.height / 2) - (shape.y + shape.height / 2)) < SNAP_THRESHOLD) {
        snappedY = shape.y + shape.height / 2 - movingShape.height / 2;
        horizontalGuide = shape.y + shape.height / 2;
      } else if (Math.abs((newY + movingShape.height) - (shape.y + shape.height)) < SNAP_THRESHOLD) {
        snappedY = shape.y + shape.height - movingShape.height;
        horizontalGuide = shape.y + shape.height;
      }
    }
    
    this.alignmentGuides.set({ horizontal: horizontalGuide, vertical: verticalGuide });
    return { x: snappedX, y: snappedY };
  }

  private drawGrid(): void {
    const grid = this.wrapperRef?.nativeElement?.querySelector('.canvas-grid');
    if (!grid) return;
    const size = 20;
    const canvasSize = 10000; // Canvas muy grande (10000x10000)
    let dots = '';
    // Dibujar solo cada 2 puntos para mejor performance
    for (let x = 0; x < canvasSize; x += size * 2) {
      for (let y = 0; y < canvasSize; y += size * 2) {
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
    
    // Calcular posición considerando el zoom
    const zoom = this.diagram.zoomLevel() / 100;
    const dropX = (event.clientX - rect.left + wrapper.scrollLeft) / zoom;
    const dropY = (event.clientY - rect.top + wrapper.scrollTop) / zoom;
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
    
    // Multi-selection with Ctrl+Click
    if (event.ctrlKey || event.metaKey) {
      this.diagram.toggleShapeSelection(shape.id);
      return;
    }
    
    // If clicking on an already selected shape, don't deselect others
    if (!this.diagram.selectedShapeIds().includes(shape.id)) {
      this.diagram.selectShape(shape.id);
    }
    
    // Store initial positions for all selected shapes
    const selectedShapes = this.diagram.shapesList().filter(s => 
      this.diagram.selectedShapeIds().includes(s.id)
    );
    const initialPositions = new Map(
      selectedShapes.map(s => [s.id, { x: s.x, y: s.y }])
    );
    
    this.dragStart = { 
      mouseX: event.clientX, 
      mouseY: event.clientY, 
      shapeX: shape.x, 
      shapeY: shape.y 
    };

    const onMove = (e: MouseEvent) => {
      const deltaX = e.clientX - this.dragStart.mouseX;
      const deltaY = e.clientY - this.dragStart.mouseY;
      
      // Move all selected shapes
      selectedShapes.forEach(s => {
        const initial = initialPositions.get(s.id)!;
        let newX = initial.x + deltaX;
        let newY = initial.y + deltaY;
        
        // Apply snap to grid
        if (this.snapToGrid) {
          newX = this.snapPosition(newX);
          newY = this.snapPosition(newY);
        }
        
        // Calculate alignment guides for the primary shape
        if (s.id === shape.id && selectedShapes.length === 1) {
          const snapped = this.calculateAlignmentGuides(s, newX, newY);
          newX = snapped.x;
          newY = snapped.y;
        }
        
        this.diagram.updateShape(s.id, { x: newX, y: newY });
      });
    };
    
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      this.alignmentGuides.set({ horizontal: null, vertical: null });
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

  getTrapezoidPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const offset = w * 0.15;
    return `${offset},0 ${w-offset},0 ${w},${h} 0,${h}`;
  }

  getTrianglePoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},0 ${w},${h} 0,${h}`;
  }

  getPentagonPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},0 ${w},${h*0.4} ${w*0.8},${h} ${w*0.2},${h} 0,${h*0.4}`;
  }

  getStarPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) * 0.45;
    const innerR = outerR * 0.4;
    const points: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    
    return points.join(' ');
  }

  getDocumentPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const wave = h * 0.1;
    return `M 0,0 L ${w},0 L ${w},${h-wave} Q ${w*0.75},${h-wave*2} ${w/2},${h-wave} Q ${w*0.25},${h} 0,${h-wave} Z`;
  }

  getCloudPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const cx = w / 2;
    const cy = h * 0.6;
    return `M ${w*0.2},${cy} Q ${w*0.2},${h*0.3} ${w*0.35},${h*0.25} Q ${w*0.4},${h*0.15} ${cx},${h*0.25} Q ${w*0.6},${h*0.15} ${w*0.7},${h*0.25} Q ${w*0.8},${h*0.3} ${w*0.8},${cy} Q ${w*0.9},${cy} ${w*0.9},${h*0.75} Q ${w*0.9},${h*0.9} ${w*0.75},${h*0.9} L ${w*0.25},${h*0.9} Q ${w*0.1},${h*0.9} ${w*0.1},${h*0.75} Q ${w*0.1},${cy} ${w*0.2},${cy} Z`;
  }

  getArrowRightPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const arrowW = w * 0.3;
    const bodyH = h * 0.4;
    return `0,${h/2-bodyH/2} ${w-arrowW},${h/2-bodyH/2} ${w-arrowW},0 ${w},${h/2} ${w-arrowW},${h} ${w-arrowW},${h/2+bodyH/2} 0,${h/2+bodyH/2}`;
  }

  getArrowLeftPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const arrowW = w * 0.3;
    const bodyH = h * 0.4;
    return `${w},${h/2-bodyH/2} ${arrowW},${h/2-bodyH/2} ${arrowW},0 0,${h/2} ${arrowW},${h} ${arrowW},${h/2+bodyH/2} ${w},${h/2+bodyH/2}`;
  }

  getOctagonPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const offset = Math.min(w, h) * 0.3;
    return `${offset},0 ${w-offset},0 ${w},${offset} ${w},${h-offset} ${w-offset},${h} ${offset},${h} 0,${h-offset} 0,${offset}`;
  }

  getCrossPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const t = Math.min(w, h) * 0.35;
    return `${t},0 ${w-t},0 ${w-t},${t} ${w},${t} ${w},${h-t} ${w-t},${h-t} ${w-t},${h} ${t},${h} ${t},${h-t} 0,${h-t} 0,${t} ${t},${t}`;
  }

  getPlusPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const t = Math.min(w, h) * 0.4;
    return `M ${t},0 L ${w-t},0 L ${w-t},${t} L ${w},${t} L ${w},${h-t} L ${w-t},${h-t} L ${w-t},${h} L ${t},${h} L ${t},${h-t} L 0,${h-t} L 0,${t} L ${t},${t} Z`;
  }

  getMultiDocumentPath1(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const wave = h * 0.1;
    const offset = 5;
    return `M ${offset},${offset} L ${w-offset},${offset} L ${w-offset},${h-wave-offset} Q ${w*0.75-offset},${h-wave*2-offset} ${w/2},${h-wave-offset} Q ${w*0.25},${h-offset} ${offset},${h-wave-offset} Z`;
  }

  getMultiDocumentPath2(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const wave = h * 0.1;
    return `M 0,0 L ${w-10},0 L ${w-10},${h-wave-10} Q ${w*0.75-10},${h-wave*2-10} ${w/2-5},${h-wave-10} Q ${w*0.25-5},${h-10} 0,${h-wave-10} Z`;
  }

  getCalloutPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const tailH = h * 0.25;
    const tailW = w * 0.15;
    return `M 0,0 L ${w},0 L ${w},${h-tailH} L ${w*0.3+tailW},${h-tailH} L ${w*0.2},${h} L ${w*0.25},${h-tailH} L 0,${h-tailH} Z`;
  }

  getNotePath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const fold = Math.min(w, h) * 0.2;
    return `M 0,0 L ${w-fold},0 L ${w},${fold} L ${w},${h} L 0,${h} Z M ${w-fold},0 L ${w-fold},${fold} L ${w},${fold}`;
  }

  getTapePath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const rx = w * 0.2;
    return `M ${rx},${h/2} Q ${rx},0 ${rx*2},0 L ${w-rx*2},0 Q ${w-rx},0 ${w-rx},${h/2} Q ${w-rx},${h} ${w-rx*2},${h} L ${rx*2},${h} Q ${rx},${h} ${rx},${h/2}`;
  }

  getDisplayPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const curve = w * 0.1;
    return `M ${curve},0 L ${w-curve},0 Q ${w},${h/2} ${w-curve},${h} L ${curve},${h} Q 0,${h/2} ${curve},0`;
  }

  getManualInputPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const slope = h * 0.2;
    return `0,${slope} ${w},0 ${w},${h} 0,${h}`;
  }

  getManualOperationPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const slope = w * 0.15;
    return `${slope},0 ${w-slope},0 ${w},${h} 0,${h}`;
  }

  getDelayPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const rx = w * 0.25;
    return `M 0,0 L ${w-rx},0 Q ${w},${h/2} ${w-rx},${h} L 0,${h} Z`;
  }

  getStoredDataPath(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const curve = w * 0.15;
    return `M ${curve},0 Q 0,${h/2} ${curve},${h} L ${w},${h} Q ${w-curve},${h/2} ${w},0 Z`;
  }

  getDirectDataPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const skew = w * 0.15;
    return `${skew},0 ${w},0 ${w-skew},${h} 0,${h}`;
  }

  getCollatePoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},${h*0.1} ${w*0.9},${h*0.9} ${w*0.1},${h*0.9} ${w/2},${h*0.1} ${w/2},${h*0.9} ${w*0.1},${h*0.1} ${w*0.9},${h*0.1} ${w/2},${h*0.9}`;
  }

  getSortPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},${h*0.1} ${w*0.9},${h/2} ${w*0.1},${h/2} ${w/2},${h*0.1} ${w/2},${h*0.9} ${w*0.1},${h/2} ${w*0.9},${h/2} ${w/2},${h*0.9}`;
  }

  getExtractPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},${h*0.1} ${w*0.9},${h*0.9} ${w*0.1},${h*0.9}`;
  }

  getMergePoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `${w/2},${h*0.9} ${w*0.1},${h*0.1} ${w*0.9},${h*0.1}`;
  }

  getOffPagePoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    return `0,0 ${w},0 ${w},${h*0.7} ${w/2},${h} 0,${h*0.7}`;
  }

  getArrowUpPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const arrowH = h * 0.3;
    const bodyW = w * 0.4;
    return `${w/2-bodyW/2},${h} ${w/2-bodyW/2},${arrowH} 0,${arrowH} ${w/2},0 ${w},${arrowH} ${w/2+bodyW/2},${arrowH} ${w/2+bodyW/2},${h}`;
  }

  getArrowDownPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const arrowH = h * 0.3;
    const bodyW = w * 0.4;
    return `${w/2-bodyW/2},0 ${w/2-bodyW/2},${h-arrowH} 0,${h-arrowH} ${w/2},${h} ${w},${h-arrowH} ${w/2+bodyW/2},${h-arrowH} ${w/2+bodyW/2},0`;
  }

  getChevronRightPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const point = w * 0.25;
    return `0,0 ${w-point},0 ${w},${h/2} ${w-point},${h} 0,${h} ${point},${h/2}`;
  }

  getChevronLeftPoints(shape: DiagramShape): string {
    const w = shape.width;
    const h = shape.height;
    const point = w * 0.25;
    return `${w},0 ${point},0 0,${h/2} ${point},${h} ${w},${h} ${w-point},${h/2}`;
  }

  getMinRadius(shape: DiagramShape): number {
    return Math.min(shape.width, shape.height) / 2 - 2;
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
