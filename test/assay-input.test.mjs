import test from "node:test";
import assert from "node:assert/strict";
import { admitFiniteCellularSheaf } from "../src/assay-input.mjs";
const example = () => ({
  vertices: [{ id: "a", dim: 1 }, { id: "b", dim: 1 }],
  edges: [{ id: "ab", from: "a", to: "b", dim: 1, restrict: { from: [[1]], to: [[-1]] } }],
  observations: [{ vertex: "a", coordinate: 0, value: "2/3", sourceRecord: "record:observed-a" }],
  state: [1, -1],
});
test("bounded source-identified exact rational sheaf admission", () => {
  const a = admitFiniteCellularSheaf(example());
  assert.equal(a.coordinates.c0, 2);
  assert.equal(a.coordinates.c1, 1);
  assert.equal(a.observations[0].value, "2/3");
});
test("unknown or duplicate cells, ghost relations and invalid dimensions refuse", () => {
  for (const change of [
    { vertices: [{ id: "a", dim: 1 }, { id: "a", dim: 1 }] },
    { edges: [{ ...example().edges[0], to: "ghost" }] },
    { edges: [...example().edges, example().edges[0]] },
    { vertices: [{ id: "a", dim: 100 }, { id: "b", dim: 1 }] },
    { foo: "shadow" },
  ]) assert.throws(() => admitFiniteCellularSheaf({ ...example(), ...change }));
});
test("rational coefficients reject floats, divisions by zero and fake zeros", () => {
  for (const value of [0.1, "1.5", "2/0", "2/-3", "00", "1e100", null, -0, "1".repeat(100)]) {
    const sample = example();
    sample.edges[0].restrict.to = [[value]];
    assert.throws(() => admitFiniteCellularSheaf(sample), String(value));
  }
  const sample = example();
  sample.observations[0].value = 0.5;
  assert.throws(() => admitFiniteCellularSheaf(sample));
});
test("missing source evidence, mismatched state or invalid metric refuse", () => {
  for (const broken of [
    { observations: [{ vertex: "a", coordinate: 0, value: 1 }] },
    { observations: [{ vertex: "no", coordinate: 0, value: 1, sourceRecord: "src" }] },
    { state: [1] }, { state: [1, Number.POSITIVE_INFINITY] },
    { metrics: [] }, { metrics: [[[1, 2]]] },
  ]) assert.throws(() => admitFiniteCellularSheaf({ ...example(), ...broken }));
});
test("coordinate/observation budgets refuse before invoking the math engine", () => {
  for (const bad of [
    { vertices: Array.from({ length: 17 }, (_, i) => ({ id: "a" + i, dim: 1 })) },
    { edges: Array.from({ length: 33 }, (_, i) => ({ ...example().edges[0], id: "e" + i })) },
    { vertices: Array.from({ length: 13 }, (_, i) => ({ id: "a" + i, dim: 4 })) },
    { observations: Array.from({ length: 48 }, (_, i) => ({ vertex: "a", coordinate: 0, value: 1, sourceRecord: "s" + i })) },
  ]) assert.throws(() => admitFiniteCellularSheaf({ ...example(), ...bad }));
});
