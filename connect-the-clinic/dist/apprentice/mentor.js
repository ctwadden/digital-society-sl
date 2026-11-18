/**
 * Original mentor and staff dialogue for the Lantern Line apprenticeship.
 * Pure functions of the derived engine view: Mags only reacts to what the model recorded.
 * Support fades by visit: alongside → supported → the apprentice leads.
 */
const ROLE_NAME={'role.reception':'desk computer','role.records':'service host','infra.switch':'switch','infra.ap':'access point','role.nurse':'Ana’s tablet'};
const dev=(view,roleId)=>view.devices.find(d=>d.roleId===roleId)||null;
const unmet=view=>view.checks.find(c=>!c.met)||null;

export const MENTOR={name:'Mags',role:'Senior field technician, Lantern Line'};

const MISTAKES={
  POWER_IN_WRONG_SOCKET:'That’s a power cord — three flat pins. It only goes in the power inlet, the one with the little notch at the top.',
  PHONE_CORD_IN_RJ45:'Close, but look at the plug: that’s a phone cord, RJ11. It’s narrower than an Ethernet RJ45 and it rattles in that port — no link. Grab a patch cable.',
  PHONE_CORD_WRONG_SOCKET:'That’s a phone cord. Nothing on this job uses one — leave it in the bag.',
  DISPLAY_NOT_NETWORK:'HDMI carries the picture to the screen. It’s already doing that job. Network traffic travels on Ethernet — the square port with the clip notch.',
  HDMI_WRONG_SOCKET:'That’s a display cable. It won’t fit there, and it wouldn’t carry network service if it did.',
  USB_NOT_NETWORK:'USB is for keyboards, drives, that sort of thing. It won’t join this computer to the switch.',
  USB_WRONG_SOCKET:'USB plug, wrong socket. And remember: USB isn’t our network link today.',
  ETHERNET_IN_WRONG_SOCKET:'Right cable, wrong hole. An Ethernet plug only seats in an RJ45 port — listen for the click.',
  CABLE_TO_RADIO:'That’s the wireless radio — no cable goes there. Wi-Fi joins by association, not by plugging in.',
  PORT_ALREADY_USED:'That port’s taken. Pick a free one — the switch doesn’t care which number, as long as it’s free.',
  SAME_DEVICE_BOTH_ENDS:'Both ends on the same box goes nowhere. The other end belongs on a different device — usually the switch.'
};

const TEST_LINES={
  SERVICE_AVAILABLE:'There it is — the service answered, and the route lit up. That’s proof, not a guess.',
  PORT_DISCONNECTED:'The tester couldn’t find a complete cable path. Walk the route: which link in the chain is missing?',
  DEVICE_OFF:'Something on the route has no power. Check the power lights before anything clever.',
  SWITCH_OFF:'Everything goes through the switch, and the switch is dark. Power first.',
  ADDRESS_WRONG_SUBNET:'The cable path is fine. The address isn’t from this network — compare it with the network card.',
  ADDRESS_DUPLICATE:'Two devices answering to one address. Every device needs its own. Check what’s already taken.',
  ADDRESS_RESERVED:'That number is the network’s own address or its broadcast address — neither is for a device.',
  ADDRESS_INVALID:'That address or mask isn’t valid. Four numbers, each 0 to 255.',
  ADDRESS_OFF_LINK:'The masks disagree about who’s on the local network. Use the mask on the network card.',
  WIFI_NOT_ASSOCIATED:'The tablet hasn’t joined the access point yet. Association is the tablet’s choice.',
  AP_OFF:'The tablet picked the access point, but the access point has no power.',
  SERVICE_UNAVAILABLE:'We reached the host, but its service isn’t running.',
  ACCESS_DENIED:'The network works — the permission rules said no. Is that what the clinic wants for this person?',
  CAPABILITY_MISSING:'This device can’t do the job it’s been given. Think about what the person needs it for.',
  DEVICE_MISSING:'There’s nothing installed for that job yet.',
  OUTSIDE_COVERAGE:'The tablet is outside the access point’s coverage.'
};

