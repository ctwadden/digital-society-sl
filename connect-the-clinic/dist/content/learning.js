export const CONTENT_CONNECTIONS = [
  {id:'connection.systems',concept:'Systems',question:'Which technical part and human procedure must both work for your clinic service? Explain how one failure affects a person.'},
  {id:'connection.power',concept:'Power',question:'Who gains the ability to act when nurses can make bookings? Who should authorize or question that access?'},
  {id:'connection.values-ethics',concept:'Values and ethics',question:'Which people’s needs compete in your access decision? Give a benefit, a barrier and a condition that would change your recommendation.'}
];

/**
 * Original instructional copy for Connect the Clinic.
 * Content only: engine observations and quotes are the authority for status and cost.
 * Internal learning IDs are not official curriculum outcome codes.
 */

export const CLIENT_BRIEF = {
  id: 'mission.clinic.001',
  title: 'Connect the Clinic',
  subtitle: 'Riverbend Community Clinic · your first client',
  text: 'Riverbend opens next month. Choose suitable computers for four jobs, connect the clinic, investigate a saved setting, and decide who can use each service. Test your work and leave a short handover in your own words.',
  description: 'Build a working local system, make a reasoned access decision, and show what your tests establish.',
  jobs: [
    'Reception books appointments all day at a fixed desk.',
    'Nurses need a portable computer that reaches the workspace from both clinic rooms.',
    'A wearable collects and stores seven nonclinical day markers at home, then returns for transfer.',
    'A central host provides the booking, workspace and marker-intake services to authorized roles.'
  ],
  requirements: [
    'Choose equipment that fits the job, including any needed adapters or docks.',
    'Test the connection, address, service and permissions; one working layer does not prove the others.',
    'Reception needs bookings, nurses need the workspace, and marker transfer needs submit-only access.',
    'Decide whether nurses should also handle bookings. Both approved policies can work.',
    'An outsider must not reach staff functions. A disconnected service does not prove that permissions are safe.',
    'Explain your equipment choice, repair, access decision and one model limitation.'
  ],
  boundaries: [
    'This clinic uses one local network. Internet access and a router are not required for these local tasks.',
    'Home collection is offline. The wearable returns to the clinic before its markers are uploaded.',
    'Only synthetic markers and task labels appear: enter no student names, patient information or passwords.',
    'Delivery is ready for teacher review. It does not award an IB grade or certify a real clinic.'
  ],
  economyNote: 'During an active client job, a guide section normally reserves 5 fictional credits from the 120-credit fee and adds 3 simulated consultation minutes. All hint tiers and reopening are included, up to 15 credits and 9 minutes for the contract. Review the actual quote before accepting. Bootcamp, teacher-selected clinic practice and post-delivery review have free guidance. Money and assistance are game context; your teacher reviews your learning evidence.'
};

export const ROLE_BRIEFS = {
  'role.reception': {
    id: 'role.reception', title: 'Reception',
    description: 'A fixed workstation for booking tasks throughout the day.',
    lookFor: ['Practical text input and a readable screen', 'A usable Ethernet interface', 'Booking-service access'],
    tradeoff: 'Compare fixed-desk comfort with portability and the accessories each option needs.'
  },
  'role.nurse': {
    id: 'role.nurse', title: 'Mobile nurse',
    description: 'A portable device for the workspace in exam rooms A and B, and a companion for the returned wearable.',
    lookFor: ['Portable input and display', 'Compatible Wi-Fi', 'Support for a separately attached sensor dock'],
    tradeoff: 'A lighter device may be easier to carry; a larger keyboard may make longer entries easier.'
  },
  'role.monitor': {
    id: 'role.monitor', title: 'Home monitor',
    description: 'A wearable computer that collects and stores seven synthetic day markers before returning to the clinic.',
    lookFor: ['Wearable form', 'Offline collection and storage', 'Compatible sensor transfer'],
    tradeoff: 'A device designed for one small collection task does not replace a general-purpose workstation.'
  },
  'role.records': {
    id: 'role.records', title: 'Central service',
    description: 'A powered computer configured to provide shared services to other devices.',
    lookFor: ['Server-host capability', 'A usable wired interface', 'Shared services enabled'],
    tradeoff: 'A dedicated server is one option. A suitable general-purpose computer can serve this role, but support and availability still matter.'
  },
  'infra.switch': {
    id: 'infra.switch', title: 'Network switch',
    description: 'Connects the clinic’s wired devices on the local network.',
    lookFor: ['Enough available Ethernet ports', 'One port for every connected cable, including the access-point uplink'],
    tradeoff: 'Spare ports allow growth; buying more capacity does not repair a faulty setting.'
  },
  'infra.ap': {
    id: 'infra.ap', title: 'Wireless access point',
    description: 'Bridges the nurse’s Wi-Fi connection into the wired clinic network.',
    lookFor: ['Power', 'A connected Ethernet uplink', 'An associated nurse device inside the two modelled clinic rooms'],
    tradeoff: 'Wireless mobility still depends on the access point’s wired path. Clinic coverage does not extend to the home inset.'
  }
};

