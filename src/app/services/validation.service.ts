import { Injectable } from '@angular/core';
import { TableData, TableColumn, DiagramShape } from '../models/diagram.model';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  
  /**
   * Valida un JSON de diagrama
   */
  validateDiagramJson(json: string): {
    valid: boolean;
    error?: string;
    data?: any;
  } {
    try {
      const data = JSON.parse(json);

      if (!data || typeof data !== 'object') {
        return { valid: false, error: 'El JSON debe ser un objeto válido' };
      }

      if (data.shapes && !Array.isArray(data.shapes)) {
        return { valid: false, error: 'Las formas deben ser un array' };
      }

      if (data.connections && !Array.isArray(data.connections)) {
        return { valid: false, error: 'Las conexiones deben ser un array' };
      }

      if (data.zoom && (typeof data.zoom !== 'number' || data.zoom < 25 || data.zoom > 200)) {
        return { valid: false, error: 'El zoom debe estar entre 25 y 200' };
      }

      return { valid: true, data };
    } catch (error) {
      const errorMsg = error instanceof SyntaxError 
        ? `Error JSON: ${error.message}`
        : 'Error al parsear el JSON';
      return { valid: false, error: errorMsg };
    }
  }

  private readonly ALLOWED_COLUMN_TYPES = ['INT', 'VARCHAR', 'TEXT', 'DATE', 'DECIMAL', 'BOOLEAN', 'BIGINT', 'FLOAT', 'DATETIME'];

  /**
   * Valida datos de una tabla
   */
  validateTableData(tableData: TableData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const name = tableData.name?.trim() ?? '';

    if (!name) {
      errors.push('El nombre de la tabla es requerido');
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      errors.push('El nombre de la tabla debe empezar con letra o guión bajo y solo puede contener letras, números y _');
    }

    if (!tableData.columns || tableData.columns.length === 0) {
      errors.push('Debe haber al menos una columna');
    }

    const primaryKeys = tableData.columns.filter(c => c.pk).length;
    if (primaryKeys > 1) {
      errors.push('Solo puede haber una clave primaria (PK)');
    }

    for (let i = 0; i < (tableData.columns?.length ?? 0); i++) {
      const col = tableData.columns[i];
      const colName = col.name?.trim() ?? '';

      if (!colName) {
        errors.push(`Columna ${i + 1}: El nombre es requerido`);
      } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(colName)) {
        errors.push(`Columna ${i + 1}: El nombre debe empezar con letra o _ y solo letras, números y _`);
      }

      const colType = col.type?.trim() ?? '';
      if (!colType) {
        errors.push(`Columna ${i + 1}: El tipo es requerido`);
      } else if (!this.ALLOWED_COLUMN_TYPES.includes(colType.toUpperCase())) {
        errors.push(`Columna ${i + 1}: Tipo no válido. Usa: ${this.ALLOWED_COLUMN_TYPES.join(', ')}`);
      }

      if (col.fk != null && String(col.fk).trim() === '') {
        errors.push(`Columna ${i + 1}: La referencia FK no puede estar vacía`);
      }
    }

    const columnNames = (tableData.columns ?? []).map(c => (c.name ?? '').trim().toLowerCase());
    const seen = new Set<string>();
    const duplicates: string[] = [];
    for (let i = 0; i < columnNames.length; i++) {
      const n = columnNames[i];
      if (!n) continue;
      if (seen.has(n)) duplicates.push((tableData.columns![i].name ?? '').trim());
      else seen.add(n);
    }
    if (duplicates.length > 0) {
      errors.push(`Columnas con nombre duplicado: ${[...new Set(duplicates)].join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Valida un nombre de forma
   */
  validateShapeName(name: string): {
    valid: boolean;
    error?: string;
  } {
    if (!name || !name.trim()) {
      return { valid: false, error: 'El nombre no puede estar vacío' };
    }

    if (name.length > 100) {
      return { valid: false, error: 'El nombre es muy largo (máx 100 caracteres)' };
    }

    return { valid: true };
  }

  /**
   * Valida si hay tablas antes de generar SQL
   */
  validateDiagramForSql(shapes: DiagramShape[]): {
    valid: boolean;
    error?: string;
    tableCount?: number;
  } {
    const tables = shapes.filter(s => s.type === 'table' && s.tableData);

    if (tables.length === 0) {
      return {
        valid: false,
        error: 'No hay tablas en el diagrama. Agrega al menos una tabla.'
      };
    }

    // Validar cada tabla
    for (const table of tables) {
      const validation = this.validateTableData(table.tableData!);
      if (!validation.valid) {
        return {
          valid: false,
          error: `Tabla "${table.tableData!.name}": ${validation.errors[0]}`
        };
      }
    }

    return { valid: true, tableCount: tables.length };
  }

  /**
   * Valida referencias FK
   */
  validateForeignKeys(shapes: DiagramShape[]): {
    valid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];
    const tableNames = new Set(
      shapes
        .filter(s => s.type === 'table' && s.tableData)
        .map(s => s.tableData!.name)
    );

    for (const shape of shapes) {
      if (shape.type === 'table' && shape.tableData) {
        for (const col of shape.tableData.columns) {
          if (col.fk && !tableNames.has(col.fk)) {
            warnings.push(
              `Tabla "${shape.tableData.name}", columna "${col.name}": ` +
              `Referencia a tabla no existente "${col.fk}"`
            );
          }
        }
      }
    }

    return { valid: warnings.length === 0, warnings };
  }
}