function nextStep(view,level){
  const c=unmet(view);if(!c)return view.visit.finished?'All done here.':'Everything checks out. When you’re happy, sign the job sheet.';
  const v=view.visit.id;
  const tips={
    'install.role.reception':['Theo needs a computer at the desk.','Click the empty desk spot and pick a computer from the van. Think: he sits there all day — does it need to move?','Choose the desktop: it has an Ethernet port and suits a fixed desk. Then plug a power cord into its power inlet.'],
    'install.infra.switch':['Everything needs somewhere to meet.','Install the switch in the equipment closet and give it power.','Click the closet shelf, choose a switch, then hold a power cord and plug its power inlet.'],
    'install.role.records':['Bookings live on the service host.','Put the service host on the closet rack and power it.','Click the rack spot, choose the server, and plug in its power cord.'],
    'cable.desk':['The desk computer is on an island.','Run Ethernet from the desk computer to the switch.','Hold a patch cable, plug the desk computer’s RJ45 port, then any free switch port.'],
    'cable.host':['Bookings still can’t reach the desk.','The service host needs its own cable to the switch.','Patch cable: service host RJ45 → a free switch port.'],
    'test.desk':['Don’t tell Theo it works — show him.','Use the service tester from the desk computer.','Choose “Test from desk” in the tester. Read the result and the route it lights.'],
    'inspect.desk':['Before you change anything, look.','Inspect the desk computer and compare its settings with the network card on the closet door.','Use the inspection light on the desk computer. Read its address and mask, then the card.'],
    'address.apply':['That address came from another office.','Pick an address in this clinic’s network that nobody is using, and apply it with the card’s mask.','The card says 10.12.1.0/24. With a /24 mask, the first three numbers must match: 10.12.1.something. Avoid .0, .255, and addresses already taken.'],
    'address.mask':['Check the mask too.','The mask on the card is 255.255.255.0.','Set the mask to 255.255.255.0 exactly.'],
    'wifi.ap':['Ana’s tablet needs something to talk to.','The access point needs power and an Ethernet uplink to the switch.','Power cord into the access point, then a patch cable from its RJ45 port to a free switch port.'],
    'wifi.join':['The access point is ready; the tablet isn’t on it.','Join Ana’s tablet to the access point.','Open the tablet’s settings and choose the clinic access point.'],
    'test.roomA':['Ana moves between rooms. Test where she works.','Test the tablet in exam room A.','In the tester, choose “Test from tablet” while Ana is in room A.'],
    'test.roomB':['One room isn’t both rooms.','Ask Ana to step into room B and test there too.','Move the tablet to exam room B, then test again.'],
    'fault.observed':['What do you actually know yet?','Pick a test or an inspection that tells you where it breaks.','Try a tablet test, or put the light on the access point.'],
    'fault.repaired':['You know where it breaks.','Fix the physical cause, then retest through it.','The access point’s uplink is missing. Patch it to the switch and test the tablet.'],
    'access.decision':['Ms. Ruiz asked for “everything open.”','Who needs bookings? Who needs the clinical workspace? Who needs neither?','Open the access rules and choose one that keeps Theo booking and the clinical workspace restricted.'],
    'access.tested':['Rules on paper aren’t rules in practice.','Run the access checks after your last change.','Choose “Check access” in the tester.'],
    'explain':['Tell me what you did.','Write what was wrong, what you changed, and who it helps or restricts.','Two or three sentences in the job sheet. Or mark it to explain aloud to your teacher.']
  };
  const t=tips[c.id]||[c.label,c.detail,c.detail];
  return v==='visit.3'&&level<2?t[0]:t[Math.min(2,level)];
}

