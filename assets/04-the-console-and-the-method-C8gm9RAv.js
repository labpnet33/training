var e={id:`console-and-method`,h:{en:`The console and the method: reading the Overview and finding the unhealthy target`,hi:`Console aur method: Overview padhna aur unhealthy target dhoondhna`},body:{en:`
<h3>An analogy: the cockpit and the checklist</h3>
<p>A pilot does not stare at every dial equally. The cockpit groups the most important instruments in front of the pilot, and a checklist says what to do when one turns amber. A monitoring console is the cockpit; the troubleshooting method is the checklist. In this chapter you learn both: where to look first in the console, and the five steps that turn a red tile into a fixed network.</p>

<h3>The console in one picture</h3>
<p>The observability console for Godavari Foods is a web page served by the device called OBSERVER (10.1.50.100). The left side is a menu of pages. The pages you will meet across the track are:</p>
<ul>
<li><b>Overview:</b> the front page. Summary tiles for how many targets are healthy, how many alerts are firing and the latest values.</li>
<li><b>Targets:</b> every device being watched and the credentials the console uses to poll it.</li>
<li><b>Dashboards, Baselines, Alert rules, On-call routing, SLA probes:</b> the later modules.</li>
<li><b>Logs, Flows, Telemetry:</b> the syslog collector, the top talkers view, the streaming subscriptions.</li>
<li><b>Live tools:</b> ping, traceroute and packet capture on demand.</li>
<li><b>Alerts and audit:</b> what fired, and a record of who changed what.</li>
</ul>
<p>The console's tagline is <b>"Click-ops, but you understand what each click does."</b> Clicking in a GUI is fast and friendly, and that is exactly the danger: a click can change what the whole company sees. So in every GUI task you will be asked, "what does this change on the wire or in policy?" Develop that habit now.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Console layout">
<rect x="20" y="15" width="600" height="210" rx="10" fill="#e2e8f0"/>
<rect x="30" y="25" width="120" height="190" rx="8" fill="#0b1b2b"/>
<text x="90" y="50" text-anchor="middle" fill="#ffffff" font-size="12">Overview</text><text x="90" y="75" text-anchor="middle" fill="#cbd5e1" font-size="12">Targets</text><text x="90" y="100" text-anchor="middle" fill="#cbd5e1" font-size="12">Dashboards</text><text x="90" y="125" text-anchor="middle" fill="#cbd5e1" font-size="12">Logs / Flows</text><text x="90" y="150" text-anchor="middle" fill="#cbd5e1" font-size="12">Alert rules</text><text x="90" y="175" text-anchor="middle" fill="#cbd5e1" font-size="12">Live tools</text>
<rect x="165" y="30" width="105" height="55" rx="8" fill="#bbf7d0"/><text x="217" y="52" text-anchor="middle" class="svg-ink" font-size="12">Targets up</text><text x="217" y="72" text-anchor="middle" class="svg-ink" font-size="14">6 of 7</text>
<rect x="282" y="30" width="105" height="55" rx="8" fill="#fed7aa"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="12">Alerts firing</text><text x="335" y="72" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="399" y="30" width="105" height="55" rx="8" fill="#bae6fd"/><text x="451" y="52" text-anchor="middle" class="svg-ink" font-size="12">Sites</text><text x="451" y="72" text-anchor="middle" class="svg-ink" font-size="14">3</text>
<rect x="165" y="100" width="450" height="105" rx="8" fill="#ffffff"/>
<text x="180" y="122" class="svg-ink" font-size="12">Target list: R-HYD ok, SW-HYD ok, SRV-HYD ok, R-KCH warn ...</text>
<rect x="180" y="135" width="420" height="14" rx="4" fill="#bbf7d0"/><rect x="180" y="157" width="420" height="14" rx="4" fill="#bbf7d0"/><rect x="180" y="179" width="420" height="14" rx="4" fill="#fed7aa"/>
</svg><p class="cap">A typical layout: menu on the left, summary tiles on top, the target list below. Numbers here are only an illustration.</p></div>

<h3>Lab walkthrough: find the one unhealthy target</h3>
<p>The GUI lab obs-start-2 gives you a console where seven targets are watched but one has a problem. Your task is to read the Overview, spot which target is not healthy and say why, without guessing. The steps:</p>
<ol>
<li>Open the <b>Overview</b>. Look at the summary tiles first: how many targets up, how many alerts firing.</li>
<li>Scan the target list for any state that is not green. A state may be warning, critical or no data.</li>
<li>Open the unhealthy target (Targets page or the dashboard panel) and read its details: latest values, polling state and the reason text.</li>
<li>Answer the <b>"why"</b> question the lab asks, for example whether the target is really overloaded or the console simply cannot reach it.</li>
</ol>
<p>The difference between those two cases matters. A <b>critical</b> value means the console reached the device and the number is bad. <b>No data</b> means the console could not read the device at all: the cause could be a wrong credential, a firewall dropping UDP 161, or a dead device. Different states, different next steps.</p>

<h3>The method: symptom, evidence, root cause, fix, verify</h3>
<p>Whether you use the CLI or the GUI, work in the same five steps.</p>
<ol>
<li><b>Symptom.</b> State what is wrong in one sentence: "Kochi shows no data since 11:15."</li>
<li><b>Evidence.</b> Collect facts from the signals, not opinions: is the target answering a ping, what does the poll say, what do logs and flows show for that time?</li>
<li><b>Root cause.</b> Find the single change or failure that explains all the evidence. Ask "why" until you reach something you can fix.</li>
<li><b>Fix.</b> Make the smallest change that removes the cause. In the console, edits are saved to a candidate and go live only when you press Apply.</li>
<li><b>Verify.</b> Prove it is fixed with the same evidence that showed the fault. A green tile you did not re-read is not verification.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Symptom: the Kochi router tile says no data. Evidence: ping to R-KCH works; the poll reason says the community was rejected; the community in the Targets page reads GF-R0. Root cause: a typo in the console credential, GF-R0 instead of GF-RO (zero versus letter O). Fix: edit the community to GF-RO and Apply. Verify: the tile turns green and shows a CPU value. Five steps, one cause, one change.</p></div>

<h3>Apply, candidate and audit</h3>
<p>Console changes work like a router's candidate configuration. When you edit a field, it is saved to a <b>candidate</b> copy. The bar at the bottom shows how many changes are waiting. Nothing changes in what the system watches until you press <b>Apply changes</b>. Each Apply is written to the audit log with who did it and what changed, which is your proof during a post-incident review.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Editing a field and forgetting to press Apply, then wondering why the tile is still red. (2) Reading "no data" as "device overloaded". (3) Changing three things at once, so you cannot tell which one fixed it. (4) Skipping verify and closing the ticket on a hunch.</p></div>
<div class="exam"><p><b>Exam trap.</b> A device that answers ping but gives no SNMP data is not "down". Ping uses ICMP; SNMP uses UDP 161 with credentials. Be ready to explain three causes for "ping works, polling fails": wrong credential, an ACL or firewall blocking UDP 161, and the SNMP agent disabled.</p></div>

<div class="scn"><h4>The red tile that was not red</h4><p>Meena Iyer saw the Lucknow server tile turn grey on a Friday evening and escalated it as an outage. Kabir Shah checked the evidence: ping to the server worked, users were fine, and the poll reason said the request timed out. The server's management firewall had been updated that afternoon and was now dropping UDP 161 from the console. The fix was a firewall rule, not a server repair. The tile turned green in two minutes.</p><p><b>Lesson:</b> read the reason before you raise the alarm; grey means "cannot read", not "broken".</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot a monitoring alert."</p><p>Strong answer: use five steps. State the symptom precisely, gather evidence from metrics, logs and flows for the same time window, find one root cause that explains all of it, apply the smallest fix, and verify with the same evidence. Add that you record the change in the audit log and avoid changing several things at once.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The console's Overview shows summary tiles and the target list; read it before opening anything else.</li>
<li>Critical means reached and bad; no data means not reachable by the poller, a different problem.</li>
<li>The method is symptom, evidence, root cause, fix, verify.</li>
<li>Edits go to a candidate and take effect only on Apply; the audit log records them.</li>
<li>The GUI tagline is "Click-ops, but you understand what each click does", so always ask what a click changes.</li>
</ul></div>
`,hi:`
<h3>Ek analogy: cockpit aur checklist</h3>
<p>Pilot har dial ko barabar nahi ghoorta. Cockpit sabse zaroori instruments ko pilot ke saamne rakhta hai, aur checklist batati hai ki koi amber ho jaye to kya karna hai. Monitoring console cockpit hai; troubleshooting method checklist hai. Is chapter mein aap dono seekhoge: console mein sabse pehle kahan dekhna hai, aur woh paanch steps jo red tile ko fixed network mein badalte hain.</p>

<h3>Console ek tasveer mein</h3>
<p>Godavari Foods ka observability console ek web page hai jo OBSERVER device (10.1.50.100) serve karta hai. Left side pages ka menu hai. Track mein jo pages milenge:</p>
<ul>
<li><b>Overview:</b> front page. Kitne targets healthy hain, kitne alerts fire ho rahe hain aur latest values ke summary tiles.</li>
<li><b>Targets:</b> har device jo watch ho raha hai aur woh credentials jo console us device ko poll karne ke liye use karta hai.</li>
<li><b>Dashboards, Baselines, Alert rules, On-call routing, SLA probes:</b> aage ke modules.</li>
<li><b>Logs, Flows, Telemetry:</b> syslog collector, top talkers view, streaming subscriptions.</li>
<li><b>Live tools:</b> ping, traceroute aur packet capture on demand.</li>
<li><b>Alerts and audit:</b> kya fire hua, aur kisne kya badla ka record.</li>
</ul>
<p>Console ki tagline hai <b>"Click-ops, but you understand what each click does."</b> GUI mein click karna fast aur friendly hai, aur yahi khatra hai: ek click poori company ko dikhne wali cheez badal sakta hai. Isliye har GUI task mein aapse poochha jaayega, "yeh wire ya policy mein kya badalta hai?" Yeh aadat abhi se banao.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Console layout">
<rect x="20" y="15" width="600" height="210" rx="10" fill="#e2e8f0"/>
<rect x="30" y="25" width="120" height="190" rx="8" fill="#0b1b2b"/>
<text x="90" y="50" text-anchor="middle" fill="#ffffff" font-size="12">Overview</text><text x="90" y="75" text-anchor="middle" fill="#cbd5e1" font-size="12">Targets</text><text x="90" y="100" text-anchor="middle" fill="#cbd5e1" font-size="12">Dashboards</text><text x="90" y="125" text-anchor="middle" fill="#cbd5e1" font-size="12">Logs / Flows</text><text x="90" y="150" text-anchor="middle" fill="#cbd5e1" font-size="12">Alert rules</text><text x="90" y="175" text-anchor="middle" fill="#cbd5e1" font-size="12">Live tools</text>
<rect x="165" y="30" width="105" height="55" rx="8" fill="#bbf7d0"/><text x="217" y="52" text-anchor="middle" class="svg-ink" font-size="12">Targets up</text><text x="217" y="72" text-anchor="middle" class="svg-ink" font-size="14">6 of 7</text>
<rect x="282" y="30" width="105" height="55" rx="8" fill="#fed7aa"/><text x="335" y="52" text-anchor="middle" class="svg-ink" font-size="12">Alerts firing</text><text x="335" y="72" text-anchor="middle" class="svg-ink" font-size="14">1</text>
<rect x="399" y="30" width="105" height="55" rx="8" fill="#bae6fd"/><text x="451" y="52" text-anchor="middle" class="svg-ink" font-size="12">Sites</text><text x="451" y="72" text-anchor="middle" class="svg-ink" font-size="14">3</text>
<rect x="165" y="100" width="450" height="105" rx="8" fill="#ffffff"/>
<text x="180" y="122" class="svg-ink" font-size="12">Target list: R-HYD ok, SW-HYD ok, SRV-HYD ok, R-KCH warn ...</text>
<rect x="180" y="135" width="420" height="14" rx="4" fill="#bbf7d0"/><rect x="180" y="157" width="420" height="14" rx="4" fill="#bbf7d0"/><rect x="180" y="179" width="420" height="14" rx="4" fill="#fed7aa"/>
</svg><p class="cap">Typical layout: left mein menu, upar summary tiles, neeche target list. Yahan ke numbers sirf illustration hain.</p></div>

<h3>Lab walkthrough: ek unhealthy target dhoondho</h3>
<p>GUI lab obs-start-2 ek console deta hai jisme saat targets watch ho rahe hain lekin ek mein problem hai. Aapka task hai Overview padhna, dekhna ki kaunsa target healthy nahi hai aur andaza lagaye bina batana ki kyun. Steps:</p>
<ol>
<li><b>Overview</b> kholo. Pehle summary tiles dekho: kitne targets up, kitne alerts firing.</li>
<li>Target list mein koi bhi state scan karo jo green nahi hai. State warning, critical ya no data ho sakti hai.</li>
<li>Unhealthy target kholo (Targets page ya dashboard panel) aur uski details padho: latest values, polling state aur reason text.</li>
<li>Lab jo <b>"why"</b> sawaal poochta hai uska jawab do, jaise target sach mein overloaded hai ya console use reach hi nahi kar pa raha.</li>
</ol>
<p>In dono cases ka fark matter karta hai. <b>Critical</b> value ka matlab hai console device tak pahuncha aur number kharab hai. <b>No data</b> ka matlab hai console device ko padh hi nahi saka: wajah galat credential, UDP 161 drop karne wala firewall, ya dead device ho sakti hai. Alag state, alag agla step.</p>

<h3>Method: symptom, evidence, root cause, fix, verify</h3>
<p>CLI ho ya GUI, same paanch steps mein kaam karo.</p>
<ol>
<li><b>Symptom.</b> Ek vakya mein batao kya galat hai: "Kochi 11:15 se no data dikha raha hai."</li>
<li><b>Evidence.</b> Signals se facts jama karo, opinions nahi: kya target ping ka jawab de raha hai, poll kya kehta hai, us time ke logs aur flows kya dikhate hain?</li>
<li><b>Root cause.</b> Ek aisa change ya failure dhoondho jo saare evidence ko explain kare. "Kyun" tab tak poocho jab tak aisi cheez na mile jo aap fix kar sako.</li>
<li><b>Fix.</b> Sabse chhota change karo jo cause hatata hai. Console mein edits candidate mein save hote hain aur Apply dabane par hi live hote hain.</li>
<li><b>Verify.</b> Wahi evidence se prove karo ki fix ho gaya jisne fault dikhaya tha. Jis green tile ko aapne dobara padha nahi woh verification nahi hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Symptom: Kochi router ka tile no data kehta hai. Evidence: R-KCH ko ping chalta hai; poll reason kehta hai community reject hui; Targets page par community GF-R0 padhi ja rahi hai. Root cause: console credential mein typo, GF-RO ki jagah GF-R0 (zero versus letter O). Fix: community ko GF-RO edit karo aur Apply karo. Verify: tile green ho jaata hai aur CPU value dikhata hai. Paanch steps, ek cause, ek change.</p></div>

<h3>Apply, candidate aur audit</h3>
<p>Console changes router ke candidate configuration ki tarah kaam karte hain. Jab aap koi field edit karte ho, woh <b>candidate</b> copy mein save hota hai. Neeche ka bar dikhata hai kitne changes wait kar rahe hain. Jab tak aap <b>Apply changes</b> nahi dabate, system jo watch karta hai usme kuch nahi badalta. Har Apply audit log mein likha jaata hai ki kisne kiya aur kya badla, jo post-incident review mein aapka proof hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Field edit karke Apply dabana bhool jaana, phir sochna ki tile abhi bhi red kyun hai. (2) "No data" ko "device overloaded" padhna. (3) Teen cheezein ek saath badalna, jisse pata nahi chalta kaunsi ne fix kiya. (4) Verify skip karke andaze par ticket close karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jo device ping ka jawab deta hai lekin SNMP data nahi deta woh "down" nahi hai. Ping ICMP use karta hai; SNMP credentials ke saath UDP 161 use karta hai. "Ping works, polling fails" ke teen causes explain karne ke liye tayyar raho: galat credential, UDP 161 block karne wala ACL ya firewall, aur SNMP agent disabled.</p></div>

<div class="scn"><h4>Woh red tile jo red tha hi nahi</h4><p>Meena Iyer ne Friday shaam Lucknow server ka tile grey hote dekha aur use outage bana kar escalate kar diya. Kabir Shah ne evidence check kiya: server ko ping chal raha tha, users theek the, aur poll reason kehta tha request time out hui. Server ke management firewall ko usi dopahar update kiya gaya tha aur ab woh console se UDP 161 drop kar raha tha. Fix ek firewall rule tha, server repair nahi. Tile do minute mein green ho gaya.</p><p><b>Seekh:</b> alarm uthane se pehle reason padho; grey ka matlab "padh nahi sakte" hai, "kharab hai" nahi.</p></div>

<div class="iv"><p class="q">"Monitoring alert ko aap kaise troubleshoot karte ho?"</p><p>Strong answer: paanch steps use karo. Symptom precisely batao, usi time window ke metrics, logs aur flows se evidence jama karo, ek root cause dhoondho jo sab explain kare, sabse chhota fix lagao, aur usi evidence se verify karo. Jodo ki aap change audit log mein record karte ho aur kai cheezein ek saath nahi badalte.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console ka Overview summary tiles aur target list dikhata hai; kuch aur kholne se pehle use padho.</li>
<li>Critical ka matlab reached aur bad; no data ka matlab poller ke liye not reachable, alag problem.</li>
<li>Method hai symptom, evidence, root cause, fix, verify.</li>
<li>Edits candidate mein jaate hain aur Apply par hi effect karte hain; audit log unhe record karta hai.</li>
<li>GUI tagline hai "Click-ops, but you understand what each click does", isliye hamesha poocho click kya badalta hai.</li>
</ul></div>
`}};export{e as default};