# 🧪 Prueba de Plantillas SQL

## Objetivo
Verificar que las plantillas generen SQL correcto con relaciones detectables.

## SQL Esperado para E-Commerce

```sql
-- Schema: E-Commerce
-- Sistema completo de comercio electrónico con productos, usuarios, carritos y órdenes
-- Generated from DummyJSON API

CREATE TABLE products (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discountPercentage DECIMAL(5,2),
  rating DECIMAL(3,2),
  stock INT NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  thumbnail VARCHAR(500)
);

CREATE TABLE users (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  username VARCHAR(50) NOT NULL UNIQUE,
  birthDate DATE,
  image VARCHAR(500),
  address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postalCode VARCHAR(20)
);

CREATE TABLE carts (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  userId INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  discountedTotal DECIMAL(10,2) NOT NULL,
  totalProducts INT NOT NULL,
  totalQuantity INT NOT NULL,
  CONSTRAINT fk_carts_userId FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE TABLE cart_items (
  id INT NOT NULL UNIQUE PRIMARY KEY,
  cartId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  discountPercentage DECIMAL(5,2),
  discountedPrice DECIMAL(10,2),
  CONSTRAINT fk_cart_items_cartId FOREIGN KEY (cartId) REFERENCES carts(id),
  CONSTRAINT fk_cart_items_productId FOREIGN KEY (productId) REFERENCES products(id)
);

-- Indexes for better performance
CREATE INDEX idx_carts_userId ON carts(userId);
CREATE INDEX idx_cart_items_cartId ON cart_items(cartId);
CREATE INDEX idx_cart_items_productId ON cart_items(productId);
```

## Relaciones Esperadas

### E-Commerce
1. **users → carts**: Un usuario puede tener múltiples carritos
2. **carts → cart_items**: Un carrito tiene múltiples items
3. **products → cart_items**: Un producto puede estar en múltiples items

### Blog
1. **users → posts**: Un usuario puede crear múltiples posts
2. **posts → comments**: Un post puede tener múltiples comentarios
3. **users → comments**: Un usuario puede hacer múltiples comentarios

### Recetas
1. **recipes → recipe_ingredients**: Una receta tiene múltiples ingredientes
2. **ingredients → recipe_ingredients**: Un ingrediente puede estar en múltiples recetas
3. **recipes → instructions**: Una receta tiene múltiples instrucciones

### Citas
1. **authors → quotes**: Un autor puede tener múltiples citas

## Checklist de Prueba

- [ ] Abrir "Plantillas de Esquemas"
- [ ] Seleccionar plantilla "E-Commerce"
- [ ] Click en "Generar Esquema"
- [ ] Verificar que aparecen 4 tablas
- [ ] Verificar que hay 3 conexiones visibles:
  - [ ] users → carts
  - [ ] carts → cart_items
  - [ ] products → cart_items
- [ ] Probar con plantilla "Blog"
- [ ] Verificar 3 conexiones
- [ ] Probar con plantilla "Recetas"
- [ ] Verificar 3 conexiones
- [ ] Probar con plantilla "Citas"
- [ ] Verificar 1 conexión

## Formato de Foreign Key

El formato correcto que el parser detecta es:
```sql
CONSTRAINT nombre_constraint FOREIGN KEY (columna) REFERENCES tabla(columna)
```

Este formato debe estar DENTRO del CREATE TABLE, no en ALTER TABLE separado.

## Resultado Esperado

✅ Todas las tablas se crean  
✅ Todas las relaciones se visualizan como líneas conectoras  
✅ Las foreign keys se detectan correctamente  
✅ El SQL descargado es válido

## Problemas Conocidos (Resueltos)

❌ **Problema anterior**: Las foreign keys se generaban con ALTER TABLE  
✅ **Solución**: Ahora se generan inline dentro del CREATE TABLE  

---

**Fecha**: 7 de Marzo de 2026  
**Estado**: ✅ Corregido
