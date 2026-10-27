import { Given, When, Then, type DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { QAWorld } from '../../support/world';
import { document, compare } from '../../api/assertions';
Given('una sesión válida', async function(this: QAWorld) { await compare(await (await this.api.call('GET', '/health', 200)).json(), { status: 'ok' }, this.evidence, 'Healthcheck completo'); });
When('registro un documento nuevo en API con estos datos', async function(this: QAWorld, table: DataTable) {
 const row = table.hashes()[0]; if (!row) throw new Error('Faltan datos'); expect(row.tipoDte).toBe('DTE 33'); this.input.monto = Number(row.monto);
 this.current = await document(await this.api.create(this.input), this.input, this.evidence);
});
Then('el documento creado en API refleja todos sus datos', async function(this: QAWorld) { await compare(await this.api.read(this.doc().id), this.doc(), this.evidence, 'Persistencia GET completo'); });
When('consulto el documento exacto en API', async function(this: QAWorld) {
 const result = await this.api.list({ rut: this.input.rutReceptor.replace(/[.\-]/g, ''), tipoDte: this.input.tipoDte, pageSize: 100 }, 2);
 expect(Array.isArray(result)).toBe(true);
 const rows = result as import('../../api/types').Document[];
 await compare(rows, [this.sibling, this.doc()], this.evidence, 'Listado completo sin claves extras');
 const selected = rows.find(row => row.folio === this.input.folio); if (!selected) throw new Error('No se encontró el folio propio en el listado'); this.current = selected;
 await this.api.absent(randomUUID());
});
Then('el detalle en API corresponde al documento propio', async function(this: QAWorld) { await compare(await this.api.read(this.doc().id), this.doc(), this.evidence, 'Detalle completo'); });
When('cambio su monto a {int} en API', async function(this: QAWorld, amount: number) {
 this.original = this.doc(); this.input.monto = amount; this.current = await document(await this.api.update(this.original.id, { monto: amount }), this.input, this.evidence, this.original);
});
Then('el cambio en API persiste y conserva los demás datos', async function(this: QAWorld) { await compare(await this.api.read(this.doc().id), this.doc(), this.evidence, 'PATCH persiste en GET'); });
When('elimino el documento en API', async function(this: QAWorld) { await this.api.remove(this.doc().id); });
Then('el documento ya no existe en API', async function(this: QAWorld) { await this.api.absent(this.doc().id); await compare(await this.api.list({ rut: this.input.rutReceptor, pageSize: 100 }, 0), [], this.evidence, 'Listado vacío'); });
