import { createAdvisorController } from './controller.mjs';

const store = createAdvisorController();
const get = (id) => document.getElementById(id);
const steps = { discover: 'Ask', compare: 'Compare', justify: 'Write quote', feedback: 'Debrief' };
const modes = { practice: 'Practice', independent: 'Independent' };
const attemptKinds = { first: 'First quote', revision: 'Revision', transfer: 'Changed brief' };
const specs = {
  cpu: 'Processor (CPU)', ram: 'Working memory (RAM)', storage: 'Storage',
  gpu: 'Graphics (GPU)', os: 'Operating system', display: 'Display',
  mobility: 'Mobility', ports: 'Ports',
};
const supports = {
  today: ['Today’s goal', 'See the focus for the current stage.'],
  glossary: ['Glossary', 'Review the part names and their jobs.'],
  summary: ['Client notes', 'Keep the replies you have heard in view.'],
  audio: ['Read aloud', 'Play the customer’s brief and revealed replies using an available on-device voice.'],
  checklist: ['Quote checklist', 'Check the pieces of your work before you send the quote to the fictional client.'],
  worked: ['Worked example', 'Review a practice quote and why it changes.'],
  frames: ['Sentence starters', 'Use a starting phrase to connect a spec to the client’s needs.'],
  stretch: ['Stretch question', 'Consider what could change your recommendation.'],
};
const textFields = new Set(['reason', 'tradeoff', 'prediction', 'transferReason']);
const responseLimit = 6000;
const coachUrl = 'https://gemini.google.com/gem/1ySXJPfNy0hCfESu8EzsD3vuexPiuKQKo?usp=sharing';
const money = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let currentView;
let dispatching;
let clientStock = '';
let recoveryTrigger;
let recoveryMode;
let pendingScene;
let scene;
let sceneError = '';
let sceneRetry = 0;
let scenePageClosed = false;
let sceneProductId = '';
let sceneProduct;
let sceneProductApplied;
let selectedPart = 'cpu';
let floorNotesClient;
let dismissNoticeOnEdit = false;

function el(tag, attributes, ...children) {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (name === 'class') element.className = value;
    else element.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children.flat(Infinity)) {
    if (child !== null && child !== undefined && child !== false) element.append(child);
  }
  return element;
}

function button(label, onClick, options = {}) {
  const { style = 'secondary', key, disabled, ...attributes } = options;
  const control = el('button', {
    type: 'button', class: `button ${style}`, 'data-focus-key': key, disabled, ...attributes,
  }, label);
  control.addEventListener('click', onClick);
  return control;
}

function act(action) {
  let result;
  dispatching = action;
  try {
    result = store.dispatch(action);
  } catch {
    result = { ok: false, message: 'The activity could not apply that change. You can still try downloading your work.' };
  } finally {
    dispatching = undefined;
  }
  if (!result.ok) showNotice('error', result.message || 'This change could not be applied.');
  return result;
}

function showNotice(kind, message) {
  const box = get('notices');
  if (box.dataset.kind === kind && box.textContent === message) return;
  box.dataset.kind = kind;
  box.replaceChildren(message ? el('p', { class: `notice ${kind}` }, message) : '');
}

function go(screen, target) {
  if (act({ type: 'SCREEN', screen }).ok && target) focusHeading(target);
}

function focusHeading(id) {
  const element = get(id === 'screen-title' ? `${currentView.screen}-title` : id);
  if (element && !element.closest('[hidden]')) element.focus();
}

function helpButton(label, onClick, key) {
  return button(label, onClick, { key, style: 'quiet' });
}

function setText(id, value) {
  const element = get(id);
  if (element.textContent !== value) element.textContent = value;
}

function heading(id, eyebrow, title, description) {
  return el('div', { class: 'page-heading' },
    el('p', { class: 'eyebrow' }, eyebrow),
    el('h1', { id, tabindex: '-1' }, title),
    description && el('p', { class: 'lede' }, description),
  );
}

function portrait(client, size = '') {
  const index = client.portraitIndex;
  const validCrop = Number.isInteger(index) && index >= 0 && index < 6;
  return el('div', {
    class: `portrait ${size}`, 'data-portrait': validCrop ? index : undefined, 'aria-hidden': 'true',
  });
}

function renderWelcome(view) {
  const resume = view.attempts.length > 0 || !!view.draft.productId || !!view.draft.reason;
  const roster = el('div', { class: 'cast' },
    view.clients.map((client) => el('figure', { class: 'cast-member' },
      portrait(client), el('figcaption', {}, el('strong', {}, client.name), el('span', {}, client.role)),
    )),
  );
  get('welcome-screen').replaceChildren(
    el('section', { class: 'welcome-hero' }, el('div', { class: 'wrap welcome-layout' },
      el('div', { class: 'welcome-copy' },
        el('p', { class: 'eyebrow' }, 'IB DIGITAL SOCIETY · STORE ROLE-PLAY'),
        el('h1', { id: 'welcome-title', tabindex: '-1' }, 'Your shift ', el('br'), 'starts here.'),
        el('p', { class: 'lede' }, 'You’re the computer adviser. Find out what each customer needs, put together a quote, and explain what they gain and give up.'),
        el('div', { class: 'actions' },
          button(resume ? 'Resume your shift' : 'Start practice', () => {
            if (resume) go('floor');
            else act({ type: 'START', mode: 'practice' });
          }, { style: 'primary', key: 'start-practice', disabled: view.save.readOnly && !resume }),
          button('Open training', () => go('learn'), { style: 'on-dark', key: 'open-training' }),
        ),
        button('Start independent work', () => act({ type: 'START', mode: 'independent' }), {
          style: 'text-on-dark', key: 'start-independent', disabled: view.save.readOnly,
        }),
      ),
      el('section', { class: 'cast-board', 'aria-label': 'Customers on today’s floor' },
        el('h2', {}, 'Today’s customers'), roster,
      ),
    )),
    el('section', { class: 'wrap mission' },
      el('div', {}, el('h2', {}, 'At the counter'), el('p', {}, 'Every customer has a different job for their computer.')),
      el('ol', {}, ['Ask about the work, the budget and the constraints.', 'Compare specifications and price the whole quote.', 'Explain the trade-off and revise when the brief changes.']
        .map((item) => el('li', {}, item))),
    ),
  );
}

