# Lantern Line apprenticeship learning map

Status: content map for apprenticeship 0.9. Internal `cc.clinic.*` IDs are proposed software references from `SOURCE_ALIGNMENT.md`, not official curriculum codes. Game actions create evidence opportunities; explanation quality remains for teacher judgement.

## Boundaries shared by all visits

- The model is one static local network. A **switch** bridges wired local devices. An **access point** bridges a tablet's Wi-Fi association into that wired LAN and needs power plus an Ethernet uplink. A **router** would move traffic between different networks; no router, gateway, Internet path, DHCP or DNS is required or practised here.
- For the supplied `255.255.255.0` mask, `/24` means the first 24 bits identify the network. Comparing the first three number groups is a shortcut for this mask only, not a general subnetting rule. On `10.12.1.0/24`, `.0` and `.255` are reserved and an otherwise valid host address must also be unused.
- Mentor answers, “show me,” inspections, tests and retries are free. Reading is untimed. Support use, speed, income and visit completion do not establish an IB grade, professional credential or mastery.
- Tests become stale after a technical change. A current passing retest—not a light, dialogue line or setting change—supports a service claim. Learner explanations are stored exactly as written, or marked pending for oral teacher review.

## Visit 1 — The front desk is dark (mentor alongside)

### Current goals and evidence opportunities

| I can goal | Actual player action | Observable model evidence | Explanation opportunity |
| --- | --- | --- | --- |
| `cc.clinic.connection-choice` — Select compatible connections and explain what an adapter, dock or access point contributes. | Choose and power a suitable desk computer, switch and service host; use Ethernet rather than phone, HDMI or USB for the network links. | Checks `install.role.reception`, `install.infra.switch`, `install.role.records`, `cable.desk`, `cable.host`; mistake codes include `PHONE_CORD_IN_RJ45`, `DISPLAY_NOT_NETWORK`, `USB_NOT_NETWORK`, `ETHERNET_IN_WRONG_SOCKET`. | Identify what power, Ethernet, HDMI, USB and a phone cord each do here; explain why power or a display connection is not a network path. |
| `cc.clinic.system-path` — Trace how a client reaches a shared service through the local network. | Connect desk → switch and service host → switch, then run the reception booking test. | A plausible unpowered-switch route returns `SWITCH_OFF`; the complete powered route returns `SERVICE_AVAILABLE` with desk, cable, switch, cable and host path IDs. | Trace the local request from desk computer through the switch to the service host; state that no Internet or router is involved. |
| `cc.clinic.diagnosis` — Use a diagnostic result to make a targeted change and check the result. | Read a failed desk test, power or reconnect the relevant component, then rerun the test. | `DEVICE_OFF`, `SWITCH_OFF` or `PORT_DISCONNECTED` can precede `SERVICE_AVAILABLE`; the earlier observation becomes stale after a change. | Name the observed cause, the relevant repair and why the new test—not the change alone—supports the claim that bookings work. |

### Expected misconceptions

- “The power indicator means the network or booking service works.” Power is only one prerequisite.
- An RJ11 phone cord is interchangeable with RJ45 Ethernet because the plugs look similar.
- HDMI carries network traffic because it carries the screen picture; USB is the network link because it connects peripherals.
- Both Ethernet ends can go into the same device, or any occupied switch port can accept another cable.
- A switch, access point and router do the same job. Only local switching is used in this visit.

### Graduated hints

1. Follow the current job-sheet check: install and power the three devices, then consider where their wired paths meet.
2. The desk and host each need Ethernet to separate free ports on the switch; power alone does not carry traffic.
3. Choose the desktop, switch and server; power each; patch desk RJ45 → free switch port and host RJ45 → another free switch port; run **Test from desk**.

### Teacher debrief

- Trace the tested route in order. What role did the switch play, and what did it not do?
- Choose one plausible wrong cable. What job is it suited to, and why did it not create this network link?
- Why was the passing retest stronger evidence than a power indication or a cable being present?

## Visit 2 — New computer, new rooms (supported)

### Current goals and evidence opportunities

| I can goal | Actual player action | Observable model evidence | Explanation opportunity |
| --- | --- | --- | --- |
| `cc.clinic.address` — Use the given mask to choose a valid, unused local address. | Inspect the replacement desk computer (`192.168.1.50`), compare it with `10.12.1.0/24`, apply a valid unused `10.12.1.x` address and `255.255.255.0`, then test. | Checks `inspect.desk`, `address.apply`, `address.mask`, `test.desk`; wrong routes can return `ADDRESS_WRONG_SUBNET`, `ADDRESS_DUPLICATE`, `ADDRESS_RESERVED`, `ADDRESS_INVALID` or `ADDRESS_OFF_LINK`; a valid repair returns `SERVICE_AVAILABLE`. | Explain why the selected host address belongs on this `/24`, why `.0`, `.255` and active addresses are unsuitable, and why the first-three-groups shortcut is limited to `/24`. |
| `cc.clinic.connection-choice` — Select compatible connections and explain what an adapter, dock or access point contributes. | Power the access point, cable its Ethernet port to the switch and associate the tablet with it. | Checks `wifi.ap`, `wifi.join`; incomplete routes can return `WIFI_NOT_ASSOCIATED`, `AP_OFF` or `PORT_DISCONNECTED`. | Distinguish AP power, Ethernet uplink and tablet association as three separate prerequisites; explain that the AP bridges Wi-Fi into the wired LAN and is not a router here. |
| `cc.clinic.diagnosis` — Use a diagnostic result to make a targeted change and check the result. | Test the tablet in room A, move it to room B and test again after completing the wireless path. | Checks `test.roomA`, `test.roomB`; each current room observation must pass with `SERVICE_AVAILABLE`. | Explain why a pass in one named room does not prove the other room was tested, and identify the model limit: named-room coverage, not radio propagation measurement. |

