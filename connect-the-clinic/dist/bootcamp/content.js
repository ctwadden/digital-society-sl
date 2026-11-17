/** Original teaching copy for the integrated training bench.
 * This module supplies narration and instructions, never completion logic.
 * Software IDs below are internal references, not official curriculum codes.
 */

const kitLesson = {
  id: 'boot.kit',
  title: 'Meet the three parts of a local service',
  shortTitle: 'Choose & power',
  icon: 'kit',
  goals: [
    'I can distinguish a workstation, a switch and a service host.',
    'I can choose and power the equipment for a small local network.'
  ],
  purpose: 'Know what each part contributes before connecting it.',
  mentorIntro: 'The workstation requests a service. The host provides it. The switch joins wired devices on this local network. Let’s get those three parts onto the bench.',
  firstAction: 'Choose the desktop for the bench workstation, then turn it on.',
  demonstration: {
    intro: 'I will choose and power each part. Notice its job as it appears.',
    steps: [
      {id:'kit.client',title:'A workstation for the person doing the work',text:'I choose a desktop workstation and turn it on. This is the client: it will request the shared service.',notice:'A powered screen does not prove that the shared service is reachable.'},
      {id:'kit.switch',title:'A switch to join the wired devices',text:'I add and power a network switch. Its Ethernet ports give the workstation and host places to connect.',notice:'We will use separate switch ports for the two cables in the next lesson.'},
      {id:'kit.host',title:'A host to provide the shared service',text:'I choose and power a small server. Here it provides the bench’s shared service. Serving requests is a role a computer can perform.',notice:'The kit is ready for connections. It is not yet a working end-to-end route.'}
    ],
    closing: 'Choose your own supplied kit. Both switch sizes work here; the service-host choices also include a desktop configured for that role.'
  },
  practice: {
    brief: 'Prepare the three powered parts. Everything on this training bench is supplied free.',
    steps: [
      {id:'kit.select',title:'Choose the parts',text:'Use the equipment choices for Bench workstation, Network switch and Service host. Choose a suitable option for each role.'},
      {id:'kit.power',title:'Turn each one on',text:'Select each chosen device and use its power control. Check the displayed power state.'},
      {id:'kit.check',title:'Check the setup',text:'Read the task checks. When all three chosen devices are powered, continue to the connection lesson.'}
    ],
    checkPrompt: 'Which part requests the service, which provides it, and which joins the wired devices?'
  },
  hints: [
    {tier:1,title:'Start with the jobs',text:'Find the three roles in the equipment choices. Each role needs a device.'},
    {tier:2,title:'Choose, then power',text:'After selecting equipment, open each device’s control. A device can be on the bench but still switched off.'},
    {tier:3,title:'Complete the powered kit',text:'Use the desktop workstation, either supplied switch, and a suitable service host. Turn all three on. No cable or address change is needed for this first task.'}
  ],
  reference: [
    {id:'kit.client',title:'Workstation / client',text:'The person uses the workstation to request a service. “Client” describes that requesting role; it does not mean every client must be a desktop.'},
    {id:'kit.switch',title:'Network switch',text:'The switch joins the wired devices on this local network. It needs power and actual connected ports. The larger switch provides more ports; this small bench does not require them.'},
    {id:'kit.host',title:'Service host / server',text:'A host provides the shared service. The worked example uses a small server, but this model also permits a desktop configured as the service host. This exercise does not compare processor speed or server capacity.'},
    {id:'kit.power',title:'Power versus a working service',text:'Power is one prerequisite. A complete route, suitable address settings, a running service and the right permission may still be needed. We will learn and test those separately.'}
  ]
};