function clientHeader(view) {
  const client = view.client;
  const independent = view.summary.independentClients;
  return el('article', { class: 'customer-counter' },
    portrait(client, 'counter-portrait'),
    el('div', { class: 'customer-copy' },
      el('div', { class: 'customer-meta' },
        el('span', { class: 'tag tag-yellow' }, modes[view.mode]),
        el('span', { class: 'tag' }, attemptKinds[view.attemptKind] || (client.changedBrief ? 'Changed brief' : 'First quote')),
      ),
      el('h1', { id: 'floor-title', tabindex: '-1' }, client.name),
      el('p', { class: 'customer-role' }, client.role),
      el('blockquote', {}, client.opening),
      client.changedBrief && el('p', { class: 'changed-brief' }, el('strong', {}, 'What changed'), client.changedBrief),
    ),
    el('p', { class: 'floor-count' }, el('strong', {}, `${independent} / ${view.summary.totalClients}`), 'Client shift cases'),
  );
}

function renderFloor(view) {
  const floor = get('floor-screen');
  if (!view.client) {
    floor.replaceChildren(heading('floor-title', 'The counter', 'Start your shift', 'Choose practice or independent work.'), modeControls(view));
    return;
  }
  if (floorNotesClient !== view.client.id) {
    floorNotesClient = view.client.id;
    clientStock = '';
  }
  const floorSection = {
    discover: renderDiscovery, compare: renderCompare, justify: renderJustify, feedback: renderDebrief,
  }[view.floorStep];
  floor.replaceChildren(...[
    el('div', { class: 'floor-toolbar' }, clientPicker(view), modeControls(view)),
    clientHeader(view),
    stepNav(view),
    inlineSupport(view),
    floorSection(view),
  ].filter(Boolean));
}

function clientPicker(view) {
  const select = el('select', { id: 'client-select', disabled: view.save.readOnly },
    view.clients.map((client) => el('option', { value: client.id, selected: client.id === view.client.id },
      client.completed ? `${client.name} · Quote saved` : client.name,
    )),
  );
  select.addEventListener('change', () => {
    if (act({ type: 'SELECT_CLIENT', clientId: select.value }).ok) focusHeading('screen-title');
    else select.value = view.client.id;
  });
  return el('div', { class: 'client-picker' }, el('label', { for: 'client-select' }, 'Customer'), select);
}

function modeControls(view) {
  return el('div', { class: 'mode-controls', role: 'group', 'aria-label': 'Shift mode' },
    Object.entries(modes).map(([mode, label]) => button(label, () => act({ type: 'START', mode }), {
      key: `mode-${mode}`, style: 'quiet', 'aria-pressed': String(view.mode === mode), disabled: view.save.readOnly,
    })),
  );
}

function stepNav(view) {
  return el('nav', { class: 'steps', 'aria-label': 'Quote stages' },
    el('ol', {}, Object.entries(steps).map(([step, label], i) => el('li', {},
      button(`${i + 1}. ${label}`, () => act({ type: 'STEP', step }), {
        key: `step-${step}`, 'aria-current': view.floorStep === step ? 'step' : undefined,
        disabled: (step === 'feedback' && !view.feedback) || view.save.readOnly,
      }),
    ))),
  );
}

function renderDiscovery(view) {
  return el('section', { class: 'stage split-stage', 'aria-labelledby': 'stage-title' },
    el('div', {},
      el('h2', { id: 'stage-title', tabindex: '-1' }, 'What do you want to ask?'),
      el('p', { class: 'muted' }, 'Choose questions that could change your advice. You can come back here as you compare.'),
      el('div', { class: 'interview' }, view.client.questions.map((question) =>
        el('div', { class: 'question' },
          question.asked
            ? el('div', { class: 'answered-question' },
              el('h3', { id: `asked-${question.id}`, tabindex: '-1' }, question.label),
              el('p', {}, question.answer),
            )
            : button(question.label, () => {
              if (act({ type: 'ASK', questionId: question.id }).ok) focusHeading(`asked-${question.id}`);
            }, { key: `ask-${question.id}`, disabled: view.save.readOnly, style: 'question-button' }),
        ),
      )),
      el('div', { class: 'actions' }, advance('Browse the shelf', 'compare', view)),
    ),
    customerNotes(view),
  );
}

function customerNotes(view) {
  const client = view.client;
  return el('aside', { class: 'notepad', 'aria-label': 'Customer notes' },
    el('h3', {}, 'Customer notes'),
    client.facts.length
      ? el('ul', {}, client.facts.map((fact) => el('li', {}, fact)))
      : el('p', {}, 'Your notes fill in as you ask questions.'),
    client.budgetLabel && el('p', { class: 'budget-line' }, client.budgetLabel),
    view.supports.audio && helpButton('Read the brief and replies aloud', () => speakBrief(view), 'read-brief'),
  );
}

function advance(label, step, view, style = 'primary') {
  return button(label, () => act({ type: 'STEP', step }), {
    key: `advance-${step}`, disabled: view.save.readOnly, style,
  });
}

function renderCompare(view) {
  const draft = view.draft;
  const known = view.products.some((product) => product.id === clientStock);
  if (!known) clientStock = draft.productId || view.products[0]?.id || '';
  const ids = new Set([draft.productId, draft.alternativeId, clientStock]);
  const compared = [...ids].map((id) => view.products.find((product) => product.id === id)).filter(Boolean);
  return el('section', { class: 'stage', 'aria-labelledby': 'stage-title' },
    el('div', { class: 'stage-intro' },
      el('div', {},
        el('h2', { id: 'stage-title', tabindex: '-1' }, 'Compare the shelf'),
        el('p', { class: 'muted' }, 'Fictional models · Simulated all-in prices in CAD'),
      ),
      helpButton('Open the parts workbench', () => go('learn', 'workbench-title'), 'parts-bench'),
    ),
    el('div', { class: 'split-stage shelf-layout' },
      el('div', { class: 'shelf-main' },
        el('div', { class: 'shelf', role: 'group', 'aria-label': 'Machines to inspect' },
          view.products.map((product) => button(
            [el('span', { class: 'shelf-kind' }, product.kind),
              el('strong', {}, product.name), el('span', { class: 'shelf-price' }, product.priceLabel)],
            () => { clientStock = product.id; render(currentView, 'inspect'); },
            { key: `inspect-${product.id}`, style: 'shelf-ticket', 'aria-pressed': String(clientStock === product.id) },
          )),
        ),
        el('div', { class: 'compare-choices' },
          productSelect(view, 'productId', 'Main recommendation'),
          productSelect(view, 'alternativeId', 'Backup recommendation'),
        ),
        compared.length > 0 && comparisonTable(compared, draft),
        el('div', { class: 'actions' },
          advance('Return to questions', 'discover', view, 'secondary'),
          advance('Write the quote', 'justify', view),
        ),
      ),
      el('div', { class: 'quote-stack' },
        quoteReceipt(view, true),
        customerNotes(view),
      ),
    ),
  );
}

