/**
 * Original student copy for Opening Shift, 16 November 2026 (America/Halifax).
 * Data only. The engine owns actions, costs, observations and readiness.
 * cc.clinic.*, role.* and guide.* are internal project IDs, not IB outcome codes.
 * Worked examples teach a different network; learner explanations stay their own.
 */

export const CLIENT_QUESTIONS = [
  {
    id: 'question.clinic.working-services',
    label: 'What already works?',
    speaker: 'Ari · clinic coordinator',
    answer: 'Reception can already open bookings at the front desk. The shared host and switch are in the equipment room. Please keep that service working while you prepare the nurse’s workspace.'
  },
  {
    id: 'question.clinic.nurse-locations',
    label: 'What does the nurse need to carry and type?',
    speaker: 'Sam · nurse',
    answer: 'I move between exam rooms A and B. I make short selections, but sometimes need to type a longer update. Our laptop has a keyboard; a tablet would be lighter to carry. Either could work—tell us why your choice fits.'
  },
  {
    id: 'question.clinic.nurse-bookings',
    label: 'Who should arrange follow-up bookings?',
    speaker: 'Ari · clinic coordinator',
    answer: 'Reception can keep responsibility for bookings, with Sam asking the desk for changes. Or we can authorize nurses to arrange follow-ups from their workspace. Explain the benefit and extra responsibility of your recommendation. Outsiders must have no staff access.'
  }
];

export const OPENING_GOALS = {
  brief: {
    title: 'Understand the shift',
    items: [
      { id: 'cc.clinic.device-fit', text: 'I can choose equipment that fits the nurse’s work and explain a trade-off.' },
      { id: 'cc.clinic.stakeholders', text: 'I can identify whose work is affected by a booking-access decision.' }
    ]
  },
  build: {
    title: 'Make a working path',
    items: [
      { id: 'cc.clinic.connection-choice', text: 'I can connect the nurse’s device through a working access point and uplink.' },
      { id: 'cc.clinic.address', text: 'I can use the given mask to check or choose a valid, unused local address.' },
      { id: 'cc.clinic.diagnosis', text: 'I can use an observation to choose a relevant repair.' }
    ]
  },
  check: {
    title: 'Prove it in the workplace',
    items: [
      { id: 'cc.clinic.system-path', text: 'I can trace the nurse’s path to the shared service in both exam rooms.' },
      { id: 'cc.clinic.access', text: 'I can test necessary staff access and an intended outsider denial.' },
      { id: 'cc.clinic.diagnosis', text: 'I can retest after a change and preserve reception’s working service.' }
    ]
  },
  handover: {
    title: 'Explain your decision',
    items: [
      { id: 'cc.clinic.stakeholders', text: 'I can explain a benefit, a barrier and a condition that could change my access recommendation.' },
      { id: 'cc.clinic.handover', text: 'I can explain what I changed, what my tests show and what still needs checking.' }
    ]
  }
};

export const EQUIPMENT_OPTIONS = [
  {
    id: 'laptop',
    itemId: 'item.laptop',
    sku: 'laptop',
    kind: 'laptop',
    roleId: 'role.nurse',
    title: 'Keep the clinic laptop',
    description: 'The clinic already owns a portable laptop with a keyboard, screen and Wi-Fi.',
    benefit: 'No replacement purchase; a physical keyboard supports longer typing.',
    tradeoff: 'It is bulkier to carry between rooms than the tablet in this kit.',
    question: 'When would keeping the keyboard matter more than carrying less weight?',
    costNote: 'Keeping clinic-owned equipment has no purchase cost.'
  },
  {
    id: 'tablet',
    itemId: 'item.tablet',
    sku: 'tablet',
    kind: 'tablet',
    roleId: 'role.nurse',
    title: 'Choose a lighter tablet',
    description: 'A portable touchscreen with Wi-Fi can take over the nurse’s workspace role.',
    benefit: 'Lighter to carry while moving between the two rooms.',
    tradeoff: 'Uses more of the equipment allowance; longer typing may be less convenient.',
    question: 'What in Sam’s work would justify the replacement cost?',
    costNote: 'Check the shop’s current price. The old laptop is retained for possible reuse.'
  }
];