const cablesLesson = {
  id: 'boot.cables',
  title: 'Build and test a wired path',
  shortTitle: 'Connect & test',
  icon: 'cable',
  goals: [
    'I can connect compatible Ethernet ports through a switch.',
    'I can run a service test and use its result to check my setup.'
  ],
  purpose: 'Turn a collection of powered devices into a usable physical route.',
  mentorIntro: 'The workstation’s request needs a route to the host. Use one cable from the workstation to the switch and another from the host to a different free switch port.',
  firstAction: 'Open the cable controls and select the workstation’s Ethernet port as one end.',
  demonstration: {
    intro: 'Watch the two links appear, then watch what the service test actually records.',
    steps: [
      {id:'cables.client',title:'Connect the workstation to the switch',text:'I select the workstation’s Ethernet port and a free switch port, then connect them.',notice:'That is one link. The host still needs its own connection.'},
      {id:'cables.host',title:'Connect the host to another switch port',text:'I connect the host’s Ethernet port to a different free port on the same switch.',notice:'Follow the complete route: workstation → switch → service host.'},
      {id:'cables.test',title:'Run the workstation service test',text:'Now I test the service and read the result. The recorded route comes from the test, not just from drawing two lines.',notice:'The bench supplies suitable address and access settings for this lesson.'}
    ],
    closing: 'Your bench starts with the powered kit and no cables. Choose any two different free switch ports.'
  },
  practice: {
    brief: 'Connect the workstation and service host through the switch, then prove the local service works.',
    steps: [
      {id:'cables.ends',title:'Choose both ends',text:'In the cable controls, select a device and its Ethernet port for each end. Connect the workstation to a free switch port.'},
      {id:'cables.host',title:'Complete the route',text:'Connect the service host to another free switch port. A port already in use cannot take a second cable.'},
      {id:'cables.test',title:'Record a test',text:'Run Workstation service. Read the result and highlighted route. If it fails, inspect the part named in the diagnostic and retest after a change.'}
    ],
    checkPrompt: 'If only the workstation-to-switch cable were present, where would its request stop?'
  },
  hints: [
    {tier:1,title:'Trace the whole journey',text:'Start at the workstation and follow a route all the way to the host. Is there a gap?'},
    {tier:2,title:'Check each cable end',text:'Each cable needs two compatible Ethernet ports. The workstation and host must use different free ports on the switch.'},
    {tier:3,title:'Connect, then prove it',text:'Make workstation-to-switch and host-to-switch links using the cable controls. Check power, then run Workstation service. Continue only after your fresh test passes.'}
  ],
  reference: [
    {id:'cables.controls',title:'How do I connect without dragging?',text:'Open the cable controls. Choose the first device and Ethernet port, then the second device and a free compatible port. Use the connect button. Repeat for the other cable.'},
    {id:'cables.port',title:'What is a port here?',text:'Here “port” means a physical Ethernet socket on the equipment. A software service also uses port numbers in real networking, but that different meaning is outside this bench.'},
    {id:'cables.test',title:'What does the test tell me?',text:'A service test checks this model’s current requirements and records a result. Read the reason, not just the pass/fail symbol. A physical link alone does not prove that addresses, services and access are also suitable.'},
    {id:'cables.fresh',title:'Why does an old result become stale?',text:'A later configuration change can alter the result. A stale observation records what happened earlier; run another test to check the current setup.'}
  ]
};