function productSelect(view, field, label, identifier = field, options = {}) {
  const select = el('select', {
    id: identifier, disabled: options.disabled ?? view.save.readOnly, 'aria-describedby': options.describedBy,
  }, el('option', { value: '' }, options.placeholder || 'Choose a computer'),
  view.products.map((product) => el('option', {
    value: product.id, selected: (options.value ?? view.draft[field]) === product.id,
  }, `${product.name} · ${product.priceLabel}`)));
  select.addEventListener('change', () => {
    if (options.onChange) options.onChange(select.value);
    else if (!act({ type: 'DRAFT', field, value: select.value }).ok) select.value = view.draft[field];
  });
  return el('div', { class: 'field' }, el('label', { for: identifier }, label), select);
}

function comparisonTable(compared, draft) {
  return el('div', { class: 'table-wrap', tabindex: '0', role: 'region', 'aria-label': 'Computer specifications' },
    el('table', { class: 'comparison' },
      el('caption', {}, 'Computer specifications'),
      el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, 'Specification'), compared.map((product) =>
        el('th', { scope: 'col' }, el('strong', {}, product.name), el('small', {},
          product.id === draft.productId ? 'Main recommendation' : product.id === draft.alternativeId ? 'Backup' : 'Inspecting',
        )),
      ))),
      el('tbody', {},
        el('tr', {}, el('th', { scope: 'row' }, 'All-in price'), compared.map((product) => el('td', {}, product.priceLabel))),
        el('tr', {}, el('th', { scope: 'row' }, 'Profile'), compared.map((product) => el('td', {}, product.headline))),
        Object.entries(specs).map(([key, label]) => el('tr', {},
          el('th', { scope: 'row' }, label), compared.map((product) => el('td', {}, product.specs[key] || 'Unspecified')),
        )),
        compared.some((product) => product.workloadProfiles?.length) &&
          el('tr', {}, el('th', { scope: 'row' }, 'Fictional workload profiles'),
            compared.map((product) => el('td', {}, el('dl', { class: 'workload-list' },
              product.workloadProfiles?.map((profile) => el('div', {}, el('dt', {}, profile.label), el('dd', {}, profile.fit))),
            ))),
          ),
        compared.some((product) => product.tags.length) && el('tr', {}, el('th', { scope: 'row' }, 'Features'),
          compared.map((product) => el('td', {}, product.tags.join(' · ') || 'Unspecified'))),
      ),
    ),
  );
}

function quoteReceipt(view, editable = false) {
  const main = view.products.find((product) => product.id === view.draft.productId);
  const extras = view.accessories.filter((item) => view.draft.accessoryIds.includes(item.id));
  const receiptRow = (name, price) => el('div', {}, el('dt', {}, name), el('dd', {}, price));
  return el('aside', { class: 'receipt', 'aria-label': 'Draft quote' },
    el('h3', {}, 'Quote estimate'),
    main
      ? el('dl', { class: 'line-items' },
        receiptRow(main.name, main.priceLabel), extras.map((item) => receiptRow(item.name, item.priceLabel)))
      : el('p', { class: 'muted' }, 'Choose a main recommendation.'),
    el('dl', { class: 'total', 'aria-live': 'polite' }, receiptRow('Total', view.quote.totalLabel || '—')),
    view.quote.remainingLabel && el('p', { class: 'balance' }, view.quote.remainingLabel),
    editable && view.accessories.length > 0 && el('fieldset', { class: 'accessories' },
      el('legend', {}, 'Add to main quote'),
      view.accessories.map((item) => {
        const id = `accessory-${item.id}`;
        const checked = view.draft.accessoryIds.includes(item.id);
        const input = el('input', {
          type: 'checkbox', id, checked, disabled: view.save.readOnly, 'aria-describedby': `${id}-note`,
        });
        input.addEventListener('change', () => {
          if (!act({ type: 'ACCESSORY', accessoryId: item.id, checked: input.checked }).ok) input.checked = checked;
        });
        return el('div', { class: 'check-row' }, input,
          el('div', {}, el('label', { for: id }, `${item.name} · ${item.priceLabel}`),
            el('p', { id: `${id}-note` }, item.description)),
        );
      }),
    ),
  );
}

function renderJustify(view) {
  const form = el('form', { id: 'quote-form' },
    productSelect(view, 'productId', 'Main recommendation'),
    productSelect(view, 'alternativeId', 'Backup recommendation', 'alternativeId', { placeholder: 'No backup selected' }),
    el('p', { id: 'response-limit', class: 'field-hint response-limit' }, 'Up to 6,000 characters per response.'),
    response(view, 'prediction', 'Predict the result'),
    response(view, 'reason', 'Explain your recommendation'),
    response(view, 'tradeoff', 'Explain the trade-off'),
    (view.attemptKind === 'transfer' || view.client.changedBrief)
      && response(view, 'transferReason', 'Respond to the changed brief'),
    el('p', { id: 'quote-error', role: 'alert', class: 'field-error' }),
    el('div', { class: 'actions' },
      advance('Back to comparison', 'compare', view, 'secondary'),
      el('button', { type: 'submit', class: 'button primary', id: 'quote-submit', disabled: view.save.readOnly },
        'Give the client your quote'),
    ),
  );
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = act({ type: 'SUBMIT' });
    if (!result.ok && get('quote-error')) {
      setText('quote-error', result.message || 'Check your quote and try again.');
      dismissNoticeOnEdit = true;
    }
  });
  return el('section', { class: 'stage split-stage', 'aria-labelledby': 'stage-title' },
    el('div', {},
      el('h2', { id: 'stage-title', tabindex: '-1' }, 'Write the quote'),
      el('p', { class: 'muted' }, 'The client will respond to the fit of your chosen setup. Your draft and explanations stay in this activity for teacher review.'),
      form,
    ),
    el('div', { class: 'quote-stack' }, quoteReceipt(view, true), customerNotes(view)),
  );
}

function response(view, field, label) {
  const title = el('label', { for: field }, label);
  const hint = el('p', { class: 'field-hint', id: `${field}-hint` }, view.responsePrompts?.[field]);
  const input = el('textarea', {
    id: field, rows: 3, maxlength: responseLimit,
    'aria-describedby': `${hint.id} response-limit`, readonly: view.save.readOnly,
  });
  input.value = view.draft[field];
  input.addEventListener('input', () => {
    if (dismissNoticeOnEdit) {
      setText('quote-error', '');
      showNotice('', '');
      dismissNoticeOnEdit = false;
    }
    act({ type: 'DRAFT', field, value: input.value });
  });
  return el('div', { class: 'field' }, title, hint, input);
}

function criteriaList(criteria) {
  return el('ul', { class: 'fit-checks' }, criteria.map((criterion) =>
    el('li', {},
      el('div', {}, el('strong', {}, criterion.title), el('span', { class: 'criterion-score' }, `${criterion.score} / ${criterion.max}`)),
      el('p', {}, criterion.explanation),
    ),
  ));
}