export const ADDRESSING_HELP = {
  title: 'A small address check',
  explanation: [
    'An IP address identifies a network interface. The subnet mask separates its network part from its host part.',
    'Here /24 means 24 network bits: mask 255.255.255.0. With this mask, devices on the same local subnet share the first three number groups. Other masks can put the boundary elsewhere.',
    'Choose a usable host address that no other active device uses. In a /24 network, the ending .0 identifies the network and .255 is its broadcast address; neither is a host choice.',
    'A suitable address cannot supply power, reconnect a cable or grant permission. Read the test result before choosing a change.'
  ],
  workedExample: {
    title: 'Training example · a different network',
    note: 'This explains the method. These are not the clinic’s settings and it records no player evidence.',
    network: '192.168.60.0/24',
    mask: '255.255.255.0',
    usedAddresses: ['192.168.60.10', '192.168.60.20'],
    currentAddress: '192.168.61.44',
    steps: [
      'The card says 192.168.60.0/24, so a local host uses 192.168.60 followed by a usable host number.',
      '192.168.61.44 belongs to a different /24 subnet. If .44 is unused, 192.168.60.44 is one possible local choice; .10 and .20 are already taken.',
      'Keep the supplied mask, apply the chosen address and repeat the same service test. A passing address check still needs a working path, service and permission.'
    ],
    applyPrompt: 'Now use the actual clinic card. Which parts must match, and how will you check that your host address is unused?'
  }
};

export const TRANSFER_QUESTION = {
  title: 'A different cause',
  explanationKey: 'repair',
  prompt: 'A nurse has a valid, unused local address and is associated with Wi-Fi, but the access point’s uplink is unplugged. Why can changing only the IP address not restore the workspace? Which connection would you inspect, and what would you retest?',
  observationPrompt: 'If you play this rehearsal, use your actual finding, change and retest. If you only discuss it, identify it as a prediction.',
  oralLabel: 'Discuss the changed cause with my teacher — review pending.',
  note: 'Use during a changed rehearsal or handover. It is not an extra completion quiz.'
};

export const OPENING_GUIDES = [
  {
    id: 'guide.devices-paths',
    title: 'Equipment and the path',
    summary: 'Choose for the job, then trace every part of the nurse’s route.',
    hints: [
      {
        tier: 1,
        title: 'Notice the need',
        text: 'Sam must work in both rooms and sometimes type longer updates. Compare the owned laptop with the tablet. What does each gain or give up?'
      },
      {
        tier: 2,
        title: 'Follow the route',
        text: 'Trace nurse device → Wi-Fi access point → switch → shared host. Inspect power, association and the access point’s real Ethernet connection. Being associated with Wi-Fi is only one part of that route.'
      },
      {
        tier: 3,
        title: 'Act on the missing part',
        text: 'If the access point is absent, install and power one in the equipment room. If its uplink is missing, use a cable between its Ethernet port and a free switch port. Associate the nurse device, then test its workspace. Use the result to decide what to inspect next.'
      }
    ],
    price: { credits: 5, simulatedMinutes: 3 },
    pricingNote: 'Free in rehearsal. In a client job, the current engine quote covers this section’s three hints and reopening; it does not charge actual reading time.'
  },
  {
    id: 'guide.addressing-diagnosis',
    title: 'Addresses and diagnosis',
    summary: 'Find the failed stage before choosing a repair.',
    hints: [
      {
        tier: 1,
        title: 'Read the finding',
        text: 'Which stage did the latest test reach: physical path, address, service or permission? An inspection is useful evidence too. Do not invent a failed test if you spotted the setting first.'
      },
      {
        tier: 2,
        title: 'Compare the right facts',
        text: 'For an address finding, compare the nurse’s address and mask with the clinic card and used addresses. For a path finding, inspect power, association and ports. Changing a correct address cannot reconnect an uplink.'
      },
      {
        tier: 3,
        title: 'Use the method, then retest',
        text: 'Read the different-network example below. If your finding is an unsuitable address, choose an unused host in the clinic’s stated /24 range and keep its supplied mask. If the finding is a missing link, repair that link. Repeat the same test after your change.'
      }
    ],
    relatedHelp: 'addressing',
    price: { credits: 5, simulatedMinutes: 3 },
    pricingNote: 'This section includes the worked training example. Client consultation is charged once per section; rehearsal is free.'
  },
  {
    id: 'guide.access-handover',
    title: 'Access and handover',
    summary: 'Keep necessary work possible and explain the responsibility you chose.',
    hints: [
      {
        tier: 1,
        title: 'Name the work',
        text: 'Reception needs bookings and the nurse needs the workspace. Should nurses also arrange follow-ups, or ask reception? Both can be responsible choices. Outsiders must have no staff access.'
      },
      {
        tier: 2,
        title: 'Test the consequence',
        text: 'Choose a policy, or explicitly keep the current one. Test nurse bookings to observe that choice. Also test required staff services and outsider access on a working connection: a disconnected service does not prove a policy restriction.'
      },
      {
        tier: 3,
        title: 'Hand over your evidence',
        text: 'After your last technical change, test reception and the nurse workspace in each exam room. Explain your equipment choice, observed repair, access trade-off and one limitation. Use your own words, or mark an explanation for a teacher conversation.'
      }
    ],
    price: { credits: 5, simulatedMinutes: 3 },
    pricingNote: 'All three client sections together are capped at 15 fictional credits and 9 simulated minutes. Help use is recorded as support context, never converted into a grade.'
  }
];