const addressLesson = {
  id: 'boot.address',
  title: 'Give the workstation a usable address',
  shortTitle: 'IP address & mask',
  icon: 'address',
  goals: [
    'I can use the supplied subnet mask to compare local addresses.',
    'I can apply a valid, unused address and test the service again.'
  ],
  purpose: 'A working cable is one requirement. The workstation also needs suitable address settings.',
  mentorIntro: 'The physical path is ready. Open the workstation and compare its address with the network card before changing anything.',
  firstAction: 'Open the workstation inspector and read the network card.',
  demonstration: {
    intro: 'Watch how I use the card to find a suitable address. Your practice bench will use a different network.',
    steps: [
      { id: 'address.inspect', title: 'Read the address and mask', text: 'The demo card says 192.168.60.0/24. The server is 192.168.60.10, but this workstation has 192.168.61.20. With the supplied mask, those are different subnets.', notice: 'The mask is 255.255.255.0. The /24 means the first 24 bits identify the network.' },
      { id: 'address.apply', title: 'Apply a suitable unused address', text: 'I use 192.168.60.20 and the supplied mask. The workstation and server now share the network part, while their host values differ.', notice: 'This is one usable choice. Copying the server’s .10 address would create a duplicate.' },
      { id: 'address.test', title: 'Test after applying the change', text: 'I run the workstation service test and read its result. Editing a field is only a draft until Apply is used; applying settings still needs a test.', notice: 'A passing demonstration belongs to Jo. Your practice evidence begins on a fresh bench.' }
    ],
    closing: 'Your turn uses 192.168.80.0/24. Use its card and the addresses already in use; do not copy my full address.'
  },
  practice: {
    brief: 'Restore the workstation’s local service on this new network. Choose any valid unused host address that fits the card.',
    steps: [
      { id: 'address.read', title: 'Inspect', text: 'Select the workstation. Read its current IP address, subnet mask, network card and used-address list.' },
      { id: 'address.edit', title: 'Apply', text: 'Enter an unused address in the card’s subnet, keep the supplied mask, then use Apply address & mask.' },
      { id: 'address.verify', title: 'Test', text: 'Run the workstation service test. Read the reason if it fails; change only what that result supports, then retest.' }
    ],
    checkPrompt: 'Which part of your chosen address matches the server because of this mask, and which part must differ?'
  },
  hints: [
    { tier: 1, title: 'Notice the boundary', text: 'Read the card’s network and mask. Compare the workstation with the server under that mask.' },
    { tier: 2, title: 'Keep local and unique', text: 'For this /24, compare the first three number groups. Choose a host value not used by another device in this subnet.' },
    { tier: 3, title: 'Apply, then verify', text: 'On this practice card, use an unused 192.168.80.x host from .1 through .254, not the server’s .10 or another used address. Apply it with 255.255.255.0, then run the service test.' }
  ],
  reference: [
    { id: 'address.where', title: 'Where do I change it?', text: 'Select the workstation on the bench or from the device list. In its inspector, find IP settings. Read the network card and used addresses, type the address and mask, choose Apply address & mask, then run the workstation service test.' },
    { id: 'address.meaning', title: 'What is an IPv4 address?', text: 'It identifies an interface on an IP network. Here each workstation or server has one modelled address. Dotted-decimal notation uses four number groups from 0 to 255, such as the demonstration’s 192.168.60.20.' },
    { id: 'address.mask', title: 'What does /24 mean?', text: 'The mask separates network bits from host bits. /24 means 24 network bits: 255.255.255.0 is 11111111.11111111.11111111.00000000 in binary. For this mask, the first three groups form the network part and the last group distinguishes hosts. Other masks can split the address differently.' },
    { id: 'address.usable', title: 'Which values can I use here?', text: 'On these /24 benches, .0 names the subnet and .255 is its broadcast address. Choose an unused value from .1 through .254. Check the whole used-address list; a valid format alone does not prevent a duplicate.' },
    { id: 'address.plan', title: 'Why follow the supplied mask?', text: 'This task asks you to follow the /24 address plan as well as pass a service test. Some different masks can still let particular local devices communicate; that does not mean you have applied the requested plan. Check the mask and the test result separately.' },
    { id: 'address.router', title: 'Where would a router fit?', text: 'A router forwards traffic between different IP networks. This bench uses one local subnet and does not model routing or a default gateway. Changing the mask or adding a router icon is not a substitute for the stated task.' }
  ]
};

const wirelessLesson = {
  id: 'boot.wireless',
  title: 'Finish the wireless path',
  shortTitle: 'Connect Wi-Fi',
  icon: 'wireless',
  goals: [
    'I can connect a mobile device through a powered access point and wired uplink.',
    'I can test the shared service from both practice rooms.'
  ],
  purpose: 'Give a moving member of staff a complete path to the shared service.',
  mentorIntro: 'The mobile device uses Wi-Fi to reach an access point. The access point still needs power and a cable into the wired network. Joining Wi-Fi is only part of the journey.',
  firstAction: 'Select the access point and check its power and Ethernet connection.',
  demonstration: {
    intro: 'Follow the mobile device’s route as I add the missing parts.',
    steps: [
      {id:'wireless.power',title:'Power the access point',text:'I select the access point and turn it on. It can now participate in this model’s wireless link.',notice:'Power alone does not provide a wired uplink or associate the mobile device.'},
      {id:'wireless.uplink',title:'Connect its Ethernet uplink',text:'I connect the access point’s Ethernet port to a free switch port.',notice:'The route continues from the switch to the already-connected host.'},
      {id:'wireless.join',title:'Associate the mobile device',text:'In the mobile device inspector, I choose this access point and apply the Wi-Fi choice.',notice:'Association names the access point the device joins. It is not an end-to-end service test.'},
      {id:'wireless.room-a',title:'Test from room A',text:'I run the mobile workspace test in room A and read the recorded result.',notice:'This observation belongs to room A. It does not show a visit to room B.'},
      {id:'wireless.room-b',title:'Move and test again',text:'I move the mobile device to room B, then run the workspace test there.',notice:'Both locations need their own observations. A later causal change requires fresh tests.'}
    ],
    closing: 'Now complete the path on your own fresh bench. Its address settings are supplied; inspect them if needed, but keep suitable settings.'
  },
  practice: {
    brief: 'Make the mobile workspace work in both practice rooms while keeping its full route connected.',
    steps: [
      {id:'wireless.infrastructure',title:'Prepare the access point',text:'Select the AP, turn it on, and connect its Ethernet port to a free switch port.'},
      {id:'wireless.associate',title:'Join from the mobile device',text:'Select the mobile device. Choose the AP in its Wi-Fi control and apply that choice.'},
      {id:'wireless.prove',title:'Visit and test both rooms',text:'Choose Room A and run Mobile workspace. Choose Room B and run it again. Read both recorded results.'}
    ],
    checkPrompt: 'If Wi-Fi says associated but the AP uplink is missing, which part of the service journey cannot happen?'
  },
  hints: [
    {tier:1,title:'Follow every part',text:'Trace mobile device → access point → switch → host. Check power as well as links.'},
    {tier:2,title:'Separate joining from reaching',text:'Inspect the AP’s uplink and the mobile device’s Wi-Fi association separately. A joined device still needs the rest of the route.'},
    {tier:3,title:'Build the route and visit both rooms',text:'Power the AP, cable it to an unused switch port, and associate the mobile device with that AP. Run Mobile workspace in room A and then room B.'}
  ],
  reference: [
    {id:'wireless.controls',title:'Where do I join Wi-Fi?',text:'Open the mobile device inspector. Find its access-point selector, choose the powered AP and apply the Wi-Fi choice. Then use a service test to check the whole path.'},
    {id:'wireless.ap',title:'Access point or router?',text:'This access point bridges the wireless device onto the local wired network. A router forwards between IP networks. The bench needs the AP’s bridge function and does not simulate routing.'},
    {id:'wireless.uplink',title:'What is an uplink?',text:'Here it is the Ethernet connection from the AP into the switch. The Wi-Fi link reaches the AP; the uplink carries the route onward into the wired network.'},
    {id:'wireless.coverage',title:'What do the room tests prove?',text:'They show service reachability under this model’s declared room-coverage rule. They do not measure real signal strength, interference, roaming performance or reliability in a building.'}
  ]
};

