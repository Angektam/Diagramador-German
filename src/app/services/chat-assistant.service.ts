import { Injectable, inject } from '@angular/core';
import { DiagramService } from './diagram.service';

export interface CommandResponse {
  message: string;
  suggestions?: string[];
  action?: () => void;
}

@Injectable({ providedIn: 'root' })
export class ChatAssistantService {
  private diagramService = inject(DiagramService);

  // Comandos disponibles con sus variaciones
  private commands = {
    createTable: ['crear tabla', 'nueva tabla', 'agregar tabla', 'add table'],
    importSql: ['importar sql', 'cargar sql', 'import sql', 'pegar sql'],
    loadDocument: ['cargar documento', 'importar documento', 'subir documento', 'cargar entrevista', 'cargar proceso'],
    newDiagram: ['nuevo diagrama', 'limpiar todo', 'borrar todo', 'empezar de nuevo'],
    save: ['guardar', 'save', 'guardar diagrama'],
    zoom: ['zoom', 'acercar', 'alejar'],
    stats: ['estadísticas', 'info', 'estado', 'información'],
    help: ['ayuda', 'help', 'qué puedes hacer'],
    commands: ['comandos', 'lista de comandos', 'ver comandos'],
    templates: ['plantillas', 'templates', 'ver plantillas'],
    gallery: ['galería', 'gallery', 'mis diagramas'],
    createDatabase: ['crea una base de datos', 'crear base de datos', 'base de datos de', 'diagrama de base de datos', 'diseña una base de datos'],
    useWizard: ['usar wizard', 'abrir wizard', 'wizard', 'asistente guiado'],
  };

  processCommand(input: string): CommandResponse {
    // Validación de entrada
    if (!input || typeof input !== 'string') {
      return {
        message: 'Comando inválido.',
        suggestions: ['Ayuda', 'Ver comandos']
      };
    }

    const trimmed = input.trim();
    
    // Validación de longitud
    if (trimmed.length === 0) {
      return {
        message: 'Por favor escribe un comando.',
        suggestions: ['Ayuda', 'Ver comandos', 'Crear tabla']
      };
    }

    if (trimmed.length > 500) {
      return {
        message: 'El comando es demasiado largo. Por favor usa menos de 500 caracteres.',
        suggestions: ['Ayuda', 'Ver comandos']
      };
    }

    const lower = trimmed.toLowerCase();

    // Detectar comando
    for (const [key, variations] of Object.entries(this.commands)) {
      if (variations.some(v => lower.includes(v))) {
        return this.executeCommand(key, input);
      }
    }

    // Si no se reconoce el comando
    return {
      message: 'No entendí ese comando. Prueba con "ayuda" para ver qué puedo hacer.',
      suggestions: ['Ayuda', 'Ver comandos', 'Crear tabla']
    };
  }

