# Independent integration review — proposed Opening Shift

**16 November 2026 · specification review only · no production changes**

Reviewed the raw `DESIGN_REVIEW.md`, `FIRST_CLIENT_MISSION.md`, and the current-game audit, including its source-reference and implementation-boundary tables. Directly checked the existing 0.6 `dist/catalog.js` for device, port, coverage and policy capabilities. No runtime, browser, published-site, accessibility or school-device tests were performed in this review. The proposed mission does not exist as a playable build yet.

## Material ambiguities to resolve before implementation

### 1. Define each fault fixture independently, including replacement-device behaviour

**Priority: contract blocker for the new variants; no finding against the current runtime.**

References: `FIRST_CLIENT_MISSION.md`, **Starting state and stable identity**, bullets 2–3 (lines 30–31); **Two feasible plans and an honest economy**, paragraph beginning “Both plans must pass” (line 64); **Diagnosis and transfer**, paragraph beginning “Authored variant B” (line 74).

The base fixture contains an uninstalled AP and an inherited wrong-subnet laptop. The replacement plan only conditionally inherits the bad profile (“if the same inherited clinic profile is applied”). Variant B specifies a correct nurse address and missing AP uplink without specifying whether its AP is already installed, powered, associated or client-owned. Therefore different implementers could produce different repair requirements, initial costs and meanings of “repair.” In particular, removing an unused laptop should not leave an impossible requirement to repair that retired device, and supplying a never-installed uplink should not be represented as evidence of diagnosing a pre-existing broken link.

**Focused correction:** add one small fixture table before implementation. For each variant, state the initial AP ownership/power/placement/uplink, nurse association and profile, the replacement-profile rule, fault being assessed and resulting plan costs. Bind the repair requirement to the current service and recorded initial cause. Choose the replacement-profile rule explicitly rather than leaving it conditional. If variant B begins with client-owned installed infrastructure, recalculate its costs rather than copying the 44/114-credit totals from the unfinished-installation fixture.

### 2. The decision table requires a failed probe that the prose explicitly makes optional

**Priority: acceptance/evidence contradiction.**

References: `FIRST_CLIENT_MISSION.md`, **What the player decides**, Diagnose row, evidence cell (line 46), versus **Diagnosis and transfer**, first paragraph (line 72).

The table prescribes “Failure → action → fresh retest.” The prose correctly permits a student to inspect and repair the inherited setting before a failed probe. An implementation built from the table could reject that valid proactive route or manufacture an observation that never occurred.

**Focused correction:** use “Observed initial condition or failed probe → actual repair action → fresh successful test.” Add an explicit acceptance case for inspection-led repair with no recorded pre-repair service failure.

### 3. The access-response row describes only one of the two accepted policies

**Priority: decision/consequence contradiction.**

References: `FIRST_CLIENT_MISSION.md`, **What the player decides**, Decide access row (line 48), versus **Phone and visible human consequences**, paragraph beginning “The policy request appears” (line 82), and **Acceptance gates**, responsible-policy bullet (line 131).

The row says the nurse booking request changes from denied to allowed, although retaining separated responsibilities is explicitly acceptable and the initial policy already separates those duties. In the existing catalog, that policy allows nurse workspace access but continues to deny nurse bookings. A generic “bookings now allowed” message would falsify the player's choice.

**Focused correction:** describe the two outcomes explicitly: nurse bookings become available under nurse-also-books, or remain assigned to reception under separated duties; outsider requests remain denied in both. Generate the handover and staff reply from the selected policy and actual tests. A justified retained policy must not require a token policy change to count as a decision.

### 4. Refund eligibility does not yet support the promised recovery guarantee

**Priority: economic recovery ambiguity.**

Reference: `FIRST_CLIENT_MISSION.md`, **Two feasible plans and an honest economy**, paragraph beginning “Before handover” (line 68).