export const POLICY_COPY = {
  'policy.roles-separated': {
    title: 'Separate responsibilities',
    description: 'Reception handles bookings; nurses use the workspace. Outsiders get no staff function.',
    benefit: 'Booking authority stays with the reception role.',
    tradeoff: 'Sam asks reception to arrange or change a follow-up.',
    consequence: 'A denied nurse-booking request is expected under this choice, while reception bookings and the nurse workspace must work.',
    retainLabel: 'Keep separate responsibilities',
    clientReply: 'Ari: Reception will keep booking responsibility. Sam will pass follow-up requests to the desk. Explain why that extra step suits this clinic.'
  },
  'policy.nurse-also-books': {
    title: 'Nurse also books',
    description: 'Nurses can use the workspace and arrange bookings. Reception remains limited to bookings; outsiders get no staff function.',
    benefit: 'Sam can arrange a follow-up from an exam room.',
    tradeoff: 'The nurse role receives an additional permission and responsibility.',
    consequence: 'A nurse-booking request should be allowed as well as the required workspace and reception work.',
    clientReply: 'Ari: Nurses can arrange follow-ups from their workspace. Explain why this extra permission is justified and who should review it if duties change.'
  },
  'policy.broad-access': {
    title: 'Open access · explore',
    description: 'Every simulated role receives every service.',
    benefit: 'There are few permission barriers to a task.',
    tradeoff: 'Outsiders also receive staff functions they do not need.',
    consequence: 'Run the outsider test. A working service alone does not meet the clinic’s access requirement.',
    clientReply: 'Ari: Outsiders must not use staff services. Check the actual access result and revise this choice.'
  },
  'policy.deny-all': {
    title: 'Block every role · explore',
    description: 'No simulated role receives any service.',
    benefit: 'The policy grants no service access.',
    tradeoff: 'Reception and nurses also lose the work they need to do.',
    consequence: 'Run the staff tests. An outsider denial alone does not show a useful or complete solution.',
    clientReply: 'Ari: The clinic still needs reception bookings and the nurse workspace. Check the staff results and revise this choice.'
  }
};

export const EXPLANATION_PROMPTS = [
  {
    key: 'equipment',
    title: 'Why this equipment?',
    prompt: 'Why does your nurse device fit Sam’s work? Compare the alternative and name one trade-off.',
    placeholder: 'A few sentences in your own words. Use the device you actually kept or chose.',
    oralLabel: 'Explain my equipment choice to my teacher — review pending.'
  },
  {
    key: 'repair',
    title: 'What changed, and why?',
    prompt: 'What did you observe, what did you change, and what did the retest show? Explain why that change addressed the cause.',
    placeholder: 'An inspected setting can support an early repair. Do not invent a failed test.',
    oralLabel: 'Explain my observation and repair to my teacher — review pending.'
  },
  {
    key: 'privacy',
    title: 'Who can do what?',
    prompt: 'Why did you choose or keep this access policy? Give one benefit, one barrier or extra responsibility, and a condition that could change your recommendation.',
    placeholder: 'Refer to your actual staff, nurse-booking and outsider results. Keep all people and examples fictional.',
    oralLabel: 'Explain my access decision to my teacher — review pending.'
  },
  {
    key: 'limitations',
    title: 'What still needs checking?',
    prompt: 'Name one thing this model simplifies. What would need checking before a real deployment?',
    placeholder: 'Explain one practical limit in your own words.',
    oralLabel: 'Discuss a model limitation with my teacher — review pending.'
  }
];

export const CONTENT_CONNECTIONS = [
  {
    id: 'connection.systems',
    concept: 'Systems',
    question: 'Which technical connection and human work procedure must both work for your chosen booking arrangement? Who is affected if either fails?'
  },
  {
    id: 'connection.power',
    concept: 'Power',
    question: 'Who gains the ability to act when nurses can make bookings? Who should authorize or question that access?'
  },
  {
    id: 'connection.values-ethics',
    concept: 'Values and ethics',
    question: 'How did you balance easier work, responsibility and restricted access? What change in the clinic would alter your recommendation?'
  },
  {
    id: 'connection.health',
    concept: 'Health context',
    question: 'How could an unavailable workspace or an unnecessary permission affect people in a clinic? Which effects can this small model actually demonstrate?'
  }
];

