# Cambios frente a la primera versión

- Login: nombres accesibles Usuario o Correo Electrónico, Contraseña e Iniciar Sesión.
- Formulario: labels completos con asterisco; tipo seleccionado por su valor DTE; acciones Guardar y emitir y Guardar cambios.
- Tabla: folio con prefijo #, estado Pendiente, monto es-CL y acciones con folio en aria-label.
- Filtro: clic en Buscar; espera del GET del RUT exacto y de Cargando documentos.
- Avisos: role=status y mensajes exactos por folio.
- Confirmación: role=alertdialog, Eliminar documento y descripción con folio/RUT.
- Tabla vacía: una fila informativa, cero acciones Ver detalle y cero documentos encontrados.
- Detalle: campos visibles, canal/copia, timestamps según la zona del navegador y comparación completa de la respuesta.
- API: contrato 404 confirmado, login con objeto user completo, listado completo en orden fecha/folio descendente y selección por folio desde ese listado.
- Evidencia: POST/PUT/DELETE UI también adjuntan respuesta y esperado; creación y edición UI se cruzan con GET API.

Fuentes: README.md, docs/ENUNCIADO_PRUEBA.md, src/app/login/page.tsx, src/app/dashboard/page.tsx, src/components/DocumentFormModal.tsx, DocumentDetailDialog.tsx, ConfirmDeleteDialog.tsx, StatusBadge.tsx, src/app/api/auth/login/route.ts y src/lib/errors.ts del ZIP adjunto.
