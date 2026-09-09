# Sweet Cost

Sweet Cost es una aplicación web desarrollada para facilitar el cálculo de costos y precios de productos de repostería.

El sistema permite registrar materias primas, insumos, recetas y cotizaciones para conocer el costo real de producción y obtener un precio de venta sugerido.

## Objetivo

El objetivo de Sweet Cost es ayudar a pequeños emprendimientos de repostería a llevar un mejor control de sus costos de producción y establecer precios de venta de manera más precisa.

La aplicación busca evitar cálculos manuales y centralizar la información necesaria para conocer cuánto cuesta realmente elaborar y vender un producto.

## Funcionalidades

### Productos

Permite registrar los productos y materias primas utilizados en las recetas.

Cada producto puede incluir:

- Nombre
- Marca
- Tipo de producto
- Cantidad comprada
- Unidad de medida
- Precio de compra
- Densidad
- Cantidad utilizada por uso para toppings y salsas

El sistema calcula automáticamente el costo unitario de cada producto.

### Insumos

Permite registrar materiales utilizados durante la preparación y entrega de los productos, por ejemplo:

- Cajas
- Bolsas
- Servilletas
- Cubiertos
- Stickers
- Materiales adicionales

El costo de cada insumo se calcula según su cantidad y presentación de compra.

### Recetas

Permite crear recetas indicando:

- Nombre
- Descripción
- Rendimiento
- Ingredientes
- Cantidad utilizada de cada ingrediente

El sistema calcula automáticamente:

- Costo total de la receta
- Costo por unidad producida

### Cotizador

Permite crear cotizaciones a partir de una receta y agregar elementos adicionales a una venta.

Se pueden incluir:

- Cantidad de productos
- Toppings
- Salsas
- Insumos
- Mano de obra
- Margen de ganancia

El sistema calcula:

- Costo de la receta
- Costo de extras
- Costo de insumos
- Costo de producción
- Costo total
- Precio de venta sugerido

## Conversión de medidas

Sweet Cost incluye funciones para trabajar con diferentes unidades de medida, como:

- Gramos (g)
- Kilogramos (kg)
- Mililitros (ml)
- Litros (l)
- Unidades

También permite realizar conversiones entre masa y volumen utilizando la densidad cuando es necesario.

## Cálculo del precio de venta

El precio de venta sugerido se calcula utilizando el costo total y el margen de ganancia seleccionado.

La fórmula utilizada es:

Precio de venta = Costo total / (1 - Margen / 100)

Por ejemplo, si un producto tiene un costo total de ₡1.000 y se desea obtener un margen del 30%:

Precio de venta = ₡1.000 / (1 - 0.30)

Precio de venta = ₡1.428,57

## Tecnologías utilizadas

- React
- Vite
- JavaScript
- HTML
- CSS
- React Router
- JSON Server

## Estructura del proyecto

```text
src/
├── components/
│   ├── Nav/
│   ├── Productos/
│   ├── Insumos/
│   ├── Recetas/
│   ├── ConversorMedidas/
│   ├── Cotizador/
│   └── Confirmacion/
│
├── pages/
│   ├── Home/
│   ├── Productos/
│   ├── Insumos/
│   ├── Recetas/
│   └── Cotizador/
│
├── services/
│   ├── productoServices.js
│   ├── insumoServices.js
│   ├── recetaServices.js
│   └── cotizadorServices.js
│
├── routes/
│   └── AppRoutes.jsx
│
└── utils/
    └── calculosCostos.js