const accessLesson = {
  id: 'boot.access',
  title: 'Give people the access their work needs',
  shortTitle: 'Set permissions',
  icon: 'access',
  goals: [
    'I can distinguish a reachable service from permission to use it.',
    'I can test necessary staff access and an intended outsider denial.',
    'I can explain a workflow trade-off in an access decision.'
  ],
  purpose: 'Keep useful work possible while restricting access that a role does not need.',
  mentorIntro: 'The network now works. Who should be allowed to do what? Reception needs bookings; the mobile staff role needs its workspace. Whether mobile staff also handle bookings is a workflow choice.',
  firstAction: 'Read the role-policy choices and decide how bookings should be handled.',
  demonstration: {
    intro: 'Watch a permission decision and the tests that check its consequences.',
    steps: [
      {id:'access.inspect',title:'Read the work and current permissions',text:'I inspect the current role policy. A working network does not automatically authorize every role to use every service.',notice:'Keep the necessary staff tasks available and decide who needs booking responsibility.'},
      {id:'access.policy',title:'Make an explicit policy choice',text:'For this example, I keep separate responsibilities: reception handles bookings and mobile staff use the workspace.',notice:'Keeping an appropriate existing policy can be a deliberate decision. It does not require an unnecessary change.'},
      {id:'access.test',title:'Test useful access and intended restrictions',text:'I run staff and access tests. Required staff tasks should work; outsider requests should reach the permission check and be denied.',notice:'A missing cable is not evidence that the permission policy successfully blocked an outsider.'}
    ],
    closing: 'You may keep separate responsibilities or allow the mobile staff role to handle bookings too. Test the consequences of your choice.'
  },
  practice: {
    brief: 'Choose a responsible role policy and verify both the useful work and the intended restrictions.',
    steps: [
      {id:'access.choose',title:'Choose or keep a policy',text:'Select Separate responsibilities or Nurse also books according to the workflow you want. Read who gains a permission and who must hand work to someone else.'},
      {id:'access.test',title:'Run the required checks',text:'Test workstation bookings, mobile workspace, mobile bookings and the staff/outsider restrictions. Use the current test checklist to see which observations remain.'},
      {id:'access.interpret',title:'Read why a request was denied',text:'A denial can be intended for an outsider or for a role without booking responsibility. Required staff access must still work. After a policy change, rerun the tests.'}
    ],
    checkPrompt: 'Who benefits from your booking policy, and what handoff or extra responsibility does it create?'
  },
  hints: [
    {tier:1,title:'Start with the work',text:'Which tasks does each staff role need? What should an outsider be unable to do?'},
    {tier:2,title:'Compare the two responsible choices',text:'Separate responsibilities leaves booking changes with reception. Nurse also books adds that task to mobile staff. Open access and blocking everyone each fail a different need.'},
    {tier:3,title:'Choose and verify',text:'Explicitly keep or choose one responsible policy. Run the required staff tests and outsider checks after that choice. Look for intended ACCESS_DENIED results as well as necessary service passes.'}
  ],
  reference: [
    {id:'access.permission',title:'Authorization and authentication',text:'Authorization is what a role may do. Authentication checks an identity. This game supplies fictional roles and models authorization; it does not authenticate real users or teach password setup.'},
    {id:'access.denial',title:'When can a denial be the right result?',text:'When the role should not have that service and the test reaches the permission check. A disconnected or switched-off device is a technical failure, not proof of a well-chosen access policy.'},
    {id:'access.workflow',title:'Two reasonable booking workflows',text:'Separated responsibilities can require mobile staff to ask reception to arrange a follow-up. Allowing nurses to book reduces that handoff but adds a permission and responsibility. Explain which procedure fits the work.'},
    {id:'access.limits',title:'What remains outside this model?',text:'These role tests do not test encryption, malware, passwords, audit logging or legal compliance. A passing simulation does not certify a real clinic’s privacy or security.'}
  ]
};

