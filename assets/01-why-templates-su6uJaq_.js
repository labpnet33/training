var e={id:`why-templates`,h:{en:`Welcome: why templates, and your first render`,hi:`Swagat: templates kyun, aur aapka pehla render`},body:{en:`
<p><b>What you will learn in this module.</b> You will write a device configuration <i>once</i> as a Jinja2 template, keep the per-device values in a CSV or JSON file, and let a short Python script produce a clean config for every switch and router. Then you will review the results, push them over SSH, and fix the four errors every template pipeline meets. No coding background is assumed beyond the first Python modules.</p>
<p><b>Prerequisites.</b> Python basics from the earlier modules: variables, strings, lists, dictionaries, <code>for</code> loops, functions and reading files (Python 1 to 3). Reading CSV and JSON data from the data-formats module helps. The <code>ipaddress</code> module appears in chapter 5.</p>

<h3>Analogy: the mail merge</h3>
<p>You have written a letter that starts "Dear NAME, your branch is CITY". You do not retype it 40 times. A mail merge program takes your letter (the template) and a table of names and cities (the data) and prints 40 finished letters. Nobody mistypes a name, because nobody types it twice. A config template is a mail merge for routers and switches.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Template plus data gives configs">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#fde68a"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">access.j2</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">template: text + blanks</text>
<rect x="20" y="110" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="13">switches.csv</text><text x="105" y="156" text-anchor="middle" class="svg-muted" font-size="12">data: one row per device</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="140" x2="260" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="335" y="90" text-anchor="middle" class="svg-ink" font-size="13">render.py</text><text x="335" y="110" text-anchor="middle" class="svg-muted" font-size="12">Python + Jinja2</text>
<line x1="410" y1="95" x2="470" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="470" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="30" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW1.cfg</text>
<rect x="470" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW2.cfg</text>
<rect x="470" y="120" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW3.cfg</text>
</svg><p class="cap">One template and one table become one config per device.</p></div>

<h3>The problem it solves</h3>
<p>Forty access switches share about 95 percent of their configuration. Only a few values change: the hostname, the management address, which ports are user ports. When engineers copy a config, edit it in Notepad and paste it, typos appear: a wrong VLAN, a missed <code>no shutdown</code>. A template separates the three things that were tangled together:</p>
<ul>
<li><b>Template</b>: the config text with blanks (<code>access.j2</code>). The <code>.j2</code> ending is a convention for Jinja2 files.</li>
<li><b>Data</b>: the values that differ per device (<code>switches.csv</code>, <code>sites.json</code>).</li>
<li><b>Script</b>: Python code (<code>render.py</code>) that fills the blanks and writes one <code>.cfg</code> per device.</li>
</ul>
<p>Change the standard once, for example add BPDU guard to every user port, and every rendered config follows. That is the real power: consistency at scale.</p>

<h3>Your first render</h3>
<p>Jinja2 is a Python library. The lab host already has it, as the package list shows:</p>
<pre class="out">AUTO01$ pip list
Package    Version
---------- ---------
nkmiko     4.3.0-nk
jinja2     3.1.4
(standard library: json, re, csv, ipaddress, datetime, argparse, logging, time, math, os, sys, pprint, random)</pre>
<p>Here is the smallest possible template program, <code>t1.py</code>:</p>
<pre class="code">from jinja2 import Template

template = Template("hostname {{ name }}")
print(template.render(name="PUN-ACC-SW1"))</pre>
<pre class="out">AUTO01$ python3 t1.py
<span class="hl">hostname PUN-ACC-SW1</span></pre>
<ul>
<li><code>from jinja2 import Template</code> brings the <code>Template</code> tool into your script.</li>
<li><code>Template("hostname {{ name }}")</code> builds a template from text. The double curly braces mark a blank named <code>name</code>.</li>
<li><code>.render(name="PUN-ACC-SW1")</code> fills the blank and returns the finished text. <code>print</code> shows it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Change <code>name="PUN-ACC-SW1"</code> to <code>name="PUN-ACC-SW2"</code> and run again: you get <code>hostname PUN-ACC-SW2</code>. The template did not change, only the data did. Everything in this module is a larger version of that single idea.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Putting data inside the template instead of passing it in. Writing a single curly brace instead of two, so the blank is printed as text. Forgetting that <code>render()</code> returns text but does not print or save it; you must do that yourself.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jinja2 only <i>generates text</i>. It does not connect to devices or validate that the text is good IOS or Junos. A perfect render can still contain a wrong value if the data is wrong.</p></div>

<div class="scn"><h4>Forty switches, one wrong VLAN</h4><p>A Pune rollout used copy, edit and paste for 40 access switches. On switch 27 the voice VLAN was typed as 200 instead of 20. IP phones on that floor got no voice VLAN for two days. After the team moved the standard into a template and the values into a CSV, the same mistake could only happen once, in one visible place, and a diff against the old config would have shown it.</p><p><b>Lesson:</b> a template turns many chances for a typo into one place to review.</p></div>

<div class="iv"><p class="q">"Why use a template engine like Jinja2 instead of copy and paste?"</p><p>A template separates the shared config text from the per-device data. You fix or improve the standard in one place, every device follows, and the output is repeatable and reviewable in version control. It removes copy-paste typos and makes changes auditable. Mention that Jinja2 is also the template language of Ansible, so the skill carries over.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is config text with blanks; data fills the blanks; Python does the filling.</li>
<li>Jinja2 blanks use double curly braces: <code>{{ name }}</code>.</li>
<li><code>Template(text).render(name=value)</code> returns the finished text.</li>
<li>Change the standard once in the template and all devices follow.</li>
<li>Rendering only makes text; pushing it to a device is a separate, careful step.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap device configuration <i>ek baar</i> Jinja2 template ki tarah likhoge, har device ki values CSV ya JSON file mein rakhoge, aur chhoti Python script se har switch aur router ki saaf config banaoge. Phir results review karoge, SSH se push karoge, aur woh chaar errors theek karoge jo har template pipeline mein aate hain. Pehle Python modules ke baad coding ka aur background nahi chahiye.</p>
<p><b>Prerequisites.</b> Pehle ke modules ka Python basics: variables, strings, lists, dictionaries, <code>for</code> loops, functions aur files padhna (Python 1 se 3). Data-formats module se CSV aur JSON padhna madad karta hai. <code>ipaddress</code> module chapter 5 mein aata hai.</p>

<h3>Analogy: mail merge</h3>
<p>Aapne ek letter likha hai jo "Dear NAME, your branch is CITY" se shuru hota hai. Aap use 40 baar dobara type nahi karte. Mail merge program aapka letter (template) aur naam aur shehar ki table (data) leta hai aur 40 poore letters print karta hai. Koi naam galat type nahi karta, kyunki koi use do baar type nahi karta. Config template routers aur switches ka mail merge hai.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Template aur data se configs">
<rect x="20" y="20" width="170" height="60" rx="10" fill="#fde68a"/><text x="105" y="46" text-anchor="middle" class="svg-ink" font-size="13">access.j2</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">template: text + blanks</text>
<rect x="20" y="110" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="136" text-anchor="middle" class="svg-ink" font-size="13">switches.csv</text><text x="105" y="156" text-anchor="middle" class="svg-muted" font-size="12">data: har device ki row</text>
<line x1="190" y1="50" x2="260" y2="90" stroke="#64748b" stroke-width="2"/><line x1="190" y1="140" x2="260" y2="100" stroke="#64748b" stroke-width="2"/>
<rect x="260" y="60" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="335" y="90" text-anchor="middle" class="svg-ink" font-size="13">render.py</text><text x="335" y="110" text-anchor="middle" class="svg-muted" font-size="12">Python + Jinja2</text>
<line x1="410" y1="95" x2="470" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="470" y2="95" stroke="#64748b" stroke-width="2"/><line x1="410" y1="95" x2="470" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="30" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="55" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW1.cfg</text>
<rect x="470" y="75" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="100" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW2.cfg</text>
<rect x="470" y="120" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="545" y="145" text-anchor="middle" class="svg-ink" font-size="12">PUN-ACC-SW3.cfg</text>
</svg><p class="cap">Ek template aur ek table se har device ki ek config banti hai.</p></div>

<h3>Yeh kaunsi problem solve karta hai</h3>
<p>Chalis access switches ki lagbhag 95 percent configuration same hoti hai. Sirf kuch values badalti hain: hostname, management address, kaunse ports user ports hain. Jab engineers config copy karke Notepad mein edit karke paste karte hain, typos aate hain: galat VLAN, chhoota hua <code>no shutdown</code>. Template un teen cheezon ko alag karta hai jo uljhi hui thi:</p>
<ul>
<li><b>Template</b>: blanks wala config text (<code>access.j2</code>). <code>.j2</code> ending Jinja2 files ke liye convention hai.</li>
<li><b>Data</b>: har device par badalne wali values (<code>switches.csv</code>, <code>sites.json</code>).</li>
<li><b>Script</b>: Python code (<code>render.py</code>) jo blanks bharta hai aur har device ki ek <code>.cfg</code> likhta hai.</li>
</ul>
<p>Standard ek baar badlo, jaise har user port par BPDU guard jodo, aur har rendered config uske saath badal jaati hai. Yahi asli taakat hai: scale par consistency.</p>

<h3>Aapka pehla render</h3>
<p>Jinja2 ek Python library hai. Lab host par yeh pehle se hai, jaisa package list dikhati hai:</p>
<pre class="out">AUTO01$ pip list
Package    Version
---------- ---------
nkmiko     4.3.0-nk
jinja2     3.1.4
(standard library: json, re, csv, ipaddress, datetime, argparse, logging, time, math, os, sys, pprint, random)</pre>
<p>Yeh sabse chhota template program hai, <code>t1.py</code>:</p>
<pre class="code">from jinja2 import Template

template = Template("hostname {{ name }}")
print(template.render(name="PUN-ACC-SW1"))</pre>
<pre class="out">AUTO01$ python3 t1.py
<span class="hl">hostname PUN-ACC-SW1</span></pre>
<ul>
<li><code>from jinja2 import Template</code> <code>Template</code> tool ko aapki script mein laata hai.</li>
<li><code>Template("hostname {{ name }}")</code> text se template banata hai. Double curly braces <code>name</code> naam ke blank ko mark karte hain.</li>
<li><code>.render(name="PUN-ACC-SW1")</code> blank bharta hai aur poora text return karta hai. <code>print</code> use dikhata hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> <code>name="PUN-ACC-SW1"</code> ko <code>name="PUN-ACC-SW2"</code> karo aur dobara chalao: aapko <code>hostname PUN-ACC-SW2</code> milta hai. Template nahi badla, sirf data badla. Is module ki har cheez isi ek idea ka bada roop hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Data ko template ke andar likhna, bahar se pass karne ki jagah. Do curly braces ki jagah ek likhna, jisse blank text ki tarah print hota hai. Bhoolna ki <code>render()</code> text return karta hai par print ya save nahi karta; woh aapko khud karna hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jinja2 sirf <i>text generate</i> karta hai. Woh devices se connect nahi karta aur yeh validate nahi karta ki text achha IOS ya Junos hai. Data galat ho to perfect render mein bhi galat value ho sakti hai.</p></div>

<div class="scn"><h4>Chalis switches, ek galat VLAN</h4><p>Pune ke rollout mein 40 access switches ke liye copy, edit aur paste use hua. Switch 27 par voice VLAN 20 ki jagah 200 type ho gaya. Us floor ke IP phones ko do din voice VLAN nahi mila. Team ne standard template mein aur values CSV mein rakhi, uske baad wahi galti sirf ek baar, ek dikhne wali jagah par ho sakti thi, aur purani config se diff use dikha deta.</p><p><b>Lesson:</b> template kai typo ke mauqon ko review karne ki ek jagah bana deta hai.</p></div>

<div class="iv"><p class="q">"Copy paste ki jagah Jinja2 jaisa template engine kyun use karte hain?"</p><p>Template shared config text ko per-device data se alag karta hai. Standard ek jagah theek ya behtar karte ho, har device follow karta hai, aur output repeatable hai aur version control mein review ho sakta hai. Yeh copy-paste typos hatata hai aur changes ko auditable banata hai. Jodo ki Jinja2 Ansible ki bhi template language hai, isliye yeh skill aage kaam aati hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template blanks wala config text hai; data blanks bharta hai; Python bharne ka kaam karta hai.</li>
<li>Jinja2 blanks double curly braces use karte hain: <code>{{ name }}</code>.</li>
<li><code>Template(text).render(name=value)</code> poora text return karta hai.</li>
<li>Standard template mein ek baar badlo aur sab devices follow karte hain.</li>
<li>Render sirf text banata hai; device par push alag, savdhani wala step hai.</li>
</ul></div>
`}};export{e as default};