export const OPENING_CONTENT = {
  version: '0.7.0',
  missionId: 'mission.clinic.opening-shift.001',
  title: 'Opening Shift',
  subtitle: 'Riverbend Community Clinic',
  tagline: 'One working desk. Two exam rooms. Your next client.',
  phone: {
    sender: 'Ari',
    role: 'Clinic coordinator',
    subject: 'A mobile workspace for the afternoon shift',
    greeting: 'Can you get our nurse ready for the afternoon shift?',
    brief: [
      'Reception can already use bookings, but the nurse’s setup needs your attention. Sam needs the workspace in both exam rooms.',
      'Check what we own, choose a suitable plan and find what is stopping the service. Keep reception working.',
      'Then recommend who should handle bookings, test the result and leave us a short handover.'
    ],
    constraints: [
      'Use the client’s equipment allowance shown in the shop.',
      'Test the nurse workspace in exam rooms A and B, plus reception bookings.',
      'Keep necessary staff work available and outsiders out of staff functions.'
    ],
    closing: 'Ask if you need to know more about our work. You can reread every reply.'
  },
  stageOrder: ['brief', 'build', 'check', 'handover'],
  modes: {
    rehearsal: {
      title: 'Free rehearsal',
      description: 'Explore this shift at your own pace. Try either device and use all guides free. Rehearsal earns no contractor fee and does not complete an independent client job.',
      startLabel: 'Start a free rehearsal',
      preparationNote: 'New to networks? The separate bootcamp teaches connections, addresses and diagnosis. This rehearsal does not mark that bootcamp complete.'
    },
    client: {
      title: 'Independent client',
      description: 'Make the choices yourself. Optional guides remain available with the disclosed consultation terms. Tests, ordinary inspection and accessibility support are free.',
      startLabel: 'Take the client job',
      preparationNote: 'Use this route after preparation, or as a teacher-directed prior-learning choice. Starting it does not invent earlier training or mastery.'
    }
  },
  equipmentOptions: EQUIPMENT_OPTIONS,
  infrastructure: [
    { itemId: 'item.ap', kind: 'access-point', sku: 'access-point', title: 'Wireless access point', text: 'Joins the nurse’s Wi-Fi device to the wired clinic network. It needs power, an uplink and the device’s association.' },
    { itemId: 'item.uplink', kind: 'ethernet-cable', sku: 'ethernet-cable', title: 'Ethernet uplink', text: 'Connects the access point to an available switch port. An address change cannot replace this physical connection.' }
  ],
  replacementNote: 'A replacement tablet receives the nurse’s inherited deployment profile once. Buying a new device does not diagnose that profile. The old laptop is switched off and retained; you can reuse it before handover.',
  policies: POLICY_COPY,
  addressing: ADDRESSING_HELP,
  transfer: TRANSFER_QUESTION,
  evidenceNote: 'Your record contains actual choices, changes, tests and your own explanations. A pending oral explanation stays pending. Completion, money, speed and help use do not award an IB grade or certify mastery.',
  economy: {
    title: 'Two separate accounts',
    allowance: 'The client has 180 fictional credits for equipment. Unspent allowance stays with the client.',
    fee: 'The independent job has a 120-credit contractor fee before any optional consultation cost.',
    guidance: 'Each new guide section costs 5 credits and 3 simulated minutes in the client job. All tiers and reopening are included, capped at 15 credits and 9 minutes. Rehearsal help is free.',
    returns: 'Before handover, purchased items can be uninstalled and returned for their recorded price. Check and retest any affected path after changing equipment.',
    reflection: 'Could charging for help discourage someone from checking a risky decision? How would you design support so they still ask when needed?',
    note: 'Prices and minutes are game assumptions. Reading time is not timed or billed; the ledger is not a learning score. Use the engine’s current quote and balance.'
  },
  checksNote: 'A current model check shows what the engine evaluates now. Your recorded tests show what you actually tested. After a relevant change, repeat tests marked stale.',
  boundaries: [
    'This job models one local clinic network. It does not simulate Internet routing, DHCP, DNS, VLANs or real user authentication.',
    'Room coverage is declared by the model; a drawn signal or cable is not a measured reliability test.',
    'Use only fictional task labels. Enter no names, patient information, passwords or real accounts.',
    'The original bootcamp and wearable follow-up are separate activities with separate evidence.'
  ],
  contentConnections: CONTENT_CONNECTIONS,
  connectionNote: 'Optional discussion lenses for your own explanation; no extra quiz or whole-chapter claim.',
  goals: OPENING_GOALS,
  guides: OPENING_GUIDES,
  questions: CLIENT_QUESTIONS,
  explanationPrompts: EXPLANATION_PROMPTS,
  officialOutcomeIds: []
};

export default OPENING_CONTENT;