function why(view){
  const v=view.visit?.id;
  if(v==='visit.1')return 'A switch is the meeting point: every wired device plugs into it, and it passes traffic between them. The desk computer asks the service host for bookings; that request needs power at both ends and a complete Ethernet path through the switch.';
  if(v==='visit.2')return 'An IP address is how devices find each other on a network. The network card tells you the range: 10.12.1.0 with mask 255.255.255.0 means 10.12.1.1 to 10.12.1.254 are usable, and each device needs a different one. Wi-Fi is just the last hop — the access point still needs its cable to the switch.';
  if(v==='visit.3')return 'Work from evidence. A test tells you where the route breaks; changing settings at random just moves the problem. Then, access: give each person what their job needs and no more.';
  return 'We bring what we need, use it on purpose, and prove the result before we leave.';
}

const TOPICS={
  cables:'Ethernet patch cable: square RJ45 plug with a clip — network traffic. Power cord: three flat pins — power only. HDMI: wide flat plug — picture to a screen. USB: thin rectangle — keyboards and drives. Phone cord: RJ11, narrower than RJ45 — not for our network.',
  address:'Read the network card: network 10.12.1.0, mask 255.255.255.0 (/24). With this /24 mask, the first three numbers stay 10.12.1 and you pick the last one: 1–254, not one already in use. That shortcut only works because the mask is /24 — another mask changes the rule. In my notebook I use 192.168.5.0/24 as an example: 192.168.5.42 would be fine there, but not here.',
  wireless:'Three separate things: the access point needs power, it needs an Ethernet uplink to the switch, and the tablet must associate (join) with it. Then test where the person actually works — room A isn’t room B.',
  access:'Access is a decision about people, not cables. Reception books appointments. The nurse uses the clinical workspace. Visitors and outsiders get neither. “Open to everyone” is easy, and it means anyone at the front desk can browse clinical notes.'
};

