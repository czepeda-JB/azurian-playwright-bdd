# Automatización práctica Azurian — Playwright + Cucumber + Allure

Suite adaptada al código de `com-azurian-qa-evaluacion.zip`, incluidos README, enunciado, componentes UI y rutas API. Incluye 8 escenarios independientes: CRUD de UI y CRUD de API. **La corrida funcional incluida registra 8 escenarios aprobados: 4 de API y 4 de UI. La comprobación de tipos TypeScript y el dry-run también se verificaron.**

## Requisitos
- Node.js 22 o 24 (ver `node --version`), npm, Docker Desktop para el laboratorio.
- Java instalado y en PATH para Allure CLI: `java -version`.
- Chromium de Playwright instalado mediante el comando de abajo.
- No sustituir el laboratorio por mocks para considerar aprobada la prueba.

## Iniciar el laboratorio (PowerShell, terminal 1)
```powershell
Set-Location "C:\Users\czepeda\Documents\com-azurian-qa-evaluacion"
docker compose up -d --build
docker compose ps
Invoke-RestMethod "http://localhost:3100/api/health"
```
Este puerto supone `APP_PORT=3100` en el `.env` del laboratorio. Si Docker publica 3000, ajustar la URL del healthcheck y `BASE_URL` en el `.env` de la suite. Health debe responder `status: ok`. La suite no modifica el código del laboratorio, la base de datos directamente, las latencias ni el seed.

## Instalar la suite (PowerShell, terminal 2)
Extraer el ZIP; mantener la suite en una carpeta independiente del laboratorio.
```powershell
Set-Location "C:\Users\czepeda\Documents\azurian-playwright-bdd"
node --version
npm install
npx playwright install chromium
Copy-Item .env.example .env
npm run check
npm run test:dry -- --format summary
```
Copiar `.env.example` únicamente en la primera instalación para no sobrescribir ajustes propios. La configuración centralizada define `BASE_URL`, `QA_USER`, `QA_PASSWORD` y `HEADLESS`. Las credenciales del ejemplo son las credenciales públicas del laboratorio; no incluir credenciales reales en un repositorio público.

En bash: `cp .env.example .env`. Tras la instalación inicial, `npm ci` instala las versiones fijadas en `package-lock.json`.

## Ejecutar y generar reporte
```powershell
npm run clean
npm test
npm run report:generate
npm run report:open
```
Ejecutar los comandos de reporte también si `npm test` falla, para inspeccionar la evidencia. No ejecutar `clean` entre la corrida y la generación del reporte.

Filtros e identificación:
```powershell
npm run test:api
npm run test:ui
npm run test:crear
npm run test:leer
npm run test:editar
npm run test:eliminar
npm test -- --tags "@ui and @editar"
npm test -- --name "API-CRUD-01"
npm test -- --parallel 2
```
`npm run clean` borra exclusivamente resultados locales de la suite. Por defecto no hay reintentos: un fallo no queda oculto por una segunda ejecución. Para ver el navegador, establecer `HEADLESS=false` en `.env`.

## Cobertura
| ID | Verificaciones principales |
|---|---|
| API-CRUD-01 | POST 201, cuerpo completo con UUID/fechas, defaults y GET idéntico |
| API-CRUD-02 | Dos documentos del mismo RUT, filtros RUT+tipo, lista completa en orden contractual, x-total-count, selección por folio, detalle y error 404 completo |
| API-CRUD-03 | PATCH 200, monto actualizado, identidad/campos conservados, GET idéntico |
| API-CRUD-04 | DELETE 204 sin cuerpo, 404 completo y listado vacío |
| UI-CRUD-01 | Login, formulario real, POST 201, aviso, fila exacta y persistencia en API |
| UI-CRUD-02 | Preparación API con dos documentos del mismo RUT, Buscar, fila exacta y detalle visible, respuesta completa del detalle |
| UI-CRUD-03 | PUT del formulario real, controles inmutables bloqueados, aviso, fila actualizada, recarga y GET completo |
| UI-CRUD-04 | alertdialog real con folio/RUT, DELETE 204, aviso, ausencia antes/después de recargar, 404 y lista vacía |

