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
    const lower = input.toLowerCase().trim();

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
            `💾 Guardar y cargar diagramas\n` +
            `🔍 Ajustar zoom y vista del canvas\n` +
            `📊 Ver estadísticas del diagrama\n` +
            `🎯 Usar plantillas predefinidas\n\n` +
            `Escribe "comandos" para ver ejemplos específicos.`,
          suggestions: ['Ver comandos', 'Crear tabla', 'Importar SQL']
        };

      case 'commands':
        return {
          message: `📋 Comandos disponibles:\n\n` +
            `• "Crear tabla" - Abre el modal para crear una tabla\n` +
            `• "Importar SQL" - Abre el editor SQL\n` +
            `• "Crea una base de datos de..." - Te guío para crear una BD\n` +
            `• "Usar Wizard" - Abre el asistente guiado\n` +
            `• "Nuevo diagrama" - Crea un diagrama vacío\n` +
            `• "Guardar [nombre]" - Guarda el diagrama\n` +
            `• "Zoom [número]" - Ajusta el zoom (25-200%)\n` +
            `• "Estadísticas" - Muestra info del diagrama\n` +
            `• "Plantillas" - Abre plantillas predefinidas\n` +
            `• "Ayuda" - Muestra esta ayuda`,
          suggestions: ['Crear tabla', 'Usar Wizard', 'Estadísticas']
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
          return {
            message: `Perfecto! Voy a crear una base de datos para: "${description}"\n\nGenerando tablas y relaciones...`,
            suggestions: ['Estadísticas', 'Guardar', 'Ver comandos'],
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
      const zoomValue = Math.max(25, Math.min(200, parseInt(zoomMatch[0])));
      return {
        message: `Ajustando el zoom a ${zoomValue}%.`,
        suggestions: ['Zoom 100', 'Zoom 150', 'Estadísticas'],
        action: () => this.diagramService.setZoom(zoomValue)
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
    const patterns = [
      /guardar\s+(?:como\s+)?["']([^"']+)["']/i,
      /guardar\s+(?:como\s+)?(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1].trim();
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
    // Limpiar el diagrama actual
    this.diagramService.newDiagram();

    // Analizar la descripción y generar tablas apropiadas
    const tables = this.inferTablesFromDescription(description);
    
    let x = 300;
    let y = 200;
    const spacing = 250;
    const createdShapes: Map<string, any> = new Map();

    // Primero crear todas las formas
    tables.forEach((table, index) => {
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
    tables.forEach(table => {
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