const transferLesson = {
  id: 'boot.transfer',
  title: 'Find the cause before changing the setup',
  shortTitle: 'Diagnose a new fault',
  icon: 'diagnose',
  goals: [
    'I can use an observation to choose a relevant repair.',
    'I can retest and explain why the change addressed the observed cause.'
  ],
  purpose: 'Use the method you learned when the cause changes.',
  mentorIntro: 'This is a different setup. Start with what you can observe. Keep suitable settings, trace the route, make a relevant change and test again. I will not demonstrate a solution for this challenge.',
  firstAction: 'Run Mobile workspace or inspect the mobile device and its path before changing anything.',
  demonstration: null,
  practice: {
    brief: 'The mobile workspace is not working. Investigate this new bench and restore the service. Free hints remain available.',
    steps: [
      {id:'transfer.observe',title:'Observe',text:'Run a test or record an inspection. Read the actual finding and inspect the part it points to.'},
      {id:'transfer.compare',title:'Compare',text:'Check the physical route, power and settings against what this task needs. Do not assume the previous address lesson has the same cause.'},
      {id:'transfer.repair',title:'Repair and retest',text:'Make a change that addresses your finding. Run the relevant service test again and compare the result.'},
      {id:'transfer.explain',title:'Leave a short explanation',text:'Describe the observed cause, your repair and the test that checked it. Explain why changing only an IP address would not restore a missing physical path.'}
    ],
    checkPrompt: 'What observation justified your repair, and what did your fresh test show?'
  },
  hints: [
    {tier:1,title:'Use the new evidence',text:'What does this test say is missing? Read the network card and the connection states before repeating an earlier repair.'},
    {tier:2,title:'Trace beyond Wi-Fi',text:'A powered, associated mobile device still needs the route from the AP into the wired network. Inspect the AP’s Ethernet port.'},
    {tier:3,title:'Repair the physical route',text:'If the AP’s uplink is absent, connect its Ethernet port to a free switch port. Preserve suitable address settings, run Mobile workspace again, and explain the before-and-after result.'}
  ],
  reference: [
    {id:'transfer.method',title:'A useful troubleshooting routine',text:'Observe → compare with the task → make a relevant change → retest. Work from the reported cause. Keep a note of what changed so the result can be explained.'},
    {id:'transfer.layers',title:'Why not change everything?',text:'Several settings can affect a service. Changing many at once can hide which one mattered. A valid address cannot supply power, create a missing cable or grant a permission.'},
    {id:'transfer.retest',title:'What counts as checking the repair?',text:'Run a fresh service test after the relevant change. A green result from an earlier setup or the mentor demonstration does not verify this one.'}
  ],
  reflection: {
    title: 'Explain this repair',
    prompt: 'What did you observe, what did you change, and what did your retest show? Why would changing only an IP address not restore a missing physical connection?',
    placeholder: 'I observed… I changed… My fresh test showed… Changing only the IP would…',
    oralLabel: 'Discuss this repair with my teacher — review pending.',
    saveLabel: 'Save my explanation',
    reviewNote: 'Your exact words or oral-review request are recorded. The game checks that an explanation is available; your teacher judges its reasoning.'
  }
};