## Arquitectura y estabilidad
- `features/api` y `features/ui`: Gherkin de negocio en español, Antecedentes, tabla de datos, Esquema/Ejemplos y tags por capa/operación.
- `src/api`: tipos estrictos, cliente API modular y verificadores de cuerpos completos.
- `src/ui`: Page Object y catálogo de nombres accesibles confirmados en el código adjunto.
- `src/steps`: pasos separados por capa y preparación compartida de documentos propios.
- `src/support`: World, datos y hooks por escenario; `src/config.ts` centraliza configuración.
- Cucumber controla Playwright; no se requiere `playwright.config.ts`.
- Un runId UUID diferente por escenario se usa en API y localStorage. Los RUT módulo 11 se generan fuera del rango de receptores semilla; folios aleatorios fuera del rango del seed. La lectura crea deliberadamente dos folios del mismo RUT.
- Locators por roles/labels y fila por folio+RUT; se valida además monto, tipo, fecha y estado. Sin first/nth, IDs internos, clases visuales, XPath ni pausas fijas.
- Se espera la respuesta de la operación exacta, la desaparición de la carga y el estado visible. El filtro se envía con Buscar, también después de una recarga (la aplicación reinicia los filtros al recargar).
- API renueva token antes de su vencimiento; no se adjuntan contraseña ni JWT de login a Allure.
- Error NOT_FOUND fijado según `src/lib/errors.ts`: `{error: "El documento no existe en esta ejecución.", code: "NOT_FOUND"}`; no se infiere el esperado de la respuesta recibida.
- Tabla vacía: el portal conserva una fila informativa. Se comprueba ausencia de filas de negocio y texto de cero resultados.

## Resultado de la corrida incluida

Los archivos `allure-results/*-result.json` incluidos en el ZIP registran la siguiente ejecución, con fecha 13 de octubre de 2026 según sus marcas de tiempo:

| Capa | Escenarios | Aprobados | Fallidos |
|---|---:|---:|---:|
| API | 4 | 4 | 0 |
| UI | 4 | 4 | 0 |
| Total | 8 | 8 | 0 |

Los resultados incluyen los ocho casos de la tabla de cobertura. También se incluyen cuatro videos y cuatro traces, correspondientes a los escenarios UI, y adjuntos con peticiones, respuestas y comparaciones entre lo esperado y lo obtenido.

Estos resultados corresponden a la corrida conservada en el ZIP; no representan una ejecución nueva en el equipo de quien descarga el proyecto ni demuestran estabilidad en múltiples corridas. Para reproducirlos, iniciar el laboratorio y ejecutar los comandos de esta guía.

El dry-run reconoce 8 escenarios y 30 pasos. Los estados `skipped` del dry-run son esperados: ese comando valida el enlace de los pasos, pero no ejecuta el CRUD ni equivale a una prueba funcional aprobada.

## Evidencias
Allure adjunta peticiones API, respuestas, estados esperados, cuerpos esperados/obtenidos y datos visibles de UI. Los matchers dinámicos se describen en los adjuntos. Los escenarios UI adjuntan video y trace; un fallo adjunta además captura de pantalla.
Los traces pueden contener datos de sesión: mantenerlos privados. `node_modules`, `.env`, compilados y evidencias están excluidos de Git. Los documentos no se borran en teardown para no ocultar un fallo de eliminación; los runId mantienen el aislamiento.

## Validación y entrega
La cobertura actual consta de ocho escenarios, con los resultados descritos en esta guía. Los extras de validación negativa y envío al SII no forman parte de estos escenarios.

`ADAPTACION.md` describe la adaptación al laboratorio. `VALIDACION.md` conserva notas de la validación inicial y debe actualizarse antes de la entrega para reflejar la corrida funcional incluida; sus afirmaciones de ejecución pendiente corresponden al estado anterior.

Antes de entregar, ejecutar nuevamente la suite en el entorno de destino, generar Allure y registrar el resultado real. Si se amplían los ejemplos parametrizados, actualizar los conteos únicamente después de ejecutar la nueva versión.
La entrega formal requiere publicar la solución en un repositorio público y enviar su enlace respondiendo al correo de la convocatoria dentro del plazo indicado. La publicación, el acceso público y el envío del enlace no están acreditados por el ZIP; deben confirmarse por separado.
