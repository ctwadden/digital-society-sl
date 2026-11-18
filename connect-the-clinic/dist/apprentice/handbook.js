export const HANDBOOK = [
  {
    stationId: 'station.cables',
    title: 'Build a local network path',
    lessonRef: 'Course 3.4 Networks — Components of computing networks',
    status: 'practised',
    summary: 'A working local service needs power and a complete path through compatible network ports, not just a glowing light.',
    sections: [
      {
        heading: 'Connections have different jobs',
        paragraphs: [
          'Ethernet carries network data between RJ45 ports. Power makes equipment able to operate, but it does not carry a network request. Display and USB connections have other jobs in this clinic. A cable must have compatible connectors, and both ends must reach the correct ports.',
          'A network interface card, or NIC, changes a computer’s data into signals for a wired or wireless network. In the game, a compatible Ethernet port represents the wired interface. An access point provides the wireless side and joins it to the wired local network.'
        ]
      },
      {
        heading: 'Trace the whole route',
        paragraphs: [
          'For a wired client, trace the route from the computer’s RJ45 port, along Ethernet, into a switch port, then through another switch port and cable to the service host. The switch connects devices on this one local network. The service tester reports a code and the route it checked.',
          'For Wi-Fi, the tablet must associate with the access point in a covered room. The access point also needs power and an Ethernet uplink to the switch. Association alone does not prove that the service can be reached.'
        ]
      },
      {
        heading: 'Power is one prerequisite',
        paragraphs: [
          'A power light shows only that a device is receiving power. A disconnected port, missing uplink, invalid address, or unavailable service can still stop the route. Use the current test result, repair the named cause, and test again because any technical change makes the earlier result stale.'
        ]
      }
    ],
    terms: [
      ['Ethernet', 'A wired networking method used here to carry data between RJ45 ports.'],
      ['RJ45 port', 'The network socket used by the Ethernet links in this game.'],
      ['Network interface card (NIC)', 'Hardware that turns a device’s data into signals for a wired or wireless network.'],
      ['Switch', 'A device that connects devices on one local network and forwards data toward the intended port.'],
      ['Wireless access point', 'A device that provides Wi-Fi and bridges associated devices into the wired local network.'],
      ['Uplink', 'The Ethernet connection from the access point to the switch.']
    ],
    ican: [
      { id: 'cc.clinic.connection-choice', text: 'I can select compatible connections and explain what an access point contributes.' },
      { id: 'cc.clinic.system-path', text: 'I can trace how a client reaches a shared service through the local network.' },
      { id: 'cc.clinic.diagnosis', text: 'I can use a diagnostic result to make a targeted change and check the result.' }
    ],
    checkYourself: [
      'Why does a power light not prove that the service works?',
      'What route does a wired request take through the switch?',
      'What three conditions does the wireless path need?'
    ],
    notPractised: [
      'Making or crimping cables and doing electrical work.',
      'Using hubs, routers, gateways, modems, an ISP, or the internet.',
      'Measuring radio signals or real Wi-Fi propagation.'
    ]
  },
  {
    stationId: 'station.addressing',
    title: 'Give a device a usable local address',
    lessonRef: 'Course 3.4 Networks — Components and characteristics of computing networks',
    status: 'practised',
    summary: 'On the game’s local /24 network, each device needs a valid, unused host address in the same network.',
    sections: [
      {
        heading: 'Three devices, three roles',
        paragraphs: [
          'A switch connects devices within one local network and forwards traffic toward the intended port. A hub is an older device that copies incoming traffic to every port. A router connects different networks and forwards packets between them. The game practises switching on one local network; hub behaviour and routing are explanations only.'
        ]
      },
      {
        heading: 'Address plus mask',
        paragraphs: [
          'An IPv4 address identifies a network interface on an IP network. The subnet mask shows which bits describe the network and which describe the host. With the game’s 255.255.255.0 mask, also written /24, the first three number groups identify the network. That first-three-groups shortcut is only valid for /24, not for every mask.',
          'A usable address must be valid, unused, and on the same /24 network. In a /24, the address ending .0 identifies the network and the address ending .255 is reserved for broadcast, so neither is a host address. An address already assigned to another active device would create a duplicate.'
        ]
      },
      {
        heading: 'Names and hardware identifiers',
        paragraphs: [
          'People often use domain names instead of numeric addresses. DNS translates a domain name into an IP address, but the game does not perform DNS lookups. A MAC address identifies a network interface at the hardware-link level. The lesson explains MAC addresses, but the game does not ask you to inspect or use one.'
        ]
      }
    ],
    terms: [
      ['IPv4 address', 'A four-group numeric address used to identify an interface on an IP network.'],
      ['Subnet mask', 'A value that marks the network and host parts of an IP address.'],
      ['/24', 'A prefix length with 24 network bits, represented here by 255.255.255.0.'],
      ['Reserved address', 'An address kept for a special network purpose rather than an ordinary host.'],
      ['Domain name system (DNS)', 'A service that translates domain names into IP addresses.'],
      ['MAC address', 'An identifier assigned to a network interface.'],
      ['Router', 'A device that forwards data between different networks.'],
      ['Hub', 'A device that repeats incoming data to every connected port.']
    ],
    ican: [
      { id: 'cc.clinic.address', text: 'I can use the given mask to choose a valid, unused local address.' },
      { id: 'cc.clinic.system-path', text: 'I can explain the switch’s role in this local service route.' },
      { id: 'cc.clinic.diagnosis', text: 'I can distinguish an addressing failure from a physical-path failure and retest after repair.' }
    ],
    checkYourself: [
      'Why can two active devices not use the same IPv4 address?',
      'Why is comparing the first three number groups only a /24 shortcut?',
      'Which device would connect this LAN to a different network?'
    ],
    notPractised: [
      'Routing, gateways, modems, ISP links, DHCP, or general subnet calculation.',
      'DNS name lookups or using MAC addresses.',
      'Hub traffic behaviour.'
    ]
  },
  {
    stationId: 'station.parts',
    title: 'Follow data through a computer',
    lessonRef: 'Course 3.3B Components of a computer — Inside the box, Follow the data, and Software layers',
    status: 'practised',
    summary: 'Computers combine input, processing, storage, and output through connected hardware controlled by layers of software.',
    sections: [
      {
        heading: 'Four functions',
        paragraphs: [
          'Input enters a system through devices such as a keyboard or sensor. Processing follows instructions and changes data. Storage holds data for later use. Output presents a result through a screen, speaker, printer, or another device. One task can move through these functions several times.'
        ]
      },
      {
        heading: 'Parts inside the case',
        paragraphs: [
          'The motherboard connects the main components. The CPU carries out program instructions. RAM holds programs and data currently in use, but it is volatile and empties without power. An SSD or hard disk keeps files for the long term. The power supply converts incoming electricity into the forms the components need.'
        ]
      },
      {
        heading: 'Software has layers',
        paragraphs: [
          'Application software performs a user’s task. It asks the operating system to manage memory and communicate with hardware, often through a device driver. Utility software maintains or configures the system, such as backup or antivirus tools. Hardware provides the physical base, but software instructions make it useful.'
        ]
      }
    ],
    terms: [
      ['Input', 'Data or instructions entering a computer system.'],
      ['CPU', 'The processor that carries out program instructions.'],
      ['RAM', 'Fast, volatile memory holding programs and data currently in use.'],
      ['Storage', 'Non-volatile hardware that keeps software and files when power is off.'],
      ['Motherboard', 'The main circuit board that connects the computer’s components.'],
      ['Power supply', 'Hardware that converts incoming electricity for the computer’s components.'],
      ['Operating system', 'Software that manages hardware, memory, other software, and the user interface.'],
      ['Application software', 'Software that performs a task for the user.']
    ],
    ican: [
      { id: 'cc.clinic.ipos', text: 'I can trace input, processing, storage, and output in a computer system.' },
      { id: 'cc.training.components', text: 'I can explain how the CPU, RAM, storage, motherboard, and power supply contribute to a task.' },
      { id: 'cc.training.software-layers', text: 'I can distinguish application software, an operating system, and utility software.' }
    ],
    checkYourself: [
      'Why can unsaved work disappear when power is lost?',
      'What is the difference between RAM and long-term storage?',
      'Why does an application need the operating system?'
    ],
    notPractised: [
      'Opening, installing, upgrading, or repairing components inside a computer.',
      'Tracing real electrical signals or measuring CPU, RAM, or storage performance.',
      'Installing operating systems, drivers, applications, or utilities.',
      'The parts sort and booking trace are practised as reasoning tasks; the network simulation does not model what happens inside a computer.'
    ]
  },
  {
    stationId: 'station.devices',
    title: 'Choose a computer for the job',
    lessonRef: 'Course 3.3A Types of computers — Comparing computer types and trade-offs',
    status: 'practised',
    summary: 'A suitable computer type fits the task, users, location, and trade-offs rather than simply being the most powerful.',
    sections: [
      {
        heading: 'Built for one job or many',
        paragraphs: [
          'An embedded computer is built into another product to perform a focused job. A personal computer, such as a desktop, laptop, tablet, or smartphone, supports many applications for one person at a time. These categories can overlap, so the device’s role matters more than its shape alone.'
        ]
      },
      {
        heading: 'Servers provide services',
        paragraphs: [
          'A server provides files, web pages, printing, databases, or other services to client devices over a network. It may serve many users without anyone sitting directly at it. Central service can make control and backup easier, but it also creates a dependency that needs power, cooling, security, and support.'
        ]
      },
      {
        heading: 'Choose by trade-offs',
        paragraphs: [
          'A desktop can offer strong performance, repairability, and value but stays in one place. A laptop or tablet supports movement but brings limits such as battery life, smaller screens, theft risk, or harder repair. A defensible choice names the job, a useful benefit, and a meaningful cost or risk.'
        ]
      }
    ],
    terms: [
      ['Embedded computer', 'A computer built into another product to perform a focused task.'],
      ['Personal computer', 'A general-purpose computer mainly used by one person at a time.'],
      ['Desktop computer', 'A personal computer designed to remain at a workstation.'],
      ['Mobile device', 'A portable computer designed for use in different locations.'],
      ['Server', 'A computer that provides a service to client devices over a network.'],
      ['Trade-off', 'A choice in which gaining one benefit involves a cost, limit, or risk.']
    ],
    ican: [
      { id: 'cc.clinic.device-fit', text: 'I can choose a suitable computer type and explain a trade-off.' },
      { id: 'cc.clinic.stakeholders', text: 'I can explain who benefits from a device choice, what barrier it creates, and when my recommendation would change.' }
    ],
    checkYourself: [
      'What makes an embedded computer different from a personal computer?',
      'Why might a server need specialist support?',
      'What trade-off could make a tablet better or worse than a desktop?'
    ],
    notPractised: [
      'Selecting, buying, benchmarking, or repairing real computer hardware.',
      'Operating an embedded system, wearable, mainframe, or data centre.',
      'Testing battery life, processing power, durability, or total cost.',
      'In the bench drill, the game checks real ports and power; whether a desktop or server is the better host is judged by job fit, not measured.'
    ]
  },
  {
    stationId: 'station.speed',
    title: 'Explain network capacity and organisation',
    lessonRef: 'Course 3.4 Networks — Network types, sharing models, bandwidth, and compression',
    status: 'explained',
    summary: 'Network experience depends on capacity, delay, choke points, and how services are organised, not on one vague idea of speed.',
    sections: [
      {
        heading: 'Bandwidth is not speed',
        paragraphs: [
          'Bandwidth is the maximum amount of data a connection can carry in a given time. Speed describes how quickly data actually travels or a task finishes. If total demand exceeds available bandwidth, data waits. A choke point is a shared link or device where limited capacity can delay many users.'
        ]
      },
      {
        heading: 'Compression changes demand',
        paragraphs: [
          'Compression reduces file size, so a transfer can need less bandwidth. Lossless compression allows the original to be rebuilt exactly. Lossy compression permanently removes some detail to make a file smaller. That can help a stream fit, but it trades quality for lower data demand.'
        ]
      },
      {
        heading: 'Scope and service organisation',
        paragraphs: [
          'A LAN covers a limited place such as a building. A WAN links networks across much larger areas. In client–server organisation, clients request data or services from a central server. In peer-to-peer organisation, devices share directly as equals. Central control can simplify access and backup, while also creating a point of dependence.'
        ]
      }
    ],
    terms: [
      ['Bandwidth', 'The maximum amount of data a connection can transfer in a given time.'],
      ['Speed', 'How quickly data actually moves or a network task completes.'],
      ['Choke point', 'A shared part of a route whose limits can delay traffic.'],
      ['Compression', 'Reducing the size of data so it needs less storage or bandwidth.'],
      ['LAN', 'A local area network covering a limited place such as a building.'],
      ['WAN', 'A wide area network spanning large geographic areas.'],
      ['Client–server', 'An arrangement where clients request services or data from a central server.'],
      ['Peer-to-peer', 'An arrangement where equal devices share data or resources directly.']
    ],
    ican: [
      { id: 'cc.training.network-performance', text: 'I can distinguish bandwidth from speed and explain how a choke point affects users.' },
      { id: 'cc.training.compression', text: 'I can compare lossy and lossless compression and explain a trade-off.' },
      { id: 'cc.training.network-organisation', text: 'I can compare LAN and WAN scope and client–server and peer-to-peer organisation.' }
    ],
    checkYourself: [
      'Why can high bandwidth still feel slow?',
      'What does lossy compression give up to reduce data size?',
      'What is one benefit and one risk of a central server?'
    ],
    notPractised: [
      'Measuring or changing bandwidth, transfer speed, latency, or compression.',
      'Building or testing a WAN, internet route, or peer-to-peer network.',
      'Simulating congestion, packet capacity, or real service quality.'
    ]
  },
  {
    stationId: 'station.security',
    title: 'Use layers of protection',
    lessonRef: 'Course 3.4 Networks — Keeping a network secure and attack and defend',
    status: 'explained',
    summary: 'Security uses several controls because each one addresses particular risks and no single defence stops every attack.',
    sections: [
      {
        heading: 'Identity and permission differ',
        paragraphs: [
          'Authentication checks who a user is. Multi-factor authentication asks for independent kinds of proof, such as a password plus a device or biometric. Access rights decide what an identified user may do. The game tests role-based allow and deny rules for two synthetic services, but it does not authenticate real people or run MFA.'
        ]
      },
      {
        heading: 'Protect traffic and data',
        paragraphs: [
          'A firewall checks network traffic against rules and blocks disallowed connections. A proxy stands between users and another network and can filter requests or hide internal addresses. Encryption uses a key to make data unreadable to someone without that key, whether data is stored or travelling.'
        ]
      },
      {
        heading: 'No perfect defence',
        paragraphs: [
          'A firewall cannot stop every harmful choice, and a password can be stolen. Layered controls reduce different risks, but they need updates, careful rules, trained users, and recovery plans. A control can also fail or block legitimate work, so security includes testing both required access and intended restrictions.',
          'Traffic often passes through shared choke points such as an organisation’s gateway, provider, or proxy. Their operators may measure, filter, or log traffic. Encryption can hide content in transit, but intermediaries may still learn connection details. This creates a privacy question as well as a security decision.'
        ]
      }
    ],
    terms: [
      ['Authentication', 'Checking that a user or system is who it claims to be.'],
      ['Multi-factor authentication', 'Using two or more independent kinds of proof to log in.'],
      ['Access rights', 'Rules describing which resources or actions a user is allowed to use.'],
      ['Firewall', 'Hardware or software that inspects traffic and applies allow or block rules.'],
      ['Proxy server', 'A system that acts as an intermediary between users and another network.'],
      ['Encryption', 'Using a key to transform data so it is unreadable without the matching key.'],
      ['Choke point', 'A shared place in a route where traffic may be observed, filtered, or limited.']
    ],
    ican: [
      { id: 'cc.clinic.access', text: 'I can test necessary access while restricting unnecessary access.' },
      { id: 'cc.training.security-layers', text: 'I can explain how authentication, MFA, access rights, firewalls, proxies, and encryption address different risks.' },
      { id: 'cc.training.security-limits', text: 'I can explain why no single defence is perfect and identify a privacy concern at a network choke point.' }
    ],
    checkYourself: [
      'How are authentication and access rights different?',
      'Why can a firewall not stop every attack?',
      'What might an intermediary learn even when content is encrypted?'
    ],
    notPractised: [
      'Authentication, MFA, firewall, proxy, or encryption configuration.',
      'Real identity checks, attack simulation, malware defence, or legal compliance.',
      'Inspecting, logging, or encrypting real network traffic.'
    ]
  }
];