export const BOOT_LESSONS = [kitLesson,cablesLesson,addressLesson,wirelessLesson,accessLesson,transferLesson];
export const BOOT_MATERIALS = [
  {id:'boot.material.desktop',category:'computers',title:'Desktop workstation',kind:'desktop',assetKind:'desktop',cableType:null,
    purpose:'A computer suited to a fixed work position. It can act as a client that requests a shared service.',
    ports:'Ethernet for this bench network; real desktops also have model-specific power, USB and display connections.',
    connection:'Use its Ethernet port and an Ethernet patch cable to reach a free switch port.',
    useInThisMission:'The first lessons use a desktop as the Bench workstation. The field clinic also has a fixed reception desk.',
    commonMistake:'Assuming a powered screen means the shared service is reachable.'},
  {id:'boot.material.laptop',category:'computers',title:'Laptop computer',kind:'laptop',assetKind:'laptop',cableType:null,
    purpose:'A portable computer with a keyboard and screen, useful when someone moves and still needs to type.',
    ports:'This training laptop uses its Wi-Fi interface. Physical Ethernet ports or adapters depend on the actual laptop.',
    connection:'Power it, associate its Wi-Fi with the AP, and check the AP’s onward path.',
    useInThisMission:'The wireless lessons use a mobile staff laptop. In the clinic, keeping the existing laptop is one reasonable equipment choice.',
    commonMistake:'Assuming every laptop has a built-in Ethernet socket, or that Wi-Fi association proves the service works.'},
  {id:'boot.material.tablet',category:'computers',title:'Tablet computer',kind:'tablet',assetKind:'tablet',cableType:null,
    purpose:'A portable touchscreen computer. It offers a different carrying and input arrangement from a laptop.',
    ports:'The clinic model uses its Wi-Fi interface; it does not model every physical connector or accessory.',
    connection:'Join the AP through Wi-Fi and test the full route and access, just as for the laptop.',
    useInThisMission:'Review now; the independent clinic job offers a tablet as a lighter alternative with an extra equipment cost.',
    commonMistake:'Buying a replacement and assuming it has diagnosed or corrected the inherited network settings.'},
  {id:'boot.material.server',category:'computers',title:'Server / service host',kind:'server',assetKind:'server',cableType:null,
    purpose:'A computer configured to provide a shared service to clients.',
    ports:'The modelled host has an Ethernet interface for the LAN and a separate power state.',
    connection:'Power the host and connect its Ethernet port to the switch. The service must also be running.',
    useInThisMission:'Hosts the synthetic shared service. The kit task also accepts a desktop with this service-host capability.',
    commonMistake:'Treating “server” only as a particular box shape, or forgetting that the service can be unavailable even when the host has power.'},
  {id:'boot.material.switch',category:'network',title:'Network switch',kind:'switch4',assetKind:'switch4',cableType:null,
    purpose:'Joins the wired devices on this local network.',
    ports:'Several Ethernet sockets. Each cable uses one free socket; a port number labels a socket, not an IP address.',
    connection:'Power it. Connect each workstation, host or AP uplink to an available Ethernet port.',
    useInThisMission:'Joins the local service path. Either supplied switch size can serve the small kit task.',
    commonMistake:'Connecting only the workstation and leaving the service host outside the physical path.'},
  {id:'boot.material.ap',category:'network',title:'Wireless access point — AP',kind:'access-point',assetKind:'access-point',cableType:null,
    purpose:'Bridges the wireless client into this local wired network.',
    ports:'A wireless interface plus an Ethernet uplink in this model, with an explicit power state.',
    connection:'Turn it on, connect its Ethernet uplink to the switch, then associate the mobile client with it.',
    useInThisMission:'Lets the mobile staff device reach the host from the two declared practice or clinic rooms.',
    commonMistake:'Stopping after joining Wi-Fi. The AP still needs its onward wired path in this setup.'},
  {id:'boot.material.router',category:'network',title:'Router — concept preview',kind:'router',assetKind:null,cableType:null,
    purpose:'Forwards traffic between different IP networks.',
    ports:'Interfaces to the networks it joins; the exact equipment may use Ethernet or other media.',
    connection:'A real design configures its network interfaces and routes. Those actions are not simulated in this bootcamp.',
    useInThisMission:'Reference only. The bench and clinic task use one local subnet; no router or Internet connection is needed for the modelled local service.',
    commonMistake:'Treating a switch or AP as a router, or assuming a box labelled router automatically provides Internet access.'},
  {id:'boot.material.interface',category:'network',title:'Network interface and port',kind:'network-interface',assetKind:null,cableType:null,
    purpose:'The interface lets a device communicate using a network technology; a physical port is a socket on a wired interface.',
    ports:'The bench shows named Ethernet sockets and Wi-Fi interfaces. Wireless communication does not require an Ethernet plug on the client.',
    connection:'Match the cable to a compatible socket. Configure the relevant IP interface and test the resulting service.',
    useInThisMission:'The inspector shows actual available/occupied ports and address settings for the selected device.',
    commonMistake:'Confusing a numbered physical socket with an IP address, or with software service-port numbers.'},
  {id:'boot.material.ethernet',category:'cables',title:'Ethernet patch cable',kind:'ethernet-cable',assetKind:null,cableType:'ethernet',
    purpose:'Carries wired network data between compatible Ethernet interfaces. Copper patch cables commonly use twisted pairs, such as Cat 5e or Cat 6.',
    ports:'Clip-in Ethernet plugs, commonly called RJ45, at each end for the equipment shown here.',
    connection:'Choose an Ethernet port on each end and connect. Both ends and the rest of the route matter.',
    useInThisMission:'The cable used for workstation-to-switch, host-to-switch and AP-to-switch links. Cable categories, lengths and speeds are not simulated.',
    commonMistake:'Choosing a USB or display cable for an Ethernet socket, or connecting just one part of the route.'},
  {id:'boot.material.power',category:'cables',title:'Power lead or adapter',kind:'power-cable',assetKind:null,cableType:'power',
    purpose:'Supplies electrical power to compatible equipment.',
    ports:'The manufacturer-specified power inlet or supported charging connector; match the actual device.',
    connection:'In this simulation, use the device’s power control. It represents available power without modelling electrical wiring.',
    useInThisMission:'Power is a separate model state that can stop a device participating in the network.',
    commonMistake:'Assuming a data cable always supplies power. Some real systems support Power over Ethernet, but that is not modelled here.'},
  {id:'boot.material.usb',category:'cables',title:'USB cable and adapter',kind:'usb-cable',assetKind:null,cableType:'usb',
    purpose:'Connects compatible peripherals; some USB connections also provide power or other supported functions.',
    ports:'USB connector types vary. The connector shape alone does not establish every supported function.',
    connection:'Use a compatible device/port. A supported USB-to-Ethernet adapter can provide an Ethernet interface on a computer without one.',
    useInThisMission:'Reference only in this bootcamp. The network cable controls use Ethernet, and mobile lessons use Wi-Fi.',
    commonMistake:'Expecting an ordinary USB cable to plug into an Ethernet socket or behave as an Ethernet adapter.'},
  {id:'boot.material.display',category:'cables',title:'Display cable — HDMI or DisplayPort',kind:'display-cable',assetKind:null,cableType:'display',
    purpose:'Connects a compatible computer display output to a monitor or other display; supported links can also carry audio.',
    ports:'Matching HDMI or DisplayPort connections, or an appropriate supported adapter.',
    connection:'Match the computer output and display input. This is separate from the Ethernet path used in the bench.',
    useInThisMission:'Reference only. Display wiring and video settings are not simulated; the screen is already part of the device artwork.',
    commonMistake:'Assuming that a visible picture on the monitor proves the computer can reach a network service.'}
];

