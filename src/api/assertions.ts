import { expect } from '@playwright/test';
import type { Document, Evidence, Input } from './types';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
export async function compare(actual: unknown, expected: unknown, attach: Evidence, name: string): Promise<void> {
 await attach(`${name}: esperado`, expected); await attach(`${name}: obtenido`, actual); expect(actual, name).toEqual(expected);
}
export async function document(actual: unknown, input: Input, attach: Evidence, previous?: Document): Promise<Document> {
 const expected = { ...input, contactEmail: input.contactEmail ?? null, sendCopy: input.sendCopy ?? false, deliveryChannel: input.deliveryChannel ?? 'PORTAL', observaciones: input.observaciones ?? null, attachmentName: input.attachmentName ?? null, id: previous?.id ?? expect.stringMatching(uuid), estado: 'PENDIENTE', createdAt: previous?.createdAt ?? expect.stringMatching(iso), updatedAt: expect.stringMatching(iso) };
 await compare(actual, expected, attach, 'Cuerpo completo del documento');
 const result = actual as Document;
 expect(Number.isNaN(Date.parse(result.createdAt))).toBe(false); expect(Number.isNaN(Date.parse(result.updatedAt))).toBe(false);
 expect(Date.parse(result.updatedAt)).toBeGreaterThanOrEqual(Date.parse(result.createdAt));
 if (previous) expect(Date.parse(result.updatedAt)).toBeGreaterThanOrEqual(Date.parse(previous.updatedAt));
 return result;
}
