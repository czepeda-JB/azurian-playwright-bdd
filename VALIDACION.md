# Validación de la automatización

La corrida funcional conservada en el ZIP registra ocho escenarios aprobados: cuatro de API y cuatro de UI. Este documento distingue los resultados de esa corrida de las comprobaciones estáticas y del dry-run.

## Comprobaciones de código y configuración

- TypeScript estricto: comprobación de tipos completada sin errores.
- Cucumber dry-run: ocho escenarios y 30 pasos reconocidos, sin pasos indefinidos. Los estados `skipped` corresponden al dry-run y no equivalen a una ejecución funcional aprobada.
- Contratos y localizadores: contrastados durante la adaptación con el código fuente del laboratorio.
- La suite no utiliza mocks como sustituto del laboratorio ni contiene operaciones para modificar directamente PostgreSQL, las latencias o los datos semilla.

## Resultado funcional incluido

Los archivos `allure-results/*-result.json` incluidos en el ZIP registran una ejecución del 13 de octubre de 2026, según sus marcas de tiempo.

| Capa | Escenarios | Aprobados | Fallidos |
|---|---:|---:|---:|
| API | 4 | 4 | 0 |
| UI | 4 | 4 | 0 |
| Total | 8 | 8 | 0 |

Escenarios registrados:

- API-CRUD-01: crear un documento tributario.
- API-CRUD-02: leer el documento exacto entre documentos del mismo receptor.
- API-CRUD-03: editar el monto y conservar la identidad.
- API-CRUD-04: eliminar un documento propio definitivamente.
- UI-CRUD-01: crear un documento tributario.
- UI-CRUD-02: leer el documento exacto entre documentos del mismo receptor.
- UI-CRUD-03: editar el monto y conservar la identidad.
- UI-CRUD-04: eliminar un documento propio definitivamente.

## Evidencias

El ZIP incluye resultados Allure y un reporte generado. Los resultados contienen adjuntos con peticiones API, respuestas, estados HTTP y comparaciones entre cuerpos esperados y obtenidos, además de verificaciones de datos visibles en UI.

Los 216 adjuntos referenciados directamente por los resultados están presentes. Los hooks incorporan además evidencia de aislamiento por escenario, cuatro videos y cuatro traces correspondientes a los escenarios UI. La captura de pantalla en caso de fallo está configurada en el código; la corrida incluida no registra escenarios fallidos.

Los traces pueden contener datos de sesión y deben mantenerse privados.

## Alcance de la validación

Los ocho estados aprobados corresponden a la corrida conservada en el ZIP. La revisión posterior comprobó los archivos de resultados, sus adjuntos, los tipos TypeScript y el enlace de pasos mediante dry-run; no volvió a ejecutar el CRUD contra el laboratorio.

La evidencia incluida no demuestra estabilidad en múltiples corridas ni una ejecución funcional en paralelo. Las validaciones negativas adicionales y el envío al SII no forman parte de estos ocho escenarios.

Las limitaciones de Docker, PostgreSQL y descarga de Chromium descritas en la validación inicial correspondían al entorno de aquella revisión. No invalidan los resultados funcionales que se incorporaron al ZIP.

## Reproducir la ejecución

Con el laboratorio Docker saludable, Chromium instalado y `BASE_URL` configurado, ejecutar desde la carpeta de la suite:

```powershell
npm run check
npm run clean
npm test
npm run report:generate
npm run report:open
```

`npm run clean` elimina resultados locales anteriores; conservar primero cualquier evidencia que se quiera mantener. No ejecutarlo entre la corrida y la generación del reporte.

Generar el reporte también si la suite falla, para revisar las evidencias. Registrar la fecha y el resultado reales de cada nueva corrida. Si se amplían los ejemplos parametrizados, actualizar los conteos después de ejecutar la versión modificada.

## Entrega

La publicación de la solución en un repositorio público, la comprobación de su acceso y el envío del enlace dentro del plazo de la convocatoria deben confirmarse por separado. Los resultados del ZIP no acreditan esas acciones.