### Expected misconceptions

- Any `10.12.1.x` value is usable, including `.0`, `.255` or an address already active on the LAN.
- “Match the first three groups” works for every subnet mask. It is only the taught `/24` shortcut.
- Changing an IP address repairs missing power, association or an unplugged cable.
- Seeing Wi-Fi association means the workspace service is reachable.
- The AP creates Internet service or performs routing. Here it only bridges the local wireless and wired segments.
- One room test proves service in both rooms.

### Graduated hints

1. Inspect before changing: compare the desk settings with the network card, then treat AP power, uplink and association as separate checks.
2. With this `/24`, use `10.12.1` for the first three groups; avoid `.0`, `.255` and used addresses. For wireless, the AP needs power and Ethernet before the tablet joins it.
3. Apply an unused `10.12.1.1–254` address with `255.255.255.0`; retest the desk. Power the AP, patch AP RJ45 → free switch port, join the tablet, test in room A, move to room B and test again.

### Teacher debrief

- Why did `192.168.1.50/24` not belong on `10.12.1.0/24`? What would change with a different mask?
- Explain the difference between “joined to Wi-Fi” and “the workspace service passed its test.”
- What does testing both named rooms show, and what does this simplified model not show?

## Visit 3 — You lead (changed situation)

### Current goals and evidence opportunities

| I can goal | Actual player action | Observable model evidence | Explanation opportunity |
| --- | --- | --- | --- |
| `cc.clinic.diagnosis` — Use a diagnostic result to make a targeted change and check the result. | Inspect the AP or run a tablet test before repair; reconnect the missing AP uplink; rerun the tablet test. | Checks `fault.observed`, `fault.repaired`; the valid tablet address can still produce `PORT_DISCONNECTED`; the repair counts only when the new cable appears in a later `SERVICE_AVAILABLE` path. | Explain why changing an already-valid IP address cannot replace an unplugged Ethernet uplink; connect failure, repair and retest evidence. |
| `cc.clinic.access` — Test necessary access while restricting unnecessary access. | Reject broad or deny-all access; choose either `policy.roles-separated` or `policy.nurse-also-books`; run the access suite after the final change. | Checks `access.decision`, `access.tested`; required work returns `SERVICE_AVAILABLE`, while intended restrictions return passing `ACCESS_DENIED` observations for reception workspace and outsider services (and nurse bookings when roles are separated). | State who can perform which synthetic task, who is restricted, and why a denial counts only after the path and service prerequisites work. |
| `cc.clinic.stakeholders` — Explain benefits, barriers and a condition that changes a recommendation. | Save an exact written explanation or arrange oral teacher review after the final technical change. | Check `explain`; stored text/oral choice remains teacher-review pending and becomes stale after a later technical change. | Compare reception, nurse, manager and outsider needs; explain when nurse follow-up booking duties would justify the alternative acceptable policy. |

The access decision supports the source-backed lenses without claiming whole-chapter coverage: **Systems** connects the technical path, role rules and clinic work procedure; **Power** asks who may authorize and use each service; **Values and ethics** weighs legitimate workflow against privacy and unnecessary access. These links use S9/S10 and the selected S11 pages recorded in `SOURCE_ALIGNMENT.md`. They do not apply merely because a cable was installed.

### Expected misconceptions

- A valid IP guarantees service, or another valid IP can repair a missing AP uplink.
- Trial-and-error changes are equivalent to observing the fault first.
- “Open access is safer” because nobody is locked out; it also grants unnecessary simulated service access.
- Any denial proves security. A denial is meaningful here only when the local path and service work and the intended role is tested.
- Deny-all is the safest acceptable policy even though it blocks legitimate work.
- The role checks authenticate real people or prove encryption, firewall, malware, legal-compliance or full cybersecurity controls. They do not.

### Graduated hints

1. Start with evidence: test the tablet or inspect the access point. Do not assume its valid address is the cause.
2. Follow the failed route and inspect the AP's Ethernet side; after repair, test again. Then ask who needs bookings, the workspace or neither.
3. Patch the AP Ethernet port → free switch port and retest the tablet. Choose an acceptable role policy, run **Check access**, then explain the fault, change and who benefits or is restricted.

### Teacher debrief

- What evidence ruled out the IP address and supported the physical-uplink repair?
- Under the chosen policy, which required actions work and which restrictions pass? Why is an intended denial not the same as a broken network?
- When would `policy.nurse-also-books` be preferable to `policy.roles-separated`? Who has power to make that decision, and what workflow/privacy trade-off follows?
- What remains unmodelled and would still need checking in a real installation?

## Source and evidence boundary

- Goal wording and IDs are reused from `docs/SOURCE_ALIGNMENT.md`: S1/S3 support device and connection reasoning; S9 supports local components, wired/wireless paths, addressing and access considerations; S10 supports authentication/authorization and role-based access concepts; the recorded S11 selection supports the limited Systems, Power and Values-and-ethics prompts above.
- This map does not claim general subnetting, routing, gateway configuration, DHCP, DNS, Internet, radio surveying, identity authentication, patient-data handling, legal compliance or whole-chapter coverage.
- Completion records preserve actual actions, observations, support use and the learner's exact explanation. Demonstration or mentor support cannot complete checks, and all three visits remain supervised practice rather than independent mastery.