function listSection(title, items) {
  return items.length > 0 && el('section', { class: 'brief-section' }, el('h3', {}, title),
    el('ul', {}, items.map((item) => el('li', {}, item))),
  );
}

function renderDebrief(view) {
  const feedback = view.feedback;
  if (!feedback) return el('section', { class: 'stage' },
    el('h2', { id: 'stage-title', tabindex: '-1' }, 'Debrief'), el('p', {}, 'Give the client a quote to see the result.'),
    el('div', { class: 'actions' }, advance('Write the quote', 'justify', view)));
  return el('section', { class: 'stage split-stage', 'aria-labelledby': 'stage-title' },
    el('div', {},
      el('h2', { id: 'stage-title', tabindex: '-1' }, 'The client’s debrief'),
      el('blockquote', { class: 'client-response' }, feedback.headline),
      criteriaList(feedback.criteria),
      listSection('Strengths of your quote', feedback.strengths),
      listSection('What to reconsider', feedback.nextSteps),
    ),
    el('aside', { class: 'quote-stack', 'aria-label': 'Quote result and next actions' },
      el('div', { class: 'receipt' },
        el('p', { class: 'eyebrow' }, 'Provisional recommendation fit'),
        el('strong', { class: 'score' }, `${feedback.score} / ${feedback.max}`),
        el('p', {}, feedback.feasible ? 'Meets the required constraints' : 'Misses one or more required constraints'),
        el('p', { class: 'muted' }, feedback.teacherReview),
      ),
      el('div', { class: 'decision-buttons' },
        button('Revise this quote', () => act({ type: 'REVISE' }), {
          key: 'revise', disabled: view.save.readOnly,
        }),
        view.client.hasTransfer !== false && !view.client.changedBrief && view.attemptKind !== 'transfer' &&
          button('Open a changed brief', () => act({ type: 'TRANSFER' }), {
            style: 'primary', key: 'transfer', disabled: view.save.readOnly,
          }),
        button('View shift report', () => go('report'), { key: 'debrief-report', style: 'quiet' }),
      ),
    ),
  );
}

function workedExample(example, id = 'worked-example') {
  if (!example) return null;
  return el('details', { id, class: 'training-topic' },
    el('summary', {}, example.title),
    el('div', { class: 'topic-copy' },
      example.client && el('p', {}, example.client),
      el('ol', {}, example.steps.map((step) => el('li', {}, step))),
      el('p', {}, example.explanation),
    ),
  );
}

function renderLearn(view) {
  get('learn-heading').replaceChildren(
    heading('learn-title', 'Training', 'Specs in service of the work', 'Retrieve what you know, inspect the parts, then use the worked example or try a practice customer.'),
    el('div', { class: 'training-retrieval' }, el('strong', {}, 'Quick prediction'),
      el('p', {}, 'What changes when you have many apps open? What changes when a saved project library exceeds the free space? Explain both before inspecting RAM and storage.')),
  );
  get('learn-lessons').replaceChildren(
    el('section', { class: 'lesson-section', 'aria-labelledby': 'lesson-title' },
      el('h2', { id: 'lesson-title' }, 'Read the spec sheet'),
      el('div', { class: 'training-topics' }, view.learning.map((item) =>
        el('details', { class: 'training-topic', id: `topic-${item.id}` },
          el('summary', {}, item.title),
          el('div', { class: 'topic-copy' },
            el('p', {}, item.explanation),
            item.example && el('p', {}, el('strong', {}, 'Example'), item.example),
            item.misconception && el('p', {}, el('strong', {}, 'Common mistake'), item.misconception),
            item.tryThis && el('p', {}, el('strong', {}, 'Try this'), item.tryThis),
          ),
        ),
      )),
      workedExample(view.workedExample),
      el('div', { class: 'actions' },
        button('Try a practice customer', () => act({ type: 'START', mode: 'practice' }), {
          key: 'learn-practice', style: 'primary', disabled: view.save.readOnly,
        }),
        button('Return to the counter', () => go('floor'), { key: 'learn-floor' })),
    ),
  );
  if (!view.products.some((product) => product.id === sceneProductId)) {
    sceneProductId = view.draft.productId || view.products[0]?.id || '';
  }
  sceneProduct = view.products.find((product) => product.id === sceneProductId);
  get('bench-model').replaceChildren(productSelect(view, 'productId', 'Inspect a computer', 'bench-product', {
    value: sceneProductId, disabled: false,
    onChange: (id) => {
      if (!id) {
        get('bench-product').value = sceneProductId;
        return;
      }
      sceneProductId = id;
      sceneProduct = view.products.find((product) => product.id === id);
      updateSceneProduct();
      renderBenchText(currentView);
    },
  }));
  renderBenchText(view);
  ensureScene();
}

function renderBenchText(view) {
  const focused = document.activeElement?.dataset.focusKey;
  const active = view.componentFacts.find((fact) => fact.id === selectedPart) || view.componentFacts[0];
  if (active) selectedPart = active.id;
  const panel = get('bench-text');
  if (panel.hidden) return;
  panel.replaceChildren(...[
    el('h3', {}, 'Component guide'),
    el('div', { class: 'part-buttons', role: 'group', 'aria-label': 'Computer components' },
      view.componentFacts.map((fact) => button(fact.title, () => {
        selectedPart = fact.id;
        renderBenchText(currentView);
      }, { key: `part-${fact.id}`, style: 'quiet', 'aria-pressed': String(fact.id === selectedPart) })),
    ),
    active && el('div', { class: 'part-info', 'aria-live': 'polite', 'aria-atomic': 'true' },
      el('strong', {}, active.title), el('p', {}, active.explanation),
      sceneProduct?.specs[active.id] && el('p', { class: 'part-spec' },
        el('strong', {}, sceneProduct.name), sceneProduct.specs[active.id]),
    ),
  ].filter(Boolean));
  if (focused) panel.querySelector(`[data-focus-key="${CSS.escape(focused)}"]`)?.focus({ preventScroll: true });
}

function disposeScene() {
  const previous = scene;
  scene = undefined;
  sceneProductApplied = undefined;
  try { previous?.dispose(); } catch { /* The text route remains usable. */ }
}

function showBenchGuide() {
  const panel = get('bench-text');
  panel.hidden = false;
  panel.parentElement.classList.remove('scene-ready');
  renderBenchText(currentView);
}

function sceneRetryButton() {
  return button('Retry 3D view', () => {
    if (pendingScene || scenePageClosed) return;
    focusHeading('workbench-title');
    disposeScene();
    showBenchGuide();
    sceneError = '';
    sceneRetry += 1;
    ensureScene();
  }, { id: 'retry-3d', key: 'retry-3d' });
}

