/**
 * Interfaces compartidas entre frontend y backend
 */

export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: Column[];
}

export interface Column {
  id: string;
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  defaultValue?: string;
}

export interface Relationship {
  id: string;
  fromTableId: string;
  toTableId: string;
  fromColumnId: string;
  toColumnId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface Diagram {
  id: string;
  name: string;
  description?: string;
  tables: Table[];
  relationships: Relationship[];
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface DiagramMetadata {
  id: string;
  name: string;
  description?: string;
  tableCount: number;
  createdAt: Date;
  updatedAt: Date;
}
