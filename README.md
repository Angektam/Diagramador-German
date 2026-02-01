# Diagramador

Aplicación de diagramas tipo [draw.io](https://app.diagrams.net) / diagrams.net: creador de diagramas de flujo y **diagramas de base de datos** con exportación a SQL.

## Cómo usar

1. Abre `index.html` en tu navegador (doble clic o arrastra el archivo a Chrome/Edge/Firefox).
2. **Añadir formas:** arrastra una forma desde el panel izquierdo ("Flujo" o "Base de datos") al lienzo.
3. **Mover formas:** haz clic en una forma y arrástrala.
4. **Editar:** selecciona una forma y usa el panel derecho para cambiar texto/colores, o **Editar tabla** si es una tabla.
5. **Zoom:** usa los botones + y − en la barra superior.
6. **Guardar:** guarda el diagrama en JSON (importar/exportar para seguir editando).
7. **Abrir:** carga un archivo `.json` guardado antes.
8. **Exportar SQL:** genera el código SQL para crear la base de datos (CREATE TABLE y FOREIGN KEY). Puedes copiarlo o descargar un archivo `.sql`.

## Diagramas de base de datos

- En el panel **Base de datos** arrastra la forma **Tabla** al lienzo.
- Selecciona la tabla y pulsa **Editar tabla (columnas y relaciones)**.
- Define el **nombre de la tabla** y las **columnas**: nombre, tipo (INT, VARCHAR, TEXT, DATE, etc.), PK (clave primaria), NULL y **Referencia (FK)** a otra tabla.
- Pulsa **SQL** en la barra superior para generar el script: `CREATE TABLE` y `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY ... REFERENCES ...`.
- El diagrama se puede **guardar (JSON)** y **abrir** para seguir modificándolo; al exportar de nuevo se regenera el SQL.

## Estructura

- `index.html` — Página principal (toolbar, panel de formas, lienzo, panel de formato, modales de tabla y SQL).
- `styles.css` — Estilos inspirados en draw.io.
- `app.js` — Lógica: formas, tablas con columnas y FK, zoom, guardar/cargar JSON, deshacer/rehacer, generación de SQL.

## Requisitos

Solo un navegador moderno. No hace falta instalar nada.
