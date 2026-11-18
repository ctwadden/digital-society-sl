# Field handbook source map

Status: student-facing copy is original. `cc.clinic.*` values are existing internal software IDs, not official curriculum codes. Every `cc.training.*` value below is new and proposed pending teacher review.

## `station.cables` — practised

- Sources: Course 3.4B, “Getting onto the network,” “Moving data around the building,” and the local print route; current apprenticeship learning boundary for power, Ethernet, switch, access-point uplink, association, room coverage, test codes, route, and stale results.
- Reused I-can IDs: `cc.clinic.connection-choice`, `cc.clinic.system-path`, `cc.clinic.diagnosis`.
- Pending review: none; unmodelled cable making, electrical work, routing, and radio measurement are labelled.

## `station.addressing` — practised

- Sources: Course 3.4B switch, hub, router, NIC, and MAC sections; Course 3.4C “Addresses and names”; current apprenticeship `/24` rules and source-alignment accuracy guardrails.
- Reused I-can IDs: `cc.clinic.address`, `cc.clinic.system-path`, `cc.clinic.diagnosis`.
- Pending review: the static `/24` validity rules are a documented game extension; DNS, MAC use, hubs, DHCP, gateways, and routing remain unpractised.

## `station.parts` — explained

- Sources: Course 3.3B “Inside the box,” “Follow the data,” and “Software layers.”
- Reused I-can ID: `cc.clinic.ipos`.
- New/proposed IDs: `cc.training.components`, `cc.training.software-layers`.
- Pending review: wording and IDs; the station does not simulate internal components or software installation.

## `station.devices` — explained

- Sources: Course 3.3A device comparisons for embedded computers, personal devices, desktops, laptops/tablets, and servers; lesson trade-off challenges.
- Reused I-can IDs: `cc.clinic.device-fit`, `cc.clinic.stakeholders`.
- Pending review: whether the stakeholder goal should remain on this explanatory page; no hardware selection or benchmarking is practised here.

## `station.speed` — explained

- Sources: Course 3.4A “Networks by size” and “Client–server or peer-to-peer”; Course 3.4C “Bandwidth” and “How much can it carry?”
- New/proposed IDs: `cc.training.network-performance`, `cc.training.compression`, `cc.training.network-organisation`.
- Pending review: wording and IDs; bandwidth, speed, compression, WAN, congestion, and peer-to-peer behaviour are not simulated by the game.

## `station.security` — explained

- Sources: Course 3.4B “In the real world: the choke points”; Course 3.4C “Keeping a network secure”; Course 3.4G “Attack and defend.”
- Reused I-can ID: `cc.clinic.access` for the game’s limited role-based service checks.
- New/proposed IDs: `cc.training.security-layers`, `cc.training.security-limits`.
- Pending review: wording and IDs; only role-based allow/deny service tests are modelled. Authentication, MFA, firewalls, proxies, encryption, attacks, and real traffic/privacy inspection are explanatory only.

## Shared boundary

- The game models power; Ethernet through a switch; static IPv4 plus mask on one local `/24`; access-point power/uplink, association, and named-room coverage; role access to two services; and current pass/fail route tests.
- It does not model hubs, routing/gateways, modems, ISP, DNS, DHCP, MAC-address use, bandwidth/speed, compression, firewall, encryption, authentication, computer internals, crimping, or electrical work.
- The handbook creates evidence opportunities, not automatic mastery, an IB grade, or official curriculum mapping. Reading remains untimed in the integration contract.
