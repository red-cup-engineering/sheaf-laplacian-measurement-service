# sheaf-laplacian-measurement-service

<!-- 561-group-standards:badges:start -->
[![Red Cup Engineering](https://img.shields.io/badge/561%20Group-Red%20Cup%20Engineering-c0392b)](https://github.com/red-cup-engineering)
[![License: MIT](https://img.shields.io/badge/license-MIT-c0392b)](LICENSE)
[![Indigenous data: CARE](https://img.shields.io/badge/Indigenous%20data-CARE-4b6f44)](https://github.com/red-cup-engineering/.github/blob/main/GOVERNANCE.md)
[![Tips welcome](https://img.shields.io/badge/tips-welcome-d4a017)](https://github.com/561-group/.github/blob/main/TIPS.md)
<!-- 561-group-standards:badges:end -->

Measures graph-Laplacian smooth and residual components and section disagreement energy for any bounded risk field.

## Exact rational cellular-sheaf computation (proposed x402 supplier)

This package now exposes two **pure**, separately selectable exports:

- `./exact-graph-admission`: `admitExactGraphSheafRequest(body)` validates and normalizes the requested finite graph sheaf with **no payment, network, or settlement side effects**.
- `./exact-graph-cohomology`: `computeExactGraphSheafCohomology(body)` reuses the existing **SignGraph** mathematical source to compute exact-rational `H^0`, `H^1`, coboundary rank, and Euler/rank–nullity checks. The returned receipt contains canonicalized rational stalk restrictions and their input topology for replay.

An accepted request uses `vertices: [{id,dim}]` and `edges: [{id,from,to,dim,restrict:{from:[[...]],to:[[...]]}}]`. Each restriction matrix has the edge stalk dimension in rows and the corresponding endpoint stalk dimension in columns. Coefficients are exact integer JSON numbers or canonicalizable rational strings such as `"2/3"`; finite noninteger JSON floating-point values are refused. The fixed public host envelope has at most 24 vertices, 48 edges, stalk dimension 4, 48 source and 48 target cochain coordinates, 384 restriction matrix entries, 12 numerator/denominator digits, and a 32,768-character JSON admission bound. A commercial host must additionally enforce the actual UTF-8 byte limit at its request boundary **before issuing a 402 challenge**. Source preflight must not consume funds for refused requests.

Example input:

```json
{"vertices":[{"id":"a","dim":1},{"id":"b","dim":1}],
 "edges":[{"id":"ab","from":"a","to":"b","dim":1,
           "restrict":{"from":[["1"]],"to":[["1"]]}}]}
```

This example yields `{h0:1,h1:0,rankDelta0:1,c0:2,c1:1,eulerCharacteristic:1}`.
These are **finite linear sheaves on source-supplied graphs over Q**, not arbitrary cellular sheaves on higher-dimensional CW complexes, exact spectral Laplacian eigenvalues, formal proofs of input provenance, or empirical guarantees. The receipt's `rankNullityChecked` and `eulerPoincareChecked` fields verify numerical algebraic identities, **not** a new theorem, a Lean proof, a certified novelty comparison with Hansen/Ghrist, or an x402 settlement. The existing `measureSheafLaplacian` path remains a distinct *floating-point* scalar measurement and still does not claim global gluing.

**Sale custody and release gate:** the Group's original `causeway-services/public-market-services-section` controls the held service declaration. The original `red-cup-engineering/market.561.group` merchant retains price, payment, recovery and settlement until the independent Shop cutover is accepted. `shop.561.group` presents the Group's offers, `bazaar.561.group` hosts its Shop and other admitted Shops, and `market.561.group` aggregates and supports authorized direct buys. No alternative merchant, product ledger, credential, payment rail or speculative guaranteed tariff belongs in this math package. Do not call this deployed, purchased, fulfilled or profitable until an actual buyer-authorized `402 → signed payment → original merchant settlement → accepted output` is independently verified and the release dependencies are installed.

**Next math tier:** SignGraph [PR #17](https://github.com/red-cup-engineering/signgraph/pull/17) implements exact 2-complex sheaf cohomology and Matrix Market exchange, but remains draft pending full dependency-received tests. Consume that upstream export when qualified instead of creating a second sheaf engine here. Link scientific proof artifact identity, exact statement/hypotheses, public source revision and reproducer in each later commercial receipt.