function showSceneFallback(message) {
  disposeScene();
  sceneError = message;
  showBenchGuide();
  get('pc-viewport').replaceChildren(el('div', { class: 'bench-retry' },
    el('p', { role: 'status' }, message, ' You can still inspect the parts in the component guide.'),
    sceneRetryButton(),
  ));
}

function updateSceneProduct() {
  if (!scene || !sceneProduct || sceneProductApplied === sceneProduct.id) return;
  try {
    scene.setProduct(sceneProduct);
    sceneProductApplied = sceneProduct.id;
    scene.selectPart(selectedPart);
  } catch {
    showSceneFallback('The 3D view could not display this computer.');
  }
}

function ensureScene() {
  if (sceneError || pendingScene || scenePageClosed) return;
  if (scene) {
    updateSceneProduct();
    requestAnimationFrame(() => scene?.resize());
    return;
  }
  const viewport = get('pc-viewport');
  viewport.replaceChildren(el('p', { class: 'bench-status', role: 'status' }, 'Opening the 3D workbench…'));
  const sceneUrl = new URL('./pc-scene.mjs', import.meta.url);
  if (sceneRetry) sceneUrl.searchParams.set('retry', String(sceneRetry));
  pendingScene = import(sceneUrl.href)
    .then(({ createPCScene }) => {
      if (scenePageClosed) return;
      viewport.replaceChildren();
      return createPCScene(viewport, {
        reducedMotion: motion.matches,
        onSelect(partId) {
          if (!currentView.componentFacts.some((fact) => fact.id === partId)) return;
          selectedPart = partId;
        },
      });
    })
    .then((instance) => {
      if (scenePageClosed) {
        instance?.dispose();
        return;
      }
      scene = instance;
      updateSceneProduct();
      if (!scene) return;
      const panel = get('bench-text');
      if (panel.contains(document.activeElement)) focusHeading('workbench-title');
      panel.hidden = true;
      panel.parentElement.classList.add('scene-ready');
      if (currentView.screen === 'learn') scene.resize();
      if (scene.getMetrics().mode === 'text') {
        viewport.append(el('div', { class: 'bench-retry' }, sceneRetryButton()));
      }
    })
    .catch(() => {
      if (!scenePageClosed) showSceneFallback('The 3D workbench could not open.');
    })
    .finally(() => { pendingScene = undefined; });
}

motion.addEventListener('change', (event) => scene?.setReducedMotion(event.matches));

function inlineSupport(view) {
  const tools = view.supports;
  const topics = [];
  if (tools.today) {
    const goals = {
      discover: 'Find which needs could rule out a computer.',
      compare: 'Compare the same specs across models and check the total cost.',
      justify: 'Connect one difference between computers to a consequence for this customer.',
      feedback: 'Find a constraint that was met or missed and decide what you would revise.',
    };
    topics.push(el('div', {}, el('strong', {}, 'Today’s goal'), el('p', {}, goals[view.floorStep])));
  }
  if (tools.summary) {
    topics.push(el('div', {}, el('strong', {}, 'Client notes'),
      view.client.facts.length
        ? el('ul', {}, view.client.facts.map((fact) => el('li', {}, fact)))
        : el('p', {}, 'Ask a question to fill in your notes.')));
  }
  if (tools.glossary) topics.push(el('div', {}, el('strong', {}, 'Glossary'),
    el('dl', { class: 'glossary' }, view.componentFacts.map((fact) =>
      el('div', {}, el('dt', {}, fact.title), el('dd', {}, fact.explanation))))));
  if (tools.checklist) topics.push(el('div', {}, el('strong', {}, 'Quote checklist'), el('ul', {},
    ['Check the customer’s work and requirements.', 'Compare prices with any necessary extras.',
      'Predict one consequence and explain one trade-off.'].map((item) => el('li', {}, item)))));
  if (tools.worked) topics.push(workedExample(view.workedExample, 'counter-example') ||
    el('div', {}, el('strong', {}, 'Worked example'), el('p', {}, 'The worked example is available in practice.')));
  if (tools.frames) topics.push(el('div', {}, el('strong', {}, 'Sentence starters'),
    el('p', {}, 'Because the customer needs … , I chose … ; its … means they can …'),
    el('p', {}, 'I would choose … instead if … because …')));
  if (tools.stretch) topics.push(el('div', {}, el('strong', {}, 'Stretch question'),
    el('p', {}, 'What would have to change for your backup to become the stronger recommendation? Who would bear the cost of that change?')));
  if (!topics.length) return null;
  return el('details', { id: 'inline-tools', class: 'inline-tools', open: view.floorStep === 'justify' },
    el('summary', {}, 'Tools for this quote'), el('div', { class: 'tool-notes' }, topics));
}

function speakBrief(view) {
  const speech = window.speechSynthesis;
  const voice = speech?.getVoices().find((item) => item.localService && item.lang.toLowerCase().startsWith('en'));
  if (!voice || typeof SpeechSynthesisUtterance === 'undefined') {
    showNotice('info', 'An on-device English voice is unavailable. The brief and replies are available on the page.');
    return;
  }
  const words = [view.client.opening, view.client.changedBrief, ...view.client.questions.filter((question) => question.asked)
    .map((question) => question.answer)].filter(Boolean).join(' ');
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.voice = voice;
  speech.cancel();
  speech.speak(utterance);
}

function coachContext(view) {
  const screens = { welcome: 'Welcome', learn: 'Training', report: 'Shift report' };
  const caseInView = view.screen === 'floor' ? view.client : null;
  const stage = caseInView ? steps[view.floorStep] : screens[view.screen] || 'The counter';
  const lines = [
    'IB Digital Society (IBDS) · Floor Shift: Computer Advice Lab',
    'Related planning lesson: ibds-26-s04-d02 (Inside the computer).',
    'Activity package: local-computer-advisor-2026-11-17.',
    `Stage: ${stage}. Mode: ${modes[view.mode]}.`,
    'Concepts: CPU, RAM, storage, graphics, OS and app compatibility, device connections, portability, total cost and trade-offs.',
  ];
  if (caseInView) {
    lines.push(`Fictional case: ${caseInView.id}. Quote stage: ${attemptKinds[view.attemptKind] || 'First quote'}.`);
    lines.push('Discovery prompts:', ...caseInView.questions.map(({ label }) => `- ${label}`));
    const fields = ['prediction', 'reason', 'tradeoff'];
    if (caseInView.changedBrief || view.attemptKind === 'transfer') fields.push('transferReason');
    lines.push('Quote prompts:', ...fields.flatMap((field) => {
      const prompt = view.responsePrompts?.[field];
      return prompt ? [`- ${prompt}`] : [];
    }));
  }
  lines.push(view.mode === 'independent'
    ? 'Coach: Explain concepts and ask guiding questions. Do not choose a computer, deliver a finished recommendation or write any answer for me.'
    : 'Coach: Explain concepts and ask a guiding question I can apply to my own quote. Use unrelated examples if needed.');
  return lines.join('\n');
}

