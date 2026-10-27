import { cellularSheaf, cellularSheafCohomology, extendCellularSheafSection,
  sheafLaplacian, weightedSheafLaplacian, weightedSheafDirichlet,
  coboundary, apply } from "@red-cup-engineering/signgraph/cellular-sheaf";
import { admitFiniteCellularSheaf } from "./assay-input.mjs";

const SOURCE = "@red-cup-engineering/signgraph/cellular-sheaf";
function exactReceipt(input) {
  const admitted = admitFiniteCellularSheaf(input);
  const sheaf = cellularSheaf(admitted);
  // Exact rational rank and lifted/obstructed section are computed by the
  // original SignGraph owner. No independent or floating-point rank estimate.
  const cohomology = cellularSheafCohomology(sheaf);
  const extension = admitted.observations.length
    ? extendCellularSheafSection(sheaf, admitted.observations) : null;
  return { admitted, sheaf, receipt: {
    recordType: "561-group.finite-cellular-sheaf-assay.v1",
    mathematicalCarrier: "finite graph (1-dimensional CW complex), rational vector stalks",
    coefficientField: "Q", sourceOperation: SOURCE,
    qualification: "exact rational computation; independent machine-proof/kernel replay not established by this receipt",
    dimensions: { c0: sheaf.c0, c1: sheaf.c1, vertices: sheaf.vertices.length, edges: sheaf.edges.length },
    cohomology: { h0: cohomology.h0, h1: cohomology.h1, rankD0: cohomology.rank },
    extension,
    limits: admitted.bounds,
  } };
}
/** Finite 1-skeleton rational H0/H1 and optional source-indexed extension witness. */
export function assayFiniteCellularSheaf(input) {
  return exactReceipt(input).receipt;
}
/** Floating-point Laplacian, explicitly separated from exact rational H0/H1.
 * An SPD metric is admitted by the original SignGraph math engine. */
export function assayFiniteSheafLaplacian(input) {
  const { admitted, sheaf, receipt } = exactReceipt(input);
  const weighted = admitted.metrics !== undefined;
  const laplacian = weighted
    ? weightedSheafLaplacian(sheaf, admitted.metrics)
    : sheafLaplacian(sheaf);
  const numerical = {
    qualification: "IEEE-754 floating-point approximation, NOT an exact proof or certified spectrum",
    operator: weighted ? "delta-transpose W delta (SPD metrics)" : "delta-transpose delta",
    matrix: laplacian,
  };
  if (admitted.state !== undefined) {
    const delta = coboundary(sheaf), residual = apply(delta, admitted.state);
    const identityMetrics = sheaf.edges.map(edge =>
      Array.from({ length: edge.dim }, (_, i) =>
        Array.from({ length: edge.dim }, (_, j) => Number(i === j))));
    const energy = weightedSheafDirichlet(sheaf, admitted.metrics ?? identityMetrics, admitted.state);
    numerical.state = admitted.state;
    numerical.residual = residual;
    numerical.laplacianImage = apply(laplacian, admitted.state);
    numerical.dirichlet = energy;
  }
  return { ...receipt, recordType: "561-group.finite-sheaf-laplacian-assay.v1", numerical };
}
/** Fail closed before x402 verification, charge or supplier invocation. */
export { admitFiniteCellularSheaf } from "./assay-input.mjs";
