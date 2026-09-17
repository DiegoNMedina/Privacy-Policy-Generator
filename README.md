# Generador de avisos de privacidad

Aplicación estática sin dependencias, backend, cookies propias ni almacenamiento persistente. Abre `index.html` en un navegador o sirve esta carpeta con MAMP. No necesita compilarse. Los enlaces de fuentes abren sitios externos únicamente al pulsarlos.

## Uso

1. Identifica al responsable, domicilio, mercados atendidos e idioma del documento.
2. Elige un perfil (informativo, landing, contacto o WooCommerce) y confirma las funciones realmente habilitadas. Los perfiles reemplazan la selección; no presuponen Analytics, reCAPTCHA, cuentas ni envíos.
3. Completa los proveedores y mecanismos de privacidad que correspondan. Los textos libres deben estar en el idioma del documento.
4. Revisa el documento, confirma los datos y copia texto/HTML para WordPress o descarga TXT/HTML independiente.

El idioma del formulario es español; el documento puede generarse en español o inglés, independientemente de la jurisdicción. Los datos se pierden al recargar o cerrar la pestaña.

## Organización

- `index.html`: formulario semántico y estructura de las cuatro pantallas.
- `assets/css/styles.css`: presentación y adaptación a pantallas pequeñas.
- `assets/js/catalog.js`: catálogo bilingüe de servicios y perfiles iniciales.
- `assets/js/rules.js`: validaciones y detección de escenarios que requieren revisión.
- `assets/js/policy.js`: composición del documento, numeración y serialización segura a texto/HTML; sin acceso al DOM.
- `assets/js/app.js`: navegación, campos condicionales, vista previa, portapapeles y descargas.
- `tests/policy.test.js`: pruebas con el runner nativo de Node.
- `docs/legal-scope.md`: alcance, fuentes y mantenimiento jurídico.

Los scripts clásicos se cargan en ese orden para admitir también apertura directa desde archivos. El motor y las reglas exportan CommonJS para las pruebas. Para agregar un servicio, incorpora su entrada bilingüe al catálogo y sus categorías, finalidades, retención y reglas condicionales al motor. Agrega una prueba para inclusión y exclusión.

## Comprobación

```sh
node --test tests/policy.test.js
```

Las pruebas cubren 24 combinaciones de perfil, idioma y jurisdicción, selección de campos, servicios opcionales, casos especiales, datos de campos ocultos, validaciones y escape de contenido HTML. Son pruebas funcionales, no una certificación jurídica.

## Decisiones de producto

No se permite avanzar o exportar con datos esenciales incompletos o contradicciones conocidas. Se puede descargar un **borrador** cuando falte confirmar las prácticas o existan escenarios de revisión específica; la marca se incluye en texto, vista previa, ambos HTML y nombre de archivo. La confirmación nunca elimina esos pendientes. Los cambios de respuestas invalidan la confirmación anterior.

No se instalan banners, integraciones, consentimientos ni mecanismos para derechos. El sitio real debe implementarlos. Los campos ocultos de servicios desactivados no deben afectar sus cláusulas ni sus validaciones.
