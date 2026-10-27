// Nombres accesibles confirmados en el código del laboratorio adjunto.
export const labels = {
 email: 'Usuario o Correo Electrónico', password: 'Contraseña', login: 'Iniciar Sesión',
 newDocument: 'Nuevo documento', type: 'Tipo de documento tributario *', folio: 'Número de folio *',
 rut: 'RUT receptor *', amount: 'Monto total (CLP) *', date: 'Fecha de emisión *',
 emit: 'Guardar y emitir', filterRut: 'Buscar por RUT Receptor', search: 'Buscar', save: 'Guardar cambios',
 confirm: 'Eliminar documento', empty: 'No se encontraron documentos DTE para los criterios seleccionados.',
 table: 'Tabla de Documentos Tributarios', loading: 'Cargando documentos',
 detail: (folio: number) => `Ver detalle de folio ${folio}`,
 edit: (folio: number) => `Editar folio ${folio}`,
 remove: (folio: number) => `Eliminar folio ${folio}`,
 notice: (folio: number, action: 'emitido' | 'actualizado' | 'eliminado') => `Documento folio ${folio} ${action} correctamente.`,
};