export const BOOTCAMP_LESSONS = [
  {
    id: 'bootcamp.station.equipment-connections',
    title: '1 · Equipment and connections',
    intro: 'Learn how the parts make a usable path before you take a client job. Bootcamp guidance and retries are free.',
    instructions: [
      'Read the short explanation, then use Show demonstration if you want to see an example.',
      'Start your own practice. Choose and power a reception computer, connect it and the server to the switch, then test bookings.',
      'Complete the changed example with the new setup card. The engine checks your actions; watching a demonstration does not complete practice.'
    ],
    explain: [
      'A computer takes input, follows stored instructions to process it, can store data, and produces output. Compare those functions in a workstation, wearable and server.',
      'The switch joins wired local devices. An access point connects a Wi-Fi device to that wired network. A router connects different networks; that comes in a later mission.',
      'In this catalog a desktop has an Ethernet port. A laptop needs an explicitly attached Ethernet adapter for a wired connection.',
      'The sensor dock is a different attachment: it transfers markers from a returned wearable. It does not add an Ethernet connection.',
      'A cable occupies two real ports. Power and a visible cable alone do not establish that the booking service works.'
    ],
    demo: {
      title: 'Watch a modelled connection',
      steps: ['Observe the chosen reception device and its ports.', 'Trace reception → switch → server.', 'Notice the booking test and the configuration it tested. Trainer actions are labelled as a demonstration.']
    },
    guided: {
      title: 'Build your own path',
      steps: ['Choose a reception computer and turn it on.', 'If you choose a laptop, attach its Ethernet adapter.', 'Use the connection controls to link reception and the server to different switch ports.', 'Run the reception booking test and inspect its result.']
    },
    changed: {
      title: 'Try the changed setup',
      steps: ['Read the new network card rather than copying an old address.', 'Build and test a valid reception path again.', 'If you try a different device, check its actual ports and attachments.']
    },
    checkNote: 'A successful practice check means this task worked in the model. Your teacher reviews the explanation and transfer of learning.',
    learningIds: ['cc.clinic.ipos', 'cc.clinic.device-fit', 'cc.clinic.connection-choice', 'cc.clinic.system-path']
  },
  {
    id: 'bootcamp.station.address-diagnosis',
    title: '2 · Addresses and diagnosis',
    intro: 'A service can fail because of a setting or a missing link. Use a test to find the cause before you make a change.',
    instructions: [
      'In practice, run the nurse workspace test and read its finding.',
      'Use the network card and mask to choose a valid, unused address, then repeat the test.',
      'In the changed example, begin with a new test. A similar symptom can have a different cause.',
      'Explain the evidence for your repair, or mark an oral explanation as pending.'
    ],
    explain: [
      'An IPv4 address has four number groups, each from 0 to 255. The subnet mask identifies which bits describe the network and which describe a host.',
      '/24 means 24 network bits. Its mask is 255.255.255.0. With this mask, the first three number groups identify this local network; that shortcut does not apply to every mask.',
      'For the practice network 192.168.50.0/24, use the setup card and an unused host address. The .0 network address and .255 broadcast address are not ordinary host choices.',
      'Two active devices must not use the same address in this model. A valid-looking address can still belong to the wrong network or duplicate another device.',
      'This pilot uses manual static assignment. Automatic assignment through DHCP is not implemented here. Same-subnet local service tests do not need a router, gateway or Internet access.',
      'Check capability and power, then the link, then addressing, service availability and permissions. Fixing the wrong layer can leave the original problem unchanged.'
    ],
    demo: {
      title: 'Watch a targeted repair',
      steps: ['Observe the failed nurse test.', 'Compare its saved address with the displayed network range.', 'Watch one relevant setting change and a repeat of the same test.']
    },
    guided: {
      title: 'Repair from evidence',
      steps: ['Run the nurse test and read the finding.', 'Inspect the nurse address and mask; compare them with the network card.', 'Choose an unused permitted host address and save it.', 'Repeat the test. Read its current result rather than relying on an earlier pass.']
    },
    changed: {
      title: 'A similar symptom, a different cause',
      steps: ['Run the nurse workspace test before changing anything.', 'Read the finding and inspect the path from the nurse through the access point to the server.', 'Make a change supported by the finding, then run the same test again.', 'Explain why changing only the IP address would leave this fault, or arrange an oral explanation.']
    },
    checkNote: 'The changed example needs your observed failure, a relevant reconnection, a current passing retest and your explanation or an oral-review arrangement. The teacher reviews the reasoning; the game does not grade its quality.',
    learningIds: ['cc.clinic.address', 'cc.clinic.diagnosis', 'cc.clinic.connection-choice', 'cc.clinic.system-path']
  },
  {
    id: 'bootcamp.station.access-handover',
    title: '3 · Access, people and handover',
    intro: 'A usable system must permit needed work and restrict unnecessary access. Explain the effects on the people using it.',
    instructions: [
      'Inspect the current permissions and choose a responsible policy.',
      'Collect the wearable’s seven synthetic markers, return it to the clinic and attach a sensor dock to the nurse companion.',
      'Hand off the markers, upload them through the tested network, then run the access checks.',
      'Write your own short privacy explanation or mark it for an oral conversation with your teacher.',
      'Use the changed example to check why blocking everyone can also fail the client’s needs.'
    ],
    explain: [
      'Authentication asks who is trying to use a system. Authorization asks what that identity is permitted to do. Here we use simulated roles, not real accounts.',
      'Reception needs bookings; nurses need the workspace. Allowing nurses to handle bookings too is a workflow choice with a benefit and a trade-off.',
      'A correct access check includes a permitted action and an intended denial on a technically reachable service. A disconnected cable cannot demonstrate that the policy blocked an outsider.',
      'The wearable collects offline at home. Returning it, handing markers to a compatible dock, and uploading them through the nurse’s network connection are separate steps.',
      'The transfer role may submit markers but may not browse the workspace. The markers contain no readings, names or patient records.',
      'Your handover combines engine observations with your own explanation. Arranging an oral explanation leaves that conversation pending; it does not invent a written answer.'
    ],
    demo: {
      title: 'Watch an access and transfer check',
      steps: ['Observe the allowed tasks and intended restrictions.', 'Trace offline collection → return → sensor handoff → authorized upload.', 'Watch the access tests, including the intended denial.']
    },
    guided: {
      title: 'Make and test the decision',
      steps: ['Choose either approved policy and inspect what its roles can do.', 'Complete the wearable journey using the separate sensor dock.', 'Run access and service tests.', 'Explain one benefit, one barrier and a condition that could change your choice, or arrange an oral review.']
    },
    changed: {
      title: 'Restore useful access',
      steps: ['Inspect the changed permission setup; do not assume that more blocking is always better.', 'Restore necessary work while keeping the specified restrictions.', 'Retest and explain the decision in this context.']
    },
    checkNote: 'Practice completion is preparation for a client. It is not a grade, a security certification or a teacher sign-off.',
    learningIds: ['cc.clinic.access', 'cc.clinic.stakeholders', 'cc.clinic.data-journey', 'cc.clinic.handover']
  }
];

