var e={id:`devops`,h:{en:`DevOps principles: CALMS, infrastructure as code and immutable infrastructure`,hi:`DevOps principles: CALMS, infrastructure as code aur immutable infrastructure`},body:{en:`
<p>In an old-style company, developers build a car and push it over a wall to the operations team, who must drive it, fuel it and fix it without ever having met the builders. When it breaks, each side blames the other. <b>DevOps</b> removes the wall: one shared team (or very close teams) owns the product from idea to running service, with automation doing the repetitive parts. It is a culture first and a toolset second.</p>

<h3>CALMS: five words to remember</h3>
<dl class="terms">
<dt>Culture</dt><dd>Shared responsibility, blameless reviews after incidents, and collaboration between developers, operations and security.</dd>
<dt>Automation</dt><dd>Anything done twice should be scripted: builds, tests, deployments, server creation. Humans handle judgement, machines handle repetition.</dd>
<dt>Lean</dt><dd>Small batches, short queues, remove waste. Ship many small changes instead of one huge risky release.</dd>
<dt>Measurement</dt><dd>Measure deployment frequency, lead time for changes, failure rate and time to recover. You cannot improve what you cannot see.</dd>
<dt>Sharing</dt><dd>Share knowledge, tools, dashboards and runbooks across teams, so a fix found once helps everyone.</dd>
</dl>

<h3>Infrastructure as code (IaC)</h3>
<p><b>Infrastructure as code</b> means servers, networks, firewall rules and device configuration are described in <b>text files</b> kept in Git, and tools apply them. The file is the truth. Benefits: the same file builds the same result every time; every change has an author, a reason and a review (a pull request); you can roll back by reverting a commit; and a whole environment can be recreated in minutes after a disaster.</p>
<p>Two styles are worth knowing. <b>Declarative</b> files say <i>what you want</i> ("there must be VLAN 10 named POS") and the tool works out the steps. <b>Imperative</b> scripts say <i>how</i> ("run these commands in this order"). Terraform and Kubernetes manifests are declarative; a plain Python script is imperative. Good IaC is also <b>idempotent</b>: running it twice gives the same result as running it once, with no duplicates.</p>
<pre class="code"><span class="c"># Declarative: desired state of VLANs in YAML (a data file in Git)</span>
vlans:
  - id: 10
    name: POS
  - id: 20
    name: STAFF</pre>

<h3>Mutable versus immutable infrastructure</h3>
<p>With <b>mutable</b> servers you log in and change them over time: patch here, edit a file there. After a year every server is slightly different, a problem called <b>configuration drift</b>, and nobody can rebuild one from scratch. With <b>immutable infrastructure</b> you never change a running server or container. To update, you build a <b>new</b> image, start new instances from it and <b>throw the old ones away</b>. Every instance of version 1.5 is identical, and rolling back means starting version 1.4 again.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Mutable versus immutable">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Mutable: patch in place</text>
<rect x="60" y="35" width="200" height="40" rx="8" fill="#fed7aa"/><text x="160" y="60" text-anchor="middle" class="svg-ink" font-size="12">Server v1 + hotfix + edit + patch</text>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">drift: each server unique</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Immutable: replace</text>
<rect x="340" y="35" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">v1 (retired)</text>
<rect x="530" y="35" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">v2 (new)</text>
<line x1="430" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/><text x="480" y="48" text-anchor="middle" class="svg-accent" font-size="12">build, swap</text>
<text x="480" y="105" text-anchor="middle" class="svg-muted" font-size="12">identical copies, easy rollback</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Containers make immutable practical: new tag, new container, delete the old one</text>
</svg><p class="cap">Never repair a running instance; replace it.</p></div>

<div class="eg"><p><b>Worked example.</b> The team needs a newer Python library in the monitoring tool. Mutable way: SSH to three servers and run an install. A week later server 2 shows a different version because someone forgot it. Immutable way: edit the requirements file, push, let the pipeline build image <code>nk/monitor:2.1</code> and replace the three containers. All three are identical by construction, and <code>nk/monitor:2.0</code> is still in the registry for rollback.</p></div>

<div class="warn"><p><b>Common mistake:</b> believing DevOps is a job title or a tool you buy. DevOps is the way of working: shared ownership, automation, fast feedback. Tools only support it.</p></div>
<div class="exam"><p><b>Exam trap:</b> declarative describes the <b>desired end state</b>; imperative describes the <b>steps</b>. Immutable means <b>replace, do not modify</b>. CALMS stands for Culture, Automation, Lean, Measurement, Sharing.</p></div>

<div class="scn"><h4>The snowflake server</h4><p>A Bengaluru firm's only copy of its monitoring server had been hand-edited for three years. When its disk failed, nobody could rebuild it; the outage lasted two days. Afterwards the team captured the setup as a Dockerfile and a Compose file in Git. A replacement now takes ten minutes.</p><p><b>Lesson:</b> a server you cannot rebuild from code is a liability. Treat servers as cattle you can replace, not pets you nurse.</p></div>

<div class="iv"><p class="q">"What is infrastructure as code and why is it useful for networks?"</p><p>Describing infrastructure in version-controlled files that tools apply. For networks: VLANs, ACLs and device configs live in Git, are reviewed like code, deployed by a pipeline, and rolled back by reverting. Mention idempotency and declarative versus imperative.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DevOps is culture plus automation; CALMS = Culture, Automation, Lean, Measurement, Sharing.</li>
<li>IaC keeps infrastructure in Git as the single source of truth; aim for declarative and idempotent.</li>
<li>Immutable infrastructure: replace instances with a new build instead of editing them; this prevents drift.</li>
<li>Small, frequent, automated releases are safer than rare big ones.</li>
</ul></div>
`,hi:`
<p>Purani company mein developers gaadi bana kar deewar ke us paar operations team ko dhakel dete hain, jo bina builders se mile use chalati, fuel deti aur theek karti hai. Toote to dono ek doosre ko blame karte hain. <b>DevOps</b> woh deewar hata deta hai: ek shared team (ya bahut nazdeeki teams) product ko idea se running service tak own karti hai, aur repetitive kaam automation karti hai. Yeh pehle culture hai, tools baad mein.</p>

<h3>CALMS: yaad rakhne ke paanch words</h3>
<dl class="terms">
<dt>Culture</dt><dd>Shared responsibility, incident ke baad blameless reviews, aur developers, operations aur security ke beech collaboration.</dd>
<dt>Automation</dt><dd>Jo kaam do baar kiya woh script ho: builds, tests, deployments, server creation. Insaan judgement sambhalte hain, machines repetition.</dd>
<dt>Lean</dt><dd>Chhote batches, chhoti queues, waste hatao. Ek bade risky release ki jagah kai chhote changes ship karo.</dd>
<dt>Measurement</dt><dd>Deployment frequency, change ka lead time, failure rate aur recovery time naapo. Jo dikhta nahi use sudhar nahi sakte.</dd>
<dt>Sharing</dt><dd>Knowledge, tools, dashboards aur runbooks teams ke beech share karo, taaki ek baar mila fix sabke kaam aaye.</dd>
</dl>

<h3>Infrastructure as code (IaC)</h3>
<p><b>Infrastructure as code</b> matlab servers, networks, firewall rules aur device configuration <b>text files</b> mein likhe jaate hain jo Git mein rehti hain, aur tools unhe apply karte hain. File hi sach hai. Fayde: wahi file har baar wahi result banati hai; har change ka author, wajah aur review (pull request) hota hai; commit revert karke rollback kar sakte ho; aur disaster ke baad poora environment minutes mein dobara ban jaata hai.</p>
<p>Do styles jaanne layak hain. <b>Declarative</b> files batati hain <i>kya chahiye</i> ("VLAN 10 jiska naam POS ho") aur tool steps khud nikalta hai. <b>Imperative</b> scripts batati hain <i>kaise</i> ("yeh commands is order mein chalao"). Terraform aur Kubernetes manifests declarative hain; plain Python script imperative hai. Achhi IaC <b>idempotent</b> bhi hoti hai: do baar chalane par wahi result jo ek baar chalane par, bina duplicates ke.</p>
<pre class="code"><span class="c"># Declarative: VLANs ki desired state YAML mein (Git mein data file)</span>
vlans:
  - id: 10
    name: POS
  - id: 20
    name: STAFF</pre>

<h3>Mutable versus immutable infrastructure</h3>
<p><b>Mutable</b> servers mein aap login karke waqt ke saath badalte ho: yahan patch, wahan file edit. Ek saal baad har server thoda alag hota hai, jise <b>configuration drift</b> kehte hain, aur koi use scratch se rebuild nahi kar sakta. <b>Immutable infrastructure</b> mein aap running server ya container ko kabhi nahi badalte. Update ke liye <b>nayi</b> image build karte ho, usse naye instances start karte ho aur <b>purane phenk dete ho</b>. Version 1.5 ke har instance identical hain, aur rollback matlab version 1.4 dobara start karna.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Mutable versus immutable">
<text x="160" y="20" text-anchor="middle" class="svg-ink" font-size="13">Mutable: jagah par patch</text>
<rect x="60" y="35" width="200" height="40" rx="8" fill="#fed7aa"/><text x="160" y="60" text-anchor="middle" class="svg-ink" font-size="12">Server v1 + hotfix + edit + patch</text>
<text x="160" y="105" text-anchor="middle" class="svg-muted" font-size="12">drift: har server alag</text>
<text x="480" y="20" text-anchor="middle" class="svg-ink" font-size="13">Immutable: replace</text>
<rect x="340" y="35" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="385" y="60" text-anchor="middle" class="svg-ink" font-size="12">v1 (retired)</text>
<rect x="530" y="35" width="90" height="40" rx="8" fill="#bbf7d0"/><text x="575" y="60" text-anchor="middle" class="svg-ink" font-size="12">v2 (new)</text>
<line x1="430" y1="55" x2="530" y2="55" stroke="#64748b" stroke-width="2"/><text x="480" y="48" text-anchor="middle" class="svg-accent" font-size="12">build, swap</text>
<text x="480" y="105" text-anchor="middle" class="svg-muted" font-size="12">identical copies, aasaan rollback</text>
<text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Containers immutable ko practical banate hain: naya tag, naya container, purana delete</text>
</svg><p class="cap">Chalte instance ko repair mat karo; replace karo.</p></div>

<div class="eg"><p><b>Worked example.</b> Team ko monitoring tool mein nayi Python library chahiye. Mutable tareeka: teen servers par SSH karke install chalao. Hafte baad server 2 par alag version dikhta hai kyunki kisi ne bhula diya. Immutable tareeka: requirements file edit karo, push karo, pipeline se image <code>nk/monitor:2.1</code> build karao aur teen containers replace karo. Teeno construction se identical, aur <code>nk/monitor:2.0</code> rollback ke liye registry mein maujood.</p></div>

<div class="warn"><p><b>Common mistake:</b> DevOps ko job title ya khareedne wala tool samajhna. DevOps kaam karne ka tareeka hai: shared ownership, automation, tez feedback. Tools sirf madad karte hain.</p></div>
<div class="exam"><p><b>Exam trap:</b> declarative <b>desired end state</b> batata hai; imperative <b>steps</b>. Immutable matlab <b>replace karo, modify nahi</b>. CALMS = Culture, Automation, Lean, Measurement, Sharing.</p></div>

<div class="scn"><h4>Snowflake server</h4><p>Bengaluru ki ek firm ka monitoring server ka akela copy teen saal se haath se edit ho raha tha. Disk fail hui to koi use rebuild nahi kar paya; outage do din chala. Uske baad team ne setup Dockerfile aur Compose file ke roop mein Git mein rakh diya. Ab replacement das minute mein ban jaata hai.</p><p><b>Lesson:</b> jo server code se rebuild nahi ho sakta woh liability hai. Servers ko cattle samjho jise replace kar sako, pet nahi jise sambhalo.</p></div>

<div class="iv"><p class="q">"Infrastructure as code kya hai aur networks ke liye kyun useful hai?"</p><p>Infrastructure ko version-controlled files mein describe karna jise tools apply karte hain. Networks ke liye: VLANs, ACLs aur device configs Git mein, code ki tarah review, pipeline se deploy, revert karke rollback. Idempotency aur declarative versus imperative ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>DevOps = culture plus automation; CALMS = Culture, Automation, Lean, Measurement, Sharing.</li>
<li>IaC infrastructure ko Git mein single source of truth rakhta hai; declarative aur idempotent ka target rakho.</li>
<li>Immutable infrastructure: instances ko edit nahi, nayi build se replace karo; drift rukta hai.</li>
<li>Chhote, frequent, automated releases badi rare releases se safe hain.</li>
</ul></div>
`}};export{e as default};