The paragraph expressly permits refunding an *uninstalled* purchase, then promises that no spending path creates an irreversible cash dead end. It does not say whether an installed item can be uninstalled and returned or whether stock/quantity restrictions make that unnecessary. This is unresolved behaviour, not a demonstrated bug.

**Focused correction:** specify that purchased equipment can be uninstalled and returned before settlement, with its connections removed and credit/stock restored once; alternatively state the exact purchase restriction that prevents the dead end. The ledger test must cover the chosen rule, including a save/import between purchase and refund.

## Checks without a verified contradiction

- **Current versus proposed:** the lead review and mission clearly identify redesign as unimplemented. Existing 0.6 tests, limited model traces and the lead's published observation are not passed off as new-mission or school results. The audit's suggested sequence is advisory; the lead's explicit starting fixture supersedes its suggestion to have the learner first construct reception.
- **Bootcamp and agency:** bootcamp remains before independent work, with an honest teacher-directed prior-learning route. The proposed shift adds equipment/resource choices, diagnostic order and an access choice without requiring a city or every original procedure before the first handover. Whether that feels engaging and fits the proposed time remains untested.
- **Two plans and arithmetic:** for the specified unfinished-installation fixture, 40 + 4 = 44 and 180 − 44 = 136; 70 + 40 + 4 = 114 and 180 − 114 = 66. Laptop and tablet both have Wi-Fi, portability and workspace capability in the current catalog. An AP uses one of the four switch ports; the existing host and reception leave sufficient capacity. These are static feasibility checks, not executed new-mission passes. Client allowance is appropriately separate from the contractor's 120-credit fee and guide charges.
- **Network and privacy boundaries:** the specification identifies application permissions and named-location Wi-Fi as simplifications. It does not imply a functioning router, VLAN, real authentication or Internet service. Access checks are required on a functioning service, so a broken connection cannot itself prove privacy protection.
- **Legacy work:** the proposal explicitly requires versioned fixtures/contracts, preserved prior evidence/payments and a real replacement for the address-specific repair gate. It preserves the wearable journey as an incomplete follow-up rather than falsely claiming the narrower shift fulfils every old objective. Implemented migrations and recovery remain future QA gates.

**Recommendation:** integrate the four narrow clarifications above into the authoritative mission contract, then implement the placeholder simulation and verify its routes. No additional teacher permission or expanded feature scope is needed to resolve these specification issues.

## Resolution check — 16 November 2026

Re-read only the integrated corrections in `FIRST_CLIENT_MISSION.md`. **All four findings are resolved at specification level. No material residual contradiction was found in those changes.** The original findings above remain the review history; their earlier line numbers refer to the pre-correction draft.

| Finding | Resolution verified in revised specification |
| --- | --- |
| Fault fixture and replacement ambiguity | **Resolved.** “Explicit fixture variants” defines initial AP ownership/installation, connection state, association, address profile and stable IDs. Variant A costs remain 44/114; variant B costs are 0/70, leaving 180/110. Profile initialization is logged once, the retired laptop is inactive, and acceptance concerns the active service and initial cause. See lines 38–53 and 81. |
| Failed-probe requirement | **Resolved.** The Diagnose row accepts an observed initial condition or failed probe, and the acceptance gates explicitly cover inspection-led repair without invented failure evidence. See lines 63 and 144. |
| One-sided policy consequence | **Resolved.** The access row distinguishes both outcomes. Retaining separated duties counts as an explicit decision without a token change; replies and exports must match it. See lines 65 and 149–150. |
| Refund/recovery ambiguity | **Resolved.** Any mission purchase can be uninstalled and returned before settlement; links/association/role assignment are cleared, affected tests become stale, and stock/credit restore exactly once. Client-owned equipment has no purchase refund. Save/import and repeat-return cases are specified. See line 85. |

These are verified changes to the written contract, not executed engine, ledger, persistence or browser passes. Implementation and the existing acceptance gates remain pending.
