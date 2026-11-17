# Studying a legacy Aspire copy for an original game

**16 November 2026 (America/Halifax) · lead follow-up · research plan, not an executed binary analysis**

## Decision

A legacy copy would be useful as a reference for actual play: pacing, decisions, transitions, mistakes, resource management and visible consequences. The [source notes](LEGACY_COPY_SOURCE_NOTES.md) identify a concrete community archive candidate. Its contents, integrity, licence, completeness and runtime compatibility have not been verified. No copy was installed or executed in this research.

Our clinic's code, artwork, maps and dialogue remain original. No Aspire binaries or extracted assets belong in the public project repository. Inspection of any packaged implementation must first establish the permissions and terms applicable to that copy; finding an old installer does not resolve those questions.

## Three useful levels of investigation

| Investigation | Useful output | Current status |
| --- | --- | --- |
| Observe play and experiment with choices | Recorded normal-play route, decision log, screen transitions, mistakes and observed consequences | Ready as a method; legacy executable not available here |
| Inspect the package without executing it | Version, file inventory, included licence, dependencies and any readable mission/configuration structure permitted for inspection | Candidate archive found; bytes not retrieved or inspected |
| Analyse implementation details where permitted | A description of architecture or data formats useful to an independently written system | No code decompiled, source recovered or permission established; not required to begin gameplay analysis |

## A new primary architecture reference

Cisco's 13 November 2020 article, [Adaptive Learning: Serving Students and Supporting Teachers in Networking Education](https://blogs.cisco.com/education/adaptive-learning-serving-students-and-supporting-teachers-in-networking-education), describes recreating part of Aspire around contract choices. It identifies an Activity Sequencer built on states and triggers to guide transitions and adaptive learning. This concerns a later prototype; it is not proof of the precise implementation inside every older installer, nor a published source-code release.

Original implementation lesson: keep our network model authoritative, with a separate mission progression layer that reads its evidence and offers suitable next client events. We can use an ordinary state-machine approach in new code without needing Cisco's implementation. Published descriptions do not establish that the editor or prototype is currently downloadable.

## Reference-play capture brief

Study normal play of the opening and two or three available contracts, without speedrun shortcuts. Record observations with timestamps and the exact edition/version.

1. **Orientation:** how the player learns the role, opens the phone, understands the job and identifies the first independent choice.
2. **Decisions:** equipment alternatives, prices, prerequisites, information available before committing, and whether the alternatives change the result.
3. **Workplace:** camera/framing, room navigation, furniture/device scale, inspection windows and the relationship between people and services.
4. **Causal feedback:** one valid solution, a plausible incorrect action, the diagnostic response, recovery and any effect on already-working equipment.
5. **Progression:** how a completed job changes inventory, money, available work and the next contact; distinguish observed rules from inferred ones.
6. **Support and evidence:** tutorials, reference help, costs if actually observed, success conditions, handover and saved progress.

The deliverable is an observation matrix and an original clinic change list. Copying a sequence of clicks without explaining the choices would repeat the weakness identified in the current game review.

## Retrieval and execution boundary

Prefer an original instructor-held installer with provenance or a normally accessible preserved release. The strongest current public candidate is linked from the [Speedrun Academy resource](https://www.speedrun.com/canae/resources/8ruu1). The [community version guide](https://www.speedrun.com/canae/guides/ysnqi) identifies 1.1.6.28, but does not authenticate the linked archive.

If a file is obtained, record its source, size and hash, inspect metadata/licence and available publisher signature, then decide whether it can be used in an isolated Windows test environment. A hash identifies the received file; it is not proof of authenticity without a trustworthy comparison. Keep system protections enabled. Actual activation, old dependencies and compatibility remain unknown until checked. No purchase, account login, contact with uploaders or executable launch occurred during this search.

## Status and next artifact

Complete: concrete candidate links, edition distinctions, source limitations, an official architecture reference and the observation protocol above. Outstanding: a verifiable accessible package, permissions/metadata inspection and a recorded normal-play session. The published clinic remains unchanged.