export const UPLINK_TRANSFER = {
  title: 'Explain this repair',
  prompt: 'What stopped the nurse’s workspace test? What did you change, and what did the retest show? Why would changing only the IP address leave this fault?',
  placeholder: 'Use the result you observed. Two or three short sentences are enough.',
  oralLabel: 'I will explain this to my teacher — review pending.',
  hints: [
    {tier: 1, title: 'Read the finding', text: 'Which stage failed: the connection or the address check? Read the latest nurse result.'},
    {tier: 2, title: 'Trace the missing part', text: 'Wi-Fi association reaches the access point. Trace its wired path to the switch and server. Which connection is missing?'},
    {tier: 3, title: 'Worked example for this fault', text: 'Connect the access point’s Ethernet port to a free switch Ethernet port, then run the nurse workspace test again. Changing an address cannot reconnect two ports.'}
  ]
};

// Older saved attempts keep the task they actually performed.
export const LEGACY_ADDRESS_TRANSFER = {
  title: 'Use a different range — earlier saved task',
  steps: ['This saved example uses 192.168.70.0/24 and an inherited address fault.', 'Run the nurse test, inspect the network card and choose an unused valid host address.', 'Apply the repair and repeat the test. This is address practice from an earlier build, not evidence of the new unplugged-link task.'],
  checkNote: 'Earlier address-transfer evidence is preserved. To try the new missing-link example, open a fresh bootcamp practice attempt.'
};

