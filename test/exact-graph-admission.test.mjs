import test from "node:test";
import assert from "node:assert/strict";
import { admitExactGraphSheafRequest, exactRational } from "../src/exact-graph-admission.mjs";

const triangle = () => ({
  vertices: ["a", "b", "c"].map(id => ({ id, dim: 1 })),
  edges: [["ab", "a", "b"], ["bc", "b", "c"], ["ca", "c", "a"]]
    .map(([id, from, to]) => ({ id, from, to, dim: 1,
      restrict: { from: [[1]], to: [[1]] } })),
});

test("canonical exact fractions, no floating-point loss or mutation", () => {
  assert.equal(exactRational("2/4"), "1/2");
  assert.equal(exactRational("-6/4"), "-3/2");
  assert.equal(exactRational("0/99"), "0");
  const input = triangle();
  input.edges[0].restrict.from[0][0] = "2/4";
  const normalized = admitExactGraphSheafRequest(input);
  assert.equal(normalized.edges[0].restrict.from[0][0], "1/2");
  assert.equal(input.edges[0].restrict.from[0][0], "2/4");
  assert.ok(Object.isFrozen(normalized.edges[0].restrict.from[0]));
  assert.deepEqual(admitExactGraphSheafRequest(triangle()), admitExactGraphSheafRequest(triangle()));
});

test("malformed, missing or inconsistent stalks cannot incur a charge", () => {
  const invalid = [
    { vertices: [], edges: [] },
    { ...triangle(), extra: true },
    { ...triangle(), vertices: [...triangle().vertices, { id: "a", dim: 1 }] },
    { ...triangle(), edges: [...triangle().edges, triangle().edges[0]] },
    { ...triangle(), edges: [{ ...triangle().edges[0], to: "missing" }] },
    { ...triangle(), edges: [{ ...triangle().edges[0], restrict: { from: [[1]], to: [[1, 2]] } }] },
    { ...triangle(), edges: [{ ...triangle().edges[0], restrict: { from: [[0.5]], to: [[1]] } }] },
    { ...triangle(), edges: [{ ...triangle().edges[0], restrict: { from: [["NaN"]], to: [[1]] } }] },
  ];
  for (const specimen of invalid) assert.throws(() => admitExactGraphSheafRequest(specimen));
  for (const x of [Infinity, NaN, -0, 0.5, "1/0", "01", "1e10", "1/00", "1/1000000000000"])
    assert.throws(() => exactRational(x));
});

test("genuine vector stalks are admitted but unbounded work is refused", () => {
  const finite = { vertices: [{ id: "left", dim: 2 }, { id: "right", dim: 2 }],
    edges: [{ id: "e", from: "left", to: "right", dim: 1,
      restrict: { from: [[1, 0]], to: [[0, 1]] } }] };
  assert.equal(admitExactGraphSheafRequest(finite).vertices.length, 2);
  const tooMany = { vertices: Array.from({length:25},(_,i)=>({id:"v"+i,dim:1})),edges:[] };
  assert.throws(() => admitExactGraphSheafRequest(tooMany), /cell-limit/);
  const tooWide = { vertices: [{id:"v",dim:2}],edges:Array.from({length:30},(_,i)=>
    ({ id:"e"+i,from:"v",to:"v",dim:2,restrict:{from:[[1,0],[0,1]],to:[[1,0],[0,1]]} })) };
  assert.throws(() => admitExactGraphSheafRequest(tooWide), /rank-budget/);
});