  private executeCommand(command: string, originalInput: string): CommandResponse {
    switch (command) {
      case 'createTable':
        return {
          message: 'Abriendo el modal para crear una nueva tabla. Completa los campos y haz clic en Crear.',
          suggestions: ['Importar SQL', 'Ver plantillas', 'Estadísticas'],
          action: () => this.diagramService.openTableModal()
        };

      case 'importSql':
        return {
          message: 'Abriendo el editor SQL. Pega tu código CREATE TABLE y haz clic en Importar.',
          suggestions: ['Crear tabla', 'Ver comandos', 'Ayuda'],
          action: () => this.diagramService.openSqlModal()
        };

      case 'loadDocument':
        return {
          message: 'Abriendo el cargador de documentos. Puedes cargar entrevistas, procesos de producción, requisitos, etc.',
          suggestions: ['Ver comandos', 'Ayuda', 'Estadísticas'],
          action: () => {
            // Disparar evento para abrir el modal de documentos
            window.dispatchEvent(new CustomEvent('open-document-uploader'));
          }
        };

      case 'newDiagram':
        return {
          message: 'He creado un nuevo diagrama vacío. ¿Qué quieres hacer ahora?',
          suggestions: ['Crear tabla', 'Importar SQL', 'Ver plantillas'],
          action: () => this.diagramService.newDiagram()
        };

      case 'save':
        const name = this.extractName(originalInput) || 'Mi Diagrama';
        return {
          message: `Guardando tu diagrama como "${name}" en la galería...`,
          suggestions: ['Crear tabla', 'Nuevo diagrama', 'Estadísticas'],
          action: () => this.diagramService.saveToGallery(name)
        };

      case 'zoom':
        return this.handleZoom(originalInput);

      case 'stats':
        return this.getStats();

      case 'help':
        return {
          message: `🧙‍♂️ Puedo ayudarte con:\n\n` +
            `🎨 Crear y editar tablas de bases de datos\n` +
            `📥 Importar código SQL (CREATE TABLE)\n` +
            `📄 Cargar documentos (entrevistas, procesos, requisitos)\n` +
            `💾 Guardar y cargar diagramas\n` +
            `🔍 Ajustar zoom y vista del canvas\n` +
            `📊 Ver estadísticas del diagrama\n` +
            `🎯 Usar plantillas predefinidas\n\n` +
            `Escribe "comandos" para ver ejemplos específicos.`,
          suggestions: ['Ver comandos', 'Cargar documento', 'Importar SQL']
        };

      case 'commands':
        return {
          message: `📋 Comandos disponibles:\n\n` +
            `• "Crear tabla" - Abre el modal para crear una tabla\n` +
            `• "Importar SQL" - Abre el editor SQL\n` +
            `• "Cargar documento" - Importa entrevistas, procesos, etc.\n` +
            `• "Crea una base de datos de..." - Te guío para crear una BD\n` +
            `• "Usar Wizard" - Abre el asistente guiado\n` +
            `• "Nuevo diagrama" - Crea un diagrama vacío\n` +
            `• "Guardar [nombre]" - Guarda el diagrama\n` +
            `• "Zoom [número]" - Ajusta el zoom (25-200%)\n` +
            `• "Estadísticas" - Muestra info del diagrama\n` +
            `• "Plantillas" - Abre plantillas predefinidas\n` +
            `• "Ayuda" - Muestra esta ayuda`,
          suggestions: ['Cargar documento', 'Usar Wizard', 'Estadísticas']
        };

      case 'templates':
        return {
          message: 'Abriendo el catálogo de plantillas. Selecciona una para empezar rápido.',
          suggestions: ['Crear tabla', 'Importar SQL', 'Ayuda'],
          action: () => this.diagramService.openTemplatesModal()
        };

      case 'createDatabase':
        // Extraer el tema/descripción de la base de datos
        const description = this.extractDatabaseDescription(originalInput);
        if (description) {
          // Generar las tablas y obtener el SQL
          const tables = this.inferTablesFromDescription(description);
          const sqlCode = this.generateSQLFromTables(tables);
          
          return {
            message: `✅ Base de datos creada para: "${description}"\n\n` +
              `📊 Se crearon ${tables.length} tablas con sus relaciones.\n\n` +
              `📋 Código SQL generado:\n\n` +
              `\`\`\`sql\n${sqlCode}\`\`\`\n\n` +
              `💾 El código SQL ha sido copiado al portapapeles.`,
            suggestions: ['Estadísticas', 'Guardar', 'Nuevo diagrama'],
            action: () => this.generateDatabaseFromDescription(description)
          };
        } else {
          return {
            message: 'Para crear una base de datos, tienes dos opciones:\n\n' +
              '1. Usa el Wizard para un asistente guiado paso a paso\n' +
              '2. Crea tablas manualmente con "Crear tabla"\n' +
              '3. Importa un script SQL con "Importar SQL"\n\n' +
              '¿Cuál prefieres?',
            suggestions: ['Usar Wizard', 'Crear tabla', 'Importar SQL']
          };
        }

      case 'useWizard':
        return {
          message: 'Cambiando al Wizard. Selecciona "Base de Datos" para crear tu diagrama.',
          suggestions: ['Ayuda', 'Ver comandos']
        };

      default:
        return {
          message: 'Comando no implementado aún.',
          suggestions: ['Ayuda', 'Ver comandos']
        };
    }
  }

  private handleZoom(input: string): CommandResponse {
    const zoomMatch = input.match(/\d+/);
    if (zoomMatch) {
      const zoomValue = parseInt(zoomMatch[0]);
      
      // Validar que sea un número válido
      if (isNaN(zoomValue) || !isFinite(zoomValue)) {
        return {
          message: 'Valor de zoom inválido. Usa un número entre 25 y 200.',
          suggestions: ['Zoom 100', 'Zoom 150', 'Zoom 200']
        };
      }

      // Validar rango
      if (zoomValue < 25 || zoomValue > 200) {
        return {
          message: 'El zoom debe estar entre 25% y 200%.',
          suggestions: ['Zoom 25', 'Zoom 100', 'Zoom 200']
        };
      }

      const finalZoom = Math.max(25, Math.min(200, zoomValue));
      return {
        message: `Ajustando el zoom a ${finalZoom}%.`,
        suggestions: ['Zoom 100', 'Zoom 150', 'Estadísticas'],
        action: () => this.diagramService.setZoom(finalZoom)
      };
    } else {
      return {
        message: 'Por favor especifica un valor de zoom entre 25 y 200. Ejemplo: "Zoom 150"',
        suggestions: ['Zoom 100', 'Zoom 150', 'Zoom 200']
      };
    }
  }

