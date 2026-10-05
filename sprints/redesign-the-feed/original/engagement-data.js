"use strict";

// Student-facing additions only. Assessed questions, task IDs and lesson IDs remain in index.html.
window.SPRINT03_EXPERIENCE = {
  studentOsUrl: "https://script.google.com/a/macros/gnspes.ca/s/AKfycby3lAqgW184t9EnOZg2XHDh6C8jYGZUBFpXeLICFZnAu0Yrkab3hcw6QFboHR7FWVTo/exec",
  simulation: {
    lesson: "d03",
    name: "Tune the Feed",
    sourceName: "S3 · Feed ranking lab (IBDS Sprint 3: Data, algorithms and recommendation)",
    status: "Ready. It works offline and collects no data.",
    href: "sim/tune-the-feed.html",
    directions: "Open this only after completing the hand calculation. It must use the separate Snapcast dataset from AI_STUDIO_PROMPTS.md.",
    returnQuestion: "What moved when you changed the goal, and which term in the score caused that movement?"
  },
  hook: {
    lesson: "d10",
    title: "You are the feed designer",
    prompt: "A new creator and a familiar creator earn the same score. You have ten seconds: who should appear first?",
    options: ["The familiar creator", "The new creator", "Use a transparent tie rule"],
    followUp: "Name the value hidden inside your choice: engagement, discovery, fairness, predictability or something else."
  },
  videos: [
    {
      lesson: "d10",
      title: "How algorithms manipulate you (and how to fight back)",
      channel: "TED · Jen Golbeck and Shalini Kantayya",
      url: "https://www.ted.com/talks/jen_golbeck_and_shalini_kantayya_how_algorithms_manipulate_you_and_how_to_fight_back",
      length: "9:38",
      watch: "0:00–3:42 (3:42)",
      captions: "TED transcript and captions available",
      questions: ["When does a recommendation feel useful rather than manipulative?", "Who controls the data used to personalize?", "What human decision should not be delegated?"],
      after: "Connect one claim from the clip to an input, objective or rule in the Loopline model."
    },
    {
      lesson: "d04",
      title: "Beware online ‘filter bubbles’",
      channel: "TED · Eli Pariser",
      url: "https://www.ted.com/talks/eli_pariser_beware_online_filter_bubbles",
      length: "9:05",
      watch: "0:45–4:05 (3:20)",
      captions: "TED transcript and captions available",
      questions: ["What did the platform remove without asking?", "What data might have driven that choice?", "Who gains control when filtering is invisible?"],
      after: "Draw one reinforcing loop from a click to a narrower future feed."
    },
    {
      lesson: "d07",
      title: "The era of blind faith in big data must end",
      channel: "TED · Cathy O’Neil",
      url: "https://www.ted.com/talks/cathy_o_neil_the_era_of_blind_faith_in_big_data_must_end",
      length: "13:11",
      watch: "0:35–4:10 (3:35)",
      captions: "TED transcript and captions available",
      questions: ["What two ingredients does O’Neil say an algorithm needs?", "Who defines success?", "Why can a formula carry an opinion?"],
      after: "Apply the claim ‘success is chosen’ to Setting E and Setting D."
    },
    {
      lesson: "d09",
      title: "Are we cooked? How social media shapes your language",
      channel: "TED · Adam Aleksic",
      url: "https://www.ted.com/talks/adam_aleksic_are_we_cooked_how_social_media_shapes_your_language",
      length: "13:55",
      watch: "6:35–9:03 (2:28)",
      captions: "TED transcript and captions available",
      questions: ["How do creators respond to ranking signals?", "What turns a niche label into metadata?", "Who benefits when identity becomes a targeting category?"],
      after: "Use mechanism → stakeholder → consequence to explain one language change."
    }
  ],
  discussion: {
    lesson: "d07",
    mode: "debate",
    respondFirst: true,
    title: "Should discovery be a required feed goal?",
    stimulus: {label: "European Commission preliminary finding on TikTok’s addictive design (6 February 2026)", url: "https://digital-strategy.ec.europa.eu/en/news/commission-preliminarily-finds-tiktoks-addictive-design-breach-digital-services-act"},
    prompt: "Platforms should be required to give discovery and user control equal weight with engagement.",
    positions: ["Agree: the public interest justifies a design rule", "Disagree: users and platforms should choose", "Conditional: require transparency and testing, not a fixed weight"],
    reply: "Reply to a classmate by identifying one stakeholder their position protects and one consequence it may miss."
  },
  choice: {
    lesson: "d08",
    title: "Choose a transfer context",
    note: "This short rehearsal is unscored and does not replace the independent transfer task below.",
    contexts: ["School library discovery feed", "Local news recommendation feed", "Music discovery feed"],
    prompt: "For your chosen context, name one signal you would reduce, one you would add, and the stakeholder each change is meant to help."
  },
  selfChecks: {
    d03: [
      {q: "Which variable represents completion rate?", options: ["c", "m", "f"], answer: 0, why: "c is average watch time divided by clip length."},
      {q: "What happens when length is zero or negative?", options: ["Use 0.50", "Exclude the row", "Rank it last"], answer: 1, why: "An invalid length makes completion rate undefined, so the model excludes it."},
      {q: "After scores tie, what is checked first?", options: ["Freshness", "Completion rate", "Creator country"], answer: 1, why: "The stated tie rule compares completion before item ID."}
    ],
    d05: [
      {q: "What does amplification change first?", options: ["Visibility", "Truth", "Legality"], answer: 0, why: "Ranking changes what is seen; it does not prove truth or legality."},
      {q: "A reinforcing loop does what?", options: ["Cancels change", "Strengthens an initial advantage", "Removes all bias"], answer: 1, why: "More exposure creates more data, which can produce still more exposure."},
      {q: "Which is evidence about a mechanism?", options: ["The feed is bad", "Top three receive ten times more views", "Everyone dislikes it"], answer: 1, why: "It names an observable operation rather than a broad judgment."}
    ],
    d07: [
      {q: "A provider source is strongest for…", options: ["How it says its system works", "Independent proof of all effects", "A final legal judgment"], answer: 0, why: "Provider documents are useful for design claims but need triangulation."},
      {q: "A preliminary regulatory finding is…", options: ["A final court ruling", "An evidence-based but unfinished finding", "A platform advertisement"], answer: 1, why: "Its status must remain visible when you use it."},
      {q: "Triangulation means…", options: ["Using three quotations", "Comparing sources with different access and purposes", "Choosing the newest source only"], answer: 1, why: "Different source positions can reveal agreements, gaps and conflicts."}
    ],
    d09: [
      {q: "A strong defence begins with…", options: ["A clear claim", "A long quotation", "A list of terms"], answer: 0, why: "The listener needs to know the decision being defended."},
      {q: "Which chain shows analysis?", options: ["feature → colour → opinion", "mechanism → stakeholder → consequence", "source → date → title"], answer: 1, why: "It connects system operation to human effects."},
      {q: "A changed input is useful because it tests…", options: ["Memorization", "Transfer", "Handwriting"], answer: 1, why: "Transfer shows whether a method survives a new case."}
    ]
  },
  supports: {
    start: {
      today: "Preview the sprint question, locate the assessed moments, and set one personal target before Lesson 1.",
      glossary: [["objective", "The result a system is designed to optimize."], ["recommender", "A system that predicts and orders items for a user."], ["evidence", "Information used to support a claim, with source and limits."], ["transfer", "Using a learned method in a changed context."]],
      summary: "This sprint moves from calculating a synthetic ranking to judging its effects. You will trace data, compare two objectives, test a feedback loop, triangulate sources, redesign a rule and defend the result.",
      checklist: ["I know which work is practice, collected or assessed.", "I can find the success criteria.", "I have a way to save or download my answers."],
      worked: {title: "Different case: library discovery", text: "A library orders books using recent loans and topic match. A student first calculates the order, then asks whether the objective favours already-popular titles. That sequence—mechanism before judgment—is the sprint pattern."},
      frames: ["The sprint question asks who benefits when…", "The evidence I will need is…", "My next target is…"],
      stretch: ["What evidence would show that discovery improved without reducing relevance?", "Which result should remain a teacher judgment rather than an automatic score?"]
    },
    d10: {
      today: "Retrieve the score terms, then trace search, sorting and filtering before completing the scheduled fresh attempt.",
      glossary: [["search", "Find rows that match a stated condition."], ["sort", "Arrange rows using a chosen key and direction."], ["filter", "Keep only rows that satisfy a rule."], ["trace", "Record each step of a process so another person can verify it."]],
      summary: "Search identifies matches, sorting changes order, and filtering removes rows. A precise trace names the field, comparison and result instead of saying that the computer ‘just organized it.’",
      checklist: ["I wrote the rule before changing the data.", "My sort direction is stated.", "I can show which rows were removed and why.", "I completed the fresh attempt without recipe help."],
      worked: {title: "Different case: school library", text: "Search for topic = climate. Sort the matches by publication year, newest first. Filter to reading level 10 or below. The final list is reproducible because each operation and field is named."},
      frames: ["I searched the ___ field for…", "I sorted ___ from ___ to ___, so…", "The filter removed ___ because…"],
      stretch: ["How could missing values change the final list?", "When would filtering before sorting be more efficient, and would it change the result?"]
    },
    d03: {
      today: "Calculate completion and indicator values, rank every valid item under both settings, then explain one movement.",
      glossary: [["feature", "A measurable input used by a model."], ["weight", "A multiplier showing how strongly a feature affects the score."], ["normalization", "Making equivalent data use a consistent form."], ["tie rule", "A declared method for ordering equal scores."]],
      summary: "The same items move when weights change because a score encodes a goal. Normalization and missing-data rules also affect who appears. Calculation makes those choices visible enough to challenge.",
      checklist: ["I checked length before dividing.", "I normalized topic text.", "I applied the correct weights.", "I used the tie rule.", "I explained one mover with numbers."],
      worked: {title: "Different case: podcast discovery", text: "Episode P4 has c=.70, m=0, f=1, n=1. Under a3 b2 d1 e0 its score is 3(.70)+2(0)+1(1)+0(1)=3.10. Under discovery a3 b1 d1 e2 it becomes 5.10. The two-point rise comes from the new-creator weight."},
      frames: ["Under Setting ___, item ___ scores…", "It moves from ___ to ___ because the weight on ___ changes…", "The stakeholder helped or harmed is…"],
      stretch: ["Design a tie rule that protects predictability without always favouring older items.", "Which input could be gamed most easily, and how?"]
    },
    d04: {
      today: "Run the five-day loop, identify lock-in, then connect the mechanism to data scale and platform labour.",
      glossary: [["feedback loop", "A cycle in which an output becomes a future input."], ["lock-in", "An early advantage that becomes difficult to dislodge."], ["proxy", "A measurable stand-in for something harder to observe."], ["platform labour", "Paid or unpaid human work that enables a digital platform."]],
      summary: "Exposure creates interaction data, interaction data changes later scores, and the new ranking directs exposure again. At scale, that cycle can narrow opportunity while relying on visible and hidden human labour.",
      checklist: ["I recorded the top three each day.", "I identified the returning input.", "I named one creator who never receives data.", "I connected scale to a human consequence."],
      worked: {title: "Different case: cafeteria recommender", text: "Popular meals are shown first. More students click them, giving those meals more data, so the next ranking again places them first. A new cultural dish receives too little exposure to collect reliable preference data."},
      frames: ["The output ___ returns as the input…", "This reinforces ___ because…", "At scale, the consequence for ___ is…"],
      stretch: ["Where could a balancing loop interrupt lock-in?", "Whose labour is missing when a system is described as automatic?"]
    },
    d05: {
      today: "Complete the closed-note quiz, correct errors, then write a mechanism-based amplification paragraph.",
      glossary: [["amplification", "Increasing the reach or visibility of selected content."], ["retrieval", "Bringing learned information to mind without looking it up."], ["correction", "Explaining why an answer failed and replacing the reasoning."], ["claim", "A conclusion that evidence and reasoning must support."]],
      summary: "Retrieval reveals what vocabulary and mechanisms are available without support. The follow-up paragraph must show how a ranking operation changes visibility and produces a consequence for a named stakeholder.",
      checklist: ["I attempted every quiz item independently.", "I corrected the reasoning, not only the letter.", "My paragraph names a mechanism.", "My consequence is linked to a stakeholder."],
      worked: {title: "Different case: school announcements", text: "If the portal ranks by prior clicks, sports notices may receive more visibility. That exposure produces still more clicks, while a new cultural club struggles to reach students. The mechanism is ranking by accumulated interaction, not simply ‘bias.’"},
      frames: ["The system amplifies ___ by…", "This changes visibility because…", "For ___, the likely consequence is…"],
      stretch: ["What evidence would distinguish amplification from ordinary popularity?", "How should a system treat urgent but historically low-click information?"]
    },
    d06: {
      today: "Follow money through the platform, then connect revenue, cultural visibility and unequal access.",
      glossary: [["monetization", "Turning attention, data or activity into revenue."], ["revenue share", "The portion of income paid to a participant."], ["access", "A person's practical ability to use or benefit from a system."], ["incentive", "A reward or pressure that makes one action more likely."]],
      summary: "A ranking objective is tied to a business model. Visibility can affect income and cultural reach, while devices, connectivity and platform rules shape who can participate at all.",
      checklist: ["I identified who pays.", "I identified who receives value.", "I connected ranking to a revenue pathway.", "I named an access condition."],
      worked: {title: "Different case: independent game store", text: "A store ranks games by expected purchase value. Large publishers can fund promotions that generate clicks, which improve rank and sales. Small local developers may gain discovery only if the system reserves space for new or diverse titles."},
      frames: ["The platform earns revenue when…", "Ranking affects the creator by…", "Access is unequal because…"],
      stretch: ["Can a discovery goal still serve a profit goal? Explain a plausible design.", "Which metric could reveal cultural concentration?"]
    },
    d07: {
      today: "Compare a provider explanation with regulator evidence, preserve each source's status, and synthesize rather than list.",
      glossary: [["provider", "The organization that designs or operates the service."], ["regulator", "A public body that investigates or enforces rules."], ["triangulation", "Comparing sources with different access, purposes or methods."], ["provisional", "Supported so far but not yet final."]],
      summary: "Provider and regulator sources answer different questions. Strong synthesis identifies agreement, conflict and missing evidence while keeping dates, purposes and legal status visible.",
      checklist: ["I stated each source's role.", "I preserved preliminary versus final status.", "I found one agreement and one tension.", "My conclusion is narrower than the evidence."],
      worked: {title: "Different case: transit app audit", text: "The provider says arrival predictions use live vehicle locations. A city audit finds that rural routes update less often. Together, the sources support a mechanism claim and a limitation; neither alone proves every rider's experience."},
      frames: ["The provider claims…", "The regulator finds…", "Together, these sources suggest…, although…"],
      stretch: ["What evidence could neither source reasonably provide?", "How would a final ruling change the wording of your conclusion?"]
    },
    d08: {
      today: "Practise redesigning a rule, then complete the unseen transfer independently under the stated conditions.",
      glossary: [["redesign", "A deliberate change to a system rule or interface."], ["trade-off", "A gain in one goal that may reduce another."], ["constraint", "A limit the solution must respect."], ["independent evidence", "Work completed without support that would reveal the solution."]],
      summary: "A useful redesign changes a mechanism, predicts who gains and loses, and names evidence that would test the result. The unseen task checks whether that reasoning transfers to a fresh case.",
      checklist: ["My change is specific enough to implement.", "I named a trade-off.", "I proposed a measure of success.", "I kept the assessed attempt independent."],
      worked: {title: "Different case: library discovery", text: "Replace ‘most borrowed first’ with 70% relevance and 30% underexposed titles. Test whether students still find relevant books while the share of first-time authors in the top ten rises. The trade-off is possible short-term relevance loss."},
      frames: ["Change the rule from ___ to…", "This helps ___ because…", "It may reduce ___, so I would measure…"],
      stretch: ["Design a test that cannot be passed merely by increasing clicks.", "When should a user be allowed to override the default objective?"]
    },
    d09: {
      today: "Defend one rule aloud, respond to a changed input, and trace the network and data path behind the platform.",
      glossary: [["defence", "A reasoned justification that responds to challenge."], ["counterclaim", "A plausible challenge to the main claim."], ["network path", "The sequence of devices and organizations carrying data."], ["resilience", "The ability to continue or recover when part of a system fails."]],
      summary: "The defence combines a clear rule, mechanism evidence, stakeholder consequences and a trade-off. The changed input tests transfer; the network path shows that platform outcomes also depend on infrastructure.",
      checklist: ["I stated the rule in one sentence.", "I used a calculated or source-based detail.", "I addressed a counterclaim.", "I explained the changed input.", "I traced more than one system layer."],
      worked: {title: "Different case: weather alert priority", text: "Prioritize verified emergency alerts over predicted engagement. Evidence: delivery time and reach during drills. Counterclaim: false alarms reduce trust. Response: require signed sources and publish correction rates rather than returning to click-based rank."},
      frames: ["My rule is…", "The mechanism evidence is…", "A reasonable counterclaim is…, but…", "When the input changes…, therefore…"],
      stretch: ["Which failure in the network path would look like a ranking failure to a user?", "What evidence would make you revise your defended rule?"]
    },
    reflect: {
      today: "Name what you can now do independently, what support helped, and the exact next attempt that will show improvement.",
      glossary: [["reflection", "Using evidence from work to decide what to do next."], ["independence", "Selecting and applying a method without solution-revealing help."], ["revision", "A new attempt that acts on feedback."], ["target", "A specific, observable next action."]],
      summary: "A useful reflection cites evidence, separates support from achievement, and names a next action that can be observed in a later attempt.",
      checklist: ["I cited a specific lesson or response.", "I named support separately from achievement.", "My target begins with an action.", "I know what evidence will show progress."],
      worked: {title: "Different case: photo app learner", text: "Evidence: I traced all three exposure settings correctly, but my explanation omitted the stakeholder. Support: the mechanism frame helped. Next action: use mechanism → stakeholder → consequence in the next unseen case without opening the frame."},
      frames: ["I can now… as shown by…", "The support that helped was…", "On my next attempt I will…, and the evidence will be…"],
      stretch: ["Which support are you ready to fade, and how will you test that decision?", "What would transfer look like in a case outside social media?"]
    }
  }
};