export const GUIDE_SECTIONS = [
  {
    id: 'guide.devices-paths', title: 'Devices and paths',
    summary: 'Match the job to a device, inspect its real ports, and trace the service path.',
    hints: [
      { tier: 1, title: 'Start with the job', text: 'Which task is unmet: fixed-desk work, movement between rooms, offline collection or a shared service? Compare that task with the selected device’s capabilities.' },
      { tier: 2, title: 'Trace the route', text: 'Select the source and follow its path to the server. Check power and every occupied port. The nurse needs Wi-Fi association plus the access point’s wired uplink. A laptop’s wired port exists only after an Ethernet adapter is attached.' },
      { tier: 3, title: 'Separate the two transfers', text: 'The sensor dock transfers a returned wearable to the nurse companion; it is not a network cable or Ethernet adapter. Check collection, return and handoff separately, then test the companion’s route to marker intake. Change the part indicated by your result and retest.' }
    ],
    price: { credits: 5, simulatedMinutes: 3, provisional: true },
    pricingNote: 'Use the current engine quote. One active-job consultation includes all tiers and reopening; training and delivered-job review are free.'
  },
  {
    id: 'guide.addressing-diagnosis', title: 'Addressing and diagnosis',
    summary: 'Use the observed failure to compare the address, the given mask and the permitted range.',
    hints: [
      { tier: 1, title: 'Find the last working stage', text: 'Read the current test result. Did the device have a path to the service, or did the test stop earlier? A missing link should be repaired before you decide that permissions are the problem.' },
      { tier: 2, title: 'Compare the settings', text: 'Compare the source address and mask with the network card and another working endpoint. With the displayed /24 mask, the first three address groups identify the local network. Also check whether another active device already uses the proposed address.' },
      { tier: 3, title: 'Make one justified change', text: 'If the saved address belongs to a different range, choose an unused permitted host address using this job’s setup card. Avoid its network and broadcast addresses. Save the setting and run the same test again. This model has no automatic DHCP assignment to request.' }
    ],
    price: { credits: 5, simulatedMinutes: 3, provisional: true },
    pricingNote: 'The quote reserves fictional credits and adds simulated consultation minutes. It never bills your actual reading time.'
  },
  {
    id: 'guide.access-handover', title: 'Access and handover',
    summary: 'Test useful access and appropriate restrictions, then explain what changed for people.',
    hints: [
      { tier: 1, title: 'Name the necessary work', text: 'List what reception, nurses and marker transfer need to do. Then identify what an outsider must not be able to do. Which requirements are currently met?' },
      { tier: 2, title: 'Test the effective policy', text: 'Compare the two approved policies: bookings stay with reception, or nurses also handle bookings. Run the access probes on a reachable service. A policy name does not prove permissions, and blocking every role prevents legitimate work.' },
      { tier: 3, title: 'Explain your own judgement', text: 'Use your actual test results to explain a benefit, a barrier and a condition that would change your choice. Check that the wearable transfer can submit markers without browsing the workspace. Your teacher reviews your reasoning; do not copy a generated answer or enter names.' }
    ],
    price: { credits: 5, simulatedMinutes: 3, provisional: true },
    pricingNote: 'Guide use is recorded as support context. Its game cost changes the business ledger, never an automatic grade.'
  }
];

