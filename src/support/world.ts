import { World, setWorldConstructor, type IWorldOptions } from '@cucumber/cucumber';
import type { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test';
import type { Input, Document, Evidence } from '../api/types';
import { Client } from '../api/client';
import { DocumentsPage } from '../ui/documents.page';
import { data, runId } from './data';
export class QAWorld extends World {
 runId = runId(); input: Input = data(); sibling?: Document; original?: Document; current?: Document;
 api!: Client; context?: APIRequestContext; browser?: Browser; uiContext?: BrowserContext; page?: Page; portal!: DocumentsPage;
 artifact = '';
 constructor(options: IWorldOptions) { super(options); }
 evidence: Evidence = async (name, value) => { await this.attach(JSON.stringify({ verification: name, value }, (_key, v: unknown) => { if (v instanceof RegExp) return String(v); if (v && typeof v === 'object' && 'asymmetricMatch' in v) { const m = v as { toString(): string; sample?: unknown }; return { matcher: m.toString(), sample: m.sample }; } return v; }, 2), 'application/json'); };
 doc(): Document { if (!this.current) throw new Error('No existe documento propio en este escenario'); return this.current; }
}
setWorldConstructor(QAWorld);
