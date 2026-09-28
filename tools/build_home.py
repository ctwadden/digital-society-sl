"""Build the student home from explicit, versioned release settings. No browser-only toggles."""
from pathlib import Path
import html
import json
import re

ROOT = Path(__file__).resolve().parents[1]
esc = html.escape

def build(config=None):
    config = config or json.loads((ROOT / 'course-release.json').read_text())
    data = json.loads((ROOT / 'course-home/sprints.json').read_text())
    expected = {'practice-library', 'assessment-guide', 'course-route', 'ia-workspace'} | {s['id'] for s in data['sprints']}
    flags = {x['id']: x['visible'] for x in config['sections']}
    assert len(flags) == len(config['sections']) and set(flags) == expected, 'Unknown, missing or duplicate section'
    assert all(type(x) is bool for x in flags.values()), 'Visibility must be true or false'
    nav = ['<a href="#start">Start here</a>']
    sections = []

    def add(key, title, content):
        if flags[key]:
            nav.append(f'<a href="#{key}">{esc(title)}</a>')
            sections.append(f'<section class="section" id="{key}" aria-labelledby="{key}-title"><h2 id="{key}-title">{esc(title)}</h2>{content}</section>')

    cards = [
        ('Four lenses → Criterion B', 'Watch one TED talk, build a study infographic, then rank your own IA sources and select a provisional top three.', 'lessons/source-power-criterion-b/', 'Independent lesson · 70 minutes'),
        ('Concepts & command terms', 'Turn a case into precise explanations, connected analysis and a reasoned evaluation. Includes guided practice and classroom criteria.', 'concepts-command-lab/', 'Two-class investigation'),
        ('Who owns your face?', 'Investigate facial recognition, power and privacy. Build an evidence-supported response to a real-world issue.', 'case-file-01/', 'Case study · Paper 1-style practice'),
        ('Social media under 16', 'Compare perspectives on an age restriction and defend a judgment about its consequences.', 'case-file-02/', 'Case study · Argument practice'),
    ]
    library = '<p class="section-intro">Existing practice resources. Open the task your teacher assigns; these are not the newly planned sprint workbooks.</p><div class="cards">'
    for title, description, url, tag in cards:
        assert (ROOT / url / 'index.html').is_file()
        library += f'<article class="card"><span class="tag">{esc(tag)}</span><h3>{esc(title)}</h3><p>{esc(description)}</p><a class="card-link" href="{url}">Open practice <span aria-hidden="true">↗</span><span class="sr-label"> — {esc(title)}</span></a></article>'
    add('practice-library', 'Choose your assigned practice', library + '</div>')
    assessment = '''<p class="section-intro">Both paper styles begin in Sprint 1. Learn the criteria, practise with support, then show what you can do independently on a new task.</p>
<div class="rubric-grid"><article class="card"><span class="tag">Paper 1 · Explain, apply, evaluate</span><h3>Make the reasoning visible.</h3><ul><li>Use precise knowledge and explain the digital mechanism.</li><li>Apply it to the actual scenario and people affected.</li><li>Develop a judgment that weighs evidence, alternatives and conditions when the question asks for evaluation.</li></ul><p>Short questions use task-specific marking. Extended responses use the applicable markband. Naming every concept is not a substitute for answering the question.</p></article>
<article class="card"><span class="tag">Paper 2 · Interpret, connect, synthesize</span><h3>Make the sources work together.</h3><ul><li>Interpret what a source supports and where it is limited.</li><li>Explain agreements or tensions across sources.</li><li>Combine source evidence and relevant knowledge into an argument organized by ideas.</li></ul><p>We start with a small source comparison and build toward sustained synthesis. A guided paragraph is practice, not a full-paper score.</p></article></div>
<div class="notice"><strong>Your feedback loop:</strong> see the criteria → attempt the task → identify one important improvement → try a fresh question. Your teacher records achievement separately from the support you used. Follow each task’s AI and access conditions; independent assessments require your own reasoning.</div>'''
    add('assessment-guide', 'Know what strong work does', assessment)
    route = '<p class="section-intro">A one-year SL pathway. Your teacher releases the detailed assignments as they are ready.</p>'
    for label, title, detail in [('01–07','Build knowledge through cases','Mechanisms, data, networks, AI, media and the physical impacts of digital systems. Paper 1 and Paper 2 practice throughout.'),('08–10','Practise inquiry and test transfer','A practice inquiry followed by Paper 1 and Paper 2 diagnostics, feedback and repair.'),('11–13','Develop your own inquiry project','Protected research, analysis, production and permitted feedback time.'),('14–16','Demonstrate readiness','Fresh full papers, targeted repair and a focused final revision route.')]:
        route += f'<div class="route-row"><span class="tag">{label}</span><div><h3>{title}</h3><p>{detail}</p></div></div>'
    add('course-route', 'The course pathway', route)
    add('ia-workspace', 'Your inquiry project', '<p class="section-intro">Develop a focused inquiry that you own. Keep a research trail and explain your source and communication choices. Follow the current guidance and the checkpoints your teacher sets.</p><div class="notice">The revised IA workspace is being prepared. Your teacher will release its reviewed resources here. Use the class submission channel for current work.</div>')
    for s in data['sprints']:
        if not flags[s['id']]:
            continue
        url = s.get('workbook_url')
        if url:
            assert re.fullmatch(r'[a-zA-Z0-9_./-]+', url) and '..' not in url
            target = ROOT / url
            assert target.is_file() or (target / 'index.html').is_file(), 'Released workbook is missing'
        content = f'<p class="eyebrow">Sprint {s["number"]:02}</p><p class="section-intro">{esc(s["brief"])}</p><div class="card"><h3>What you will learn</h3><p>{esc(s["new_learning"])}</p><h3>What you will work toward</h3><p>{esc(s["product"])}</p>'
        content += f'<a class="card-link" href="{esc(url)}">Open workbook ↗</a>' if url else '<p class="notice">Sprint overview. The new workbook and assessment are still being prepared; your teacher will provide the task when it is ready.</p>'
        add(s['id'], f'Sprint {s["number"]:02} · {s["title"]}', content + '</div>')
    page = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="IB Digital Society SL — a focused course home for inquiry, evidence and independent thinking."><title>Digital Society SL · Learning Studio</title><link rel="stylesheet" href="course-home/home.css"></head><body><a class="skip" href="#start">Skip to course resources</a><header class="topbar"><div class="wrap"><span>Learning Studio</span><span>IBDS · Standard Level</span></div></header><main class="wrap"><section class="hero" aria-labelledby="course-title"><div><p class="eyebrow">Operation Get a 7</p><h1 id="course-title">Digital systems.<br>Human consequences.</h1><p class="intro">Understand how technology works. Test what the evidence supports. Explain what should happen next.</p><a class="button" href="#start">Find your next step ↓</a></div><img class="hero-graphic" src="course-home/inquiry.svg" alt="Trace the system, question the evidence, then defend a judgment." width="430" height="360"></section><nav class="course-nav" aria-label="Released course sections">'''
    page += ''.join(nav) + '''</nav><section class="section" id="start" aria-labelledby="start-title"><p class="eyebrow">One task at a time</p><h2 id="start-title">Start with the task your teacher assigns.</h2><p class="section-intro">This page shows the resources currently released for the class. More sections will appear as the course progresses.</p><div class="start-grid"><article class="card"><span class="number">01</span><h3>Understand the target.</h3><p>Read the task and its criteria. Identify the knowledge and thinking you need to demonstrate.</p></article><article class="card"><span class="number">02</span><h3>Keep the evidence.</h3><p>Save source details, working notes and your decisions. Explain how you reached your answer.</p></article><article class="card"><span class="number">03</span><h3>Improve, then transfer.</h3><p>Act on feedback. Show the improvement on a different question or changed situation.</p></article></div></section>'''
    page += ''.join(sections)
    if not flags['practice-library'] and not any(flags[s['id']] for s in data['sprints']):
        page += '<p class="notice">Your next activity will appear here when your teacher releases it.</p>'
    page += '''<aside class="support" aria-labelledby="coach-title"><div><h2 id="coach-title">Get help with your next step.</h2><p>Try first. In permitted practice, ask the Coach to clarify a term or question your reasoning. Keep the decisions yours. Follow your teacher’s assistance rules during assessments and IA work.</p></div><a class="button" href="https://gemini.google.com/gem/1ySXJPfNy0hCfESu8EzsD3vuexPiuKQKo?usp=sharing">Open the learning Coach ↗</a></aside><nav aria-label="Learning Studio course sites" style="display:flex;flex-wrap:wrap;gap:18px;padding:20px 0"><a href="https://ctwadden.github.io/communication-technology-11/">Communication 11</a><a href="https://ctwadden.github.io/multimedia-12/">Multimedia 12</a><a href="https://ctwadden.github.io/digital-society-sl/">Digital Society</a><a href="https://outcome-evidence-map.netlify.app/teacher.html">Teacher OS</a></nav><footer class="footer"><p>Digital Society SL · Explain. Investigate. Evaluate.</p><a href="#course-title">Back to top ↑</a></footer></main></body></html>'''
    return page

if __name__ == '__main__':
    (ROOT / 'index.html').write_text(build())
    print('Built DS home from course-release.json')