export const ICAN_STATEMENTS = [
  { id: 'cc.clinic.ipos', title: 'Input, process, store, output', text: 'I can trace input, processing, storage and output in a computer system.', source: 'Computers L1, 3.3A', demonstration: 'Compare the functions of a workstation, wearable and central host.' },
  { id: 'cc.clinic.device-fit', title: 'Choose for the job', text: 'I can choose a suitable computer type and explain a trade-off.', source: 'Computers L1, 3.3A', demonstration: 'Equip all four clinic roles and compare a reasonable alternative.' },
  { id: 'cc.clinic.connection-choice', title: 'Choose a usable connection', text: 'I can select compatible connections and explain what an adapter, dock or access point contributes.', source: 'Computers L2; Networks 3.4A–B', demonstration: 'Use actual ports and distinguish Ethernet connection from sensor handoff.' },
  { id: 'cc.clinic.system-path', title: 'Explain the whole path', text: 'I can trace how a client reaches a shared service through the local network.', source: 'Networks 3.4A–B', demonstration: 'Explain the wired or wireless path and a point where its failure affects work.' },
  { id: 'cc.clinic.address', title: 'Use an address and mask', text: 'I can use the given subnet mask to choose a valid, unused local address.', source: 'Networks 3.4C; pilot static-address application', demonstration: 'Choose and test an unused local address in bootcamp, then apply the displayed mask and range in the clinic.' },
  { id: 'cc.clinic.diagnosis', title: 'Test a repair', text: 'I can use a diagnostic result to make a targeted change and check the result.', source: 'Networks 3.4B–C; proposed troubleshooting practice', demonstration: 'Connect the observed failure, relevant change and current retest.' },
  { id: 'cc.clinic.access', title: 'Test permissions', text: 'I can test that roles can do necessary work while unnecessary access is restricted.', source: 'Networks security, pp.113–114; supplied security-layer organizer', demonstration: 'Verify required allows and intended denials on a healthy service.' },
  { id: 'cc.clinic.stakeholders', title: 'Consider people', text: 'I can explain who benefits from a decision, who faces a barrier and what could change my recommendation.', source: 'Computers lesson stakeholder and trade-off reasoning', demonstration: 'Justify a booking-access policy using the actual workflow consequences.' },
  { id: 'cc.clinic.data-journey', title: 'Follow the data journey', text: 'I can distinguish collection, local storage, handoff and arrival at a central service.', source: 'Computers clinic scenario; Networks scope and sharing', demonstration: 'Trace the return-and-sync wearable journey and explain its limits.' },
  { id: 'cc.clinic.handover', title: 'Hand over evidence honestly', text: 'I can explain what I changed, what my tests show and what still needs checking.', source: 'Supplied lesson reasoning and teacher-reviewed evidence approach', demonstration: 'Produce a handover using actual observations and your own words.' }
].map(statement => ({ ...statement, reviewNote: 'Evidence can support a teacher conversation. A completed task or guide purchase does not automatically establish understanding.' }));

export const EXPLANATION_PROMPTS = [
  { key: 'equipment', title: 'Why this equipment?', prompt: 'Why do your computer choices fit the four jobs? Compare one alternative and name a trade-off.', placeholder: 'Use your own words. Do not include names or identifying information.' },
  { key: 'repair', title: 'What caused the problem?', prompt: 'What prevented the nurse’s service from working? Which observation or setting supported your repair, and what did the retest show?', placeholder: 'Explain the evidence you actually observed. An early repair is valid; do not invent a failed test.' },
  { key: 'privacy', title: 'Who can do what?', prompt: 'Who can do what now? Explain one benefit, one cost or barrier, and a condition that would change your access decision.', placeholder: 'Describe your actual policy and tests. Do not enter patient information.' },
  { key: 'limitations', title: 'What remains outside the model?', prompt: 'What is one important thing this model leaves out that a real deployment would need checked?', placeholder: 'Explain a limitation in your own words, or arrange an oral explanation with your teacher.' }
];

