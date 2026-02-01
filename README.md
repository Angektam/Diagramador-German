# Diagramador (Angular)

Aplicación de diagramas tipo draw.io/diagrams.net: creador de diagramas de flujo y diagramas de base de datos con exportación a SQL.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
ng serve
```

Abre http://localhost:4200 en tu navegador.

## Uso

- **Añadir formas:** arrastra una forma desde el panel izquierdo ("Flujo" o "Base de datos") al lienzo.
- **Mover formas:** haz clic en una forma y arrástrala.
- **Editar:** selecciona una forma y usa el panel derecho para cambiar texto/colores, o **Editar tabla** si es una tabla.
- **Zoom:** usa los botones + y − en la barra superior.
- **Guardar:** guarda el diagrama en JSON.
- **Abrir:** carga un archivo `.json` guardado antes.
- **Exportar SQL:** genera el código SQL para crear la base de datos (CREATE TABLE y FOREIGN KEY).
