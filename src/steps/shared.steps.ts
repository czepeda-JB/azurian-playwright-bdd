import { Given } from '@cucumber/cucumber';
import { QAWorld } from '../support/world';
import { document } from '../api/assertions';
Given('un documento propio', async function(this: QAWorld) { this.current = await document(await this.api.create(this.input), this.input, this.evidence); });
Given('un documento propio y otro del mismo receptor', async function(this: QAWorld) {
 this.current = await document(await this.api.create(this.input), this.input, this.evidence);
 const other = { ...this.input, folio: this.input.folio === 9999999 ? 9999998 : this.input.folio + 1 };
 this.sibling = await document(await this.api.create(other), other, this.evidence);
});