async function copyCoachContext() {
  const preview = get('coach-context');
  try {
    await navigator.clipboard.writeText(preview.value);
    setText('coach-copy-status', 'Copied. You can paste the context into the Coach.');
  } catch {
    get('coach-preview').open = true;
    preview.focus();
    preview.select();
    setText('coach-copy-status', 'Clipboard access is unavailable. Copy the selected context manually.');
  }
}

function coachTool() {
  return el('section', { class: 'coach-tool', 'aria-labelledby': 'coach-title' },
    el('h3', { id: 'coach-title' }, 'Learning Studio Coach'),
    el('p', {}, 'Ask for concept explanations and guiding questions. During independent work, write your own recommendation and answers.'),
    el('p', {}, 'The Coach opens in a new tab. Context transfers only if you choose to paste it. Keep student information and responses private.'),
    el('div', { class: 'actions' },
      el('a', { href: coachUrl, target: '_blank', rel: 'noopener noreferrer', class: 'button', id: 'coach-link' }, 'Open Coach (new tab)'),
      button('Copy context', copyCoachContext, { id: 'coach-copy' }),
    ),
    el('details', { id: 'coach-preview' },
      el('summary', {}, 'Preview copyable context'),
      el('label', { for: 'coach-context', class: 'sr-only' }, 'Coach context'),
      el('textarea', { id: 'coach-context', readonly: true, rows: 6 }),
    ),
    el('p', { id: 'coach-copy-status', role: 'status' }),
  );
}

function earlierQuote(attempt, previous) {
  if (!previous) return null;
  const id = `attempt-${previous.id}`;
  const label = attempt.kind === 'transfer' && previous.kind !== 'transfer'
    ? 'Earlier quote for this changed brief'
    : 'Quote revised';
  const link = el('a', { href: `#${id}` }, `${previous.clientName} · ${attemptKinds[previous.kind]} · ${previous.productName}`);
  link.addEventListener('click', (event) => {
    const details = get(id);
    if (!details) return;
    event.preventDefault();
    details.open = true;
    details.querySelector('summary').focus();
  });
  return el('div', { class: 'evidence-context' }, el('strong', {}, label), link);
}

function quoteSupport(context) {
  if (!context) return null;
  const names = (ids) => ids?.map((id) => supports[id]?.[0] || id).join(', ') || 'None recorded';
  return el('section', { class: 'brief-section' },
    el('h3', {}, 'App-recorded support and exposure'),
    el('dl', { class: 'written-evidence' },
      el('div', {}, el('dt', {}, 'Tools active when this quote was saved'), el('dd', {}, names(context.active))),
      el('div', {}, el('dt', {}, 'Tools used during this case'), el('dd', {}, names(context.used))),
      el('div', {}, el('dt', {}, 'Earlier practice on this case'),
        el('dd', {}, context.priorPracticeExposure ? 'Recorded' : 'None recorded')),
      context.independence === 'pending_teacher_review' && el('div', {},
        el('dt', {}, 'Independent work'), el('dd', {}, 'Pending teacher review')),
    ),
    el('p', { class: 'muted' }, 'Recommendation fit is calculated separately.'),
  );
}

function evidenceDetails(attempt, previous, connected) {
  const answer = (label, text) => el('div', {}, el('dt', {}, label), el('dd', { class: 'verbatim' }, text || 'No response recorded'));
  return el('details', { id: `attempt-${attempt.id}`, class: 'evidence-detail' },
    el('summary', {},
      el('span', {}, el('strong', {}, attempt.clientName), el('small', {}, `${modes[attempt.mode]} · ${attemptKinds[attempt.kind]}`)),
      el('span', { class: 'evidence-fit' }, `${attempt.score} / ${attempt.max} fit`),
    ),
    el('div', { class: 'evidence-body' },
      el('div', { class: 'evidence-machine' }, el('strong', {}, attempt.productName),
        attempt.quoteTotal !== undefined && el('span', {}, money.format(attempt.quoteTotal)),
        attempt.accessoryNames?.length > 0 && el('p', {}, `Extras: ${attempt.accessoryNames.join(', ')}`),
      ),
      el('p', {}, attempt.feasible ? 'Meets the required constraints' : 'Misses one or more required constraints'),
      attempt.alternativeName && el('p', {}, el('strong', {}, 'Backup recommendation '), attempt.alternativeName),
      attempt.discovery?.length > 0 && listSection('Client replies recorded before the quote',
        attempt.discovery.map((item) => item.answer)),
      attempt.criteria?.length > 0 && criteriaList(attempt.criteria),
      el('h3', {}, 'Decision and explanation'),
      el('dl', { class: 'written-evidence' },
        answer('Prediction', attempt.prediction),
        answer('Recommendation', attempt.reason),
        answer('Trade-off', attempt.tradeoff),
        attempt.kind === 'transfer' && answer('Changed requirements', attempt.transferReason),
      ),
      el('p', { class: 'muted' }, attempt.teacherReview || 'Reasoning awaits teacher review'),
      earlierQuote(attempt, previous),
      quoteSupport(attempt.supportContext),
      connected && el('div', { class: 'actions' },
        button('Prepare Google submission', (event) => openSubmission(attempt.id, event.currentTarget), {
          key: `submit-quote-${attempt.id}`,
        })),
    ),
  );
}

