# Estándares de Calidad de Código — Portfolio & Next.js

## 1. Arquitectura y Rendimiento en React / Next.js
- Evitar renders innecesarios en componentes client-side (`useClient`).
- Asegurar el correcto uso de `requestAnimationFrame` sin memory leaks (limpieza en el `return` de los `useEffect`).
- Optimizar el uso del componente `<Image />` de Next.js (propiedades `sizes`, `priority`, y formateo de assets).

## 2. CSS & Estilos
- Mantener separación clara entre layouts 3D y reglas de accesibilidad / responsive.
- Evitar valores "hardcodeados" repetidos; promover el uso de CSS Variables (`:root`).
- Garantizar que los breakpoints móviles (`@media (max-width: 768px)`) no decoloren o rompan el ratio de aspecto.

## 3. Clean Code & Mantenibilidad
- Nombres de variables y funciones explícitos (Self-documenting code).
- Funciones pequeñas con responsabilidad única (Single Responsibility Principle).
- Mantener tipos o estructuras de objetos limpias y constantes (`ARTWORKS`, `THEME_COLORS`).

## 4. Accesibilidad (a11y) & UX Táctil
- Botones interactivos con `aria-label` o texto alternativo visible.
- Soporte nativo para eventos gestuales (`touch-action: manipulation`, manejo de gestos táctiles).