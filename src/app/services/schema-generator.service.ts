import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  endpoint: string;
  tables: TableSchema[];
}

export interface TableSchema {
  name: string;
  columns: ColumnSchema[];
  primaryKey: string;
  foreignKeys?: ForeignKeySchema[];
}

export interface ColumnSchema {
  name: string;
  type: string;
  nullable: boolean;
  unique?: boolean;
}

export interface ForeignKeySchema {
  column: string;
  referencedTable: string;
  referencedColumn: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchemaGeneratorService {
  private readonly API_BASE = 'https://dummyjson.com';
  
  templates = signal<SchemaTemplate[]>([
    {
      id: 'ecommerce',
      name: 'E-Commerce',
      description: 'Sistema completo de comercio electrónico con productos, usuarios, carritos y órdenes',
      category: 'Negocios',
      endpoint: '/products',
      tables: [
        {
          name: 'products',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'title', type: 'VARCHAR(255)', nullable: false },
            { name: 'description', type: 'TEXT', nullable: true },
            { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'discountPercentage', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'rating', type: 'DECIMAL(3,2)', nullable: true },
            { name: 'stock', type: 'INT', nullable: false },
            { name: 'brand', type: 'VARCHAR(100)', nullable: true },
            { name: 'category', type: 'VARCHAR(100)', nullable: false },
            { name: 'thumbnail', type: 'VARCHAR(500)', nullable: true }
          ]
        },
        {
          name: 'users',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'firstName', type: 'VARCHAR(100)', nullable: false },
            { name: 'lastName', type: 'VARCHAR(100)', nullable: false },
            { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true },
            { name: 'phone', type: 'VARCHAR(20)', nullable: true },
            { name: 'username', type: 'VARCHAR(50)', nullable: false, unique: true },
            { name: 'birthDate', type: 'DATE', nullable: true },
            { name: 'image', type: 'VARCHAR(500)', nullable: true },
            { name: 'address', type: 'VARCHAR(255)', nullable: true },
            { name: 'city', type: 'VARCHAR(100)', nullable: true },
            { name: 'state', type: 'VARCHAR(100)', nullable: true },
            { name: 'postalCode', type: 'VARCHAR(20)', nullable: true }
          ]
        },
        {
          name: 'carts',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'userId', type: 'INT', nullable: false },
            { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'discountedTotal', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'totalProducts', type: 'INT', nullable: false },
            { name: 'totalQuantity', type: 'INT', nullable: false }
          ],
          foreignKeys: [
            { column: 'userId', referencedTable: 'users', referencedColumn: 'id' }
          ]
        },
        {
          name: 'cart_items',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'cartId', type: 'INT', nullable: false },
            { name: 'productId', type: 'INT', nullable: false },
            { name: 'quantity', type: 'INT', nullable: false },
            { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'discountPercentage', type: 'DECIMAL(5,2)', nullable: true },
            { name: 'discountedPrice', type: 'DECIMAL(10,2)', nullable: true }
          ],
          foreignKeys: [
            { column: 'cartId', referencedTable: 'carts', referencedColumn: 'id' },
            { column: 'productId', referencedTable: 'products', referencedColumn: 'id' }
          ]
        }
      ]
    },
    {
      id: 'blog',
      name: 'Blog/Red Social',
      description: 'Sistema de blog con posts, comentarios y usuarios',
      category: 'Contenido',
      endpoint: '/posts',
      tables: [
        {
          name: 'users',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'firstName', type: 'VARCHAR(100)', nullable: false },
            { name: 'lastName', type: 'VARCHAR(100)', nullable: false },
            { name: 'email', type: 'VARCHAR(255)', nullable: false, unique: true },
            { name: 'username', type: 'VARCHAR(50)', nullable: false, unique: true },
            { name: 'image', type: 'VARCHAR(500)', nullable: true }
          ]
        },
        {
          name: 'posts',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'title', type: 'VARCHAR(255)', nullable: false },
            { name: 'body', type: 'TEXT', nullable: false },
            { name: 'userId', type: 'INT', nullable: false },
            { name: 'tags', type: 'VARCHAR(255)', nullable: true },
            { name: 'reactions', type: 'INT', nullable: false },
            { name: 'views', type: 'INT', nullable: false }
          ],
          foreignKeys: [
            { column: 'userId', referencedTable: 'users', referencedColumn: 'id' }
          ]
        },
        {
          name: 'comments',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'body', type: 'TEXT', nullable: false },
            { name: 'postId', type: 'INT', nullable: false },
            { name: 'userId', type: 'INT', nullable: false },
            { name: 'likes', type: 'INT', nullable: false }
          ],
          foreignKeys: [
            { column: 'postId', referencedTable: 'posts', referencedColumn: 'id' },
            { column: 'userId', referencedTable: 'users', referencedColumn: 'id' }
          ]
        }
      ]
    },
    {
      id: 'recipes',
      name: 'Recetas de Cocina',
      description: 'Sistema de gestión de recetas con ingredientes y categorías',
      category: 'Gastronomía',
      endpoint: '/recipes',
      tables: [
        {
          name: 'recipes',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'cuisine', type: 'VARCHAR(100)', nullable: false },
            { name: 'difficulty', type: 'VARCHAR(50)', nullable: false },
            { name: 'prepTimeMinutes', type: 'INT', nullable: false },
            { name: 'cookTimeMinutes', type: 'INT', nullable: false },
            { name: 'servings', type: 'INT', nullable: false },
            { name: 'caloriesPerServing', type: 'INT', nullable: true },
            { name: 'rating', type: 'DECIMAL(3,2)', nullable: true },
            { name: 'reviewCount', type: 'INT', nullable: false },
            { name: 'image', type: 'VARCHAR(500)', nullable: true }
          ]
        },
        {
          name: 'ingredients',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'category', type: 'VARCHAR(100)', nullable: true }
          ]
        },
        {
          name: 'recipe_ingredients',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'recipeId', type: 'INT', nullable: false },
            { name: 'ingredientId', type: 'INT', nullable: false },
            { name: 'quantity', type: 'VARCHAR(50)', nullable: false }
          ],
          foreignKeys: [
            { column: 'recipeId', referencedTable: 'recipes', referencedColumn: 'id' },
            { column: 'ingredientId', referencedTable: 'ingredients', referencedColumn: 'id' }
          ]
        },
        {
          name: 'instructions',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'recipeId', type: 'INT', nullable: false },
            { name: 'stepNumber', type: 'INT', nullable: false },
            { name: 'instruction', type: 'TEXT', nullable: false }
          ],
          foreignKeys: [
            { column: 'recipeId', referencedTable: 'recipes', referencedColumn: 'id' }
          ]
        }
      ]
    },
    {
      id: 'quotes',
      name: 'Citas y Autores',
      description: 'Sistema de gestión de citas célebres y sus autores',
      category: 'Contenido',
      endpoint: '/quotes',
      tables: [
        {
          name: 'authors',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'name', type: 'VARCHAR(255)', nullable: false },
            { name: 'bio', type: 'TEXT', nullable: true },
            { name: 'birthYear', type: 'INT', nullable: true },
            { name: 'deathYear', type: 'INT', nullable: true }
          ]
        },
        {
          name: 'quotes',
          primaryKey: 'id',
          columns: [
            { name: 'id', type: 'INT', nullable: false, unique: true },
            { name: 'quote', type: 'TEXT', nullable: false },
            { name: 'authorId', type: 'INT', nullable: false },
            { name: 'category', type: 'VARCHAR(100)', nullable: true }
          ],
          foreignKeys: [
            { column: 'authorId', referencedTable: 'authors', referencedColumn: 'id' }
          ]
        }
      ]
    }
  ]);

  constructor(private http: HttpClient) {}

  async fetchSampleData(endpoint: string): Promise<any> {
    try {
      const url = `${this.API_BASE}${endpoint}`;
      return await firstValueFrom(this.http.get(url));
    } catch (error) {
      console.error('Error fetching sample data:', error);
      throw error;
    }
  }

  generateSQL(template: SchemaTemplate): string {
    let sql = `-- Schema: ${template.name}\n`;
    sql += `-- ${template.description}\n`;
    sql += `-- Generated from DummyJSON API\n\n`;

    // Create tables
    template.tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      
      // Add columns
      const columnDefs = table.columns.map(col => {
        let def = `  ${col.name} ${col.type}`;
        if (!col.nullable) def += ' NOT NULL';
        if (col.unique) def += ' UNIQUE';
        if (col.name === table.primaryKey) def += ' PRIMARY KEY';
        return def;
      });
      
      sql += columnDefs.join(',\n');
      
      // Add foreign keys inline
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          sql += ',\n';
          sql += `  CONSTRAINT fk_${table.name}_${fk.column} FOREIGN KEY (${fk.column}) REFERENCES ${fk.referencedTable}(${fk.referencedColumn})`;
        });
      }
      
      sql += '\n);\n\n';
    });

    // Add indexes
    sql += `-- Indexes for better performance\n`;
    template.tables.forEach(table => {
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          sql += `CREATE INDEX idx_${table.name}_${fk.column} ON ${table.name}(${fk.column});\n`;
        });
      }
    });

    return sql;
  }

  getTemplateById(id: string): SchemaTemplate | undefined {
    return this.templates().find(t => t.id === id);
  }

  getTemplatesByCategory(category: string): SchemaTemplate[] {
    return this.templates().filter(t => t.category === category);
  }

  getAllCategories(): string[] {
    const categories = new Set(this.templates().map(t => t.category));
    return Array.from(categories);
  }
}