  private getStats(): CommandResponse {
    const shapes = this.diagramService.shapesList();
    const connections = this.diagramService.connectionsList();
    const zoom = this.diagramService.zoomLevel();
    const selected = this.diagramService.selectedShapeIds();

    const tableCount = shapes.filter(s => s.type === 'table').length;
    const otherCount = shapes.length - tableCount;

    let message = `📊 Estado del diagrama:\n\n`;
    message += `• Tablas: ${tableCount}\n`;
    if (otherCount > 0) {
      message += `• Otras formas: ${otherCount}\n`;
    }
    message += `• Conexiones: ${connections.length}\n`;
    message += `• Zoom: ${zoom}%\n`;
    if (selected.length > 0) {
      message += `• Seleccionadas: ${selected.length}`;
    }

    return {
      message,
      suggestions: ['Crear tabla', 'Importar SQL', 'Guardar']
    };
  }

  private extractName(input: string): string | null {
    // Validar entrada
    if (!input || typeof input !== 'string') {
      return null;
    }

    const patterns = [
      /guardar\s+(?:como\s+)?["']([^"']+)["']/i,
      /guardar\s+(?:como\s+)?(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        const name = match[1].trim();
        
        // Validar longitud del nombre
        if (name.length === 0) {
          return null;
        }
        
        if (name.length > 100) {
          return name.substring(0, 100);
        }

        // Sanitizar caracteres peligrosos
        const sanitized = name.replace(/[<>\"\']/g, '');
        
        return sanitized;
      }
    }

    return null;
  }

  // Sugerencias contextuales basadas en el estado del diagrama
  getContextualSuggestions(): string[] {
    const shapes = this.diagramService.shapesList();
    const connections = this.diagramService.connectionsList();

    if (shapes.length === 0) {
      return ['Crear tabla', 'Importar SQL', 'Ver plantillas'];
    }

    if (shapes.length > 0 && connections.length === 0) {
      return ['Crear conexión', 'Agregar tabla', 'Guardar'];
    }

    return ['Estadísticas', 'Guardar', 'Nuevo diagrama'];
  }

  private extractDatabaseDescription(input: string): string | null {
    // Patrones para extraer la descripción
    const patterns = [
      /crea(?:r)?\s+(?:una\s+)?base\s+de\s+datos\s+(?:de\s+|para\s+)?(.+)/i,
      /base\s+de\s+datos\s+(?:de\s+|para\s+)(.+)/i,
      /diseña(?:r)?\s+(?:una\s+)?base\s+de\s+datos\s+(?:de\s+|para\s+)?(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  }

  private generateDatabaseFromDescription(description: string) {
    // Validar descripción
    if (!description || typeof description !== 'string') {
      return '';
    }

    const trimmed = description.trim();
    
    if (trimmed.length === 0) {
      return '';
    }

    if (trimmed.length > 200) {
      description = trimmed.substring(0, 200);
    }

    // Limpiar el diagrama actual
    this.diagramService.newDiagram();

    // Analizar la descripción y generar tablas apropiadas
    const tables = this.inferTablesFromDescription(description);
    
    // Validar que se generaron tablas
    if (!tables || tables.length === 0) {
      return '';
    }

    // Limitar número de tablas
    const limitedTables = tables.slice(0, 20);
    
    let x = 300;
    let y = 200;
    const spacing = 250;
    const createdShapes: Map<string, any> = new Map();

    // Generar código SQL
    const sqlCode = this.generateSQLFromTables(limitedTables);

    // Primero crear todas las formas
    limitedTables.forEach((table, index) => {
      // Validar datos de la tabla
      if (!table || !table.name || !table.columns) {
        return;
      }

      const shape = {
        id: `shape-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'table',
        x: x + (index % 3) * spacing,
        y: y + Math.floor(index / 3) * 220,
        width: 200,
        height: Math.max(140, 80 + table.columns.length * 25),
        fill: '#ffffff',
        stroke: '#6366f1',
        tableData: {
          name: table.name,
          columns: table.columns
        }
      };

      this.diagramService.addShape(shape);
      createdShapes.set(table.name, shape);
    });

    // Luego crear todas las conexiones basadas en las FK
    limitedTables.forEach(table => {
      const fromShape = createdShapes.get(table.name);
      if (!fromShape) return;

      // Buscar columnas con FK en esta tabla
      table.columns.forEach((column: any) => {
        if (column.fk) {
          const toShape = createdShapes.get(column.fk);
          if (toShape) {
            // Verificar que no exista ya esta conexión
            const connections = this.diagramService.connectionsList();
            const exists = connections.some(c => 
              (c.fromId === fromShape.id && c.toId === toShape.id) ||
              (c.fromId === toShape.id && c.toId === fromShape.id)
            );
            
            if (!exists) {
              this.diagramService.addConnection(fromShape.id, toShape.id);
            }
          }
        }
      });
    });

    // Mostrar el código SQL en el modal
    this.diagramService.setExternalSql(sqlCode);
    this.diagramService.openSqlGeneratedModal();
    
    return sqlCode;
  }

  private generateSQLFromTables(tables: any[]): string {
    let sql = '-- Base de datos generada automáticamente\n';
    sql += '-- Fecha: ' + new Date().toLocaleString() + '\n\n';

    // Primero crear las tablas sin FK
    tables.forEach(table => {
      sql += `CREATE TABLE ${table.name} (\n`;
      
      const columns = table.columns.map((col: any) => {
        let colDef = `  ${col.name} ${col.type}`;
        if (col.pk) {
          colDef += ' PRIMARY KEY AUTO_INCREMENT';
        }
        return colDef;
      });
      
      sql += columns.join(',\n');
      sql += '\n);\n\n';
    });

    // Luego agregar las FK como ALTER TABLE
    tables.forEach(table => {
      table.columns.forEach((col: any) => {
        if (col.fk) {
          sql += `ALTER TABLE ${table.name}\n`;
          sql += `  ADD CONSTRAINT fk_${table.name}_${col.name}\n`;
          sql += `  FOREIGN KEY (${col.name})\n`;
          sql += `  REFERENCES ${col.fk}(id);\n\n`;
        }
      });
    });

    return sql;
  }

  private inferTablesFromDescription(description: string): any[] {
    const lower = description.toLowerCase();
    
    // Detectar tipo de negocio y generar tablas apropiadas
    if (lower.includes('venta') || lower.includes('tienda') || lower.includes('comercio')) {
      if (lower.includes('tenis') || lower.includes('zapatos') || lower.includes('calzado')) {
        return this.generateShoesStoreTables();
      }
      return this.generateGenericStoreTables(description);
    }
    
    if (lower.includes('escuela') || lower.includes('universidad') || lower.includes('educación')) {
      return this.generateEducationTables();
    }
    
    if (lower.includes('hospital') || lower.includes('clínica') || lower.includes('salud')) {
      return this.generateHealthcareTables();
    }
    
    if (lower.includes('restaurante') || lower.includes('comida') || lower.includes('menú')) {
      return this.generateRestaurantTables();
    }
    
    // Por defecto, generar tablas genéricas
    return this.generateGenericStoreTables(description);
  }

  private generateShoesStoreTables(): any[] {
    return [
      {
        name: 'Clientes',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'telefono', type: 'VARCHAR(20)' },
          { name: 'direccion', type: 'TEXT' },
          { name: 'fecha_registro', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'Categorias',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(50)' },
          { name: 'descripcion', type: 'TEXT' }
        ]
      },
      {
        name: 'Proveedores',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'contacto', type: 'VARCHAR(100)' },
          { name: 'telefono', type: 'VARCHAR(20)' },
          { name: 'email', type: 'VARCHAR(100)' }
        ]
      },
      {
        name: 'Productos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'marca', type: 'VARCHAR(50)' },
          { name: 'talla', type: 'VARCHAR(10)' },
          { name: 'color', type: 'VARCHAR(30)' },
          { name: 'precio', type: 'DECIMAL(10,2)' },
          { name: 'stock', type: 'INT' },
          { name: 'categoria_id', type: 'INT', fk: 'Categorias' },
          { name: 'proveedor_id', type: 'INT', fk: 'Proveedores' }
        ]
      },
      {
        name: 'Ventas',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'cliente_id', type: 'INT', fk: 'Clientes' },
          { name: 'fecha', type: 'TIMESTAMP' },
          { name: 'total', type: 'DECIMAL(10,2)' },
          { name: 'estado', type: 'VARCHAR(20)' }
        ]
      },
      {
        name: 'DetalleVentas',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'venta_id', type: 'INT', fk: 'Ventas' },
          { name: 'producto_id', type: 'INT', fk: 'Productos' },
          { name: 'cantidad', type: 'INT' },
          { name: 'precio_unitario', type: 'DECIMAL(10,2)' },
          { name: 'subtotal', type: 'DECIMAL(10,2)' }
        ]
      }
    ];
  }

  private generateGenericStoreTables(description: string): any[] {
    return [
      {
        name: 'Clientes',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'telefono', type: 'VARCHAR(20)' },
          { name: 'fecha_registro', type: 'TIMESTAMP' }
        ]
      },
      {
        name: 'Productos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'descripcion', type: 'TEXT' },
          { name: 'precio', type: 'DECIMAL(10,2)' },
          { name: 'stock', type: 'INT' }
        ]
      },
      {
        name: 'Ventas',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'cliente_id', type: 'INT', fk: 'Clientes' },
          { name: 'fecha', type: 'TIMESTAMP' },
          { name: 'total', type: 'DECIMAL(10,2)' }
        ]
      },
      {
        name: 'DetalleVentas',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'venta_id', type: 'INT', fk: 'Ventas' },
          { name: 'producto_id', type: 'INT', fk: 'Productos' },
          { name: 'cantidad', type: 'INT' },
          { name: 'precio_unitario', type: 'DECIMAL(10,2)' }
        ]
      }
    ];
  }

  private generateEducationTables(): any[] {
    return [
      {
        name: 'Estudiantes',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(100)' },
          { name: 'fecha_nacimiento', type: 'DATE' }
        ]
      },
      {
        name: 'Cursos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'creditos', type: 'INT' }
        ]
      },
      {
        name: 'Profesores',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'especialidad', type: 'VARCHAR(50)' }
        ]
      },
      {
        name: 'Inscripciones',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'estudiante_id', type: 'INT', fk: 'Estudiantes' },
          { name: 'curso_id', type: 'INT', fk: 'Cursos' },
          { name: 'fecha', type: 'TIMESTAMP' },
          { name: 'calificacion', type: 'DECIMAL(5,2)' }
        ]
      }
    ];
  }

  private generateHealthcareTables(): any[] {
    return [
      {
        name: 'Pacientes',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'fecha_nacimiento', type: 'DATE' },
          { name: 'telefono', type: 'VARCHAR(20)' },
          { name: 'direccion', type: 'TEXT' }
        ]
      },
      {
        name: 'Medicos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'especialidad', type: 'VARCHAR(50)' },
          { name: 'telefono', type: 'VARCHAR(20)' }
        ]
      },
      {
        name: 'Citas',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'paciente_id', type: 'INT', fk: 'Pacientes' },
          { name: 'medico_id', type: 'INT', fk: 'Medicos' },
          { name: 'fecha', type: 'TIMESTAMP' },
          { name: 'motivo', type: 'TEXT' }
        ]
      },
      {
        name: 'Tratamientos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'cita_id', type: 'INT', fk: 'Citas' },
          { name: 'diagnostico', type: 'TEXT' },
          { name: 'medicamentos', type: 'TEXT' }
        ]
      }
    ];
  }

  private generateRestaurantTables(): any[] {
    return [
      {
        name: 'Clientes',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'telefono', type: 'VARCHAR(20)' },
          { name: 'direccion', type: 'TEXT' }
        ]
      },
      {
        name: 'Categorias',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(50)' },
          { name: 'descripcion', type: 'TEXT' }
        ]
      },
      {
        name: 'Platos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'nombre', type: 'VARCHAR(100)' },
          { name: 'precio', type: 'DECIMAL(10,2)' },
          { name: 'categoria_id', type: 'INT', fk: 'Categorias' },
          { name: 'descripcion', type: 'TEXT' }
        ]
      },
      {
        name: 'Pedidos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'cliente_id', type: 'INT', fk: 'Clientes' },
          { name: 'fecha', type: 'TIMESTAMP' },
          { name: 'total', type: 'DECIMAL(10,2)' },
          { name: 'estado', type: 'VARCHAR(20)' }
        ]
      },
      {
        name: 'DetallePedidos',
        columns: [
          { name: 'id', type: 'INT', pk: true },
          { name: 'pedido_id', type: 'INT', fk: 'Pedidos' },
          { name: 'plato_id', type: 'INT', fk: 'Platos' },
          { name: 'cantidad', type: 'INT' },
          { name: 'precio_unitario', type: 'DECIMAL(10,2)' }
        ]
      }
    ];
  }
}