/** The single current line Mags says, chosen from the latest recorded result. */
export function mentorLine(view){
  if(view.at==='yard')return yardLine(view);
  if(!view.visit)return {mood:'neutral',text:'Ready when you are.'};
  const v=view.visit,level=v.support==='alongside'?2:v.support==='supported'?1:0,r=view.lastResult;
  const asks=view.support.length;
  if(v.finished)return {mood:'pleased',text:finishLine(view)};
  if(!r)return {mood:'explaining',text:arrival(view)};
  if(r.kind==='ask'){
    if(r.code==='next'){const depth=Math.min(2,level+Math.max(0,view.support.filter(s=>s.topic==='next').length-1));return {mood:'explaining',text:nextStep(view,depth)};}
    if(r.code==='show'){const c=unmet(view);return {mood:'explaining',text:c?`Here — I’ve marked it. ${nextStep(view,1)} You do the hands-on part.`:'Nothing left to point at. Have a look at the job sheet.'};}
    if(r.code==='why')return {mood:'explaining',text:why(view)};
    return {mood:'explaining',text:TOPICS[r.code]||why(view)};
  }
  if(r.kind==='mistake'){
    const text=MISTAKES[r.code]||'That won’t do it.';
    return {mood:'concerned',text:level===0?(r.code==='PORT_ALREADY_USED'||r.code==='SAME_DEVICE_BOTH_ENDS'?text:'Hm. Look at that plug and that socket again.'):text};
  }
  if(r.kind==='test'){
    const t=view.latestTest;const base=TEST_LINES[r.code]||t?.message||'Read the result.';
    if(r.pass){
      if(v.id==='visit.1')return {mood:'pleased',text:`${base} Look at Theo.`};
      if(r.testId==='nurse'&&t)return {mood:'pleased',text:`Tablet works in ${t.locationId==='location.exam-b'?'room B':'room A'}. ${unmet(view)?.id==='test.roomB'?'Now the other room.':''}`.trim()};
      return {mood:'pleased',text:level===0?'Good. Keep going.':base};
    }
    if(level===0)return {mood:'thinking',text:r.code==='PORT_DISCONNECTED'&&v.id==='visit.3'?'So — where does the route stop? What would you check first?':'What does that result tell you?'};
    if(v.id==='visit.3'&&r.code==='PORT_DISCONNECTED'&&view.addressChange)return {mood:'concerned',text:'You changed the tablet’s address, and the tester still says the cable path is incomplete. The address was never the problem.'};
    return {mood:'thinking',text:level===1&&asks===0?`${base} Want a hint? Just ask.`:base};
  }
  if(r.kind==='inspection'){
    const d=view.devices.find(x=>x.id===r.deviceId);if(!d)return {mood:'neutral',text:'Nothing there to inspect.'};
    if(d.roleId==='infra.ap'&&view.fault.uplinkMissing)return {mood:level===0?'thinking':'pleased',text:level===0?'What did you notice about its ports?':'Look at that: the access point’s Ethernet port is empty. Wi-Fi has nowhere to go.'};
    if(d.roleId==='role.reception'&&v.id==='visit.2')return {mood:'explaining',text:`Address ${d.address}, mask ${d.mask}. Now the card says ${view.network.cidr}. Do they match?`};
    if(d.roleId==='role.nurse')return {mood:'explaining',text:level===0?'Noted.':`Tablet address ${d.address}. ${d.address.startsWith(view.network.base+'.')?'That fits the card.':'That doesn’t fit the card.'}`};
    return {mood:'neutral',text:level===0?'Noted.':`${d.label}: power ${d.powered?'on':'off'}, ${d.ports.filter(p=>p.cableId).length} cable${d.ports.filter(p=>p.cableId).length===1?'':'s'} connected.`};
  }
  if(r.kind==='cable-end')return {mood:'neutral',text:level===2?'One end in. Now the other end — usually the switch.':'One end in.'};
  if(r.kind==='hold')return {mood:'neutral',text:level===2?holdLine(r.code):'Okay.'};
  if(r.kind==='explain')return {mood:'pleased',text:'Saved as you wrote it. Your teacher reads that, not me.'};
  if(r.kind==='change'){
    if(r.code==='CHOOSE_DEVICE'){
      const desk=dev(view,'role.reception');
      if(desk&&desk.kind==='laptop'&&unmet(view)?.id?.startsWith('install'))return {mood:'concerned',text:'A laptop at a fixed desk? Look at its ports — no Ethernet socket. Theo doesn’t walk around with it. I’d swap it for the desktop.'};
      return {mood:'neutral',text:level===2?'Good. Now it needs power — hold a power cord and find its power inlet.':'Installed.'};
    }
    if(r.code==='POWER_DEVICE'||r.code==='ALREADY_POWERED')return {mood:'neutral',text:level===2?'Power light’s on. Power isn’t a network, though — it still needs Ethernet.':'Powered.'};
    if(r.code==='CONNECT_PORTS')return {mood:'neutral',text:level===2?'Cable’s in, link light on. A light isn’t proof the service works — test it.':level===1?'Cable in. Test when you’re ready.':'…'};
    if(r.code==='SET_STATIC_ADDRESS'){const c=view.addressChange;return {mood:'thinking',text:level===0?'Okay.':`Set to ${c?.to}. Your earlier test is out of date now — test again.`};}
    if(r.code==='ASSOCIATE_WIFI')return {mood:'neutral',text:level===0?'Okay.':'Tablet joined the access point. Joined isn’t the same as working — test it.'};
    if(r.code==='MOVE_NURSE')return {mood:'neutral',text:'Ana’s moved rooms.'};
    if(r.code==='SET_PERMISSIONS')return {mood:'thinking',text:view.policies.find(p=>p.id===view.policy.id)?.acceptable?'That fits how they work. Prove it with the access checks.':'Hmm. Think about who that lets in. Run the access checks and see.'};
    return {mood:'neutral',text:'Changed.'};
  }
  if(r.kind==='finish')return {mood:'pleased',text:finishLine(view)};
  return {mood:'neutral',text:''};
}

function holdLine(type){
  return {ethernet:'Patch cable. RJ45 — square, clip on top. Network traffic.',power:'Power cord. Into a power inlet only.',hdmi:'That’s HDMI, for screens. Sure that’s what you need?',usb:'USB. For peripherals. Hmm.',phone:'Phone cord. Look closely at that plug.'}[type]||'Okay.';
}

