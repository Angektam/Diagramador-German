export interface DiagramShape {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fill?: string;
  stroke?: string;
  tableData?: TableData;
}

export interface TableData {
  name: string;
  columns: TableColumn[];
}

export interface TableColumn {
  name: string;
  type: string;
  pk?: boolean;
  fk?: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
}
