import { randomInt, randomUUID } from 'node:crypto';
import type { Input } from '../api/types';
export const runId = (): string => `qa_${randomUUID().replace(/-/g, '')}`;
export function data(): Input {
 const n = randomInt(20000000, 50000000); let sum = 0; let weight = 2;
 for (const c of String(n).split('').reverse()) { sum += Number(c) * weight; weight = weight === 7 ? 2 : weight + 1; }
 const check = 11 - sum % 11; const dv = check === 11 ? '0' : check === 10 ? 'K' : String(check);
 const digits = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
 return { tipoDte: 'DTE 33', folio: randomInt(100000, 9900000), rutReceptor: `${digits}-${dv}`, monto: 450000, fechaEmision: new Date().toISOString().slice(0, 10) };
}
