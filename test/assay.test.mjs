import test from "node:test";
import assert from "node:assert/strict";
import { assayFiniteCellularSheaf, assayFiniteSheafLaplacian } from "../src/assay.mjs";
function triangle(sign = 1) {
  const edges = [["a","b"],["b","c"],["c","a"]].map(([from,to],i) => ({
    id: "edge"+i, from, to, dim: 1, restrict: { from: [[1]], to: [[sign]] },
  }));
  return { vertices: ["a","b","c"].map(id => ({id,dim:1})), edges };
}
function at(matrix, row, col) {
  return matrix.entries[row].find(([j]) => j === col)?.[1] ?? 0;
}
test("balanced cycle exact H0/H1, constant section harmonic", () => {
  const data = triangle(1);
  const exact = assayFiniteCellularSheaf(data);
  assert.equal(exact.cohomology.h0, 1);
  assert.equal(exact.cohomology.h1, 1);
  assert.equal(exact.cohomology.rankD0, 2);
  const lap = assayFiniteSheafLaplacian({ ...data, state: [1,1,1] });
  assert.equal(lap.numerical.dirichlet.energy, 0);
  assert.deepEqual(lap.numerical.laplacianImage, [0,0,0]);
  assert.equal(at(lap.numerical.matrix,0,1),-1);
});
test("negative cycle holonomy: no nonzero H0 and no H1; positive energy", () => {
  const r = assayFiniteSheafLaplacian({ ...triangle(-1), state: [1,1,1] });
  assert.deepEqual(r.cohomology, { h0: 0, h1: 0, rankD0: 3 });
  assert.equal(r.numerical.dirichlet.energy, 12);
  assert.equal(at(r.numerical.matrix,0,0),2);
  assert.equal(at(r.numerical.matrix,0,1),1);
  assert.match(r.numerical.qualification, /NOT an exact proof/);
});
test("contradictory local readings produce source-indexed obstruction", () => {
  const input = { ...triangle(1), observations: [
    {vertex:"a",coordinate:0,value:1,sourceRecord:"src:one"},
    {vertex:"b",coordinate:0,value:2,sourceRecord:"src:two"},
  ] };
  const r = assayFiniteCellularSheaf(input);
  assert.equal(r.extension.status, "mathematically-obstructed");
  assert.notEqual(r.extension.obstruction, null);
  assert.equal(r.extension.sourceRows.some(row => row.sourceRecord === "src:one"), true);
});
test("rational restriction retains exact rank; numerical shadow is separate", () => {
  const r = assayFiniteSheafLaplacian({ vertices:[{id:"a",dim:1},{id:"b",dim:1}],
    edges:[{id:"ab",from:"a",to:"b",dim:1,restrict:{from:[["1/3"]],to:[[1]]}}] });
  assert.deepEqual(r.cohomology, { h0: 1, h1: 0, rankD0: 1 });
  assert.match(r.qualification, /exact rational computation/);
  assert.match(r.numerical.qualification, /IEEE-754/);
});
test("non-SPD edge metric refuses spectral report", () => {
  assert.throws(() => assayFiniteSheafLaplacian({
    ...triangle(1), metrics: [[[-1]],[[-1]],[[-1]]],
  }));
});

test("paid JSON boundaries serialize exact obstruction and numerical receipts without hidden BigInt", () => {
  const input = { ...triangle(1), observations: [
    { vertex: "a", coordinate: 0, value: "1/3", sourceRecord: "record:one" },
    { vertex: "b", coordinate: 0, value: "2/3", sourceRecord: "record:two" },
  ] };
  const exact = assayFiniteCellularSheaf(input);
  assert.equal(exact.extension.status, "mathematically-obstructed");
  assert.doesNotThrow(() => JSON.stringify(exact));
  const numeric = assayFiniteSheafLaplacian({ ...input, state: [1, 2, 3] });
  assert.doesNotThrow(() => JSON.stringify(numeric));
  assert.equal(JSON.parse(JSON.stringify(numeric)).cohomology.h0, 1);
});