function renderReport(view) {
  const { summary } = view;
  const supportRecords = view.supportHistory || [];
  const attemptsById = new Map(view.attempts.map((attempt) => [attempt.id, attempt]));
  const connected = !!view.connection.studentFormUrl && view.connection.state === 'google_form_handoff';
  get('report-screen').replaceChildren(
    heading('report-title', 'Shift report', 'Your quote record', 'Review the quotes you gave your clients and download a copy of your local work.'),
    el('div', { class: 'report-slip' },
      el('div', {}, el('strong', {}, `${summary.independentClients} / ${summary.totalClients}`), el('span', {}, 'Client shift cases')),
      el('div', {}, el('strong', {}, summary.rawMax ? `${summary.rawScore} / ${summary.rawMax}` : '—'),
        el('span', {}, 'First independent quotes — raw fit')),
      el('div', {}, el('strong', { class: 'report-status' }, summary.teacherReview), el('span', {}, 'Teacher review')),
    ),
    el('div', { class: 'split-stage report-layout' },
      el('section', { 'aria-labelledby': 'attempts-title' },
        el('h2', { id: 'attempts-title' }, 'Client quotes'),
        view.attempts.length
          ? el('div', { class: 'evidence-list' }, view.attempts.map((attempt) =>
            evidenceDetails(attempt, attemptsById.get(attempt.revisionOf), connected)))
          : el('div', { class: 'empty-report' }, el('p', {}, 'Give a client a quote to see it here. Unfinished work can still be backed up.'),
            button('Go to the counter', () => go('floor'), { style: 'primary', key: 'report-floor' })),
        el('details', { id: 'report-tools', class: 'evidence-detail' },
          el('summary', {}, 'Learning tools used'),
          el('div', { class: 'evidence-body' },
            el('p', {}, 'This help record is separate from recommendation fit.'),
            supportRecords.length > 0
              ? el('ul', {}, supportRecords.map((record) =>
                el('li', {}, `${supports[record.supportId]?.[0] || record.supportId} · ${record.enabled ? 'On' : 'Off'}`)))
              : el('p', {}, 'No tool changes recorded.'),
          ),
        ),
      ),
      el('aside', { class: 'quote-stack' },
        el('section', { class: 'receipt', 'aria-labelledby': 'download-title' },
          el('h2', { id: 'download-title' }, 'Take your work with you'),
          el('p', {}, view.connection.message),
          el('div', { class: 'decision-buttons' },
            button('Download JSON backup', () => download('json'), { key: 'download-json', style: 'primary' }),
            button('Download CSV report', () => download('csv'), { key: 'download-csv' }),
          ),
        ),
        el('section', { class: 'device-tools', 'aria-labelledby': 'device-title' },
          el('h3', { id: 'device-title' }, 'Device recovery'),
          el('p', {}, 'Use a JSON backup to restore your work. On a shared device, download your work before clearing the local copy.'),
          el('div', { class: 'decision-buttons' },
            button('Restore a backup', (event) => openRecovery('import', event.currentTarget),
              { key: 'import', disabled: view.save.readOnly }),
            view.save.status === 'conflict' && button('Use latest saved copy', (event) => openRecovery('latest', event.currentTarget),
              { key: 'load-latest' }),
            view.save.recoveryAvailable && button('Download unreadable device record', () => download('recovery'),
              { key: 'download-device-record' }),
          ),
          el('div', { class: 'clear-device' },
            button('Clear this device’s activity', (event) => openRecovery('reset', event.currentTarget),
              { key: 'reset', style: 'danger-link', disabled: view.save.readOnly }),
          ),
        ),
      ),
    ),
  );
}

const submissionDialog = el('dialog', { id: 'submission-dialog', 'aria-labelledby': 'submission-title' });
let submissionTrigger;
document.body.append(submissionDialog);

submissionDialog.addEventListener('close', () => {
  const key = submissionTrigger?.dataset.focusKey;
  const button = key && get('report-screen').querySelector(`[data-focus-key="${CSS.escape(key)}"]`);
  if (button && !button.closest('[hidden]')) button.focus();
  else focusHeading('screen-title');
  submissionTrigger = undefined;
  submissionDialog.replaceChildren();
});

function openSubmission(attemptId, trigger) {
  let prepared;
  let formUrl;
  try {
    prepared = store.prepareSubmission(attemptId);
    formUrl = new URL(prepared.studentFormUrl);
    if (formUrl.origin !== 'https://docs.google.com' || !/^\/forms\/d\/e\/[\w-]+\/viewform$/.test(formUrl.pathname)) {
      throw new Error('The Google Form link is unavailable.');
    }
    formUrl.search = '';
    formUrl.hash = '';
  } catch (error) {
    showNotice('error', error.message || 'The quote could not be prepared. Your work is still available in the shift report.');
    return;
  }
  const report = el('textarea', { id: 'submission-report', readonly: true, rows: 6, spellcheck: 'false' });
  const status = el('p', { id: 'submission-copy-status', role: 'status' });
  report.value = prepared.text;
  const copy = button('Copy prepared report', async () => {
    try {
      await navigator.clipboard.writeText(report.value);
      status.textContent = 'Copied. Paste this report into the Form.';
    } catch {
      report.focus();
      report.select();
      status.textContent = 'Clipboard access is unavailable. Copy the selected report manually.';
    }
  }, { id: 'copy-submission-report', style: 'primary' });
  submissionTrigger = trigger;
  submissionDialog.replaceChildren(
    el('div', { class: 'dialog-top' },
      el('h2', { id: 'submission-title' }, 'Submit your adviser quote'),
      button('Close', () => submissionDialog.close(), { style: 'quiet' }),
    ),
    el('p', {}, prepared.title),
    el('ol', { class: 'submission-steps' },
      el('li', {}, el('strong', {}, 'Copy the prepared report'),
        el('p', {}, 'You can copy the full report manually from the field below.'),
        el('label', { for: report.id, class: 'sr-only' }, 'Prepared adviser quote'), report, copy, status),
      el('li', {}, el('strong', {}, 'Complete the Google Form'),
        el('p', {}, 'Choose “Submit adviser quote”. Paste your report into “IBDS-FS-QUOTE — Paste the prepared adviser quote”, then press Submit in Google.'),
        el('a', { href: formUrl.href, target: '_blank', rel: 'noopener noreferrer', id: 'open-student-form' }, 'Open Google Form (new tab)'),
        el('p', { class: 'muted' }, 'Look for the confirmation in Google to verify your submission.')),
    ),
  );
  submissionDialog.showModal();
}

function download(format) {
  try {
    const file = store.exportReport(format);
    const url = URL.createObjectURL(new Blob([file.text], { type: file.mime }));
    const link = el('a', { href: url, download: file.filename, hidden: true });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  } catch {
    showNotice('error', 'The file could not be prepared. Your session remains open.');
    return false;
  }
}

function openRecovery(mode, trigger) {
  const dialog = get('recovery-dialog');
  const content = get('recovery-content');
  let fields;
  recoveryMode = mode;
  recoveryTrigger = trigger;
  setText('recovery-status', '');
  if (mode === 'import') {
    setText('recovery-title', 'Restore local work');
    const file = el('input', { type: 'file', id: 'backup-file', accept: '.json,application/json', required: true });
    const apply = el('button', { type: 'submit', class: 'button primary' }, 'Validate and restore');
    const form = el('form', {},
      el('p', {}, 'A valid backup will replace the current activity on this device. Download your current work first if you need to keep it.'),
      el('div', { class: 'field' }, el('label', { for: file.id }, 'JSON backup'), file),
      el('div', { class: 'actions' }, button('Download current backup', () => download('json')), apply),
    );
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!file.files[0]) return;
      apply.disabled = true;
      let result;
      try {
        const json = await file.files[0].text();
        if (!dialog.open || recoveryMode !== mode) return;
        result = store.importReport(json);
      } catch {
        result = { ok: false, message: 'The selected file could not be read.' };
      }
      apply.disabled = false;
      if (result.ok) {
        dialog.close();
        showNotice('success', result.message || 'Backup restored.');
      } else {
        setText('recovery-status', result.message || 'This file could not be restored. Your current work is still open.');
      }
    });
    fields = form;
  } else {
    const latest = mode === 'latest';
    setText('recovery-title', latest ? 'Load the latest saved copy?' : 'Clear the activity from this device?');
    fields = el('div', {},
      el('p', {}, latest
        ? 'Another tab changed the saved copy. Download your open work before replacing it with the latest version.'
        : 'This clears the local drafts, quotes and tool history for this activity. Download a backup first if you need to keep them.'),
      button('Download current backup', () => download('json')),
      el('div', { class: 'confirm-action' },
        button(latest ? 'Load latest saved copy' : 'Clear local activity', () => {
          const result = act(latest ? { type: 'LOAD_LATEST' } : { type: 'RESET', confirmed: true });
          if (result.ok) dialog.close();
          else setText('recovery-status', result.message || 'The change could not be completed.');
        }, { style: latest ? 'primary' : 'danger' }),
      ),
    );
  }
  content.replaceChildren(fields);
  dialog.showModal();
}

