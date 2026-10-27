# language: es
@ui
Característica: Ciclo de vida de documentos tributarios (UI)
  Antecedentes:
    Dado una sesión válida en el portal

  @crear
  Escenario: UI-CRUD-01 · Crear un documento tributario
    Cuando registro un documento nuevo en UI con estos datos
      | tipoDte | monto  |
      | DTE 33  | 450000 |
    Entonces el documento creado en UI refleja todos sus datos

  @leer
  Escenario: UI-CRUD-02 · Leer el documento exacto entre documentos del mismo receptor
    Dado un documento propio y otro del mismo receptor
    Cuando consulto el documento exacto en UI
    Entonces el detalle en UI corresponde al documento propio

  @editar
  Esquema del escenario: UI-CRUD-03 · Editar el monto y conservar la identidad
    Dado un documento propio
    Cuando cambio su monto a <monto> en UI
    Entonces el cambio en UI persiste y conserva los demás datos
    Ejemplos:
      | monto  |
      | 650000 |

  @eliminar
  Escenario: UI-CRUD-04 · Eliminar un documento propio definitivamente
    Dado un documento propio
    Cuando elimino el documento en UI
    Entonces el documento ya no existe en UI
