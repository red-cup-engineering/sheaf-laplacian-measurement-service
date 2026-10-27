import test from "node:test";
import assert from "node:assert/strict";
import { computeExactGraphSheafCohomology } from "../src/exact-graph-cohomology.mjs";

const V = id => ({ id, dim: 1 });
const E = (id, from, to, a = "1", b = "1") => ({
  id, from, to, dim: 1, restrict: { from: [[a]], to: [[b]] },
});

test("constant connected sheaf has one independent global section and no H1", () => {
  const receipt = computeExactGraphSheafCohomology({
    vertices: [V("a"), V("b")], edges: [E("ab", "a", "b")],
  });
  assert.equal(receipt.kind, "red-cup.exact-graph-sheaf-cohomology/v1");
  assert.equal(receipt.field, "Q");
  assert.deepEqual(receipt.result, {
    h0: 1, h1: 0, rankDelta0: 1, c0: 2, c1: 1, eulerCharacteristic: 1,
  });
  assert.equal(receipt.verification.rankNullityChecked, true);
  assert.equal(receipt.verification.theoremNoveltyEstablished, false);
  assert.equal(receipt.verification.settlementEstablished, false);
  assert.equal(receipt.input.edges[0].restrict.to[0][0], "1");
});

test("unfilled constant cycle carries H1, nontrivial rational holonomy does not", () => {
  const base = [E("ab", "a", "b"), E("bc", "b", "c"), E("ca", "c", "a")];
  const vertices = [V("a"), V("b"), V("c")];
  const cycle = computeExactGraphSheafCohomology({ vertices, edges: base });
  assert.deepEqual([cycle.result.h0, cycle.result.h1], [1, 1]);
  const twisted = computeExactGraphSheafCohomology({
    vertices, edges: [base[0], base[1], E("ca", "c", "a", "1/2", "1")],
  });
  assert.deepEqual([twisted.result.h0, twisted.result.h1], [0, 0]);
  assert.equal(twisted.input.edges[2].restrict.from[0][0], "1/2");
});

test("isolated stalks and vector-valued restrictions preserve exact ranks", () => {
  const empty = computeExactGraphSheafCohomology({ vertices: [V("a"), V("b")], edges: [] });
  assert.deepEqual([empty.result.h0, empty.result.h1], [2, 0]);
  const vector = computeExactGraphSheafCohomology({
    vertices: [{ id: "left", dim: 2 }, { id: "right", dim: 2 }],
    edges: [{ id: "restriction", from: "left", to: "right", dim: 1,
      restrict: { from: [["1/3", "0"]], to: [["0", "1"]] } }],
  });
  assert.deepEqual([vector.result.h0, vector.result.h1], [3, 0]);
});

test("invalid or unbounded requests fail before invoking a mathematical solver", () => {
  assert.throws(() => computeExactGraphSheafCohomology({
    vertices: [V("a")], edges: [E("unknown", "a", "b")],
  }), /exact-graph-edge-invalid/);
  assert.throws(() => computeExactGraphSheafCohomology({
    vertices: [V("a"), V("a")], edges: [],
  }), /vertex-invalid-or-duplicate/);
});