export const GLOSSARY = [
  { id: 'term.computer', title: 'Computer', text: 'A system that takes input, follows stored instructions to process data, can store it, and produces output.' },
  { id: 'term.server', title: 'Server', text: 'A computer or program providing a service to clients. A suitable general-purpose computer can take the server role; it does not have to look like a rack.' },
  { id: 'term.client', title: 'Client', text: 'A device or program that requests a service from another system.' },
  { id: 'term.lan', title: 'Local area network (LAN)', text: 'Connected devices sharing resources within a local site. A local service can work without Internet access.' },
  { id: 'term.switch', title: 'Switch', text: 'A device that forwards Ethernet traffic between local wired ports. The pilot simplifies its internal forwarding behaviour.' },
  { id: 'term.ap', title: 'Wireless access point', text: 'A device that bridges associated Wi-Fi clients into a network. Its uplink still needs a working path.' },
  { id: 'term.router', title: 'Router', text: 'A device that forwards traffic between different networks. This first clinic uses one local subnet; routing is a later-mission topic.' },
  { id: 'term.ethernet-adapter', title: 'Ethernet adapter', text: 'An attachment that adds a wired network interface and port to a compatible host. It is not a separate router.' },
  { id: 'term.sensor-dock', title: 'Sensor dock', text: 'A compatible handoff interface between the returned wearable and its companion. It does not replace an Ethernet adapter.' },
  { id: 'term.ip', title: 'IP address', text: 'A logical address used to identify an interface for network communication. The IPv4 addresses here have four groups of numbers.' },
  { id: 'term.mask', title: 'Subnet mask and /24', text: 'The mask identifies network and host bits. /24 uses 24 network bits and the mask 255.255.255.0. Different masks can create different network boundaries.' },
  { id: 'term.static', title: 'Static assignment', text: 'A deliberately configured address. This pilot uses static addresses rather than an automatic DHCP service.' },
  { id: 'term.diagnostic', title: 'Diagnostic test', text: 'An observation of a particular system state. After a relevant change, an earlier result is historical and the current configuration needs retesting.' },
  { id: 'term.authentication', title: 'Authentication', text: 'Checking an identity. This game uses simulated roles and does not create or test real user accounts.' },
  { id: 'term.authorization', title: 'Authorization', text: 'Deciding what an identity or role may do. Necessary access and appropriate restrictions both matter.' },
  { id: 'term.stakeholder', title: 'Stakeholder', text: 'A person or group affected by a system or decision. Different stakeholders can value different benefits and face different barriers.' },
  { id: 'term.tradeoff', title: 'Trade-off', text: 'A choice that gains something while giving up something else. Explain the consequence rather than treating one device or policy as universally best.' },
  { id: 'term.receipt', title: 'Receipt and current service', text: 'A past transfer receipt shows what arrived then. It does not prove the connection and permissions still work now.' },
  { id: 'term.consultation', title: 'Guide consultation', text: 'Optional how-to support. An active-job section has a disclosed fictional fee and simulated-time cost; all its tiers and reopening are included. Ordinary controls, diagnostics, glossary and accessibility stay free.' }
];

export const POLICY_COPY = {
  'policy.roles-separated': {
    title: 'Separate responsibilities', description: 'Reception handles bookings; nurses use the workspace. Transfer submits markers; outsiders get no staff function.',
    benefit: 'The booking responsibility has a narrow boundary.',
    tradeoff: 'A nurse asks reception to change a booking.',
    consequence: 'Useful when a clear division of tasks suits the clinic. Explain the extra step it creates.'
  },
  'policy.nurse-also-books': {
    title: 'Nurse also books', description: 'Nurses can arrange bookings as well as use the workspace. Reception stays limited to bookings.',
    benefit: 'Nurses can arrange a follow-up while working in the room.',
    tradeoff: 'The nurse role receives an additional function and responsibility.',
    consequence: 'Useful when that flexibility fits the workflow. Explain why the extra permission is justified.'
  },
  'policy.broad-access': {
    title: 'Open access — explore', description: 'Every simulated role can use every service.',
    benefit: 'Few task restrictions are imposed.',
    tradeoff: 'Outsiders and transfer roles receive access beyond their needs.',
    consequence: 'Test the exposure. A working connection does not make this meet the clinic’s access requirements.'
  },
  'policy.deny-all': {
    title: 'Block every role — explore', description: 'No simulated role can use a service.',
    benefit: 'No role is granted a service by this policy.',
    tradeoff: 'Reception, nurses and marker transfer cannot do their necessary work.',
    consequence: 'Test the lost access. Maximum blocking does not meet the clinic’s needs.'
  }
};

export const CLINIC_BRIEF = CLIENT_BRIEF;
export const TRAINING_STATIONS = BOOTCAMP_LESSONS;
export const LEARNING_CONTENT = {
  version: '0.4.0',
  officialOutcomeIds: [],
  clientBrief: CLIENT_BRIEF,
  roleBriefs: ROLE_BRIEFS,
  bootcampLessons: BOOTCAMP_LESSONS,
  guideSections: GUIDE_SECTIONS,
  iCanStatements: ICAN_STATEMENTS,
  explanationPrompts: EXPLANATION_PROMPTS,
  glossary: GLOSSARY,
  policyCopy: POLICY_COPY
};
export default LEARNING_CONTENT;
