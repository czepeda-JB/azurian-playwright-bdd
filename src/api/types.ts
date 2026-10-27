export type Dte = 'DTE 33' | 'DTE 34' | 'DTE 39';
export interface Input { tipoDte: Dte; folio: number; rutReceptor: string; monto: number; fechaEmision: string; contactEmail?: string | null; sendCopy?: boolean; deliveryChannel?: 'PORTAL' | 'EMAIL'; observaciones?: string | null; attachmentName?: string | null; }
export interface Document extends Required<Input> { id: string; estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO'; createdAt: string; updatedAt: string; }
export type Editable = Partial<Omit<Input, 'tipoDte' | 'folio'>>;
export type Evidence = (name: string, value: unknown) => Promise<void>;
