/**
 * Original presentation copy for the first-play experience.
 * This module has no simulation, persistence, fee or completion authority.
 * Arrival is an upcoming-job preview, not an engine client message or acceptance.
 * Show the initial mentor briefing only at the untouched first practice station.
 * Feedback is optional narration after the UI has checked the current engine result.
 */
export const EXPERIENCE_COPY = {
  guided: {
    title: 'Your first connection',
    opening: 'Reception needs to reach the booking service on this server. I’ve prepared the equipment. You’ll make the missing connection.',
    goals: [
      'I can connect available network ports and test whether a service is reachable.',
      'I can explain why a connected cable and a working service are different claims.'
    ],
    connect: {title:'Choose the two cable ends',body:'Start at reception’s Ethernet socket. Choose a free socket on the switch for the other end. A cable uses one socket at each end.'},
    test: {title:'Will the booking request get through?',body:'A cable is connected. A test will check the whole path to the service, including the prepared address and permission. What do you expect it to find?'},
    experiment: {title:'Reception can reach the service',body:'Your test recorded a working route. Follow it on the scene. Next, try a safe experiment: remove a cable from that route and test again.'},
    unplug: {title:'Try the cable experiment',body:'You are about to unplug the cable named below. Predict what reception’s next test will show. Your earlier result will become out of date.'},
    disconnected: {title:'What changed when you unplugged it?',body:'The cable has been removed. Run the same booking test to find out whether a route still works.'},
    repair: {title:'Restore the missing connection',body:'The test found no complete physical path. Choose available ports to reconnect reception, then run a fresh test.'},
    retest: {title:'Check the repair',body:'You changed the setup. Run the booking test again before telling reception that the service is available.'},
    reflect: {title:'Explain what your tests showed',body:'Use the change and results you actually observed. Your teacher will review the explanation.'},
    complete: {title:'Your guided observations are recorded',body:'You connected, tested and investigated a change. The explanation is ready for teacher review; the independent bootcamp is still your own work.'},
    reflectionPrompt: 'What changed when the cable was removed? What did your next test show? Explain why connecting a cable and proving the service works are different claims.',
    alternatePath: 'The service still works through another route. Follow the actual test path and explain why removing that cable did not stop this request.',
    hints: [
      {title:'What are these devices?',text:'Reception’s desktop makes the request. The switch joins wired devices. The booking service runs on the server labelled Central records.'},
      {title:'How do I choose ports?',text:'Ethernet is the cable socket. A free port has no cable in it. Select one at reception and a different device’s free port, then choose Connect ports.'},
      {title:'What does the test prove?',text:'The result reports the current service request. A connected cable is only one requirement. Changing the setup makes an earlier test stale; run a fresh test.'}
    ]
  },
  arrival: {
    speaker: 'Ari',
    role: 'Riverbend Clinic coordinator',
    title: 'Your first call-out is coming',
    body: 'You’re joining the field team. Riverbend Clinic opens soon, and we’ll need your help connecting reception, the nurses and our shared services. First, meet Jo in the practice clinic.',
    actionLabel: 'Meet Jo'
  },
  mentor: {
    speaker: 'Jo',
    role: 'Field technician · free practice',
    title: 'Get reception connected',
    body: 'I’ve powered a server and a switch. Choose a computer for the reception desk, then build a path to the booking service. We’ll test it together. You can explore, retry and use the field guide for free here.',
    actionLabel: 'Choose a reception computer'
  },
  orientation: {
    practiceLabel: 'Training clinic · help is free',
    nextTaskLabel: 'Next task',
    notebookLabel: 'Field notebook',
    guideLabel: 'Field guide',
    firstTask: 'Choose a computer for reception.',
    controls: 'Select a device to inspect it. Use the Connect tool to choose two ports. No dragging is needed.'
  },
  feedback: {
    currentReceptionPass: 'Open the test result and follow the route your request took. What made this connection work?',
    failedProbe: 'That result gives you something to investigate. Read the reason, then choose one part of the system to check.',
    staleProbe: 'The setup has changed. Run the test again before relying on the earlier result.'
  },
  support: {
    practice: 'Explore, retry and use the field guide for free during training.',
    activeClient: 'Need help? Open the field guide to review the consultation quote before deciding.',
    goals: 'See what you’re practising and the evidence your teacher can review.',
    learnerReasoning: 'Write your own explanation, or use the available option to discuss it with your teacher.'
  }
};
