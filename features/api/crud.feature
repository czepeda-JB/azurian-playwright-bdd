# language: es
@api
Característica: Ciclo de vida de documentos tributarios (API)
  Antecedentes:
    Dado una sesión válida

  @crear
  Escenario: API-CRUD-01 · Crear un documento tributario
    Cuando registro un documento nuevo en API con estos datos
      | tipoDte | monto  |
      | DTE 33  | 450000 |
    Entonces el documento creado en API refleja todos sus datos

  @leer
  Escenario: API-CRUD-02 · Leer el documento exacto entre documentos del mismo receptor
    Dado un documento propio y otro del mismo receptor
    Cuando consulto el documento exacto en API
    Entonces el detalle en API corresponde al documento propio

  @editar
  Esquema del escenario: API-CRUD-03 · Editar el monto y conservar la identidad
    Dado un documento propio
    Cuando cambio su monto a <monto> en API
    Entonces el cambio en API persiste y conserva los demás datos
    Ejemplos:
      | monto  |
      | 650000 |

  @eliminar
  Escenario: API-CRUD-04 · Eliminar un documento propio definitivamente
    Dado un documento propio
    Cuando elimino el documento en API
    Entonces el documento ya no existe en API