const screens = ['welcome', 'learn', 'floor', 'report'];
const navigation = [...document.querySelectorAll('[data-screen]')];

function render(view, reason) {
  const previous = currentView;
  const active = document.activeElement;
  const key = active?.dataset.focusKey;
  const id = active?.id;
  const isTextarea = active instanceof HTMLTextAreaElement;
  const caret = isTextarea ? [active.selectionStart, active.selectionEnd, active.selectionDirection] : null;
  const keepOpen = [...get('main').querySelectorAll('details[open][id]')].map((element) => element.id);
  const keepClosed = [...get('main').querySelectorAll('details:not([open])[id]')].map((element) => element.id);
  currentView = view;
  setText('save-status', view.save.message);
  get('save-status').dataset.state = view.save.status;
  setText('submission-status', view.connection.state === 'google_form_handoff' && view.connection.studentFormUrl
    ? 'Confirm submission in Google' : 'Not submitted');
  get('submission-status').title = view.connection.message;
  const priorConflict = previous?.save.status === 'conflict';
  const inConflict = view.save.status === 'conflict';
  if (inConflict && !priorConflict) {
    get('submission-status').before(button('Recover saved work', (event) => openRecovery('latest', event.currentTarget), {
      id: 'recover-conflict', style: 'status-action',
    }));
  } else if (!inConflict && priorConflict) {
    get('recover-conflict')?.remove();
  }
  if (view.notice) showNotice(view.notice.kind, view.notice.text);
  else if (reason !== 'inspect' && (dispatching || previous?.notice)) showNotice('', '');
  for (const [supportId] of Object.entries(supports)) {
    const input = get(`tool-${supportId}`);
    input.checked = !!view.supports[supportId];
    input.disabled = view.save.readOnly;
  }

  if (dispatching?.type === 'DRAFT' && textFields.has(dispatching.field) && previous?.screen === view.screen
    && previous?.save.readOnly === view.save.readOnly && previous?.floorStep === view.floorStep) return;

  for (const screen of screens) get(`${screen}-screen`).hidden = screen !== view.screen;
  for (const control of navigation) {
    if (control.dataset.screen === view.screen) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  }
  const screenRender = { welcome: renderWelcome, learn: renderLearn, floor: renderFloor, report: renderReport };
  screenRender[view.screen](view);

  const screenChanged = previous && previous.screen !== view.screen;
  const stepChanged = previous?.screen === 'floor' && view.screen === 'floor' && previous.floorStep !== view.floorStep;
  const customerChanged = previous?.screen === 'floor' && view.screen === 'floor'
    && (previous.client?.id !== view.client?.id || previous.mode !== view.mode || previous.attemptKind !== view.attemptKind);
  if (!screenChanged && !stepChanged && !customerChanged) {
    for (const openId of keepOpen) {
      const details = get(openId);
      if (details) details.open = true;
    }
    for (const closedId of keepClosed) {
      const details = get(closedId);
      if (details) details.open = false;
    }
  }
  if (dispatching?.type === 'SUPPORT' && dispatching.enabled && view.screen === 'floor') {
    const details = get('inline-tools');
    if (details) details.open = true;
  }
  if (document.querySelector('dialog[open]')) return;
  if (screenChanged || customerChanged) {
    window.speechSynthesis?.cancel();
    focusHeading('screen-title');
  } else if (stepChanged) {
    focusHeading('stage-title');
  } else if (active && !active.isConnected) {
    const replacement = (id && get(id)) || (key && get('main').querySelector(`[data-focus-key="${CSS.escape(key)}"]`));
    if (replacement) {
      replacement.focus({ preventScroll: true });
      if (caret && replacement instanceof HTMLTextAreaElement) replacement.setSelectionRange(...caret);
    }
  }
}

get('home-link').addEventListener('click', () => go('welcome'));
for (const control of navigation) control.addEventListener('click', () => go(control.dataset.screen));
get('tools-link').addEventListener('click', () => {
  get('coach-context').value = coachContext(currentView);
  get('coach-preview').open = false;
  setText('coach-copy-status', '');
  get('tools-dialog').showModal();
});

get('tool-controls').replaceChildren(...Object.entries(supports).map(([supportId, [name, description]]) => {
  const id = `tool-${supportId}`;
  const input = el('input', { id, type: 'checkbox', 'aria-describedby': `${id}-description` });
  input.addEventListener('change', () => {
    if (!act({ type: 'SUPPORT', supportId, enabled: input.checked }).ok) input.checked = !!currentView.supports[supportId];
    if (supportId === 'audio' && !input.checked) window.speechSynthesis?.cancel();
  });
  return el('div', { class: 'check-row' }, input,
    el('div', {}, el('label', { for: id }, name), el('p', { id: `${id}-description` }, description)));
}));
get('tool-controls').prepend(coachTool());

for (const control of document.querySelectorAll('[data-close]')) {
  control.addEventListener('click', () => get(control.dataset.close).close());
}
get('tools-dialog').addEventListener('close', () => get('tools-link').focus());
get('recovery-dialog').addEventListener('close', () => {
  const triggerId = recoveryTrigger?.id;
  const focusKey = recoveryTrigger?.dataset.focusKey;
  const replacement = (triggerId && get(triggerId))
    || (focusKey && get('main').querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`));
  const target = recoveryTrigger?.isConnected ? recoveryTrigger : replacement;
  if (target && !target.disabled && !target.closest('[hidden]')) target.focus();
  else focusHeading('screen-title');
  recoveryTrigger = undefined;
  recoveryMode = undefined;
});

const unsubscribe = store.subscribe(render);
render(store.getView(), 'initial');
window.addEventListener('pagehide', (event) => {
  window.speechSynthesis?.cancel();
  if (!event.persisted) {
    scenePageClosed = true;
    unsubscribe();
    disposeScene();
  }
});
