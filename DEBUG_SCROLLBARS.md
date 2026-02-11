# Debug: Scrollbars No Aparecen

## 🔍 Diagnóstico

### Pasos para verificar:

1. **Abrir DevTools del navegador** (F12)
2. **Ir a la pestaña Elements/Inspector**
3. **Buscar el elemento** `.canvas-wrapper`
4. **Verificar en la pestaña Computed:**
   - `overflow-x`: debe ser `scroll`
   - `overflow-y`: debe ser `scroll`
   - `width`: debe ser menor que el contenido
   - `height`: debe ser menor que el contenido

5. **Buscar el elemento** `.canvas-container`
6. **Verificar:**
   - `width`: debe ser `10000px`
   - `height`: debe ser `10000px`

## 🛠️ Soluciones

### Solución 1: Verificar que el servidor esté actualizado

```bash
# Detener el servidor (Ctrl+C)
# Limpiar caché de Angular
npm run start -- --poll=2000
```

### Solución 2: Hard Refresh del navegador

- **Chrome/Edge**: Ctrl + Shift + R
- **Firefox**: Ctrl + Shift + R
- **Safari**: Cmd + Shift + R

### Solución 3: Verificar en DevTools Console

Ejecuta este código en la consola del navegador:

```javascript
const wrapper = document.querySelector('.canvas-wrapper');
const container = document.querySelector('.canvas-container');

console.log('Wrapper overflow:', window.getComputedStyle(wrapper).overflow);
console.log('Wrapper width:', wrapper.clientWidth);
console.log('Wrapper height:', wrapper.clientHeight);
console.log('Container width:', container.offsetWidth);
console.log('Container height:', container.offsetHeight);
console.log('¿Scrollbars deberían aparecer?', 
  container.offsetWidth > wrapper.clientWidth || 
  container.offsetHeight > wrapper.clientHeight
);
```

## 📝 Resultado Esperado

```
Wrapper overflow: scroll scroll
Wrapper width: (ej: 800)
Wrapper height: (ej: 600)
Container width: 10000
Container height: 10000
¿Scrollbars deberían aparecer?: true
```

## 🚨 Si aún no aparecen

### Opción A: Usar scrollbars nativas del sistema

Elimina toda la personalización y usa las nativas:

```css
.canvas-wrapper {
  overflow: scroll !important;
}
```

### Opción B: Forzar con JavaScript

Agrega al componente:

```typescript
ngAfterViewInit(): void {
  const wrapper = this.wrapperRef.nativeElement;
  wrapper.style.overflow = 'scroll';
  wrapper.style.overflowX = 'scroll';
  wrapper.style.overflowY = 'scroll';
}
```

## 📸 Captura de Pantalla

Por favor comparte una captura de:
1. La aplicación completa
2. DevTools mostrando el elemento `.canvas-wrapper`
3. La pestaña Computed con las propiedades de overflow

Esto ayudará a identificar el problema exacto.
