import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { request, chromium } from '@playwright/test';
import { mkdir, readFile } from 'node:fs/promises';
import { Client } from '../api/client';
import { DocumentsPage } from '../ui/documents.page';
import { config } from '../config';
import { QAWorld } from './world';
setDefaultTimeout(60000);
Before(async function(this: QAWorld, { pickle }) {
 this.context = await request.newContext({ timeout: 15000 }); this.api = new Client(this.context, this.runId, this.evidence);
 await this.evidence('Aislamiento por escenario', { name: pickle.name, runId: this.runId });
 if (pickle.tags.some(t => t.name === '@ui')) {
  this.artifact = `test-results/${this.runId}`; await mkdir(this.artifact, { recursive: true });
  this.browser = await chromium.launch({ headless: config.headless }); this.uiContext = await this.browser.newContext({ recordVideo: { dir: this.artifact, size: { width: 1280, height: 720 } } });
  await this.uiContext.addInitScript(({ id }) => localStorage.setItem('azurian_lab_run_id', id), { id: this.runId });
  await this.uiContext.tracing.start({ screenshots: true, snapshots: true }); this.page = await this.uiContext.newPage(); this.page.setDefaultTimeout(15000); this.portal = new DocumentsPage(this.page, this.evidence);
 }
});
After(async function(this: QAWorld, { result }) {
 try {
  if (this.page && this.uiContext) {
   if (result?.status === Status.FAILED) await this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
   const trace = `${this.artifact}/trace.zip`; await this.uiContext.tracing.stop({ path: trace }); await this.attach(await readFile(trace), 'application/zip');
   const video = this.page.video(); await this.uiContext.close(); if (video) await this.attach(await readFile(await video.path()), 'video/webm');
  }
 } finally { await this.browser?.close(); await this.context?.dispose(); }
 // No borrar en teardown: preserva fallos de eliminación; runId aislado impide contaminación.
});
