import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { config } from '../config';
import { compare } from './assertions';
import type { Evidence, Input, Editable } from './types';
export class Client {
 private token = ''; private expiresAt = 0;
 constructor(private context: APIRequestContext, readonly runId: string, private evidence: Evidence) {}
 private async login(): Promise<void> {
  const r = await this.context.post(`${config.baseUrl}/api/auth/login`, { data: { email: config.user, password: config.password } });
  expect(r.status(), 'Login API').toBe(200);
  const body: unknown = await r.json(); 
  const expected = { token: expect.stringMatching(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/), expiresIn: expect.any(Number), user: { id: 'user-azurian-01', email: config.user, name: 'Administrador Azurian', role: 'QA Lab Participant' } };
  await this.evidence('Login esperado (token por formato)', { token: 'JWT HS256 de tres segmentos', expiresIn: 'entero 1–86400', user: expected.user });
  const safe = body as Record<string, unknown>; await this.evidence('Login obtenido (token oculto)', { ...safe, token: '[REDACTED]' }); expect(body).toEqual(expected);
  const b = body as { token: string; expiresIn: number }; expect(b.token.split('.')).toHaveLength(3); expect(Number.isInteger(b.expiresIn)).toBe(true); expect(b.expiresIn).toBeGreaterThan(0); expect(b.expiresIn).toBeLessThanOrEqual(86400);
  this.token = b.token; this.expiresAt = Date.now() + b.expiresIn * 1000;
 }
 async call(method: string, path: string, status: number, data?: unknown, params?: Record<string, string | number>): Promise<APIResponse> {
  if (Date.now() >= this.expiresAt - 30000) await this.login();
  await this.evidence('Petición API (sin credenciales)', { method, path, runId: this.runId, data, params });
  const response = await this.context.fetch(`${config.baseUrl}/api${path}`, { method, headers: { Authorization: `Bearer ${this.token}`, 'x-lab-run-id': this.runId }, data, params });
  const text = await response.text(); let body: unknown = text; try { body = text ? JSON.parse(text) as unknown : ''; } catch { /* Preserve malformed body as evidence. */ }
  await this.evidence('Respuesta API', { status: response.status(), headers: response.headers(), body });
  await this.evidence('Estado HTTP esperado', status); expect(response.status()).toBe(status); return response;
 }
 async create(input: Input): Promise<unknown> { return (await this.call('POST', '/documents', 201, input)).json(); }
 async read(id: string): Promise<unknown> { return (await this.call('GET', `/documents/${id}`, 200)).json(); }
 async list(params: Record<string, string | number>, expectedTotal?: number): Promise<unknown> {
  const r = await this.call('GET', '/documents', 200, undefined, params); expect(r.headers()['x-total-count']).toMatch(/^\d+$/);
  if (expectedTotal !== undefined) await compare(r.headers()['x-total-count'], String(expectedTotal), this.evidence, 'Total del listado');
  return r.json();
 }
 async update(id: string, changes: Editable): Promise<unknown> { return (await this.call('PATCH', `/documents/${id}`, 200, changes)).json(); }
 async remove(id: string): Promise<void> { const r = await this.call('DELETE', `/documents/${id}`, 204); await compare(await r.text(), '', this.evidence, 'DELETE sin cuerpo'); }
 async absent(id: string): Promise<void> { const r = await this.call('GET', `/documents/${id}`, 404); await compare(await r.json(), { error: config.notFound, code: 'NOT_FOUND' }, this.evidence, 'Error 404 completo'); }
}
