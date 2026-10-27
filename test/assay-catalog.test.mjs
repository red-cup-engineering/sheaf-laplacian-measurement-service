import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { catalog } from "../src/assay.mjs";

const manifest = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

test("one open-source source contract describes both bounded held x402 offers", () => {
  assert.equal(manifest.license, "MIT");
  assert.equal(manifest["x-market"].gateway, "sheaf-mathematics");
  assert.equal(manifest["x-market"].offers.length, 2);
  const operations = Object.keys(catalog.operations).sort();
  assert.deepEqual(operations, manifest["x-market"].offers.map(offer => offer.operation).sort());
  const seenRoutes = new Set();
  for (const offer of manifest["x-market"].offers) {
    assert.equal(offer.method, "POST");
    assert.equal(offer.subpath, "./assay");
    assert.equal(offer.seller.enterprise, "engineering");
    assert.equal(offer.saleStatus, "held");
    assert.equal(offer.listed, false);
    assert.equal(offer.recoverable, false);
    assert.ok(!seenRoutes.has(offer.route));
    seenRoutes.add(offer.route);
    assert.match(offer.price.amount, /^\$0\.0[58]$/);
    assert.equal(typeof catalog.operations[offer.operation].inputSchema, "object");
    assert.equal(typeof catalog.operations[offer.operation].outputSchema, "object");
  }
});

test("x402 offer examples replay byte-identically against the actual SignGraph computation", () => {
  for (const offer of manifest["x-market"].offers) {
    const original = catalog.operations[offer.operation];
    assert.equal(typeof original.operation, "function");
    const computed = original.operation(offer.examples.input);
    assert.deepEqual(computed, offer.examples.output, offer.operation);
    assert.match(computed.qualification, /exact rational computation/);
    if (offer.operation === "finite-sheaf-laplacian") {
      assert.match(computed.numerical.qualification, /IEEE-754/);
      assert.equal(computed.numerical.matrix.rows, computed.dimensions.c0);
    }
  }
});
