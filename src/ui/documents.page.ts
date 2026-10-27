import { expect, type Page, type Locator, type Response } from '@playwright/test';
import { config } from '../config';
import type { Document, Input, Evidence } from '../api/types';
import { compare, document } from '../api/assertions';
import { labels as L } from './labels';
export class DocumentsPage {
 constructor(private page: Page, private evidence: Evidence) {}
 private button(name: string): Locator { return this.page.getByRole('button', { name, exact: true }); }
 private table(): Locator { return this.page.getByRole('table', { name: L.table, exact: true }); }
 private async ready(): Promise<void> {
  await expect(this.page.getByRole('status', { name: L.loading, exact: true })).toBeHidden();
  await expect(this.table()).toBeVisible();
  // Next.js publica anuncios de navegación con role=alert fuera de main.
  const alerts = this.page.getByRole('main').getByRole('alert');
  await this.evidence('Errores del dashboard: esperado/obtenido', { expected: [], actual: await alerts.allTextContents() });
  await expect(alerts).toHaveCount(0);
 }
 private listResponse(r: Response): boolean { return new URL(r.url()).pathname === '/api/documents' && r.request().method() === 'GET'; }
 private mutation(r: Response, method: string, id?: string): boolean {
  return new URL(r.url()).pathname === `/api/documents${id ? `/${id}` : ''}` && r.request().method() === method;
 }
 private async verifyResponse(r: Response, status: number): Promise<unknown> {
  const text = await r.text(); const body: unknown = text ? JSON.parse(text) as unknown : '';
  await this.evidence('Respuesta operación UI', { method: r.request().method(), path: new URL(r.url()).pathname, expectedStatus: status, actualStatus: r.status(), body });
  expect(r.status()).toBe(status); return body;
 }
 private async notice(d: Input, action: 'emitido' | 'actualizado' | 'eliminado'): Promise<void> {
  const expected = L.notice(d.folio, action); const locator = this.page.getByRole('status').filter({ hasText: expected });
  await this.evidence('Aviso UI esperado', expected); await expect(locator).toHaveText(expected); await this.evidence('Aviso UI obtenido', await locator.innerText());
 }
 async login(): Promise<void> {
  await this.page.goto(`${config.baseUrl}/login`);
  await this.page.getByLabel(L.email, { exact: true }).fill(config.user);
  await this.page.getByLabel(L.password, { exact: true }).fill(config.password);
  const event = this.page.waitForResponse(r => this.listResponse(r));
  await this.button(L.login).click(); expect((await event).status()).toBe(200);
  await expect(this.page).toHaveURL(`${config.baseUrl}/dashboard`); await this.ready();
 }
 async create(d: Input): Promise<Document> {
  await this.button(L.newDocument).click(); const dialog = this.page.getByRole('dialog', { name: 'Emitir nuevo documento', exact: true });
  await expect(dialog).toBeVisible(); await dialog.getByLabel(L.type, { exact: true }).selectOption(d.tipoDte);
  await dialog.getByLabel(L.folio, { exact: true }).fill(String(d.folio)); await this.fillEditable(dialog, d);
  const event = this.page.waitForResponse(r => this.mutation(r, 'POST'));
  await dialog.getByRole('button', { name: L.emit, exact: true }).click();
  const created = await document(await this.verifyResponse(await event, 201), d, this.evidence);
  await this.notice(d, 'emitido'); await expect(dialog).toBeHidden(); await this.ready(); return created;
 }
 private async fillEditable(dialog: Locator, d: Pick<Input, 'rutReceptor' | 'monto' | 'fechaEmision'>): Promise<void> {
  await dialog.getByLabel(L.rut, { exact: true }).fill(d.rutReceptor);
  await dialog.getByLabel(L.amount, { exact: true }).fill(String(d.monto));
  await dialog.getByLabel(L.date, { exact: true }).fill(d.fechaEmision);
 }
 async filter(d: Input): Promise<void> {
  await this.ready(); await this.page.getByRole('textbox', { name: L.filterRut, exact: true }).fill(d.rutReceptor);
  const event = this.page.waitForResponse(r => this.listResponse(r) && new URL(r.url()).searchParams.get('rut') === d.rutReceptor);
  await this.button(L.search).click(); expect((await event).status()).toBe(200); await this.ready();
 }
 row(d: Input): Locator {
  return this.table().getByRole('row').filter({ has: this.page.getByRole('cell', { name: `#${d.folio}`, exact: true }) })
   .filter({ has: this.page.getByRole('cell', { name: d.rutReceptor, exact: true }) });
 }
 async verifyRow(d: Input): Promise<void> {
  await this.ready(); const row = this.row(d); await expect(row).toHaveCount(1);
  const expected = [`#${d.folio}`, d.tipoDte, d.rutReceptor, `$ ${d.monto.toLocaleString('es-CL')} CLP`, d.fechaEmision, 'Pendiente'];
  await this.evidence('Fila UI esperada', expected); await this.evidence('Fila UI obtenida', await row.innerText());
  for (const value of expected) await expect(row.getByRole('cell', { name: value, exact: true })).toBeVisible();
 }
 async detail(d: Document): Promise<void> {
  const event = this.page.waitForResponse(r => this.mutation(r, 'GET', d.id));
  await this.row(d).getByRole('button', { name: L.detail(d.folio), exact: true }).click();
  await compare(await this.verifyResponse(await event, 200), d, this.evidence, 'Detalle solicitado por UI: cuerpo completo');
  const dialog = this.page.getByRole('dialog', { name: `Detalle DTE - Folio #${d.folio}`, exact: true });
  await expect(dialog).toBeVisible(); await expect(dialog.getByRole('status', { name: 'Cargando detalle del documento', exact: true })).toBeHidden();
  const expected = [`Tipo: ${d.tipoDte}`, `RUT Receptor: ${d.rutReceptor}`, `Monto: $ ${d.monto.toLocaleString('es-CL')} CLP`, `Fecha Emisión: ${d.fechaEmision}`, 'Estado: Pendiente', `Canal: ${d.deliveryChannel}`, `Copia al contacto: ${d.sendCopy ? 'Sí' : 'No'}`];
  if (d.contactEmail) expected.push(`Correo de contacto: ${d.contactEmail}`);
  if (d.attachmentName) expected.push(`Adjunto: ${d.attachmentName}`);
  if (d.observaciones) expected.push(`Observaciones: ${d.observaciones}`);
  await this.evidence('Detalle UI esperado', expected); await this.evidence('Detalle UI obtenido', await dialog.innerText());
  for (const value of expected) await expect(dialog).toContainText(value);
  for (const [label, iso] of [['Creado:', d.createdAt], ['Última modificación:', d.updatedAt]]) {
   if (!iso) throw new Error('Falta timestamp');
   const formatted = await this.page.evaluate(value => new Date(value).toLocaleString('es-CL'), iso);
   await expect(dialog).toContainText(`${label} ${formatted}`);
  }
 }
 async edit(previous: Document, d: Input): Promise<Document> {
  const load = this.page.waitForResponse(r => this.mutation(r, 'GET', previous.id));
  await this.row(d).getByRole('button', { name: L.edit(d.folio), exact: true }).click();
  await compare(await this.verifyResponse(await load, 200), previous, this.evidence, 'Documento cargado para editar');
  const dialog = this.page.getByRole('dialog', { name: `Editar documento - Folio #${d.folio}`, exact: true });
  await expect(dialog.getByLabel(L.type, { exact: true })).toBeDisabled(); await expect(dialog.getByLabel(L.folio, { exact: true })).toBeDisabled();
  await this.fillEditable(dialog, d);
  const event = this.page.waitForResponse(r => this.mutation(r, 'PUT', previous.id));
  await dialog.getByRole('button', { name: L.save, exact: true }).click();
  const updated = await document(await this.verifyResponse(await event, 200), d, this.evidence, previous);
  await this.notice(d, 'actualizado'); await expect(dialog).toBeHidden(); await this.ready(); return updated;
 }
 async remove(d: Document): Promise<void> {
  await this.row(d).getByRole('button', { name: L.remove(d.folio), exact: true }).click();
  const dialog = this.page.getByRole('alertdialog', { name: 'Eliminar documento', exact: true });
  await expect(dialog).toBeVisible(); await expect(dialog).toContainText(`folio #${d.folio}`); await expect(dialog).toContainText(d.rutReceptor);
  const event = this.page.waitForResponse(r => this.mutation(r, 'DELETE', d.id));
  await dialog.getByRole('button', { name: L.confirm, exact: true }).click();
  await compare(await this.verifyResponse(await event, 204), '', this.evidence, 'DELETE UI sin cuerpo');
  await this.notice(d, 'eliminado'); await expect(dialog).toBeHidden(); await this.ready();
 }
 async reload(): Promise<void> {
  const event = this.page.waitForResponse(r => this.listResponse(r)); await this.page.reload(); expect((await event).status()).toBe(200); await this.ready();
 }
 async absent(d: Input): Promise<void> {
  await this.ready(); await expect(this.row(d)).toHaveCount(0);
  // La tabla vacía conserva una fila informativa, no es un registro de negocio.
  const empty = this.table().getByRole('row').filter({ hasText: L.empty }); await expect(empty).toHaveCount(1);
  await expect(this.table().getByRole('row').filter({ has: this.page.getByRole('button', { name: /^Ver detalle de folio / }) })).toHaveCount(0);
  await expect(this.page.getByText('0 documentos encontrados', { exact: true })).toBeVisible();
  await this.evidence('Eliminación UI esperada/obtenida', { expectedBusinessRows: 0, actualBusinessRows: await this.row(d).count(), actualEmptyMessage: await empty.innerText() });
 }
}