function arrival(view){
  const id=view.visit.id;
  if(id==='visit.1')return 'Here we are. Theo opens the front desk in an hour and his bookings screen is dead — nothing’s installed. You do the hands-on work; I’ll be right here. Start with the desk.';
  if(id==='visit.2')return 'Two jobs today. Theo’s new desk computer still has its old office’s address, and Ana needs her tablet working in both exam rooms. I’ll help when you ask — and I’ll speak up if you get stuck.';
  return 'Your job today. I’m just the driver. Ana’s tablet can’t reach the workspace, and Ms. Ruiz wants a word about access. Find out before you fix.';
}

function finishLine(view){
  const id=view.visit.id;
  if(id==='visit.1')return 'That’s Theo booking his first patient of the day — because of a cable you ran and a test you read. Good first day.';
  if(id==='visit.2')return 'Desk on the right network, tablet working in both rooms. You read the card instead of guessing. That’s the habit.';
  return 'You found it, fixed it, proved it, and you said no to “just leave it open” for a good reason. I didn’t have to say much today.';
}

function yardLine(view){
  if(view.truckClaimed)return {mood:'pleased',text:'Van 7’s yours. I’ll still pick up the phone if you call.'};
  if(view.truckEarned)return {mood:'pleased',text:'Three visits, all your own work. Come round the side of the shed — there’s something with your unit number on it.'};
  const done=view.completedVisitIds.length;
  if(!view.packed.length&&!done)return {mood:'explaining',text:'Morning. I’m Mags. You’re riding with me this week. First job: pack the tool bag. Take what we need — not everything on the shelf.'};
  const last=view.yardLog.at(-1);
  if(last&&!view.bagReady){
    const item=view.items.find(i=>i.id===last.itemId);
    if(last.type==='PACK_ITEM'&&item&&!item.essential)return {mood:'thinking',text:`${item.label}? ${item.use} Bring it if you like, but it won’t fix a network.`};
    if(last.type==='PACK_ITEM'&&item)return {mood:'neutral',text:`${item.label}. ${item.use}`};
  }
  if(view.bagReady&&done===0)return {mood:'pleased',text:'That’s a proper bag. In the van — Harbour Street Clinic.'};
  if(done===1)return {mood:'pleased',text:'Back for day two. Same clinic, new problems. I’ll step back a little.'};
  if(done===2)return {mood:'neutral',text:'Day three. You lead; I drive.'};
  return {mood:'neutral',text:'Ready when you are.'};
}

/** What the clinic staff visibly say, derived from the model-backed staff state. */
export function staffLines(view){
  const lines=[];
  if(!view.visit)return lines;
  const s=view.staff;
  if(s.reception==='working')lines.push({person:'reception',name:'Theo',mood:'pleased',text:view.visit.id==='visit.1'?'Bookings are up! I can see the nine o’clock.':'Booking screen’s all good.'});
  else if(s.reception==='waiting')lines.push({person:'reception',name:'Theo',mood:'worried',text:view.visit.id==='visit.2'?'It says “cannot reach server.” Same as yesterday’s old office setup.':'Still the spinning clock…'});
  if(s.nurse.state==='working')lines.push({person:'nurse',name:'Ana',mood:'pleased',text:`Workspace open in ${s.nurse.locationId==='location.exam-b'?'room B':'room A'}. I can update the room checklist.`});
  else if(s.nurse.state==='waiting')lines.push({person:'nurse',name:'Ana',mood:'worried',text:'My tablet shows Wi-Fi, but the workspace won’t load.'});
  else if(s.nurse.state==='denied')lines.push({person:'nurse',name:'Ana',mood:'worried',text:'It says I’m not allowed to open the workspace?'});
  if(s.manager==='present'){
    const ok=view.policies.find(p=>p.id===view.policy.id)?.acceptable;
    lines.push({person:'manager',name:'Ms. Ruiz',mood:ok?'pleased':'neutral',text:ok?'Theo books, Ana sees the clinical side. Fine — as long as nobody’s locked out of their own job.':'Can’t you just leave it all open? Then nobody gets locked out.'});
  }
  return lines;
}

export {ROLE_NAME};