const lessonMaterials = {
  'boot.kit':['boot.material.desktop','boot.material.server','boot.material.switch','boot.material.power'],
  'boot.cables':['boot.material.interface','boot.material.ethernet','boot.material.power','boot.material.usb','boot.material.display'],
  'boot.address':['boot.material.interface','boot.material.router'],
  'boot.wireless':['boot.material.laptop','boot.material.tablet','boot.material.ap','boot.material.switch','boot.material.ethernet'],
  'boot.access':['boot.material.server'],
  'boot.transfer':['boot.material.ap','boot.material.ethernet','boot.material.interface']
};
for (const lesson of BOOT_LESSONS) lesson.materialIds = lessonMaterials[lesson.id];

export const BOOT_CONTENT = {
  version: '0.8.0',
  title: 'Field-ready bootcamp',
  mentor: {name:'Jo', role:'Training mentor'},
  welcome: {
    eyebrow: 'TRAIN HERE · APPLY IT IN THE FIELD',
    title: 'Before your first job, try it on the bench.',
    intro: 'I’m Jo. I’ll show you what the equipment does and how to set it up. Then you’ll try each task on a fresh bench.',
    promise: 'Mistakes, hints and retries are free. No timer is running. Your field job stays separate.',
    route: ['Watch a worked example','Try the setup yourself','Test and explain a changed fault','Take the clinic job'],
    firstAction: 'Start with the three parts of a local service.',
    startLabel: 'Start bootcamp',
    continueLabel: 'Continue training',
    reviewLabel: 'Review equipment & cables',
    reviewIntro: 'Look over the devices, connectors and cable jobs before you build. You can reopen this free guide throughout training.',
    estimatedTime: 'Plan roughly 35–45 minutes, with pauses or a second session if useful. This estimate has not been measured with students.'
  },
  lessonOrder: ['boot.kit','boot.cables','boot.address','boot.wireless','boot.access','boot.transfer'],
  lessons: BOOT_LESSONS,
  materials: BOOT_MATERIALS,
  materialCategories: [{id:'computers',title:'Computers & servers'},{id:'network',title:'Network hardware'},{id:'cables',title:'Cables & connections'}],
  materialsIntro: 'Identify what it does, what it connects to and whether it is used in this task. Real connector layouts vary; this bench shows only its declared capabilities.',
  networkBasics: [
    {id:'boot.network.lan',title:'LAN — local area network',text:'A LAN connects devices in a limited local area, such as these clinic rooms. A shared service can be inside that LAN; using it does not automatically require the Internet.'},
    {id:'boot.network.wlan',title:'WLAN — wireless local area network',text:'Wi-Fi lets the mobile client join the local network wirelessly through the AP. In this setup the AP has a wired uplink. Wi-Fi association and reaching a service are different checks.'},
    {id:'boot.network.internet',title:'The Internet is beyond this local task',text:'The Internet connects many networks. A local device may use a router/default gateway to reach other networks, but this bootcamp does not configure a gateway, DHCP, DNS or Internet access.'},
    {id:'boot.network.path',title:'Trace a complete path',text:'Wired: workstation → switch → service host. Wireless: mobile device → AP → switch → service host. Power, connections, address settings, running service and permission can each affect the result.'}
  ],
  labels: {
    demo: 'Watch Jo',
    nextDemo: 'Next demonstration step',
    practice: 'Try it yourself',
    retry: 'Start fresh practice',
    complete: 'Check & continue',
    guide: 'How-to guide',
    hint: 'Show a hint',
    field: 'Take the clinic job',
    returnField: 'Return to your field job',
    workstationTest: 'Workstation service',
    mobileTest: 'Mobile workspace',
    applyAddress: 'Apply address & mask',
    applyWifi: 'Apply Wi-Fi choice',
    powerOn: 'Turn on',
    powerOff: 'Turn off'
  },
  phaseCopy: {
    intro: 'First understand the task. Watch the worked example, or begin fresh practice if you are ready.',
    demo: 'Mentor demonstration · these actions are Jo’s, not your practice evidence.',
    practice: 'Your practice · the task checks use your current setup and recorded actions.',
    complete: 'Task conditions recorded · your teacher can review the reasoning and transfer.'
  },
  reference: [
    {id:'reference.path',title:'The service journey',text:'Wired: workstation → switch → host. Wireless: mobile device → access point → switch → host. Each relevant part needs suitable power, links, settings and permission.'},
    {id:'reference.test',title:'Read the reason',text:'A service result can identify a missing physical path, unsuitable address settings, an unavailable service or an intended/unsuitable permission decision. Use the actual result to select your next check.'},
    {id:'reference.help',title:'Help is safe to use here',text:'Every bootcamp guide, hint, demonstration, retry and inspection is free. In the independent job, optional guide consultations have disclosed fictional costs; ordinary tests, controls, accessibility and reading time remain free.'},
    {id:'reference.save',title:'Keep your progress',text:'Progress stays with this browser profile and site. Download progress before changing device or clearing browser data. Downloaded evidence is a teacher record; use the progress file to restore play.'}
  ],
  completion: {
    title: 'Your training record is ready.',
    message: 'You have met the six practical task conditions. Take the clinic job and apply the method to its own equipment, network card and client needs.',
    reminder: 'The clinic’s addresses and circumstances differ from the examples. Read, inspect, choose, test and explain.',
    evidenceNote: 'Training and field records remain separate. Task completion, hint use and game money do not award an IB grade or certify mastery.',
    actionLabel: 'Take the clinic job'
  },
  evidenceNote: 'Mentor steps, setup, learner actions and engine checks have different provenance. Your teacher reviews your explanation; no name, patient information or account is needed.',
  boundaries: [
    'This bootcamp models one local IPv4 subnet at a time, compatible Ethernet links, declared room coverage and fictional role permissions.',
    'It does not simulate routing, DHCP, DNS, Internet access, real Wi-Fi security, authentication or measured radio performance.',
    'The /24 examples teach use of a supplied mask. They do not establish general subnetting proficiency.',
    'Enter only fictional technical notes. Do not enter student names, patient information, passwords or real account details.',
    'A complete training record is an opportunity for teacher review, not a grade, certification or proof of independent field performance.'
  ],
  officialOutcomeIds: []
};
export const getBootLesson = id => BOOT_LESSONS.find(lesson => lesson.id === id) || null;
export default BOOT_CONTENT;
